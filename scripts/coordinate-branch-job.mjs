#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const source = execFileSync('git', ['show', 'HEAD~2:scripts/coordinate-branch-job.mjs'], { encoding: 'utf8' });
const parserPattern = /function parseOsmXml\(xml\) \{[\s\S]*?return \{ nodes, ways \};\n\}/;
if (!parserPattern.test(source)) throw new Error('Fant ikke parseOsmXml i opprinnelig batch-163-produksjonsscript');

const replacement = String.raw`function parseOsmXml(xml) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.id || attrs.lat == null || attrs.lon == null) continue;
    nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon), tags: {} });
  }
  const taggedNodeXml = xml.replace(/<node\b[^>]*\/\s*>/g, '');
  for (const match of taggedNodeXml.matchAll(/<node\b([^>]*)>([\s\S]*?)<\/node>/g)) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.id || attrs.lat == null || attrs.lon == null) continue;
    const tags = {};
    for (const tag of match[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
      const tagAttrs = parseAttrs(tag[1]);
      if (tagAttrs.k != null) tags[tagAttrs.k] = tagAttrs.v ?? '';
    }
    nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon), tags });
  }
  const ways = new Map();
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const attrs = parseAttrs(match[1]);
    const body = match[2];
    const id = Number(attrs.id);
    const nodeIds = [...body.matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((nd) => Number(parseAttrs(nd[1]).ref));
    const tags = {};
    for (const tag of body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
      const tagAttrs = parseAttrs(tag[1]);
      if (tagAttrs.k != null) tags[tagAttrs.k] = tagAttrs.v ?? '';
    }
    ways.set(id, { id, nodeIds, tags });
  }
  return { nodes, ways };
}`;

const patched = source.replace(parserPattern, replacement);
const tempFile = path.join(os.tmpdir(), `history-go-batch-163-fixed-${process.pid}.mjs`);
fs.writeFileSync(tempFile, patched);
await import(`${pathToFileURL(tempFile).href}?v=${Date.now()}`);
