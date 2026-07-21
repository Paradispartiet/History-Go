#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 132;
const date = '2026-07-21';
const placeId = 'helvete_neseblod_records';
const expectedSourceObjectId = 'osm-node:2847570870';
const officialShopUrl = 'https://neseblodrecords.bigcartel.com/';
const officialRegistryUrl = 'https://virksomhet.brreg.no/nb/oppslag/underenheter/986015469';

const aggregateFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur.json');
const childFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur/helvete_neseblod_records.json');
const splitIndexFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_index.json');
const splitManifestFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceRel = 'oslo/subkultur/helvete_neseblod_records.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceRel);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-132-neseblod-exact-poi');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

// 1) Mandatory address-first attempt. Current first-party/government sources identify
// Schweigaards gate 56, but the official address register has both 56A and 56B.
const addressParams = new URLSearchParams({
  adressenavn: 'Schweigaards gate',
  nummer: '56',
  kommunenummer: '0301',
  treffPerSide: '100',
});
const addressUrl = `https://ws.geonorge.no/adresser/v1/sok?${addressParams.toString()}`;
const addressResponse = await fetch(addressUrl, { headers: { Accept: 'application/json' } });
if (!addressResponse.ok) throw new Error(`Geonorge-kall feilet: HTTP ${addressResponse.status}`);
const addressPayload = await addressResponse.json();
writeJson(path.join(reportDir, 'geonorge-schweigaards-gate-56.json'), addressPayload);
const addressHits = (Array.isArray(addressPayload?.adresser) ? addressPayload.adresser : []).filter((hit) =>
  norm(hit?.adressenavn) === norm('Schweigaards gate') &&
  String(hit?.nummer ?? '').trim() === '56' &&
  String(hit?.kommunenummer ?? '').trim() === '0301'
);
if (addressHits.length < 2) throw new Error(`Forventet dokumentert address-first-tvetydighet ved nr. 56; fant ${addressHits.length} treff`);
const addressLetters = [...new Set(addressHits.map((hit) => String(hit?.bokstav ?? '').trim()).filter(Boolean))].sort();
if (!(addressLetters.includes('A') && addressLetters.includes('B'))) {
  throw new Error(`Geonorge-adressebildet har endret seg; forventet A og B, fikk ${JSON.stringify(addressLetters)}`);
}

