import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-156-alna-outlets-research');
const TUNNEL_WAY_ID = 130106085;
const OPEN_OUTLET_WAY_ID = 131984275;
const OUTLET_WATER_AREA_ID = 865565720;
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

const [tunnelXml, openXml, waterAreaXml] = await Promise.all([
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${TUNNEL_WAY_ID}/full`),
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${OPEN_OUTLET_WAY_ID}/full`),
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${OUTLET_WATER_AREA_ID}/full`),
]);
const tunnel = parseWayFull(tunnelXml, TUNNEL_WAY_ID);
const openWay = parseWayFull(openXml, OPEN_OUTLET_WAY_ID);
const waterArea = parseWayFull(waterAreaXml, OUTLET_WATER_AREA_ID);
const tunnelOpenShared = sharedRefs(tunnel, openWay);
if (tunnelOpenShared.length !== 1) throw new Error(`Forventet én tunnel/open shared node, fant ${tunnelOpenShared.length}`);
const endpointNodeIds = [openWay.nodeRefs[0], openWay.nodeRefs.at(-1)];
const downstreamNodeId = endpointNodeIds.find((nodeId) => nodeId !== tunnelOpenShared[0]);
if (!downstreamNodeId) throw new Error('Kunne ikke identifisere faktisk nedstrøms endepunkt');
const downstreamPoint = openWay.points.find((point) => point.id === downstreamNodeId);
const downstreamWaysXml = await fetchText(`https://api.openstreetmap.org/api/0.6/node/${downstreamNodeId}/ways`);
fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${downstreamNodeId}-ways-corrected.xml`), downstreamWaysXml);
const downstreamConnected = parseWays(downstreamWaysXml).filter((way) => way.id !== OPEN_OUTLET_WAY_ID);
const coastlineWays = downstreamConnected.filter((way) => way.tags.natural === 'coastline');
const waterwayWays = downstreamConnected.filter((way) => Boolean(way.tags.waterway));
const sharedWaterAreaNodes = sharedRefs(openWay, waterArea);

const overpassQuery = `[out:json][timeout:30];way(${OUTLET_WATER_AREA_ID})->.water;node(w.water)->.nodes;way(bn.nodes)["natural"="coastline"];out body;`;
const overpassEndpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let coastlineBoundaryRaw = null;
let usedUrl = null;
let errors = [];
for (const endpoint of overpassEndpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;
    coastlineBoundaryRaw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
const coastlineBoundaryWays = (coastlineBoundaryRaw?.elements || []).map((element) => ({ id: element.id, tags: element.tags || {}, nodes: element.nodes || [] }));

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'alna_utlop_bjorvika',
  historicalMarkerResolved: {
    sourceObjectId: 'osm-way:4258487',
    osmName: 'Tenerife',
    interpretation: 'Unique substantial water polygon inside exact Middelalderparken geometry; external public-source context identifies Tenerife as the nickname of Vannspeilet, while Oslo kommune documents Vannspeilet as the marker of Alnaelvas original outlet.',
  },
  currentOutletCorrected: {
    tunnelWay: { id: TUNNEL_WAY_ID, tags: tunnel.tags },
    openOutletWay: { id: OPEN_OUTLET_WAY_ID, tags: openWay.tags, endpointNodeIds, points: openWay.points },
    tunnelOpenSharedNode: tunnelOpenShared[0],
    actualDownstreamNode: downstreamPoint,
    downstreamConnectedWays: downstreamConnected.map((way) => ({ id: way.id, tags: way.tags })),
    coastlineWaysAtActualDownstreamNode: coastlineWays.map((way) => ({ id: way.id, tags: way.tags })),
    waterwayWaysAtActualDownstreamNode: waterwayWays.map((way) => ({ id: way.id, tags: way.tags })),
    outletWaterArea: { id: OUTLET_WATER_AREA_ID, tags: waterArea.tags, sharedNodesWithOpenWay: sharedWaterAreaNodes },
    coastlineWaysSharingOutletWaterAreaNodes: coastlineBoundaryWays,
    coastlineBoundaryAuditUrl: usedUrl,
    coastlineBoundaryAuditErrors: errors,
  },
  nextAction: coastlineWays.length > 0
    ? 'Current mouth can use the actual downstream node directly as an explicit river/coastline topology anchor.'
    : coastlineBoundaryWays.length > 0
      ? 'Current mouth requires one additional water-area boundary topology step; do not use the interior open-way endpoint as a coastline mouth yet.'
      : 'Current mouth remains unresolved against the fjord boundary; do not promote a current mouth anchor yet.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'corrected-outlet-topology.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'corrected_outlet_topology_complete',
  actualDownstreamNode: downstreamPoint,
  coastlineWayCountAtActualDownstreamNode: coastlineWays.length,
  coastlineBoundaryWayCountForWaterArea: coastlineBoundaryWays.length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'corrected-outlet-topology.json')),
}, null, 2));
