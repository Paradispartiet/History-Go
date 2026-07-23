import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-153-bolerbekken-mouth-research');
const STREAM_WAY_ID = 1456532473;
const MOUTH_NODE_ID = 1110773258;
const LAKE_RELATION_ID = 33561;
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}
function decodeXml(value = '') { return value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'); }
function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) out[match[1]] = decodeXml(match[2]);
  return out;
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
      if (a.ref) nodeRefs.push(Number(a.ref));
    }
    ways.push({ id: Number(meta.id), tags, nodeRefs });
  }
  return ways;
}
function parseNodes(xml) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodes.set(Number(a.id), { id: Number(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  return nodes;
}
function parseRelation(xml, relationId) {
  const match = [...xml.matchAll(/<relation\b([^>]*)>([\s\S]*?)<\/relation>/g)]
    .find((item) => Number(attrs(`<relation ${item[1]}>`).id) === relationId);
  if (!match) throw new Error(`Fant ikke relation ${relationId}`);
  const tags = {};
  const members = [];
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const memberMatch of match[2].matchAll(/<member\b[^>]*\/>/g)) {
    const a = attrs(memberMatch[0]);
    members.push({ type: a.type, ref: Number(a.ref), role: a.role || '' });
  }
  return { tags, members };
}

const streamUrl = `https://api.openstreetmap.org/api/0.6/way/${STREAM_WAY_ID}/full`;
const nodeWaysUrl = `https://api.openstreetmap.org/api/0.6/node/${MOUTH_NODE_ID}/ways`;
const lakeUrl = `https://api.openstreetmap.org/api/0.6/relation/${LAKE_RELATION_ID}/full`;
const [streamXml, nodeWaysXml, lakeXml] = await Promise.all([fetchText(streamUrl), fetchText(nodeWaysUrl), fetchText(lakeUrl)]);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${STREAM_WAY_ID}-full.xml`), streamXml);
fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${MOUTH_NODE_ID}-ways.xml`), nodeWaysXml);
fs.writeFileSync(path.join(REPORT_DIR, `osm-relation-${LAKE_RELATION_ID}-full.xml`), lakeXml);

const streamWays = parseWays(streamXml);
const streamWay = streamWays.find((way) => way.id === STREAM_WAY_ID);
if (!streamWay || streamWay.tags.name !== 'Bølerbekken' || streamWay.tags.waterway !== 'stream') throw new Error('Uventet Bølerbekken-way');
if (!streamWay.nodeRefs.includes(MOUTH_NODE_ID)) throw new Error('Munningsnoden er ikke del av forventet Bølerbekken-way');
const streamNodes = parseNodes(streamXml);
const mouthNode = streamNodes.get(MOUTH_NODE_ID);
if (!mouthNode) throw new Error('Fant ikke munningsnoden i fresh stream-geometri');

const lakeRelation = parseRelation(lakeXml, LAKE_RELATION_ID);
if (lakeRelation.tags.name !== 'Østensjøvannet' || lakeRelation.tags.natural !== 'water' || lakeRelation.tags.water !== 'lake') throw new Error(`Uventede lake-tags: ${JSON.stringify(lakeRelation.tags)}`);
const lakeWays = parseWays(lakeXml);
const lakeMemberWayIds = new Set(lakeRelation.members.filter((member) => member.type === 'way').map((member) => member.ref));
const memberWaysContainingMouth = lakeWays.filter((way) => lakeMemberWayIds.has(way.id) && way.nodeRefs.includes(MOUTH_NODE_ID));

const connectedWays = parseWays(nodeWaysXml).filter((way) => way.id !== STREAM_WAY_ID);
const connectedSummary = connectedWays.map((way) => ({ id: way.id, tags: way.tags, isLakeRelationMember: lakeMemberWayIds.has(way.id), containsMouthNode: way.nodeRefs.includes(MOUTH_NODE_ID) }));

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'ostensjovannet_sor',
  proposedResolvedIdentity: 'Bølerbekkens utløp i Østensjøvannet',
  streamWay: { id: STREAM_WAY_ID, tags: streamWay.tags, endpointNodeIds: [streamWay.nodeRefs[0], streamWay.nodeRefs.at(-1)] },
  mouthNode,
  lakeRelation: { id: LAKE_RELATION_ID, tags: lakeRelation.tags, memberWayCount: lakeMemberWayIds.size },
  memberWaysContainingMouth: memberWaysContainingMouth.map((way) => ({ id: way.id, tags: way.tags, role: lakeRelation.members.find((member) => member.type === 'way' && member.ref === way.id)?.role || '' })),
  connectedWays: connectedSummary,
  explicitSharedLakeBoundaryNode: memberWaysContainingMouth.length > 0,
  nextAction: memberWaysContainingMouth.length > 0
    ? 'Production may use the exact shared stream/lake-boundary node as a hydrological mouth anchor.'
    : 'Do not promote the mouth yet; the stream endpoint is not explicitly shared with an Østensjøvannet relation member way.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'mouth-topology.json'), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources-topology.md'), `# Batch 153 topology follow-up\n\n- Fresh OSM way ${STREAM_WAY_ID} is validated as Bølerbekken waterway=stream.\n- Fresh OSM relation ${LAKE_RELATION_ID} is validated as Østensjøvannet natural=water/water=lake.\n- Node ${MOUTH_NODE_ID} is tested directly against the lake relation's member ways and all ways connected to the node.\n- No nearest/first-hit or legacy coordinate is used.\n`);
console.log(JSON.stringify({ status: 'topology_complete', mouthNode, sharedLakeBoundaryWayCount: memberWaysContainingMouth.length, report: path.relative(ROOT, path.join(REPORT_DIR, 'mouth-topology.json')) }, null, 2));
