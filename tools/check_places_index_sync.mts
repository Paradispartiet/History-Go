#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

type JsonObject = Record<string, unknown>;
type PlaceManifest = JsonObject & {
  files?: unknown[];
};
type PlaceRow = JsonObject & {
  id?: unknown;
  name?: unknown;
  lat?: unknown;
  lon?: unknown;
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
];

const MAX_DIFFS = 20;

function hasObjectType(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object';
}

function isJsonObject(value: unknown): value is JsonObject {
  return hasObjectType(value) && !Array.isArray(value);
}

function isPlaceManifest(value: unknown): value is PlaceManifest {
  return isJsonObject(value) && (!Object.prototype.hasOwnProperty.call(value, 'files') || Array.isArray(value.files));
}

function isPlaceRow(value: unknown): value is PlaceRow {
  return isJsonObject(value);
}

function pickLight(place: PlaceRow): LightPlace {
  const out: LightPlace = {};
  for (const key of LIGHT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(place, key)) out[key] = place[key];
  }
  return out;
}

async function readJson(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
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

    if (expectedEntry[key] !== actualEntry[key]) {
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
  const out: LightPlace[] = [];

  for (const rel of files) {
    const fullPath = path.join(ROOT, 'data', rel as string);
    const data = await readJson(fullPath);
    const places = Array.isArray(data) ? data : (isJsonObject(data) && Array.isArray(data.places) ? data.places : []);

    for (const place of places) {
      if (!isPlaceRow(place)) continue;
      out.push(pickLight(place));
    }
  }

  return out;
}

async function main(): Promise<void> {
  const expectedIndex = await buildExpectedIndex();
  const actualIndex = await readJson(ACTUAL_INDEX_PATH);

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

  console.log('places_index.json is in sync with source place files.');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('places_index sync check failed.');
  console.error(err);
  process.exit(1);
});
