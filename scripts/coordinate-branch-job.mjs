#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
// HEAD~2 is the full batch-130 implementation; HEAD~1 only added evidence diagnostics.
let implementation = execFileSync('git', ['show', 'HEAD~2:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const from = "geocodeAccuracy: 'exact_point',";
const to = "geocodeAccuracy: 'geometric_center',";
if (!implementation.includes(from)) throw new Error('Fant ikke Stovnertårnet geocodeAccuracy som skulle normaliseres');
implementation = implementation.replace(from, to);

const tmp = path.join(root, 'scripts/.coordinate-batch-130-production.tmp.mjs');
fs.writeFileSync(tmp, implementation);
try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
