import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = 'bc82efcf4b3cf31438de20f7463cecedf94463ee';
const TEMP_SCRIPT = '/tmp/frysja-industrial-model-audit.mjs';
const source = execFileSync('git', ['show', `${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`], { encoding: 'utf8' });
writeFileSync(TEMP_SCRIPT, source, 'utf8');
await import(pathToFileURL(TEMP_SCRIPT).href);
