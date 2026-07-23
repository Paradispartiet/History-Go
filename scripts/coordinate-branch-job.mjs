import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const BATCH = 189;
const PLACE_ID = 'ulven_handelspark';
const AGGREGATE_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv/ulven_handelspark.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/naeringsliv/ulven_handelspark.json';
const RESEARCH_FILE = 'reports/oslo-coordinate-ulven-handelspark-construction-city-research/summary.json';
const PROTOCOL_FILE = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-189-construction-city';
const OFFICIAL_ABOUT = 'https://constructioncity.no/om-construction-city/';
const OFFICIAL_CONTACT = 'https://constructioncity.no/om-construction-city/kontakt/';
const MUNICIPAL_SOURCE = 'https://aktuelt.oslo.kommune.no/fagskolen-flytter-til-construction-city-p%C3%A5-ulven';
const EXPECTED_SOURCE = 'geonorge-adresser-v1:0301:21534:1';
const EXPECTED_LAT = 59.924017628728656;
const EXPECTED_LON = 10.81017987877654;
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];

mkdirSync(REPORT_DIR, { recursive: true });
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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

let protocol = readFileSync(PROTOCOL_FILE, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1])));
if (maxBatch !== 188) throw new Error(`Expected previous coordinate batch 188, got ${maxBatch}`);

const research = readJson(RESEARCH_FILE);
if (research.placeId !== PLACE_ID || research.candidateIdentity?.name !== 'Construction City') {
  throw new Error('Merged Construction City research is missing or changed');
}
if (research.coordinateCandidate?.sourceObjectId !== EXPECTED_SOURCE) throw new Error('Research source object changed');
if (research.duplicateDecision?.exactCollisionWithin3m !== false) throw new Error('Research reported a collision');

const build = spawnSync('npm', ['run', 'build:tools'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ''}${build.stderr ?? ''}`, 'utf8');
if (build.status !== 0) throw new Error(`build:tools failed with ${build.status}`);

const finder = spawnSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Standardveien 1 0581 Oslo'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout ?? ''}${finder.stderr ?? ''}`, 'utf8');
const found = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || found?.status !== 'verified_candidate') throw new Error(`Address-first failed: ${found?.status ?? 'parse_error'}`);
if (found.sourceObjectId !== EXPECTED_SOURCE) throw new Error(`Unexpected Geonorge object ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat);
const lon = Number(found.coordinate?.lon);
if (Math.abs(lat - EXPECTED_LAT) > 1e-10 || Math.abs(lon - EXPECTED_LON) > 1e-10) {
  throw new Error(`Construction City coordinate changed: ${lat}, ${lon}`);
}

const currentPlaces = extractPlaces(readJson('data/places/places_index.json'));
const nearby = currentPlaces
  .filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Canonical collision with ${nearby[0].id} at ${nearby[0].distanceMeters} m`);

