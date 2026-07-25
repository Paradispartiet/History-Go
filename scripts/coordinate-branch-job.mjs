import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = process.env.JOB_BRANCH || 'agent/history-v5-5-final-freeze-clean';
const runnerPath = path.join(root, 'scripts/coordinate-branch-job.mjs');

function exec(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    env: process.env
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

exec('git', ['checkout', 'origin/main', '--',
  'data/places/places_index.json',
  'reports/coordinate-evidence-audit.md',
  'reports/place-coordinate-intake-gate.md',
  'reports/place-coordinate-quality-gate.md',
  'reports/place-source-layout-audit.json'
]);
fs.rmSync(path.join(root, 'reports/coordinate-branch-runner/agent_history-v5-5-final-freeze-clean'), { recursive: true, force: true });
fs.rmSync(runnerPath, { force: true });

exec('git', ['config', 'user.name', 'github-actions[bot]']);
exec('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
exec('git', ['add', '-A']);
exec('git', ['commit', '-m', 'Historie V5.5: remove unrelated coordinate artifacts']);
exec('git', ['push', 'origin', `HEAD:${branch}`]);
console.error('Cleanup published; stopping coordinate workflow before unrelated regeneration.');
process.exit(1);
