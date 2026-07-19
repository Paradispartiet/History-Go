import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const aggregate = read('data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const runtime = read('data/places/places_index.json');
const byId = new Map(aggregate.map((place) => [place.id, place]));
const runtimeById = new Map(runtime.map((place) => [place.id, place]));
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

const fullCoordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
  'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','coordPrecisionM'
];
const runtimeCoordKeys = fullCoordKeys.filter((key) => !['coordSourceId','coordSourceUrl','coordPrecisionM'].includes(key));

for (const [id, exp] of Object.entries(expected)) {
  const place = byId.get(id);
  if (!place) throw new Error(`${id}: missing aggregate record`);
  if (place.coordStatus !== exp.status) throw new Error(`${id}: coordStatus ${place.coordStatus} != ${exp.status}`);
  if (place.sourceObjectId !== exp.sourceObjectId) throw new Error(`${id}: sourceObjectId ${place.sourceObjectId} != ${exp.sourceObjectId}`);
  if (place.lat !== exp.lat || place.lon !== exp.lon) throw new Error(`${id}: coordinate mismatch ${place.lat},${place.lon} != ${exp.lat},${exp.lon}`);

  const split = read(`data/places/natur/oslo/places_oslo_natur_akerselvarute/${id}.json`);
  const live = runtimeById.get(id);
  if (!live) throw new Error(`${id}: missing runtime record`);
  for (const key of fullCoordKeys) {
    const av = JSON.stringify(place[key] ?? null);
    const sv = JSON.stringify(split[key] ?? null);
    if (av !== sv) throw new Error(`${id}: aggregate/split mismatch at ${key}: ${av} != ${sv}`);
  }
  for (const key of runtimeCoordKeys) {
    const av = JSON.stringify(place[key] ?? null);
    const rv = JSON.stringify(live[key] ?? null);
    if (av !== rv) throw new Error(`${id}: aggregate/runtime mismatch at ${key}: ${av} != ${rv}`);
  }
}

const myraSplit = read('data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json');
if (!myraSplit.tasks_profile || !myraSplit.nature_profile?.species_inventory) throw new Error('Myraløkka rich split content was lost');
const kubaSplit = read('data/places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json');
if (!kubaSplit.tasks_profile || !kubaSplit.nature_profile || !kubaSplit.training_profile) throw new Error('Kuba rich split content was lost');
const voienSplit = read('data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json');
if (!voienSplit.works || !voienSplit.quiz_profile) throw new Error('Vøyenfallene rich split content was lost');

const protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
for (const needle of [
  'Oslo-tabellen inneholder nå 160 verifiserte eller kildekontrollerte canonical steder.',
  'Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 45.',
  'teller ikke blant de 160 verifiserte eller kildekontrollerte canonical Oslo-stedene',
  '| 33 | `glads_molle` | Glads mølle | verified | `geonorge-adresser-v1:0301:16161:10A` |',
  '| 33 | `nedre_foss` | Nedre Foss | verified_geometry | `osm-node:4171862592` |',
  '| `voienfossen` – Vøyenfallene | needs_review |',
]) {
  if (!protocol.includes(needle)) throw new Error(`Protocol assertion missing: ${needle}`);
}

console.log('Batch 33 canonical/split/runtime/content/protocol assertion passed.');
