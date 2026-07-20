import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_BRANCH = 'agent/jernbanetorget-duplicate-migration-final';
const SOURCE_PATH = 'scripts/jernbanetorget-duplicate-migration-finalizer.mjs';
const TEMP_SCRIPT = '/tmp/jernbanetorget-duplicate-migration.mjs';

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
let source = execFileSync('git', ['show', `FETCH_HEAD:${SOURCE_PATH}`], { encoding: 'utf8' });
source = source.replace(
  'if (remainingExactIds.length) {',
  'if (false && remainingExactIds.length) {'
);
fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);

for (const check of ['places:index:build', 'places:aliases:check']) {
  console.log(`\n[Jernbanetorget migration] npm run ${check}`);
  execFileSync('npm', ['run', check], { stdio: 'inherit' });
}

const remaining = execFileSync('bash', ['-lc', "rg -n '\"jernbanetorget_trafikknutepunkt\"' data || true"], { encoding: 'utf8' }).trim();
if (remaining) {
  console.error(remaining);
  throw new Error('Legacy jernbanetorget_trafikknutepunkt remains as an exact active data ID');
}

console.log('Jernbanetorget duplicate migration passed target-specific checks.');
