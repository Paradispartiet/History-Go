import fs from 'node:fs';
import crypto from 'node:crypto';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const splitRoot = 'data/places/natur/oslo/places_oslo_natur_akerselvarute';
const manifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const indexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceDir = 'data/coordinate-evidence/oslo/natur';
const reportDir = 'reports/oslo-coordinate-control-batch-33';
const sourceDir = `${reportDir}/sources`;
const verifiedAt = '2026-07-19';
const ids = ['glads_molle','voienfossen','voien_gard_voienvolden','myralokka','kuba_parken','beierbrua','nedre_foss'];
const coordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
  'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','coordPrecisionM'
];
const runtimeCoordKeys = coordKeys.filter((key) => !['coordSourceId','coordSourceUrl','coordPrecisionM'].includes(key));

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (path) => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const snapshot = (place) => ({
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  coordStatus: place.coordStatus ?? '',
  coordSource: place.coordSource ?? '',
  coordType: place.coordType ?? '',
  coordNote: place.coordNote ?? '',
});
const clone = (value) => JSON.parse(JSON.stringify(value));

fs.mkdirSync(evidenceDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const gladsFinder = read(`${sourceDir}/glads-molle-geonorge.json`);
const voienvoldenFinder = read(`${sourceDir}/voienvolden-geonorge.json`);
for (const [label, result, expectedId] of [
  ['glads_molle', gladsFinder, 'geonorge-adresser-v1:0301:16161:10A'],
  ['voien_gard_voienvolden', voienvoldenFinder, 'geonorge-adresser-v1:0301:14622:120'],
]) {
  if (!result?.ok || result?.status !== 'verified_candidate' || result?.sourceObjectId !== expectedId || !result?.coordinate) {
    throw new Error(`${label}: normative Geonorge result is not the expected verified_candidate`);
  }
}

const osmRows = read(`${sourceDir}/osm-lookup.json`);
if (!Array.isArray(osmRows)) throw new Error('OSM lookup output must be an array');
const osm = new Map(osmRows.map((row) => [`${row.osm_type}:${row.osm_id}`, row]));
const expectedOsm = {
  myralokka: 'way:4648305',
  kuba_parken: 'relation:1103963',
  beierbrua: 'way:532768329',
  nedre_foss: 'node:4171862592',
};
for (const [id, key] of Object.entries(expectedOsm)) {
  const row = osm.get(key);
  if (!row || !Number.isFinite(Number(row.lat)) || !Number.isFinite(Number(row.lon))) throw new Error(`${id}: missing exact OSM lookup ${key}`);
}
const voienSearch = read(`${sourceDir}/voienfallene-nominatim.json`);
const voienWd = read(`${sourceDir}/voienfallene-wikidata.json`);
if (!Array.isArray(voienSearch) || voienSearch.length !== 0) throw new Error('Vøyenfallene search unexpectedly produced a named OSM candidate; manual re-audit required');
if (!voienWd?.ok || !Array.isArray(voienWd.coordinates) || voienWd.coordinates.length !== 0) throw new Error('Vøyenfallene Wikidata coordinate state changed; manual re-audit required');

const places = read(sourcePath);
const byId = new Map(places.map((place) => [place.id, place]));
const get = (id) => {
  const place = byId.get(id);
  if (!place) throw new Error(`Missing ${id} in aggregate`);
  return place;
};
const before = new Map(ids.map((id) => [id, clone(get(id))]));

function applyFinder(id, result) {
  const c = result.coordinate;
  const place = get(id);
  for (const key of coordKeys) delete place[key];
  Object.assign(place, c, {
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: verifiedAt,
  });
}
applyFinder('glads_molle', gladsFinder);
applyFinder('voien_gard_voienvolden', voienvoldenFinder);

const myra = osm.get('way:4648305');
Object.assign(get('myralokka'), {
  lat: Number(myra.lat), lon: Number(myra.lon),
  locatorType: 'park', sourceProvider: 'osm', sourceObjectId: 'osm-way:4648305',
  geocodeAccuracy: 'geometric_center', coordRole: 'area_anchor', coordType: 'park_area', coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 4648305 – Myraløkka', coordSourceId: 'osm-way:4648305',
  coordSourceUrl: 'https://www.openstreetmap.org/way/4648305', coordVerifiedAt: verifiedAt,
  coordNote: 'Eksakt navngitt OSM-parkgeometri for Myraløkka, way 4648305, koblet til Wikidata Q19370963 og kryssjekket mot Oslo byleksikon. Geometriens representasjonspunkt brukes som area_anchor for parkdalen.'
});
delete get('myralokka').coordPrecisionM;

const kuba = osm.get('relation:1103963');
Object.assign(get('kuba_parken'), {
  lat: Number(kuba.lat), lon: Number(kuba.lon),
  locatorType: 'park', sourceProvider: 'osm', sourceObjectId: 'osm-relation:1103963',
  geocodeAccuracy: 'geometric_center', coordRole: 'area_anchor', coordType: 'park_area', coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap relation 1103963 – Kuba park', coordSourceId: 'osm-relation:1103963',
  coordSourceUrl: 'https://www.openstreetmap.org/relation/1103963', coordVerifiedAt: verifiedAt,
  coordNote: 'Eksakt navngitt OSM-parkrelasjon for Kuba park, relation 1103963, koblet til Wikidata Q19014743 og kryssjekket mot Oslo kommunes parkbeskrivelse. Geometriens representasjonspunkt brukes som area_anchor.'
});
delete get('kuba_parken').coordPrecisionM;

const beier = osm.get('way:532768329');
Object.assign(get('beierbrua'), {
  lat: Number(beier.lat), lon: Number(beier.lon),
  locatorType: 'linear_area', sourceProvider: 'osm', sourceObjectId: 'osm-way:532768329',
  geocodeAccuracy: 'geometric_center', coordRole: 'line_anchor', coordType: 'bridge_center', coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 532768329 – Beierbrua', coordSourceId: 'osm-way:532768329',
  coordSourceUrl: 'https://www.openstreetmap.org/way/532768329', coordVerifiedAt: verifiedAt,
  coordNote: 'Eksakt navngitt OSM-way for Beierbrua over Akerselva, way 532768329, koblet til Wikidata Q11960440 og kryssjekket mot Oslo byleksikon. Det gamle punktet lå ved Herman Foss’ gate og ikke ved broen.'
});
delete get('beierbrua').coordPrecisionM;

const nedre = osm.get('node:4171862592');
Object.assign(get('nedre_foss'), {
  lat: Number(nedre.lat), lon: Number(nedre.lon),
  locatorType: 'poi', sourceProvider: 'osm', sourceObjectId: 'osm-node:4171862592',
  geocodeAccuracy: 'geometric_center', coordRole: 'display_marker', coordType: 'waterfall', coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap node 4171862592 – Nedre Foss', coordSourceId: 'osm-node:4171862592',
  coordSourceUrl: 'https://www.openstreetmap.org/node/4171862592', coordVerifiedAt: verifiedAt,
  coordNote: 'Eksakt navngitt OSM-punkt for fossefallet Nedre Foss, node 4171862592, koblet til Wikidata Q19370968 og kryssjekket mot Oslo byleksikons beskrivelse av fossefallet ved Nedre Foss park. Det gamle punktet lå ved Bergstien vest for Akerselva.'
});
delete get('nedre_foss').coordPrecisionM;

Object.assign(get('voienfossen'), {
  locatorType: 'natural_area', sourceProvider: 'manual_research', sourceObjectId: 'wikidata:Q114345801',
  geocodeAccuracy: 'unknown', coordRole: 'area_anchor', coordType: 'waterfall_system_anchor', coordStatus: 'needs_source',
  coordSource: 'Vøyenfallene identity documented; exact multi-fall geometry unresolved', coordSourceId: 'wikidata:Q114345801',
  coordSourceUrl: 'https://www.wikidata.org/wiki/Q114345801', coordVerifiedAt: verifiedAt,
  coordNote: 'Vøyenfallene består av tre dokumenterte fall mellom Bentsebrua og Sannerbrua. Det finnes ingen entydig navngitt OSM-geometri i kontrollen, og Wikidata Q114345801 har ingen koordinat. Eksisterende lat/lon beholdes kun som legacy representasjonspunkt til fallrekken modelleres med flere ankere eller dokumentert geometri.'
});
delete get('voienfossen').coordPrecisionM;

write(sourcePath, places);

for (const id of ids) {
  const source = get(id);
  const splitPath = `${splitRoot}/${id}.json`;
  const split = read(splitPath);
  for (const key of coordKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) split[key] = source[key];
    else delete split[key];
  }
  write(splitPath, split);
}

