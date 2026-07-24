import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-botanisk-hage-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/botanisk_hage.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const osmWayId = 4045303;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url, accept = 'application/json,text/html;q=0.9,*/*;q=0.8') => {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
      accept,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));
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
  const earth = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
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
const polygonCentroid = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const x1 = ring[i].lon;
    const y1 = ring[i].lat;
    const x2 = ring[i + 1].lon;
    const y2 = ring[i + 1].lat;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    return {
      lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
      lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
    };
  }
  return { lat: cy / (3 * twiceArea), lon: cx / (3 * twiceArea) };
};

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'botanisk_hage', 'Unexpected place identity.');
assert(place.coordStatus == null, 'Botanisk hage already has a coordinate status; manual reconciliation required.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current Botanisk hage marker is missing.');

const urls = {
  official: 'https://www.nhm.uio.no/utstillinger/botanisk-hage/index.html',
  osmApi: `https://api.openstreetmap.org/api/0.6/way/${osmWayId}/full.json`,
  osmPage: `https://www.openstreetmap.org/way/${osmWayId}`,
  wikidataApi: 'https://www.wikidata.org/wiki/Special:EntityData/Q3116396.json',
  wikidataPage: 'https://www.wikidata.org/wiki/Q3116396',
};

const [officialHtml, osm, wikidata] = await Promise.all([
  fetchText(urls.official, 'text/html,*/*;q=0.8'),
  fetchJson(urls.osmApi),
  fetchJson(urls.wikidataApi),
]);

const officialText = normalize(officialHtml);
assert(officialText.includes('botanisk hage'), 'NHM/UiO page no longer identifies Botanisk hage.');
assert(officialText.includes('naturhistorisk museum') || officialText.includes('universitetet i oslo'), 'NHM/UiO ownership context is missing.');

