#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATE = '2026-07-23';
const reportDir = 'reports/oslo-coordinate-ring3-route-mainline-research-post-176';
const bbox = '59.84,10.45,60.08,11.02';
const overpassUrl = 'https://overpass-api.de/api/interpreter';
const abs = (file) => path.join(root, file);

const protocol = fs.readFileSync(abs('docs/coordinates/coordinate-control-protocol.md'), 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])).filter(Number.isFinite));
if (maxBatch !== 176) throw new Error(`Expected coordinate max batch 176, got ${maxBatch}. Rebase before Ring 3 mainline research.`);

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...init,
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0',
      Accept: 'application/json',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(120000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

async function overpass(query) {
  return fetchJson(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }),
  });
}

function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function geometryLengthM(geometry = []) {
  let total = 0;
  for (let i = 1; i < geometry.length; i += 1) total += haversineMeters(geometry[i - 1], geometry[i]);
  return total;
}

const query = `[out:json][timeout:90];
(
  way["highway"="trunk"]["ref"~"Ring 3",i](${bbox});
  way["highway"="motorway"]["ref"~"Ring 3",i](${bbox});
);
out body geom;`;
const data = await overpass(query);
const ways = (data.elements || []).filter((element) => element.type === 'way');
if (!ways.length) throw new Error('No explicit Ring 3 trunk/motorway mainline ways found');

const rows = ways.map((way) => ({
  osmWayId: Number(way.id),
  sourceObjectId: `osm-way:${way.id}`,
  ref: way.tags?.ref ?? null,
  name: way.tags?.name ?? null,
  highway: way.tags?.highway ?? null,
  oneway: way.tags?.oneway ?? null,
  tunnel: way.tags?.tunnel ?? null,
  bridge: way.tags?.bridge ?? null,
  lanes: way.tags?.lanes ?? null,
  nodeIds: (way.nodes || []).map(String),
  startNodeId: way.nodes?.length ? String(way.nodes[0]) : null,
  endNodeId: way.nodes?.length ? String(way.nodes[way.nodes.length - 1]) : null,
  geometry: way.geometry || [],
  lengthM: Math.round(geometryLengthM(way.geometry || []) * 10) / 10,
}));

const endpointToWays = new Map();
for (const row of rows) {
  for (const nodeId of [row.startNodeId, row.endNodeId].filter(Boolean)) {
    if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
    endpointToWays.get(nodeId).push(row.osmWayId);
  }
}
const adjacency = new Map(rows.map((row) => [row.osmWayId, new Set()]));
for (const ids of endpointToWays.values()) {
  for (const a of ids) for (const b of ids) if (a !== b) adjacency.get(a)?.add(b);
}

const seen = new Set();
const components = [];
for (const row of rows) {
  if (seen.has(row.osmWayId)) continue;
  const stack = [row.osmWayId];
  const ids = [];
  seen.add(row.osmWayId);
  while (stack.length) {
    const id = stack.pop();
    ids.push(id);
    for (const next of adjacency.get(id) || []) {
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(next);
    }
  }
  const componentRows = ids.map((id) => rows.find((item) => item.osmWayId === id)).filter(Boolean);
  const degrees = new Map();
  for (const item of componentRows) {
    for (const nodeId of [item.startNodeId, item.endNodeId].filter(Boolean)) degrees.set(nodeId, (degrees.get(nodeId) || 0) + 1);
  }
  components.push({
    wayCount: componentRows.length,
    wayIds: ids.sort((a, b) => a - b),
    totalLengthM: Math.round(componentRows.reduce((sum, item) => sum + item.lengthM, 0) * 10) / 10,
    openEndpointNodeIds: [...degrees.entries()].filter(([, degree]) => degree === 1).map(([node]) => node),
    branchNodeIds: [...degrees.entries()].filter(([, degree]) => degree > 2).map(([node]) => node),
    refs: [...new Set(componentRows.map((item) => item.ref).filter(Boolean))].sort(),
    highways: [...new Set(componentRows.map((item) => item.highway).filter(Boolean))].sort(),
  });
}
components.sort((a, b) => b.totalLengthM - a.totalLengthM);

const majorComponents = components.filter((component) => component.totalLengthM >= 10000);
const minorComponents = components.filter((component) => component.totalLengthM < 10000);
const twoDirectionCandidate = majorComponents.length === 2
  && majorComponents.every((component) => component.branchNodeIds.length === 0 && component.openEndpointNodeIds.length === 2)
  && minorComponents.reduce((sum, component) => sum + component.totalLengthM, 0) < 2000;

const result = {
  version: DATE,
  placeId: 'ring_3',
  status: twoDirectionCandidate ? 'two_unbranched_ring3_mainline_carriageways_candidate' : 'ring3_mainline_still_topologically_ambiguous',
  bbox,
  query,
  wayCount: rows.length,
  totalLengthM: Math.round(rows.reduce((sum, row) => sum + row.lengthM, 0) * 10) / 10,
  components,
  majorComponents,
  minorComponents,
  twoDirectionCandidate,
  ways: rows,
  methodology: {
    include: ['highway=trunk or motorway', 'ref explicitly contains Ring 3'],
    exclude: ['trunk_link', 'motorway_link', 'ramps', 'ways carrying only ref=150 without explicit Ring 3 identity'],
    acceptance: 'exactly two >10 km unbranched endpoint-connected components, each with two open ends; minor residual total under 2 km',
  },
};

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/result.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/overpass-ring3-mainline.json`), `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/README.md`), `# Ring 3 explicit-mainline topology research\n\nStatus: **${result.status}**\n\nThis pass excludes link ramps and requires the OSM ref itself to contain Ring 3. It tests whether the divided road resolves into exactly two unbranched mainline carriageway components suitable for an explicit multi-segment route model.\n`);
console.log(JSON.stringify({ status: result.status, wayCount: rows.length, totalLengthM: result.totalLengthM, majorComponents: majorComponents.map((component) => ({ wayCount: component.wayCount, totalLengthM: component.totalLengthM, openEndpoints: component.openEndpointNodeIds.length, branches: component.branchNodeIds.length, refs: component.refs })), minorComponents: minorComponents.map((component) => ({ wayCount: component.wayCount, totalLengthM: component.totalLengthM, openEndpoints: component.openEndpointNodeIds.length, branches: component.branchNodeIds.length })), twoDirectionCandidate }, null, 2));
