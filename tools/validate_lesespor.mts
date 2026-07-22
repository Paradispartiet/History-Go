#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Obj = Record<string, unknown>;
type Item = Obj & {
  id?: unknown;
  title?: unknown;
  relevance?: unknown;
  url?: unknown;
  access?: unknown;
  source_quality?: unknown;
  curation_status?: unknown;
  category_hints?: unknown;
  place_ids?: unknown;
  person_ids?: unknown;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.basename(path.dirname(here)) === 'dist'
  ? path.resolve(here, '..', '..')
  : path.resolve(here, '..');

const MANIFEST = 'data/lesespor/manifest.json';
const BADGES = 'data/badges/index.json';
const PLACES = 'data/places/places_index.json';
const SCHEMA = 'history_go_lesespor_v1';
const sourceQualities = new Set(['recognized', 'institutional', 'scholarly', 'canonical']);
const curationStatuses = new Set(['strong_candidate', 'approved']);
const forbidden = new Set(['article_body', 'fulltext', 'body', 'text', 'content']);

const errors: string[] = [];
const warnings: string[] = [];

const norm = (value: string): string => value.split(path.sep).join('/');
const absolute = (relative: string): string => path.join(root, relative);

async function json(relative: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(absolute(relative), 'utf8'));
  } catch (error) {
    throw new Error(`${relative}: ${(error as Error).message}`);
  }
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : [];
}

function placeIdsFromIndex(value: unknown): Set<string> {
  const out = new Set<string>();
  const rows = Array.isArray(value)
    ? value
    : (value && typeof value === 'object' && Array.isArray((value as Obj).places)
      ? (value as Obj).places as unknown[]
      : []);
  for (const row of rows) {
    if (row && typeof row === 'object' && typeof (row as Obj).id === 'string') {
      out.add((row as Obj).id as string);
    }
  }
  return out;
}

function scopeAndCategory(relativeEntry: string): { scope: string; category: string } | null {
  const normalized = norm(relativeEntry);
  const dir = path.dirname(normalized);
  const scope = path.basename(dir);
  const name = path.basename(normalized, '.json');
  const prefix = `lesespor_${scope}_`;
  if (!scope || scope === '.' || !name.startsWith(prefix)) return null;
  const category = name.slice(prefix.length);
  return category ? { scope, category } : null;
}

function requireArray(file: string, itemId: string, field: string, value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    errors.push(`${file}: item ${itemId} has non-array ${field}`);
    return [];
  }
  return value;
}

const manifest = await json(MANIFEST) as Obj;
const badgeIndex = await json(BADGES) as Obj;
const placesIndex = await json(PLACES);

const manifestFiles = strings(manifest.files);
if (!Array.isArray(manifest.files)) errors.push(`${MANIFEST}: files must be an array`);

const badgeCategories = new Set(
  strings(badgeIndex.files).map((file) => path.basename(file, '.json')),
);
const knownPlaces = placeIdsFromIndex(placesIndex);
const seenItemFiles = new Map<string, string[]>();
const scopes = new Set<string>();

for (const entry of manifestFiles) {
  const file = norm(path.join('data/lesespor', entry));
  const parsed = scopeAndCategory(entry);
  if (!parsed) {
    errors.push(`${file}: expected <scope>/lesespor_<scope>_<category>.json`);
    continue;
  }
  scopes.add(parsed.scope);

  let doc: Obj;
  try {
    doc = await json(file) as Obj;
  } catch (error) {
    errors.push((error as Error).message);
    continue;
  }

  if (doc.schema !== SCHEMA) errors.push(`${file}: schema must be ${SCHEMA}`);
  if (doc.city !== parsed.scope) {
    errors.push(`${file}: city ${JSON.stringify(doc.city)} must match scope ${JSON.stringify(parsed.scope)}`);
  }
  if (doc.category !== parsed.category) {
    errors.push(`${file}: category ${JSON.stringify(doc.category)} must match filename category ${JSON.stringify(parsed.category)}`);
  }
  if (!badgeCategories.has(String(doc.category ?? ''))) {
    errors.push(`${file}: category ${JSON.stringify(doc.category)} is not present in ${BADGES}`);
  }
  if (!doc.rights_policy || typeof doc.rights_policy !== 'object' || Array.isArray(doc.rights_policy)) {
    errors.push(`${file}: rights_policy must be an object`);
  }
  if (!Array.isArray(doc.items)) {
    errors.push(`${file}: items must be an array`);
    continue;
  }

  const localIds = new Set<string>();
  for (const [index, raw] of doc.items.entries()) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push(`${file}: item at index ${index} must be an object`);
      continue;
    }
    const item = raw as Item;
    const itemId = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `<index ${index}>`;

    if (itemId.startsWith('<index ')) errors.push(`${file}: item at index ${index} must have a non-empty string id`);
    else if (localIds.has(itemId)) errors.push(`${file}: duplicate item id within category file: ${itemId}`);
    else localIds.add(itemId);

    if (typeof item.title !== 'string' || !item.title.trim()) errors.push(`${file}: item ${itemId} must have a non-empty title`);
    if (typeof item.relevance !== 'string' || !item.relevance.trim()) errors.push(`${file}: item ${itemId} must have a non-empty relevance`);
    if (typeof item.url !== 'string' || !item.url.trim()) errors.push(`${file}: item ${itemId} must have a non-empty url`);
    if (item.access !== 'open') errors.push(`${file}: item ${itemId} access must be \"open\"`);
    if (!sourceQualities.has(String(item.source_quality ?? ''))) {
      errors.push(`${file}: item ${itemId} has invalid source_quality ${JSON.stringify(item.source_quality)}`);
    }
    if (!curationStatuses.has(String(item.curation_status ?? ''))) {
      errors.push(`${file}: item ${itemId} has invalid curation_status ${JSON.stringify(item.curation_status)}`);
    }

    for (const field of forbidden) {
      if (Object.hasOwn(item, field)) errors.push(`${file}: item ${itemId} contains forbidden full-text field ${field}`);
    }

    const hints = requireArray(file, itemId, 'category_hints', item.category_hints);
    for (const hint of hints) {
      if (typeof hint !== 'string' || !badgeCategories.has(hint)) {
        errors.push(`${file}: item ${itemId} has invalid category_hints value ${JSON.stringify(hint)}`);
      }
    }

    const placeIds = requireArray(file, itemId, 'place_ids', item.place_ids);
    const personIds = requireArray(file, itemId, 'person_ids', item.person_ids);
    if (placeIds.length === 0 && personIds.length === 0) {
      errors.push(`${file}: item ${itemId} must reference at least one place_id or person_id`);
    }
    for (const placeId of placeIds) {
      if (typeof placeId !== 'string' || !knownPlaces.has(placeId)) {
        errors.push(`${file}: item ${itemId} references unknown place_id ${JSON.stringify(placeId)}`);
      }
    }

    const files = seenItemFiles.get(itemId) ?? [];
    files.push(file);
    seenItemFiles.set(itemId, files);
  }
}

for (const [itemId, files] of seenItemFiles) {
  if (files.length > 1) warnings.push(`item id ${itemId} appears in multiple active files: ${files.join(', ')}`);
}

for (const warning of warnings) console.log(`WARN ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  console.error(`\nLesespor validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(
  `Lesespor validation passed for ${manifestFiles.length} active file(s) across ${scopes.size} scope(s), ` +
  `${knownPlaces.size} known place id(s) and ${seenItemFiles.size} unique item id(s).`,
);
if (warnings.length) console.log(`Completed with ${warnings.length} warning(s).`);
