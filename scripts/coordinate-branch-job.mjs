#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_krig_okkupasjon_motstand';
fs.mkdirSync(reportDir, { recursive: true });

const run = (name, command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('krig-okkupasjon-motstand-domain-validation.log', process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run('krig-okkupasjon-motstand-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('krig-okkupasjon-motstand-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('krig-okkupasjon-motstand-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('krig-okkupasjon-motstand-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('krig-okkupasjon-motstand-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('krig-okkupasjon-motstand-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('krig-okkupasjon-motstand-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readinessPath = path.join(reportDir, 'historie-v5-5-readiness.json');
const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.freeze_ready || domain.issue_counts?.concepts !== 0 || domain.issue_counts?.theories !== 0 || domain.issue_counts?.emner !== 0) {
  throw new Error(`${domainId} failed post-sync readiness: ${JSON.stringify(domain)}`);
}

const existingSummaryPath = path.join(reportDir, 'krig-okkupasjon-motstand-curation-readiness.json');
const existingSummary = JSON.parse(fs.readFileSync(existingSummaryPath, 'utf8'));
const summary = {
  ...existingSummary,
  generated_at: new Date().toISOString(),
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  validated_against_current_main: true
};
fs.writeFileSync(existingSummaryPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
