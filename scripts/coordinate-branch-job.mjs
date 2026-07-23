#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/8a318548dd5df1fe963775103640d632771ed698/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch validated Båntjern retirement script: ${response.status} ${response.statusText}`);
let source = await response.text();
source = source
  .replace('const batch = 166;', 'const batch = 167;')
  .replaceAll('batch-166-bantjern-private-proxy-retirement', 'batch-167-bantjern-private-proxy-retirement');
if (!source.includes('const batch = 167;')) throw new Error('Could not renumber validated retirement script to batch 167');
const tempScript = path.join('/tmp', `history-go-batch-167-retirement-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
