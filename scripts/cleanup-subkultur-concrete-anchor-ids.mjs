#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SUBKULTUR_FILE = 'data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json';
const SUBKULTUR_ROOT_FILE = 'data/people/subkultur/oslo/people_subkultur_oslo.json';
const MUSIKK_FILE = 'data/people/musikk/oslo/people_musikk_oslo.json';
const REPORT_FILE = 'reports/subkultur-concrete-anchor-id-cleanup-validation.md';

function readJson(relPath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
  } catch (error) {
    console.error(`JSON parse failed: ${relPath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function writeJson(relPath, data) {
  fs.writeFileSync(path.join(ROOT, relPath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const concrete = readJson(SUBKULTUR_FILE);
const root = readJson(SUBKULTUR_ROOT_FILE);
const musikk = readJson(MUSIKK_FILE);

for (const [file, value] of [[SUBKULTUR_FILE, concrete], [SUBKULTUR_ROOT_FILE, root], [MUSIKK_FILE, musikk]]) {
  if (!Array.isArray(value)) {
    console.error(`${file} must be a JSON array`);
    process.exit(1);
  }
}

const rootIds = new Set(root.map((entry) => entry?.id).filter(Boolean));
const concreteIds = new Set(concrete.map((entry) => entry?.id).filter(Boolean));
const musikkIds = new Set(musikk.map((entry) => entry?.id).filter(Boolean));

for (const required of ['hausmania_miljoet', 'xray_ungdomskulturhus_miljoet', 'bla_miljoet']) {
  if (!rootIds.has(required)) {
    console.error(`Expected stable id ${required} in root subkultur people file.`);
    process.exit(1);
  }
}

for (const required of ['hausmania_miljoet_concrete_anchor', 'xray_ungdomskulturhus_miljoet_concrete_anchor']) {
  if (!concreteIds.has(required)) {
    console.error(`Expected ${required} in concrete anchors file.`);
    process.exit(1);
  }
}

if (!musikkIds.has('bla_miljoet_concrete_anchor')) {
  console.error('Expected bla_miljoet_concrete_anchor in musikk people file after PR #2073.');
  process.exit(1);
}
if (musikkIds.has('bla_miljoet')) {
  console.error('Destination already contains bla_miljoet; refusing duplicate.');
  process.exit(1);
}

const removedHausmania = concrete.find((entry) => entry?.id === 'hausmania_miljoet_concrete_anchor');
const removedXray = concrete.find((entry) => entry?.id === 'xray_ungdomskulturhus_miljoet_concrete_anchor');
const removedOldBla = root.find((entry) => entry?.id === 'bla_miljoet');
const promotedBla = musikk.find((entry) => entry?.id === 'bla_miljoet_concrete_anchor');

const cleanedConcrete = concrete.filter((entry) => ![
  'hausmania_miljoet_concrete_anchor',
  'xray_ungdomskulturhus_miljoet_concrete_anchor',
].includes(entry?.id));

const cleanedRoot = root.filter((entry) => entry?.id !== 'bla_miljoet');
const cleanedMusikk = musikk.map((entry) => entry?.id === 'bla_miljoet_concrete_anchor'
  ? { ...entry, id: 'bla_miljoet' }
  : entry);

writeJson(SUBKULTUR_FILE, cleanedConcrete);
writeJson(SUBKULTUR_ROOT_FILE, cleanedRoot);
writeJson(MUSIKK_FILE, cleanedMusikk);

const report = `# Concrete anchor ID cleanup validation\n\nDato: ${new Date().toISOString()}\n\n## Endringer\n\n- Fjernet duplikatet \`hausmania_miljoet_concrete_anchor\` fordi stabil \`hausmania_miljoet\` allerede finnes.\n- Fjernet duplikatet \`xray_ungdomskulturhus_miljoet_concrete_anchor\` fordi stabil \`xray_ungdomskulturhus_miljoet\` allerede finnes.\n- Fjernet gammel stabil \`bla_miljoet\` fra subkultur-root fordi Blå nå er primær \`musikk\`.\n- Omdøpte musikk-entryen \`bla_miljoet_concrete_anchor\` til stabil \`bla_miljoet\`.\n\n## Verifisert før skriving\n\n- Stabile Hausmania-, X-Ray- og Blå-ID-er fantes i root subkultur-fil.\n- Hausmania- og X-Ray-concrete-anchor-duplikatene fantes i concrete-anchor-filen.\n- Blå concrete-anchor-entryen fantes i musikk-filen.\n- Musikk-filen hadde ikke allerede \`bla_miljoet\`.\n\n## Ikke endret\n\n- Ingen places.\n- Ingen manifests.\n- Ingen place-index.\n- Ingen UI/runtime.\n- Ingen quiz.\n- Ingen andre people-entryer.\n\n## Validering\n\nKjør:\n\n\`\`\`bash\nbash scripts/check-people.sh\n\`\`\`\n\nForventet:\n\n- duplicatePeopleIds = 0\n- invalidPlaceRefs = 0\n- peopleWithoutValidPrimaryAnchor = 0\n- peopleWithEmptyPlacesArray = 0\n\n## Removed duplicate snapshots\n\n- Hausmania: ${removedHausmania?.name || ''} / ${removedHausmania?.placeId || ''}\n- X-Ray: ${removedXray?.name || ''} / ${removedXray?.placeId || ''}\n- Old Blå: ${removedOldBla?.name || ''} / ${removedOldBla?.placeId || ''}\n\n## Stable Blå promotion\n\n- ${promotedBla?.name || ''}: \`bla_miljoet_concrete_anchor\` → \`bla_miljoet\` in \`${MUSIKK_FILE}\`\n`;

fs.writeFileSync(path.join(ROOT, REPORT_FILE), report, 'utf8');

console.log('Removed hausmania_miljoet_concrete_anchor duplicate');
console.log('Removed xray_ungdomskulturhus_miljoet_concrete_anchor duplicate');
console.log('Removed old subkultur bla_miljoet');
console.log('Renamed musikk bla_miljoet_concrete_anchor -> bla_miljoet');
console.log(`Wrote ${REPORT_FILE}`);
