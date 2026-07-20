import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = 'e177dea8bc9267c052ee775c4c4cd6723248ac14';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/oslo-kraftselskap-headquarters-coordinate-control.mjs';

const original = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
const lines = original.split('\n');
const brokenLine = lines.findIndex((line) => line.includes('new RegExp(') && line.includes('tableSection'));
if (brokenLine < 0) throw new Error('Could not locate the Oslo protocol duplicate-row check to patch');
lines[brokenLine] = "if (tableSection.split('\\n').some((line) => /^\\| \\d+ \\|/.test(line) && line.includes('`' + ID + '`'))) {";
let patched = lines.join('\n');
patched = patched.replace(
  "evidence.coordinateDecision = 'use_official_address_for_resolved_headquarters_building';",
  "evidence.coordinateDecision = 'do_not_change_coordinates_yet';"
);
if (!patched.includes("evidence.coordinateDecision = 'do_not_change_coordinates_yet';")) {
  throw new Error('Could not patch coordinateDecision to the existing evidence schema');
}
fs.writeFileSync(TEMP_SCRIPT, patched);
await import(pathToFileURL(TEMP_SCRIPT).href);
