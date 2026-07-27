import { execFileSync } from 'node:child_process';

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

run('node', [
  'scripts/build-quiz-production-context.mjs',
  '--category', 'by',
  '--target', 'deichman_bjorvika',
  '--output', 'data/quiz/production_context/by/deichman_bjorvika.json'
]);

run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
