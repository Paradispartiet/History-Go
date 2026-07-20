import fs from 'node:fs';
import path from 'node:path';

const reportDir = path.join(process.cwd(), 'reports/ovre-spinneri-culvert-geometry-20260720');
const overpassPath = path.join(reportDir, 'overpass-raw.json');
const addressPath = path.join(reportDir, 'geonorge-gjerdrums-vei-12-cluster.json');

const overpassWrapper = JSON.parse(fs.readFileSync(overpassPath, 'utf8'));
const addressWrapper = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
const elements = overpassWrapper.data?.elements || [];
const addressHits = addressWrapper.hits || [];
const culvert = elements.find(
  (element) =>
    element.type === 'way' &&
    element.id === 116542040 &&
    element.tags?.waterway === 'river',
);
if (!culvert?.geometry?.length) throw new Error('Could not find culvert way 116542040 geometry.');

function toPoint(point) {
  return { lat: Number(point.lat), lon: Number(point.lon) };
}

function project(point, origin) {
  const r = Math.PI / 180;
  return {
    x: (point.lon - origin.lon) * r * Math.cos(origin.lat * r) * 6371000,
    y: (point.lat - origin.lat) * r * 6371000,
  };
}

function orientation(a, b, c) {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (Math.abs(value) < 1e-9) return 0;
  return value > 0 ? 1 : 2;
}

function onSegment(a, b, c) {
  return (
    b.x <= Math.max(a.x, c.x) + 1e-9 &&
    b.x + 1e-9 >= Math.min(a.x, c.x) &&
    b.y <= Math.max(a.y, c.y) + 1e-9 &&
    b.y + 1e-9 >= Math.min(a.y, c.y)
  );
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(a, c, b)) return true;
  if (o2 === 0 && onSegment(a, d, b)) return true;
  if (o3 === 0 && onSegment(c, a, d)) return true;
  if (o4 === 0 && onSegment(c, b, d)) return true;
  return false;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function centroid(points) {
  const sum = points.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lon: acc.lon + point.lon }),
    { lat: 0, lon: 0 },
  );
  return { lat: sum.lat / points.length, lon: sum.lon / points.length };
}

function distanceMeters(a, b) {
  const origin = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 };
  const ap = project(a, origin);
  const bp = project(b, origin);
  return Math.hypot(ap.x - bp.x, ap.y - bp.y);
}

function pointToSegmentDistance(point, segA, segB) {
  const origin = point;
  const p = project(point, origin);
  const a = project(segA, origin);
  const b = project(segB, origin);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  const x = a.x + t * dx;
  const y = a.y + t * dy;
  return Math.hypot(p.x - x, p.y - y);
}

const culvertPoints = culvert.geometry.map(toPoint);
const culvertSegments = [];
for (let i = 0; i < culvertPoints.length - 1; i += 1) {
  culvertSegments.push([culvertPoints[i], culvertPoints[i + 1]]);
}

const buildings = elements
  .filter(
    (element) =>
      (element.type === 'way' || element.type === 'relation') &&
      element.tags?.building &&
      Array.isArray(element.geometry) &&
      element.geometry.length >= 3,
  )
  .map((element) => {
    const polygon = element.geometry.map(toPoint);
    const center = element.center
      ? { lat: Number(element.center.lat), lon: Number(element.center.lon) }
      : centroid(polygon);
    const edgeIntersections = [];
    for (let i = 0; i < polygon.length; i += 1) {
      const edgeA = polygon[i];
      const edgeB = polygon[(i + 1) % polygon.length];
      for (let j = 0; j < culvertSegments.length; j += 1) {
        const [culvertA, culvertB] = culvertSegments[j];
        const origin = {
          lat: (edgeA.lat + edgeB.lat + culvertA.lat + culvertB.lat) / 4,
          lon: (edgeA.lon + edgeB.lon + culvertA.lon + culvertB.lon) / 4,
        };
        if (
          segmentsIntersect(
            project(edgeA, origin),
            project(edgeB, origin),
            project(culvertA, origin),
            project(culvertB, origin),
          )
        ) {
          edgeIntersections.push({ polygonEdgeIndex: i, culvertSegmentIndex: j });
        }
      }
    }
    const culvertPointsInside = culvertPoints.filter((point) => pointInPolygon(point, polygon));
    const minCenterToCulvert = Math.min(
      ...culvertSegments.map(([a, b]) => pointToSegmentDistance(center, a, b)),
    );
    const nearestAddresses = addressHits
      .map((address) => ({
        adressetekst: address.adressetekst,
        sourceObjectId: address.sourceObjectId,
        distanceMeters: Number(distanceMeters(center, address).toFixed(2)),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 6);
    return {
      osmType: element.type,
      osmId: element.id,
      tags: element.tags || {},
      center,
      culvertPointsInsideCount: culvertPointsInside.length,
      edgeIntersectionCount: edgeIntersections.length,
      edgeIntersections,
      minCenterToCulvertMeters: Number(minCenterToCulvert.toFixed(2)),
      nearestAddresses,
    };
  });

const intersectingBuildings = buildings
  .filter(
    (building) =>
      building.edgeIntersectionCount > 0 || building.culvertPointsInsideCount > 0,
  )
  .sort((a, b) => {
    if (a.edgeIntersectionCount !== b.edgeIntersectionCount) {
      return b.edgeIntersectionCount - a.edgeIntersectionCount;
    }
    return a.minCenterToCulvertMeters - b.minCenterToCulvertMeters;
  });

const nearestBuildings = buildings
  .slice()
  .sort((a, b) => a.minCenterToCulvertMeters - b.minCenterToCulvertMeters)
  .slice(0, 20);

const exactCandidate = intersectingBuildings.length === 1 ? intersectingBuildings[0] : null;
const result = {
  date: '2026-07-20',
  placeId: 'seilduksfabrikken_nydalen',
  historicalPhysicalKey:
    'Oslo byleksikon documents Akerselva in a culvert under Øvre Spinneri.',
  culvert: {
    osmType: 'way',
    osmId: culvert.id,
    tags: culvert.tags || {},
    geometry: culvertPoints,
  },
  intersectingBuildings,
  nearestBuildings,
  conclusion: {
    uniqueIntersectingBuilding: Boolean(exactCandidate),
    candidate: exactCandidate,
    decision: exactCandidate
      ? 'unique_geometry_candidate_found'
      : 'no_unique_geometry_candidate',
    reason: exactCandidate
      ? `Exactly one building polygon intersects OSM culvert way ${culvert.id}. This geometry is a strong candidate for Øvre Spinneri and must now be cross-checked against current/historical visual orientation before production.`
      : `Found ${intersectingBuildings.length} building polygons intersecting OSM culvert way ${culvert.id}; geometry alone does not yet identify one unique building.`,
  },
};

fs.writeFileSync(
  path.join(reportDir, 'segment-intersection-summary.json'),
  `${JSON.stringify(result, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(reportDir, 'segment-intersection-note.md'),
  `# Øvre Spinneri — corrected culvert/building intersection\n\nDate: 2026-07-20\n\nThe first culvert pass only checked whether culvert geometry vertices fell inside building polygons. That is insufficient when both tunnel endpoints sit outside a building while the connecting segment passes underneath it. This correction performs true line-segment/polygon-edge intersection tests.\n\nDecision: **${result.conclusion.decision}**\n\n${result.conclusion.reason}\n`,
);

console.log(JSON.stringify(result, null, 2));
