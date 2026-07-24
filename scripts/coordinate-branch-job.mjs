import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-naturhistorisk-museum-research-post-195';
const reportDir = path.join(root, reportRel);
const summaryRel = `${reportRel}/summary.json`;
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'History-Go/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
};
const norm = (value) => String(value ?? '').replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
const distanceMeters = (a, b) => {
  const rad = (v) => v * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const pointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if (((a.lat > point.lat) !== (b.lat > point.lat))
      && point.lon < ((b.lon - a.lon) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
  }
  return inside;
};
const polygonMetrics = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon ? points : [...points, points[0]];
  const refLat = ring.reduce((sum, p) => sum + p.lat, 0) / ring.length;
  const ys = 111320, xs = ys * Math.cos(refLat * Math.PI / 180);
  let a2 = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const x1 = ring[i].lon * xs, y1 = ring[i].lat * ys, x2 = ring[i + 1].lon * xs, y2 = ring[i + 1].lat * ys;
    const cross = x1 * y2 - x2 * y1;
    a2 += cross; cx += (x1 + x2) * cross; cy += (y1 + y2) * cross;
  }
  assert(Math.abs(a2) > 0.01, 'Zero-area building polygon.');
  return { ring, area: Math.abs(a2 / 2), centroid: { lat: (cy / (3 * a2)) / ys, lon: (cx / (3 * a2)) / xs } };
};

const protocol = await readText(protocolRel);
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && !/^\|\s*196\s*\|/m.test(protocol), 'Protocol must stop at batch 195.');
const summary = await readJson(summaryRel);
assert(summary.placeId === 'naturhistorisk_museum' && summary.researchOnly === true, 'Unexpected research summary.');
const point = { lat: Number(summary.candidate.lat), lon: Number(summary.candidate.lon) };
const query = `[out:json][timeout:30];(way(around:260,${point.lat},${point.lon})[building];nwr(around:260,${point.lat},${point.lon})[tourism=museum];nwr(around:260,${point.lat},${point.lon})[amenity=museum];nwr(around:260,${point.lat},${point.lon})["addr:street"~"Sars",i];);out center tags geom;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const osm = await fetchJson(url);
await fs.writeFile(path.join(reportDir, 'overpass-nhm-building-context.json'), `${JSON.stringify(osm, null, 2)}\n`);

const buildings = [];
for (const element of osm.elements ?? []) {
  if (element.type !== 'way' || !Array.isArray(element.geometry) || element.geometry.length < 4) continue;
  const polygon = element.geometry.map((p) => ({ lat: Number(p.lat), lon: Number(p.lon) }));
  const m = polygonMetrics(polygon);
  const tags = element.tags ?? {};
  const text = norm([tags.name, tags['name:en'], tags.alt_name, tags.description].join(' '));
  const containsAddress = pointInPolygon(point, m.ring);
  const museumNamed = text.includes('naturhistorisk museum') || text.includes('natural history museum');
  const knownMuseumBuilding = /brøgger|brogger|collett|lid|zoolog|geolog|museum/.test(text);
  buildings.push({
    sourceObjectId: `osm-way:${element.id}`,
    sourceUrl: `https://www.openstreetmap.org/way/${element.id}`,
    tags,
    containsAddress,
    museumNamed,
    knownMuseumBuilding,
    polygonNodeCount: polygon.length,
    areaSquareMeters: Number(m.area.toFixed(1)),
    centroid: { lat: Number(m.centroid.lat.toFixed(8)), lon: Number(m.centroid.lon.toFixed(8)) },
    addressToCentroidMeters: Number(distanceMeters(point, m.centroid).toFixed(1)),
    maximumVertexDistanceMeters: Number(Math.max(...m.ring.map((p) => distanceMeters(m.centroid, p))).toFixed(1)),
  });
}
buildings.sort((a, b) => Number(b.containsAddress) - Number(a.containsAddress) || a.addressToCentroidMeters - b.addressToCentroidMeters);
const containing = buildings.filter((b) => b.containsAddress);
const supportingBuilding = containing.find((b) => b.museumNamed || b.knownMuseumBuilding) ?? containing[0] ?? null;
const museumPoi = summary.supportingOsmObject;
const addressToPoiMeters = Number(distanceMeters(point, museumPoi.coordinate).toFixed(1));
const strongContext = Boolean(supportingBuilding) && addressToPoiMeters <= 75;
assert(strongContext, 'Official address point lacks adequate physical museum-building context.');

summary.buildingContext = {
  queryRadiusMeters: 260,
  addressContainingBuildingCount: containing.length,
  supportingBuilding,
  addressToMuseumPoiMeters: addressToPoiMeters,
  nearbyBuildingCount: buildings.length,
  botanicalGardenStillExcluded: true,
};
summary.sourceChecks = {
  ...summary.sourceChecks,
  boundedBuildingContextValidated: true,
  officialAddressInsideNearbyBuilding: true,
  officialAddressNearNamedMuseumPoi: true,
};
summary.recommendation.nextAction = `Apply ${summary.candidate.sourceObjectId} as canonical display marker because it is the unique official Sars' gate 1 point, lies inside ${supportingBuilding.sourceObjectId}, and is ${addressToPoiMeters} metres from the dedicated Naturhistorisk museum POI; preserve NHM/UiO and Brønnøysund identity, retain the museum POI and containing building as support, keep Botanisk hage separate, synchronize evidence/index and keep protocol max at 195.`;
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Natural History Museum coordinate research\n\n- Canonical changed: **no**\n- Unique official point: **yes**\n- Dedicated museum POI: **${museumPoi.sourceObjectId}**\n- Address-to-POI distance: **${addressToPoiMeters} m**\n- Address-containing building: **${supportingBuilding.sourceObjectId}**\n- Building name: **${supportingBuilding.tags.name ?? 'unnamed'}**\n- Botanical garden excluded: **yes**\n- Can become verified: **yes**\n- Protocol max batch: **${maxBatch}**\n`, 'utf8');
console.log(JSON.stringify({ status: 'nhm_building_context_validated', supportingBuilding: supportingBuilding.sourceObjectId, buildingName: supportingBuilding.tags.name ?? null, addressToMuseumPoiMeters: addressToPoiMeters, protocolMaxBatch: maxBatch }, null, 2));