// 2) Exact named POI fallback after address ambiguity. No nearest-address choice is allowed.
const query = 'Neseblod Records, Oslo, Norway';
const poiUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(query) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.70%2C59.94%2C10.82%2C59.88';
const poiResponse = await fetch(poiUrl, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!poiResponse.ok) throw new Error(`Nominatim-kall feilet: HTTP ${poiResponse.status}`);
const poiRows = await poiResponse.json();
writeJson(path.join(reportDir, 'neseblod-nominatim-search.json'), poiRows);
const exactPoi = (Array.isArray(poiRows) ? poiRows : []).filter((row) => {
  const exactName = norm(row?.namedetails?.name || row?.name) === norm('Neseblod Records');
  const exactType = row?.category === 'shop' && row?.type === 'music';
  const stablePoint = row?.osm_type === 'node' && row?.geojson?.type === 'Point';
  const osloScope = Number(row?.lat) > 59.88 && Number(row?.lat) < 59.94 && Number(row?.lon) > 10.70 && Number(row?.lon) < 10.82;
  return exactName && exactType && stablePoint && osloScope;
});
if (exactPoi.length !== 1) throw new Error(`Neseblod krever ett eksakt navngitt shop=music-POI; fant ${exactPoi.length}`);
const poi = exactPoi[0];
const sourceObjectId = `osm-${poi.osm_type}:${poi.osm_id}`;
if (sourceObjectId !== expectedSourceObjectId) throw new Error(`Neseblod stable object drift: forventet ${expectedSourceObjectId}, fikk ${sourceObjectId}`);
const lat = Number(poi.lat);
const lon = Number(poi.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Neseblod POI mangler gyldig lat/lon');
const osmUrl = `https://www.openstreetmap.org/${poi.osm_type}/${poi.osm_id}`;

const coordinateFields = {
  lat,
  lon,
  r: 80,
  locatorType: 'poi',
  sourceProvider: 'osm',
  sourceObjectId,
  address: {
    street: 'Schweigaards gate',
    number: '56',
    postcode: '0656',
    city: 'Oslo',
    country: 'NO',
  },
  geocodeAccuracy: 'geometric_center',
  coordRole: 'site_center',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap node ${poi.osm_id} – Neseblod Records; current identity/address cross-checked with Neseblod Records and Brønnøysundregistrene`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: osmUrl,
  coordType: 'poi_center',
  coordVerifiedAt: date,
  coordNote: `Batch 132 address-first + exact-POI fallback: Neseblod Records' aktive nettbutikk og Brønnøysundregistrene oppgir Schweigaards gate 56, men Geonorge har to offisielle adresseobjekter på nummeret, 56A og 56B. Address-first kunne derfor ikke velge et adressepunkt og ble eksplisitt forkastet som tvetydig. Nominatim/OSM returnerte deretter nøyaktig ett eksakt navngitt shop=music-punkt i lokal Gamlebyen-scope, ${sourceObjectId}. Dette punktet brukes som site-center for den nåværende Neseblod Records-butikken og stedet som History Go kobler til den historiske Helvete-fortellingen; ingen A/B-adresse er valgt etter nærhet.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = { ...place, ...coordinateFields };
  delete updated.coordPrecisionM;
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'official', label: 'Neseblod Records', url: officialShopUrl, lang: 'en', verifiedAt: date },
    { type: 'official_registry', label: 'Brønnøysundregistrene – NESEBLOD RECORDS AS', url: officialRegistryUrl, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_subkultur.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('Helvete/Neseblod må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Helvete/Neseblod mangler i split-index');
Object.assign(indexRow, { lat, lon, r: updatedPlace.r, coordStatus: updatedPlace.coordStatus, coordType: updatedPlace.coordType });
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Helvete/Neseblod mangler i split-manifest');
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(splitManifestFile, splitManifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/subkultur/oslo/places_subkultur.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: updatedPlace.r, coordStatus: updatedPlace.coordStatus, coordSource: updatedPlace.coordSource, coordType: updatedPlace.coordType, coordNote: updatedPlace.coordNote },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Neseblod Records – nåværende platebutikk på Schweigaards gate 56, brukt som fysisk anker for den kombinerte Helvete/Neseblod-stedsfortellingen',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'poi',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['nåværende first-party butikkidentitet', 'offentlig virksomhetsadresse', 'dokumentert address-first-tvetydighet', 'ett eksakt navngitt stabilt POI-objekt'],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Neseblod Records – active official shop',
      sourceUrl: officialShopUrl,
      sourceObjectId: 'neseblod-official:schweigaards-gate-56',
      sourceQuality: 'first_party_current_identity_and_address',
      finding: 'Neseblod Records oppgir aktiv butikk på Schweigaards Gt. 56, 0656 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter nåværende fysisk identitet og gateadresse, men ikke A/B-deladresse.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – NESEBLOD RECORDS AS underenhet',
      sourceUrl: officialRegistryUrl,
      sourceObjectId: 'brreg-underenhet:986015469',
      sourceQuality: 'official_government_location_registry',
      finding: 'Brønnøysundregistrene oppgir beliggenhetsadresse Schweigaardsgate 56, 0656 Oslo, kommune 0301.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter nåværende virksomhet på nr. 56, men registeroppføringen skiller ikke A/B.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: addressUrl,
      sourceObjectId: 'geonorge-address-ambiguity:0301:16260:56A+56B',
      sourceQuality: 'official_address_ambiguous_for_place_identity',
      finding: `Address-first ga to offisielle kandidater: ${addressHits.map((hit) => hit.adressetekst).join(', ')}. Ingen ble valgt.`,
      canVerifyCoordinate: false,
      reason: 'Offisiell gateadresse uten bokstav kan ikke avgjøre hvilket matrikkelpunkt som representerer butikken.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap node ${poi.osm_id} – Neseblod Records`,
      sourceUrl: osmUrl,
      sourceObjectId,
      sourceQuality: 'exact_named_poi_after_address_first_ambiguity',
      finding: `Ett eksakt navngitt shop=music-punkt i forhåndsdefinert lokal scope ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: coordinateFields.coordNote,
    },
  ],
  addressCandidates: addressHits.map((hit) => ({
    sourceProvider: 'official_address',
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav || ''}`,
    address: { street: hit.adressenavn, number: `${hit.nummer}${hit.bokstav || ''}`, postcode: hit.postnummer, city: hit.poststed === 'OSLO' ? 'Oslo' : hit.poststed, country: 'NO' },
    lat: hit.representasjonspunkt?.lat,
    lon: hit.representasjonspunkt?.lon,
    canApplyToPlace: false,
  })),
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'site_center', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Neseblod er oppgradert med eksakt navngitt POI etter dokumentert tvetydig address-first.' },
  notes: [coordinateFields.coordNote],
});

