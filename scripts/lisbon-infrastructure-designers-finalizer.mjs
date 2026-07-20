#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SELF = path.join(ROOT, 'scripts/lisbon-infrastructure-designers-finalizer.mjs');
const MANIFEST_FILE = path.join(ROOT, 'data/people/manifest.json');
const SANTIAGO_FILE = path.join(ROOT, 'data/people/naeringsliv/europe/portugal/lisbon/people_naeringsliv_lisbon.json');
const REPORT_FILE = path.join(ROOT, 'reports/people-lisbon-infrastructure-designers-batch1-validation.md');

const NEW_FILES = [
  ['people/by/europe/portugal/lisbon/elevador_de_santa_justa/raoul_mesnier_du_ponsard.json', {
    id: 'raoul_mesnier_du_ponsard',
    name: 'Raoul Mesnier du Ponsard',
    initials: 'RMP',
    desc: 'Ingeniør og konstruktør bak Elevador de Santa Justa og Ascensor da Bica.',
    tags: ['by', 'ingeniorkunst', 'kollektivtransport', 'heis', 'funikulaer', 'lisboa', 'infrastruktur'],
    placeId: 'lisbon_elevador_de_santa_justa',
    category: 'by',
    year: 1892,
    popupDesc: 'Raoul Mesnier du Ponsard er et direkte infrastrukturanker for både Elevador de Santa Justa og Bica. Portugisisk kulturminne- og transportdokumentasjon krediterer ham som opphavsmann til Santa Justa-heisen og Bica-funikulæren. Entryen samler derfor to konkrete tekniske løsninger på Lisboas bratte topografi i én canonical person, uten å gjøre en generell bytilknytning til hovedpoenget.',
    places: ['lisbon_elevador_de_santa_justa', 'lisbon_bica'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.monumentos.gov.pt/site/app_pagesuser/sipa.aspx?id=3146',
      'https://www.monumentos.gov.pt/Site/APP_PagesUser/SIPA.aspx?id=3169',
      'https://www.carris.pt/descubra/frota/elevador/'
    ]
  }],
  ['people/by/europe/portugal/lisbon/estacao_do_rossio/jose_luis_monteiro.json', {
    id: 'jose_luis_monteiro',
    name: 'José Luís Monteiro',
    initials: 'JLM',
    desc: 'Arkitekt bak Estação do Rossio, Lisboas ny-manuelinske jernbaneterminal fra 1890.',
    tags: ['by', 'arkitektur', 'jernbane', 'historisme', 'ny_manuelinsk', 'lisboa', 'infrastruktur'],
    placeId: 'lisbon_estacao_do_rossio',
    category: 'by',
    year: 1890,
    popupDesc: 'José Luís Monteiro er et direkte arkitekturanker for Estação do Rossio. Infraestruturas de Portugal dokumenterer ham som stasjonens arkitekt, og canonical place beskriver bygningen som et hovedverk i ny-manuelinsk historisme. Koblingen gjelder selve stasjonsbygningen og dens rolle som moderne jernbaneinfrastruktur med nasjonalhistorisk formspråk.',
    places: ['lisbon_estacao_do_rossio'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.infraestruturasdeportugal.pt/pt-pt/infraestruturas-de-portugal-na-ciencia-viva-no-verao',
      'https://www.infraestruturasdeportugal.pt/pt-pt/node/7727'
    ]
  }],
  ['people/by/europe/portugal/lisbon/gare_do_cais_do_sodre/porfirio_pardal_monteiro.json', {
    id: 'porfirio_pardal_monteiro',
    name: 'Porfírio Pardal Monteiro',
    initials: 'PPM',
    desc: 'Arkitekt bak den modernistiske stasjonsbygningen ved Cais do Sodré.',
    tags: ['by', 'arkitektur', 'jernbane', 'modernisme', 'kollektivknutepunkt', 'lisboa', 'infrastruktur'],
    placeId: 'lisbon_gare_do_cais_do_sodre',
    category: 'by',
    year: 1928,
    popupDesc: 'Porfírio Pardal Monteiro er et direkte arkitekturanker for Gare do Cais do Sodré. Infraestruturas de Portugal dokumenterer stasjonen som hans prosjekt og knytter den til moderniseringen og elektrifiseringen av Linha de Cascais. Entryen forankrer derfor et konkret modernistisk transportbygg, ikke en generell arkitektbiografi.',
    places: ['lisbon_gare_do_cais_do_sodre'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.infraestruturasdeportugal.pt/pt-pt/agenda/cultura-no-chiado-visita-guiada-estacao-do-cais-do-sodre',
      'https://www.infraestruturasdeportugal.pt/pt-pt/node/7727'
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
if (!existingIds.has('santiago_calatrava')) throw new Error('Expected canonical santiago_calatrava record not found');

for (const [rel, person] of NEW_FILES) {
  const abs = path.join(ROOT, 'data', rel);
  if (fs.existsSync(abs)) throw new Error(`Target people file already exists: data/${rel}`);
  writeJson(abs, [person]);
  if (!manifest.files.includes(rel)) manifest.files.push(rel);
}
writeJson(MANIFEST_FILE, manifest);

const santiagoRows = readJson(SANTIAGO_FILE);
if (!Array.isArray(santiagoRows)) throw new Error('Lisbon business people file must be an array');
const santiago = santiagoRows.find((row) => row?.id === 'santiago_calatrava');
if (!santiago) throw new Error('Canonical santiago_calatrava record missing from expected file');
if (!Array.isArray(santiago.places)) santiago.places = [santiago.placeId].filter(Boolean);
if (!santiago.places.includes('lisbon_oriente_station')) santiago.places.push('lisbon_oriente_station');
if (!Array.isArray(santiago.tags)) santiago.tags = [];
if (!santiago.tags.includes('oriente_station')) santiago.tags.push('oriente_station');
santiago.popupDesc = 'Santiago Calatrava er et presist personanker for Parque das Nações gjennom Gare do Oriente, den store intermodale stasjonen som koblet Expo ’98-området til tog, metro, buss og byens regionale transportsystem. Calatravas eget prosjektarkiv beskriver Oriente som Expoens primære transportforbindelse og som et sentralt grep i omformingen av Olivais-området. `lisbon_parque_das_nacoes` beholdes derfor som primæranker, mens `lisbon_oriente_station` legges til som den mer presise fysiske arkitektur- og infrastrukturlokasjonen.';
santiago.source_urls = Array.from(new Set([
  ...(Array.isArray(santiago.source_urls) ? santiago.source_urls : []),
  'https://prod.calatrava.com/projects/oriente-station-lisboa.html'
]));
writeJson(SANTIAGO_FILE, santiagoRows);

const report = `# People of Places — Lisboa infrastructure designers batch 1\n\nDato: 2026-07-20\n\n## Resultat\n\nTre nye canonical arkitekter/ingeniører opprettes, og én eksisterende canonical person gjenbrukes. Batchen gir people-dekning til fem presise steder.\n\n### Nye personer\n\n- \`raoul_mesnier_du_ponsard\` → \`lisbon_elevador_de_santa_justa\` + \`lisbon_bica\`.\n- \`jose_luis_monteiro\` → \`lisbon_estacao_do_rossio\`.\n- \`porfirio_pardal_monteiro\` → \`lisbon_gare_do_cais_do_sodre\`.\n\n### Gjenbrukt person\n\n- \`santiago_calatrava\` beholder \`lisbon_parque_das_nacoes\` som primæranker og får \`lisbon_oriente_station\` som presis sekundærrelasjon.\n\n## Stedsgate\n\nAlle relasjonene gjelder konkrete, navngitte transportanlegg og dokumentert design-/prosjektansvar. Det opprettes ingen løse by-, Expo- eller Lisboa-assosiasjoner.\n\n## Canonical audit\n\nRepo-wide ID- og navnevariant-audit fant ingen eksisterende canonical records for Raoul Mesnier du Ponsard, José Luís Monteiro eller Porfírio Pardal Monteiro. Santiago Calatrava finnes allerede og oppdateres derfor i stedet for å dupliseres.\n\n## Kilder\n\n- Monumentos / SIPA og CARRIS — Elevador de Santa Justa og Ascensor da Bica.\n- Infraestruturas de Portugal — Estação do Rossio og Estação do Cais do Sodré.\n- Santiago Calatrava Architects & Engineers — Oriente Station project archive.\n\n## Valideringsgate\n\nMaterialiseringen skal kjøre repo-wide ID-audit før skriving, deretter \`bash scripts/check-people.sh\` og \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');
fs.rmSync(SELF);
console.log('Materialized Lisbon infrastructure designers People of Places batch 1.');
console.log('Created 3 canonical people files, updated Santiago Calatrava and registered the new files.');
