#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourceCommit = '3238e2bdce1331bbb39d3a6b52e5617e40d878bd';
const scriptPath = 'scripts/coordinate-branch-job.mjs';
let source = execFileSync('git', ['show', `${sourceCommit}:${scriptPath}`], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});

const replacement = `function parseWayXml(xml, expectedWayId) {
  const parseAttrs = (text) => Object.fromEntries(
    [...text.matchAll(/([:\\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]])
  );
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\\b([^>]*)\\/?\\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.id && attrs.lat !== undefined && attrs.lon !== undefined) {
      nodeMap.set(attrs.id, { id: attrs.id, lat: Number(attrs.lat), lon: Number(attrs.lon) });
    }
  }
  const wayMatch = [...xml.matchAll(/<way\\b([^>]*)>([\\s\\S]*?)<\\/way>/g)]
    .find((match) => parseAttrs(match[1]).id === String(expectedWayId));
  if (!wayMatch) throw new Error(\`Could not find way \${expectedWayId} in fresh OSM XML\`);
  const body = wayMatch[2];
  const refs = [...body.matchAll(/<nd\\b([^>]*)\\/?\\s*>/g)]
    .map((match) => parseAttrs(match[1]).ref)
    .filter(Boolean);
  const tags = Object.fromEntries(
    [...body.matchAll(/<tag\\b([^>]*)\\/?\\s*>/g)]
      .map((match) => parseAttrs(match[1]))
      .filter((attrs) => attrs.k !== undefined)
      .map((attrs) => [attrs.k, attrs.v || ''])
  );
  const coordinates = refs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (coordinates.length !== refs.length || coordinates.length < 2) {
    throw new Error(\`Incomplete geometry for way \${expectedWayId}: \${coordinates.length}/\${refs.length} nodes resolved\`);
  }
  const center = {
    lat: coordinates.reduce((sum, point) => sum + point.lat, 0) / coordinates.length,
    lon: coordinates.reduce((sum, point) => sum + point.lon, 0) / coordinates.length,
  };
  return { id: expectedWayId, refs, tags, coordinates, center };
}

function haversine`;

const patched = source.replace(/function parseWayXml[\s\S]*?\n}\n\nfunction haversine/, replacement);
if (patched === source) throw new Error('Could not patch parseWayXml in validated batch 164 production script');

const tempScript = path.join('/tmp', `history-go-batch-164-production-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, patched);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
