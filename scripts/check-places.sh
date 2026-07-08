#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Places JSON parse =="
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

const manifestPath = 'data/places/manifest.json';
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

echo "== Build places index =="
npm run places:index:build

echo "== Build tools =="
npm run build:tools

echo "== Places index check =="
npm run places:index:check

echo "== Places emne check =="
npm run places:emner:check

echo "== Places coordinate check =="
npm run places:coords:check

echo "== Places check complete =="
