import { execFileSync } from 'node:child_process';

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run(process.execPath, ['tests/groruddammen-nature-rounds-batch1.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);

console.log('Groruddammen final validation OK');
