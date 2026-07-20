#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'data/places/places_index.json');
const EXCLUSIONS_PATH = path.join(ROOT, 'data/places/place_exclusions.json');
const COORDINATE_OVERRIDES_PATH = path.join(ROOT, 'data/places/coordinate_overrides.json');
const CATEGORY_OVERRIDES_PATH = path.join(ROOT, 'data/places/category_overrides.json');

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
  coordType?: unknown;
  coordStatus?: unknown;
  coordSource?: unknown;
  coordRole?: unknown;
  coordVerifiedAt?: unknown;
  coordNote?: unknown;
  locatorType?: unknown;
  sourceProvider?: unknown;
  sourceObjectId?: unknown;
  address?: unknown;
  geocodeAccuracy?: unknown;
  sourceFile?: unknown;
};
type PlaceExclusions = JsonObject & {
  disabledPlaceIds?: unknown[];
};
type LightField = Exclude<keyof PlaceRow, 'lng'>;
type LightPlace = Partial<Record<LightField, unknown>>;

type CoordinateOverride = JsonObject & {
  id: string;
  lat: number;
  lon: number;
};

type CategoryOverride = JsonObject & {
  id: string;
  category: string;
};

const LIGHT_FIELDS: LightField[] = [
  'id','name','lat','lon','r','category','year','desc','image','cardImage','frontImage','hidden','stub','groundhopper','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote','sourceFile'
];

const COORDINATE_OVERRIDE_FIELDS = [
  'lat','lon','r','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordPrecisionM','coordVerifiedAt','coordNote'
] as const;

function hasObjectType(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object';
}

function isPlaceManifest(value: unknown): value is PlaceManifest {
  return hasObjectType(value) && (!Object.prototype.hasOwnProperty.call(value, 'files') || Array.isArray(value.files));
}

function isPlaceExclusions(value: unknown): value is PlaceExclusions {
  return hasObjectType(value) && (!Object.prototype.hasOwnProperty.call(value, 'disabledPlaceIds') || Array.isArray(value.disabledPlaceIds));
}

function isPlaceRow(value: unknown): value is PlaceRow {
  return hasObjectType(value);
}

function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isCoordinateOverride(value: unknown): value is CoordinateOverride {
  return hasObjectType(value) && typeof value.id === 'string' && value.id.trim().length > 0 && isNum(value.lat) && isNum(value.lon);
}

function isCategoryOverride(value: unknown): value is CategoryOverride {
  return hasObjectType(value)
    && typeof value.id === 'string'
    && value.id.trim().length > 0
    && typeof value.category === 'string'
    && value.category.trim().length > 0;
}

function placeIdForError(place: PlaceRow): string {
  return typeof place.id === 'string' && place.id.trim() ? place.id.trim() : '(mangler-id)';
}

function assertNoLegacyLng(place: PlaceRow, sourceFile: string): void {
  if (Object.prototype.hasOwnProperty.call(place, 'lng')) {
    throw new Error(`${sourceFile}#${placeIdForError(place)}: ugyldig koordinatfelt "lng". History Go bruker "lon" som eneste lengdegradfelt.`);
  }
}

function pickLight(place: PlaceRow, sourceFile = ''): LightPlace {
  const out: LightPlace = {};
  for (const key of LIGHT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(place, key)) out[key] = place[key];
  }
  if (sourceFile) out.sourceFile = sourceFile;
  return out;
}

async function readJson(p: string): Promise<unknown> {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw) as unknown;
}

