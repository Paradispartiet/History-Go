#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
// HEAD~2 is the full batch-133 implementation. Apply the URLSearchParams typo fix,
// then instrument only the evidence audit so its exact failing row is visible.
let implementation = execFileSync('git', ['show', 'HEAD~2:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const paramFrom = "  nummer,\n  kommunenummer: municipality,";
const paramTo = "  nummer: number,\n  kommunenummer: municipality,";
if (!implementation.includes(paramFrom)) throw new Error('Fant ikke Club 7 URLSearchParams-feilen');
implementation = implementation.replace(paramFrom, paramTo);

const gateFrom = "execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });";
const gateTo = `try {
  execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });
} catch (error) {
  const report = path.join(root, 'reports/coordinate-evidence-audit.md');
  if (fs.existsSync(report)) console.error('\\n--- coordinate evidence diagnostic ---\\n' + fs.readFileSync(report, 'utf8'));
  throw error;
}`;
if (!implementation.includes(gateFrom)) throw new Error('Fant ikke evidence-gaten');
implementation = implementation.replace(gateFrom, gateTo);

const tmp = path.join(root, 'scripts/.coordinate-batch-133-diagnostic.tmp.mjs');
fs.writeFileSync(tmp, implementation);
try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
