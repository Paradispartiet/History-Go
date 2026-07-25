import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['tools/validate-historie-v5.mjs', '--write'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`Historie V5.5 readiness audit failed with exit code ${result.status}`);
}
