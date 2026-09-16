#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import {
  DEFAULT_REPO_ROOT,
  V3_BUILD_STEPS,
  deriveSelectedCollections,
  deriveWorkflowState,
  loadWorkflowRecord,
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

export function printPlan(record) {
  const selected = deriveSelectedCollections(record);
  const blocked = blockedLabels(record);
  const lines = [
    `Place: ${record.place_id}`,
    `Profile: ${record.profile.id} (${record.profile.status})`,
    `State: ${deriveWorkflowState(record)}`,
    `Collections: ${selected.length ? selected.join(', ') : 'none'}`,
    `Blocked: ${blocked.length ? blocked.join(', ') : 'none'}`,
    `Factuality: ${record.sources.factuality_record}`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

export function buildPlace(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  loadWorkflowRecord(placeId, repoRoot);
  for (const [command, baseArgs] of V3_BUILD_STEPS) {
    const args = [...baseArgs];
    if (baseArgs[0] === 'scripts/build-place-production-v3-projections.mjs') args.push(placeId);
    const status = run(command, args, repoRoot);
    if (status !== 0) return status;
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

  let status = run('node', ['scripts/build-place-production-v3-projections.mjs', placeId, '--check'], repoRoot);
  if (status !== 0) return status;

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
