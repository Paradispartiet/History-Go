#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
const repoRoot = path.basename(path.dirname(currentDir)) === 'dist'
  ? path.resolve(currentDir, '..', '..')
  : path.resolve(currentDir, '..');

type JsonObject = Record<string, unknown>;
type JsonArray = unknown[];
type LesesporManifest = JsonObject & {
  files?: unknown;
};
type BadgeIndex = JsonObject & {
  files?: unknown;
};
type LesesporDocument = JsonObject & {
  schema?: unknown;
  city?: unknown;
  category?: unknown;
  rights_policy?: unknown;
  items?: unknown;
};
type LesesporItem = JsonObject & {
  id?: unknown;
  access?: unknown;
  url?: unknown;
  title?: unknown;
  relevance?: unknown;
  source_quality?: unknown;
  curation_status?: unknown;
  category_hints?: unknown;
  place_ids?: unknown;
  person_ids?: unknown;
};

const MANIFEST_PATH = 'data/lesespor/manifest.json';
const BADGE_INDEX_PATH = 'data/badges/index.json';
const LESESPOR_DIR = 'data/lesespor/oslo';
const PLACES_ROOT = 'data/places';
const EXPECTED_SCHEMA = 'history_go_lesespor_v1';
const EXPECTED_CITY = 'oslo';
const ALLOWED_ACCESS = 'open';
const ALLOWED_SOURCE_QUALITIES = new Set<unknown>([
  'recognized',
  'institutional',
  'scholarly',
  'canonical',
]);
const ALLOWED_CURATION_STATUSES = new Set<unknown>([
  'strong_candidate',
  'approved',
]);
const FORBIDDEN_ITEM_FIELDS = new Set([
  'article_body',
  'fulltext',
  'body',
  'text',
  'content',
]);

const errors: string[] = [];
const warnings: string[] = [];

function rel(...parts: string[]): string {
  return path.join(...parts).split(path.sep).join('/');
}

function fromRoot(...parts: string[]): string {
  return path.join(repoRoot, ...parts);
}

