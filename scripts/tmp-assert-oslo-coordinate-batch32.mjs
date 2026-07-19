import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const agg = read('data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const runtime = read('data/places/places_index.json');
const a = new Map(agg.map(place => [place.id, place]));
const r = new Map(runtime.map(place => [place.id, place]));

const verified = {
  nydalsdammen: [59.9572011, 10.7658593, 'osm-relation:14637129'],
  bjoelsenfossen: [59.9408256, 10.7693368, 'osm-node:10679414566'],
  bjoelsenparken_elvenaer: [59.93914, 10.75891, 'osm-way:336602343'],
};
for (const [id, [lat, lon, sourceObjectId]] of Object.entries(verified)) {
  const place = a.get(id);
  if (!place) throw new Error(`${id}: missing aggregate record`);
  if (place.lat !== lat) throw new Error(`${id}: aggregate lat ${place.lat} != ${lat}`);
  if (place.lon !== lon) throw new Error(`${id}: aggregate lon ${place.lon} != ${lon}`);
  if (place.sourceObjectId !== sourceObjectId) throw new Error(`${id}: aggregate sourceObjectId ${place.sourceObjectId} != ${sourceObjectId}`);
  if (place.coordStatus !== 'verified_geometry') throw new Error(`${id}: aggregate coordStatus ${place.coordStatus} != verified_geometry`);
}

const unresolved = ['frysjadammen','nydalen_industristed','seilduksfabrikken_nydalen','stilla_nydalen'];
for (const id of unresolved) {
  if (a.get(id)?.coordStatus !== 'needs_source') throw new Error(`${id}: aggregate coordStatus ${a.get(id)?.coordStatus} != needs_source`);
}

const ids = [...Object.keys(verified), ...unresolved];
const fullCoordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address',
  'geocodeAccuracy','coordRole','coordType','coordStatus','coordSource',
  'coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote',
];
const runtimeCoordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address',
  'geocodeAccuracy','coordRole','coordType','coordStatus','coordSource',
  'coordVerifiedAt','coordNote',
];
for (const id of ids) {
  const aggregate = a.get(id);
  const split = read(`data/places/natur/oslo/places_oslo_natur_akerselvarute/${id}.json`);
  const live = r.get(id);
  if (!aggregate) throw new Error(`${id}: missing aggregate`);
  if (!split) throw new Error(`${id}: missing split`);
  if (!live) throw new Error(`${id}: missing runtime`);

  for (const key of fullCoordKeys) {
    const av = JSON.stringify(aggregate[key] ?? null);
    const sv = JSON.stringify(split[key] ?? null);
    if (av !== sv) throw new Error(`${id}: split coordinate mismatch at ${key}: aggregate=${av}, split=${sv}`);
  }
  for (const key of runtimeCoordKeys) {
    const av = JSON.stringify(aggregate[key] ?? null);
    const rv = JSON.stringify(live[key] ?? null);
    if (av !== rv) throw new Error(`${id}: runtime coordinate mismatch at ${key}: aggregate=${av}, runtime=${rv}`);
  }
}

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
if (!protocol.includes('154 verifiserte eller kildekontrollerte canonical steder')) throw new Error('protocol: missing 154 controlled count');
if (!protocol.includes('nå 44')) throw new Error('protocol: missing 44 unresolved count');
console.log('Batch 32 canonical/split/runtime/protocol assertion passed.');
