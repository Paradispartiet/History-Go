import { spawnSync } from 'node:child_process';

function run(label, command, args) {
  console.log(`\n===== ${label} =====`);
  const result = spawnSync(command, args, { encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  console.log(`===== ${label} exit ${result.status} =====`);
  return result.status ?? 1;
}

const people = run('PEOPLE DATA CHECK', 'bash', ['scripts/check-people.sh']);
const places = run('PLACES DATA CHECK', 'bash', ['scripts/check-places.sh']);
if (people || places) process.exit(1);
