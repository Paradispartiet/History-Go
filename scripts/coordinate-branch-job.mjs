import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-150-ostensjovannet-bird-hide-research');
const BBOX = [59.879, 10.814, 59.900, 10.842];

fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

const [south, west, north, east] = BBOX;
const query = `[out:json][timeout:30];\n(\n  nwr["leisure"="bird_hide"](${south},${west},${north},${east});\n  nwr["tourism"="viewpoint"](${south},${west},${north},${east});\n  nwr["amenity"="shelter"](${south},${west},${north},${east});\n  nwr["man_made"="tower"](${south},${west},${north},${east});\n);\nout center tags geom;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const raw = await fetchJson(url);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-objects.json'), `${JSON.stringify({ query, url, raw }, null, 2)}\n`);

const candidates = (raw.elements || []).map((element) => {
  const point = element.type === 'node'
    ? { lat: element.lat, lon: element.lon }
    : element.center || (Array.isArray(element.geometry) && element.geometry.length ? element.geometry[Math.floor(element.geometry.length / 2)] : null);
  return {
    osmType: element.type,
    osmId: element.id,
    lat: point?.lat ?? null,
    lon: point?.lon ?? null,
    tags: element.tags || {},
    geometryPointCount: Array.isArray(element.geometry) ? element.geometry.length : null,
  };
});
const birdHides = candidates.filter((candidate) => candidate.tags.leisure === 'bird_hide');
const westSideBirdHides = birdHides.filter((candidate) => candidate.lon !== null && candidate.lon < 10.8275);

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'ostensjovannet_fugletarn',
  bbox: BBOX,
  candidateCount: candidates.length,
  birdHideCount: birdHides.length,
  westSideBirdHideCount: westSideBirdHides.length,
  birdHides,
  allCandidates: candidates,
  independentContext: {
    finding: 'Current birding sources describe one bird hide on the west side of Østensjøvannet with views over the central lake.',
    legacyCoordinateUsedForSelection: false,
  },
  nextAction: westSideBirdHides.length === 1
    ? 'Inspect the single west-side leisure=bird_hide object and corroborate it before production update.'
    : 'Do not update canonical data until one physical bird-hide identity is uniquely resolved.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 150 research sources\n\n- Object-type-first Overpass audit for leisure=bird_hide, viewpoints, shelters and towers around Østensjøvannet.\n- Current external birding sources describe one bird hide on the west side of the lake.\n- The legacy coordinate is not used for candidate selection.\n- No canonical place data is changed in this research pass.\n`);

console.log(JSON.stringify({
  status: 'research_complete',
  candidateCount: candidates.length,
  birdHideCount: birdHides.length,
  westSideBirdHideCount: westSideBirdHides.length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')),
}, null, 2));
