#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/history-completion-audit';
const reportPath = 'reports/fagverk/historie-terminal-final-gates-temp.json';
const generatedSnapshots = [
  'reports/fagverk/subject-baseline.json',
  'reports/fagverk/general-engine-audit.json',
  'reports/fagverk/historie-subject-audit.json',
  'data/fagverk/fagverk_release.json',
];
const tempPaths = [
  '.github/workflows/history-editorial-separation-materialize-temp.yml',
  '.github/workflows/history-final-gates-diagnose-temp.yml',
  '.github/workflows/history-permanent-repair-commit-temp.yml',
  '.github/workflows/history-semantic-preflight-pr-temp.yml',
  '.github/workflows/history-semantic-preflight-temp.yml',
  '.github/workflows/history-semantic-report-temp.yml',
  '.github/workflows/history-semantic-split-diagnose-temp.yml',
  '.github/workflows/history-sync-main-temp.yml',
  '.github/workflows/history-terminal-finalize-temp.yml',
  'reports/fagverk/historie-editorial-materialization-temp.json',
  'reports/fagverk/historie-semantic-preflight-temp.json',
  'reports/fagverk/historie-terminal-final-gates-temp.json',
  'tools/diagnose-historie-semantic-preflight-temp.mjs',
  'tools/diagnose-historie-semantic-temp.mjs',
  'tools/patch-historie-editorial-separation-temp.py',
  'tools/run-historie-terminal-finalize-temp.mjs',
  'tools/run-historie-terminal-finalize-temp-v2.mjs',
  'tools/run-historie-terminal-finalize-temp-v3.mjs',
  'tools/run-historie-terminal-finalize-temp-v4.mjs',
  'tools/run-historie-postsync-final-verify-temp.mjs',
  'tools/run-historie-final-verify-and-cleanup-temp.mjs',
];