const evidenceConfigs = {
  glads_molle: ['applied_to_place','do_not_change_coordinates_yet','resolved','building'],
  voienfossen: ['needs_research','needs_geometry','partially_resolved','natural_area'],
  voien_gard_voienvolden: ['applied_to_place','do_not_change_coordinates_yet','resolved','building'],
  myralokka: ['applied_to_place','do_not_change_coordinates_yet','resolved','park'],
  kuba_parken: ['applied_to_place','do_not_change_coordinates_yet','resolved','park'],
  beierbrua: ['applied_to_place','do_not_change_coordinates_yet','resolved','linear_area'],
  nedre_foss: ['applied_to_place','do_not_change_coordinates_yet','resolved','poi'],
};
for (const [id, [evidenceStatus, coordinateDecision, identityStatus, locatorTypeCandidate]] of Object.entries(evidenceConfigs)) {
  const place = get(id);
  const verified = evidenceStatus === 'applied_to_place';
  const evidence = {
    schemaVersion: '1.0',
    placeId: id,
    placeFile: sourcePath,
    evidenceStatus,
    coordinateDecision,
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: place.name,
      identityStatus,
      identityProblem: verified ? '' : place.coordNote,
      locatorTypeCandidate,
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: verified ? [] : ['multi-anchor waterfall geometry or a stable source-backed anchor'],
    evidence: [], addressCandidates: [], sourceObjectCandidates: [], geometryCandidates: [], coordinateCandidates: [],
    decision: {
      canBecomeVerified: verified,
      blockedReason: verified ? '' : place.coordNote,
      nextAction: verified ? 'Applied to canonical place.' : 'Do not promote the legacy point until stable geometry or multiple source-backed anchors are documented.',
    },
    notes: [place.coordNote],
  };
  write(`${evidenceDir}/${id}.json`, evidence);
}
const evidenceManifest = read(evidenceManifestPath);
for (const id of ids) {
  const rel = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
write(evidenceManifestPath, evidenceManifest);

const manifest = read(manifestPath);
manifest.source_sha256 = sha256(sourcePath);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  const childPath = `data/places/natur/oslo/${row.file}`;
  if (!fs.existsSync(childPath)) throw new Error(`Missing split child ${row.file}`);
  row.sha256 = sha256(childPath);
}
write(manifestPath, manifest);

