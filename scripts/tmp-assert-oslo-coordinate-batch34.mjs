import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const aggregate = read('data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const byId = new Map(aggregate.map((place) => [place.id, place]));
const sourceDir = 'reports/oslo-coordinate-control-batch-34/sources';
const summary = read('reports/oslo-coordinate-control-batch-34/applied-summary.json');
const vulkan = read(`${sourceDir}/vulkan-maridalsveien-17-geonorge.json`);
const osmRows = read(`${sourceDir}/osm-lookup.json`);
const osm = new Map(osmRows.map((row) => [`${row.osm_type}:${row.osm_id}`, row]));

const expected = {
  vulkan_industriomrade: {
    status: 'verified',
    sourceObjectId: 'geonorge-adresser-v1:0301:14622:17',
    lat: vulkan.coordinate.lat,
    lon: vulkan.coordinate.lon,
  },
  hausmannsbrua: {
    status: 'verified_geometry',
    sourceObjectId: 'osm-way:377766486',
    lat: Number(osm.get('way:377766486').lat),
    lon: Number(osm.get('way:377766486').lon),
  },
  ankerbrua: {
    status: 'verified_geometry',
    sourceObjectId: 'osm-way:381749949',
    lat: Number(osm.get('way:381749949').lat),
    lon: Number(osm.get('way:381749949').lon),
  },
};
for (const [id, exp] of Object.entries(expected)) {
  const place = byId.get(id);
  if (!place) throw new Error(`${id}: missing aggregate record`);
  if (place.coordStatus !== exp.status) throw new Error(`${id}: coordStatus ${place.coordStatus} != ${exp.status}`);
  if (place.sourceObjectId !== exp.sourceObjectId) throw new Error(`${id}: sourceObjectId ${place.sourceObjectId} != ${exp.sourceObjectId}`);
  if (place.lat !== exp.lat || place.lon !== exp.lon) throw new Error(`${id}: coordinate mismatch ${place.lat},${place.lon} != ${exp.lat},${exp.lon}`);
}

for (const id of ['elvestrekning_bla_brenneriveien','fossveien_elvestrekning','hausmannsomradet_elvelop','nybrua_vaterlandsparken']) {
  const place = byId.get(id);
  if (!place) throw new Error(`${id}: missing aggregate record`);
  if (place.coordStatus !== 'needs_source') throw new Error(`${id}: expected needs_source, got ${place.coordStatus}`);
  const move = summary?.moves?.[id];
  if (!move || move.changed !== false || JSON.stringify(move.from) !== JSON.stringify(move.to)) {
    throw new Error(`${id}: unresolved legacy point moved unexpectedly: ${JSON.stringify(move)}`);
  }
  if (Object.prototype.hasOwnProperty.call(place, 'anchors')) throw new Error(`${id}: invalid legacy anchors were not removed`);
}

const composite = byId.get('nybrua_vaterlandsparken');
if (composite.sourceObjectId !== 'identity-conflict:nybrua-vaterlandsparken') throw new Error('Composite identity marker missing');
if (!(summary.compositeDistanceM > 300)) throw new Error(`Composite distance assertion failed: ${summary.compositeDistanceM}`);

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
for (const needle of [
  'Oslo-tabellen inneholder nå 163 verifiserte eller kildekontrollerte canonical steder.',
  'Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 49.',
  '| 34 | `vulkan_industriomrade` | Vulkan industriområde | verified | `geonorge-adresser-v1:0301:14622:17` |',
  '| 34 | `hausmannsbrua` | Hausmannsbrua | verified_geometry | `osm-way:377766486` |',
  '| 34 | `ankerbrua` | Ankerbrua | verified_geometry | `osm-way:381749949` |',
  '| `nybrua_vaterlandsparken` – Nybrua / Vaterlandsparken | needs_review |',
]) {
  if (!protocol.includes(needle)) throw new Error(`Protocol assertion missing: ${needle}`);
}

console.log('Batch 34 decision, unresolved-anchor cleanup and protocol assertion passed.');
