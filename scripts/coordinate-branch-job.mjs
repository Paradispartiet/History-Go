import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-forskningsparken-research-post-195';
const reportDir = path.join(root, reportRel);
const summaryRel = `${reportRel}/summary.json`;
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const relationId = 10322880;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const writeJson = async (rel, value) => {
  await fs.writeFile(path.join(root, rel), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
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
const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .replaceAll('æ', 'ae')
  .replaceAll('ø', 'o')
  .replaceAll('å', 'a')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const closeRing = (ring) => {
  if (ring.length === 0) return ring;
  return ring[0] === ring.at(-1) ? ring : [...ring, ring[0]];
};
const assembleRings = (segments) => {
  const remaining = segments.map((segment) => [...segment]);
  const rings = [];
  while (remaining.length > 0) {
    let ring = remaining.shift();
    let changed = true;
    while (changed && ring[0] !== ring.at(-1)) {
      changed = false;
      for (let index = 0; index < remaining.length; index += 1) {
        const segment = remaining[index];
        const first = ring[0];
        const last = ring.at(-1);
        const segFirst = segment[0];
        const segLast = segment.at(-1);
        if (last === segFirst) ring = [...ring, ...segment.slice(1)];
        else if (last === segLast) ring = [...ring, ...segment.slice(0, -1).reverse()];
        else if (first === segLast) ring = [...segment.slice(0, -1), ...ring];
        else if (first === segFirst) ring = [...segment.slice(1).reverse(), ...ring];
        else continue;
        remaining.splice(index, 1);
        changed = true;
        break;
      }
    }
    rings.push(closeRing(ring));
  }
  return rings;
};
const ringMetrics = (nodeIds, nodes, referenceLat) => {
  const points = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
  assert(points.length >= 4, 'Building ring has fewer than four resolved points.');
  const latScale = 111320;
  const lonScale = 111320 * Math.cos(referenceLat * Math.PI / 180);
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const x1 = points[index].lon * lonScale;
    const y1 = points[index].lat * latScale;
    const x2 = points[index + 1].lon * lonScale;
    const y2 = points[index + 1].lat * latScale;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  assert(Math.abs(twiceArea) > 0.01, 'Building ring has zero area.');
  return {
    signedArea: twiceArea / 2,
    area: Math.abs(twiceArea / 2),
    centroid: {
      lat: (cy / (3 * twiceArea)) / latScale,
      lon: (cx / (3 * twiceArea)) / lonScale,
    },
  };
};
const pointInRing = (point, nodeIds, nodes) => {
  const polygon = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
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

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const previous = await readJson(summaryRel);
assert(previous.placeId === 'forskningsparken', 'Unexpected research summary identity.');
assert(previous.researchOnly === true && previous.canonicalChanged === false, 'Research summary unexpectedly changed canonical data.');
assert(previous.officialAddress?.coordinateCount === 2, 'Expected two preserved Kartverket points.');

const relationUrl = `https://api.openstreetmap.org/api/0.6/relation/${relationId}/full.json`;
const osm = await fetchJson(relationUrl);
const relation = osm.elements?.find((entry) => entry.type === 'relation' && entry.id === relationId);
assert(relation, `OSM relation ${relationId} was not returned.`);
const tags = relation.tags ?? {};
assert(tags.type === 'multipolygon', 'Forskningsparken relation is no longer a multipolygon.');
assert(tags.building === 'university', 'Forskningsparken relation is no longer building=university.');
assert(normalize(`${tags.name ?? ''} ${tags['name:en'] ?? ''}`).includes('forskningsparken'), 'Relation no longer identifies Forskningsparken.');
assert(tags.wikidata === 'Q7107027', 'Relation no longer links Wikidata Q7107027.');
assert(normalize(tags.website).includes('oslotech no') || normalize(tags.website).includes('forskningsparken'), 'Relation website no longer supports the science-park identity.');

const nodes = new Map((osm.elements ?? [])
  .filter((entry) => entry.type === 'node')
  .map((entry) => [entry.id, { lat: Number(entry.lat), lon: Number(entry.lon) }]));
const ways = new Map((osm.elements ?? [])
  .filter((entry) => entry.type === 'way')
  .map((entry) => [entry.id, entry.nodes ?? []]));
const outerSegments = (relation.members ?? [])
  .filter((member) => member.type === 'way' && member.role === 'outer')
  .map((member) => ways.get(member.ref))
  .filter((segment) => Array.isArray(segment) && segment.length >= 2);
assert(outerSegments.length > 0, 'Forskningsparken relation has no resolved outer ways.');
const outerRings = assembleRings(outerSegments);
assert(outerRings.length > 0 && outerRings.every((ring) => ring[0] === ring.at(-1)), 'Could not assemble closed Forskningsparken outer rings.');
const referenceLat = [...nodes.values()].reduce((sum, point) => sum + point.lat, 0) / nodes.size;
const metrics = outerRings.map((ring) => ringMetrics(ring, nodes, referenceLat));
const totalArea = metrics.reduce((sum, item) => sum + item.area, 0);
assert(totalArea > 1000, `Forskningsparken building area is unexpectedly small: ${totalArea}.`);
const centroid = {
  lat: metrics.reduce((sum, item) => sum + item.centroid.lat * item.area, 0) / totalArea,
  lon: metrics.reduce((sum, item) => sum + item.centroid.lon * item.area, 0) / totalArea,
};
const centroidInsideOuter = outerRings.some((ring) => pointInRing(centroid, ring, nodes));
assert(centroidInsideOuter, 'Area-weighted Forskningsparken centroid falls outside all outer rings.');

const currentCoordinate = previous.currentCoordinate;
const addressCoordinates = previous.officialAddress.coordinates.map((entry) => ({ lat: Number(entry.lat), lon: Number(entry.lon) }));
const distancesToAddresses = addressCoordinates.map((coordinate) => Number(distanceMeters(centroid, coordinate).toFixed(1)));
assert(Math.max(...distancesToAddresses) < 150, `Building centroid is too far from an official address point: ${Math.max(...distancesToAddresses)} m.`);
const displacementMeters = Number(distanceMeters(currentCoordinate, centroid).toFixed(1));
const maximumVertexDistanceMeters = Number(Math.max(...outerRings.flatMap((ring) => ring.map((id) => distanceMeters(centroid, nodes.get(id))))).toFixed(1));
const suggestedRadiusMeters = Math.max(150, Math.ceil(maximumVertexDistanceMeters / 10) * 10);

const summary = {
  ...previous,
  coordinateDecision: displacementMeters <= 3
    ? 'verify_existing_at_named_building_multipolygon_centroid'
    : 'promote_named_building_multipolygon_centroid',
  candidate: {
    lat: Number(centroid.lat.toFixed(8)),
    lon: Number(centroid.lon.toFixed(8)),
    sourceProvider: 'osm',
    sourceObjectId: `osm-relation:${relationId}`,
    sourceUrl: `https://www.openstreetmap.org/relation/${relationId}`,
    objectType: 'university_building_multipolygon_centroid',
    wikidata: tags.wikidata,
  },
  displacementMeters,
  supportingGeometry: {
    sourceObjectId: `osm-relation:${relationId}`,
    sourceUrl: `https://www.openstreetmap.org/relation/${relationId}`,
    building: tags.building,
    name: tags.name,
    nameEn: tags['name:en'] ?? null,
    website: tags.website ?? null,
    wikidata: tags.wikidata,
    outerRingCount: outerRings.length,
    resolvedNodeCount: nodes.size,
    areaSquareMeters: Number(totalArea.toFixed(1)),
    centroidInsideOuter,
    maximumVertexDistanceMeters,
    distancesToOfficialAddressPointsMeters: distancesToAddresses,
  },
  sourceChecks: {
    ...previous.sourceChecks,
    namedNonTransportBuildingGeometryFound: true,
    exactBuildingRelationValidated: true,
    buildingCentroidInsideGeometry: true,
    buildingNearBothOfficialAddressPoints: true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: displacementMeters <= 3
      ? `Keep the existing coordinate and attach OSM relation ${relationId} as the verified named building geometry, preserve both Kartverket address points as context, synchronize status/evidence fields, and keep protocol max batch at 195.`
      : `Apply the area-weighted centroid of named OSM university-building relation ${relationId} as the canonical display marker, preserve both Kartverket address points as context, synchronize aggregate/index copies and coordinate evidence, and keep protocol max batch at 195.`,
    coordStatus: 'verified_geometry',
    coordType: 'building_center',
    locatorType: 'building',
    suggestedRadiusMeters,
  },
};

await writeJson(`${reportRel}/osm-relation-${relationId}-full.json`, osm);
await writeJson(summaryRel, summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Forskningsparken coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Forskningsparken / Oslo Science Park, Gaustadalléen 21**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Named building geometry: **OSM relation ${relationId}**\n- Building centroid: **${summary.candidate.lat}, ${summary.candidate.lon}**\n- Displacement: **${displacementMeters} m**\n- Official Kartverket address points preserved: **2**\n- Distance from centroid to address points: **${distancesToAddresses.join(' m / ')} m**\n- Building area: **${summary.supportingGeometry.areaSquareMeters} m²**\n- Maximum centroid-to-vertex distance: **${maximumVertexDistanceMeters} m**\n- Suggested radius: **${suggestedRadiusMeters} m**\n- Recommendation: **${summary.coordinateDecision}**\n\nThe science-park building is separated from every same-name transport object. Relation ${relationId} is a named building=university multipolygon linked to Wikidata Q7107027 and the Oslotech/Forskningsparken website. Both official Kartverket points remain evidence and neither is selected arbitrarily. No batch 196 is created.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'forskningsparken_building_geometry_research_complete',
  reportDir: reportRel,
  sourceObjectId: `osm-relation:${relationId}`,
  displacementMeters,
  suggestedRadiusMeters,
  recommendation: summary.coordinateDecision,
}, null, 2));
