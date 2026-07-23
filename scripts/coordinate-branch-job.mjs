import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-151-bogerudmyra-research');
const VIEWBOX = '10.819,59.884,10.846,59.872';
const BBOX = [59.872, 10.819, 59.884, 10.846];
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, accept = 'application/json') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
const normalize = (value = '') => String(value).trim().toLocaleLowerCase('nb-NO');

const nominatimQueries = ['Bogerudmyra, Oslo, Norway', 'Bogerudmyra, Østensjøvannet, Oslo, Norway', 'Bølermyra, Oslo, Norway'];
const nominatimRaw = [];
const unique = new Map();
for (let i = 0; i < nominatimQueries.length; i += 1) {
  const query = nominatimQueries[i];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
  const results = await fetchJson(url);
  nominatimRaw.push({ query, url, results });
  fs.writeFileSync(path.join(REPORT_DIR, `nominatim-${i + 1}.json`), `${JSON.stringify({ query, url, results }, null, 2)}\n`);
  for (const result of results) {
    const key = `${result.osm_type}:${result.osm_id}`;
    if (!unique.has(key)) unique.set(key, { ...result, matchedQueries: [] });
    unique.get(key).matchedQueries.push(query);
  }
}

const [south, west, north, east] = BBOX;
const overpassQuery = `[out:json][timeout:30];\n(\n  nwr["name"="Bogerudmyra"](${south},${west},${north},${east});\n  nwr["alt_name"="Bogerudmyra"](${south},${west},${north},${east});\n  nwr["name"="Bølermyra"](${south},${west},${north},${east});\n);\nout center tags geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpassRaw = await fetchJson(overpassUrl);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-exact-name.json'), `${JSON.stringify({ query: overpassQuery, url: overpassUrl, raw: overpassRaw }, null, 2)}\n`);

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
const overpassCandidates = (overpassRaw.elements || []).map((element) => ({
  osmType: element.type,
  osmId: element.id,
  tags: element.tags || {},
  lat: element.lat ?? element.center?.lat ?? null,
  lon: element.lon ?? element.center?.lon ?? null,
  geometryPointCount: Array.isArray(element.geometry) ? element.geometry.length : null,
  geometry: element.geometry || null,
}));
const exactNominatim = nominatimCandidates.filter((candidate) => ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.name)) || ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.altName)));
const exactOverpass = overpassCandidates.filter((candidate) => ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.tags.name)) || ['bogerudmyra', 'bølermyra'].includes(normalize(candidate.tags.alt_name)));

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
  independentContext: {
    officialReserveIdentity: 'The 1992 protection regulation and current reserve description explicitly include Bogerudmyra together with Østensjøvannet.',
    localReferenceCoordinate: { lat: 59.87842, lon: 10.83409, use: 'scope crosscheck only; not canonical geometry proof' },
    legacyCoordinateUsedForSelection: false,
  },
  nextAction: exactOverpass.length === 1 || exactNominatim.length === 1
    ? 'Inspect the uniquely named wetland object, its tags and geometry before production update.'
    : 'Do not update canonical data until one exact named Bogerudmyra/Bølermyra geometry is uniquely resolved.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 151 research sources\n\n- Lovdata protection regulation: Bogerudmyra is explicitly part of Østensjøvannet nature reserve.\n- Østensjøvannets Venner: current reserve description explicitly includes Bogerudmyra.\n- Lokalhistoriewiki reference point is retained only as an independent scope crosscheck, not as canonical geometry proof.\n- Bounded Nominatim and exact-name Overpass audits search for Bogerudmyra/Bølermyra physical geometry.\n- The legacy coordinate is not used for selection.\n`);
console.log(JSON.stringify({ status: 'research_complete', exactNominatimCount: exactNominatim.length, exactOverpassCount: exactOverpass.length, report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')) }, null, 2));
