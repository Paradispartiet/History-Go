import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportDir = 'reports/oslo-coordinate-ous-hospitals-research-post-195';
const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const userAgent = 'History-Go coordinate research refinement/2026-07-25';

const toRadians = (value) => (value * Math.PI) / 180;
const distanceMeters = (aLat, aLon, bLat, bLon) => {
  const radius = 6371008.8;
  const dLat = toRadians(bLat - aLat);
  const dLon = toRadians(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
};
const pointInPolygon = (lat, lon, geometry) => {
  let inside = false;
  for (let i = 0, j = geometry.length - 1; i < geometry.length; j = i++) {
    const xi = geometry[i].lon;
    const yi = geometry[i].lat;
    const xj = geometry[j].lon;
    const yj = geometry[j].lat;
    if (((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi)) inside = !inside;
  }
  return inside;
};
const centerOf = (element) => {
  if (element.center) return element.center;
  if (!Array.isArray(element.geometry) || !element.geometry.length) return null;
  return {
    lat: element.geometry.reduce((sum, point) => sum + point.lat, 0) / element.geometry.length,
    lon: element.geometry.reduce((sum, point) => sum + point.lon, 0) / element.geometry.length,
  };
};
const samePoint = (a, b) => Math.abs(a.lat - b.lat) < 1e-7 && Math.abs(a.lon - b.lon) < 1e-7;
const joinWaysIntoRings = (ways) => {
  const unused = ways.map((way) => [...way.geometry]);
  const rings = [];
  while (unused.length) {
    let ring = unused.shift();
    let progressed = true;
    while (!samePoint(ring[0], ring.at(-1)) && progressed) {
      progressed = false;
      for (let index = 0; index < unused.length; index += 1) {
        const candidate = unused[index];
        if (samePoint(ring.at(-1), candidate[0])) {
          ring = ring.concat(candidate.slice(1));
        } else if (samePoint(ring.at(-1), candidate.at(-1))) {
          ring = ring.concat([...candidate].reverse().slice(1));
        } else if (samePoint(ring[0], candidate.at(-1))) {
          ring = candidate.slice(0, -1).concat(ring);
        } else if (samePoint(ring[0], candidate[0])) {
          ring = [...candidate].reverse().slice(0, -1).concat(ring);
        } else {
          continue;
        }
        unused.splice(index, 1);
        progressed = true;
        break;
      }
    }
    if (ring.length >= 4 && samePoint(ring[0], ring.at(-1))) rings.push(ring);
  }
  return rings;
};

const summaryPath = `${reportDir}/summary.json`;
const summary = await readJson(summaryPath);

const radium = summary.places.find((entry) => entry.placeId === 'radiumhospitalet');
const radiumRaw = await readJson(`${reportDir}/overpass-radiumhospitalet.json`);
const radiumArea = (radiumRaw.elements || []).find((element) => element.type === 'way' && element.id === 143526382);
if (!radium || !radiumArea?.geometry) throw new Error('Radiumhospitalet area geometry missing');
const radiumInside = pointInPolygon(radium.officialAddress.lat, radium.officialAddress.lon, radiumArea.geometry);
radium.geometry.addressPointInsideHospitalArea = radiumInside;
radium.geometry.areaGeometrySourceObjectId = 'osm-way:143526382';
radium.decision.canBecomeVerified = Boolean(radiumInside && radium.geometry.supportedBuildingCount > 0 && radium.decision.recommendedRadius);
radium.decision.locatorType = 'current_place';
radium.decision.nextAction = radium.decision.canBecomeVerified
  ? 'Create a separate production PR using the official address point and named hospital-area radius.'
  : 'Keep research-only until the official address point can be reconciled with the hospital area.';

const rik = summary.places.find((entry) => entry.placeId === 'rikshospitalet');
if (!rik) throw new Error('Rikshospitalet summary missing');
const relationQuery = `[out:json][timeout:90];relation(14086466)->.hospital;.hospital out body;way(r.hospital);out tags geom;`;
let relationPayload = null;
let endpointUsed = null;
let lastError = null;
for (const endpoint of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'user-agent': userAgent,
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams({ data: relationQuery }).toString(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    relationPayload = await response.json();
    endpointUsed = endpoint;
    break;
  } catch (error) {
    lastError = String(error);
  }
}
if (!relationPayload) throw new Error(`Rikshospitalet relation query failed: ${lastError}`);
await writeJson(`${reportDir}/overpass-rikshospitalet-relation.json`, relationPayload);

const relation = (relationPayload.elements || []).find((element) => element.type === 'relation' && element.id === 14086466);
const outerWayIds = new Set((relation?.members || []).filter((member) => member.type === 'way' && member.role === 'outer').map((member) => member.ref));
const outerWays = (relationPayload.elements || []).filter((element) => (
  element.type === 'way' && outerWayIds.has(element.id) && Array.isArray(element.geometry) && element.geometry.length >= 2
));
const outerRings = joinWaysIntoRings(outerWays);
if (!outerRings.length) throw new Error(`Rikshospitalet relation produced no closed outer rings; outer ways=${outerWays.length}`);
const rikInside = outerRings.some((ring) => pointInPolygon(rik.officialAddress.lat, rik.officialAddress.lon, ring));

const rikRaw = await readJson(`${reportDir}/overpass-rikshospitalet.json`);
const rikBuildings = (rikRaw.elements || []).filter((element) => (
  element.type === 'way' && element.tags?.building && Array.isArray(element.geometry) && element.geometry.length >= 4
));
const supportedBuildings = rikBuildings.filter((building) => {
  const center = centerOf(building);
  return center && outerRings.some((ring) => pointInPolygon(center.lat, center.lon, ring));
});
const supportVertices = supportedBuildings.flatMap((building) => building.geometry);
const maximumSupportDistance = supportVertices.length
  ? Math.max(...supportVertices.map((point) => distanceMeters(rik.officialAddress.lat, rik.officialAddress.lon, point.lat, point.lon)))
  : null;
const bufferMeters = 40;
const recommendedRadius = maximumSupportDistance === null
  ? null
  : Math.ceil((maximumSupportDistance + bufferMeters) / 10) * 10;

rik.geometry.relationGeometryEndpoint = endpointUsed;
rik.geometry.relationOuterWayCount = outerWays.length;
rik.geometry.relationOuterRingCount = outerRings.length;
rik.geometry.addressPointInsideHospitalArea = rikInside;
rik.geometry.areaGeometrySourceObjectId = 'osm-relation:14086466';
rik.geometry.supportedBuildingCount = supportedBuildings.length;
rik.geometry.maximumCampusSupportDistanceMeters = maximumSupportDistance === null ? null : Math.round(maximumSupportDistance * 10) / 10;
rik.radiusRecommendation = {
  method: 'building centroids inside OSM relation 14086466 outer rings plus 40 metre buffer',
  bufferMeters,
  recommendedRadius,
};
rik.decision.recommendedRadius = recommendedRadius;
rik.decision.canBecomeVerified = Boolean(rikInside && supportedBuildings.length > 0 && recommendedRadius);
rik.decision.locatorType = 'current_place';
rik.decision.nextAction = rik.decision.canBecomeVerified
  ? 'Create a separate production PR using the official address point and multipolygon-supported hospital radius.'
  : 'Keep research-only until the official address point can be reconciled with the hospital multipolygon.';

summary.refinement = {
  version: '2026-07-25-area-model-v2',
  coordinateModel: 'official main-address display point plus named hospital-area building support',
  radiumhospitaletArea: 'osm-way:143526382',
  rikshospitaletArea: 'osm-relation:14086466',
};
await writeJson(summaryPath, summary);
await fs.appendFile(
  path.join(root, reportDir, 'README.md'),
  '\nRefinement: address points are evaluated against the named hospital areas rather than requiring them to fall inside a single building footprint. Rikshospitalet relation 14086466 was expanded into outer-ring geometry.\n',
  'utf8',
);
console.log(JSON.stringify(summary, null, 2));
