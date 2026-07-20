import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-control-batch-93-korketrekkeren';
const SOURCE_SCRIPT_COMMIT = '9747dd6caa3a64895e53d0b7e3966b788352aa70';
const SOURCE_DATA_COMMIT = '8e401acb7c632414c855e7a1fcc5676d0e1bb0ce';
const OLD_REPORT_DIR = 'reports/oslo-coordinate-control-batch-93';
const NEW_REPORT_DIR = 'reports/oslo-coordinate-control-batch-95';
const TEMP_SCRIPT = '/tmp/oslo-coordinate-control-batch-95-korketrekkeren.mjs';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });

const protocol = fs.readFileSync(path.join(ROOT, PROTOCOL), 'utf8');
if (/^\| 95 \|/m.test(protocol)) throw new Error('Batch 95 is already in use in the Oslo coordinate protocol');
const verifiedHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const lines = protocol.split('\n');
const headerIndex = lines.indexOf(verifiedHeader);
let tableEnd = headerIndex + 2;
while (tableEnd < lines.length && lines[tableEnd].startsWith('| ')) tableEnd += 1;
if (lines.slice(headerIndex + 2, tableEnd).some((line) => line.includes('`korketrekkeren`'))) {
  throw new Error('Korketrekkeren is already present in the verified Oslo protocol table');
}

fs.mkdirSync(path.join(ROOT, NEW_REPORT_DIR), { recursive: true });
for (const name of ['relation-connectivity-diagnostic.json', 'relation-member-diagnostic.json']) {
  const content = execFileSync('git', ['show', `${SOURCE_DATA_COMMIT}:${OLD_REPORT_DIR}/${name}`], { encoding: 'utf8' });
  fs.writeFileSync(path.join(ROOT, NEW_REPORT_DIR, name), content);
}

let source = execFileSync('git', ['show', `${SOURCE_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`], { encoding: 'utf8' });
source = source
  .replaceAll('reports/oslo-coordinate-control-batch-93', NEW_REPORT_DIR)
  .replaceAll('Batch 93', 'Batch 95')
  .replaceAll('batch: 93', 'batch: 95')
  .replaceAll('| 93 |', '| 95 |');

if (source.includes('Batch 93') || source.includes('batch: 93') || source.includes('| 93 |')) {
  throw new Error('Could not fully renumber the validated Korketrekkeren job from batch 93 to batch 95');
}
fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);
