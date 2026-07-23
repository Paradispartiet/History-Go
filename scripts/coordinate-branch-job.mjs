#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-163-voyenfallene-research');
fs.mkdirSync(reportDir, { recursive: true });

const center = { lat: 59.9359, lon: 10.7547 };
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' },
  });
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`);
  return response.json();
}

async function runOverpass(query) {
  let lastError = null;
  for (const endpoint of overpassEndpoints) {
    try {
      const payload = await fetchJson(`${endpoint}?data=${encodeURIComponent(query)}`, `Overpass ${endpoint}`);
      return { endpoint, payload };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('All Overpass endpoints failed');
}

async function nominatim(query, name) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '20');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('viewbox', '10.745,59.943,10.765,59.929');
  url.searchParams.set('bounded', '1');
  const payload = await fetchJson(url.toString(), `Nominatim ${name}`);
  fs.writeFileSync(path.join(reportDir, `nominatim-${name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

const [bentseNominatim, sannerNominatim] = await Promise.all([
  nominatim('Bentsebrua, Oslo, Norway', 'bentsebrua'),
  nominatim('Sannerbrua, Oslo, Norway', 'sannerbrua'),
]);

const query = `[out:json][timeout:35];(
  nwr["name"="Bentsebrua"](around:1800,${center.lat},${center.lon});
  nwr["name"="Sannerbrua"](around:1800,${center.lat},${center.lon});
  way["name"="Akerselva"]["waterway"="river"](around:2200,${center.lat},${center.lon});
  nwr["waterway"="waterfall"](around:1800,${center.lat},${center.lon});
  nwr["natural"="waterfall"](around:1800,${center.lat},${center.lon});
);out body geom center;`;
const result = await runOverpass(query);
fs.writeFileSync(path.join(reportDir, 'overpass-local-objects.json'), `${JSON.stringify(result, null, 2)}\n`);

const elements = Array.isArray(result.payload?.elements) ? result.payload.elements : [];
const namedBridgeObjects = elements.filter((e) => ['Bentsebrua', 'Sannerbrua'].includes(e?.tags?.name));
const riverWays = elements.filter((e) => e?.type === 'way' && e?.tags?.name === 'Akerselva' && e?.tags?.waterway === 'river');
const waterfallObjects = elements.filter((e) => e?.tags?.waterway === 'waterfall' || e?.tags?.natural === 'waterfall');

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'voienfossen',
  sourceRecordClaim: 'Vøyenfallene består av tre dokumenterte fall mellom Bentsebrua og Sannerbrua.',
  overpassEndpoint: result.endpoint,
  nominatim: {
    bentsebrua: bentseNominatim.map((row) => ({
      osm_type: row.osm_type,
      osm_id: row.osm_id,
      name: row.name,
      display_name: row.display_name,
      category: row.category,
      type: row.type,
      geojson: row.geojson,
    })),
    sannerbrua: sannerNominatim.map((row) => ({
      osm_type: row.osm_type,
      osm_id: row.osm_id,
      name: row.name,
      display_name: row.display_name,
      category: row.category,
      type: row.type,
      geojson: row.geojson,
    })),
  },
  namedBridgeObjects: namedBridgeObjects.map((e) => ({
    type: e.type,
    id: e.id,
    tags: e.tags || {},
    center: e.center || null,
    geometry: e.geometry || null,
  })),
  riverWays: riverWays.map((e) => ({ id: e.id, tags: e.tags || {}, geometry: e.geometry || null })),
  waterfallObjects: waterfallObjects.map((e) => ({
    type: e.type,
    id: e.id,
    tags: e.tags || {},
    lat: e.lat ?? null,
    lon: e.lon ?? null,
    center: e.center || null,
    geometry: e.geometry || null,
  })),
  decisionRule: 'Research only. Production requires exact physical Bentsebrua and Sannerbrua boundaries on the same visible Akerselva geometry. Because the identity is a three-fall system, a single waterfall point is insufficient; the bridge-bounded river geometry must match the documented full system scope, with any exact internal waterfall objects recorded only as supplementary anchors.',
};

fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({
  bridgeObjects: summary.namedBridgeObjects.map((row) => ({ type: row.type, id: row.id, name: row.tags?.name, man_made: row.tags?.man_made, bridge: row.tags?.bridge, highway: row.tags?.highway })),
  riverWayIds: summary.riverWays.map((row) => row.id),
  waterfallObjects: summary.waterfallObjects.map((row) => ({ type: row.type, id: row.id, name: row.tags?.name || null, waterway: row.tags?.waterway || null, natural: row.tags?.natural || null })),
}, null, 2));
