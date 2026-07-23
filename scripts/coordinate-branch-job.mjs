#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-165-nydalsdammen-outflow-research');
fs.mkdirSync(reportDir, { recursive: true });

const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';
async function fetchText(url, attempts = 3, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*', ...(options.headers || {}) },
        method: options.method || 'GET',
        body: options.body,
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1800 * attempt));
    }
  }
  throw lastError;
}
async function fetchJson(url, attempts = 3, options = {}) {
  return JSON.parse(await fetchText(url, attempts, options));
}

function parseRelationFull(xml, relationId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\s+[^>]*id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*\/?\s*>/g)) {
    nodeMap.set(match[1], { id: match[1], lat: Number(match[2]), lon: Number(match[3]) });
  }
  const wayMap = new Map();
  for (const match of xml.matchAll(/<way\s+[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
    const refs = [...match[2].matchAll(/<nd\s+ref="(\d+)"\s*\/>/g)].map((m) => m[1]);
    const tags = Object.fromEntries([...match[2].matchAll(/<tag\s+k="([^"]+)"\s+v="([^"]*)"\s*\/>/g)].map((m) => [m[1], m[2]]));
    wayMap.set(match[1], { id: match[1], refs, tags });
  }
  const relationMatch = xml.match(new RegExp(`<relation\\s+[^>]*id="${relationId}"[^>]*>([\\s\\S]*?)<\\/relation>`));
  if (!relationMatch) throw new Error(`Relation ${relationId} not found`);
  const members = [...relationMatch[1].matchAll(/<member\s+type="way"\s+ref="(\d+)"\s+role="([^"]*)"\s*\/>/g)]
    .map((m) => ({ wayId: m[1], role: m[2] }));
  const boundaryNodeIds = new Set();
  for (const member of members) {
    const way = wayMap.get(member.wayId);
    for (const ref of way?.refs || []) boundaryNodeIds.add(ref);
  }
  return { nodeMap, wayMap, members, boundaryNodeIds };
}

function haversine(a, b) {
  const R = 6371000;
  const rad = (degree) => degree * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLength(geometry = []) {
  let total = 0;
  for (let i = 1; i < geometry.length; i += 1) total += haversine(geometry[i - 1], geometry[i]);
  return total;
}

const reservoirRelationId = 14637129;
const relationUrl = `https://api.openstreetmap.org/api/0.6/relation/${reservoirRelationId}/full`;
const relationXml = await fetchText(relationUrl);
fs.writeFileSync(path.join(reportDir, `osm-relation-${reservoirRelationId}-full.xml`), relationXml);
const reservoir = parseRelationFull(relationXml, reservoirRelationId);

const bbox = '59.951,10.758,59.961,10.773';
const overpassQuery = `[out:json][timeout:45];\n(\n  way["name"="Akerselva"]["waterway"~"river|stream"](${bbox});\n  way["waterway"~"dam|weir"](${bbox});\n  way["bridge"](${bbox});\n  way["man_made"="bridge"](${bbox});\n  nwr["name"~"Nydalsdammen|Nydalsfossen|Akerselva",i](${bbox});\n);\nout body geom;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let data;
let usedEndpoint;
let lastError;
for (const endpoint of endpoints) {
  try {
    const body = new URLSearchParams({ data: overpassQuery }).toString();
    data = await fetchJson(endpoint, 2, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    usedEndpoint = endpoint;
    break;
  } catch (error) {
    lastError = String(error?.message || error);
  }
}
if (!data) throw new Error(`Overpass failed: ${lastError}`);

const ways = (data.elements || []).filter((e) => e.type === 'way');
const exactRiverWays = ways.filter((e) => e.tags?.name === 'Akerselva' && ['river', 'stream'].includes(e.tags?.waterway));
const damsAndWeirs = ways.filter((e) => ['dam', 'weir'].includes(e.tags?.waterway));
const bridges = ways.filter((e) => e.tags?.bridge || e.tags?.man_made === 'bridge');

const riverSummaries = exactRiverWays.map((river) => {
  const nodeIds = (river.nodes || []).map(String);
  const sharedReservoirNodeIds = nodeIds.filter((nodeId) => reservoir.boundaryNodeIds.has(nodeId));
  const geometry = river.geometry || [];
  return {
    osmWayId: river.id,
    tags: river.tags || {},
    nodeIds,
    startNodeId: nodeIds[0] || null,
    endNodeId: nodeIds.at(-1) || null,
    sharedReservoirNodeIds,
    geometry,
    lengthM: Number(lineLength(geometry).toFixed(1)),
    start: geometry[0] || null,
    end: geometry.at(-1) || null,
  };
});

const directReservoirOutflows = riverSummaries.filter((river) => river.sharedReservoirNodeIds.length > 0);
const riverNodeSet = new Set(riverSummaries.flatMap((river) => river.nodeIds));
const structureSummaries = [...damsAndWeirs, ...bridges].map((way) => {
  const nodeIds = (way.nodes || []).map(String);
  return {
    osmWayId: way.id,
    tags: way.tags || {},
    nodeIds,
    sharedReservoirNodeIds: nodeIds.filter((nodeId) => reservoir.boundaryNodeIds.has(nodeId)),
    sharedRiverNodeIds: nodeIds.filter((nodeId) => riverNodeSet.has(nodeId)),
    geometry: way.geometry || [],
  };
});

for (const river of riverSummaries) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${river.osmWayId}/full`;
  try {
    fs.writeFileSync(path.join(reportDir, `osm-way-${river.osmWayId}-full.xml`), await fetchText(url));
  } catch (error) {
    fs.writeFileSync(path.join(reportDir, `osm-way-${river.osmWayId}-fetch-error.txt`), `${String(error?.message || error)}\n`);
  }
}

const shortDirectOutflows = directReservoirOutflows.filter((river) => river.lengthM > 0 && river.lengthM <= 500);
const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'stilla_nydalen',
  canonicalIdentity: 'Elvepartiet nedenfor Nydalsdammen',
  legacyNameWarning: 'The stable technical ID still contains Stilla, but the canonical display identity explicitly does not represent the historical Stilla bathing pools farther north.',
  reservoir: {
    osmRelationId: reservoirRelationId,
    sourceObjectId: `osm-relation:${reservoirRelationId}`,
    memberWayCount: reservoir.members.length,
    boundaryNodeCount: reservoir.boundaryNodeIds.size,
  },
  overpassEndpoint: usedEndpoint,
  counts: {
    exactAkerselvaWays: riverSummaries.length,
    directReservoirOutflows: directReservoirOutflows.length,
    shortDirectReservoirOutflows: shortDirectOutflows.length,
    damsAndWeirs: damsAndWeirs.length,
    bridges: bridges.length,
  },
  exactAkerselvaWays: riverSummaries,
  directReservoirOutflows,
  structures: structureSummaries,
  decision: {
    productionReadyAsWholeWay: shortDirectOutflows.length === 1,
    selectedWholeWay: shortDirectOutflows.length === 1 ? shortDirectOutflows[0] : null,
    selectionRule: 'A production whole-way anchor is allowed only if exactly one exact name=Akerselva waterway shares a node with the verified Nydalsdammen relation boundary and that directly connected way is a local segment no longer than 500 m.',
    nextAction: shortDirectOutflows.length === 1
      ? 'Use the unique directly connected local Akerselva way and compute its deterministic line midpoint.'
      : directReservoirOutflows.length === 1
        ? 'The direct outlet way is unique but too broad for a local whole-way proxy; identify a physical downstream bracket before production.'
        : 'Resolve outlet topology further; do not select by nearest distance or the old legacy point.',
  },
};

fs.writeFileSync(path.join(reportDir, 'topology-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-query.txt'), `${overpassQuery}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-response.json'), `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 165 research sources\n\n- Canonical verified Nydalsdammen geometry: OSM relation ${reservoirRelationId}.\n- Fresh OSM relation/full and bounded Overpass topology are stored in this directory.\n- Historical Stilla is intentionally excluded from the coordinate-selection rule because the canonical record has already been corrected to the elveparti below Nydalsdammen.\n`);

console.log(JSON.stringify({
  batch: 165,
  counts: summary.counts,
  productionReadyAsWholeWay: summary.decision.productionReadyAsWholeWay,
  selectedWayId: summary.decision.selectedWholeWay?.osmWayId || null,
  nextAction: summary.decision.nextAction,
}, null, 2));
