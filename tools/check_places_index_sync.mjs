#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const ACTUAL_INDEX_PATH = path.join(ROOT, 'data/places/places_index.json');

const LIGHT_FIELDS = [
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
];

const MAX_DIFFS = 20;

function pickLight(place) {
  const out = {};
  for (const key of LIGHT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(place, key)) out[key] = place[key];
  }
  return out;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function formatValue(value) {
  if (value === undefined) return 'undefined';
  return JSON.stringify(value);
}

function compareEntries(expectedEntry, actualEntry, idx, diffs) {
  const expectedId = expectedEntry && typeof expectedEntry === 'object' ? expectedEntry.id : undefined;
  const actualId = actualEntry && typeof actualEntry === 'object' ? actualEntry.id : undefined;
  const placeId = expectedId ?? actualId;

  if (!actualEntry || typeof actualEntry !== 'object' || Array.isArray(actualEntry)) {
    diffs.push({
      idx,
      placeId,
      type: 'invalid_actual_entry',
      expected: expectedEntry,
      actual: actualEntry,
    });
    return;
  }

  if (!expectedEntry || typeof expectedEntry !== 'object' || Array.isArray(expectedEntry)) {
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

async function buildExpectedIndex() {
  const manifest = await readJson(MANIFEST_PATH);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  const out = [];

  for (const rel of files) {
    const fullPath = path.join(ROOT, 'data', rel);
    const data = await readJson(fullPath);
    const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);

    for (const place of places) {
      if (!place || typeof place !== 'object') continue;
      out.push(pickLight(place));
    }
  }

  return out;
}

async function main() {
  const expectedIndex = await buildExpectedIndex();
  const actualIndex = await readJson(ACTUAL_INDEX_PATH);

  const diffs = [];

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

main().catch((err) => {
  console.error('places_index sync check failed.');
  console.error(err);
  process.exit(1);
});
