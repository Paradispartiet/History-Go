#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportDir = path.join(root, 'reports', 'uranienborg-coordinate-evidence-contract');
fs.mkdirSync(reportDir, { recursive: true });

const run = (name, command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run('build-tools.log', 'npm', ['run', 'build:tools']);
run('coordinate-evidence.log', process.execPath, ['dist/tools/audit-coordinate-evidence.mjs']);
