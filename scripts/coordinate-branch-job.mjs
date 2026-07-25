import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/historie-v5-5-refresh-after-memory';
const root = process.cwd();

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });

const reportDir = process.env.RUNNER_REPORT_DIR;
if (reportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${reportDir.replaceAll('\\\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Refresh Historie V5.5 readiness after memory vertical']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published refreshed Historie V5.5 readiness report.');