const aggregate = readJson(AGGREGATE_FILE);
if (!Array.isArray(aggregate)) throw new Error(`${AGGREGATE_FILE} is not an array`);
const oldMatches = aggregate.filter((place) => place?.id === PLACE_ID);
if (oldMatches.length !== 1) throw new Error(`Expected one legacy ${PLACE_ID}, got ${oldMatches.length}`);
const oldPlace = oldMatches[0];
if (oldPlace.coordStatus || oldPlace.sourceObjectId || oldPlace.locatorType) throw new Error('Legacy Ulven record unexpectedly already contracted');

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Standardveien 1, 0581 Oslo. Construction Citys egne sider dokumenterer samme besøksadresse og identifiserer stedet som en fysisk nærings- og kunnskapsklynge på Ulven. Punktet brukes som canonical display-marker for Construction City, ikke som et generelt områdeanker for hele Ulven eller Hovinbyen.';
const place = {
  ...oldPlace,
  name: 'Construction City',
  lat,
  lon,
  r: 160,
  year: 2025,
  desc: 'Nærings- og kunnskapsklynge på Ulven for bygg-, anleggs- og eiendomsnæringen.',
  popupDesc: 'Construction City på Ulven samler bedrifter, organisasjoner og utdanningsmiljøer fra bygg-, anleggs- og eiendomsnæringen i ett stort klyngebygg. Stedet åpnet i 2025 og er et konkret uttrykk for hvordan tidligere industri- og næringsarealer på Ulven får nye funksjoner knyttet til kunnskapsdeling, samarbeid og arbeidsplasser.\n\nI History Go representerer stedet den moderne næringsklyngen som fysisk institusjon. Det skal ikke leses som et generelt «handelspark»-område eller som en markør for hele Ulven-transformasjonen.',
  emne_ids: [
    'em_naer_felt_arbeid_verdiskaping',
    'em_naer_geografi_infrastruktur'
  ],
  quiz_profile: {
    place_type: 'naeringsklynge',
    subtype: 'bygg_anlegg_eiendom_kunnskapsklynge',
    signature_features: [
      'Construction City på Ulven',
      'samler bygg-, anleggs- og eiendomsnæringen',
      'fysisk klyngebygg for arbeid, kunnskap og samarbeid'
    ],
    primary_angles: ['historie', 'arbeid', 'teknikk', 'konflikt_forandring'],
    question_families: ['historisk_endring', 'funksjon_i_byokonomi', 'arbeid_og_produksjon', 'kontrast'],
    avoid_angles: ['generisk_handelspark', 'generisk_turistsporsmal'],
    must_include: ['rollen som næringsklynge', 'koblingen mellom Ulven-transformasjon og nye arbeidsmiljøer'],
    contrast_targets: ['nydalen', 'helsfyr', 'vulkan_energisentral'],
    notes: 'Spør stedet som konkret nærings- og kunnskapsklynge, ikke som et generelt handelsområde på Ulven.'
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
    { type: 'official', label: 'Construction City – om klyngen', url: OFFICIAL_ABOUT, lang: 'nb', verifiedAt: DATE },
    { type: 'official', label: 'Construction City – kontakt og besøksadresse', url: OFFICIAL_CONTACT, lang: 'nb', verifiedAt: DATE }
  ]
};
delete place.underbadge_ids;

const nextAggregate = aggregate.map((item) => item?.id === PLACE_ID ? place : item);
writeJson(AGGREGATE_FILE, nextAggregate);
writeJson(SPLIT_FILE, place);

