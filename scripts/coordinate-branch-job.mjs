import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_BRANCH = 'agent/oslo-coordinate-control-batch-91-bygdoy-museums';
const SOURCE_COMMIT = 'e7c48b29723930d09fa9da7d57d9f8aa73171b2c';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/oslo-coordinate-control-batch-91.mjs';

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
const source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);
