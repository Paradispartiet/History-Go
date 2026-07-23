import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-151-bogerudmyra-research');
const VIEWBOX = '10.819,59.884,10.846,59.872';
const BBOX = [59.872, 10.819, 59.884, 10.846];
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, timeoutMs = 45000) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
const normalize = (value = '') => String(value).trim().toLocaleLowerCase('nb-NO');

const queries = ['Bogerudmyra, Oslo, Norway', 'Bogerudmyra, Østensjøvannet, Oslo, Norway', 'Bølermyra, Oslo, Norway'];
const unique = new Map();
for (let i = 0; i < queries.length; i += 1) {
  const query = queries[i];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
  const results = await fetchJson(url);
  fs.writeFileSync(path.join(REPORT_DIR, `nominatim-${i + 1}.json`), `${JSON.stringify({ query, url, results }, null, 2)}\n`);
  for (const result of results) {
    const key = `${result.osm_type}:${result.osm_id}`;
    if (!unique.has(key)) unique.set(key, { ...result, matchedQueries: [] });
    unique.get(key).matchedQueries.push(query);
  }
}

const nominatimCandidates = [...unique.values()].map((result) => ({
  osmType: result.osm_type,
  osmId: result.osm_id,
  category: result.category,
  type: result.type,
  name: result.name || result.namedetails?.name || null,
  altName: result.namedetails?.alt_name || null,
  displayName: result.display_name,
  boundingbox: result.boundingbox,
  geojson: result.geojson,
  lat: result.lat ? Number(result.lat) : null,
  lon: result.lon ? Number(result.lon) : null,
  matchedQueries: result.matchedQueries,
}));
const exactNominatim = nominatimCandidates.filter((candidate) =>
  ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.name)) ||
  ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.altName))
);

const [south, west, north, east] = BBOX;
const overpassQuery = `[out:json][timeout:20];(nwr["name"="Bogerudmyra"](${south},${west},${north},${east});nwr["alt_name"="Bogerudmyra"](${south},${west},${north},${east});nwr["name"="Bølermyra"](${south},${west},${north},${east}););out center tags;`;
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let overpassRaw = { elements: [] };
let overpassUsed = null;
let overpassError = null;
for (const endpoint of overpassEndpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;
    overpassRaw = await fetchJson(url, 30000);
    overpassUsed = url;
    overpassError = null;
    break;
  } catch (error) {
    overpassError = String(error);
  }
}
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-exact-name.json'), `${JSON.stringify({ query: overpassQuery, url: overpassUsed, error: overpassError, raw: overpassRaw }, null, 2)}\n`);

const overpassCandidates = (overpassRaw.elements || []).map((element) => ({
  osmType: element.type,
  osmId: element.id,
  tags: element.tags || {},
  lat: element.lat ?? element.center?.lat ?? null,
  lon: element.lon ?? element.center?.lon ?? null,
}));
const exactOverpass = overpassCandidates.filter((candidate) =>
  ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.tags.name)) ||
  ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.tags.alt_name))
);

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'bogerudmyra',
  proposedResolvedIdentity: 'Bogerudmyra som konkret navngitt våtmarksområde sør for Østensjøvannet',
  viewbox: VIEWBOX.split(',').map(Number),
  bbox: BBOX,
  nominatimCandidateCount: nominatimCandidates.length,
  exactNominatimCount: exactNominatim.length,
  exactOverpassCount: exactOverpass.length,
  exactNominatimCandidates: exactNominatim,
  exactOverpassCandidates: exactOverpass,
  allNominatimCandidates: nominatimCandidates,
  allOverpassCandidates: overpassCandidates,
  overpassStatus: { usedUrl: overpassUsed, error: overpassError },
  independentContext: {
    officialReserveIdentity: 'The 1992 protection regulation and current reserve description explicitly include Bogerudmyra together with Østensjøvannet.',
    localReferenceCoordinate: { lat: 59.87842, lon: 10.83409, use: 'scope crosscheck only; not canonical geometry proof' },
    legacyCoordinateUsedForSelection: false,
  },
  nextAction: exactNominatim.length === 1
    ? 'Inspect the single exact named Nominatim geometry and its fresh OSM source object before production update.'
    : exactOverpass.length === 1
      ? 'Inspect the single exact named Overpass object and fetch its full geometry before production update.'
      : 'Do not update canonical data until one exact named Bogerudmyra/Bølermyra geometry is uniquely resolved.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 151 research sources\n\n- Lovdata protection regulation: Bogerudmyra is explicitly part of Østensjøvannet nature reserve.\n- Østensjøvannets Venner: current reserve description explicitly includes Bogerudmyra.\n- Lokalhistoriewiki reference point is retained only as an independent scope crosscheck, not as canonical geometry proof.\n- Bounded Nominatim exact-name research is authoritative for candidate discovery here; Overpass is an optional crosscheck and may time out without blocking the research pass.\n- The legacy coordinate is not used for selection.\n`);
console.log(JSON.stringify({
  status: 'research_complete',
  exactNominatimCount: exactNominatim.length,
  exactOverpassCount: exactOverpass.length,
  overpassSucceeded: Boolean(overpassUsed),
  report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')),
}, null, 2));
