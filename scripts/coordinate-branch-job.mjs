import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '73aef9cebeb3a96489552b93642024354f795daf';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/oslo-coordinate-control-batch-95-korketrekkeren-final.mjs';

const source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);
