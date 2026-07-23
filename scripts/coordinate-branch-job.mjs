import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-156-alna-outlets-research');
const TUNNEL_WAY_ID = 130106085;
const OPEN_OUTLET_WAY_ID = 131984275;
const OUTLET_WATER_AREA_ID = 865565720;
const PARK_VIEWBOX = '10.748,59.910,10.775,59.899';
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));
const decodeXml = (v = '') => v.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], decodeXml(m[2])]));
const normalize = (v = '') => String(v).trim().toLocaleLowerCase('nb-NO');

function parseWayFull(xml, wayId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodes.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  const match = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((item) => Number(attrs(`<way ${item[1]}>`).id) === wayId);
  if (!match) throw new Error(`Fant ikke way ${wayId}`);
  const tags = {};
  const nodeRefs = [];
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const ndMatch of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
    const a = attrs(ndMatch[0]);
    if (a.ref) nodeRefs.push(String(a.ref));
  }
  return { id: wayId, tags, nodeRefs, points: nodeRefs.map((ref) => nodes.get(ref)).filter(Boolean) };
}
function parseWays(xml) {
  const ways = [];
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const meta = attrs(`<way ${match[1]}>`);
    const tags = {};
    const nodeRefs = [];
    for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
      const a = attrs(tagMatch[0]);
      if (a.k) tags[a.k] = a.v ?? '';
    }
    for (const ndMatch of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
      const a = attrs(ndMatch[0]);
      if (a.ref) nodeRefs.push(String(a.ref));
    }
    ways.push({ id: Number(meta.id), tags, nodeRefs });
  }
  return ways;
}
function sharedRefs(a, b) {
  const bSet = new Set(b.nodeRefs);
  return a.nodeRefs.filter((ref) => bSet.has(ref));
}
function pointInRing(point, ring) {
  let inside = false;
  const x = point.lon;
  const y = point.lat;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
function pointInGeoJson(point, geojson) {
  if (!geojson) return false;
  const polygons = geojson.type === 'Polygon' ? [geojson.coordinates] : geojson.type === 'MultiPolygon' ? geojson.coordinates : [];
  return polygons.some((polygon) => {
    if (!polygon.length || !pointInRing(point, polygon[0])) return false;
    return !polygon.slice(1).some((hole) => pointInRing(point, hole));
  });
}
function simpleCenter(geometry) {
  if (!geometry?.length) return null;
  return {
    lat: geometry.reduce((sum, p) => sum + p.lat, 0) / geometry.length,
    lon: geometry.reduce((sum, p) => sum + p.lon, 0) / geometry.length,
  };
}

const parkUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent('Middelalderparken, Oslo, Norway')}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${PARK_VIEWBOX}&bounded=1`;
const parkResults = await fetchJson(parkUrl);
fs.writeFileSync(path.join(REPORT_DIR, 'nominatim-middelalderparken.json'), `${JSON.stringify({ parkUrl, results: parkResults }, null, 2)}\n`);
const exactParks = parkResults.filter((result) => normalize(result.name || result.namedetails?.name) === 'middelalderparken' && ['Polygon', 'MultiPolygon'].includes(result.geojson?.type));
if (exactParks.length !== 1) throw new Error(`Forventet én eksakt Middelalderparken-geometri, fant ${exactParks.length}`);
const park = exactParks[0];
const bbox = park.boundingbox.map(Number);
const [south, north, west, east] = bbox;
const waterQuery = `[out:json][timeout:30];(nwr["natural"="water"](${south},${west},${north},${east});nwr["water"](${south},${west},${north},${east}););out center tags geom;`;
const overpassEndpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let waterRaw = null;
let waterUsedUrl = null;
let waterErrors = [];
for (const endpoint of overpassEndpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(waterQuery)}`;
    waterRaw = await fetchJson(url);
    waterUsedUrl = url;
    break;
  } catch (error) {
    waterErrors.push(String(error));
  }
}
if (!waterRaw) throw new Error(`Kunne ikke hente vannobjekter: ${waterErrors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-middelalderparken-water.json'), `${JSON.stringify({ query: waterQuery, waterUsedUrl, waterErrors, raw: waterRaw }, null, 2)}\n`);
const parkWaterCandidates = (waterRaw.elements || []).map((element) => {
  const geometry = (element.geometry || []).map((p) => ({ lat: p.lat, lon: p.lon }));
  const center = element.type === 'node' ? { lat: element.lat, lon: element.lon } : element.center || simpleCenter(geometry);
  return {
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    center,
    geometryPointCount: geometry.length,
    centerInsidePark: center ? pointInGeoJson(center, park.geojson) : false,
    geometry,
  };
});
const waterInsidePark = parkWaterCandidates.filter((candidate) => candidate.centerInsidePark && candidate.geometryPointCount >= 3);

const tunnelXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${TUNNEL_WAY_ID}/full`);
const openXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${OPEN_OUTLET_WAY_ID}/full`);
const waterAreaXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${OUTLET_WATER_AREA_ID}/full`);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${TUNNEL_WAY_ID}-full.xml`), tunnelXml);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${OPEN_OUTLET_WAY_ID}-full.xml`), openXml);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${OUTLET_WATER_AREA_ID}-full.xml`), waterAreaXml);
const tunnel = parseWayFull(tunnelXml, TUNNEL_WAY_ID);
const openWay = parseWayFull(openXml, OPEN_OUTLET_WAY_ID);
const waterArea = parseWayFull(waterAreaXml, OUTLET_WATER_AREA_ID);
const tunnelOpenShared = sharedRefs(tunnel, openWay);
const openWaterShared = sharedRefs(openWay, waterArea);
if (tunnelOpenShared.length !== 1) throw new Error(`Forventet én tunnel/open shared node, fant ${tunnelOpenShared.length}`);
const downstreamNodeId = openWay.nodeRefs.find((ref) => !tunnelOpenShared.includes(ref));
const downstreamPoint = openWay.points.find((point) => point.id === downstreamNodeId);
const downstreamWaysXml = await fetchText(`https://api.openstreetmap.org/api/0.6/node/${downstreamNodeId}/ways`);
fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${downstreamNodeId}-ways.xml`), downstreamWaysXml);
const downstreamConnected = parseWays(downstreamWaysXml).filter((way) => way.id !== OPEN_OUTLET_WAY_ID);

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'alna_utlop_bjorvika',
  historicalMarker: {
    park: { osmType: park.osm_type, osmId: park.osm_id, name: park.name || park.namedetails?.name, category: park.category, type: park.type, boundingbox: park.boundingbox },
    waterCandidateCountInsidePark: waterInsidePark.length,
    waterCandidatesInsidePark: waterInsidePark.map((candidate) => ({ osmType: candidate.osmType, osmId: candidate.osmId, tags: candidate.tags, center: candidate.center, geometryPointCount: candidate.geometryPointCount })),
    selectionRule: 'A Vannspeilet geometry is defensible only if exactly one substantial mapped water polygon has its center inside the exact Middelalderparken geometry.',
  },
  currentOutlet: {
    tunnelWay: { id: TUNNEL_WAY_ID, tags: tunnel.tags },
    openOutletWay: { id: OPEN_OUTLET_WAY_ID, tags: openWay.tags, points: openWay.points },
    outletWaterArea: { id: OUTLET_WATER_AREA_ID, tags: waterArea.tags, sharedNodesWithOpenWay: openWaterShared },
    tunnelOpenSharedNode: tunnelOpenShared[0],
    downstreamNode: downstreamPoint,
    downstreamConnectedWays: downstreamConnected.map((way) => ({ id: way.id, tags: way.tags })),
    coastlineWaysAtDownstreamNode: downstreamConnected.filter((way) => way.tags.natural === 'coastline').map((way) => ({ id: way.id, tags: way.tags })),
  },
  officialInterpretation: {
    historical: 'Vannspeilet is an official physical marker of the original Alna outlet; it is not itself proof of an exact separate medieval mouth point.',
    current: 'The current hydrological outlet must follow the tunnel-to-open-water topology, not the historical Bjørvika coordinate.',
  },
  nextAction: waterInsidePark.length === 1
    ? 'Use the unique water polygon inside Middelalderparken as the historical outlet marker candidate. Resolve the current open outlet endpoint against coastline or harbour-water geometry before production.'
    : 'Do not select a historical marker geometry until the park contains exactly one defensible water polygon candidate.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'followup-topology.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'followup_complete',
  waterCandidateCountInsidePark: waterInsidePark.length,
  tunnelOpenSharedNodeCount: tunnelOpenShared.length,
  openWaterSharedNodeCount: openWaterShared.length,
  downstreamCoastlineWayCount: result.currentOutlet.coastlineWaysAtDownstreamNode.length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'followup-topology.json')),
}, null, 2));
