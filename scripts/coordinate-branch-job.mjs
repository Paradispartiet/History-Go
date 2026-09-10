import { execFileSync } from 'node:child_process';
import process from 'node:process';

const root = process.cwd();
const run = (command, args, env = {}) => execFileSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });

run(process.execPath, ['scripts/build-fagverk-release-manifest.mjs']);
run(process.execPath, ['scripts/build-fagverk-release-manifest.mjs', '--check']);
run(process.execPath, ['scripts/audit-fagverk-subject-inventory.mjs']);
run(process.execPath, ['scripts/audit-fagverk-general-engine.mjs']);
run(process.execPath, ['--test', 'tests/fagverk-release-manifest.test.mjs']);
run('git', ['diff', '--check']);
