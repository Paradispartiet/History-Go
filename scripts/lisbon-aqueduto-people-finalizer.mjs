#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_ID = 'lisbon_aqueduto_das_aguas_livres';
const SELF = path.join(ROOT, 'scripts/lisbon-aqueduto-people-finalizer.mjs');
const MANIFEST_FILE = path.join(ROOT, 'data/people/manifest.json');
const REPORT_FILE = path.join(ROOT, 'reports/people-lisbon-aqueduto-aguas-livres-batch1-validation.md');
const UNESCO = 'https://whc.unesco.org/en/tentativelists/6221/';
const PATRIMONIO = 'https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=70216';
const ECULTURA = 'https://www.e-cultura.pt/patrimonio_item/3558';

const NEW_FILES = [
  ['people/politikk/europe/portugal/lisbon/aqueduto_das_aguas_livres/joao_v_portugal.json', {
    id: 'joao_v_portugal',
    name: 'João V av Portugal',
    initials: 'JV',
    desc: 'Portugisisk konge som autoriserte og støttet byggingen av Águas Livres-akvedukten.',
    tags: ['politikk', 'monarki', 'joao_v', 'lisboa', 'vannforsyning', 'infrastruktur', '1700_tallet'],
    placeId: PLACE_ID,
    category: 'politikk',
    year: 1731,
    popupDesc: 'João V er et direkte bestilleranker for Aqueduto das Águas Livres. Kulturminnekildene dokumenterer at kongen støttet prosjektet og at et kongelig alvará i 1731 satte byggingen i gang for å møte Lisboas vannmangel. Entryen gjelder den konkrete offentlige infrastrukturen, ikke en generell kobling til kongens regjeringstid.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [UNESCO, ECULTURA, PATRIMONIO]
  }],
  ['people/by/europe/portugal/lisbon/aqueduto_das_aguas_livres/manuel_da_maia.json', {
    id: 'manuel_da_maia',
    name: 'Manuel da Maia',
    initials: 'MM',
    desc: 'Militæringeniør og arkitekt som ledet planleggingen av Águas Livres-akvedukten i 1730-årene.',
    tags: ['by', 'arkitektur', 'ingeniorkunst', 'vannforsyning', 'akvedukt', 'lisboa', '1700_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1732,
    popupDesc: 'Manuel da Maia er et hovedanker for akveduktens tekniske planlegging. UNESCO fremhever ham som en av de mest sentrale ansvarlige for byggingen i perioden 1732–1736, og portugisiske kulturminnekilder dokumenterer at han fastla den grunnleggende traseen og ledet prosjektet før Custódio Vieira overtok.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [UNESCO, PATRIMONIO]
  }],
  ['people/by/europe/portugal/lisbon/aqueduto_das_aguas_livres/custodio_vieira.json', {
    id: 'custodio_vieira',
    name: 'Custódio Vieira',
    initials: 'CV',
    desc: 'Arkitekt og ingeniør som ledet akveduktarbeidet og hadde ansvar for den monumentale Alcântara-strekningen.',
    tags: ['by', 'arkitektur', 'ingeniorkunst', 'vannforsyning', 'akvedukt', 'alcantara', '1700_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1736,
    popupDesc: 'Custódio Vieira er et direkte bygge- og ingeniøranker for Aqueduto das Águas Livres. Kulturminnekildene dokumenterer at han overtok ledelsen i 1736 og at den monumentale strekningen over Alcântara-dalen skyldes hans prosjektledelse. Han representerer dermed den fasen der akveduktens mest kjente fysiske struktur tok form.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [UNESCO, PATRIMONIO]
  }],
  ['people/by/europe/portugal/lisbon/aqueduto_das_aguas_livres/carlos_mardel.json', {
    id: 'carlos_mardel',
    name: 'Carlos Mardel',
    initials: 'CM',
    desc: 'Militærarkitekt som videreførte og utviklet Águas Livres-systemet fra midten av 1740-årene.',
    tags: ['by', 'arkitektur', 'ingeniorkunst', 'vannforsyning', 'akvedukt', 'lisboa', '1700_tallet'],
    placeId: PLACE_ID,
    category: 'by',
    year: 1746,
    popupDesc: 'Carlos Mardel er et hovedanker for akveduktens senere bygge- og byfase. UNESCO oppgir ham blant de mest sentrale ansvarlige for arbeidene fra 1746 til 1763, og portugisiske kulturminnekilder knytter ham til videreføringen av systemet da vannet nådde Lisboa og den urbane infrastrukturen ble utviklet videre.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [UNESCO, PATRIMONIO]
  }],
  ['people/politikk/europe/portugal/lisbon/aqueduto_das_aguas_livres/claudio_gorgel_do_amaral.json', {
    id: 'claudio_gorgel_do_amaral',
    name: 'Cláudio Gorgel do Amaral',
    initials: 'CGA',
    desc: 'Byprokurator og prosjektadministrator som drev fram initiativet til Lisboas nye vannforsyning.',
    tags: ['politikk', 'byadministrasjon', 'vannforsyning', 'infrastruktur', 'akvedukt', 'lisboa', '1700_tallet'],
    placeId: PLACE_ID,
    category: 'politikk',
    year: 1728,
    popupDesc: 'Cláudio Gorgel do Amaral er et direkte administrativt initiativanker for Aqueduto das Águas Livres. Portugisiske kulturminnekilder dokumenterer at han som byprokurator fremmet forslaget om en akvedukt i 1728 og senere ble utnevnt til superintendent for arbeidene. Koblingen gjelder dermed både prosjektets politiske oppstart og konkret administrasjon av byggeprosessen.',
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: [ECULTURA, PATRIMONIO]
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

const report = `# People of Places — Aqueduto das Águas Livres batch 1\n\nDato: 2026-07-20\n\n## Resultat\n\nFem nye canonical personer kobles til \`${PLACE_ID}\` gjennom dokumenterte bestiller-, planleggings-, bygge- og administrasjonsroller.\n\n- \`joao_v_portugal\` — kongelig bestiller og autorisasjon av prosjektstarten.\n- \`manuel_da_maia\` — sentral planlegger og leder 1732–1736.\n- \`custodio_vieira\` — leder fra 1736 og ansvarlig for Alcântara-strekningen.\n- \`carlos_mardel\` — hovedansvarlig i den senere byggefasen 1746–1763.\n- \`claudio_gorgel_do_amaral\` — fremmet prosjektet i 1728 og ble senere superintendent.\n\n## Stedsgate\n\nAlle fem relasjonene gjelder det konkrete akveduktprosjektet. Generelle forbindelser til Lisboa eller det portugisiske monarkiet er ikke tilstrekkelige. António Canevari ble vurdert, men utsatt fordi den dokumenterte ledelsesfasen hans var kortere enn den valgte kjernen.\n\n## Kilder\n\n- UNESCO World Heritage Centre — Águas Livres Aqueduct, tentative list.\n- Património Cultural, I.P. — kronologi og historisk beskrivelse av Águas Livres-systemet.\n- e-Cultura / Museu da Água — kulturminnebeskrivelse og prosjektets tidlige initiativ.\n\n## Valideringsgate\n\nMaterialiseringen skal kjøre repo-wide ID-audit før skriving, deretter \`bash scripts/check-people.sh\` og \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');
fs.rmSync(SELF);
console.log('Materialized Aqueduto das Águas Livres People of Places batch 1.');
console.log('Created 5 canonical people files and registered them in the people manifest.');
