import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const BATCH = 189;
const PLACE_ID = 'ulven_handelspark';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv/ulven_handelspark.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/naeringsliv/ulven_handelspark.json';
const CIVICATION_FILE = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-189-construction-city-ulven';
const CONTACT_URL = 'https://constructioncity.no/om-construction-city/kontakt/';
const OPENING_URL = 'https://constructioncity.no/artikler/construction-city/construction-city-er-offisielt-apnet-en-viktig-milepael-for-bransjen/';
const OSLO_URL = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/hovinbyen/';
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];

mkdirSync(REPORT_DIR, { recursive: true });
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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

let protocol = readFileSync(PROTOCOL, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1])));
if (maxBatch !== 188) throw new Error(`Expected coordinate max batch 188, got ${maxBatch}`);

const aggregate = readJson(AGGREGATE);
if (!Array.isArray(aggregate)) throw new Error(`${AGGREGATE} is not an array`);
const matches = aggregate.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one ${PLACE_ID} record, got ${matches.length}`);
const legacy = matches[0];
if (legacy.coordStatus || legacy.sourceObjectId || legacy.locatorType) throw new Error('Legacy Ulven proxy unexpectedly already has coordinate contract metadata');
if (legacy.name !== 'Ulven handelspark') throw new Error(`Unexpected legacy name: ${legacy.name}`);

const oldEvidence = readJson(EVIDENCE_FILE);
if (oldEvidence.placeId !== PLACE_ID || oldEvidence.coordinateDecision !== 'needs_identity_split') {
  throw new Error('Unexpected legacy coordinate evidence state');
}

const [contactHtml, openingHtml, osloHtml] = await Promise.all([
  fetchText(CONTACT_URL), fetchText(OPENING_URL), fetchText(OSLO_URL)
]);
const sourceChecks = {
  officialAddress: /Standardveien\s*1/i.test(contactHtml) && /0581\s*Oslo/i.test(contactHtml),
  officialName: /Construction City/i.test(contactHtml) && /Construction City/i.test(openingHtml),
  officialUlvenIdentity: /Ulven i Oslo/i.test(openingHtml) || /på Ulven i Oslo/i.test(openingHtml),
  officialOpened2025: /august 2025/i.test(openingHtml),
  municipalityRecognizesCluster: /Construction City på Ulven/i.test(osloHtml)
};
if (!Object.values(sourceChecks).every(Boolean)) throw new Error(`Official source checks failed: ${JSON.stringify(sourceChecks)}`);

const build = spawnSync('npm', ['run', 'build:tools'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout || ''}${build.stderr || ''}`, 'utf8');
if (build.status !== 0) throw new Error(`build:tools failed with ${build.status}`);
const finder = spawnSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Standardveien 1 0581 Oslo'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout || ''}${finder.stderr || ''}`, 'utf8');
const found = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || found?.status !== 'verified_candidate') throw new Error(`Address-first lookup did not verify Standardveien 1: ${found?.status || 'parse_error'}`);
if (!String(found.sourceObjectId || '').startsWith('geonorge-adresser-v1:0301:')) throw new Error(`Unexpected address source ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat), lon = Number(found.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Address-first result has no finite coordinate');

const activePlaces = extractPlaces(readJson('data/places/places_index.json'));
const exactNameDuplicates = activePlaces.filter((place) => place.id !== PLACE_ID && place.name.trim().toLowerCase() === 'construction city');
if (exactNameDuplicates.length) throw new Error(`Existing canonical Construction City duplicate: ${exactNameDuplicates.map((p) => p.id).join(', ')}`);
const nearby = activePlaces.filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Existing canonical marker within 3m: ${nearby[0].id} at ${nearby[0].distanceMeters}m`);

