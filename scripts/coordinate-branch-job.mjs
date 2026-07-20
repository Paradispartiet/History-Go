import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.alna-coordinate-current-main-job.mjs');
const source = execFileSync(
  'git',
  ['show', 'origin/agent/oslo-coordinate-alna-route-control:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
