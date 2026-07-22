import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const outDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-145-ljanselva-ljan-topology');
fs.mkdirSync(outDir, { recursive: true });

const queries = [
  {
    key: 'ljanselva_liadalen',
    url: 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=Ljanselva%2C+Liadalen%2C+Oslo%2C+Norway&limit=50&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=10.770%2C59.853%2C10.805%2C59.838&bounded=1',
  },
  {
    key: 'ljanselva_ljan',
    url: 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=Ljanselva%2C+Ljan%2C+Oslo%2C+Norway&limit=50&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=10.770%2C59.853%2C10.805%2C59.838&bounded=1',
  },
  {
    key: 'ljanselva_corrected_box',
    url: 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=Ljanselva%2C+Oslo%2C+Norway&limit=50&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=10.770%2C59.853%2C10.805%2C59.838&bounded=1',
  },
];

function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function pointsOf(item) {
  if (item?.geojson?.type !== 'LineString') return [];
  return (item.geojson.coordinates || []).map(([lon, lat]) => ({ lat: Number(lat), lon: Number(lon) }));
}
function lengthM(points) {
  let sum = 0;
  for (let i = 1; i < points.length; i += 1) sum += haversineM(points[i - 1], points[i]);
  return sum;
}

const all = [];
for (const query of queries) {
  const response = await fetch(query.url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${query.key} feilet med ${response.status}`);
  const payload = await response.json();
  fs.writeFileSync(path.join(outDir, `nominatim-${query.key}.json`), `${JSON.stringify({ queryUrl: query.url, results: payload }, null, 2)}\n`);
  for (const item of payload) {
    const points = pointsOf(item);
    all.push({
      query: query.key,
      osmType: item.osm_type,
      osmId: item.osm_id,
      category: item.category,
      type: item.type,
      name: item.name,
      altName: item.namedetails?.alt_name || null,
      displayName: item.display_name,
      boundingbox: item.boundingbox,
      geometryType: item.geojson?.type || null,
      pointCount: points.length,
      lineLengthM: points.length > 1 ? Number(lengthM(points).toFixed(1)) : null,
      firstPoint: points[0] || null,
      lastPoint: points.at(-1) || null,
    });
  }
}

const unique = [...new Map(all.map((item) => [`${item.osmType}:${item.osmId}`, item])).values()];
const exactRivers = unique.filter((item) => item.name === 'Ljanselva' && item.category === 'waterway' && item.type === 'river');
fs.writeFileSync(path.join(outDir, 'candidate-summary.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  placeId: 'ljanselva_ljan',
  priorBatch112Box: [10.798, 59.844, 10.821, 59.827],
  correctedLiadalenBox: [10.770, 59.853, 10.805, 59.838],
  queryCount: queries.length,
  uniqueResultCount: unique.length,
  exactLjanselvaRiverCount: exactRivers.length,
  exactLjanselvaRivers: exactRivers,
  allUniqueCandidates: unique,
  nextAction: exactRivers.length > 0
    ? 'Kontroller sammenheng og topologi mot Lja bru, Liadalen og nedre kulvert før eventuell production batch.'
    : 'Følg OSM-vannveisnettet topologisk fra Lja bru eller bruk eksplisitte Liadalen-ankre; ikke bruk legacy-punktet.',
}, null, 2)}\n`);

fs.writeFileSync(path.join(outDir, 'sources.md'), `# Batch 145 research – Ljanselva ved Ljan / Liadalen\n\nDen opprinnelige batch-112-boksen lå øst for den dokumenterte Liadalen-korridoren og ga ingen eksakte treff. Denne research-kjøringen søker på nytt i en korrigert boks som dekker Liadalen vest for Ljabru og ned mot nedre elveløp.\n\nKildegrunnlag for scope:\n- https://oslobyleksikon.no/side/Ljanselva\n- https://lokalhistoriewiki.no/wiki/Liadalen_%28Oslo%29\n- https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/\n\nIngen canonical koordinat endres i research-steget.\n`);

console.log(JSON.stringify({
  placeId: 'ljanselva_ljan',
  uniqueResultCount: unique.length,
  exactLjanselvaRiverCount: exactRivers.length,
  exactIds: exactRivers.map((item) => `${item.osmType}:${item.osmId}`),
}, null, 2));
