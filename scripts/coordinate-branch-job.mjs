import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/history-phase8-builder';
const reportPath = 'reports/historie-canonical-migration/phase8-finalization-diagnostic.json';
const targets = [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
];

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024
  });
  return {
    command: [command, ...args].join(' '),
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function parseJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

const steps = [];
steps.push(run(process.execPath, ['scripts/audit-quiz-production-context.mjs']));

for (const target of targets) {
  steps.push(run(process.execPath, [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'historie',
    '--target', target,
    '--output', `data/quiz/production_context/historie/${target}.json`
  ]));
}

steps.push(run('npm', ['run', 'knowledge:canonical:write']));
steps.push(run('npm', ['run', 'test:quiz-production']));
steps.push(run(process.execPath, ['tools/validate-historie-minne.mjs']));
steps.push(run('npm', ['run', 'knowledge:canonical:check']));

const requiredSteps = steps.slice(1);
const success = requiredSteps.every((step) => step.status === 0);

if (!success) {
  const diagnostic = {
    status: 'failed',
    generated_at: new Date().toISOString(),
    initial_audit: parseJson(steps[0].stdout),
    steps
  };
  const restore = run('git', ['restore', '--worktree', '--staged', '.']);
  if (restore.status !== 0) throw new Error(`git restore failed\n${restore.stdout}\n${restore.stderr}`);
  fs.writeFileSync(reportPath, JSON.stringify(diagnostic, null, 2) + '\n');
} else {
  if (fs.existsSync(reportPath)) fs.rmSync(reportPath);
}

fs.rmSync('scripts/coordinate-branch-job.mjs');

for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', success
    ? 'Refresh phase 8 production artifacts after main sync'
    : 'Capture phase 8 finalization diagnostic']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) {
  const result = run(command, args);
  if (result.status !== 0) {
    throw new Error(`${result.command} failed\n${result.stdout}\n${result.stderr}`);
  }
}

console.log(success ? 'Phase 8 finalization passed and was published.' : `Published ${reportPath}`);
