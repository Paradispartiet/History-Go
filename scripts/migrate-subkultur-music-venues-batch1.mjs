#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_FILE = path.join(ROOT, 'data/places/subkultur/oslo/places_subkultur.json');
const REPORT_FILE = path.join(ROOT, 'reports/subkultur-music-venues-batch1-validation.md');

const TARGETS = new Map([
  ['bla', {
    name: 'Blå',
    rationale: 'Konsert-, klubb-, jazz- og elektronika-arena; primært musikksted, med tydelig undergrunns-/klubbkultur som sekundær subkulturkobling.',
  }],
  ['revolver_oslo', {
    name: 'Revolver Oslo',
    rationale: 'Konsert-, klubb- og utelivssted; primært musikk-/venue-infrastruktur, med undergrunnsprofil som sekundær subkulturkobling.',
  }],
  ['the_villa', {
    name: 'The Villa',
    rationale: 'Elektronisk klubb, DJ-kultur og dansegulv; primært musikksted, med rave-/klubbkultur som sekundær subkulturkobling.',
  }],
  ['jaeger_oslo', {
    name: 'Jæger Oslo',
    rationale: 'Elektronisk klubb, DJ-kultur og bakgårdsscene; primært musikksted, med klubbkultur som sekundær subkulturkobling.',
  }],
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

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean))];
}

const places = readJson(TARGET_FILE);
if (!Array.isArray(places)) {
  console.error(`${TARGET_FILE} must be a JSON array`);
  process.exit(1);
}

const seen = new Set();
const changed = [];
const skipped = [];

for (const place of places) {
  if (!place || typeof place !== 'object') continue;
  const id = String(place.id || '').trim();
  if (!TARGETS.has(id)) continue;

  seen.add(id);
  const beforeCategory = place.category;
  const beforeSecondary = Array.isArray(place.secondaryBadgeIds) ? [...place.secondaryBadgeIds] : [];

  if (beforeCategory !== 'subkultur') {
    skipped.push({ id, reason: `expected category subkultur, found ${JSON.stringify(beforeCategory)}` });
    continue;
  }

  place.category = 'musikk';
  place.secondaryBadgeIds = uniqueStrings([...beforeSecondary, 'subkultur']);

  changed.push({
    id,
    name: place.name || TARGETS.get(id).name,
    beforeCategory,
    afterCategory: place.category,
    beforeSecondary,
    afterSecondary: place.secondaryBadgeIds,
    rationale: TARGETS.get(id).rationale,
  });
}

for (const id of TARGETS.keys()) {
  if (!seen.has(id)) skipped.push({ id, reason: 'not found in target file' });
}

if (changed.length !== TARGETS.size) {
  console.error(`Expected to change ${TARGETS.size} places, changed ${changed.length}.`);
  for (const item of skipped) console.error(`- skipped ${item.id}: ${item.reason}`);
  process.exit(1);
}

writeJson(TARGET_FILE, places);

const now = new Date().toISOString();
const rows = changed.map((item) => `| \`${item.id}\` | ${item.name} | \`${item.beforeCategory}\` | \`${item.afterCategory}\` | \`${JSON.stringify(item.afterSecondary)}\` | ${item.rationale} |`).join('\n');

const report = `# Subkultur → musikk venues cleanup batch 1 validation\n\nDato: ${now}\n\n## Scope\n\nDenne migreringen flytter fire rene musikk-/venue-/klubbsteder fra primær \`subkultur\` til primær \`musikk\`, med \`secondaryBadgeIds: [\"subkultur\"]\` for å beholde reell undergrunns-/klubbkulturkobling.\n\nDette følger primær-/sekundærbadge-modellen fra PR #2057 og audit-anbefalingen fra PR #2061.\n\n## Endrede places\n\n| placeId | name | før | etter | secondaryBadgeIds | begrunnelse |\n|---|---|---|---|---|---|\n${rows}\n\n## Ikke endret\n\n- Ingen people-filer.\n- Ingen manifest-filer.\n- Ingen UI/runtime-filer.\n- Ingen nye places.\n- Ingen hybridsteder.\n- Ingen deaktivert place i \`place_exclusions.json\`.\n\n## Påkrevde kommandoer etter migrering\n\n\`\`\`bash\nnpm run places:index:build\nbash scripts/check-places.sh\n\`\`\`\n\nForventet:\n\n- Place primary/secondary badge audit ok.\n- Active subkultur place concreteness guard ok.\n- Places index sync ok etter regenerering.\n- Ingen ugyldige sekundærbadges.\n`;

fs.writeFileSync(REPORT_FILE, report, 'utf8');

console.log(`Updated ${changed.length} places in ${path.relative(ROOT, TARGET_FILE)}`);
console.log(`Wrote ${path.relative(ROOT, REPORT_FILE)}`);
