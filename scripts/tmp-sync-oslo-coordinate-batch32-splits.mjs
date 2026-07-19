import fs from 'node:fs';
import crypto from 'node:crypto';

const root = 'data/places/natur/oslo';
const sourcePath = `${root}/places_oslo_natur_akerselvarute.json`;
const manifestPath = `${root}/places_oslo_natur_akerselvarute_manifest.json`;
const indexPath = `${root}/places_oslo_natur_akerselvarute_index.json`;
const splitDir = `${root}/places_oslo_natur_akerselvarute`;
const ids = [
  'frysjadammen',
  'nydalen_industristed',
  'seilduksfabrikken_nydalen',
  'nydalsdammen',
  'stilla_nydalen',
  'bjoelsenfossen',
  'bjoelsenparken_elvenaer',
];
const coordinateKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address',
  'geocodeAccuracy','coordRole','coordType','coordStatus','coordSource',
  'coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote',
];
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');

const aggregate = read(sourcePath);
const byId = new Map(aggregate.map(place => [place.id, place]));
const advokat = byId.get('bjoelsenparken_elvenaer');
if (!advokat) throw new Error('Missing bjoelsenparken_elvenaer in aggregate');
Object.assign(advokat, {
  lat: 59.93914,
  lon: 10.75891,
  locatorType: 'square',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:336602343',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordType: 'osm_area_centroid',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 336602343 – Advokat Dehlis plass',
  coordSourceId: 'osm-way:336602343',
  coordSourceUrl: 'https://www.openstreetmap.org/way/336602343',
  coordVerifiedAt: '2026-07-19',
  coordNote: 'Eksakt navngitt OSM-areal for grøntarealet på Advokat Dehlis plass, way 336602343, kryssjekket mot Wikidata Q15063467 og Oslo byleksikon.',
});
write(sourcePath, aggregate);

for (const id of ids) {
  const source = byId.get(id);
  if (!source) throw new Error(`Missing ${id} in aggregate`);
  const childPath = `${splitDir}/${id}.json`;
  const child = read(childPath);
  for (const key of coordinateKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) child[key] = source[key];
    else delete child[key];
  }
  write(childPath, child);
}

const manifest = read(manifestPath);
manifest.source_sha256 = sha256(sourcePath);
manifest.generated_at = '2026-07-19T23:20:00+02:00';
for (const row of manifest.places || []) {
  const childPath = `${root}/${row.file}`;
  if (!fs.existsSync(childPath)) throw new Error(`Missing split child ${row.file}`);
  row.sha256 = sha256(childPath);
}
write(manifestPath, manifest);

const index = (manifest.places || []).map(row => {
  const place = read(`${root}/${row.file}`);
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

console.log('Synchronized batch 32 coordinate fields into existing Akerselva split files without replacing split content.');