function splitManifestPathFor(sourcePath: string): string {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || '.json'}`);
}

function isValidSplitManifest(value: unknown): value is JsonObject & { places: JsonObject[] } {
  return hasObjectType(value)
    && Array.isArray(value.places)
    && value.places.some((row) => hasObjectType(row) && typeof row.file === 'string' && row.file.trim().length > 0);
}

type PlaceEntry = {
  place: PlaceRow;
  sourceFile: string;
};

function placesFromPlaceData(data: unknown): PlaceRow[] {
  if (Array.isArray(data)) return data.filter(isPlaceRow);
  if (hasObjectType(data) && Array.isArray(data.places)) return data.places.filter(isPlaceRow);
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
      if (!hasObjectType(row) || typeof row.file !== 'string' || !row.file.trim()) continue;
      const childFullPath = path.join(splitDir, row.file.trim());
      const childSourceFile = path.relative(path.join(ROOT, 'data'), childFullPath).split(path.sep).join('/');
      const childData = await readJson(childFullPath);
      for (const place of placesFromPlaceData(childData)) {
        entries.push({ place, sourceFile: childSourceFile });
      }
    }
    return entries;
  }

  const data = await readJson(fullPath);
  return placesFromPlaceData(data).map((place) => ({ place, sourceFile }));
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

async function readCoordinateOverrides(): Promise<Map<string, CoordinateOverride>> {
  try {
    const data = await readJson(COORDINATE_OVERRIDES_PATH);
    const list = Array.isArray(data) ? data.filter(isCoordinateOverride) : [];
    return new Map(list.map((override) => [override.id.trim(), override]));
  } catch (error: unknown) {
    const code = hasObjectType(error) ? error.code : undefined;
    if (code === 'ENOENT') return new Map();
    throw error;
  }
}

async function readCategoryOverrides(): Promise<Map<string, CategoryOverride>> {
  try {
    const data = await readJson(CATEGORY_OVERRIDES_PATH);
    const list = Array.isArray(data) ? data.filter(isCategoryOverride) : [];
    return new Map(list.map((override) => [override.id.trim(), { ...override, id: override.id.trim(), category: override.category.trim() }]));
  } catch (error: unknown) {
    const code = hasObjectType(error) ? error.code : undefined;
    if (code === 'ENOENT') return new Map();
    throw error;
  }
}

function applyCoordinateOverride(place: PlaceRow, overrides: Map<string, CoordinateOverride>): PlaceRow {
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

function applyCategoryOverride(place: PlaceRow, overrides: Map<string, CategoryOverride>): PlaceRow {
  const id = typeof place.id === 'string' ? place.id.trim() : '';
  const override = id ? overrides.get(id) : null;
  if (!override) return place;
  return { ...place, category: override.category };
}

async function main(): Promise<void> {
  const manifest = await readJson(MANIFEST_PATH);
  const files = isPlaceManifest(manifest) && Array.isArray(manifest.files) ? manifest.files : [];
  const disabledPlaceIds = await readDisabledPlaceIds();
  const coordinateOverrides = await readCoordinateOverrides();
  const categoryOverrides = await readCategoryOverrides();
  const out: LightPlace[] = [];
  let skipped = 0;

  for (const rel of files) {
    const sourceFile = String(rel || '').trim();
    if (!sourceFile) continue;
    const entries = await loadPlaceEntriesFromManifestEntry(sourceFile);
    for (const { place: rawPlace, sourceFile: actualSourceFile } of entries) {
      assertNoLegacyLng(rawPlace, actualSourceFile);
      const placeWithCoordinates = applyCoordinateOverride(rawPlace, coordinateOverrides);
      const place = applyCategoryOverride(placeWithCoordinates, categoryOverrides);
      const id = typeof place.id === 'string' ? place.id : '';
      if (id && disabledPlaceIds.has(id)) {
        skipped += 1;
        continue;
      }
      out.push(pickLight(place, actualSourceFile));
    }
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  const skippedText = skipped ? `; skipped ${skipped} disabled place(s)` : '';
  const coordinateOverrideText = coordinateOverrides.size ? `; applied ${coordinateOverrides.size} coordinate override(s)` : '';
  const categoryOverrideText = categoryOverrides.size ? `; applied ${categoryOverrides.size} category override(s)` : '';
  console.log(`Wrote ${out.length} places -> ${path.relative(ROOT, OUTPUT_PATH)}${skippedText}${coordinateOverrideText}${categoryOverrideText}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
