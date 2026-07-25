import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const validator = 'tools/validate-historie-v5.mjs';
const before = fs.readFileSync(validator, 'utf8');
const after = before.replaceAll('counts.emners', 'counts.emner');
if (after === before && before.includes('counts.emners')) {
  throw new Error('Could not correct readiness validator count key');
}
fs.writeFileSync(validator, after);

const result = spawnSync(process.execPath, [validator, '--write'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`Historie V5.5 readiness audit failed with exit code ${result.status}`);
}
