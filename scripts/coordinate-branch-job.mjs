#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/52b72ec490ababf377e8d090885b0696212e33de/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch validated batch-176 replay runner: ${response.status} ${response.statusText}`);
const source = await response.text();
const tempScript = path.join('/tmp', `history-go-batch-176-fresh-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

console.log(JSON.stringify({ replayedBatch: 176, sourceCommit: '52b72ec490ababf377e8d090885b0696212e33de' }, null, 2));
