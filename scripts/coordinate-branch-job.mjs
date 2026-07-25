import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: process.cwd(), stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

const validator = 'tools/validate-historie-v5.mjs';
const before = fs.readFileSync(validator, 'utf8');
const after = before.replaceAll('counts.emners', 'counts.emner');
fs.writeFileSync(validator, after);
run(process.execPath, [validator, '--write']);

fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Materialize Historie V5.5 readiness baseline']);
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
run('git', ['pull', '--rebase', 'origin', branch]);
run('git', ['push', 'origin', `HEAD:${branch}`]);
