import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '561bf2c4957cb9fd365094539975c79300a527a9';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/loelva-historical-alias-integrated-v2.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
const aliasCheck = `execFileSync('npm', ['run', 'places:aliases:check'], { stdio: 'inherit' });`;
if (!source.includes(aliasCheck)) throw new Error('Could not locate alias gate in Loelva finalizer');
source = source.replace(
  aliasCheck,
  `execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });\n${aliasCheck}`
);
fs.writeFileSync(TEMP_SCRIPT, source);
await import(`${pathToFileURL(TEMP_SCRIPT).href}?v=2`);
