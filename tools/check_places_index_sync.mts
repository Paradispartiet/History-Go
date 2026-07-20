#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { applyCategoryOverride, readCategoryOverrides } from './lib/placeCategoryOverrides.mjs';

type JsonObject = Record<string, unknown>;
type PlaceManifest = JsonObject & {
  files?: unknown[];
};
type PlaceRow = JsonObject & {
  id?: unknown;
  name?: unknown;
  lat?: unknown;
  lon?: unknown;
  lng?: unknown;
  r?: unknown;
  category?: unknown;
  year?: unknown;
  desc?: unknown;
  image?: unknown;
  cardImage?: unknown;
  frontImage?: unknown;
  hidden?: unknown;
  stub?: unknown;
  groundhopper?: unknown;
  locatorType?: unknown;
  sourceProvider?: unknown;
  sourceObjectId?: unknown;
  address?: unknown;
  geocodeAccuracy?: unknown;
  coordRole?: unknown;
  coordType?: unknown;
  coordStatus?: unknown;
  coordSource?: unknown;
  coordVerifiedAt?: unknown;
  coordNote?: unknown;
  sourceFile?: unknown;
};
type PlaceExclusions = JsonObject & {
  disabledPlaceIds?: unknown[];
};
type LightField = keyof PlaceRow;
type LightPlace = Partial<Record<LightField, unknown>>;
type IndexDiff = {
  idx: number;
  placeId: unknown;
  type: string;
  field?: string;
  expected: unknown;
  actual: unknown;
};

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const ACTUAL_INDEX_PATH = path.join(ROOT, 'data/places/places_index.json');
const EXCLUSIONS_PATH = path.join(ROOT, 'data/places/place_exclusions.json');
const COORDINATE_OVERRIDES_PATH = path.join(ROOT, 'data/places/coordinate_overrides.json');

const LIGHT_FIELDS: LightField[] = [
  'id',
  'name',
  'lat',
  'lon',
  'r',
  'category',
  'year',
  'desc',
  'image',
  'cardImage',
  'frontImage',
  'hidden',
  'stub',
  'groundhopper',
  'locatorType',
  'sourceProvider',
  'sourceObjectId',
  'address',
  'geocodeAccuracy',
  'coordRole',
  'coordType',
  'coordStatus',
  'coordSource',
  'coordVerifiedAt',
  'coordNote',
  'sourceFile',
];

const MAX_DIFFS = 20;

const COORDINATE_OVERRIDE_FIELDS = [
  'lat',
  'lon',
  'r',
  'coordType',
  'coordStatus',
  'coordSource',
  'coordSourceId',
  'coordSourceUrl',
  'coordPrecisionM',
  'coordVerifiedAt',
  'coordNote',
] as const;

function hasObjectType(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object';
}

function isJsonObject(value: unknown): value is JsonObject {
  return hasObjectType(value) && !Array.isArray(value);
}

function isPlaceManifest(value: unknown): value is PlaceManifest {
  return isJsonObject(value) && (!Object.prototype.hasOwnProperty.call(value, 'files') || Array.isArray(value.files));
}

function isPlaceExclusions(value: unknown): value is PlaceExclusions {
  return isJsonObject(value) && (!Object.prototype.hasOwnProperty.call(value, 'disabledPlaceIds') || Array.isArray(value.disabledPlaceIds));
}

function isPlaceRow(value: unknown): value is PlaceRow {
  return isJsonObject(value);
}

function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function placeIdForError(place: PlaceRow): string {
  return typeof place.id === 'string' && place.id.trim() ? place.id.trim() : '(mangler-id)';
}

function assertNoLegacyLng(place: PlaceRow, sourceFile: string): void {
  if (Object.prototype.hasOwnProperty.call(place, 'lng')) {
    throw new Error(`${sourceFile}#${placeIdForError(place)}: ugyldig koordinatfelt "lng". History Go bruker "lon" som eneste lengdegradfelt.`);
  }
}

async function readCoordinateOverrides(): Promise<Map<string, JsonObject>> {
  try {
    const data = await readJson(COORDINATE_OVERRIDES_PATH);
    if (!Array.isArray(data)) return new Map();
    return new Map(data
      .filter((override): override is JsonObject => isJsonObject(override) && typeof override.id === 'string' && override.id.trim().length > 0 && isNum(override.lat) && isNum(override.lon))
      .map((override) => [String(override.id).trim(), override] as const));
  } catch (error: unknown) {
    const code = hasObjectType(error) ? error.code : undefined;
    if (code === 'ENOENT') return new Map();
    throw error;
  }
}

