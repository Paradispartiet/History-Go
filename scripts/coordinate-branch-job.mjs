import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const BATCH = 190;
const PLACE_ID = 'fornebu_teknologipark';
const LEGACY_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv/fornebu_teknologipark.json';
const PLACE_FILE = 'data/places/naeringsliv/akershus/it_fornebu_terminalbygget.json';
const PLACE_MANIFEST_ENTRY = 'places/naeringsliv/akershus/it_fornebu_terminalbygget.json';
const OLD_EVIDENCE_FILE = 'data/coordinate-evidence/oslo/naeringsliv/fornebu_teknologipark.json';
const OLD_EVIDENCE_ENTRY = 'oslo/naeringsliv/fornebu_teknologipark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/akershus/naeringsliv/fornebu_teknologipark.json';
const EVIDENCE_ENTRY = 'akershus/naeringsliv/fornebu_teknologipark.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const RESEARCH_FILE = 'reports/oslo-coordinate-fornebu-teknologipark-terminalbygget-research/summary.json';
const PROTOCOL_FILE = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-190-it-fornebu-terminalbygget-relocation';
const IT_FORNEBU_URL = 'https://nor.itfornebu.no/terminalbygget/';
const BAERUM_URL = 'https://www.baerum.kommune.no/tjenester/kultur-idrett-og-fritid/kunst-og-kultur/rik-pa-historie/12.-nyere-arkitektur/';
const SNL_URL = 'https://snl.no/Oslo_lufthavn%2C_Fornebu';
const EXPECTED_SOURCE = 'geonorge-adresser-v1:3201:1566:25';
const EXPECTED_LAT = 59.89478742780154;
const EXPECTED_LON = 10.629427258419572;
const CIVICATION_FILES = [
  'data/Civication/map/historyGoPlaceMapping.naeringsliv.json',
  'data/Civication/map/historyGoPlaceMapping.json'
];
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];

mkdirSync(REPORT_DIR, { recursive: true });
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const parseJsonOutput = (text) => {
  const value = String(text ?? '').trim();
  const start = value.indexOf('{');
  if (start < 0) return null;
  try { return JSON.parse(value.slice(start)); } catch { return null; }
};
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a);
  const dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};
const extractPlaces = (root) => {
  const out = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 7 || value == null) return;
    if (Array.isArray(value)) { for (const item of value) visit(item, depth + 1); return; }
    if (typeof value !== 'object') return;
    if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) { seen.add(value.id); out.push(value); }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return out;
};
const appendManifest = (file, item) => {
  const manifest = readJson(file);
  if (!Array.isArray(manifest.files)) throw new Error(`${file} missing files[]`);
  if (!manifest.files.includes(item)) manifest.files.push(item);
  writeJson(file, manifest);
};

if (existsSync(PLACE_FILE) || existsSync(EVIDENCE_FILE)) throw new Error('Dedicated IT Fornebu place/evidence already exists');
if (!existsSync(SPLIT_FILE) || !existsSync(OLD_EVIDENCE_FILE)) throw new Error('Expected legacy split/evidence files are missing');

let protocol = readFileSync(PROTOCOL_FILE, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1])));
if (maxBatch !== 189) throw new Error(`Expected previous coordinate batch 189, got ${maxBatch}`);

const research = readJson(RESEARCH_FILE);
if (research.placeId !== PLACE_ID || research.candidateIdentity?.name !== 'IT Fornebu – Terminalbygget') throw new Error('Merged Fornebu research changed');
if (research.coordinateCandidate?.sourceObjectId !== EXPECTED_SOURCE) throw new Error('Research Geonorge source changed');
if (research.geographyDecision?.requiresGeographicRelocation !== true) throw new Error('Research no longer requires geographic relocation');
if (research.duplicateDecision?.exactCollisionWithin3m !== false) throw new Error('Research reported a collision');

