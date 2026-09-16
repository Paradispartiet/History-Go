#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import process from 'node:process';
import {
  classifyPlaceProductionChanges,
  loadPlaceProductionRoutingRegistry,
} from './place-production-routing-v2-lib.mjs';

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function changedFiles(base, head) {
  const result = spawnSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'git diff failed');
  return result.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

function main() {
  const base = argValue('--base');
  const head = argValue('--head');
  const json = process.argv.includes('--json');
  if (!base || !head) {
    console.error('Usage: node scripts/place-production-routing-v2.mjs --base <sha> --head <sha> [--json]');
    process.exit(2);
  }

  try {
    const plan = classifyPlaceProductionChanges(changedFiles(base, head), loadPlaceProductionRoutingRegistry());
    if (json) {
      process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    } else {
      console.log(`Place production routing mode: ${plan.mode}`);
      console.log(`Places: ${plan.places.length ? plan.places.join(', ') : 'none'}`);
      console.log(`Tests: ${plan.tests.length}`);
      console.log(`Gates: ${plan.gates.length ? plan.gates.join(', ') : 'none'}`);
      console.log(`Unknown: ${plan.unknown.length ? plan.unknown.join(', ') : 'none'}`);
    }
    if (plan.unknown.length) process.exit(1);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
