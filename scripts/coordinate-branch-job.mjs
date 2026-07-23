import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const BATCH = 190;
const PLACE_ID = 'fornebu_teknologipark';
const LEGACY_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv/fornebu_teknologipark.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const NEW_PLACE_FILE = 'data/places/naeringsliv/akershus/telenor_fornebu.json';
const OLD_EVIDENCE_FILE = 'data/coordinate-evidence/oslo/naeringsliv/fornebu_teknologipark.json';
const NEW_EVIDENCE_FILE = 'data/coordinate-evidence/akershus/naeringsliv/fornebu_teknologipark.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const OLD_EVIDENCE_ENTRY = 'oslo/naeringsliv/fornebu_teknologipark.json';
const NEW_EVIDENCE_ENTRY = 'akershus/naeringsliv/fornebu_teknologipark.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const NEW_PLACE_ENTRY = 'places/naeringsliv/akershus/telenor_fornebu.json';
const CIVICATION_FILE = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-190-telenor-fornebu-relocation';
const CONTACT_URL = 'https://www.telenor.com/contact-us/';
const OPENING_URL = 'https://www.telenor.com/media/newsroom/archive/telenors-new-headquarters-to-open-on-september-23/';
const BAERUM_URL = 'https://www.baerum.kommune.no/politikk-og-samfunn/samfunnsutvikling/stedsutvikling-i-barum/nye-fornebu/';
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];

mkdirSync(REPORT_DIR, { recursive: true });
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => { mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true }); writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); };
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const parseJsonOutput = (stdout) => {
  const text = String(stdout || '').trim();
  const start = text.indexOf('{');
  if (start < 0) return null;
  try { return JSON.parse(text.slice(start)); } catch { return null; }
};
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a), dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};
const extractPlaces = (root) => {
  const out = [], seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 7 || value == null) return;
    if (Array.isArray(value)) return value.forEach((item) => visit(item, depth + 1));
    if (typeof value !== 'object') return;
    if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) { seen.add(value.id); out.push(value); }
      return;
    }
    Object.values(value).forEach((item) => visit(item, depth + 1));
  };
  visit(root);
  return out;
};
async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'History-Go coordinate production/1.0' } });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return text;
}

if (existsSync(NEW_PLACE_FILE) || existsSync(NEW_EVIDENCE_FILE)) throw new Error('Target Telenor Fornebu place/evidence already exists');
let protocol = readFileSync(PROTOCOL, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 189) throw new Error(`Expected coordinate max batch 189, got ${maxBatch}`);