function exec(command, args = [], { allowFailure = false, inherit = false } = {}) {
  const run = spawnSync(command, args, { encoding: 'utf8', stdio: inherit ? 'inherit' : 'pipe' });
  if (run.error) throw run.error;
  if (!allowFailure && run.status !== 0) {
    throw new Error([`${command} ${args.join(' ')} failed (${run.status})`, run.stdout?.trim(), run.stderr?.trim()].filter(Boolean).join('\n'));
  }
  return run;
}
const out = (command, args = []) => exec(command, args).stdout.trim();
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const initialHead = out('git', ['rev-parse', 'HEAD']);
exec('git', ['config', 'user.name', 'github-actions[bot]']);
exec('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
exec('git', ['fetch', 'origin', 'main', branch]);
const observedMain = out('git', ['rev-parse', 'origin/main']);
assert.equal(
  exec('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], { allowFailure: true }).status,
  0,
  `History branch ${initialHead} does not contain current main ${observedMain}`,
);

// Refresh only shared deterministic projections after the latest main synchronization.
exec('node', ['scripts/audit-fagverk-subject-inventory.mjs', '--write-report'], { inherit: true });
exec('node', ['scripts/audit-fagverk-general-engine.mjs', '--write-report'], { inherit: true });
exec('node', ['scripts/audit-fagverk-historie.mjs', '--write-report'], { inherit: true });
exec('node', ['scripts/build-fagverk-release-manifest.mjs'], { inherit: true });

const stages = [
  ['subject_inventory', ['node', 'scripts/audit-fagverk-subject-inventory.mjs']],
  ['general_engine', ['node', 'scripts/audit-fagverk-general-engine.mjs']],
  ['curriculum_architecture', ['node', 'tools/validate-historie-curriculum-architecture.mjs']],
  ['period_modules', ['node', 'tools/validate-historie-period-modules.mjs']],
  ['period_modules_deterministic', ['node', 'tools/materialize-historie-period-modules.mjs', '--check']],
  ['canonical_identity', ['node', 'tools/audit-historie-canonical-emner.mjs']],
  ['semantic_alignment', ['node', 'tools/audit-historie-semantic-hook-alignment.mjs']],
  ['editorial_quality', ['node', 'tools/validate-historie-editorial-quality.mjs']],
  ['editorial_materialization_deterministic', ['node', 'tools/materialize-historie-editorial-chapters.mjs', '--check']],
  ['shared_history_audit', ['node', 'scripts/audit-fagverk-historie.mjs']],
  ['universal_coverage', ['node', 'tools/audit-historie-universal-coverage.mjs']],
  ['source_authority', ['node', 'tools/audit-historie-source-authority.mjs']],
  ['holistic_completion', ['node', 'tools/audit-historie-completion.mjs']],
  ['release_manifest_deterministic', ['node', 'scripts/build-fagverk-release-manifest.mjs', '--check']],
  ['test_subject_inventory', ['node', '--test', 'tests/fagverk-subject-inventory.test.mjs']],
  ['test_general_engine', ['node', '--test', 'tests/fagverk-general-engine.test.mjs']],
  ['test_curriculum_architecture', ['node', '--test', 'tests/historie-curriculum-architecture.test.mjs']],
  ['test_period_modules', ['node', '--test', 'tests/historie-period-modules.test.mjs']],
  ['test_canonical_identity', ['node', '--test', 'tests/historie-canonical-emne-identity.test.mjs']],
  ['test_curriculum_rendering', ['node', '--test', 'tests/historie-curriculum-rendering.test.mjs']],
  ['test_editorial_quality', ['node', '--test', 'tests/historie-editorial-quality.test.mjs']],
  ['test_completion', ['node', '--test', 'tests/historie-completion.test.mjs']],
  ['test_shared_history', ['node', '--test', 'tests/fagverk-historie.test.mjs']],
];

const checks = [];
const failedChecks = [];
for (const [id, command] of stages) {
  const [program, ...args] = command;
  const run = exec(program, args, { allowFailure: true });
  const row = {
    id,
    status: run.status === 0 ? 'PASS' : 'FAIL',
    exit_code: run.status,
    stdout: (run.stdout || '').trim().slice(-6000),
    stderr: (run.stderr || '').trim().slice(-6000),
  };
  checks.push(row);
  if (run.status !== 0) failedChecks.push(id);
  console.log(`${row.status} ${id}`);
}

const report = {
  schema: 'history_go_historie_terminal_final_gates_temp_v1',
  phase: 'latest_main_atomic_verify_cleanup',
  generated_from_head: initialHead,
  observed_main: observedMain,
  terminal_status_staged: 'complete',
  terminal_next_gate_staged: 'maintenance_source_refresh_and_place_case_expansion',
  status: failedChecks.length ? 'FAIL' : 'PASS',
  failed_checks: failedChecks,
  checks,
};
writeJson(reportPath, report);
console.log(JSON.stringify({ status: report.status, failed_checks: failedChecks }));

// Re-lock immediately before any branch write.
exec('git', ['fetch', 'origin', 'main', branch]);
const remoteHead = out('git', ['rev-parse', `origin/${branch}`]);
const currentMain = out('git', ['rev-parse', 'origin/main']);
assert.equal(remoteHead, initialHead, `History branch moved during atomic finalization: started ${initialHead}, remote is ${remoteHead}`);
assert.equal(
  exec('git', ['merge-base', '--is-ancestor', currentMain, initialHead], { allowFailure: true }).status,
  0,
  `main advanced during atomic finalization to ${currentMain}; refusing stale finalization push`,
);

if (report.status !== 'PASS') {
  exec('git', ['restore', `--source=${initialHead}`, '--worktree', '--staged', '--', ...generatedSnapshots], { inherit: true });
  exec('git', ['add', reportPath]);
  exec('git', ['commit', '-m', 'Record latest-main History final gate diagnosis'], { inherit: true });
  exec('git', ['push', 'origin', `HEAD:${branch}`], { inherit: true });
  process.exit(1);
}

// PASS: keep refreshed shared projections, delete every temporary History completion artifact atomically,
// and do not commit the temporary terminal report itself.
exec('git', ['add', ...generatedSnapshots]);
exec('git', ['rm', '-f', '--ignore-unmatch', '--', ...tempPaths], { inherit: true });

// Final lock after staging, before commit/push.
exec('git', ['fetch', 'origin', 'main', branch]);
const finalRemoteHead = out('git', ['rev-parse', `origin/${branch}`]);
const finalMain = out('git', ['rev-parse', 'origin/main']);
assert.equal(finalRemoteHead, initialHead, `History branch moved after PASS staging: started ${initialHead}, remote is ${finalRemoteHead}`);
assert.equal(
  exec('git', ['merge-base', '--is-ancestor', finalMain, initialHead], { allowFailure: true }).status,
  0,
  `main advanced after PASS staging to ${finalMain}; refusing stale cleanup push`,
);

exec('git', ['commit', '-m', 'Verify History on latest main and remove temporary completion infrastructure'], { inherit: true });
exec('git', ['push', 'origin', `HEAD:${branch}`], { inherit: true });
