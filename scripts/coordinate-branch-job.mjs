#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/8a318548dd5df1fe963775103640d632771ed698/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch validated batch 166 script: ${response.status} ${response.statusText}`);
const source = await response.text();
const tempScript = path.join('/tmp', `history-go-batch-166-replay-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
