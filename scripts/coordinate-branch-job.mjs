import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '76af6605773ce98b49319ec3c0aa15014ba2f507';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/oslo-coordinate-control-batch-97-gamle-kjemi.mjs';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const protocol = fs.readFileSync(PROTOCOL, 'utf8');
if (/^\| 97 \|/m.test(protocol)) throw new Error('Batch 97 is already in use in the Oslo coordinate protocol');

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
source = source
  .replaceAll('reports/oslo-coordinate-control-batch-96', 'reports/oslo-coordinate-control-batch-97')
  .replaceAll('Batch 96', 'Batch 97')
  .replaceAll('batch: 96', 'batch: 97')
  .replaceAll('| 96 |', '| 97 |');
if (source.includes('Batch 96') || source.includes('batch: 96') || source.includes('| 96 |')) {
  throw new Error('Could not fully renumber the validated chemistry-building job to batch 97');
}
fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);