const evidenceManifest = readJson(evidenceManifestFile);
if (!Array.isArray(evidenceManifest.files)) throw new Error('Evidence manifest mangler files[]');
if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 132 (2026-07-21)')) {
  const row = `| 132 | \`helvete_neseblod_records\` | Helvete / Neseblod Records | verified_geometry | \`${sourceObjectId}\` |`;
  const paragraph = `Batch 132 (2026-07-21) reviderer \`helvete_neseblod_records\` med address-first før POI-fallback. Neseblod Records og Brønnøysundregistrene oppgir Schweigaards gate 56, men Geonorge har både 56A og 56B og ingen primærkilde i batchen avgjør bokstavleddet. Ingen adressekandidat velges derfor. I stedet kreves nøyaktig ett eksakt navngitt \`shop=music\`-POI i lokal Gamlebyen-scope; live oppslag gir \`${sourceObjectId}\`. Punktet brukes som site-center for dagens Neseblod Records og fysisk anker for den kombinerte Helvete/Neseblod-stedsfortellingen. Den gamle Yandex-/legacy-forankringen fjernes.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 132');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder:/, (_m, n) => `Oslo-protokollen dekker nå ${Number(n) + 1} aktive current \`verified*\` canonical Oslo-steder:`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  addressFirst: { status: 'ambiguous_rejected', candidates: addressHits.map((hit) => ({ address: hit.adressetekst, lat: hit.representasjonspunkt?.lat, lon: hit.representasjonspunkt?.lon })) },
  poiFallback: { sourceObjectId, type: `${poi.category}=${poi.type}`, lat, lon },
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 132 – Neseblod exact POI after address ambiguity', '',
  '- current primary-source address: Schweigaards gate 56',
  `- Geonorge address candidates: ${addressHits.map((hit) => hit.adressetekst).join(', ')}`,
  '- address decision: rejected as ambiguous; no nearest candidate selected',
  `- exact named POI: \`${sourceObjectId}\` (shop=music)`,
  `- coordinate: ${lat}, ${lon}`, '',
  'The place is verified only through the exact named stable POI after the mandatory address-first path proved non-unique.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const runtimePlace = readJson(runtimeIndexFile).find((place) => place?.id === placeId);
if (!runtimePlace) throw new Error('Runtime mangler Helvete/Neseblod etter build');
for (const field of ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordStatus','coordSource','coordType','coordNote']) {
  if (JSON.stringify(runtimePlace[field] ?? null) !== JSON.stringify(updatedPlace[field] ?? null)) throw new Error(`Runtime/source mismatch for ${field}`);
}

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 18) throw new Error(`Batch 132 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, placeId, sourceObjectId, lat, lon, changedFileCount: changedFiles.length }, null, 2));
