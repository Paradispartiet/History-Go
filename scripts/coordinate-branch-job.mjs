import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function run(command, args) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
}

run('npm', ['run', 'places:index:build']);
run('node', ['tests/ankerbrua-rounds-batch1.test.js']);
run('npm', ['run', 'audit:people-of-places']);
run('npm', ['run', 'leksikon:ids:check']);
run('npm', ['run', 'check:stories']);
run('npm', ['run', 'typecheck:tools']);
run('npm', ['run', 'typecheck:web']);
run('git', ['diff', '--check']);

fs.rmSync('.github/workflows/temp-trigger-ankerbrua-refresh.yml', { force: true });
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });

console.log('Ankerbrua clean rebuild completed on current main.');
