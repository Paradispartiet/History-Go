import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-phase8-postmerge-verify';
const reportPath = 'reports/historie-canonical-migration/phase8-postmerge-verification.json';
const commands = [
  ['npm', ['run', 'audit:quiz-production-context']],
  ['npm', ['run', 'audit:quiz-progression']],
  ['npm', ['run', 'audit:quiz-theory-binding']],
  ['npm', ['run', 'test:quiz-production']],
  [process.execPath, ['tools/validate-historie-minne.mjs']],
  ['npm', ['run', 'knowledge:canonical:check']],
  ['npm', ['run', 'knowledge:legacy:check']],
  ['git', ['diff', '--check']]
];

const results = commands.map(([command, args]) => {
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
});

const passed = results.every((result) => result.status === 0);
fs.writeFileSync(reportPath, JSON.stringify({
  status: passed ? 'passed' : 'failed',
  verified_commit: process.env.GITHUB_SHA || null,
  results
}, null, 2) + '\n');
fs.rmSync('scripts/coordinate-branch-job.mjs');

for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Capture phase 8 post-merge verification']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
}

console.log(`Post-merge verification: ${passed ? 'PASS' : 'FAIL'}`);
