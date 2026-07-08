#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== People JSON parse =="
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

const files = [manifestPath, placesIndexPath, ...manifest.files.map((file) => path.join('data', file))];
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`Missing expected file: ${file}`);
    process.exit(1);
  }
  readJson(file);
}

console.log(`json ok (${files.length} files)`);
NODE

echo "== Build tools =="
npm run build:tools

echo "== People invalid place refs =="
node dist/tools/audit-people-invalid-place-refs.mjs

echo "== People of places status =="
node dist/tools/audit-people-of-places-status.mjs

echo "== People place coverage =="
node dist/tools/audit-people-place-coverage.mjs

echo "== People check complete =="
