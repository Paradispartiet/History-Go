import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/history-phase8-builder';
const targets = [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

for (const target of targets) {
  run(process.execPath, [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'historie',
    '--target', target,
    '--output', `data/quiz/production_context/historie/${target}.json`
  ]);
}

run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);
run(process.execPath, ['tools/validate-historie-minne.mjs']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run('git', ['diff', '--check']);

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
run('git', ['commit', '-m', 'Refresh phase 8 production artifacts after main sync']);
run('git', ['push', 'origin', `HEAD:${branch}`]);

console.log('Phase 8 finalization passed and was published.');
