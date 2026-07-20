#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_ID = 'gamle_radhus';
const SELF = path.join(ROOT, 'scripts/gamle-radhus-people-finalizer.mjs');
const MANIFEST_FILE = path.join(ROOT, 'data/people/manifest.json');
const HANNIBAL_FILE = path.join(ROOT, 'data/people/historie/oslo/akershus_festning/hannibal_sehested.json');
const REPORT_FILE = path.join(ROOT, 'reports/people-gamle-radhus-batch1-validation.md');

const NEW_FILES = [
  ['people/historie/oslo/gamle_radhus/lauritz_hansen.json', {
    id: 'lauritz_hansen',
    name: 'Lauritz Hansen',
    initials: 'LH',
    desc: 'Rådmann som ledet oppføringen av Christianias gamle rådhus, ferdigstilt i 1641.',
    tags: ['historie', 'byhistorie', 'radhus', 'arkitekturhistorie', 'christiania', '1600_tallet'],
    placeId: PLACE_ID,
    category: 'historie',
    year: 1641,
    popupDesc: 'Lauritz Hansen er et direkte personanker for Gamle rådhus fordi kildene dokumenterer at rådmannen ledet byggingen av rådhuset som stod ferdig i 1641. Koblingen er dermed til selve oppføringen av bygningen, ikke bare til Christianias generelle bystyre eller 1600-tallshistorie.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [
      'https://sceneweb.no/nb/venue/31901/Gamle_Raadhus%20Scene%20%2F%20R%C3%A5dhussalen%2C%20Oslo',
      'https://oslobyleksikon.no/side/Nedre_Slottsgate'
    ]
  }],
  ['people/by/oslo/gamle_radhus/lars_backer.json', {
    id: 'lars_backer',
    name: 'Lars Backer',
    initials: 'LB',
    desc: 'Arkitekt som utarbeidet restaureringsplanen for Gamle rådhus i 1917.',
    tags: ['by', 'arkitektur', 'restaurering', 'kulturminne', 'gamle_radhus', '1910_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1917,
    popupDesc: 'Lars Backer er et direkte arkitekturanker for Gamle rådhus fordi Oslo byleksikon dokumenterer at bygningen fikk innvendige dekorasjoner og utvendig tak og gavler i gammel stil etter hans plan fra 1917. Entryen forankrer Backer i et konkret restaureringsarbeid på selve bygningen.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: ['https://oslobyleksikon.no/side/Nedre_Slottsgate']
  }],
  ['people/by/oslo/gamle_radhus/carl_berner_arkitekt.json', {
    id: 'carl_berner_arkitekt',
    name: 'Carl Berner (arkitekt)',
    initials: 'CB',
    desc: 'Arkitekt kreditert som en av arkitektene bak restaurantinteriøret i Gamle rådhus fra 1926.',
    tags: ['by', 'arkitektur', 'interiorarkitektur', 'restaurering', 'gamle_radhus', '1920_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1926,
    popupDesc: 'Carl Berner, arkitekten født i 1877, er et direkte interiøranker for Gamle rådhus. Oslo kommune krediterer ham som en av arkitektene bak restaurantinteriøret fra 1926, som senere ble gjenskapt etter brannen i 1996. Den særskilte ID-en skiller ham fra politikeren Carl Berner, som allerede finnes som en annen canonical person i History Go.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/gamle-radhus/',
      'https://snl.no/Carl_Berner_-_arkitekt'
    ]
  }],
  ['people/musikk/oslo/gamle_radhus/gjoril_songvoll.json', {
    id: 'gjoril_songvoll',
    name: 'Gjøril Songvoll',
    initials: 'GS',
    desc: 'Operasanger, produsent og leder i Opera til folket med direkte scene- og driftskobling til Gamle Raadhus Scene.',
    tags: ['musikk', 'opera', 'scenekunst', 'produsent', 'kulturleder', 'gamle_raadhus_scene', 'opera_til_folket'],
    placeId: PLACE_ID,
    category: 'musikk',
    year: 2014,
    popupDesc: 'Gjøril Songvoll er et direkte moderne sceneanker for Gamle rådhus. Gamle Raadhus Scene gjenåpnet i 2014 med Opera til folket som operatør, og Songvoll er dokumentert både som leder for operavirksomheten og som utøver på selve scenen i 2014. Koblingen gjelder derfor konkret virksomhet i bygningen, ikke bare en generell Oslo-operaassosiasjon.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [
      'https://sceneweb.no/nb/venue/31901/Gamle_Raadhus%20Scene%20%2F%20R%C3%A5dhussalen%2C%20Oslo',
      'https://www.operabase.com/productions/opera-stand-up-opera-politikk-og-fred-og-sant-459834/en'
    ]
  }]
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function collectRows(value, out = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectRows(item, out);
  } else if (value && typeof value === 'object') {
    if (typeof value.id === 'string') out.push(value);
    else for (const child of Object.values(value)) collectRows(child, out);
  }
  return out;
}

const manifest = readJson(MANIFEST_FILE);
if (!Array.isArray(manifest.files)) throw new Error('data/people/manifest.json must contain files[]');

