#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const original = execFileSync(
  'git',
  ['show', 'HEAD^:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);

const broadGate = "if (protocol.includes('| 168 |')) fail('protocol already contains batch 168');";
const scopedGate = "if (protocol.includes('| 168 | `lillomarka` |')) fail('protocol already contains the Lillomarka batch 168 row');";

if (!original.includes(broadGate)) {
  throw new Error('Expected original batch-168 protocol gate was not found in parent runner');
}

const patched = original.replace(broadGate, scopedGate);
const temporaryRunner = 'scripts/.coordinate-branch-job-batch-168-fixed.mjs';
fs.writeFileSync(temporaryRunner, patched);

try {
  await import(pathToFileURL(`${process.cwd()}/${temporaryRunner}`).href);
} finally {
  fs.rmSync(temporaryRunner, { force: true });
}
