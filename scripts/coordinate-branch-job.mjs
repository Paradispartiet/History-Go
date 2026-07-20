import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const original = execFileSync(
  'git',
  ['show', 'HEAD^:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);

const patched = original.replaceAll('`needs_detail_check`', "'needs_detail_check'");
if (patched === original) {
  throw new Error('Fant ikke statusmarkøren som skulle rettes');
}

const tempPath = path.resolve('scripts/.alna-utlop-materializer-fixed.mjs');
fs.writeFileSync(tempPath, patched);

try {
  await import(pathToFileURL(tempPath).href);
} finally {
  fs.rmSync(tempPath, { force: true });
}