const coordNote = `Offisiell adressekoordinat fra Geonorge Adresser API for Standardveien 1, 0581 Oslo. Construction Citys egne sider dokumenterer navnet, adressen og åpningen på Ulven i august 2025, og Oslo kommune omtaler Construction City som næringsklyngen på Ulven. Punktet erstatter den udokumenterte generiske markøren «Ulven handelspark».`;
const place = {
  ...legacy,
  name: 'Construction City',
  lat,
  lon,
  r: 180,
  year: 2025,
  desc: 'Stor næringsklynge på Ulven for bygg-, anleggs- og eiendomsbransjen – et konkret tyngdepunkt i transformasjonen av Hovinbyen.',
  popupDesc: 'Construction City åpnet på Ulven i 2025 som et stort felles miljø for bygg-, anleggs- og eiendomsnæringen. Bygget samler bedrifter, utdanning, innovasjon og møteplasser i et område som tidligere var sterkt preget av industri, lager og logistikk.\n\nI History Go fungerer Construction City som det konkrete fysiske ankeret for historien om Ulvens overgang fra nærings- og transportområde til en tettere bydel der boliger, arbeidsplasser og nye kunnskapsmiljøer bygges side om side.',
  quiz_profile: {
    ...legacy.quiz_profile,
    place_type: 'næringsbygg',
    subtype: 'construction_city_bygg_anlegg_eiendomsklynge',
    signature_features: [
      'Construction City på Ulven',
      'stor næringsklynge for bygg, anlegg og eiendom',
      'konkret anker for Ulvens transformasjon fra industri og logistikk til blandet by'
    ],
    notes: 'Spør både om det konkrete Construction City-bygget og om Ulvens bredere transformasjon, men ikke omtale stedet som en bokstavelig handelspark.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: found.sourceObjectId,
  address: { street: 'Standardveien', number: '1', postcode: '0581', city: 'Oslo', country: 'NO' },
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
    { type: 'official', label: 'Construction City', url: CONTACT_URL, lang: 'nb', verifiedAt: DATE },
    { type: 'official', label: 'Oslo kommune – Hovinbyen', url: OSLO_URL, lang: 'nb', verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: AGGREGATE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: 180, coordStatus: 'verified', coordSource: 'geonorge_adresser_v1', coordType: 'address_point', coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Construction City, det fysiske næringsbygget og klyngesenteret i Standardveien 1 på Ulven',
    identityStatus: 'resolved',
    identityProblem: 'Legacy-navnet «Ulven handelspark» var ikke en dokumentert fysisk entitet. Den eksisterende Ulven/Hovinbyen-konteksten er bevart, men det canonical stedet er avgrenset til Construction City.',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig fysisk næringsbygg', 'offisiell adressekoordinat', 'overlap-audit mot eksisterende canonical places'],
  evidence: [
    { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Standardveien 1', sourceUrl: found.sourceUrl, sourceObjectId: found.sourceObjectId, sourceQuality: 'official_address', finding: 'Ett verifisert offisielt adressepunkt for Standardveien 1, 0581 Oslo.', canVerifyCoordinate: true, reason: coordNote },
    { sourceProvider: 'manual_research', sourceName: 'Construction City – offisielle sider', sourceUrl: OPENING_URL, sourceObjectId: 'construction-city:ulven:official-2025', sourceQuality: 'official_institution_identity', finding: 'Construction City identifiseres som næringsklyngen på Ulven, åpnet i august 2025; offisiell kontaktside oppgir Standardveien 1.', canVerifyCoordinate: false, reason: 'Dokumenterer fysisk identitet og lokasjon; Geonorge brukes som koordinatkilde.' },
    { sourceProvider: 'municipality', sourceName: 'Oslo kommune – Hovinbyen', sourceUrl: OSLO_URL, sourceObjectId: 'oslo-kommune:hovinbyen:construction-city-ulven', sourceQuality: 'municipality_identity', finding: 'Oslo kommune omtaler Construction City som næringsklyngen på Ulven.', canVerifyCoordinate: false, reason: 'Kommunal kryssjekk av område- og funksjonsidentitet.' }
  ],
  addressCandidates: [{ address: 'Standardveien 1, 0581 Oslo', sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'construction-city:ulven:official-2025', canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: 'display_marker', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Construction City er canonical fysisk anker for den tidligere uløste Ulven-proxyen.' },
  notes: [coordNote, `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id || 'ingen'} på ${nearby[0]?.distanceMeters ?? 'n/a'} meter; ingen markør lå innen 3 meter.`]
};

const updatedAggregate = aggregate.map((item) => item?.id === PLACE_ID ? place : item);
writeJson(AGGREGATE, updatedAggregate);
writeJson(SPLIT_FILE, place);
writeJson(EVIDENCE_FILE, evidence);

const splitManifest = readJson(SPLIT_MANIFEST);
const manifestRows = splitManifest.places.filter((row) => row?.id === PLACE_ID);
if (manifestRows.length !== 1) throw new Error(`Expected one split manifest row, got ${manifestRows.length}`);
manifestRows[0].name = place.name;
manifestRows[0].sha256 = sha256(SPLIT_FILE);
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
const indexMatches = splitIndex.filter((item) => item?.id === PLACE_ID);
if (indexMatches.length !== 1) throw new Error(`Expected one split index row, got ${indexMatches.length}`);
const indexPlace = { ...place, file: 'places_naeringsliv/ulven_handelspark.json' };
writeJson(SPLIT_INDEX, splitIndex.map((item) => item?.id === PLACE_ID ? indexPlace : item));

const civication = readJson(CIVICATION_FILE);
let civiUpdates = 0;
const updateCivi = (value) => {
  if (Array.isArray(value)) return value.forEach(updateCivi);
  if (!value || typeof value !== 'object') return;
  if (value.historyGoPlaceId === PLACE_ID) {
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

const i18nUpdates = [];
for (const file of I18N_FILES) {
  const data = readJson(file);
  if (data[PLACE_ID] && typeof data[PLACE_ID] === 'object') {
    data[PLACE_ID].name = 'Construction City';
    writeJson(file, data);
    i18nUpdates.push(file);
  }
}

const protocolLines = protocol.split('\n');
const unresolvedRows = protocolLines.map((line, index) => line.includes(`\`${PLACE_ID}\``) ? index : -1).filter((index) => index >= 0);
if (unresolvedRows.length !== 1) throw new Error(`Expected one protocol row for ${PLACE_ID}, got ${unresolvedRows.length}`);
protocol = protocolLines.filter((_, index) => !unresolvedRows.includes(index)).join('\n');
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Construction City | verified | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser den tidligere generiske \`ulven_handelspark\`-proxyen ved å avgrense canonical identitet til det konkrete næringsbygget Construction City i Standardveien 1 på Ulven. Construction Citys egne sider dokumenterer navn, adresse og åpning i august 2025; Oslo kommune omtaler anlegget som næringsklyngen Construction City på Ulven. Geonorge adresse-first gir det offisielle display-ankeret \`${found.sourceObjectId}\`. Den eksisterende placeId-en beholdes for kompatibilitet, mens navn, år, beskrivelser, Civication-markør og coordinate evidence korrigeres. Den bredere Ulven/Hovinbyen-transformasjonen beholdes som kontekst i quiz og beskrivelse, men ikke som påstått fysisk «handelspark».\n`;
writeFileSync(PROTOCOL, protocol, 'utf8');

writeJson(`${REPORT_DIR}/batch-189-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'produced_by_identity_correction',
  old: { name: legacy.name, coordinate: { lat: legacy.lat, lon: legacy.lon, r: legacy.r } },
  current: { name: place.name, coordinate: { lat, lon, r: place.r }, sourceObjectId: found.sourceObjectId, coordStatus: place.coordStatus },
  officialSourceChecks: sourceChecks,
  nearestCanonicalBeforeWrite: nearby[0] || null,
  exactNameDuplicateCount: exactNameDuplicates.length,
  civicationUpdates: civiUpdates,
  i18nUpdates
});

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, name: place.name, sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, nearestCanonicalBeforeWrite: nearby[0] || null }, null, 2));
