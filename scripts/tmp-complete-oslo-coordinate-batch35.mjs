import fs from 'node:fs';
import crypto from 'node:crypto';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const splitRoot = 'data/places/natur/oslo/places_oslo_natur_akerselvarute';
const manifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const indexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceDir = 'data/coordinate-evidence/oslo/natur';
const reportDir = 'reports/oslo-coordinate-control-batch-35';
const sourceDir = `${reportDir}/sources`;
const verifiedAt = '2026-07-19';
const ids = ['vaterland_historisk_elvelop','akerselva_utlop_bjorvika'];
const coordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
  'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','coordPrecisionM',
  'anchors','geometry'
];
const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (path) => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const clone = (value) => JSON.parse(JSON.stringify(value));
const snapshot = (place) => ({
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  coordStatus: place.coordStatus ?? '',
  coordSource: place.coordSource ?? '',
  coordType: place.coordType ?? '',
  coordNote: place.coordNote ?? '',
});

fs.mkdirSync(evidenceDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const bridgeRows = read(`${sourceDir}/vaterlands-bru-osm.json`);
const bridge = bridgeRows.find((row) => row.osm_type === 'way' && row.osm_id === 381749953);
if (!bridge || !Number.isFinite(Number(bridge.lat)) || !Number.isFinite(Number(bridge.lon))) {
  throw new Error('Missing exact Vaterlands bru OSM way 381749953');
}
const lowerGeometry = read(`${sourceDir}/akerselva-lower-geometry.json`);
const mouthWay = (lowerGeometry.elements || []).find((element) => element.type === 'way' && element.id === 246047712);
if (!mouthWay || mouthWay?.tags?.name !== 'Akerselva' || mouthWay?.tags?.waterway !== 'river') {
  throw new Error('Missing exact lower Akerselva way 246047712');
}
const points = (mouthWay.geometry || []).map((point) => [Number(point.lat), Number(point.lon)]).filter(([lat,lon]) => Number.isFinite(lat) && Number.isFinite(lon));
if (points.length < 2) throw new Error('Akerselva mouth way has insufficient geometry');
const mouth = points.reduce((best, point) => point[0] < best[0] ? point : best, points[0]);
if (!(mouth[0] > 59.906 && mouth[0] < 59.909 && mouth[1] > 10.754 && mouth[1] < 10.757)) {
  throw new Error(`Unexpected Akerselva mouth endpoint: ${mouth.join(',')}`);
}
const endpointMatches = points.some((point, index) => (index === 0 || index === points.length - 1) && point[0] === mouth[0] && point[1] === mouth[1]);
if (!endpointMatches) throw new Error('Southmost Akerselva point is not a terminal endpoint');

const places = read(sourcePath);
const byId = new Map(places.map((place) => [place.id, place]));
const get = (id) => {
  const place = byId.get(id);
  if (!place) throw new Error(`Missing ${id}`);
  return place;
};
const before = new Map(ids.map((id) => [id, clone(get(id))]));

const vaterland = get('vaterland_historisk_elvelop');
Object.assign(vaterland, {
  lat: Number(bridge.lat),
  lon: Number(bridge.lon),
  locatorType: 'historic_site',
  sourceProvider: 'manual_research',
  sourceObjectId: 'oslobyleksikon:vaterland:vaterlands-bru',
  geocodeAccuracy: 'historical_approximation',
  coordRole: 'historical_anchor',
  coordType: 'historical_river_course_anchor',
  coordStatus: 'verified_historical_source',
  coordSource: 'Oslo byleksikon – Vaterland og Vaterlands bru; OSM way 381749953 for dagens brogeometri',
  coordSourceId: 'oslobyleksikon:vaterlands-bru',
  coordSourceUrl: 'https://oslobyleksikon.no/side/Vaterlands_bru',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Representativt historisk anker ved Vaterlands bru, der Oslo byleksikon avgrenser Vaterland mot Akerselva og dokumenterer broforbindelsen tilbake til 1654. Dagens eksakte OSM-brogeometri brukes til å plassere ankeret. Punktet er ikke en påstand om hele det historiske elveløpets eksakte geometri, men et kildebelagt fysisk kryssingspunkt i Vaterlands historiske elverom.',
});
for (const key of ['coordPrecisionM','anchors','geometry','address']) delete vaterland[key];

const outflow = get('akerselva_utlop_bjorvika');
Object.assign(outflow, {
  lat: mouth[0],
  lon: mouth[1],
  locatorType: 'route',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:246047712',
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'river_mouth_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 246047712 – Akerselva lower open course',
  coordSourceId: 'osm-way:246047712',
  coordSourceUrl: 'https://www.openstreetmap.org/way/246047712',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Sørlig terminalt endepunkt på den eksakte navngitte OSM-wayen for Akerselvas nederste åpne løp brukes som line_anchor for utløpet i Bjørvika. Punktet er kryssjekket mot SNLs plassering av utløpet ved Munchs brygge/Munchmuseet og Bjørvika Utviklings beskrivelse av Akerselvallmenningen.',
  anchors: [
    {
      id: 'akerselva_mouth_bjorvika',
      lat: mouth[0],
      lon: mouth[1],
      role: 'river_mouth',
      sourceObjectId: 'osm-way:246047712:southern_endpoint',
    },
  ],
});
for (const key of ['coordPrecisionM','geometry','address']) delete outflow[key];

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
  vaterland_historisk_elvelop: ['applied_to_place','do_not_change_coordinates_yet','resolved','historic_site'],
  akerselva_utlop_bjorvika: ['applied_to_place','do_not_change_coordinates_yet','resolved','route'],
};
for (const [id, [evidenceStatus, coordinateDecision, identityStatus, locatorTypeCandidate]] of Object.entries(evidenceConfigs)) {
  const place = get(id);
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
      identityProblem: '',
      locatorTypeCandidate,
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: [],
    evidence: [],
    addressCandidates: [],
    sourceObjectCandidates: id === 'vaterland_historisk_elvelop' ? [
      { sourceObjectId: 'osm-way:381749953', name: 'Vaterlands bru', lat: Number(bridge.lat), lon: Number(bridge.lon) },
    ] : [
      { sourceObjectId: 'osm-way:246047712', name: 'Akerselva lower open course', mouthEndpoint: { lat: mouth[0], lon: mouth[1] } },
    ],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Applied to canonical place.',
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
const oldHeader = /Oslo-tabellen inneholder nå 163 verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 49\./;
if (oldHeader.test(protocol)) {
  protocol = protocol.replace(oldHeader, 'Oslo-tabellen inneholder nå 165 verifiserte eller kildekontrollerte canonical steder. Batch 35 fullfører Akerselva-ruten: Vaterlands historiske elveløp får et kildebelagt historisk anker ved Vaterlands bru, og Akerselvas utløp får et eksakt geometrisk munningsanker ved det sørlige endepunktet av den navngitte OSM-wayen for det nederste åpne løpet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 49.');
} else if (!protocol.includes('Oslo-tabellen inneholder nå 165 verifiserte eller kildekontrollerte canonical steder.')) {
  throw new Error('Unexpected protocol header before Batch 35');
}
protocol = protocol.replace('teller ikke blant de 163 verifiserte eller kildekontrollerte canonical Oslo-stedene', 'teller ikke blant de 165 verifiserte eller kildekontrollerte canonical Oslo-stedene');
const batch34Anchor = '| 34 | `ankerbrua` | Ankerbrua | verified_geometry | `osm-way:381749949` |';
const batch35Rows = [
  '| 35 | `vaterland_historisk_elvelop` | Vaterland – historisk elveløp | verified_historical_source | `oslobyleksikon:vaterland:vaterlands-bru` |',
  '| 35 | `akerselva_utlop_bjorvika` | Akerselva – utløp i Bjørvika | verified_geometry | `osm-way:246047712` |',
].join('\n');
if (!protocol.includes('| 35 | `vaterland_historisk_elvelop`')) {
  if (!protocol.includes(batch34Anchor)) throw new Error('Batch 34 protocol anchor not found');
  protocol = protocol.replace(batch34Anchor, `${batch34Anchor}\n${batch35Rows}`);
}
fs.writeFileSync(protocolPath, protocol);

const moves = {};
for (const id of ids) {
  const b = before.get(id);
  const a = get(id);
  moves[id] = {
    from: [b.lat, b.lon],
    to: [a.lat, a.lon],
    changed: b.lat !== a.lat || b.lon !== a.lon,
    status: a.coordStatus,
    sourceObjectId: a.sourceObjectId,
  };
}
write(`${reportDir}/applied-summary.json`, {
  batch: 35,
  verifiedHistoricalSource: ['vaterland_historisk_elvelop'],
  verifiedGeometry: ['akerselva_utlop_bjorvika'],
  needsSource: [],
  akerselvaRouteComplete: true,
  mouthEndpoint: { lat: mouth[0], lon: mouth[1], sourceObjectId: 'osm-way:246047712' },
  moves,
  protocolCounts: { approved: 165, unresolved: 49 },
});
fs.writeFileSync(`${reportDir}/README.md`, '# Oslo coordinate control batch 35\n\nFullfører de to siste recordene i Akerselva-ruten. Vaterlands historiske elveløp får et representativt, kildebelagt historisk anker ved Vaterlands bru. Akerselvas utløp i Bjørvika får det sørlige terminalpunktet på den eksakte navngitte OSM-wayen for det nederste åpne løpet som munningsanker. Bare koordinatfeltene synkroniseres til eksisterende rike split-filer. Etter batchen er hele Akerselva-manifestet kontrollert.\n');

console.log(JSON.stringify({ batch: 35, approved: 2, unresolved: 0, mouth, moves }, null, 2));
