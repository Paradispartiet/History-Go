#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();
const reportDir = path.join(root, 'reports/historie-v5');
fs.mkdirSync(reportDir, {recursive: true});

const run = (name, command, args) => {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8'});
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('katastrofer-brudd-ulykker-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('katastrofer-brudd-ulykker-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('katastrofer-brudd-ulykker-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('katastrofer-brudd-ulykker-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('katastrofer-brudd-ulykker-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('katastrofer-brudd-ulykker-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('katastrofer-brudd-ulykker-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);
