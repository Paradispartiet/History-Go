import { execFileSync } from 'node:child_process';
import process from 'node:process';

const root = process.cwd();
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

run(process.execPath, ['--experimental-strip-types', 'scripts/build-civication-scenario-people-index.mts']);
run(process.execPath, [
  'scripts/build-quiz-production-context.mjs',
  '--category', 'historie',
  '--target', 'peststotten_krist_kirkegard',
  '--output', 'data/quiz/production_context/historie/peststotten_krist_kirkegard.json'
]);

run(process.execPath, ['--experimental-strip-types', 'scripts/build-civication-scenario-people-index.mts', '--check']);
run('npm', ['run', 'audit:quiz-production-context']);
run('git', ['diff', '--check']);
