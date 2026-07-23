#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourceCommit = 'cf0eaa441671edaafef4de5968cc48a50117d41d';
const scriptPath = 'scripts/coordinate-branch-job.mjs';
const source = execFileSync('git', ['show', `${sourceCommit}:${scriptPath}`], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});

const tempScript = path.join('/tmp', `history-go-batch-166-lille-wembley-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
