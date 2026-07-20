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

echo "== Place primary/secondary badge audit =="
node scripts/audit-place-secondary-badges.mjs

echo "== Active subkultur place concreteness guard =="
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

function collectText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(collectText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(collectText).join(' ');
  return '';
}

const manifestPath = 'data/places/manifest.json';
const exclusionsPath = 'data/places/place_exclusions.json';
const manifest = readJson(manifestPath);
const exclusions = fs.existsSync(exclusionsPath) ? readJson(exclusionsPath) : {};
const disabledPlaceIds = new Set(Array.isArray(exclusions.disabledPlaceIds) ? exclusions.disabledPlaceIds : []);

const bannedPatterns = [
  /\bakse(n)?\b/i,
  /\bgateakse\b/i,
  /\bveggakse\b/i,
  /\bmurvegger\b/i,
  /\bvegger\b/i,
  /\bveggmilj/i,
  /\bundergang/i,
  /\bpilarrom\b/i,
  /\bpassasje/i,
  /\bbakgardsvegger\b/i,
  /\bbakgårdsvegger\b/i,
  /\bakselpassasjer\b/i,
];

const allowedConcretePlaceTypes = new Set([
  'aktivitetshall',
  'bar',
  'bokhandel',
  'bypark',
  'cafe',
  'kafe',
  'klubb',
  'konsertsted',
  'kulturhus',
  'monument',
  'park',
  'platebutikk',
  'scene',
  'skatehall',
  'skatepark',
  'ungdomshus',
  'ungdomskulturhus',
  'utsiktspunkt',
]);

const offenders = [];
for (const rel of manifest.files) {
  const file = path.join('data', rel);
  const data = readJson(file);
  const places = Array.isArray(data) ? data : (data && Array.isArray(data.places) ? data.places : []);
  for (const [index, place] of places.entries()) {
    if (!place || typeof place !== 'object') continue;
    const id = String(place.id || '').trim();
    if (!id || disabledPlaceIds.has(id)) continue;
    if (place.category !== 'subkultur') continue;

    const joined = [
      id,
      place.name,
      place.desc,
      place.quiz_profile?.place_type,
      place.quiz_profile?.subtype,
      place.coordType,
    ].map(collectText).join(' ');

    const placeType = String(place.quiz_profile?.place_type || '').trim().toLowerCase();
    const explicitConcreteType = allowedConcretePlaceTypes.has(placeType);
    const matched = bannedPatterns.filter((pattern) => pattern.test(joined)).map(String);

    if (matched.length && !explicitConcreteType) {
      offenders.push({ id, file, index, matched, name: place.name || '' });
    }
  }
}

if (offenders.length) {
  console.error('Active hybrid subkultur places found. Concrete History Go places only; add legacy hybrids to data/places/place_exclusions.json or replace them with real named places.');
  for (const offender of offenders) {
    console.error(`- ${offender.id} (${offender.name}) in ${offender.file}[${offender.index}]`);
    console.error(`  matched: ${offender.matched.join(', ')}`);
  }
  process.exit(1);
}

console.log('active subkultur place concreteness ok');
NODE

echo "== Build places index =="
npm run places:index:build

echo "== Place category override contract =="
node tests/place-category-overrides.test.mjs

echo "== Build tools =="
npm run build:tools

echo "== Places index check =="
npm run places:index:check

echo "== Places emne check =="
npm run places:emner:check

echo "== Places coordinate check =="
npm run places:coords:check

echo "== Places check complete =="