// Repo-wide canonical ID gate using every manifest-registered people file.
const existingIds = new Map();
for (const rel of manifest.files) {
  const file = path.join(ROOT, 'data', rel);
  if (!fs.existsSync(file)) throw new Error(`Manifest file missing: data/${rel}`);
  for (const row of collectRows(readJson(file))) {
    if (existingIds.has(row.id)) throw new Error(`Existing duplicate people id before batch: ${row.id}`);
    existingIds.set(row.id, rel);
  }
}

for (const [, person] of NEW_FILES) {
  if (existingIds.has(person.id)) throw new Error(`Candidate already exists: ${person.id} in ${existingIds.get(person.id)}`);
}

for (const [rel, person] of NEW_FILES) {
  const abs = path.join(ROOT, 'data', rel);
  if (fs.existsSync(abs)) throw new Error(`Target people file already exists: data/${rel}`);
  writeJson(abs, [person]);
  if (!manifest.files.includes(rel)) manifest.files.push(rel);
}
writeJson(MANIFEST_FILE, manifest);

// Reuse Hannibal Sehested's canonical record; do not create a duplicate.
const hannibalRows = readJson(HANNIBAL_FILE);
if (!Array.isArray(hannibalRows)) throw new Error('Hannibal Sehested file must be an array');
const hannibal = hannibalRows.find((row) => row?.id === 'hannibal_sehested');
if (!hannibal) throw new Error('Canonical hannibal_sehested record not found');
if (!Array.isArray(hannibal.places)) hannibal.places = [hannibal.placeId].filter(Boolean);
if (!hannibal.places.includes(PLACE_ID)) hannibal.places.push(PLACE_ID);
if (!Array.isArray(hannibal.tags)) hannibal.tags = [];
if (!hannibal.tags.includes('gamle_radhus')) hannibal.tags.push('gamle_radhus');
hannibal.popupDesc = 'Hannibal Sehested ble i 1642 stattholder i Norge, høvedsmann på Akershus og lensherre i Akershus len. Han bodde på Akershus som stattholder, og omfattende arbeider ble utført mens slottet og festningen ble modernisert under Christian IV. Akershus var dermed et direkte sentrum for Sehesteds forsøk på å samle administrativ, økonomisk og militær makt i Norge. I de første årene etter at Gamle rådhus stod ferdig i 1641 hadde også Sehesteds generalkommissariat kontorer i bygningen, som derfor legges til som en dokumentert sekundær stedstilknytning.';
hannibal.source_urls = Array.from(new Set([
  ...(Array.isArray(hannibal.source_urls) ? hannibal.source_urls : []),
  'https://lokalhistoriewiki.no/Gamle_r%C3%A5dhus_(Oslo)'
]));
writeJson(HANNIBAL_FILE, hannibalRows);

const report = `# People of Places — Gamle rådhus batch 1\n\nDato: 2026-07-20\n\n## Resultat\n\nFire nye canonical personer og én gjenbrukt canonical person kobles til \`${PLACE_ID}\`.\n\n### Nye personer\n\n- \`lauritz_hansen\` — ledet oppføringen av rådhuset, ferdig 1641.\n- \`lars_backer\` — dokumentert restaureringsplan fra 1917.\n- \`carl_berner_arkitekt\` — kreditert av Oslo kommune for restaurantinteriøret fra 1926; særskilt ID brukes fordi \`carl_berner\` allerede er en annen canonical person.\n- \`gjoril_songvoll\` — dokumentert moderne scene-/operatørkobling og opptreden på Gamle Raadhus Scene.\n\n### Gjenbrukt person\n\n- \`hannibal_sehested\` beholder \`akershus_festning\` som primæranker og får \`gamle_radhus\` i \`places\`, fordi generalkommissariatet hans hadde kontorer i bygningen i de første årene etter oppføringen.\n\n## Stedsgate\n\nAlle fem relasjonene gjelder selve bygningen gjennom bygging, administrativ bruk, restaurering, interiørarbeid eller dokumentert scenevirksomhet. Løse Christiania-/Oslo-assosiasjoner er ikke brukt.\n\n## Kilder\n\n- Oslo kommune — Gamle Rådhus.\n- Oslo byleksikon — Nedre Slottsgate 1.\n- Sceneweb — Gamle Raadhus Scene / Rådhussalen.\n- Norsk kunstnerleksikon / SNL — Carl Berner (arkitekt).\n- Lokalhistoriewiki — Gamle rådhus (Oslo), for Hannibal Sehesteds generalkommissariat.\n- Operabase — dokumentert Gjøril Songvoll-opptreden på Gamle Raadhus Scene i 2014.\n\n## Valideringsgate\n\nFinalizeren skal etter materialisering kjøre \`bash scripts/check-people.sh\` og \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

// One-shot job: remove itself before the workflow commits the materialized state.
fs.rmSync(SELF);

console.log('Materialized Gamle rådhus People of Places batch 1.');
console.log('Created 4 canonical people files, updated Hannibal Sehested and registered the new files.');