const build = spawnSync('npm', ['run', 'build:tools'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ''}${build.stderr ?? ''}`, 'utf8');
if (build.status !== 0) throw new Error(`build:tools failed with ${build.status}`);

const finder = spawnSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Martin Linges vei 25 1364 Fornebu'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout ?? ''}${finder.stderr ?? ''}`, 'utf8');
const found = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || found?.status !== 'verified_candidate') throw new Error(`Address-first failed: ${found?.status ?? 'parse_error'}`);
if (found.sourceObjectId !== EXPECTED_SOURCE) throw new Error(`Unexpected Geonorge object ${found.sourceObjectId}`);
if (found.rawHit?.kommunenummer !== '3201') throw new Error(`Expected Bærum municipality 3201, got ${found.rawHit?.kommunenummer}`);
const lat = Number(found.coordinate?.lat);
const lon = Number(found.coordinate?.lon);
if (Math.abs(lat - EXPECTED_LAT) > 1e-10 || Math.abs(lon - EXPECTED_LON) > 1e-10) throw new Error(`Coordinate changed: ${lat}, ${lon}`);

const currentPlaces = extractPlaces(readJson('data/places/places_index.json'));
const nearby = currentPlaces
  .filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Canonical collision with ${nearby[0].id} at ${nearby[0].distanceMeters} m`);

const aggregate = readJson(LEGACY_FILE);
if (!Array.isArray(aggregate)) throw new Error(`${LEGACY_FILE} is not an array`);
const matches = aggregate.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one legacy ${PLACE_ID}, got ${matches.length}`);
const oldPlace = matches[0];
if (oldPlace.coordStatus || oldPlace.sourceObjectId || oldPlace.locatorType) throw new Error('Legacy Fornebu record unexpectedly already contracted');

const oldEvidence = readJson(OLD_EVIDENCE_FILE);
if (oldEvidence.placeId !== PLACE_ID || oldEvidence.coordinateDecision !== 'needs_identity_split') throw new Error('Unexpected old Fornebu evidence state');

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Martin Linges vei 25, 1364 Fornebu i Bærum. IT Fornebu, Bærum kommune og Store norske leksikon identifiserer det tidligere terminalbygget som det konkrete fysiske stedet som senere ble kunnskaps- og teknologimiljø. Punktet brukes som canonical display-marker for Terminalbygget / IT Fornebu, ikke som et generelt områdeanker for hele Fornebu.';
const place = {
  ...oldPlace,
  name: 'IT Fornebu – Terminalbygget',
  lat,
  lon,
  r: 180,
  year: 1964,
  desc: 'Det tidligere terminalbygget på Fornebu flyplass, senere omgjort til et kunnskaps- og teknologimiljø.',
  popupDesc: 'Terminalbygget på den tidligere Oslo lufthavn Fornebu ble oppført i 1964 og fikk en ny rolle etter at flyplassen stengte. Bygget ble senere utviklet som del av IT Fornebu og brukt av kunnskaps- og teknologibedrifter.\n\nI History Go er dette det konkrete stedet som viser overgangen fra luftfartsinfrastruktur til kunnskapsbasert næringsliv. Canonical-markøren representerer selve Terminalbygget i Martin Linges vei 25, ikke hele Fornebu som teknologisk utviklingsområde.',
  emne_ids: ['em_naer_felt_arbeid_verdiskaping', 'em_naer_geografi_infrastruktur'],
  quiz_profile: {
    place_type: 'transformert_naringsbygg',
    subtype: 'flyplassterminal_til_teknologi_og_kunnskapsmiljo',
    signature_features: ['tidligere terminalbygg på Fornebu flyplass', 'IT Fornebu og kunnskapsbaserte bedrifter', 'konkret overgang fra luftfart til teknologi- og tjenestenæring'],
    primary_angles: ['historie', 'arbeid', 'teknikk', 'konflikt_forandring'],
    question_families: ['historisk_endring', 'funksjon_i_byokonomi', 'arbeid_og_produksjon', 'kontrast'],
    avoid_angles: ['generisk_teknologipark', 'hele_fornebu_som_ett_sted'],
    must_include: ['Terminalbyggets flyplasshistorie', 'ombruk til kunnskaps- og teknologimiljø'],
    contrast_targets: ['construction_city', 'telenor_fornebu', 'nydalen'],
    notes: 'Spør stedet som et konkret transformert terminalbygg og næringsmiljø, ikke som hele Fornebu.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: found.sourceObjectId,
  address: { street: 'Martin Linges vei', number: '25', postcode: '1364', city: 'Fornebu', country: 'NO' },
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
    { type: 'official', label: 'IT Fornebu – Terminalbygget', url: IT_FORNEBU_URL, lang: 'nb', verifiedAt: DATE },
    { type: 'official', label: 'Bærum kommune – Terminalbygget og IT Fornebu', url: BAERUM_URL, lang: 'nb', verifiedAt: DATE }
  ]
};