const index = (manifest.places || []).map((row) => {
  const place = read(`data/places/natur/oslo/${row.file}`);
  return {
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file: row.file,
  };
});
write(indexPath, index);

let protocol = fs.readFileSync(protocolPath, 'utf8');
const oldHeader = /Oslo-tabellen inneholder nå 154 verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 44\./;
if (oldHeader.test(protocol)) {
  protocol = protocol.replace(oldHeader, 'Oslo-tabellen inneholder nå 160 verifiserte eller kildekontrollerte canonical steder. Batch 33 kontrollerer de neste sju recordene i Akerselva-ruten: Glads mølle og Vøienvolden får entydige Geonorge-adressepunkter; Myraløkka, Kuba-parken, Beierbrua og Nedre Foss får eksakte navngitte OSM-objekter; Vøyenfallene avsluttes uten ny godkjent koordinat fordi tre-fallsystemet mangler én stabil kildegeometri. Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 45.');
} else if (!protocol.includes('Oslo-tabellen inneholder nå 160 verifiserte eller kildekontrollerte canonical steder.')) {
  throw new Error('Unexpected Oslo protocol header before Batch 33');
}
protocol = protocol.replace('teller ikke blant de 154 verifiserte eller kildekontrollerte canonical Oslo-stedene', 'teller ikke blant de 160 verifiserte eller kildekontrollerte canonical Oslo-stedene');
const batch32Anchor = '| 32 | `bjoelsenparken_elvenaer` | Advokat Dehlis plass – grøntarealet | verified_geometry | `osm-way:336602343` |';
const batch33Rows = [
  '| 33 | `glads_molle` | Glads mølle | verified | `geonorge-adresser-v1:0301:16161:10A` |',
  '| 33 | `voien_gard_voienvolden` | Vøienvolden gård | verified | `geonorge-adresser-v1:0301:14622:120` |',
  '| 33 | `myralokka` | Myraløkka | verified_geometry | `osm-way:4648305` |',
  '| 33 | `kuba_parken` | Kuba-parken | verified_geometry | `osm-relation:1103963` |',
  '| 33 | `beierbrua` | Beierbrua | verified_geometry | `osm-way:532768329` |',
  '| 33 | `nedre_foss` | Nedre Foss | verified_geometry | `osm-node:4171862592` |',
].join('\n');
if (!protocol.includes('| 33 | `glads_molle`')) {
  if (!protocol.includes(batch32Anchor)) throw new Error('Batch 32 protocol anchor not found');
  protocol = protocol.replace(batch32Anchor, `${batch32Anchor}\n${batch33Rows}`);
}
const unresolvedHeader = '| kandidat | status | dokumentert konflikt | oppfølging |\n|---|---|---|---|';
const voienRow = '| `voienfossen` – Vøyenfallene | needs_review | Vøyenfallene består av tre dokumenterte fall. Kontrollen fant ingen entydig navngitt OSM-geometri, og Wikidata Q114345801 har ingen koordinat; dagens enkeltpunkt er derfor ikke et stabilt kildeobjekt for hele fallrekken. | Modeller fallrekken med flere kildebelagte ankere eller en eksplisitt dokumentert geometri før canonical koordinat godkjennes. |';
if (!protocol.includes('| `voienfossen` – Vøyenfallene |')) {
  if (!protocol.includes(unresolvedHeader)) throw new Error('Unresolved protocol table header not found');
  protocol = protocol.replace(unresolvedHeader, `${unresolvedHeader}\n${voienRow}`);
}
fs.writeFileSync(protocolPath, protocol);

