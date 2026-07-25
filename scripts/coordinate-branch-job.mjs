#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_middelalder_kirke_kongemakt';
const summaryPath = path.join(reportDir, 'middelalder-kirke-kongemakt-curation-readiness.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, { recursive: true });

const run = (name, command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('middelalder-kirke-kongemakt-domain-validation.log', process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run('middelalder-kirke-kongemakt-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('middelalder-kirke-kongemakt-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('middelalder-kirke-kongemakt-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('middelalder-kirke-kongemakt-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('middelalder-kirke-kongemakt-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('middelalder-kirke-kongemakt-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('middelalder-kirke-kongemakt-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readiness = readJson(path.join(reportDir, 'historie-v5-5-readiness.json'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.freeze_ready || domain.issue_counts?.concepts !== 0 || domain.issue_counts?.theories !== 0 || domain.issue_counts?.emner !== 0) {
  throw new Error(`${domainId} failed post-sync readiness: ${JSON.stringify(domain)}`);
}
const previous = readJson(summaryPath);
const summary = {
  ...previous,
  generated_at: new Date().toISOString(),
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  validated_against_current_main: true
};
writeJson(summaryPath, summary);
console.log(JSON.stringify(summary, null, 2));