const remaining = aggregate.filter((item) => item?.id !== PLACE_ID);
writeJson(LEGACY_FILE, remaining);

const splitManifest = readJson(SPLIT_MANIFEST);
if (!Array.isArray(splitManifest.places)) throw new Error(`${SPLIT_MANIFEST} missing places[]`);
const beforeSplit = splitManifest.places.length;
splitManifest.places = splitManifest.places
  .filter((row) => row?.id !== PLACE_ID)
  .map((row, order) => ({ ...row, order }));
if (beforeSplit - splitManifest.places.length !== 1) throw new Error('Could not remove old Fornebu split-manifest row');
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(LEGACY_FILE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex) || splitIndex.filter((row) => row?.id === PLACE_ID).length !== 1) throw new Error('Unexpected old split-index state');
writeJson(SPLIT_INDEX, splitIndex.filter((row) => row?.id !== PLACE_ID));
rmSync(SPLIT_FILE);

writeJson(PLACE_FILE, place);
appendManifest('data/places/manifest.json', PLACE_MANIFEST_ENTRY);

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: 180, coordStatus: 'verified', coordSource: 'geonorge_adresser_v1', coordType: 'address_point', coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'IT Fornebu / Terminalbygget, det tidligere terminalbygget på Oslo lufthavn Fornebu i Martin Linges vei 25',
    identityStatus: 'resolved',
    identityProblem: 'Legacy-recorden var geografisk feilplassert i Oslo-kilden og beskrev et bredt «Fornebu Teknologipark»-område. Den er avgrenset til det konkrete terminalbygget som kildene knytter til IT Fornebu og teknologisk kunnskapsnæring.',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig fysisk terminalbygg', 'korrekt Bærum/Akershus-geografi', 'offisiell adressekoordinat', 'fersk canonical kollisjonskontroll'],
  evidence: [
    { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Martin Linges vei 25', sourceUrl: found.sourceUrl, sourceObjectId: found.sourceObjectId, sourceQuality: 'official_address', finding: 'Ett entydig offisielt adressepunkt for Martin Linges vei 25 i Bærum kommune.', canVerifyCoordinate: true, reason: coordNote },
    { sourceProvider: 'manual_research', sourceName: 'IT Fornebu Properties – Terminalbygget', sourceUrl: IT_FORNEBU_URL, sourceObjectId: 'it-fornebu:terminalbygget', sourceQuality: 'official_institution_identity', finding: 'Identifiserer bygget som den tidligere terminalbygningen på Oslo Flyplass Fornebu og som miljø for kunnskapsbaserte bedrifter.', canVerifyCoordinate: false, reason: 'Dokumenterer den fysiske identiteten og næringsfunksjonen; Geonorge brukes som koordinatkilde.' },
    { sourceProvider: 'manual_research', sourceName: 'Bærum kommune – Rik på historie: nyere arkitektur', sourceUrl: BAERUM_URL, sourceObjectId: 'baerum-kommune:it-fornebu-terminalbygget', sourceQuality: 'municipal_identity_context', finding: 'Kommunen beskriver det tidligere terminalbygget som transformert til et senter for bedrifter som arbeider med digital teknologi.', canVerifyCoordinate: false, reason: 'Uavhengig kommunal kryssjekk av identitet og geografi.' },
    { sourceProvider: 'manual_research', sourceName: 'Store norske leksikon – Oslo lufthavn, Fornebu', sourceUrl: SNL_URL, sourceObjectId: 'snl:oslo-lufthavn-fornebu-terminal-it-fornebu', sourceQuality: 'reference_identity_context', finding: 'SNL knytter terminalbygningen til næringshagen og kunnskapsparken IT-Fornebu.', canVerifyCoordinate: false, reason: 'Historisk og institusjonell kryssjekk av ombruken.' }
  ],
  addressCandidates: [{ address: 'Martin Linges vei 25, 1364 Fornebu', sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'it-fornebu:terminalbygget', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'baerum-kommune:it-fornebu-terminalbygget', canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: 'display_marker', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Canonical-recorden er flyttet til Akershus/Bærum og forankret på det eksakte offisielle adressepunktet for Terminalbygget.' },
  notes: [coordNote, `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id ?? 'ingen'} på ${nearby[0]?.distanceMeters ?? 'n/a'} meter; ingen markør lå innen 3 meter.`, `Legacy-koordinaten ${oldPlace.lat}, ${oldPlace.lon} og den brede identiteten «${oldPlace.name}» er pensjonert.`]
};
writeJson(EVIDENCE_FILE, evidence);
rmSync(OLD_EVIDENCE_FILE);
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files)) throw new Error(`${EVIDENCE_MANIFEST} missing files[]`);
if (!evidenceManifest.files.includes(OLD_EVIDENCE_ENTRY)) throw new Error('Old Fornebu evidence manifest entry missing');
evidenceManifest.files = evidenceManifest.files.filter((entry) => entry !== OLD_EVIDENCE_ENTRY && entry !== EVIDENCE_ENTRY);
evidenceManifest.files.push(EVIDENCE_ENTRY);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const civicationUpdated = [];
for (const file of CIVICATION_FILES) {
  if (!existsSync(file)) continue;
  const payload = readJson(file);
  let count = 0;
  const visit = (value) => {
    if (value == null || typeof value !== 'object') return;
    if (Array.isArray(value)) { for (const item of value) visit(item); return; }
    if (value.historyGoPlaceId === PLACE_ID) {
      value.historyGoSourceFile = PLACE_MANIFEST_ENTRY;
      value.name = place.name;
      value.category = place.category;
      value.lat = place.lat;
      value.lon = place.lon;
      value.emne_ids = [...place.emne_ids];
      count += 1;
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(payload);
  if (count > 0) {
    writeJson(file, payload);
    civicationUpdated.push({ file, count });
  }
}

const removedI18n = [];
for (const file of I18N_FILES) {
  const data = readJson(file);
  if (Object.prototype.hasOwnProperty.call(data, PLACE_ID)) {
    delete data[PLACE_ID];
    writeJson(file, data);
    removedI18n.push(file);
  }
}

const lines = protocol.split('\n');
const oldRows = lines.map((line, index) => line.includes(`\`${PLACE_ID}\``) ? index : -1).filter((index) => index >= 0);
if (oldRows.length !== 1) throw new Error(`Expected one unresolved protocol row for ${PLACE_ID}, got ${oldRows.length}`);
protocol = lines.filter((_, index) => !oldRows.includes(index)).join('\n');
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | IT Fornebu – Terminalbygget | verified; moved to Akershus | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved geografisk og identitetsmessig korrigering. Den brede legacy-markøren «Fornebu Teknologipark» lå i Oslo-kilden selv om det dokumenterte stedet ligger i Bærum. Source-first-researchen avgrenser stedet til det tidligere terminalbygget på Oslo lufthavn Fornebu, senere brukt som IT Fornebu og kunnskaps-/teknologimiljø. Geonorge gir ett eksakt adresseobjekt for Martin Linges vei 25. PlaceId beholdes for eksisterende quiz- og relasjonskoblinger, mens canonical record og evidens flyttes til Akershus.\n`;
writeFileSync(PROTOCOL_FILE, protocol, 'utf8');

writeJson(`${REPORT_DIR}/batch-190-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_geographic_identity_relocation',
  legacy: { file: LEGACY_FILE, name: oldPlace.name, coordinate: { lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r }, evidenceFile: OLD_EVIDENCE_FILE },
  current: { file: PLACE_FILE, name: place.name, coordinate: { lat, lon, r: place.r }, sourceObjectId: found.sourceObjectId, coordStatus: place.coordStatus, evidenceFile: EVIDENCE_FILE },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  civicationUpdated,
  removedStaleI18nEntries: removedI18n,
  checks: { expectedPreviousBatch: 189, researchLocked: true, exactAddressSourceLocked: true, municipalityLockedToBaerum: true, noCanonicalWithin3m: true, legacyRecordRemoved: true, oldSplitArtifactsRemoved: true, dedicatedAkershusFileCreated: true, oldOsloEvidenceRetired: true, evidenceManifestMoved: true, unresolvedProtocolRowRemoved: true }
});

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, name: place.name, sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, movedFrom: 'oslo', movedTo: 'akershus/baerum', nearestCanonicalBeforeWrite: nearby[0] ?? null, civicationUpdated, removedStaleI18nEntries: removedI18n }, null, 2));
