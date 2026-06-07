#!/usr/bin/env node

// tools/check-audit-refactor-equivalence.mts
// Read-only control check for the audit refactor introduced in PR #406.
// Compares shared helper behaviour against the previous inline audit primitives
// on the current repository data. This script does not modify data or reports.

import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  PLACE_REF_KEYS,
  buildActivePlaceIdSet,
  collectRefsByKeys,
  manifestFilesToPaths,
  readJson,
  toArray,
} from './lib/placeRefAuditUtils.mjs';

type JsonObject = Record<string, unknown>;

type RefRow = {
  key: string;
  value: string;
};

type CompareResult = {
  name: string;
  ok: boolean;
  oldCount: number;
  newCount: number;
  onlyOld: string[];
  onlyNew: string[];
};

type PlaceArrayCheck = {
  file: string;
  ok: boolean;
  oldCount: number;
  newCount: number;
};

type PeopleRefCheck = {
  file: string;
  peopleCountOk: boolean;
  oldPeopleCount: number;
  newPeopleCount: number;
  refs: CompareResult;
};

type GenericRefCheck = {
  file: string;
  refs: CompareResult;
};

type ManifestJson = {
  files?: string[];
};

type PlaceRow = {
  id?: unknown;
};

const root = process.cwd();
const placesManifestPath = path.join(root, 'data/places/manifest.json');
const peopleManifestPath = path.join(root, 'data/people/manifest.json');

function oldToArrayForPlaceAudit(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const objectData = data as JsonObject;
  if (data && Array.isArray(objectData.places)) return objectData.places;
  if (data && Array.isArray(objectData.items)) return objectData.items;
  return [];
}

function oldToArrayForPeopleAudit(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const objectData = data as JsonObject;
  if (data && Array.isArray(objectData.items)) return objectData.items;
  if (data && Array.isArray(objectData.people)) return objectData.people;
  if (data && Array.isArray(objectData.places)) return objectData.places;
  return [];
}

function oldCollectRefsByKeys(node: unknown, keys: readonly string[], currentPath = '', refs: RefRow[] = []): RefRow[] {
  if (Array.isArray(node)) {
    node.forEach((v, i) => oldCollectRefsByKeys(v, keys, `${currentPath}[${i}]`, refs));
    return refs;
  }
  if (!node || typeof node !== 'object') return refs;

  for (const [k, v] of Object.entries(node)) {
    const nextPath = currentPath ? `${currentPath}.${k}` : k;
    if (keys.includes(k)) {
      if (typeof v === 'string') refs.push({ key: nextPath, value: v });
      if (Array.isArray(v)) {
        for (const item of v) {
          if (typeof item === 'string') refs.push({ key: nextPath, value: item });
        }
      }
    }
    oldCollectRefsByKeys(v, keys, nextPath, refs);
  }
  return refs;
}

function oldPeopleFindPlaceRefs(node: unknown, currentPath = ''): RefRow[] {
  const refs: RefRow[] = [];
  if (!node || typeof node !== 'object') return refs;

  if (Array.isArray(node)) {
    node.forEach((item, idx) => {
      refs.push(...oldPeopleFindPlaceRefs(item, `${currentPath}[${idx}]`));
    });
    return refs;
  }

  for (const [key, value] of Object.entries(node)) {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;
    if (PLACE_REF_KEYS.includes(key)) {
      if (typeof value === 'string' && value.trim()) refs.push({ key: nextPath, value: value.trim() });
      if (Array.isArray(value)) {
        value.forEach((entry, idx) => {
          if (typeof entry === 'string' && entry.trim()) refs.push({ key: `${nextPath}[${idx}]`, value: entry.trim() });
        });
      }
    }
    if (value && typeof value === 'object') refs.push(...oldPeopleFindPlaceRefs(value, nextPath));
  }
  return refs;
}

function normalizeRef(ref: RefRow): string {
  return `${ref.key} -> ${ref.value}`;
}

