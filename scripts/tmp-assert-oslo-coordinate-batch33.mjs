import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const aggregate = read('data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const byId = new Map(aggregate.map((place) => [place.id, place]));
const sourceDir = 'reports/oslo-coordinate-control-batch-33/sources';
const glads = read(`${sourceDir}/glads-molle-geonorge.json`);
const voienvolden = read(`${sourceDir}/voienvolden-geonorge.json`);
const osmRows = read(`${sourceDir}/osm-lookup.json`);
const osm = new Map(osmRows.map((row) => [`${row.osm_type}:${row.osm_id}`, row]));

const expected = {
  glads_molle: { status: 'verified', sourceObjectId: 'geonorge-adresser-v1:0301:16161:10A', lat: glads.coordinate.lat, lon: glads.coordinate.lon },
  voien_gard_voienvolden: { status: 'verified', sourceObjectId: 'geonorge-adresser-v1:0301:14622:120', lat: voienvolden.coordinate.lat, lon: voienvolden.coordinate.lon },
  myralokka: { status: 'verified_geometry', sourceObjectId: 'osm-way:4648305', lat: Number(osm.get('way:4648305').lat), lon: Number(osm.get('way:4648305').lon) },
  kuba_parken: { status: 'verified_geometry', sourceObjectId: 'osm-relation:1103963', lat: Number(osm.get('relation:1103963').lat), lon: Number(osm.get('relation:1103963').lon) },
  beierbrua: { status: 'verified_geometry', sourceObjectId: 'osm-way:532768329', lat: Number(osm.get('way:532768329').lat), lon: Number(osm.get('way:532768329').lon) },
  nedre_foss: { status: 'verified_geometry', sourceObjectId: 'osm-node:4171862592', lat: Number(osm.get('node:4171862592').lat), lon: Number(osm.get('node:4171862592').lon) },
  voienfossen: { status: 'needs_source', sourceObjectId: 'wikidata:Q114345801', lat: 59.93065, lon: 10.75703 },
};

for (const [id, exp] of Object.entries(expected)) {
  const place = byId.get(id);
  if (!place) throw new Error(`${id}: missing aggregate record`);
  if (place.coordStatus !== exp.status) throw new Error(`${id}: coordStatus ${place.coordStatus} != ${exp.status}`);
  if (place.sourceObjectId !== exp.sourceObjectId) throw new Error(`${id}: sourceObjectId ${place.sourceObjectId} != ${exp.sourceObjectId}`);
  if (place.lat !== exp.lat || place.lon !== exp.lon) throw new Error(`${id}: coordinate mismatch ${place.lat},${place.lon} != ${exp.lat},${exp.lon}`);
}

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
for (const needle of [
  'Oslo-tabellen inneholder nå 160 verifiserte eller kildekontrollerte canonical steder.',
  'Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 45.',
  '| 33 | `glads_molle` | Glads mølle | verified | `geonorge-adresser-v1:0301:16161:10A` |',
  '| 33 | `nedre_foss` | Nedre Foss | verified_geometry | `osm-node:4171862592` |',
  '| `voienfossen` – Vøyenfallene | needs_review |',
]) {
  if (!protocol.includes(needle)) throw new Error(`Protocol assertion missing: ${needle}`);
}

console.log('Batch 33 decision and protocol assertion passed.');
