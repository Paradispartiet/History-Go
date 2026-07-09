#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const SOURCE_FILES = [
  'data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json',
  'data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json',
];
const DEST_FILE = 'data/people/musikk/oslo/people_musikk_oslo.json';
const REPORT_FILE = 'reports/subkultur-music-people-batch1-validation.md';

const TARGETS = new Map([
  ['revolver_oslo_miljoet', {
    sourceFile: 'data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json',
    rationale: 'Revolver-miljøet er knyttet til et sted som batch 1 flyttet til primær musikk; entryen handler primært om konsert-, klubb- og musikkmiljø.',
  }],
  ['the_villa_miljoet', {
    sourceFile: 'data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json',
    rationale: 'The Villa-miljøet er elektronisk klubb-/DJ-/dansegulvsmiljø og følger place-flyttingen til primær musikk.',
  }],
  ['jaeger_oslo_miljoet', {
    sourceFile: 'data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json',
    rationale: 'Jæger-miljøet er elektronisk klubb-/DJ-miljø og følger place-flyttingen til primær musikk.',
  }],
  ['bla_miljoet_concrete_anchor', {
    sourceFile: 'data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json',
    rationale: 'Blå-miljøet er konsert-, klubb-, jazz- og elektronika-miljø og følger place-flyttingen til primær musikk.',
  }],
]);

function readJson(relPath) {
  const file = path.join(ROOT, relPath);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`JSON parse failed: ${relPath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function writeJson(relPath, data) {
  fs.writeFileSync(path.join(ROOT, relPath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean))];
}

function toMusikkEntry(entry) {
  const next = { ...entry };
  next.category = 'musikk';
  next.tags = uniqueStrings(['musikk', ...next.tags.filter((tag) => tag !== 'subkultur'), 'subkultur']);
  next.popupDesc = `${entry.popupDesc}\n\nBadge-rydding: Dette miljøankeret er flyttet til primær musikk fordi hovedankeret er et musikk-/klubb-/venue-miljø. Subkultur beholdes som tag fordi undergrunns- og klubbkultur fortsatt er relevant.`;
  return next;
}

const dest = readJson(DEST_FILE);
if (!Array.isArray(dest)) {
  console.error(`${DEST_FILE} must be a JSON array`);
  process.exit(1);
}

const existingDestIds = new Set(dest.map((entry) => entry && entry.id).filter(Boolean));
for (const id of TARGETS.keys()) {
  if (existingDestIds.has(id)) {
    console.error(`Destination already contains ${id}; refusing duplicate.`);
    process.exit(1);
  }
}

const moved = [];
const updatedSources = new Map();

for (const relPath of SOURCE_FILES) {
  const entries = readJson(relPath);
  if (!Array.isArray(entries)) {
    console.error(`${relPath} must be a JSON array`);
    process.exit(1);
  }

  const kept = [];
  for (const entry of entries) {
    if (!entry || !TARGETS.has(entry.id)) {
      kept.push(entry);
      continue;
    }

    const target = TARGETS.get(entry.id);
    if (target.sourceFile !== relPath) {
      console.error(`${entry.id} found in ${relPath}, expected ${target.sourceFile}`);
      process.exit(1);
    }
    if (entry.category !== 'subkultur') {
      console.error(`${entry.id} expected category subkultur, found ${JSON.stringify(entry.category)}`);
      process.exit(1);
    }

    const musikkEntry = toMusikkEntry(entry);
    dest.push(musikkEntry);
    moved.push({
      id: entry.id,
      name: entry.name,
      placeId: entry.placeId,
      sourceFile: relPath,
      destFile: DEST_FILE,
      beforeCategory: entry.category,
      afterCategory: musikkEntry.category,
      rationale: target.rationale,
    });
  }

  updatedSources.set(relPath, kept);
}

for (const id of TARGETS.keys()) {
  if (!moved.some((entry) => entry.id === id)) {
    console.error(`Target not found: ${id}`);
    process.exit(1);
  }
}

for (const [relPath, entries] of updatedSources.entries()) writeJson(relPath, entries);
writeJson(DEST_FILE, dest);

const rows = moved.map((entry) => `| \`${entry.id}\` | ${entry.name} | \`${entry.placeId}\` | \`${entry.beforeCategory}\` | \`${entry.afterCategory}\` | ${entry.rationale} |`).join('\n');
const report = `# Subkultur → musikk people cleanup batch 1 validation\n\nDato: ${new Date().toISOString()}\n\n## Scope\n\nDenne migreringen flytter fire kollektive venue-/klubb-/musikkmiljøankre fra primær \`subkultur\` til primær \`musikk\`, etter at de tilsvarende place-ankrene ble flyttet i PR #2068.\n\nDette er people-opprydding, ikke ny research og ikke ny dataproduksjon.\n\n## Flyttede entries\n\n| peopleId | name | placeId | før | etter | begrunnelse |\n|---|---|---|---|---|---|\n${rows}\n\n## Filer endret av migreringen\n\n- \`data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json\`\n- \`data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json\`\n- \`data/people/musikk/oslo/people_musikk_oslo.json\`\n\n## Ikke endret\n\n- Ingen place-filer.\n- Ingen manifests.\n- Ingen places_index.\n- Ingen UI/runtime.\n- Ingen quiz.\n- Ingen hybridsteder.\n- Ingen Blitzhuset/Hausmania/X-Ray/Torggata Blad-miljøer flyttet.\n\n## Validering\n\nKjør:\n\n\`\`\`bash\nbash scripts/check-people.sh\n\`\`\`\n\nForventet:\n\n- duplicatePeopleIds = 0\n- invalidPlaceRefs = 0\n- peopleWithoutValidPrimaryAnchor = 0\n- peopleWithEmptyPlacesArray = 0\n`;

fs.writeFileSync(path.join(ROOT, REPORT_FILE), report, 'utf8');

console.log(`Moved ${moved.length} people entries to ${DEST_FILE}`);
console.log(`Wrote ${REPORT_FILE}`);
