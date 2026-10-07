#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import {
  DEFAULT_REPO_ROOT,
  deriveSelectedCollections,
  deriveWorkflowState,
  loadWorkflowRecord,
  placeDerivedArtifactPlan,
  placeVerifyOnlySteps,
} from './place-production-v3-lib.mjs';
import {
  runSelectedPlaceRegressions,
  selectPlaceRegressionPlan,
} from './run-place-regressions-v1.mjs';

function blockedLabels(record) {
  const labels = [];
  for (const [id, decision] of Object.entries(record.collections ?? {})) {
    if (decision.status === 'BLOCKED') labels.push(`collection:${id}`);
  }
  for (const [id, decision] of Object.entries(record.modules ?? {})) {
    if (decision.status === 'BLOCKED') labels.push(`module:${id}`);
  }
  labels.push(...(record.blockers ?? []));
  return labels;
}

function run(command, args, repoRoot = DEFAULT_REPO_ROOT) {
  const executable = command === 'node' ? process.execPath : command;
  const result = spawnSync(executable, args, { cwd: repoRoot, stdio: 'inherit' });
  return result.status ?? 1;
}

function commandLabel([command, args]) {
  return [command, ...args].join(' ');
}

function dirtyPaths(repoRoot = DEFAULT_REPO_ROOT) {
  const result = spawnSync('git', ['status', '--porcelain=v1'], { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) return new Set();
  return new Set(result.stdout
    .split(/\r?\n/u)
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .map((value) => value.includes(' -> ') ? value.split(' -> ').at(-1) : value));
}

function runDerivedStep(step, mode, repoRoot) {
  const command = step[mode];
  if (!command) return 0;
  console.log(`[place:${mode}] ${step.id}: ${commandLabel(command)}`);
  const status = run(command[0], command[1], repoRoot);
  if (status !== 0) {
    const remediation = step.build ? commandLabel(step.build) : null;
    console.error(`[place:${mode}] ${step.id} failed.${mode === 'verify' && remediation ? ` Regenerate with: ${remediation}` : ''}`);
  }
  return status;
}

export function printPlan(record) {
  const selected = deriveSelectedCollections(record);
  const blocked = blockedLabels(record);
  const derivedSteps = placeDerivedArtifactPlan(record).map((step) => step.id);
  const lines = [
    `Place: ${record.place_id}`,
    `Profile: ${record.profile.id} (${record.profile.status})`,
    `State: ${deriveWorkflowState(record)}`,
    `Collections: ${selected.length ? selected.join(', ') : 'none'}`,
    `Blocked: ${blocked.length ? blocked.join(', ') : 'none'}`,
    `Factuality: ${record.sources.factuality_record}`,
    `Derived pipeline: ${derivedSteps.join(' -> ')} -> i18n-freshness`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

export function buildPlace(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const record = loadWorkflowRecord(placeId, repoRoot);
  const before = dirtyPaths(repoRoot);
  for (const step of placeDerivedArtifactPlan(record)) {
    const status = runDerivedStep(step, 'build', repoRoot);
    if (status !== 0) return status;
  }

  const after = dirtyPaths(repoRoot);
  const generatedChanges = [...after].filter((value) => !before.has(value)).sort();
  if (generatedChanges.length) {
    console.log('[place:build] Derived files changed and must be committed before closeout:');
    for (const file of generatedChanges) console.log(`- ${file}`);
  } else {
    console.log('[place:build] No newly dirty derived files.');
  }
  return 0;
}

export function verifyPlace(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const record = loadWorkflowRecord(placeId, repoRoot);
  const factuality = path.resolve(repoRoot, record.sources.factuality_record);
  if (!fs.existsSync(factuality)) {
    console.error(`Missing referenced factuality record: ${record.sources.factuality_record}`);
    return 1;
  }

  let status = 0;
  for (const step of [...placeDerivedArtifactPlan(record), ...placeVerifyOnlySteps(record)]) {
    status = runDerivedStep(step, 'verify', repoRoot);
    if (status !== 0) return status;
  }

  status = run('bash', ['scripts/check-places.sh'], repoRoot);
  if (status !== 0) return status;

  const plan = selectPlaceRegressionPlan([`data/places/workflow/${placeId}.json`]);
  status = runSelectedPlaceRegressions(plan);
  if (status !== 0) return status;

  const derived = deriveWorkflowState(record);
  if (derived !== record.state) {
    console.error(`Workflow state mismatch: declared ${record.state}, derived ${derived}`);
    return 1;
  }
  return 0;
}

function usage() {
  console.error('Usage: node scripts/place-production-v3.mjs <plan|build|verify> <place_id>');
}

function main() {
  const [command, placeId] = process.argv.slice(2);
  if (!command || !placeId || !['plan', 'build', 'verify'].includes(command)) {
    usage();
    process.exit(2);
  }

  try {
    if (command === 'plan') {
      printPlan(loadWorkflowRecord(placeId));
      return;
    }
    const status = command === 'build' ? buildPlace(placeId) : verifyPlace(placeId);
    process.exit(status);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
