import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-152-ostensjovannet-reedbeds-research');
const BBOX = [59.879, 10.816, 59.900, 10.842];
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, timeoutMs = 45000) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

const [south, west, north, east] = BBOX;
const query = `[out:json][timeout:30];(nwr["natural"="wetland"]["wetland"="reedbed"](${south},${west},${north},${east});nwr["natural"="wetland"]["vegetation"="reed"](${south},${west},${north},${east}););out center tags geom;`;
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let raw = null;
let usedUrl = null;
let errors = [];
for (const endpoint of endpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    raw = await fetchJson(url, 45000);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
if (!raw) throw new Error(`Alle Overpass-endepunkter feilet: ${errors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-reedbeds.json'), `${JSON.stringify({ query, usedUrl, errors, raw }, null, 2)}\n`);

const candidates = (raw.elements || []).map((element) => {
  const geometry = Array.isArray(element.geometry) ? element.geometry : [];
  const lats = geometry.map((point) => point.lat).filter(Number.isFinite);
  const lons = geometry.map((point) => point.lon).filter(Number.isFinite);
  return {
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    lat: element.lat ?? element.center?.lat ?? null,
    lon: element.lon ?? element.center?.lon ?? null,
    geometryPointCount: geometry.length,
    boundingbox: geometry.length ? [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)] : null,
    geometry,
  };
});
const reedbeds = candidates.filter((candidate) => candidate.tags.natural === 'wetland' && (candidate.tags.wetland === 'reedbed' || candidate.tags.vegetation === 'reed'));

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'ostensjovannet_sivbelte',
  proposedModel: 'multi_polygon_habitat_anchor_set',
  bbox: BBOX,
  candidateCount: candidates.length,
  reedbedCount: reedbeds.length,
  reedbeds,
  sourceContext: {
    finding: 'Independent local sources describe multiple takrørsbelter/reed zones around Østensjøvannet whose extent has changed over time; no single stable named sivbelte is documented.',
    parentReservePolygonAllowedAsProxy: false,
    legacyCoordinateUsedForSelection: false,
  },
  nextAction: reedbeds.length > 0
    ? 'Determine whether the mapped reedbed polygons form a defensible multi-anchor habitat model for the canonical record; do not collapse them to one nearest or first-hit point.'
    : 'Keep the canonical record unresolved; no explicit reedbed geometry was found in the bounded lake scope.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 152 research sources\n\n- Østensjøvannets Venner documents multiple takrørs-/wetland belts around Østensjøvannet and notes that their extent has expanded over time.\n- Current local guidance describes the takrør forest as protected vegetation and warns against creating paths through it.\n- This research pass audits explicit OSM natural=wetland + wetland=reedbed/vegetation=reed geometry in a bounded Østensjøvannet scope.\n- The parent reserve polygon and the legacy coordinate are not used as geometry proxies.\n`);
console.log(JSON.stringify({ status: 'research_complete', reedbedCount: reedbeds.length, report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')) }, null, 2));