async function readJson(relativePath: string): Promise<unknown> {
  const absolutePath = fromRoot(relativePath);
  let raw;
  try {
    raw = await readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new Error(`could not read ${relativePath}: ${(error as Error).message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`invalid JSON in ${relativePath}: ${(error as Error).message}`);
  }
}

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await readFile(fromRoot(relativePath));
    return true;
  } catch {
    return false;
  }
}

async function findJsonFiles(relativeDir: string): Promise<string[]> {
  const absoluteDir = fromRoot(relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = rel(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findJsonFiles(relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

function categoryFromLesesporFilename(relativePath: string): string | null {
  const basename = path.basename(relativePath, '.json');
  const match = basename.match(/^lesespor_oslo_(.+)$/);
  return match?.[1] ?? null;
}

function addError(message: string): void {
  errors.push(message);
}

function addWarning(message: string): void {
  warnings.push(message);
}

function extractPlaceIds(document: unknown): string[] {
  if (Array.isArray(document)) {
    return document
      .filter((entry): entry is JsonObject & { id: string } => Boolean(entry) && typeof entry === 'object' && typeof (entry as JsonObject).id === 'string')
      .map((entry) => entry.id);
  }

  if (!document || typeof document !== 'object') {
    return [];
  }

  const documentObject = document as JsonObject;
  for (const collectionKey of ['places', 'items', 'features']) {
    if (Array.isArray(documentObject[collectionKey])) {
      return documentObject[collectionKey]
        .filter((entry): entry is JsonObject & { id: string } => Boolean(entry) && typeof entry === 'object' && typeof (entry as JsonObject).id === 'string')
        .map((entry) => entry.id);
    }
  }

  return typeof documentObject.id === 'string' ? [documentObject.id] : [];
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateArrayField(file: string, itemId: string, fieldName: string, value: unknown): JsonArray {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    addError(`${file}: item ${itemId} has non-array ${fieldName}`);
    return [];
  }

  return value;
}

const manifest = await readJson(MANIFEST_PATH) as LesesporManifest;
const badgeIndex = await readJson(BADGE_INDEX_PATH) as BadgeIndex;
const badgeCategories = new Set<unknown>(
  ((badgeIndex.files ?? []) as string[]).map((file) => path.basename(file, '.json')),
);
const manifestFiles = (manifest.files ?? []) as string[];

if (!Array.isArray(manifestFiles)) {
  addError(`${MANIFEST_PATH}: files must be an array`);
}

const manifestFileSet = new Set(manifestFiles.map((file) => rel('data/lesespor', file)));

for (const manifestEntry of manifestFiles) {
  const relativePath = rel('data/lesespor', manifestEntry);
  if (!await fileExists(relativePath)) {
    addError(`${MANIFEST_PATH}: listed file does not exist: ${manifestEntry}`);
  }
}

const osloLesesporFiles = await findJsonFiles(LESESPOR_DIR);
for (const file of osloLesesporFiles) {
  if (!manifestFileSet.has(file)) {
    addWarning(`${file}: file is under ${LESESPOR_DIR} but is not listed in ${MANIFEST_PATH}`);
  }
}

const placeIds = new Set<unknown>();
const placeFiles = await findJsonFiles(PLACES_ROOT);
for (const file of placeFiles.filter((candidate) => candidate.includes('/oslo/'))) {
  try {
    const document = await readJson(file);
    for (const id of extractPlaceIds(document)) {
      placeIds.add(id);
    }
  } catch (error) {
    addError((error as Error).message);
  }
}

const itemCategoriesById = new Map<string, unknown[]>();

for (const file of osloLesesporFiles) {
  let document: LesesporDocument;
  try {
    document = await readJson(file) as LesesporDocument;
  } catch (error) {
    addError((error as Error).message);
    continue;
  }

  const expectedCategory = categoryFromLesesporFilename(file);
  if (!expectedCategory) {
    addError(`${file}: filename must match lesespor_oslo_<category>.json`);
  }

  if (document.schema !== EXPECTED_SCHEMA) {
    addError(`${file}: schema must be ${EXPECTED_SCHEMA}`);
  }

  if (document.city !== EXPECTED_CITY) {
    addError(`${file}: city must be ${EXPECTED_CITY}`);
  }

  if (document.category !== expectedCategory) {
    addError(`${file}: category ${JSON.stringify(document.category)} must match filename category ${JSON.stringify(expectedCategory)}`);
  }

  if (!badgeCategories.has(document.category)) {
    addError(`${file}: category ${JSON.stringify(document.category)} is not present in ${BADGE_INDEX_PATH}`);
  }

  if (!document.rights_policy || typeof document.rights_policy !== 'object' || Array.isArray(document.rights_policy)) {
    addError(`${file}: rights_policy must be an object`);
  }

  if (!Array.isArray(document.items)) {
    addError(`${file}: items must be an array`);
    continue;
  }

  const idsInFile = new Set<string>();
  for (const [index, item] of document.items.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      addError(`${file}: item at index ${index} must be an object`);
      continue;
    }

    const itemRecord = item as LesesporItem;
    const itemId = typeof itemRecord.id === 'string' && itemRecord.id.length > 0 ? itemRecord.id : `<index ${index}>`;
    if (itemId.startsWith('<index ')) {
      addError(`${file}: item at index ${index} must have a non-empty string id`);
    } else if (idsInFile.has(itemId)) {
      addError(`${file}: duplicate item id within category file: ${itemId}`);
    } else {
      idsInFile.add(itemId);
    }

    if (itemRecord.access !== ALLOWED_ACCESS) {
      addError(`${file}: item ${itemId} access must be ${JSON.stringify(ALLOWED_ACCESS)}`);
    }

    if (typeof itemRecord.url !== 'string' || itemRecord.url.trim().length === 0) {
      addError(`${file}: item ${itemId} must have a non-empty string url`);
    }

    if (!isNonEmptyString(itemRecord.title)) {
      addError(`${file}: item ${itemId} must have a non-empty title`);
    }

    if (!isNonEmptyString(itemRecord.relevance)) {
      addError(`${file}: item ${itemId} must have a non-empty relevance`);
    }

    if (!ALLOWED_SOURCE_QUALITIES.has(itemRecord.source_quality)) {
      addError(`${file}: item ${itemId} source_quality must be one of ${[...ALLOWED_SOURCE_QUALITIES].join(', ')}`);
    }

    if (!ALLOWED_CURATION_STATUSES.has(itemRecord.curation_status)) {
      addError(`${file}: item ${itemId} curation_status must be one of ${[...ALLOWED_CURATION_STATUSES].join(', ')}`);
    }

    for (const forbiddenField of FORBIDDEN_ITEM_FIELDS) {
      if (Object.hasOwn(itemRecord, forbiddenField)) {
        addError(`${file}: item ${itemId} contains forbidden full-text field ${forbiddenField}`);
      }
    }

    const categoryHints = validateArrayField(file, itemId, 'category_hints', itemRecord.category_hints);
    for (const categoryHint of categoryHints) {
      if (!badgeCategories.has(categoryHint)) {
        addError(`${file}: item ${itemId} has category_hints value that is not a badge category: ${JSON.stringify(categoryHint)}`);
      }
    }

    const itemPlaceIds = validateArrayField(file, itemId, 'place_ids', itemRecord.place_ids);
    const itemPersonIds = validateArrayField(file, itemId, 'person_ids', itemRecord.person_ids);

    if (itemPlaceIds.length === 0 && itemPersonIds.length === 0) {
      addError(`${file}: item ${itemId} must reference at least one place_id or person_id`);
    }

    for (const placeId of itemPlaceIds) {
      if (!placeIds.has(placeId)) {
        addError(`${file}: item ${itemId} references unknown place_id ${JSON.stringify(placeId)}`);
      }
    }

    if (!itemCategoriesById.has(itemId)) {
      itemCategoriesById.set(itemId, []);
    }
    itemCategoriesById.get(itemId)?.push(document.category);
  }
}

for (const [itemId, categories] of [...itemCategoriesById.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const uniqueCategories = [...new Set(categories)];
  if (uniqueCategories.length > 1) {
    addWarning(`item id ${itemId} appears in multiple category files: ${uniqueCategories.join(', ')}`);
  }
}

for (const warning of warnings) {
  console.log(`WARN ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR ${error}`);
  }
  console.error(`\nLesespor validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`Lesespor validation passed for ${osloLesesporFiles.length} Oslo category file(s), ${manifestFiles.length} manifest entry/entries and ${placeIds.size} Oslo place id(s).`);
if (warnings.length > 0) {
  console.log(`Completed with ${warnings.length} warning(s); review cross-category item ids before removing any intentional overlaps.`);
}
