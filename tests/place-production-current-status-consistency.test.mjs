import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const reportDir = path.join(root, 'reports/place-production');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(reportDir, name), 'utf8'));

const transientWorkcardStatuses = new Set([
  'ready_for_final_ci',
  'ready_for_pr',
  'ready_for_pr_ci_and_merge',
  'local_ready_for_validation'
]);
const transientBranchStatuses = new Set([
  'ready_for_pr',
  'local_ready_for_validation'
]);
const transientLiveStatuses = new Set([
  'pending_merge',
  'ikke live',
  'not live until pr merge'
]);
const transientAuditStatuses = new Set([
  'ready_for_pr',
  'ready_for_pr_ci',
  'ready_for_pr_ci_and_merge',
  'pending_pr_ci'
]);

const normalize = (value) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[\s-]+/gu, '_');

test('current place-production status på main inneholder ikke pre-merge markører', () => {
  const stale = [];
  const files = fs.readdirSync(reportDir);

  for (const name of files.filter((file) => file.endsWith('-workcard-current.json'))) {
    const document = readJson(name);
    const status = normalize(document.status);
    const branchStatus = normalize(document.branch_status);
    const liveStatus = normalize(document.live_status);

    if (transientWorkcardStatuses.has(status)) stale.push(`${name}: status=${document.status}`);
    if (transientBranchStatuses.has(branchStatus)) stale.push(`${name}: branch_status=${document.branch_status}`);
    if (transientLiveStatuses.has(liveStatus)) stale.push(`${name}: live_status=${document.live_status}`);
  }

  for (const name of files.filter((file) => file.endsWith('-workcard-current.md'))) {
    const content = fs.readFileSync(path.join(reportDir, name), 'utf8');
    if (/READY_FOR_PR_CI_AND_MERGE/u.test(content)) stale.push(`${name}: Samlet status=READY_FOR_PR_CI_AND_MERGE`);
  }

  for (const name of files.filter((file) => /-phase(?:1|8)-24-gate-audit-v1\.json$/u.test(file))) {
    const document = readJson(name);
    const overall = normalize(document.overall_status);
    const ci = normalize(document.phase_status?.['23_ci']);
    const gate = normalize(document.phase_status?.['24_one_place_gate']);

    if (transientAuditStatuses.has(overall)) stale.push(`${name}: overall_status=${document.overall_status}`);
    if (transientAuditStatuses.has(ci)) stale.push(`${name}: phase_status.23_ci=${document.phase_status?.['23_ci']}`);
    if (transientAuditStatuses.has(gate)) stale.push(`${name}: phase_status.24_one_place_gate=${document.phase_status?.['24_one_place_gate']}`);
  }

  assert.deepEqual(stale, [], `Stale current production status:\n${stale.join('\n')}`);
});
