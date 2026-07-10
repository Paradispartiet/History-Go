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

if (!rootIds.has('hausmania_miljoet')) {
  console.error('Expected stable id hausmania_miljoet in root subkultur people file.');
  process.exit(1);
}
if (!concreteIds.has('hausmania_miljoet_concrete_anchor')) {
  console.error('Expected duplicate hausmania_miljoet_concrete_anchor in concrete anchors file.');
  process.exit(1);
}
if (!concreteIds.has('xray_ungdomskulturhus_miljoet_concrete_anchor')) {
  console.error('Expected xray_ungdomskulturhus_miljoet_concrete_anchor in concrete anchors file.');
  process.exit(1);
}
if (rootIds.has('xray_ungdomskulturhus_miljoet') || concreteIds.has('xray_ungdomskulturhus_miljoet') || musikkIds.has('xray_ungdomskulturhus_miljoet')) {
  console.error('Stable xray_ungdomskulturhus_miljoet already exists; refusing rename.');
  process.exit(1);
}
if (!musikkIds.has('bla_miljoet_concrete_anchor')) {
  console.error('Expected bla_miljoet_concrete_anchor in musikk people file after PR #2073.');
  process.exit(1);
}
if (rootIds.has('bla_miljoet') || concreteIds.has('bla_miljoet') || musikkIds.has('bla_miljoet')) {
  console.error('Stable bla_miljoet already exists; refusing rename.');
  process.exit(1);
}

const removedHausmania = concrete.find((entry) => entry?.id === 'hausmania_miljoet_concrete_anchor');
const xray = concrete.find((entry) => entry?.id === 'xray_ungdomskulturhus_miljoet_concrete_anchor');
const bla = musikk.find((entry) => entry?.id === 'bla_miljoet_concrete_anchor');

const cleanedConcrete = concrete
  .filter((entry) => entry?.id !== 'hausmania_miljoet_concrete_anchor')
  .map((entry) => entry?.id === 'xray_ungdomskulturhus_miljoet_concrete_anchor'
    ? { ...entry, id: 'xray_ungdomskulturhus_miljoet' }
    : entry);

const cleanedMusikk = musikk.map((entry) => entry?.id === 'bla_miljoet_concrete_anchor'
  ? { ...entry, id: 'bla_miljoet' }
  : entry);

writeJson(SUBKULTUR_FILE, cleanedConcrete);
writeJson(MUSIKK_FILE, cleanedMusikk);

const report = `# Concrete anchor ID cleanup validation\n\nDato: ${new Date().toISOString()}\n\n## Endringer\n\n- Fjernet duplikatet \`hausmania_miljoet_concrete_anchor\` fordi stabil \`hausmania_miljoet\` allerede finnes i \`${SUBKULTUR_ROOT_FILE}\`.\n- Omdøpte \`xray_ungdomskulturhus_miljoet_concrete_anchor\` til stabil \`xray_ungdomskulturhus_miljoet\`.\n- Omdøpte \`bla_miljoet_concrete_anchor\` til stabil \`bla_miljoet\` i musikk-people-filen.\n\n## Verifisert før skriving\n\n- Stabil Hausmania-ID finnes.\n- Stabil X-Ray-ID fantes ikke fra før.\n- Stabil Blå-ID fantes ikke fra før.\n- Alle tre source-ID-er fantes i forventet fil.\n\n## Ikke endret\n\n- Ingen places.\n- Ingen manifests.\n- Ingen place-index.\n- Ingen UI/runtime.\n- Ingen quiz.\n- Ingen andre people-entryer.\n\n## Validering\n\nKjør:\n\n\`\`\`bash\nbash scripts/check-people.sh\n\`\`\`\n\nForventet:\n\n- duplicatePeopleIds = 0\n- invalidPlaceRefs = 0\n- peopleWithoutValidPrimaryAnchor = 0\n- peopleWithEmptyPlacesArray = 0\n\n## Removed duplicate snapshot\n\n- name: ${removedHausmania?.name || ''}\n- placeId: ${removedHausmania?.placeId || ''}\n\n## Renamed entries\n\n- ${xray?.name || ''}: \`xray_ungdomskulturhus_miljoet_concrete_anchor\` → \`xray_ungdomskulturhus_miljoet\`\n- ${bla?.name || ''}: \`bla_miljoet_concrete_anchor\` → \`bla_miljoet\`\n`;

fs.writeFileSync(path.join(ROOT, REPORT_FILE), report, 'utf8');

console.log('Removed hausmania_miljoet_concrete_anchor duplicate');
console.log('Renamed xray_ungdomskulturhus_miljoet_concrete_anchor -> xray_ungdomskulturhus_miljoet');
console.log('Renamed bla_miljoet_concrete_anchor -> bla_miljoet');
console.log(`Wrote ${REPORT_FILE}`);
