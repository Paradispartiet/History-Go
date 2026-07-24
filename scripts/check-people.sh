#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== People JSON parse and duplicate ID check =="
node <<'NODE'
const fs = require('fs');
const path = require('path');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`JSON parse failed: ${file}`);
    console.error(error.message);
    process.exit(1);
  }
}

const manifestPath = 'data/people/manifest.json';
const placesIndexPath = 'data/places/places_index.json';
const manifest = readJson(manifestPath);

if (!manifest || !Array.isArray(manifest.files)) {
  console.error(`${manifestPath} must contain a files array`);
  process.exit(1);
}

const supportFiles = [manifestPath, placesIndexPath];
const peopleFiles = manifest.files.map((file) => path.join('data', file));
const files = [...supportFiles, ...peopleFiles];
const seenPeopleIds = new Map();
const duplicatePeopleIds = [];
let peopleCount = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`Missing expected file: ${file}`);
    process.exit(1);
  }

  const data = readJson(file);
  if (!peopleFiles.includes(file)) continue;

  const entries = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
      ? [data]
      : null;

  if (!entries) {
    console.error(`People file must contain an object or array: ${file}`);
    process.exit(1);
  }

  for (const [index, entry] of entries.entries()) {
    peopleCount += 1;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      console.error(`Invalid people entry at ${file}[${index}]`);
      process.exit(1);
    }

    if (typeof entry.id !== 'string' || !entry.id.trim()) {
      console.error(`Missing people id at ${file}[${index}]`);
      process.exit(1);
    }

    const previous = seenPeopleIds.get(entry.id);
    if (previous) {
      duplicatePeopleIds.push({ id: entry.id, first: previous, second: `${file}[${index}]` });
    } else {
      seenPeopleIds.set(entry.id, `${file}[${index}]`);
    }
  }
}

if (duplicatePeopleIds.length > 0) {
  console.error('Duplicate people IDs found:');
  for (const duplicate of duplicatePeopleIds) {
    console.error(`- ${duplicate.id}`);
    console.error(`  first:  ${duplicate.first}`);
    console.error(`  second: ${duplicate.second}`);
  }
  process.exit(1);
}

console.log(`json ok (${files.length} files)`);
console.log(`people ids ok (${peopleCount} entries, ${seenPeopleIds.size} unique ids)`);
NODE

echo "== Build tools =="
npm run build:tools

echo "== People invalid place refs =="
node dist/tools/audit-people-invalid-place-refs.mjs

echo "== People of places status =="
node dist/tools/audit-people-of-places-status.mjs

echo "== People place coverage =="
node dist/tools/audit-people-place-coverage.mjs

# Civication leser personene via en generert kategoriindeks. Nye/endrede
# personer krever regenerering: npm run civication:history-people:build
echo "== Civication history people index sync =="
npm run civication:history-people:check

echo "== Etne people manifest integration =="
node tests/etne-people-manifest-integration.test.js

echo "== Etne People of Places batch 9 =="
node tests/etne-people-of-places-batch9.test.js

echo "== Etne People of Places batch 10 =="
node tests/etne-people-of-places-batch10.test.js

echo "== Etne People of Places batch 11 =="
node tests/etne-people-of-places-batch11.test.js

echo "== Etne People of Places batch 12 =="
node tests/etne-people-of-places-batch12.test.js

echo "== Etne People of Places batch 13 =="
node tests/etne-people-of-places-batch13.test.js

echo "== Etne People of Places batch 14 =="
node tests/etne-people-of-places-batch14.test.js

echo "== Etne People of Places batch 15 =="
node tests/etne-people-of-places-batch15.test.js

echo "== Etne People of Places batch 16 =="
node tests/etne-people-of-places-batch16.test.js

echo "== Etne People of Places batch 17 =="
node tests/etne-people-of-places-batch17.test.js

echo "== Etne People of Places batch 18 =="
node tests/etne-people-of-places-batch18.test.js

# Batch 19 validation output: reports/etne-people-of-places-batch19/
echo "== Etne People of Places batch 19 =="
node tests/etne-people-of-places-batch19.test.js

# Batch 20 validation output: reports/etne-people-of-places-batch20/
echo "== Etne People of Places batch 20 =="
node tests/etne-people-of-places-batch20.test.js

# Batch 21 validation output: reports/etne-people-of-places-batch21/
echo "== Etne People of Places batch 21 =="
node tests/etne-people-of-places-batch21.test.js

# Batch 22 stored validation output: reports/etne-people-of-places-batch22/
echo "== Etne People of Places batch 22 =="
node tests/etne-people-of-places-batch22.test.js

echo "== Etne People of Places batch 23 =="
node tests/etne-people-of-places-batch23.test.js

echo "== Etne People of Places batch 24 =="
node tests/etne-people-of-places-batch24.test.js

echo "== Etne People of Places batch 25 =="
node tests/etne-people-of-places-batch25.test.js

echo "== Etne People of Places batch 26 =="
node tests/etne-people-of-places-batch26.test.js

echo "== Oslo politics People full coverage =="
node tests/oslo-politikk-people-full-coverage.test.js

echo "== Oslo politics remaining-place expansion =="
node tests/oslo-politikk-remaining-people-expansion.test.js

echo "== People check complete =="
