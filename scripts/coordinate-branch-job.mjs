import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-156-alna-outlets-research');
const TUNNEL_WAY_ID = 130106085;
const HISTORIC_VIEWBOX = '10.748,59.910,10.775,59.899';
const CURRENT_VIEWBOX = '10.746,59.901,10.770,59.888';
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

async function nominatim(query, viewbox) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${viewbox}&bounded=1`;
  return { query, url, results: await fetchJson(url) };
}

const waterMirrorQueries = await Promise.all([
  nominatim('Vannspeilet, Middelalderparken, Oslo, Norway', HISTORIC_VIEWBOX),
  nominatim('Vannspeilet, Oslo, Norway', HISTORIC_VIEWBOX),
]);
waterMirrorQueries.forEach((result, index) => fs.writeFileSync(path.join(REPORT_DIR, `nominatim-vannspeilet-${index + 1}.json`), `${JSON.stringify(result, null, 2)}\n`));
const mirrorMap = new Map();
for (const query of waterMirrorQueries) {
  for (const result of query.results) {
    const key = `${result.osm_type}:${result.osm_id}`;
    if (!mirrorMap.has(key)) mirrorMap.set(key, { ...result, matchedQueries: [] });
    mirrorMap.get(key).matchedQueries.push(query.query);
  }
}
const mirrorCandidates = [...mirrorMap.values()].map((result) => ({
  osmType: result.osm_type,
  osmId: result.osm_id,
  name: result.name || result.namedetails?.name || null,
  category: result.category,
  type: result.type,
  displayName: result.display_name,
  lat: result.lat ? Number(result.lat) : null,
  lon: result.lon ? Number(result.lon) : null,
  boundingbox: result.boundingbox,
  geojson: result.geojson,
  matchedQueries: result.matchedQueries,
}));
const exactWaterMirrors = mirrorCandidates.filter((candidate) => normalize(candidate.name) === 'vannspeilet');

const kongshavnQueries = await Promise.all([
  nominatim('Kongshavn, Oslo, Norway', CURRENT_VIEWBOX),
  nominatim('Alna, Kongshavn, Oslo, Norway', CURRENT_VIEWBOX),
]);
kongshavnQueries.forEach((result, index) => fs.writeFileSync(path.join(REPORT_DIR, `nominatim-kongshavn-${index + 1}.json`), `${JSON.stringify(result, null, 2)}\n`));

const tunnelUrl = `https://api.openstreetmap.org/api/0.6/way/${TUNNEL_WAY_ID}/full`;
const tunnelXml = await fetchText(tunnelUrl);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${TUNNEL_WAY_ID}-full.xml`), tunnelXml);
const tunnel = parseWayFull(tunnelXml, TUNNEL_WAY_ID);
if (tunnel.tags.name !== 'Alna' || tunnel.tags.tunnel !== 'yes' || tunnel.tags.waterway !== 'river') {
  throw new Error(`Uventede tunnel-tags: ${JSON.stringify(tunnel.tags)}`);
}

const endpoints = [
  { role: 'first', nodeId: tunnel.nodeRefs[0], point: tunnel.points[0] },
  { role: 'last', nodeId: tunnel.nodeRefs.at(-1), point: tunnel.points.at(-1) },
];
const endpointTopology = [];
for (const endpoint of endpoints) {
  const nodeWaysUrl = `https://api.openstreetmap.org/api/0.6/node/${endpoint.nodeId}/ways`;
  const xml = await fetchText(nodeWaysUrl);
  fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${endpoint.nodeId}-ways.xml`), xml);
  const connectedWays = parseWays(xml).filter((way) => way.id !== TUNNEL_WAY_ID);
  endpointTopology.push({
    ...endpoint,
    connectedWays: connectedWays.map((way) => ({ id: way.id, tags: way.tags })),
    coastlineWays: connectedWays.filter((way) => way.tags.natural === 'coastline').map((way) => ({ id: way.id, tags: way.tags })),
    waterwayWays: connectedWays.filter((way) => Boolean(way.tags.waterway)).map((way) => ({ id: way.id, tags: way.tags })),
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'alna_utlop_bjorvika',
  currentIdentity: 'Alnas historiske utløpslandskap ved Sørenga/Middelalderparken, adskilt fra dagens tunnelutløp ved Kongshavn',
  officialSourceModel: {
    historical: 'Oslo kommune states that Vannspeilet in Middelalderparken marks Alnaelvas original outlet.',
    current: 'Oslo municipal environmental status and Oslo byleksikon identify the current outlet at Kongshavn; Oslo byleksikon dates the tunnel diversion to 1922.',
  },
  exactWaterMirrorCount: exactWaterMirrors.length,
  exactWaterMirrors,
  allWaterMirrorCandidates: mirrorCandidates,
  tunnelWay: {
    osmId: tunnel.id,
    tags: tunnel.tags,
    firstNode: endpoints[0],
    lastNode: endpoints[1],
  },
  endpointTopology,
  kongshavnSearches: kongshavnQueries.map((query) => ({
    query: query.query,
    candidates: query.results.map((result) => ({ osmType: result.osm_type, osmId: result.osm_id, name: result.name || result.namedetails?.name || null, category: result.category, type: result.type, lat: result.lat ? Number(result.lat) : null, lon: result.lon ? Number(result.lon) : null, displayName: result.display_name })),
  })),
  unresolvedHistoricalPoint: 'The official municipal source identifies Vannspeilet as a marker of the original outlet but does not provide a separate exact historical mouth point. Do not invent one.',
  nextAction: 'If one exact Vannspeilet geometry and one explicit current tunnel/coastline mouth topology are resolved, evaluate a two-anchor temporal model. Keep the original historical mouth as a semantic role of the water-mirror marker unless an independent exact historical point source is found.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 156 research sources\n\n- Oslo kommune, Middelalderparken: Vannspeilet marks Alnaelvas original outlet.\n- Oslo kommune environmental status: current Alna outlet is at Kongshavn.\n- Oslo byleksikon: Alna originally flowed to Sørenga and has run in tunnel to Kongshavn since 1922.\n- Fresh bounded OSM/Nominatim audit for Vannspeilet geometry.\n- Fresh OSM tunnel endpoint topology audit for way 130106085.\n\nNo separate historical mouth point is invented. The legacy History Go coordinate is not used for selection.\n`);

console.log(JSON.stringify({
  status: 'research_complete',
  exactWaterMirrorCount: exactWaterMirrors.length,
  tunnelEndpointCount: endpointTopology.length,
  coastlineEndpointCount: endpointTopology.filter((endpoint) => endpoint.coastlineWays.length > 0).length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')),
}, null, 2));
