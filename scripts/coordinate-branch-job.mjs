import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-gamlebyen-skole-research-post-195';
const reportDir = path.join(root, reportRel);
const summaryRel = `${reportRel}/summary.json`;
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const wayId = 263309956;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
};
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const pointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    if (((yi > point.lat) !== (yj > point.lat))
      && point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const polygonMetrics = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  const referenceLat = ring.reduce((sum, point) => sum + point.lat, 0) / ring.length;
  const latScale = 111320;
  const lonScale = 111320 * Math.cos(referenceLat * Math.PI / 180);
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const x1 = ring[index].lon * lonScale;
    const y1 = ring[index].lat * latScale;
    const x2 = ring[index + 1].lon * lonScale;
    const y2 = ring[index + 1].lat * latScale;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  assert(Math.abs(twiceArea) > 0.01, 'School polygon has zero area.');
  return {
    areaSquareMeters: Math.abs(twiceArea / 2),
    centroid: {
      lat: (cy / (3 * twiceArea)) / latScale,
      lon: (cx / (3 * twiceArea)) / lonScale,
    },
    ring,
  };
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const summary = await readJson(summaryRel);
assert(summary.placeId === 'gamlebyen_skole', 'Unexpected research summary identity.');
assert(summary.researchOnly === true && summary.canonicalChanged === false, 'Research summary unexpectedly changed canonical data.');
assert(summary.candidate?.sourceProvider === 'official_address', 'Expected unique official school address candidate.');
assert(summary.supportingOsmObject?.sourceObjectId === `osm-way:${wayId}`, 'Unexpected supporting school object.');

const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full.json`;
const osm = await fetchJson(url);
const way = osm.elements?.find((entry) => entry.type === 'way' && entry.id === wayId);
assert(way, `OSM way ${wayId} was not returned.`);
const tags = way.tags ?? {};
assert(tags.amenity === 'school', 'Supporting object is no longer amenity=school.');
assert(tags.name === 'Gamlebyen skole', 'Supporting object no longer has the exact school name.');
assert(tags['ref:NO:orgnr'] === '973626442', 'Supporting object no longer has the expected organisation number.');
const nodeMap = new Map((osm.elements ?? [])
  .filter((entry) => entry.type === 'node')
  .map((entry) => [entry.id, { lat: Number(entry.lat), lon: Number(entry.lon) }]));
const polygon = (way.nodes ?? []).map((id) => nodeMap.get(id)).filter(Boolean);
assert(polygon.length >= 4, 'School polygon is incomplete.');
const metrics = polygonMetrics(polygon);
const candidate = { lat: Number(summary.candidate.lat), lon: Number(summary.candidate.lon) };
const candidateInside = pointInPolygon(candidate, metrics.ring);
assert(candidateInside, 'The unique Kartverket address point is outside the named Gamlebyen school polygon.');
const centroidInside = pointInPolygon(metrics.centroid, metrics.ring);
assert(centroidInside, 'Calculated school polygon centroid falls outside the polygon.');
const addressToCentroidMeters = distanceMeters(candidate, metrics.centroid);
const maximumVertexDistanceMeters = Math.max(...metrics.ring.map((point) => distanceMeters(metrics.centroid, point)));
assert(Number(summary.recommendation?.suggestedRadiusMeters) >= maximumVertexDistanceMeters, 'Current radius does not cover the researched school polygon from its centroid.');

summary.geometry = {
  sourceObjectId: `osm-way:${wayId}`,
  sourceUrl: `https://www.openstreetmap.org/way/${wayId}`,
  amenity: tags.amenity,
  name: tags.name,
  organisationNumber: tags['ref:NO:orgnr'],
  wikidata: tags.wikidata ?? null,
  polygonNodeCount: polygon.length,
  areaSquareMeters: Number(metrics.areaSquareMeters.toFixed(1)),
  centroid: {
    lat: Number(metrics.centroid.lat.toFixed(8)),
    lon: Number(metrics.centroid.lon.toFixed(8)),
  },
  candidateInsidePolygon: candidateInside,
  centroidInsidePolygon: centroidInside,
  addressToCentroidMeters: Number(addressToCentroidMeters.toFixed(1)),
  maximumVertexDistanceMeters: Number(maximumVertexDistanceMeters.toFixed(1)),
};
summary.sourceChecks = {
  ...summary.sourceChecks,
  fullSchoolPolygonValidated: true,
  officialAddressPointInsideSchoolGeometry: true,
  schoolRadiusCoversGeometry: true,
};
summary.recommendation.nextAction = `Apply ${summary.candidate.sourceObjectId} as the canonical display marker because it is the unique official Egedes gate 3 address point and lies inside named OSM school polygon ${wayId}; preserve official Osloskolen and Brønnøysund identity, retain the polygon as geometry support, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195. Review the canonical 1799 year separately against the official 1881 founding year.`;

await fs.writeFile(path.join(reportDir, `osm-way-${wayId}-full.json`), `${JSON.stringify(osm, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Gamlebyen school coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Gamlebyen school, Egedes gate 3, subunit 973626442**\n- Current marker: **${summary.currentCoordinate.lat}, ${summary.currentCoordinate.lon}**\n- Candidate: **${summary.candidate.lat}, ${summary.candidate.lon}**\n- Candidate source: **${summary.candidate.sourceObjectId}**\n- Displacement: **${summary.displacementMeters} m**\n- School geometry: **OSM way ${wayId}**\n- Address point inside polygon: **yes**\n- School polygon area: **${summary.geometry.areaSquareMeters} m²**\n- Address-to-polygon-centroid distance: **${summary.geometry.addressToCentroidMeters} m**\n- Radius covers geometry: **yes**\n- Canonical year: **${summary.historyReview.canonicalYear}**\n- Official school founding year: **1881**\n- Year changed in this research: **no**\n\nThe unique official Kartverket point lies inside the exact named school polygon carrying the correct organisation number and Wikidata identity. The historical year discrepancy remains a separate content-review item. No batch 196 is created.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'gamlebyen_school_polygon_validation_complete',
  reportDir: reportRel,
  candidateInsidePolygon,
  addressToCentroidMeters: summary.geometry.addressToCentroidMeters,
  areaSquareMeters: summary.geometry.areaSquareMeters,
  displacementMeters: summary.displacementMeters,
}, null, 2));
