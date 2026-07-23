import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-149-vadedammen-research');
const VIEWBOX = '10.805,59.899,10.842,59.884';
const queries = [
  'Vadedammen, Oslo, Norway',
  'Vadedammen, Østensjøvannet, Oslo, Norway',
  'Vadammen, Østensjøvannet, Oslo, Norway',
];

fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

function normalizeName(value = '') {
  return String(value).trim().toLocaleLowerCase('nb-NO');
}

const rawQueries = [];
const unique = new Map();
for (let i = 0; i < queries.length; i += 1) {
  const query = queries[i];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
  const results = await fetchJson(url);
  rawQueries.push({ query, url, results });
  fs.writeFileSync(path.join(REPORT_DIR, `nominatim-${i + 1}.json`), `${JSON.stringify({ query, url, results }, null, 2)}\n`);
  for (const result of results) {
    const key = `${result.osm_type}:${result.osm_id}`;
    if (!unique.has(key)) unique.set(key, { ...result, matchedQueries: [] });
    unique.get(key).matchedQueries.push(query);
  }
}

const candidates = [...unique.values()].map((result) => ({
  osmType: result.osm_type,
  osmId: result.osm_id,
  category: result.category,
  type: result.type,
  name: result.name || result.namedetails?.name || null,
  displayName: result.display_name,
  boundingbox: result.boundingbox,
  geojson: result.geojson,
  lat: result.lat ? Number(result.lat) : null,
  lon: result.lon ? Number(result.lon) : null,
  matchedQueries: result.matchedQueries,
}));

const exactNamed = candidates.filter((candidate) => normalizeName(candidate.name) === 'vadedammen');
const plausibleTypes = exactNamed.filter((candidate) =>
  ['water', 'wetland', 'pond', 'reservoir', 'basin'].includes(String(candidate.type || '').toLowerCase()) ||
  ['natural', 'waterway', 'landuse'].includes(String(candidate.category || '').toLowerCase())
);

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'ostensjovannet_nord',
  proposedResolvedIdentity: 'Vadedammen – våtmarksdammen nord for Østensjøvannet',
  viewbox: VIEWBOX.split(',').map(Number),
  queryCount: queries.length,
  uniqueCandidateCount: candidates.length,
  exactNamedCount: exactNamed.length,
  plausibleExactNamedCount: plausibleTypes.length,
  exactNamedCandidates: exactNamed,
  allCandidates: candidates,
  nextAction: plausibleTypes.length === 1
    ? 'Inspect the single exact named candidate and its source tags before production update.'
    : 'Do not update canonical data until one exact physical Vadedammen geometry is uniquely resolved.',
};

fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 149 research sources\n\n- Østensjøvannets Venner documents Vadedammen as a named wetland/pond north of Østensjøvannet and as habitat created for wading birds.\n- This runner queries bounded OpenStreetMap/Nominatim candidates only to identify an exact physical geometry.\n- No canonical coordinate or identity is changed by this research run.\n- No nearest/first-hit selection is used.\n`);

console.log(JSON.stringify({
  status: 'research_complete',
  uniqueCandidateCount: candidates.length,
  exactNamedCount: exactNamed.length,
  plausibleExactNamedCount: plausibleTypes.length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')),
}, null, 2));
