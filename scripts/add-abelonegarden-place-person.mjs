#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_ID = 'abelonegarden';
const PERSON_ID = 'abelone_kristensen';
const PLACE_REL = 'places/historie/oslo/places_historie/abelonegarden.json';
const PERSON_REL = 'people/subkultur/oslo/abelonegarden/abelone_kristensen.json';
const PLACE_FILE = path.join(ROOT, 'data', PLACE_REL);
const PERSON_FILE = path.join(ROOT, 'data', PERSON_REL);
const PLACES_MANIFEST = path.join(ROOT, 'data/places/manifest.json');
const PEOPLE_MANIFEST = path.join(ROOT, 'data/people/manifest.json');
const REPORT_FILE = path.join(ROOT, 'reports/abelonegarden-place-person-batch1-validation.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function register(manifestPath, relPath) {
  const manifest = readJson(manifestPath);
  if (!Array.isArray(manifest.files)) throw new Error(`${manifestPath} must contain files[]`);
  if (!manifest.files.includes(relPath)) manifest.files.push(relPath);
  writeJson(manifestPath, manifest);
}

if (fs.existsSync(PLACE_FILE)) throw new Error(`${PLACE_FILE} already exists`);
if (fs.existsSync(PERSON_FILE)) throw new Error(`${PERSON_FILE} already exists`);

const placesManifest = readJson(PLACES_MANIFEST);
const peopleManifest = readJson(PEOPLE_MANIFEST);
if (placesManifest.files?.includes(PLACE_REL)) throw new Error(`${PLACE_REL} already registered`);
if (peopleManifest.files?.includes(PERSON_REL)) throw new Error(`${PERSON_REL} already registered`);

const place = {
  id: PLACE_ID,
  name: 'Abelonegården',
  visual: { designCode: 'historic_building_miniature' },
  lat: 59.912902,
  lon: 10.754734,
  r: 70,
  category: 'historie',
  secondaryBadgeIds: ['subkultur'],
  year: 1893,
  desc: 'Historisk vertshus og bordell på Vaterland, kjent gjennom Abelone Kristensen og Abelonesaken i 1893.',
  image: '',
  cardImage: '',
  popupDesc: 'Abelonegården lå i Karl XIIs gate 15 på hjørnet av Sukkerhusgaten i det gamle Vaterland, på tomta der Oslo Spektrum ligger i dag. Abelone Kristensen og ektemannen Lauritz drev losjihus og vertshus her, samtidig som stedet var knyttet til prostitusjon og kriminalitet i det fattige Vaterlandsmiljøet. Drapet på Lauritz Kristensen i 1893 og den påfølgende Abelonesaken gjorde gården landskjent og bidro til at Abelone ble en mytisk skikkelse i fortellingene om Kristianias underverden. Stedet behandles som sosial- og byhistorie, uten romantisering av utnyttelse eller kriminalitet.',
  emne_ids: [
    'em_his_sosialhistorie_hverdagsliv',
    'em_his_historiske_lag_i_byrom'
  ],
  quiz_profile: {
    place_type: 'historisk_bygard',
    subtype: 'forsvunnet_vertshus_og_underverdensted',
    signature_features: [
      'Karl XIIs gate 15 på gamle Vaterland',
      'knyttet direkte til Abelone Kristensen og Abelonesaken',
      'tomta ligger i dag under Oslo Spektrum'
    ],
    primary_angles: ['historie', 'sosialhistorie', 'byhistorie', 'motkulturhistorie'],
    question_families: ['historisk_endring', 'sted_og_person', 'tidslag', 'saertrekk'],
    avoid_angles: ['romantisert_kriminalitet', 'generisk_vaterland', 'sensasjonalisert_prostitusjon'],
    must_include: [
      'at Abelonegården var et konkret hus i Karl XIIs gate 15',
      'at stedet forsvant ved saneringen av Vaterland og i dag ligger under Oslo Spektrum'
    ],
    contrast_targets: ['storgata', 'vaterland_historisk_elvelop'],
    notes: 'Bruk stedet som inngang til sosialhistorie, gatekultur og Kristianias marginale bymiljøer, ikke som romantisering av kriminalitet.'
  },
  coordType: 'historical_site',
  coordStatus: 'verified',
  coordSource: 'Lokalhistoriewiki / Store norske leksikon',
  coordSourceUrl: 'https://lokalhistoriewiki.no/Abeloneg%C3%A5rden',
  coordVerifiedAt: '2026-07-18',
  coordPrecision: 'historical site point',
  coordPrecisionM: 25,
  coordNote: 'Historisk tomt for Karl XIIs gate 15, oppgitt av Lokalhistoriewiki; bygningen og gaten er borte, og tomta ligger der Oslo Spektrum står i dag.',
  locatorType: 'historical_site',
  coordRole: 'display_marker'
};

