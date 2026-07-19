import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const agg = read('data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const runtime = read('data/places/places_index.json');
const a = new Map(agg.map(place => [place.id, place]));
const r = new Map(runtime.map(place => [place.id, place]));

const expected = {
  vaterland_historisk_elvelop: {
    lat: 59.9134578,
    lon: 10.7581117,
    status: 'verified_historical_source',
    sourceObjectId: 'oslobyleksikon:akerselva:vaterlands-bru',
    coordSourceId: 'osm-way:381749953',
  },
  akerselva_utlop_bjorvika: {
    lat: 59.9075303,
    lon: 10.7554479,
    status: 'verified_geometry',
    sourceObjectId: 'osm-way:246047712',
    coordSourceId: 'osm-way:246047712',
  },
};

const fullCoordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address',
  'geocodeAccuracy','coordRole','coordType','coordStatus','coordSource',
  'coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','coordPrecisionM','anchors',
];
const runtimeCoordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address',
  'geocodeAccuracy','coordRole','coordType','coordStatus','coordSource',
  'coordVerifiedAt','coordNote','anchors',
];

for (const [id, x] of Object.entries(expected)) {
  const place = a.get(id);
  if (!place) throw new Error(`${id}: missing aggregate record`);
  if (place.lat !== x.lat) throw new Error(`${id}: aggregate lat ${place.lat} != ${x.lat}`);
  if (place.lon !== x.lon) throw new Error(`${id}: aggregate lon ${place.lon} != ${x.lon}`);
  if (place.coordStatus !== x.status) throw new Error(`${id}: coordStatus ${place.coordStatus} != ${x.status}`);
  if (place.sourceObjectId !== x.sourceObjectId) throw new Error(`${id}: sourceObjectId ${place.sourceObjectId} != ${x.sourceObjectId}`);
  if (place.coordSourceId !== x.coordSourceId) throw new Error(`${id}: coordSourceId ${place.coordSourceId} != ${x.coordSourceId}`);

  const split = read(`data/places/natur/oslo/places_oslo_natur_akerselvarute/${id}.json`);
  const live = r.get(id);
  if (!live) throw new Error(`${id}: missing runtime record`);
  for (const key of fullCoordKeys) {
    const av = JSON.stringify(place[key] ?? null);
    const sv = JSON.stringify(split[key] ?? null);
    if (av !== sv) throw new Error(`${id}: split mismatch at ${key}: aggregate=${av}, split=${sv}`);
  }
  for (const key of runtimeCoordKeys) {
    const av = JSON.stringify(place[key] ?? null);
    const rv = JSON.stringify(live[key] ?? null);
    if (av !== rv) throw new Error(`${id}: runtime mismatch at ${key}: aggregate=${av}, runtime=${rv}`);
  }
}

const outlet = a.get('akerselva_utlop_bjorvika');
if (outlet.coordPrecisionM != null) throw new Error('akerselva_utlop_bjorvika: stale coordPrecisionM remains');
if (!Array.isArray(outlet.anchors) || outlet.anchors.length !== 1 || outlet.anchors[0].sourceObjectId !== 'osm-way:246047712') {
  throw new Error('akerselva_utlop_bjorvika: expected exactly one sourced outlet anchor');
}
const vaterland = a.get('vaterland_historisk_elvelop');
if (!Array.isArray(vaterland.anchors) || vaterland.anchors.length !== 1 || vaterland.anchors[0].sourceObjectId !== 'osm-way:381749953') {
  throw new Error('vaterland_historisk_elvelop: expected exactly one sourced historical anchor');
}

const evidenceManifest = read('data/coordinate-evidence/manifest.json');
for (const id of Object.keys(expected)) {
  const rel = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) throw new Error(`evidence manifest missing ${rel}`);
  const evidence = read(`data/coordinate-evidence/${rel}`);
  if (evidence.evidenceStatus !== 'applied_to_place') throw new Error(`${id}: evidence not applied`);
  if (evidence.decision?.canBecomeVerified !== true) throw new Error(`${id}: evidence decision not verified-ready`);
}

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
if (!protocol.includes('165 verifiserte eller kildekontrollerte canonical steder')) throw new Error('protocol missing 165 controlled count');
if (!protocol.includes('forblir 49')) throw new Error('protocol missing unchanged unresolved count 49');
if (!protocol.includes('| 35 | `vaterland_historisk_elvelop`')) throw new Error('protocol missing Vaterland batch 35 row');
if (!protocol.includes('| 35 | `akerselva_utlop_bjorvika`')) throw new Error('protocol missing outlet batch 35 row');
if (protocol.includes('teller ikke blant de 163 verifiserte eller kildekontrollerte canonical Oslo-stedene.')) throw new Error('protocol retains stale 163 unresolved-section count');

const report = read('reports/oslo-coordinate-control-batch-35/applied-summary.json');
if (report.akerselvaManifestControlled !== '23/23') throw new Error('report does not mark Akerselva manifest 23/23 controlled');
console.log('Batch 35 canonical/split/runtime/evidence/protocol assertion passed.');