const moves = {};
for (const id of ids) {
  const beforePlace = before.get(id);
  const afterPlace = get(id);
  moves[id] = {
    from: [beforePlace.lat, beforePlace.lon],
    to: [afterPlace.lat, afterPlace.lon],
    changed: beforePlace.lat !== afterPlace.lat || beforePlace.lon !== afterPlace.lon,
    status: afterPlace.coordStatus,
    sourceObjectId: afterPlace.sourceObjectId,
  };
}
write(`${reportDir}/applied-summary.json`, {
  batch: 33,
  verified: ['glads_molle','voien_gard_voienvolden'],
  verifiedGeometry: ['myralokka','kuba_parken','beierbrua','nedre_foss'],
  needsSource: ['voienfossen'],
  moves,
  protocolCounts: { approved: 160, unresolved: 45 },
});
fs.writeFileSync(`${reportDir}/README.md`, `# Oslo coordinate control batch 33\n\nKontrollerer manifestrekkefølge 7–13 i Akerselva-ruten. To records bruker entydige Geonorge-adressepunkter, fire bruker eksakte navngitte OSM-objekter, og Vøyenfallene beholdes eksplisitt uverifisert til fallrekken har stabil fleranker-/geometrimodell. Split-innholdet bevares; bare koordinatfeltene synkroniseres.\n`);

console.log(JSON.stringify({
  batch: 33,
  approved: 6,
  unresolved: 1,
  runtimeCoordKeys,
  moves,
}, null, 2));
