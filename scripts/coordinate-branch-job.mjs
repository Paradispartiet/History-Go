#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourceCommit = '3fb626aae15f2a47d3f5ceb2938f080ead6528a7';
const scriptPath = 'scripts/coordinate-branch-job.mjs';
const source = execFileSync('git', ['show', `${sourceCommit}:${scriptPath}`], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});

const replacement = `function parseRelationFull(xml, relationId) {
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
  const wayMap = new Map();
  for (const match of xml.matchAll(/<way\\b([^>]*)>([\\s\\S]*?)<\\/way>/g)) {
    const wayAttrs = parseAttrs(match[1]);
    if (!wayAttrs.id) continue;
    const refs = [...match[2].matchAll(/<nd\\b([^>]*)\\/?\\s*>/g)]
      .map((entry) => parseAttrs(entry[1]).ref)
      .filter(Boolean);
    const tags = Object.fromEntries(
      [...match[2].matchAll(/<tag\\b([^>]*)\\/?\\s*>/g)]
        .map((entry) => parseAttrs(entry[1]))
        .filter((attrs) => attrs.k !== undefined)
        .map((attrs) => [attrs.k, attrs.v || ''])
    );
    wayMap.set(wayAttrs.id, { id: wayAttrs.id, refs, tags });
  }
  const relationMatch = [...xml.matchAll(/<relation\\b([^>]*)>([\\s\\S]*?)<\\/relation>/g)]
    .find((match) => parseAttrs(match[1]).id === String(relationId));
  if (!relationMatch) throw new Error(\`Relation \${relationId} not found\`);
  const members = [...relationMatch[2].matchAll(/<member\\b([^>]*)\\/?\\s*>/g)]
    .map((entry) => parseAttrs(entry[1]))
    .filter((attrs) => attrs.type === 'way' && attrs.ref)
    .map((attrs) => ({ wayId: attrs.ref, role: attrs.role || '' }));
  const boundaryNodeIds = new Set();
  for (const member of members) {
    const way = wayMap.get(member.wayId);
    for (const ref of way?.refs || []) boundaryNodeIds.add(ref);
  }
  return { nodeMap, wayMap, members, boundaryNodeIds };
}

function haversine`;

const patched = source.replace(/function parseRelationFull[\s\S]*?\n}\n\nfunction haversine/, replacement);
if (patched === source) throw new Error('Could not patch parseRelationFull for batch 165 research');

const tempScript = path.join('/tmp', `history-go-batch-165-research-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, patched);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