function rel(filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function compareSets(name: string, oldValues: string[], newValues: string[]): CompareResult {
  const oldSet = new Set(oldValues);
  const newSet = new Set(newValues);
  const onlyOld = [...oldSet].filter((value) => !newSet.has(value)).sort();
  const onlyNew = [...newSet].filter((value) => !oldSet.has(value)).sort();
  const ok = onlyOld.length === 0 && onlyNew.length === 0;
  return { name, ok, oldCount: oldSet.size, newCount: newSet.size, onlyOld, onlyNew };
}

function normalizePathFormat(key: string): string {
  return key.replace(/\[\d+\]/g, '');
}

function parseRefString(refString: string): RefRow {
  const separator = ' -> ';
  const splitIndex = refString.indexOf(separator);
  if (splitIndex === -1) return { key: refString, value: '' };
  return {
    key: refString.slice(0, splitIndex),
    value: refString.slice(splitIndex + separator.length),
  };
}

function summarizeRefsByPathAndValue(refStrings: string[]): Map<string, number> {
  const summary = new Map<string, number>();
  for (const refString of refStrings) {
    const { key, value } = parseRefString(refString);
    const bucket = `${normalizePathFormat(key)} -> ${value}`;
    summary.set(bucket, (summary.get(bucket) || 0) + 1);
  }
  return summary;
}

function mapsEqual(left: Map<string, number>, right: Map<string, number>): boolean {
  if (left.size !== right.size) return false;
  for (const [key, value] of left.entries()) {
    if (right.get(key) !== value) return false;
  }
  return true;
}

function loadPlaceFiles(): string[] {
  const manifest = readJson(placesManifestPath) as ManifestJson;
  return Array.isArray(manifest?.files) ? manifest.files.map((entry) => path.join(root, 'data', entry)) : [];
}

function checkPlaceArrays(): PlaceArrayCheck[] {
  return loadPlaceFiles().map((filePath) => {
    const data = readJson(filePath);
    const oldRows = oldToArrayForPlaceAudit(data);
    const newRows = toArray(data);
    return { file: rel(filePath), ok: oldRows.length === newRows.length, oldCount: oldRows.length, newCount: newRows.length };
  });
}

function checkActivePlaceIds(): CompareResult {
  const oldIds = new Set<string>();
  for (const filePath of loadPlaceFiles()) {
    const rows = oldToArrayForPlaceAudit(readJson(filePath));
    for (const row of rows) {
      const placeRow = row as PlaceRow;
      if (typeof placeRow?.id === 'string' && placeRow.id.trim()) oldIds.add(placeRow.id.trim());
    }
  }

  const newIds = buildActivePlaceIdSet(root, placesManifestPath);
  return compareSets('active place ids', [...oldIds], [...newIds]);
}

function checkPeopleManifestFiles(): CompareResult {
  const peopleManifest = readJson(peopleManifestPath) as ManifestJson;
  const oldFiles = Array.isArray(peopleManifest?.files)
    ? peopleManifest.files.map((entry) => path.join(root, 'data', entry))
    : [];
  const newFiles = manifestFilesToPaths(root, peopleManifestPath);
  return compareSets('people manifest files', oldFiles.map(rel), newFiles.map(rel));
}

function checkPeopleRefs(): PeopleRefCheck[] {
  const files = manifestFilesToPaths(root, peopleManifestPath);
  return files.map((filePath) => {
    const data = readJson(filePath);
    const peopleOld = oldToArrayForPeopleAudit(data);
    const peopleNew = toArray(data);

    const oldRefs: string[] = [];
    const newRefs: string[] = [];

    peopleOld.forEach((person, index) => {
      for (const ref of oldPeopleFindPlaceRefs(person)) oldRefs.push(`[${index}].${normalizeRef(ref)}`);
    });
    peopleNew.forEach((person, index) => {
      for (const ref of collectRefsByKeys(person, PLACE_REF_KEYS)) {
        const value = String(ref.value || '').trim();
        if (value) newRefs.push(`[${index}].${normalizeRef({ key: ref.key, value })}`);
      }
    });

    return { file: rel(filePath), peopleCountOk: peopleOld.length === peopleNew.length, oldPeopleCount: peopleOld.length, newPeopleCount: peopleNew.length, refs: compareSets('people refs', oldRefs, newRefs) };
  });
}

function checkGenericRefPathDifference(): GenericRefCheck[] {
  const files = [
    'data/badges.json',
    'data/routes.json',
    'data/routes_walks.json',
    'data/wonderkammer/index.json',
    'data/Civication/place_access_map.json',
    'data/Civication/place_contexts.json',
    'data/Civication/people_access_map.json',
  ].map((entry) => path.join(root, entry)).filter((filePath) => fs.existsSync(filePath));

  return files.map((filePath) => {
    const data = readJson(filePath);
    const oldRefs = oldCollectRefsByKeys(data, PLACE_REF_KEYS).map(normalizeRef);
    const newRefs = collectRefsByKeys(data, PLACE_REF_KEYS).map(normalizeRef);
    return { file: rel(filePath), refs: compareSets('generic refs', oldRefs, newRefs) };
  });
}

const placeArrayChecks = checkPlaceArrays();
const activePlaceIds = checkActivePlaceIds();
const peopleManifestFiles = checkPeopleManifestFiles();
const peopleRefs = checkPeopleRefs();
const genericRefs = checkGenericRefPathDifference();

const failures: string[] = [];
for (const item of placeArrayChecks) if (!item.ok) failures.push(`Place array count changed in ${item.file}: ${item.oldCount} -> ${item.newCount}`);
if (!activePlaceIds.ok) failures.push(`Active place id set changed: ${activePlaceIds.oldCount} -> ${activePlaceIds.newCount}`);
if (!peopleManifestFiles.ok) failures.push(`People manifest file set changed: ${peopleManifestFiles.oldCount} -> ${peopleManifestFiles.newCount}`);
for (const item of peopleRefs) {
  if (!item.peopleCountOk) failures.push(`People count changed in ${item.file}: ${item.oldPeopleCount} -> ${item.newPeopleCount}`);
  if (!item.refs.ok) failures.push(`People refs changed in ${item.file}: ${item.refs.oldCount} -> ${item.refs.newCount}`);
}

const genericPathOnlyDifferences = genericRefs.filter((item) => !item.refs.ok);
const genericBlockingDifferences: string[] = [];

for (const item of genericPathOnlyDifferences) {
  const oldSummary = summarizeRefsByPathAndValue(item.refs.onlyOld);
  const newSummary = summarizeRefsByPathAndValue(item.refs.onlyNew);
  if (!mapsEqual(oldSummary, newSummary)) {
    failures.push(`Generic refs changed in ${item.file}: ${item.refs.oldCount} -> ${item.refs.newCount}`);
    genericBlockingDifferences.push(item.file);
  }
}

console.log('Audit refactor equivalence check');
console.log(`Place files checked: ${placeArrayChecks.length}`);
console.log(`Active place ids: old=${activePlaceIds.oldCount} new=${activePlaceIds.newCount}`);
console.log(`People files: old=${peopleManifestFiles.oldCount} new=${peopleManifestFiles.newCount}`);
console.log(`People files checked: ${peopleRefs.length}`);
console.log(`Generic ref files checked: ${genericRefs.length}`);
console.log(`Blocking failures: ${failures.length}`);

if (genericPathOnlyDifferences.length) {
  console.log('\nExpected path-format differences in generic refs:');
  for (const item of genericPathOnlyDifferences) {
    const status = genericBlockingDifferences.includes(item.file) ? 'BLOCKING' : 'path-format only';
    console.log(`- ${item.file}: old=${item.refs.oldCount} new=${item.refs.newCount} (${status})`);
    const exampleOld = item.refs.onlyOld.slice(0, 3).join(' | ');
    const exampleNew = item.refs.onlyNew.slice(0, 3).join(' | ');
    if (exampleOld) console.log(`  old examples: ${exampleOld}`);
    if (exampleNew) console.log(`  new examples: ${exampleNew}`);
  }
}

if (failures.length) {
  console.log('\nFailures:');
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nResult: core audit data loading and people-ref extraction are equivalent.');
  console.log('Note: array refs in generic reports may now include indexes such as places[0], which is a path-format improvement, not a data-count change.');
}