const splitManifest = readJson(SPLIT_MANIFEST);
if (!Array.isArray(splitManifest.places)) throw new Error(`${SPLIT_MANIFEST} missing places[]`);
const manifestRows = splitManifest.places.filter((row) => row?.id === PLACE_ID);
if (manifestRows.length !== 1) throw new Error(`Expected one split-manifest row, got ${manifestRows.length}`);
splitManifest.places = splitManifest.places.map((row) => row?.id === PLACE_ID ? { ...row, name: place.name, category: place.category, year: place.year, sha256: sha256(SPLIT_FILE) } : row);
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(AGGREGATE_FILE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex) || splitIndex.filter((row) => row?.id === PLACE_ID).length !== 1) throw new Error('Unexpected split-index state');
const indexRow = {
  ...splitIndex.find((row) => row?.id === PLACE_ID),
  id: place.id,
  name: place.name,
  category: place.category,
  lat: place.lat,
  lon: place.lon,
  r: place.r,
  year: place.year,
  coordStatus: place.coordStatus,
  coordType: place.coordType,
  locatorType: place.locatorType,
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  address: place.address,
  geocodeAccuracy: place.geocodeAccuracy,
  coordRole: place.coordRole,
  coordSource: place.coordSource,
  coordVerifiedAt: place.coordVerifiedAt,
  coordNote: place.coordNote
};
writeJson(SPLIT_INDEX, splitIndex.map((row) => row?.id === PLACE_ID ? indexRow : row));

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: AGGREGATE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: 160, coordStatus: 'verified', coordSource: 'geonorge_adresser_v1', coordType: 'address_point', coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Construction City, det fysiske nærings- og klyngebygget på Standardveien 1 på Ulven',
    identityStatus: 'resolved',
    identityProblem: 'Legacy-navnet «Ulven handelspark» kunne ikke dokumenteres som en stabil fysisk entitet og er derfor korrigert til den kildebelagte institusjonen Construction City.',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig fysisk institusjonsidentitet', 'offisiell besøksadresse', 'fersk kollisjonskontroll mot canonical steder'],
  evidence: [
    { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Standardveien 1', sourceUrl: found.sourceUrl, sourceObjectId: found.sourceObjectId, sourceQuality: 'official_address', finding: 'Ett entydig offisielt adressepunkt for Standardveien 1, 0581 Oslo.', canVerifyCoordinate: true, reason: coordNote },
    { sourceProvider: 'manual_research', sourceName: 'Construction City – Om Construction City', sourceUrl: OFFICIAL_ABOUT, sourceObjectId: 'construction-city:about', sourceQuality: 'official_institution_identity', finding: 'Construction Citys egen side identifiserer stedet som en fysisk møteplass og klynge for bygg-, anleggs- og eiendomsnæringen på Ulven.', canVerifyCoordinate: false, reason: 'Dokumenterer institusjonsidentitet og fysisk scope; Geonorge brukes som koordinatkilde.' },
    { sourceProvider: 'manual_research', sourceName: 'Construction City – Kontakt', sourceUrl: OFFICIAL_CONTACT, sourceObjectId: 'construction-city:contact-standardveien-1', sourceQuality: 'official_current_site', finding: 'Offisiell kontaktside oppgir besøksadressen Standardveien 1, 0581 Oslo.', canVerifyCoordinate: false, reason: 'Kryssjekker at den offisielle adressekoordinaten gjelder den løste institusjonen.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo kommune – Fagskolen flytter til Construction City på Ulven', sourceUrl: MUNICIPAL_SOURCE, sourceObjectId: 'oslo-kommune:construction-city-ulven', sourceQuality: 'municipal_identity_context', finding: 'Oslo kommune identifiserer Construction City som en kunnskapspark på Ulven for virksomheter innen bygg-, anlegg- og eiendomssektoren.', canVerifyCoordinate: false, reason: 'Uavhengig offentlig kryssjekk av identitet og Ulven-tilknytning.' }
  ],
  addressCandidates: [{ address: 'Standardveien 1, 0581 Oslo', sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'construction-city:about', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'construction-city:contact-standardveien-1', canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: 'display_marker', sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Construction City er anvendt som korrigert canonical identitet på det eksakte offisielle adressepunktet for Standardveien 1.' },
  notes: [coordNote, `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id ?? 'ingen'} på ${nearby[0]?.distanceMeters ?? 'n/a'} meter; ingen markør lå innen 3 meter.`, `Legacy-identiteten «${oldPlace.name}» og områdepunktet ${oldPlace.lat}, ${oldPlace.lon} er pensjonert som udokumentert fysisk sted.`]
};
writeJson(EVIDENCE_FILE, evidence);

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
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Construction City | verified identity correction | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved å korrigere den udokumenterte legacy-identiteten «Ulven handelspark» til det konkrete, kildebelagte nærings- og klyngebygget Construction City på Ulven. Production revaliderer Geonorge-objektet for Standardveien 1 og krever eksakt koordinat lik den mergede source-first-researchen. PlaceId beholdes for eksisterende relasjoner og quizkoblinger, mens navn, beskrivelse, fysisk scope og koordinatkontrakt oppdateres. Punktet representerer Construction City-bygget, ikke hele Ulven eller Hovinbyen.\n`;
writeFileSync(PROTOCOL_FILE, protocol, 'utf8');

writeJson(`${REPORT_DIR}/batch-189-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'verified_identity_correction',
  legacy: { name: oldPlace.name, coordinate: { lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r } },
  current: { name: place.name, coordinate: { lat, lon, r: place.r }, sourceObjectId: found.sourceObjectId, coordStatus: place.coordStatus },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  removedStaleI18nEntries: removedI18n,
  checks: { expectedPreviousBatch: 188, researchLocked: true, exactAddressSourceLocked: true, noCanonicalWithin3m: true, aggregateAndSplitUpdated: true, evidenceApplied: true, unresolvedProtocolRowRemoved: true }
});

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, name: place.name, sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, nearestCanonicalBeforeWrite: nearby[0] ?? null, removedStaleI18nEntries: removedI18n }, null, 2));
