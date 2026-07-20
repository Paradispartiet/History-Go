import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_BRANCH = 'agent/nrk-marienlyst-duplicate-migration';
const SOURCE_PATH = 'scripts/nrk-marienlyst-duplicate-migration.mjs';
const TEMP_SCRIPT = '/tmp/nrk-marienlyst-duplicate-migration.mjs';

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
const migrationSource = execFileSync('git', ['show', `FETCH_HEAD:${SOURCE_PATH}`], { encoding: 'utf8' });
fs.writeFileSync(TEMP_SCRIPT, migrationSource);
await import(pathToFileURL(TEMP_SCRIPT).href);

const extraChecks = [
  'places:index:build',
  'places:aliases:check',
  'check:stories',
  'audit:quiz-manifest:v2',
  'audit:people-of-places',
  'places:emner:check'
];

for (const check of extraChecks) {
  console.log(`\n[NRK migration] npm run ${check}`);
  execFileSync('npm', ['run', check], { stdio: 'inherit' });
}

const remaining = execFileSync('bash', ['-lc', "rg -n '\"nrk_marienlyst\"' data || true"], { encoding: 'utf8' }).trim();
if (remaining) {
  console.error(remaining);
  throw new Error('Legacy nrk_marienlyst references remain in active data');
}

console.log('NRK Marienlyst duplicate migration and cross-domain checks passed.');
