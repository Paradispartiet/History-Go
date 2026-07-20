import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const commits = execFileSync(
  'git',
  ['log', '--format=%H', '--', 'scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
).trim().split(/\s+/);

let original = '';
for (const commit of commits) {
  const candidate = execFileSync(
    'git',
    ['show', `${commit}:scripts/coordinate-branch-job.mjs`],
    { encoding: 'utf8' }
  );
  const isMaterializer =
    !candidate.includes("from 'node:url'") &&
    candidate.includes("const placeId = 'alna_utlop_bjorvika';") &&
    candidate.includes("console.log('Alna historical outlet materialized and validated')");
  if (isMaterializer) {
    original = candidate;
    break;
  }
}
if (!original) {
  throw new Error('Fant ikke originalmaterialiseringen i Git-historikken');
}

const patched = original.replaceAll('`needs_detail_check`', 'needs_detail_check');

const tempPath = path.resolve('scripts/.alna-utlop-materializer-fixed.mjs');
fs.writeFileSync(tempPath, patched);

try {
  await import(pathToFileURL(tempPath).href);
} finally {
  fs.rmSync(tempPath, { force: true });
}
