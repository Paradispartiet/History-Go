import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_URL = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/3e8edbf01b7b1b85ad4e2515cd303a8f762f567d/scripts/coordinate-branch-job.mjs';
const response = await fetch(SOURCE_URL, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Kunne ikke hente batch-146 production-template: ${response.status}`);

const source = await response.text();
const tempScript = path.join('/tmp', 'history-go-coordinate-batch-146-fresh-main.mjs');
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);
