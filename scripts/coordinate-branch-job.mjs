import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import './materialize-groruddammen-nature-rounds.mjs';

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run(process.execPath, ['tests/groruddammen-nature-rounds-batch1.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);

for (const file of [
  'scripts/materialize-groruddammen-nature-rounds.mjs',
  '.github/workflows/materialize-groruddammen-nature-rounds.yml',
  'reports/groruddammen-materializer-trigger.txt'
]) {
  fs.rmSync(file, { force: true });
}

console.log('Groruddammen materialized, tested, and temporary files removed.');
