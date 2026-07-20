import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-40';
const ENTUR_GEOCODER = 'https://api.entur.io/geocoder/v1/autocomplete';
const OSLO_LOCALITY = 'KVE:TopographicPlace:0301';

const anchors = [
  { key: 'gaustadalleen', name: 'Gaustadalléen', role: 'shared_west_terminus' },
  { key: 'nybrua', name: 'Nybrua', role: 'shared_central_anchor' },
  { key: 'sinsenkrysset', name: 'Sinsenkrysset', role: 'line_17_branch_anchor' },
  { key: 'storo', name: 'Storo', role: 'line_18_branch_anchor' },
  { key: 'grefsen_stasjon', name: 'Grefsen stasjon', role: 'shared_east_terminus' }
];

const abs = (rel) => path.join(ROOT, rel);
const writeJson = (rel, data) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
};

function coordinate(feature) {
  const c = feature?.geometry?.coordinates;
  return Array.isArray(c) && c.length >= 2 ? { lat: c[1], lon: c[0] } : null;
}

async function parentStop(name) {
  const url = new URL(ENTUR_GEOCODER);
  url.searchParams.set('text', name);
  url.searchParams.set('lang', 'no');
  url.searchParams.set('size', '20');
  url.searchParams.set('layers', 'venue');
  url.searchParams.set('boundary.locality_ids', OSLO_LOCALITY);
  url.searchParams.set('multiModal', 'parent');
  const response = await fetch(url, {
    headers: {
      'ET-Client-Name': 'Paradispartiet-History-Go',
      'User-Agent': 'History-Go-coordinate-control/1.0'
    }
  });
  if (!response.ok) throw new Error(`Entur ${response.status} for ${name}`);
  return { requestUrl: url.toString(), payload: await response.json() };
}

const results = [];
for (const anchor of anchors) {
  const { requestUrl, payload } = await parentStop(anchor.name);
  const exact = (payload.features || [])
    .filter((feature) => String(feature?.properties?.name || '').toLocaleLowerCase('nb-NO') === anchor.name.toLocaleLowerCase('nb-NO'))
    .map((feature) => ({
      id: String(feature?.properties?.id || feature?.properties?.source_id || ''),
      name: String(feature?.properties?.name || ''),
      coordinate: coordinate(feature),
      categories: Array.isArray(feature?.properties?.category) ? feature.properties.category : [],
      locality: feature?.properties?.locality || '',
      county: feature?.properties?.county || '',
      source: feature?.properties?.source || '',
      label: feature?.properties?.label || ''
    }));
  writeJson(`${REPORT_DIR}/entur-parent-results/${anchor.key}.json`, { ...anchor, requestUrl, payload, exact });
  results.push({ ...anchor, exact, decision: exact.length === 1 ? 'unique_parent_stop' : exact.length === 0 ? 'no_parent_stop' : 'multiple_parent_stops' });
}

writeJson(`${REPORT_DIR}/parent-stop-summary.json`, {
  date: '2026-07-20',
  method: 'Entur Geocoder multiModal=parent. Exact name match required. A route anchor is eligible only when exactly one parent stop place is returned.',
  results
});

console.log(JSON.stringify({ ok: true, results }, null, 2));
