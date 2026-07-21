#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
let implementation = execFileSync('git', ['show', 'HEAD~1:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const from = "  nummer,\n  kommunenummer: municipality,";
const to = "  nummer: number,\n  kommunenummer: municipality,";
if (!implementation.includes(from)) throw new Error('Fant ikke Club 7 URLSearchParams-feilen som skulle rettes');
implementation = implementation.replace(from, to);

const tmp = path.join(root, 'scripts/.coordinate-batch-133-production.tmp.mjs');
fs.writeFileSync(tmp, implementation);
try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
