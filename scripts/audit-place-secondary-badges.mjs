#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

console.log('=== KLODEN_OSM_NODE_DIAGNOSTIC_BEGIN ===');
try {
  const url = 'https://api.openstreetmap.org/api/0.6/node/13243059793.json';
  const response = await fetch(url, { headers: { 'user-agent': 'History-Go-coordinate-audit/1.0' } });
  const payload = await response.json();
  console.log(JSON.stringify({ url, status: response.status, payload }));
} catch (error) {
  console.log(JSON.stringify({ error: String(error?.stack || error) }));
}
console.log('=== KLODEN_OSM_NODE_DIAGNOSTIC_END ===');

const ROOT = process.cwd();
const PLACES_MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const BADGES_INDEX_PATH = path.join(ROOT, 'data/badges/index.json');

const RUNTIME_ALIASES = new Map([
  ['popkultur', 'populaerkultur'],
  ['populærkultur', 'populaerkultur'],
  ['popular_culture', 'populaerkultur'],
]);

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`JSON parse failed: ${file}`);
    console.error(error.message);
    process.exit(1);
  }
}

function normalizeBadgeId(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return RUNTIME_ALIASES.get(raw) || raw;
}

function badgeIdFromFile(file) {
  const base = path.basename(String(file || ''), '.json');
  return normalizeBadgeId(base);
}

const badgesIndex = readJson(BADGES_INDEX_PATH);
const validBadgeIds = new Set(
  Array.isArray(badgesIndex.files)
    ? badgesIndex.files.map(badgeIdFromFile).filter(Boolean)
    : []
);

if (!validBadgeIds.size) {
  console.error(`${BADGES_INDEX_PATH} must contain badge files`);
  process.exit(1);
}

const manifest = readJson(PLACES_MANIFEST_PATH);
if (!Array.isArray(manifest.files)) {
  console.error(`${PLACES_MANIFEST_PATH} must contain a files array`);
  process.exit(1);
}

const offenders = [];
let checkedPlaces = 0;
let checkedSecondaryLinks = 0;

for (const rel of manifest.files) {
  const file = path.join(ROOT, 'data', rel);
  const data = readJson(file);
  const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);

  for (const [index, place] of places.entries()) {
    if (!place || typeof place !== 'object') continue;
    checkedPlaces += 1;

    const id = String(place.id || '').trim() || `${rel}[${index}]`;
    const primary = normalizeBadgeId(place.category);
    const secondary = place.secondaryBadgeIds;

    if (!primary) {
      offenders.push({ id, file: rel, index, type: 'missing_primary_category', value: place.category });
    } else if (!validBadgeIds.has(primary)) {
      offenders.push({ id, file: rel, index, type: 'invalid_primary_category', value: place.category, normalized: primary });
    }

    if (secondary == null) continue;

    if (!Array.isArray(secondary)) {
      offenders.push({ id, file: rel, index, type: 'secondaryBadgeIds_not_array', value: secondary });
      continue;
    }

    const seen = new Set();
    for (const rawSecondary of secondary) {
      checkedSecondaryLinks += 1;
      const normalized = normalizeBadgeId(rawSecondary);
      if (!normalized) {
        offenders.push({ id, file: rel, index, type: 'empty_secondary_badge', value: rawSecondary });
        continue;
      }
      if (!validBadgeIds.has(normalized)) {
        offenders.push({ id, file: rel, index, type: 'invalid_secondary_badge', value: rawSecondary, normalized });
        continue;
      }
      if (normalized === primary) {
        offenders.push({ id, file: rel, index, type: 'secondary_repeats_primary', value: rawSecondary, normalized });
        continue;
      }
      if (seen.has(normalized)) {
        offenders.push({ id, file: rel, index, type: 'duplicate_secondary_badge', value: rawSecondary, normalized });
        continue;
      }
      seen.add(normalized);
    }
  }
}

if (offenders.length) {
  console.error('Place badge audit failed.');
  for (const offender of offenders) {
    console.error(`- ${offender.id} in ${offender.file}[${offender.index}] type=${offender.type}`);
    if (Object.prototype.hasOwnProperty.call(offender, 'value')) console.error(`  value: ${JSON.stringify(offender.value)}`);
    if (offender.normalized) console.error(`  normalized: ${offender.normalized}`);
  }
  process.exit(1);
}

console.log(`place badge audit ok (${checkedPlaces} places, ${checkedSecondaryLinks} secondary badge links)`);