const way = osm.elements?.find((entry) => entry.type === 'way' && entry.id === osmWayId);
assert(way, `OSM way ${osmWayId} was not returned.`);
const tags = way.tags ?? {};
assert(tags.leisure === 'garden', 'OSM object is no longer leisure=garden.');
assert(normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''} ${tags['name:en'] ?? ''}`).includes('botanisk'), 'OSM object no longer names the botanical garden.');
assert(tags.wikidata === 'Q3116396', 'OSM garden geometry no longer links Wikidata Q3116396.');
const nodes = new Map(osm.elements.filter((entry) => entry.type === 'node').map((entry) => [entry.id, entry]));
const polygon = (way.nodes ?? []).map((id) => nodes.get(id)).filter(Boolean).map((node) => ({ lat: Number(node.lat), lon: Number(node.lon) }));
assert(polygon.length >= 4, 'OSM garden polygon is incomplete.');
const centroid = polygonCentroid(polygon);
assert(Number.isFinite(centroid.lat) && Number.isFinite(centroid.lon), 'Garden centroid could not be calculated.');
const centroidInside = pointInPolygon(centroid, polygon);
assert(centroidInside, 'Calculated garden centroid falls outside the OSM polygon; manual geometry review required.');

const entity = wikidata.entities?.Q3116396;
assert(entity, 'Wikidata Q3116396 was not returned.');
const wikidataIdentity = Object.values(entity.labels ?? {}).some((label) => normalize(label?.value).includes('botanical garden') || normalize(label?.value).includes('botanisk hage'));
assert(wikidataIdentity, 'Wikidata Q3116396 no longer resolves to Oslo Botanical Garden.');
const inception1814 = entity.claims?.P571?.some((claim) => String(claim.mainsnak?.datavalue?.value?.time ?? '').startsWith('+1814'));
assert(inception1814, 'Wikidata no longer supports the 1814 inception year.');
const coordinateClaim = entity.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
assert(coordinateClaim, 'Wikidata garden coordinate is missing.');
const wikidataCoordinate = { lat: Number(coordinateClaim.latitude), lon: Number(coordinateClaim.longitude) };
const wikidataInside = pointInPolygon(wikidataCoordinate, polygon);
assert(wikidataInside, 'Wikidata coordinate no longer lies inside the OSM garden geometry.');
const centroidToWikidataMeters = distanceMeters(centroid, wikidataCoordinate);

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const currentInside = pointInPolygon(currentCoordinate, polygon);
const displacementMeters = distanceMeters(currentCoordinate, centroid);
const maximumVertexDistanceMeters = Math.max(...polygon.map((point) => distanceMeters(centroid, point)));
const coordinateDecision = !currentInside || displacementMeters > 30
  ? 'promote_osm_garden_geometry_centroid'
  : 'verify_existing_inside_garden_geometry';

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_university_botanical_garden_oslo',
  coordinateDecision,
  currentCoordinate,
  currentMarkerInsideGarden: currentInside,
  candidate: {
    lat: Number(centroid.lat.toFixed(8)),
    lon: Number(centroid.lon.toFixed(8)),
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${osmWayId}`,
    sourceUrl: urls.osmPage,
    objectType: 'botanical_garden_polygon_centroid',
    wikidata: tags.wikidata,
  },
  displacementMeters: Number(displacementMeters.toFixed(1)),
  geometry: {
    sourceObjectId: `osm-way:${osmWayId}`,
    sourceUrl: urls.osmPage,
    polygonNodeCount: polygon.length,
    centroidInside,
    maximumVertexDistanceMeters: Number(maximumVertexDistanceMeters.toFixed(1)),
    currentRadiusMeters: Number(place.r),
    currentRadiusCoversMaximumVertex: Number(place.r) >= maximumVertexDistanceMeters,
  },
  wikidata: {
    sourceObjectId: 'wikidata:Q3116396',
    sourceUrl: urls.wikidataPage,
    coordinate: wikidataCoordinate,
    coordinateInsideGarden: wikidataInside,
    centroidAgreementMeters: Number(centroidToWikidataMeters.toFixed(1)),
    inception1814,
  },
  sourceChecks: {
    officialNhmIdentity: true,
    osmExactNamedGardenGeometry: true,
    osmWikidataDirectLink: true,
    wikidataIdentityAndInception: true,
    wikidataCoordinateInsideGeometry: true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: coordinateDecision === 'promote_osm_garden_geometry_centroid'
      ? `Apply the centroid of OSM way ${osmWayId} as the canonical area marker, preserve the complete garden polygon as evidence, review the radius against the ${Number(maximumVertexDistanceMeters.toFixed(1))}-metre maximum vertex distance, synchronize aggregate/index copies, and keep protocol max batch at 195.`
      : `Keep the current marker, attach OSM way ${osmWayId} and Wikidata Q3116396 as verified garden geometry evidence, synchronize status fields, and keep protocol max batch at 195.`,
    coordStatus: 'verified_geometry',
    coordType: 'area_center',
    locatorType: 'area',
    suggestedRadiusMeters: Math.ceil(maximumVertexDistanceMeters / 10) * 10,
  },
};

await fs.writeFile(path.join(reportDir, 'nhm-botanisk-hage.html'), officialHtml);
await fs.writeFile(path.join(reportDir, `osm-way-${osmWayId}-full.json`), `${JSON.stringify(osm, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'wikidata-Q3116396.json'), `${JSON.stringify(wikidata, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Botanisk hage coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **University Botanical Garden, Oslo, established 1814**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Current marker inside garden polygon: **${currentInside ? 'yes' : 'no'}**\n- OSM polygon centroid: **${summary.candidate.lat}, ${summary.candidate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- OSM geometry: **way ${osmWayId}**\n- Wikidata object: **Q3116396**\n- Centroid/Wikidata agreement: **${summary.wikidata.centroidAgreementMeters} m**\n- Maximum centroid-to-vertex distance: **${summary.geometry.maximumVertexDistanceMeters} m**\n- Suggested radius: **${summary.recommendation.suggestedRadiusMeters} m**\n- Recommendation: **${coordinateDecision}**\n\nNHM/UiO resolves the scientific garden identity, OSM supplies the complete named garden geometry, and Wikidata independently confirms the identity, 1814 inception and a point inside the polygon. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'botanisk_hage_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  currentInside,
  suggestedRadiusMeters: summary.recommendation.suggestedRadiusMeters,
  recommendation: coordinateDecision,
}, null, 2));
