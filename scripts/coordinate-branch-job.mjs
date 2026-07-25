import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = process.env.JOB_BRANCH || 'agent/history-v5-5-final-freeze';
const runnerPath = path.join(root, 'scripts/coordinate-branch-job.mjs');
const tempPath = path.join(root, 'scripts/.history-v5-final-freeze.mjs');

function exec(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: process.env,
    ...options
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
  return result.stdout || '';
}

const original = exec('git', ['show', 'HEAD^:scripts/coordinate-branch-job.mjs']);
fs.writeFileSync(tempPath, original);
exec('node', [tempPath]);
fs.rmSync(tempPath, { force: true });
fs.rmSync(runnerPath, { force: true });

exec('git', ['config', 'user.name', 'github-actions[bot]']);
exec('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
exec('git', ['add', '-A']);
const staged = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: root, env: process.env });
if (staged.status === 1) {
  exec('git', ['commit', '-m', 'Historie V5.5: complete global quality freeze']);
  exec('git', ['pull', '--rebase', 'origin', branch]);
  exec('git', ['push', 'origin', `HEAD:${branch}`]);
} else if (staged.status !== 0) {
  throw new Error(`git diff --cached --quiet failed with ${staged.status}`);
}