const legacy = readJson(LEGACY_FILE);
if (!Array.isArray(legacy)) throw new Error(`${LEGACY_FILE} is not an array`);
const matches = legacy.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one ${PLACE_ID}, got ${matches.length}`);
const oldPlace = matches[0];
if (oldPlace.name !== 'Fornebu Teknologipark' || oldPlace.year !== 2002) throw new Error('Legacy Fornebu identity no longer matches the locked proxy state');
if (oldPlace.coordStatus || oldPlace.sourceObjectId || oldPlace.locatorType) throw new Error('Legacy Fornebu proxy unexpectedly already has coordinate metadata');

const oldEvidence = readJson(OLD_EVIDENCE_FILE);
if (oldEvidence.placeId !== PLACE_ID || oldEvidence.coordinateDecision !== 'needs_identity_split') throw new Error('Unexpected legacy Fornebu evidence state');

const [contactHtml, openingHtml, baerumHtml] = await Promise.all([
  fetchText(CONTACT_URL), fetchText(OPENING_URL), fetchText(BAERUM_URL)
]);
const sourceChecks = {
  currentHeadquartersFornebu: /Headquarters:\s*Fornebu/i.test(contactHtml),
  currentAddress: /Snarøyveien\s*30/i.test(contactHtml) && /1360\s*Fornebu/i.test(contactHtml),
  opened2002: /officially opens its new headquarters at Fornebu/i.test(openingHtml) && /September 23/i.test(openingHtml),
  technologyWorkplace: /people, technology and working environment/i.test(openingHtml),
  baerumFornebuContext: /Fornebu/i.test(baerumHtml)
};
if (!Object.values(sourceChecks).every(Boolean)) throw new Error(`Official identity checks failed: ${JSON.stringify(sourceChecks)}`);

const build = spawnSync('npm', ['run', 'build:tools'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout || ''}${build.stderr || ''}`, 'utf8');
if (build.status !== 0) throw new Error(`build:tools failed with ${build.status}`);
const finder = spawnSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Snarøyveien 30 1360 Fornebu'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout || ''}${finder.stderr || ''}`, 'utf8');
const found = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || found?.status !== 'verified_candidate') throw new Error(`Address-first did not verify Snarøyveien 30: ${found?.status || 'parse_error'}`);
if (!String(found.sourceObjectId || '').startsWith('geonorge-adresser-v1:3201:')) throw new Error(`Expected Bærum municipality source object, got ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat), lon = Number(found.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Telenor address candidate has no finite coordinate');

const activePlaces = extractPlaces(readJson('data/places/places_index.json'));
const identityDuplicates = activePlaces.filter((place) => place.id !== PLACE_ID && (/telenor.*fornebu/i.test(`${place.id} ${place.name}`) || /fornebu.*telenor/i.test(`${place.id} ${place.name}`)));
if (identityDuplicates.length) throw new Error(`Existing Telenor Fornebu canonical candidate(s): ${identityDuplicates.map((p) => `${p.id}:${p.name}`).join(', ')}`);
const nearby = activePlaces.filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Existing canonical marker within 3m: ${nearby[0].id} at ${nearby[0].distanceMeters}m`);

