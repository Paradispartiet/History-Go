import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  classifyPlaceProductionChanges,
  loadPlaceProductionRoutingRegistry,
} from './place-production-routing-v2-lib.mjs';

function run(command, args, options = {}) {
  return spawnSync(command, args, { stdio: 'inherit', ...options });
}

function changedFiles(base, head) {
  if (!base || !head) return null;
  const result = spawnSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'git diff failed');
  return result.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

export function selectPlaceRegressionPlan(changed, registry = loadPlaceProductionRoutingRegistry()) {
  if (changed === null) {
    const fullMatrixProbe = registry.fullMatrixPaths?.[0];
    if (!fullMatrixProbe) throw new Error('Place production routing registry has no fullMatrixPaths safety probe');
    return classifyPlaceProductionChanges([fullMatrixProbe], registry);
  }
  return classifyPlaceProductionChanges(changed, registry);
}

export function runSelectedPlaceRegressions(plan) {
  if (plan.unknown.length) {
    console.error(`Unrouted Place production path(s): ${plan.unknown.join(', ')}`);
    return 1;
  }
  if (plan.mode === 'governance-only' || plan.tests.length === 0) {
    console.log('No place-specific regressions selected; generic governance remains authoritative.');
    return 0;
  }

  for (const testPath of plan.tests) {
    if (!fs.existsSync(testPath)) {
      console.error(`Registered place regression is missing: ${testPath}`);
      return 1;
    }
  }

  console.log(`Place regression mode: ${plan.mode}`);
  console.log(`Selected places: ${plan.places.join(', ')}`);
  const result = run(process.execPath, ['--test', ...plan.tests]);
  return result.status ?? 1;
}

function main() {
  try {
    const base = process.env.PLACE_REGRESSION_BASE_SHA || '';
    const head = process.env.PLACE_REGRESSION_HEAD_SHA || '';
    const plan = selectPlaceRegressionPlan(changedFiles(base, head));
    process.exit(runSelectedPlaceRegressions(plan));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) main();
