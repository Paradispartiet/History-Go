#!/usr/bin/env node

const queries = [
  'Sigrid Undset statue Stensparken Oslo Norway',
  'Sigrid Undset Stensparken Oslo Norway',
];
const all = [];
for (const query of queries) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(query) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.70%2C59.95%2C10.76%2C59.90';
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`Nominatim diagnostic failed: HTTP ${response.status}`);
  const rows = await response.json();
  all.push({ query, url, rows: (Array.isArray(rows) ? rows : []).map((row) => ({
    name: row?.namedetails?.name || row?.name || null,
    display_name: row?.display_name ?? null,
    category: row?.category ?? null,
    type: row?.type ?? null,
    osm_type: row?.osm_type ?? null,
    osm_id: row?.osm_id ?? null,
    lat: row?.lat ?? null,
    lon: row?.lon ?? null,
    address: row?.address ?? null,
    extratags: row?.extratags ?? null,
    geojson_type: row?.geojson?.type ?? null,
  })) });
}
console.error('SIGRID_UNDSET_STATUE_NOMINATIM=' + JSON.stringify(all));
throw new Error('Diagnostic only: inspect exact named monument/ artwork candidates; no data changed.');