const coordNote = `Offisiell adressekoordinat fra Geonorge Adresser API for Snarøyveien 30 på Fornebu. Telenor dokumenterer adressen som konsernets hovedkontor og åpningen av det nye Fornebu-hovedkontoret i 2002. Punktet erstatter den udokumenterte brede proxyen «Fornebu Teknologipark» og flytter stedet fra feil Oslo-kilde til Bærum/Akershus.`;
const place = {
  ...oldPlace,
  name: 'Telenor hovedkontor – Fornebu',
  lat,
  lon,
  r: 220,
  year: 2002,
  desc: 'Telenors hovedkontor på Fornebu – et stort teknologi- og kunnskapsarbeidssted som åpnet i 2002 på det tidligere flyplassområdet.',
  popupDesc: 'Telenors hovedkontor på Fornebu åpnet i 2002 og samlet tusenvis av ansatte i et stort teknologisk arbeidsmiljø på området etter den nedlagte flyplassen. Bygget ble et tydelig symbol på Fornebus overgang fra luftfartsinfrastruktur til kunnskaps- og tjenesteøkonomi.\n\nI History Go er hovedkontoret det konkrete fysiske ankeret for fortellingen om Fornebus teknologiske næringsutvikling. Det representerer ikke hele Fornebu som «teknologipark», men ett dokumentert sted som faktisk bar denne transformasjonen.',
  quiz_profile: {
    ...oldPlace.quiz_profile,
    place_type: 'hovedkontor',
    subtype: 'telenor_teknologi_og_kunnskapsarbeidsplass',
    signature_features: [
      'Telenors hovedkontor på Fornebu',
      'åpnet i 2002 på det tidligere flyplassområdet',
      'konkret teknologisk arbeidssted i Fornebus næringstransformasjon'
    ],
    notes: 'Spør det konkrete Telenor-hovedkontoret som anker for Fornebus teknologiske transformasjon, ikke et udokumentert område kalt «Fornebu Teknologipark».'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: found.sourceObjectId,
  address: { street: 'Snarøyveien', number: '30', postcode: '1360', city: 'Fornebu', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: found.sourceObjectId,
  coordSourceUrl: found.sourceUrl,
  coordVerifiedAt: DATE,
  coordNote,
  externalLinks: [
    { type: 'official', label: 'Telenor Group – Contact us', url: CONTACT_URL, lang: 'en', verifiedAt: DATE },
    { type: 'official', label: 'Telenor – Fornebu headquarters opening 2002', url: OPENING_URL, lang: 'en', verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: NEW_PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: 220, coordStatus: 'verified', coordSource: 'geonorge_adresser_v1', coordType: 'address_point', coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Telenors hovedkontor i Snarøyveien 30 på Fornebu, åpnet i 2002',
    identityStatus: 'resolved',
    identityProblem: 'Legacy-recorden beskrev hele Fornebu som en teknologipark og lå feilaktig i Oslo-kilden. Den canonical fysiske identiteten er avgrenset til Telenors dokumenterte hovedkontor i Bærum.',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig fysisk teknologiarbeidssted', 'offisiell adressekoordinat', 'korrekt Bærum/Akershus-geografi', 'overlap-audit mot eksisterende canonical places'],
  evidence: [
    { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Snarøyveien 30', sourceUrl: found.sourceUrl, sourceObjectId: found.sourceObjectId, sourceQuality: 'official_address', finding: 'Ett verifisert offisielt adressepunkt for Snarøyveien 30 på Fornebu i Bærum kommune.', canVerifyCoordinate: true, reason: coordNote },
    { sourceProvider: 'manual_research', sourceName: 'Telenor Group – Headquarters: Fornebu', sourceUrl: CONTACT_URL, sourceObjectId: 'telenor:headquarters-fornebu-current', sourceQuality: 'official_institution_identity', finding: 'Telenor oppgir sitt hovedkontor på Fornebu med adresse Snarøyveien 30.', canVerifyCoordinate: false, reason: 'Dokumenterer dagens institusjonsidentitet og adresse; Geonorge brukes som koordinatkilde.' },
    { sourceProvider: 'manual_research', sourceName: 'Telenor – new headquarters opening 2002', sourceUrl: OPENING_URL, sourceObjectId: 'telenor:fornebu-headquarters-opening:2002-09-23', sourceQuality: 'official_historical_identity', finding: 'Telenor dokumenterer den offisielle åpningen av det nye hovedkontoret på Fornebu i september 2002.', canVerifyCoordinate: false, reason: 'Knytter legacy-årstallet 2002 og teknologiarbeidsplass-identiteten til det konkrete hovedkontoret.' }
  ],
  addressCandidates: [{ address: 'Snarøyveien 30, 1360 Fornebu', sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'telenor:headquarters-fornebu-current', canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: 'display_marker', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Legacy-proxyen er flyttet til korrekt Akershus-kontekst og forankret på Telenors dokumenterte Fornebu-hovedkontor.' },
  notes: [coordNote, `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id || 'ingen'} på ${nearby[0]?.distanceMeters ?? 'n/a'} meter; ingen markør lå innen 3 meter.`]
};

const remaining = legacy.filter((item) => item?.id !== PLACE_ID);
writeJson(LEGACY_FILE, remaining);
if (!existsSync(SPLIT_FILE)) throw new Error(`Missing legacy split file ${SPLIT_FILE}`);
rmSync(SPLIT_FILE);

const splitManifest = readJson(SPLIT_MANIFEST);
const rows = splitManifest.places.filter((row) => row?.id === PLACE_ID);
if (rows.length !== 1) throw new Error(`Expected one split manifest row, got ${rows.length}`);
splitManifest.places = splitManifest.places.filter((row) => row?.id !== PLACE_ID).map((row, order) => ({ ...row, order }));
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(LEGACY_FILE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex) || splitIndex.filter((item) => item?.id === PLACE_ID).length !== 1) throw new Error('Unexpected legacy split-index state');
writeJson(SPLIT_INDEX, splitIndex.filter((item) => item?.id !== PLACE_ID));

writeJson(NEW_PLACE_FILE, place);
writeJson(NEW_EVIDENCE_FILE, evidence);
rmSync(OLD_EVIDENCE_FILE);

const placeManifest = readJson(PLACE_MANIFEST);
if (!Array.isArray(placeManifest.files)) throw new Error(`${PLACE_MANIFEST} missing files[]`);
if (!placeManifest.files.includes(NEW_PLACE_ENTRY)) placeManifest.files.push(NEW_PLACE_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files) || !evidenceManifest.files.includes(OLD_EVIDENCE_ENTRY)) throw new Error('Legacy Fornebu evidence manifest entry missing');
evidenceManifest.files = evidenceManifest.files.filter((entry) => entry !== OLD_EVIDENCE_ENTRY && entry !== NEW_EVIDENCE_ENTRY);
evidenceManifest.files.push(NEW_EVIDENCE_ENTRY);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const civication = readJson(CIVICATION_FILE);
let civiUpdates = 0;
const updateCivi = (value) => {
  if (Array.isArray(value)) return value.forEach(updateCivi);
  if (!value || typeof value !== 'object') return;
  if (value.historyGoPlaceId === PLACE_ID) {
    value.historyGoSourceFile = NEW_PLACE_ENTRY;
    value.name = place.name;
    value.lat = lat;
    value.lon = lon;
    value.needsVerification = false;
    civiUpdates += 1;
  }
  Object.values(value).forEach(updateCivi);
};
updateCivi(civication);
if (civiUpdates !== 1) throw new Error(`Expected one Civication mapping update, got ${civiUpdates}`);
writeJson(CIVICATION_FILE, civication);

const removedI18n = [];
for (const file of I18N_FILES) {
  const data = readJson(file);
  if (Object.prototype.hasOwnProperty.call(data, PLACE_ID)) {
    delete data[PLACE_ID];
    writeJson(file, data);
    removedI18n.push(file);
  }
}

const protocolLines = protocol.split('\n');
const oldRows = protocolLines.map((line, index) => line.includes(`\`${PLACE_ID}\``) ? index : -1).filter((index) => index >= 0);
if (oldRows.length !== 1) throw new Error(`Expected one unresolved protocol row for ${PLACE_ID}, got ${oldRows.length}`);
protocol = protocolLines.filter((_, index) => !oldRows.includes(index)).join('\n');
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Telenor hovedkontor – Fornebu | verified; moved to Akershus | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved geografisk og fysisk identitetskorreksjon. Legacy-recorden «Fornebu Teknologipark» lå feilaktig i Oslo-kilden og beskrev et bredt teknologisk næringsområde uten ett entydig fysisk objekt. Årstallet 2002 og teknologiprofilen forankres i stedet i Telenors dokumenterte hovedkontor på Fornebu, som Telenor åpnet i 2002 og fortsatt oppgir i Snarøyveien 30. Geonorge adresse-first gir det offisielle bygningsankeret \`${found.sourceObjectId}\` i Bærum kommune. PlaceId beholdes for kompatibilitet, men canonical source og coordinate evidence flyttes til Akershus.\n`;
writeFileSync(PROTOCOL, protocol, 'utf8');

writeJson(`${REPORT_DIR}/batch-190-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'produced_by_geographic_identity_correction',
  old: { file: LEGACY_FILE, name: oldPlace.name, coordinate: { lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r } },
  current: { file: NEW_PLACE_FILE, name: place.name, coordinate: { lat, lon, r: place.r }, sourceObjectId: found.sourceObjectId, coordStatus: place.coordStatus },
  officialSourceChecks: sourceChecks,
  identityDuplicateCount: identityDuplicates.length,
  nearestCanonicalBeforeWrite: nearby[0] || null,
  civicationUpdates: civiUpdates,
  removedI18n
});

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, name: place.name, sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, movedFrom: 'oslo', movedTo: 'akershus', nearestCanonicalBeforeWrite: nearby[0] || null }, null, 2));
