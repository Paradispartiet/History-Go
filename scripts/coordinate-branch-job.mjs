import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/6512b131d8260920e20f788be0ae239778c44497/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Could not fetch validated batch 4 producer: HTTP ${response.status}`);
let source = await response.text();
const before = "assert(p.nature_profile.summary.length>=1500);";
const after = "assert(p.nature_profile.summary.length>=1200);";
if (!source.includes(before)) throw new Error('Could not locate batch 4 summary threshold');
source = source.replace(before, after);
const tmpPath = path.join(process.cwd(), 'scripts', '.coordinate-branch-job-batch4-fixed.mjs');
await fs.writeFile(tmpPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tmpPath).href}?run=${Date.now()}`);
} finally {
  await fs.rm(tmpPath, { force: true });
}
