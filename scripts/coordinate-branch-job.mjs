#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/3e902fee4a39362ccb579298b356eef47c9f5c37/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch validated final salamander runner: ${response.status} ${response.statusText}`);
const source = await response.text();
const tempScript = path.join('/tmp', `history-go-batches-168-169-final-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
