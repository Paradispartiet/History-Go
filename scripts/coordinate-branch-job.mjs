import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/ovre-spinneri-osm-geometry-research');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const headers = {
  'User-Agent': 'History-Go-coordinate-research/1.0 (github.com/Paradispartiet/History-Go)',
  'Accept': 'application/json'
};

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

const nominatimQueries = [
  'Campus G12, Oslo',
  'Gjerdrums vei 12, Oslo',
  'Øvre Spinneri, Nydalen, Oslo'
];
const nominatim = {};
for (const query of nominatimQueries) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&addressdetails=1&limit=10&q=${encodeURIComponent(query)}`;
  nominatim[query] = { url, results: await getJson(url) };
}

const bbox = '59.9450,10.7640,59.9490,10.7705';
const overpassQuery = `[out:json][timeout:30];(
  nwr["addr:street"="Gjerdrums vei"]["addr:housenumber"="12"](${bbox});
  nwr["name"~"Øvre|Spinneri|Campus G12|Nydalens",i](${bbox});
  way["building"](${bbox});
  relation["building"](${bbox});
);out center tags;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpass = await getJson(overpassUrl);

const interesting = (overpass.elements || []).filter((element) => {
  const tags = element.tags || {};
  const haystack = JSON.stringify(tags).toLowerCase();
  return tags['addr:housenumber'] === '12'
    || /spinneri|campus g12|nydalens/.test(haystack)
    || (tags.building && element.center && Math.abs(element.center.lat - 59.9469) < 0.0015 && Math.abs(element.center.lon - 10.7671) < 0.0025);
});

const summary = {
  date: '2026-07-20',
  purpose: 'Fallback geometry research after ambiguous Geonorge address results for Gjerdrums vei 12.',
  bbox,
  nominatimQueries,
  nominatimResultCounts: Object.fromEntries(Object.entries(nominatim).map(([query, value]) => [query, value.results.length])),
  overpassElementCount: overpass.elements?.length || 0,
  interestingCount: interesting.length,
  interesting: interesting.map((element) => ({
    type: element.type,
    id: element.id,
    center: element.center || (element.lat && element.lon ? { lat: element.lat, lon: element.lon } : null),
    tags: element.tags || {}
  }))
};

fs.writeFileSync(path.join(REPORT_DIR, 'nominatim.json'), `${JSON.stringify(nominatim, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass.json'), `${JSON.stringify({ query: overpassQuery, url: overpassUrl, response: overpass }, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'README.md'), `# Øvre Spinneri OSM geometry research\n\nResearch-only fallback after the canonical Geonorge address finder returned multiple candidates for Gjerdrums vei 12. No place coordinates are changed by this job.\n\n- Nominatim queries: ${nominatimQueries.join('; ')}\n- Overpass bbox: ${bbox}\n- Overpass elements: ${summary.overpassElementCount}\n- Filtered candidates: ${summary.interestingCount}\n`);

console.log(JSON.stringify(summary, null, 2));