function applyCoordinateOverride(place: PlaceRow, overrides: Map<string, JsonObject>): PlaceRow {
  const id = typeof place.id === 'string' ? place.id.trim() : '';
  const override = id ? overrides.get(id) : null;
  if (!override) return place;
  const out: PlaceRow = { ...place };
  for (const key of COORDINATE_OVERRIDE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(override, key)) out[key] = override[key];
  }
  if (Object.prototype.hasOwnProperty.call(out, 'lng')) delete out.lng;
  return out;
}

function pickLight(place: PlaceRow, sourceFile = ''): LightPlace {
  const out: LightPlace = {};
  for (const key of LIGHT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(place, key)) out[key] = place[key];
  }
  if (sourceFile) out.sourceFile = sourceFile;
  return out;
}

async function readJson(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
}

type PlaceEntry = {
  place: PlaceRow;
  sourceFile: string;
};

function splitManifestPathFor(sourcePath: string): string {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || '.json'}`);
}

function isValidSplitManifest(value: unknown): value is JsonObject & { places: JsonObject[] } {
  return isJsonObject(value)
    && Array.isArray(value.places)
    && value.places.some((row) => isJsonObject(row) && typeof row.file === 'string' && row.file.trim().length > 0);
}

function placesFromData(data: unknown): PlaceRow[] {
  if (Array.isArray(data)) return data.filter(isPlaceRow);
  if (isJsonObject(data) && Array.isArray(data.places)) return data.places.filter(isPlaceRow);
  if (isPlaceRow(data) && typeof data.id === 'string') return [data];
  return [];
}

async function tryReadSiblingSplitManifest(sourcePath: string): Promise<{ path: string; data: JsonObject & { places: JsonObject[] } } | null> {
  const splitPath = splitManifestPathFor(sourcePath);
  try {
    const data = await readJson(splitPath);
    return isValidSplitManifest(data) ? { path: splitPath, data } : null;
  } catch (error: unknown) {
    const code = hasObjectType(error) ? error.code : undefined;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

async function loadPlaceEntriesFromManifestEntry(sourceFile: string): Promise<PlaceEntry[]> {
  const fullPath = path.join(ROOT, 'data', sourceFile);
  const splitManifest = await tryReadSiblingSplitManifest(fullPath);

  if (splitManifest) {
    const splitDir = path.dirname(splitManifest.path);
    const entries: PlaceEntry[] = [];
    for (const row of splitManifest.data.places) {
      if (!isJsonObject(row) || typeof row.file !== 'string' || !row.file.trim()) continue;
      const childFullPath = path.join(splitDir, row.file.trim());
      const childSourceFile = path.relative(path.join(ROOT, 'data'), childFullPath).split(path.sep).join('/');
      const childData = await readJson(childFullPath);
      for (const place of placesFromData(childData)) entries.push({ place, sourceFile: childSourceFile });
    }
    return entries;
  }

  const data = await readJson(fullPath);
  return placesFromData(data).map((place) => ({ place, sourceFile }));
}

async function readDisabledPlaceIds(): Promise<Set<string>> {
  try {
    const exclusions = await readJson(EXCLUSIONS_PATH);
    if (!isPlaceExclusions(exclusions) || !Array.isArray(exclusions.disabledPlaceIds)) return new Set();
    return new Set(exclusions.disabledPlaceIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
  } catch (error: unknown) {
    const code = hasObjectType(error) ? error.code : undefined;
    if (code === 'ENOENT') return new Set();
    throw error;
  }
}

function formatValue(value: unknown): string | undefined {
  if (value === undefined) return 'undefined';
  return JSON.stringify(value);
}

function compareEntries(expectedEntry: unknown, actualEntry: unknown, idx: number, diffs: IndexDiff[]): void {
  const expectedId = hasObjectType(expectedEntry) ? expectedEntry.id : undefined;
  const actualId = hasObjectType(actualEntry) ? actualEntry.id : undefined;
  const placeId = expectedId ?? actualId;

  if (!isJsonObject(actualEntry)) {
    diffs.push({
      idx,
      placeId,
      type: 'invalid_actual_entry',
      expected: expectedEntry,
      actual: actualEntry,
    });
    return;
  }

  if (!isJsonObject(expectedEntry)) {
    diffs.push({
      idx,
      placeId,
      type: 'invalid_expected_entry',
      expected: expectedEntry,
      actual: actualEntry,
    });
    return;
  }

  if (expectedEntry.id !== actualEntry.id) {
    diffs.push({
      idx,
      placeId,
      type: 'id_mismatch',
      field: 'id',
      expected: expectedEntry.id,
      actual: actualEntry.id,
    });
  }

  const expectedKeys = Object.keys(expectedEntry);
  const actualKeys = Object.keys(actualEntry);

  for (const key of expectedKeys) {
    if (!Object.prototype.hasOwnProperty.call(actualEntry, key)) {
      diffs.push({
        idx,
        placeId,
        type: 'missing_field',
        field: key,
        expected: expectedEntry[key],
        actual: undefined,
      });
      if (diffs.length >= MAX_DIFFS) return;
      continue;
    }

    if (JSON.stringify(expectedEntry[key]) !== JSON.stringify(actualEntry[key])) {
      diffs.push({
        idx,
        placeId,
        type: 'value_mismatch',
        field: key,
        expected: expectedEntry[key],
        actual: actualEntry[key],
      });
      if (diffs.length >= MAX_DIFFS) return;
    }
  }

  for (const key of actualKeys) {
    if (!Object.prototype.hasOwnProperty.call(expectedEntry, key)) {
      diffs.push({
        idx,
        placeId,
        type: 'extra_field',
        field: key,
        expected: undefined,
        actual: actualEntry[key],
      });
      if (diffs.length >= MAX_DIFFS) return;
    }
  }
}

async function buildExpectedIndex(): Promise<LightPlace[]> {
  const manifest = await readJson(MANIFEST_PATH);
  const files = isPlaceManifest(manifest) && Array.isArray(manifest.files) ? manifest.files : [];
  const disabledPlaceIds = await readDisabledPlaceIds();
  const coordinateOverrides = await readCoordinateOverrides();
  const categoryOverrides = await readCategoryOverrides(ROOT);
  const out: LightPlace[] = [];

  for (const rel of files) {
    const sourceFile = String(rel || '').trim();
    if (!sourceFile) continue;
    const entries = await loadPlaceEntriesFromManifestEntry(sourceFile);

    for (const { place, sourceFile: actualSourceFile } of entries) {
      assertNoLegacyLng(place, actualSourceFile);
      const placeWithCoordinates = applyCoordinateOverride(place, coordinateOverrides);
      const indexedPlace = applyCategoryOverride(placeWithCoordinates, categoryOverrides) as PlaceRow;
      const id = typeof indexedPlace.id === 'string' ? indexedPlace.id : '';
      if (id && disabledPlaceIds.has(id)) continue;
      out.push(pickLight(indexedPlace, actualSourceFile));
    }
  }

  return out;
}

async function main(): Promise<void> {
  const expectedIndex = await buildExpectedIndex();
  const actualIndexRaw = await readJson(ACTUAL_INDEX_PATH);
  const disabledPlaceIds = await readDisabledPlaceIds();

  const actualIndex = Array.isArray(actualIndexRaw)
    ? actualIndexRaw.filter((entry) => {
        if (!isJsonObject(entry)) return true;
        const id = typeof entry.id === 'string' ? entry.id : '';
        return !id || !disabledPlaceIds.has(id);
      })
    : actualIndexRaw;

  const diffs: IndexDiff[] = [];

  if (!Array.isArray(actualIndex)) {
    console.error('places_index sync check failed.');
    console.error('actualIndex is not an array.');
    console.error(`expected: array(${expectedIndex.length})`);
    console.error(`actual: ${typeof actualIndex}`);
    process.exit(1);
  }

  if (expectedIndex.length !== actualIndex.length) {
    diffs.push({
      idx: -1,
      placeId: undefined,
      type: 'length_mismatch',
      expected: expectedIndex.length,
      actual: actualIndex.length,
    });
  }

  const limit = Math.min(expectedIndex.length, actualIndex.length);
  for (let idx = 0; idx < limit && diffs.length < MAX_DIFFS; idx += 1) {
    compareEntries(expectedIndex[idx], actualIndex[idx], idx, diffs);
  }

  if (diffs.length > 0) {
    console.error('places_index sync check failed.');
    console.error(`Showing first ${Math.min(MAX_DIFFS, diffs.length)} difference(s):`);
    for (const diff of diffs.slice(0, MAX_DIFFS)) {
      const position = diff.idx >= 0 ? diff.idx : 'n/a';
      const idText = diff.placeId ? ` placeId=${diff.placeId}` : '';
      const fieldText = diff.field ? ` field=${diff.field}` : '';
      console.error(`- index=${position}${idText} type=${diff.type}${fieldText}`);
      console.error(`  expected: ${formatValue(diff.expected)}`);
      console.error(`  actual:   ${formatValue(diff.actual)}`);
    }
    process.exit(1);
  }

  console.log('places_index.json is in sync with source place files after disabled-place filtering and place overrides.');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('places_index sync check failed.');
  console.error(err);
  process.exit(1);
});