const person = {
  id: PERSON_ID,
  name: 'Abelone Kristensen',
  initials: 'AK',
  desc: 'Vaterlands legendariske vertshusholder og en av Kristianias mest kjente underverdensskikkelser.',
  tags: [
    'subkultur',
    'gatefolk',
    'byoriginal',
    'vaterland',
    'underverden',
    'kultfigur',
    'sosialhistorie',
    'motkulturhistorie'
  ],
  placeId: PLACE_ID,
  category: 'subkultur',
  year: 1893,
  popupDesc: 'Abelone Kristensen ble kjent som «Vaterlands dronning» og var en sentral og mytologisert skikkelse i Kristianias marginale bymiljø rundt slutten av 1800-tallet. Hun drev vertshus, losjihus og bordell sammen med ektemannen Lauritz i Abelonegården, Karl XIIs gate 15. Etter drapet på Lauritz i 1893 ble virksomheten hennes gransket offentlig, og Abelone ble et symbol på Vaterlands underverden. I History Go hører hun hjemme i subkultur som gate- og kultfigur med en eksplisitt fysisk kobling til Abelonegården, samtidig som historien behandles nøkternt som sosialhistorie og ikke som romantisering av kriminalitet eller utnyttelse.',
  places: [PLACE_ID],
  image: '',
  cardImage: ''
};

writeJson(PLACE_FILE, place);
writeJson(PERSON_FILE, person);
register(PLACES_MANIFEST, PLACE_REL);
register(PEOPLE_MANIFEST, PERSON_REL);

const report = `# Abelonegården place + people batch 1 validation\n\nDato: 2026-07-18\n\n## Opprettet\n\n- place: \`${PLACE_ID}\` → \`data/${PLACE_REL}\`\n- person: \`${PERSON_ID}\` → \`data/${PERSON_REL}\`\n\n## Stedsgate\n\nAbelonegården er et konkret historisk sted, ikke et hybrid- eller områdeanker. Kildene plasserer gården i Karl XIIs gate 15 på hjørnet av Sukkerhusgaten, på tomta der Oslo Spektrum står i dag.\n\n## Personkobling\n\nAbelone Kristensen drev virksomheten sin i gården og er eksplisitt identifisert som skikkelsen stedet fikk navn etter.\n\n## Kilder\n\n- Store norske leksikon: Abelonesaken\n- Nasjonalbiblioteket: Abelone, dronningen av Kristianias underverden\n- Lokalhistoriewiki: Abelonegården\n- Lokalhistoriewiki: Abelone Constance Kristensen\n\n## Validering etter kjøring\n\n\`\`\`bash\nnpm run places:index:build\nbash scripts/check-places.sh\nbash scripts/check-people.sh\n\`\`\`\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

console.log(`Created ${PLACE_REL}`);
console.log(`Created ${PERSON_REL}`);
console.log('Registered both files in manifests');
console.log('Wrote reports/abelonegarden-place-person-batch1-validation.md');
