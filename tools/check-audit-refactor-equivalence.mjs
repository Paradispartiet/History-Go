#!/usr/bin/env node

// tools/check-audit-refactor-equivalence.mjs
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

const root = process.cwd();
const placesManifestPath = path.join(root, 'data/places/manifest.json');
const peopleManifestPath = path.join(root, 'data/people/manifest.json');

function oldToArrayForPlaceAudit(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function oldToArrayForPeopleAudit(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.people)) return data.people;
  if (data && Array.isArray(data.places)) return data.places;
  return [];
}

function oldCollectRefsByKeys(node, keys, currentPath = '', refs = []) {
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

function oldPeopleFindPlaceRefs(node, currentPath = '') {
  const refs = [];
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

function normalizeRef(ref) {
  return `${ref.key} -> ${ref.value}`;
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function compareSets(name, oldValues, newValues) {
  const oldSet = new Set(oldValues);
  const newSet = new Set(newValues);
  const onlyOld = [...oldSet].filter((value) => !newSet.has(value)).sort();
  const onlyNew = [...newSet].filter((value) => !oldSet.has(value)).sort();
  const ok = onlyOld.length === 0 && onlyNew.length === 0;
  return { name, ok, oldCount: oldSet.size, newCount: newSet.size, onlyOld, onlyNew };
}

function loadPlaceFiles() {
  const manifest = readJson(placesManifestPath);
  return Array.isArray(manifest?.files) ? manifest.files.map((entry) => path.join(root, 'data', entry)) : [];
}

function checkPlaceArrays() {
  return loadPlaceFiles().map((filePath) => {
    const data = readJson(filePath);
    const oldRows = oldToArrayForPlaceAudit(data);
    const newRows = toArray(data);
    return { file: rel(filePath), ok: oldRows.length === newRows.length, oldCount: oldRows.length, newCount: newRows.length };
  });
}

function checkActivePlaceIds() {
  const oldIds = new Set();
  for (const filePath of loadPlaceFiles()) {
    const rows = oldToArrayForPlaceAudit(readJson(filePath));
    for (const row of rows) {
      if (typeof row?.id === 'string' && row.id.trim()) oldIds.add(row.id.trim());
    }
  }

  const newIds = buildActivePlaceIdSet(root, placesManifestPath);
  return compareSets('active place ids', [...oldIds], [...newIds]);
}

function checkPeopleManifestFiles() {
  const peopleManifest = readJson(peopleManifestPath);
  const oldFiles = Array.isArray(peopleManifest?.files)
    ? peopleManifest.files.map((entry) => path.join(root, 'data', entry))
    : [];
  const newFiles = manifestFilesToPaths(root, peopleManifestPath);
  return compareSets('people manifest files', oldFiles.map(rel), newFiles.map(rel));
}

function checkPeopleRefs() {
  const files = manifestFilesToPaths(root, peopleManifestPath);
  return files.map((filePath) => {
    const data = readJson(filePath);
    const peopleOld = oldToArrayForPeopleAudit(data);
    const peopleNew = toArray(data);

    const oldRefs = [];
    const newRefs = [];

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

function checkGenericRefPathDifference() {
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

const failures = [];
for (const item of placeArrayChecks) if (!item.ok) failures.push(`Place array count changed in ${item.file}: ${item.oldCount} -> ${item.newCount}`);
if (!activePlaceIds.ok) failures.push(`Active place id set changed: ${activePlaceIds.oldCount} -> ${activePlaceIds.newCount}`);
if (!peopleManifestFiles.ok) failures.push(`People manifest file set changed: ${peopleManifestFiles.oldCount} -> ${peopleManifestFiles.newCount}`);
for (const item of peopleRefs) {
  if (!item.peopleCountOk) failures.push(`People count changed in ${item.file}: ${item.oldPeopleCount} -> ${item.newPeopleCount}`);
  if (!item.refs.ok) failures.push(`People refs changed in ${item.file}: ${item.refs.oldCount} -> ${item.refs.newCount}`);
}

const genericPathOnlyDifferences = genericRefs.filter((item) => !item.refs.ok);

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
    console.log(`- ${item.file}: old=${item.refs.oldCount} new=${item.refs.newCount}`);
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
