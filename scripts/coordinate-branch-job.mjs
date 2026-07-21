#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 130;
const date = '2026-07-21';
const placeId = 'stovnertarnet';
const expectedSourceObjectId = 'osm-node:5163964280';
const municipalityContextUrl = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/jesperudjordet';
const municipalityProjectUrl = 'https://www.oslo.kommune.no/utmerkelser-og-priser/oslo-bys-arkitekturpris/pameldte/kandidater-til-oslo-bys-arkitekturpris-2018/';

const aggregateFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur.json');
const childFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur/stovnertarnet.json');
const splitIndexFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_index.json');
const splitManifestFile = path.join(root, 'data/places/subkultur/oslo/places_subkultur_manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceRel = 'oslo/subkultur/stovnertarnet.json';
const evidenceFile = path.join(root, 'data/coordinate-evidence', evidenceRel);
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-130-stovnertarnet-exact-poi');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

const query = 'Stovnertårnet, Oslo, Norway';
const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(query) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.85%2C60.02%2C10.98%2C59.92';
const response = await fetch(nominatimUrl, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`Nominatim-kall feilet: HTTP ${response.status}`);
const rows = await response.json();
writeJson(path.join(reportDir, 'stovnertarnet-nominatim-search.json'), rows);

const exact = (Array.isArray(rows) ? rows : []).filter((row) => {
  const exactName = norm(row?.namedetails?.name || row?.name) === norm('Stovnertårnet');
  const exactType = row?.category === 'tourism' && row?.type === 'viewpoint';
  const exactGeometry = row?.osm_type === 'node' && row?.geojson?.type === 'Point';
  const osloScope = Number(row?.lat) > 59.92 && Number(row?.lat) < 60.02 && Number(row?.lon) > 10.85 && Number(row?.lon) < 10.98;
  return exactName && exactType && exactGeometry && osloScope;
});
if (exact.length !== 1) throw new Error(`Stovnertårnet krever ett eksakt navngitt tourism=viewpoint-punkt; fant ${exact.length}`);
const hit = exact[0];
const sourceObjectId = `osm-${hit.osm_type}:${hit.osm_id}`;
if (sourceObjectId !== expectedSourceObjectId) throw new Error(`Stovnertårnet stable object drift: forventet ${expectedSourceObjectId}, fikk ${sourceObjectId}`);
const lat = Number(hit.lat);
const lon = Number(hit.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Stovnertårnet-kandidaten mangler gyldig lat/lon');
const osmUrl = `https://www.openstreetmap.org/${hit.osm_type}/${hit.osm_id}`;

const coordinateFields = {
  lat,
  lon,
  r: 90,
  locatorType: 'poi',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'exact_point',
  coordRole: 'display_marker',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap node ${hit.osm_id} – Stovnertårnet; identity and local scope cross-checked with Oslo kommune`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: osmUrl,
  coordType: 'poi_point',
  coordVerifiedAt: date,
  coordNote: `Batch 130 object-type-first: Karl Fossums vei 30 brukes ikke som adresseanker fordi kommunale kilder bruker adressen i bydels-/administrasjonssammenheng, mens selve Stovnertårnet ligger ved Jesperudjordet/Fossumberget. Nominatim/OSM-kontrollen må gi nøyaktig ett eksakt navngitt tourism=viewpoint-punkt i lokal Stovner-scope og stable ID ${expectedSourceObjectId}. Punktet brukes som display-marker for selve utsiktstårnet og kryssjekkes mot Oslo kommunes beskrivelse av Stovnertårnet som eget kommunalt utsiktstårn ved Jesperudjordet.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = { ...place, ...coordinateFields };
  delete updated.coordPrecisionM;
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'official', label: 'Oslo kommune – Jesperudjordet og Stovnertårnet', url: municipalityContextUrl, lang: 'nb', verifiedAt: date },
    { type: 'official', label: 'Oslo kommune – Stovnertårnet, arkitekturpris 2018', url: municipalityProjectUrl, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_subkultur.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('Stovnertårnet må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Stovnertårnet mangler i split-index');
Object.assign(indexRow, {
  lat: updatedPlace.lat,
  lon: updatedPlace.lon,
  r: updatedPlace.r,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
});
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Stovnertårnet mangler i split-manifest');
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
  currentCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: updatedPlace.coordNote,
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Stovnertårnet – kommunalt utsiktstårn/gangbane på Fossumberget ved Jesperudjordet',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'poi',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['kommunal fysisk identitet og lokal scope', 'ett eksakt navngitt stabilt POI-objekt', 'ingen administrativ adresseproxy'],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Jesperudjordet',
      sourceUrl: municipalityContextUrl,
      sourceObjectId: 'oslo-kommune:idrettsanlegg:jesperudjordet:stovnertarnet-nearby',
      sourceQuality: 'official_local_scope_definition',
      finding: 'Oslo kommune oppgir at Stovnertårnet ligger ved siden av Jesperudjordet og beskriver det som et eget tilbud i nærheten.',
      canVerifyCoordinate: false,
      reason: 'Avviser Karl Fossums vei 30 som administrativ adresseproxy og fastsetter lokal fysisk scope.',
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Stovnertårnet, arkitekturpris 2018',
      sourceUrl: municipalityProjectUrl,
      sourceObjectId: 'oslo-kommune:arkitekturpris-2018:stovnertarnet',
      sourceQuality: 'official_identity_definition',
      finding: 'Oslo kommune identifiserer Stovnertårnet som utsiktstårn, tiltakshaver Oslo kommune/Bymiljøetaten.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter selvstendig fysisk identitet og objekttype.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap node ${hit.osm_id} – Stovnertårnet`,
      sourceUrl: osmUrl,
      sourceObjectId,
      sourceQuality: 'exact_named_point_after_object_type_filter',
      finding: `Ett eksakt navngitt tourism=viewpoint-punkt i forhåndsdefinert Stovner-scope ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: coordinateFields.coordNote,
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'display_marker', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Stovnertårnet er oppgradert til verified_geometry med eksakt navngitt POI-punkt.' },
  notes: [coordinateFields.coordNote],
});

const evidenceManifest = readJson(evidenceManifestFile);
if (!Array.isArray(evidenceManifest.files)) throw new Error('Evidence manifest mangler files[]');
if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 130 (2026-07-21)')) {
  const row = `| 130 | \`stovnertarnet\` | Stovnertårnet | verified_geometry | \`${sourceObjectId}\` |`;
  const paragraph = `Batch 130 (2026-07-21) reviderer \`stovnertarnet\` etter objekt-type-først-metoden. Karl Fossums vei 30 brukes ikke som adresseproxy for selve tårnet. Oslo kommune plasserer Stovnertårnet ved Jesperudjordet/Fossumberget og identifiserer det som et eget kommunalt utsiktstårn. Koordinaten godkjennes bare dersom Nominatim/OSM gir nøyaktig ett eksakt navngitt \`tourism=viewpoint\`-punkt i forhåndsdefinert Stovner-scope og stable ID \`${expectedSourceObjectId}\`.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 130');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder:/, (_m, n) => `Oslo-protokollen dekker nå ${Number(n) + 1} aktive current \`verified*\` canonical Oslo-steder:`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  query,
  sourceObjectId,
  lat,
  lon,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  objectType: { category: hit.category, type: hit.type, osmType: hit.osm_type },
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 130 – Stovnertårnet exact POI', '',
  `- place: \`${placeId}\``,
  `- exact OSM source: \`${sourceObjectId}\``,
  `- coordinate: ${lat}, ${lon}`,
  '- canonical object type: tourism=viewpoint point',
  '- Karl Fossums vei 30 is explicitly rejected as an administrative/address proxy for the physical tower.', '',
  'The coordinate is accepted only after exact-name and exact-object-type filtering inside a predefined Stovner scope and municipality identity cross-check.',
].join('\n'));

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const runtimePlace = readJson(runtimeIndexFile).find((place) => place?.id === placeId);
if (!runtimePlace) throw new Error('Runtime mangler Stovnertårnet etter build');
for (const field of ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordStatus','coordSource','coordType','coordNote']) {
  if (JSON.stringify(runtimePlace[field] ?? null) !== JSON.stringify(updatedPlace[field] ?? null)) throw new Error(`Runtime/source mismatch for ${field}`);
}

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 18) throw new Error(`Batch 130 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, placeId, sourceObjectId, lat, lon, changedFileCount: changedFiles.length }, null, 2));
