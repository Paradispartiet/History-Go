#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 129;
const date = '2026-07-21';
const sourceRoot = path.join(root, 'data/places/subkultur/oslo');
const aggregateFile = path.join(sourceRoot, 'places_subkultur.json');
const splitDir = path.join(sourceRoot, 'places_subkultur');
const splitManifestFile = path.join(sourceRoot, 'places_subkultur_manifest.json');
const splitIndexFile = path.join(sourceRoot, 'places_subkultur_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-129-revolver-stovnertarnet');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[.'’`]/g, '').replace(/\s+/g, ' ').trim();
const COORD_FIELDS = ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote'];

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

function geonorgeId(hit) {
  const municipality = String(hit?.kommunenummer ?? '').trim();
  const code = String(hit?.adressekode ?? '').trim();
  const number = String(hit?.nummer ?? '').trim();
  const letter = String(hit?.bokstav ?? '').trim();
  if (!municipality || !code || !number) throw new Error('Ufullstendig Geonorge-identitet');
  return `geonorge-adresser-v1:${municipality}:${code}:${number}${letter}`;
}

const places = readJson(aggregateFile);
if (!Array.isArray(places)) throw new Error('places_subkultur.json må være array');
const byId = new Map(places.filter((place) => place?.id).map((place) => [String(place.id), place]));
for (const id of ['revolver_oslo', 'stovnertarnet']) if (!byId.has(id)) throw new Error(`Mangler ${id}`);

// Revolver: precise registered address resolves the old Møllergata 32 ambiguity to 32B.
const revolverQuery = 'Møllergata 32B Oslo';
const revolverUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=' + encodeURIComponent(revolverQuery);
const revolverRaw = await fetchJson(revolverUrl);
writeJson(path.join(reportDir, 'revolver-oslo-geonorge.json'), revolverRaw);
const revolverHits = Array.isArray(revolverRaw?.adresser) ? revolverRaw.adresser : [];
const revolverExact = revolverHits.filter((hit) =>
  String(hit?.kommunenummer ?? '') === '0301'
  && norm(hit?.adressenavn) === norm('Møllergata')
  && String(hit?.nummer ?? '') === '32'
  && String(hit?.bokstav ?? '').toUpperCase() === 'B'
);
if (revolverExact.length !== 1) throw new Error(`Revolver krever ett eksakt Geonorge-treff for Møllergata 32B; fant ${revolverExact.length}`);
const revolverHit = revolverExact[0];
const revolverLat = revolverHit?.representasjonspunkt?.lat;
const revolverLon = revolverHit?.representasjonspunkt?.lon;
if (typeof revolverLat !== 'number' || typeof revolverLon !== 'number') throw new Error('Revolver Geonorge-treff mangler representasjonspunkt');
const revolverSourceObjectId = geonorgeId(revolverHit);

const revolver = byId.get('revolver_oslo');
revolver.lat = revolverLat;
revolver.lon = revolverLon;
revolver.r = 60;
revolver.locatorType = 'building';
revolver.sourceProvider = 'official_address';
revolver.sourceObjectId = revolverSourceObjectId;
revolver.address = {
  street: String(revolverHit?.adressenavn ?? 'Møllergata'),
  number: String(revolverHit?.nummer ?? '32') + String(revolverHit?.bokstav ?? 'B'),
  postcode: String(revolverHit?.postnummer ?? ''),
  city: 'Oslo',
  country: 'NO',
};
revolver.geocodeAccuracy = 'rooftop';
revolver.coordRole = 'display_marker';
revolver.coordType = 'address_point';
revolver.coordStatus = 'verified';
revolver.coordSource = 'geonorge_adresser_v1';
revolver.coordSourceId = revolverSourceObjectId;
revolver.coordSourceUrl = revolverUrl;
revolver.coordVerifiedAt = date;
revolver.coordNote = 'Batch 129 address-first: Revolvers egen side og VisitOSLO oppgir Møllergata 32, mens Brønnøysundregistrenes virksomhetsadresse presiserer Møllergata 32B. Den presise registrerte adressen ble derfor brukt som address-first-kandidat. Ett eksakt Oslo-treff i Geonorge Adresser API v1 brukes som canonical display-marker; den tidligere manuelle kartplasseringen beholdes ikke som primær koordinatkilde.';
delete revolver.coordPrecisionM;

// Stovnertårnet: physical POI, resolved by direct stable-ID lookup rather than address proxy.
const towerLookupUrl = 'https://nominatim.openstreetmap.org/lookup?osm_ids=N5163964280&format=jsonv2&namedetails=1&extratags=1';
const towerRows = await fetchJson(towerLookupUrl);
writeJson(path.join(reportDir, 'stovnertarnet-osm-node-5163964280.json'), towerRows);
if (!Array.isArray(towerRows) || towerRows.length !== 1) throw new Error(`Stovnertårnet direct lookup ga ${Array.isArray(towerRows) ? towerRows.length : 'ikke-array'} treff`);
const towerHit = towerRows[0];
if (towerHit?.osm_type !== 'node' || Number(towerHit?.osm_id) !== 5163964280) throw new Error('Stovnertårnet direct lookup returnerte feil stable object');
if (norm(towerHit?.namedetails?.name || towerHit?.name) !== norm('Stovnertårnet')) throw new Error(`Uventet Stovnertårnet-navn: ${towerHit?.namedetails?.name || towerHit?.name}`);
if (towerHit?.category !== 'tourism' || towerHit?.type !== 'viewpoint') throw new Error(`Uventet Stovnertårnet-objekttype: ${towerHit?.category}/${towerHit?.type}`);
const towerLat = Number(towerHit.lat);
const towerLon = Number(towerHit.lon);
if (!(towerLat > 59.90 && towerLat < 60.05 && towerLon > 10.80 && towerLon < 11.00)) throw new Error('Stovnertårnet stable object utenfor forhåndsdefinert Stovner-scope');

const tower = byId.get('stovnertarnet');
tower.lat = towerLat;
tower.lon = towerLon;
tower.r = 100;
tower.locatorType = 'poi';
tower.sourceProvider = 'osm';
tower.sourceObjectId = 'osm-node:5163964280';
tower.geocodeAccuracy = 'geometric_center';
tower.coordRole = 'site_center';
tower.coordType = 'viewpoint_point';
tower.coordStatus = 'verified_geometry';
tower.coordSource = 'OpenStreetMap node 5163964280 – Stovnertårnet; identity cross-checked with Oslo byleksikon, VisitOSLO and DOGA';
tower.coordSourceId = 'osm-node:5163964280';
tower.coordSourceUrl = 'https://www.openstreetmap.org/node/5163964280';
tower.coordVerifiedAt = date;
tower.coordNote = 'Batch 129 object-type-first: Stovnertårnet er et konkret fysisk utsikts-/tårnobjekt på Fossumberget, ikke et adressepunkt for hele området. Direkte stable-ID-oppslag av OSM node 5163964280 gir det eksakt navngitte tourism=viewpoint-objektet Stovnertårnet. Identiteten er kryssjekket mot Oslo byleksikon, VisitOSLO og DOGA. Punktet brukes som site-center for selve tårnet; ingen nearest/first-hit-logikk brukes.';
delete tower.coordPrecisionM;

// Persist aggregate and the two matching split children only.
writeJson(aggregateFile, places);
for (const id of ['revolver_oslo', 'stovnertarnet']) writeJson(path.join(splitDir, `${id}.json`), byId.get(id));

const splitIndex = readJson(splitIndexFile);
for (const id of ['revolver_oslo', 'stovnertarnet']) {
  const source = byId.get(id);
  const row = splitIndex.find((item) => item?.id === id);
  if (!row) throw new Error(`places_subkultur_index mangler ${id}`);
  for (const field of COORD_FIELDS) row[field] = source[field] ?? null;
}
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
for (const id of ['revolver_oslo', 'stovnertarnet']) {
  const row = (splitManifest.places || []).find((item) => item?.id === id);
  if (!row) throw new Error(`places_subkultur_manifest mangler ${id}`);
  row.sha256 = sha256File(path.join(splitDir, `${id}.json`));
}
writeJson(splitManifestFile, splitManifest);

// Coordinate evidence.
const evidenceManifest = readJson(evidenceManifestFile);
const evidenceEntries = ['oslo/subkultur/revolver_oslo.json', 'oslo/subkultur/stovnertarnet.json'];
for (const entry of evidenceEntries) if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

const revolverEvidenceFile = path.join(root, 'data/coordinate-evidence/oslo/subkultur/revolver_oslo.json');
const towerEvidenceFile = path.join(root, 'data/coordinate-evidence/oslo/subkultur/stovnertarnet.json');
fs.mkdirSync(path.dirname(revolverEvidenceFile), { recursive: true });
writeJson(revolverEvidenceFile, {
  schemaVersion: '1.0',
  placeId: 'revolver_oslo',
  placeFile: 'data/places/subkultur/oslo/places_subkultur.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: revolver.lat, lon: revolver.lon, r: revolver.r, coordStatus: revolver.coordStatus, coordSource: revolver.coordSource, coordType: revolver.coordType, coordNote: revolver.coordNote },
  identity: { currentName: revolver.name, resolvedIdentity: 'Revolver – aktiv scene og bar i Møllergata 32B', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['current venue address', 'precise registered sub-address', 'one exact official address point'],
  evidence: [
    { sourceProvider: 'manual_research', sourceName: 'Revolver Oslo / VisitOSLO', sourceUrl: 'https://revolveroslo.no/', sourceObjectId: 'official-venue:revolver-oslo', sourceQuality: 'official_current_venue_identity', finding: 'Venue sources identify Revolver at Møllergata 32.', canVerifyCoordinate: false, reason: 'Establishes current venue identity and street address.' },
    { sourceProvider: 'manual_research', sourceName: 'Brønnøysundregistrene – Revolver Drift AS', sourceUrl: 'https://virksomhet.brreg.no/', sourceObjectId: 'brreg:revolver-drift-as:mollergata-32b', sourceQuality: 'official_business_address_resolution', finding: 'The registered business address resolves the sub-address to Møllergata 32B.', canVerifyCoordinate: false, reason: 'Resolves the address ambiguity before geocoding.' },
    { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Møllergata 32B', sourceUrl: revolver.coordSourceUrl, sourceObjectId: revolver.sourceObjectId, sourceQuality: 'exact_official_address_after_identity_resolution', finding: 'One exact Oslo address result for Møllergata 32B.', canVerifyCoordinate: true, reason: revolver.coordNote },
  ],
  addressCandidates: [{ address: `${revolver.address.street} ${revolver.address.number}, ${revolver.address.postcode} Oslo`, sourceProvider: 'official_address', sourceObjectId: revolver.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: revolver.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId: revolver.sourceObjectId, lat: revolver.lat, lon: revolver.lon, coordRole: 'display_marker', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Exact Geonorge address point applied after precise registered-address resolution.' },
  notes: [revolver.coordNote],
});
writeJson(towerEvidenceFile, {
  schemaVersion: '1.0',
  placeId: 'stovnertarnet',
  placeFile: 'data/places/subkultur/oslo/places_subkultur.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: tower.lat, lon: tower.lon, r: tower.r, coordStatus: tower.coordStatus, coordSource: tower.coordSource, coordType: tower.coordType, coordNote: tower.coordNote },
  identity: { currentName: tower.name, resolvedIdentity: 'Stovnertårnet – konkret utsikts-/tårnobjekt på Fossumberget', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'poi', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['stable named physical object identity', 'exact direct object lookup', 'correct tourism/viewpoint object type'],
  evidence: [
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Stovnertårnet', sourceUrl: 'https://oslobyleksikon.no/side/Stovnert%C3%A5rnet', sourceObjectId: 'oslo-byleksikon:stovnertarnet', sourceQuality: 'local_reference_identity', finding: 'Oslo byleksikon identifies Stovnertårnet at Fossumberget / Karl Fossums vei 30.', canVerifyCoordinate: false, reason: 'Establishes named physical identity and local scope.' },
    { sourceProvider: 'manual_research', sourceName: 'VisitOSLO / DOGA – Stovnertårnet', sourceUrl: 'https://www.visitoslo.com/no/produkt/?name=Stovnertarnet&tlp=3672223', sourceObjectId: 'visitoslo:3672223', sourceQuality: 'current_destination_identity', finding: 'VisitOSLO describes the public tower at Fossumberget behind Stovner Senter.', canVerifyCoordinate: false, reason: 'Cross-checks current physical identity and access context.' },
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap node 5163964280 – Stovnertårnet', sourceUrl: tower.coordSourceUrl, sourceObjectId: tower.sourceObjectId, sourceQuality: 'direct_stable_id_exact_named_viewpoint', finding: 'Direct lookup returns the exact named tourism=viewpoint node Stovnertårnet.', canVerifyCoordinate: true, reason: tower.coordNote },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: tower.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId: tower.sourceObjectId, lat: tower.lat, lon: tower.lon, coordRole: 'site_center', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Direct stable OSM point applied to the physical tower identity.' },
  notes: [tower.coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 129 (2026-07-21)')) {
  const rows = [
    `| 129 | \`revolver_oslo\` | Revolver | verified | \`${revolver.sourceObjectId}\` |`,
    `| 129 | \`stovnertarnet\` | Stovnertårnet | verified_geometry | \`osm-node:5163964280\` |`,
  ].join('\n');
  const paragraph = 'Batch 129 (2026-07-21) gjenåpner to current physical places som retrokontrollen tidligere nedgraderte. `revolver_oslo` løses address-first etter at Brønnøysundregistrene presiserer den generelle venueadressen Møllergata 32 til virksomhetsadressen Møllergata 32B; ett eksakt Geonorge-treff kreves. `stovnertarnet` løses objekt-type-først som det konkrete tårn-/utsiktspunktet og bruker direkte stable-ID-oppslag av det eksakt navngitte OSM-objektet `osm-node:5163964280` (`tourism=viewpoint`). Ingen tidligere manuell kartplassering eller nearest/first-hit-logikk brukes.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 129');
  protocol = protocol.replace(marker, `${rows}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(), batch,
  verified: [
    { placeId: 'revolver_oslo', sourceObjectId: revolver.sourceObjectId, lat: revolver.lat, lon: revolver.lon, method: 'address_first_exact_geonorge_after_registered_subaddress_resolution' },
    { placeId: 'stovnertarnet', sourceObjectId: tower.sourceObjectId, lat: tower.lat, lon: tower.lon, method: 'direct_stable_id_exact_named_viewpoint' },
  ],
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 129 – Revolver and Stovnertårnet', '',
  `- Revolver → \`${revolver.sourceObjectId}\``,
  '- Stovnertårnet → `osm-node:5163964280`', '',
  'Revolver uses exact Geonorge address-first after resolving the registered 32B sub-address. Stovnertårnet uses a direct exact named viewpoint object. No nearest/first-hit logic is used.',
].join('\n'));

// Rebuild and run evidence integrity before standard coordinate branch gates.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 45) throw new Error(`Batch 129 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, revolver: revolver.sourceObjectId, stovnertarnet: tower.sourceObjectId, changedFileCount: changedFiles.length }, null, 2));
