import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const original = execFileSync(
  'git',
  ['show', 'HEAD^:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);
const broken = 'const cards = JSON.parse(fs.readFileSync(`data/natur/fauna/marine_akrafjorden_batch_\\${batch}.json`, "utf8"));';
const fixed = 'const cards = JSON.parse(fs.readFileSync("data/natur/fauna/marine_akrafjorden_batch_" + batch + ".json", "utf8"));';
if (!original.includes(broken)) throw new Error('Could not locate broken nested template literal in batch 11 finalizer');
const patched = original.replace(broken, fixed);
const tempPath = '/tmp/history-go-akrafjorden-batch11-fixed.mjs';
fs.writeFileSync(tempPath, patched);
await import(`${pathToFileURL(tempPath).href}?v=${Date.now()}`);
