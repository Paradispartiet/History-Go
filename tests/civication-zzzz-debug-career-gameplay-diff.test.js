#!/usr/bin/env node
'use strict';
const { execFileSync } = require('node:child_process');
execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--write'], { stdio: 'pipe' });
const diff = execFileSync('git', ['diff', '--unified=0', '--', 'data/Civication/careerGameplayMatrix.json', 'reports/civication-career-gameplay-matrix.md'], { encoding: 'utf8' });
const lines = diff.split('\n').filter((line) =>
  /^[-+]\s{0,6}"?(summary|key|role_tests|runtime_gate|complete_components|status|discovered_worlds|work_worlds|career_worlds|noncareer_worlds|support_worlds)/.test(line) ||
  /^[-+]\s*\|/.test(line) ||
  /^[-+]\s*- (Discovered|Canonical|Career gameplay|Runtime gameplay|Active Life Story)/.test(line)
);
console.error('CAREER_GAMEPLAY_GENERATED_DIFF');
console.error(lines.slice(-20).join('\n'));
process.exit(1);
