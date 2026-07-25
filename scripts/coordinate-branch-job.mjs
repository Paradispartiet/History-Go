import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-tid-validator';
const commands = [
  [process.execPath, ['tools/validate-historie-quality-tid-periodisering.mjs']],
  ['npm', ['run', 'audit:quiz-production-context']],
  ['npm', ['run', 'audit:quiz-progression']],
  ['npm', ['run', 'audit:quiz-theory-binding']],
  ['npm', ['run', 'test:quiz-production']],
  ['npm', ['run', 'knowledge:canonical:check']],
  ['npm', ['run', 'knowledge:legacy:check']],
  ['git', ['diff', '--check']]
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
}

for (const [command, args] of commands) run(command, args);

const reportDir = process.env.RUNNER_REPORT_DIR;
if (reportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  const rule = `/${reportDir.replaceAll('\\', '/')}/`;
  if (!existing.split(/\r?\n/).includes(rule)) {
    fs.appendFileSync(excludePath, `${existing.endsWith('\n') || existing.length === 0 ? '' : '\n'}${rule}\n`);
  }
}

fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Verify permanent time-domain quality validator']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Permanent time-domain quality validator passed.');
