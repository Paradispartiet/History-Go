#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  DEFAULT_REPO_ROOT,
  loadWorkflowRecord,
  projectionPaths,
  renderQualityGateProjection,
  renderWorkcardProjection,
  stableJson,
} from './place-production-v3-lib.mjs';

export function buildProjectionContents(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const record = loadWorkflowRecord(placeId, repoRoot);
  return {
    record,
    paths: projectionPaths(placeId, repoRoot),
    contents: {
      workcard: stableJson(renderWorkcardProjection(record)),
      qualityGate: stableJson(renderQualityGateProjection(record)),
    },
  };
}

export function writeOrCheckProjections(placeId, { check = false, repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const built = buildProjectionContents(placeId, repoRoot);
  const pairs = [
    [built.paths.workcard, built.contents.workcard],
    [built.paths.qualityGate, built.contents.qualityGate],
  ];

  let ok = true;
  for (const [target, expected] of pairs) {
    if (check) {
      const actual = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
      if (actual !== expected) {
        console.error(`stale V3 projection: ${path.relative(repoRoot, target)}`);
        ok = false;
      }
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, expected);
  }
  return ok;
}

function main() {
  const args = process.argv.slice(2);
  const placeId = args.find((arg) => !arg.startsWith('--'));
  const check = args.includes('--check');
  if (!placeId) {
    console.error('Usage: node scripts/build-place-production-v3-projections.mjs <place_id> [--check]');
    process.exit(2);
  }
  try {
    if (!writeOrCheckProjections(placeId, { check })) process.exit(1);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main();
}
