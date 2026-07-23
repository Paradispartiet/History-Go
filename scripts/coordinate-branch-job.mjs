#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-163-voyenfallene-research');
fs.mkdirSync(reportDir, { recursive: true });

const nodeIds = [
  7876345837,
  5169532601,
  5169533164,
  10820084634,
  7876345836,
  5169533163,
  10820084635,
];

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function parseNode(xml, expectedId) {
  const opening = xml.match(new RegExp(`<node\\b([^>]*)`));
  if (!opening) throw new Error(`Missing node ${expectedId}`);
  const attrs = parseAttrs(opening[1]);
  if (Number(attrs.id) !== expectedId) throw new Error(`Unexpected node id ${attrs.id}`);
  const tags = {};
  for (const match of xml.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
    const tagAttrs = parseAttrs(match[1]);
    if (tagAttrs.k != null) tags[tagAttrs.k] = tagAttrs.v ?? '';
  }
  return { id: expectedId, lat: Number(attrs.lat), lon: Number(attrs.lon), tags };
}

function parseWays(xml) {
  const rows = [];
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const attrs = parseAttrs(match[1]);
    const tags = {};
    for (const tag of match[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
      const tagAttrs = parseAttrs(tag[1]);
      if (tagAttrs.k != null) tags[tagAttrs.k] = tagAttrs.v ?? '';
    }
    rows.push({ id: Number(attrs.id), tags });
  }
  return rows;
}

async function fetchXml(pathname, filename) {
  const url = `https://api.openstreetmap.org/api/0.6/${pathname}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/xml', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
      if (!response.ok) lastError = new Error(`${pathname}: HTTP ${response.status}`);
      else {
        const xml = await response.text();
        fs.writeFileSync(path.join(reportDir, filename), xml);
        return xml;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
  throw lastError || new Error(`OSM lookup failed: ${pathname}`);
}

const rows = [];
for (const nodeId of nodeIds) {
  const [nodeXml, waysXml] = await Promise.all([
    fetchXml(`node/${nodeId}`, `osm-node-${nodeId}-audit.xml`),
    fetchXml(`node/${nodeId}/ways`, `osm-node-${nodeId}-ways.xml`),
  ]);
  const node = parseNode(nodeXml, nodeId);
  const parentWays = parseWays(waysXml);
  rows.push({
    nodeId,
    lat: node.lat,
    lon: node.lon,
    tags: node.tags,
    parentWays: parentWays.map((way) => ({
      id: way.id,
      name: way.tags.name || null,
      waterway: way.tags.waterway || null,
      natural: way.tags.natural || null,
      tunnel: way.tags.tunnel || null,
      covered: way.tags.covered || null,
      layer: way.tags.layer || null,
      tags: way.tags,
    })),
  });
}

const mainWayNodes = rows.filter((row) => row.parentWays.some((way) => way.id === 80915045));
const sideWayNodes = rows.filter((row) => !row.parentWays.some((way) => way.id === 80915045));

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'voienfossen',
  nodeCount: rows.length,
  rows,
  mainAkerselvaWayId: 80915045,
  mainWayNodes: mainWayNodes.map((row) => row.nodeId),
  sideWayNodes: sideWayNodes.map((row) => row.nodeId),
  interpretationRule: 'OSM waterfall-node count is a physical mapping detail and must not be equated one-to-one with the three historically documented Vøyenfallene without source-backed grouping. Production must preserve the historical three-fall identity while representing all relevant physical waterfall nodes and their parent waterway topology.',
};

fs.writeFileSync(path.join(reportDir, 'waterfall-node-parent-audit.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({
  mainWayNodes: summary.mainWayNodes,
  sideWayNodes: summary.sideWayNodes,
  rows: rows.map((row) => ({
    nodeId: row.nodeId,
    lat: row.lat,
    lon: row.lon,
    waterway: row.tags.waterway || null,
    parents: row.parentWays.map((way) => ({ id: way.id, name: way.name, waterway: way.waterway, tunnel: way.tunnel, covered: way.covered })),
  })),
}, null, 2));
