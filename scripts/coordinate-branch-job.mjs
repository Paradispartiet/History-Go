#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourceCommit = 'dcb7a6e3205e0879ad0e7c1e51fe529d76e5c2bc';
const source = execFileSync('git', ['show', `${sourceCommit}:scripts/coordinate-branch-job.mjs`], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});
const tempScript = path.join('/tmp', `history-go-batch-164-exact-main-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
