#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_ID = 'helsfyr';
const SELF = path.join(ROOT, 'scripts/helsfyr-people-finalizer.mjs');
const MANIFEST_FILE = path.join(ROOT, 'data/people/manifest.json');
const REPORT_FILE = path.join(ROOT, 'reports/people-helsfyr-batch1-validation.md');

const NEW_FILES = [
  ['people/by/oslo/helsfyr/guttorm_bruskeland.json', {
    id: 'guttorm_bruskeland',
    name: 'Guttorm Bruskeland',
    initials: 'GB',
    desc: 'Arkitekt for Helsfyr T-banestasjon, åpnet som del av østbanenettet i 1966.',
    tags: ['by', 'arkitektur', 't_bane', 'kollektivtransport', 'infrastruktur', 'helsfyr', '1960_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1966,
    popupDesc: 'Guttorm Bruskeland er et direkte arkitekturanker for Helsfyr fordi Sporveien oppgir ham som arkitekt for T-banestasjonen som åpnet i 1966. Koblingen gjelder selve stasjonsanlegget som fungerer som History Gos representative anker for Helsfyr-knutepunktet, ikke en løs tilknytning til Oslo øst.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: ['https://www.sporveien.no/vare-tjenester/t-banen/t-banestasjoner/f/helsfyr/']
  }],
  ['people/kunst/oslo/helsfyr/katrine_giaever.json', {
    id: 'katrine_giaever',
    name: 'Katrine Giæver',
    initials: 'KG',
    desc: 'Kunstneren bak den permanente stasjonsutsmykningen «Å samle på farger» på Helsfyr.',
    tags: ['kunst', 'offentlig_kunst', 't_bane', 'stasjonskunst', 'helsfyr', 'stucco_lustro', 'samtidskunst'],
    placeId: PLACE_ID,
    category: 'kunst',
    year: 2019,
    popupDesc: 'Katrine Giæver er et direkte kunstanker for Helsfyr fordi hennes verk «Å samle på farger» er integrert i vestre og østre inngang på T-banestasjonen. Sporveien dokumenterer utsmykningen som del av stasjonsoppgraderingen og oppgir verket til 260 kvadratmeter i Stucco Lustro. Koblingen er dermed fysisk og varig på selve stedet.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.sporveien.no/vare-tjenester/t-banen/t-banestasjoner/f/helsfyr/',
      'https://www.mynewsdesk.com/no/sporveien/pressreleases/ny-260-kvadratmeters-stasjonskunst-paa-helsfyr-t-banestasjon-2850706'
    ]
  }],
  ['people/by/oslo/helsfyr/fredrik_a_s_torp.json', {
    id: 'fredrik_a_s_torp',
    name: 'Fredrik A. S. Torp',
    initials: 'FAST',
    desc: 'Arkitekt med en sentral rolle i Helsfyr-prosjektet som utviklet seg til nytt lokalsenter og kollektivterminal.',
    tags: ['by', 'arkitektur', 'byutvikling', 'kollektivterminal', 'helsfyr', 'telje_torp_aasen', '1990_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1993,
    popupDesc: 'Fredrik A. S. Torp er et direkte byutviklingsanker for Helsfyr fordi fagpressen og hans tidligere arkitektkontor dokumenterer hans sentrale rolle i prosjektet rundt Fyrstikkfabrikken, som vokste til et lokalt senter med kollektivinngang, ny kollektivterminal og støyskjerming mot veien. Entryen forankrer den fysiske transformasjonen av Helsfyr-knutepunktet, ikke bare medlemskapet hans i Telje-Torp-Aasen.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.arkitektur.no/aktuelt/arkitektur/han-hadde-et-bankende-arkitekthjerte/',
      'https://lmr-arkitektur.no/nyheter/artikler/minneord-over-fredrik-a-s-torp'
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

const report = `# People of Places — Helsfyr batch 1\n\nDato: 2026-07-20\n\n## Resultat\n\nTre nye canonical personer kobles direkte til \`${PLACE_ID}\`.\n\n- \`guttorm_bruskeland\` — Sporveien oppgir ham som arkitekt for Helsfyr T-banestasjon fra 1966.\n- \`katrine_giaever\` — kunstner bak den permanente stasjonsutsmykningen «Å samle på farger».\n- \`fredrik_a_s_torp\` — særskilt dokumentert som sentral i Helsfyr-utviklingen som omfattet lokalsenter, kollektivinngang, terminal og støyskjerming.\n\n## Stedsgate\n\nAlle tre relasjonene gjelder det konkrete Helsfyr-knutepunktet og det fysiske stasjons-/terminalanlegget. Generelle Oslo øst-assosiasjoner er ikke brukt.\n\nMDH Arkitekters fem navngitte prosjektmedlemmer er vurdert, men ikke opprettet enkeltvis fordi prosjektkilden krediterer teamet kollektivt uten å gi én person særskilt ansvar. Det samme prinsippet brukes for Telje-Torp-Aasen, med unntak av Fredrik A. S. Torp fordi egne faglige minneord dokumenterer hans konkrete sentrale rolle i Helsfyr-prosjektet.\n\n## Kilder\n\n- Sporveien — Helsfyr T-banestasjon.\n- Sporveien — Ny 260 kvadratmeters stasjonskunst på Helsfyr T-banestasjon.\n- MDH Arkitekter — Helsfyr Metro Station Upgrade.\n- Arkitektur — minneord og omtale av Fredrik A. S. Torps rolle på Helsfyr.\n- LMR arkitektur — minneord over Fredrik A. S. Torp.\n\n## Valideringsgate\n\nMaterialiseringen skal kjøre repo-wide ID-audit før skriving, deretter \`bash scripts/check-people.sh\` og \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

fs.rmSync(SELF);
console.log('Materialized Helsfyr People of Places batch 1.');
console.log('Created 3 canonical people files and registered them in the people manifest.');
