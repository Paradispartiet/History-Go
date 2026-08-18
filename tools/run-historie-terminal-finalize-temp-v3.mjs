#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const generator = 'tools/materialize-historie-editorial-chapters.mjs';
const text = fs.readFileSync(generator, 'utf8');
const before = "  const distinctTheoryDefinition = theoryDefinition && theoryDefinition !== definition ? theoryDefinition : '';\n";
const after = "  const distinctTheoryDefinition = theoryDefinition && theoryDefinition !== definition\n    ? (theoryDefinition.startsWith(`${definition} `) ? theoryDefinition.slice(definition.length).trim() : theoryDefinition)\n    : '';\n";
assert.ok(text.includes(before), 'History generator theory-definition rule changed; refusing blind patch');
fs.writeFileSync(generator, text.replace(before, after));

const run = spawnSync('node', ['tools/run-historie-terminal-finalize-temp-v2.mjs'], {
  stdio: 'inherit',
  encoding: 'utf8'
});
if (run.error) throw run.error;
process.exit(run.status ?? 1);
