import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyPlaceProductionChanges } from '../scripts/place-production-routing-v2-lib.mjs';

const registry = JSON.parse(fs.readFileSync('.github/ci/place-production-routing-v2.json', 'utf8'));
const classify = (paths) => classifyPlaceProductionChanges(paths, registry);

test('documentation-only checklist edits are governance-only', () => {
  const plan = classify(['docs/PLACE_PRODUCTION_CHECKLIST.md']);
  assert.equal(plan.mode, 'governance-only');
  assert.deepEqual(plan.places, []);
  assert.deepEqual(plan.tests, []);
  assert.deepEqual(plan.unknown, []);
});

test('Torggata-specific changes select only Torggata', () => {
  const plan = classify(['data/places/by/oslo/places/torggata.json']);
  assert.equal(plan.mode, 'affected-places');
  assert.deepEqual(plan.places, ['torggata']);
  assert.ok(plan.tests.every((value) => value.includes('torggata')));
});

test('shared PlaceCard runtime selects full matrix', () => {
  const plan = classify(['js/ui/place-card.js']);
  assert.equal(plan.mode, 'full-matrix');
  assert.ok(plan.places.length >= 8);
});

test('workflow schema changes select shared-contract', () => {
  const plan = classify(['data/places/regler/place_production_workflow_v3.schema.json']);
  assert.equal(plan.mode, 'shared-contract');
});

test('unregistered V3 workflow records fail closed', () => {
  const plan = classify(['data/places/workflow/not_registered_yet.json']);
  assert.equal(plan.unknown.length, 1);
  assert.equal(plan.unknown[0], 'data/places/workflow/not_registered_yet.json');
});

test('strongest mode wins for mixed changes', () => {
  const plan = classify([
    'docs/PLACE_PRODUCTION_CHECKLIST.md',
    'data/places/by/oslo/places/torggata.json',
    'js/ui/place-card.js',
  ]);
  assert.equal(plan.mode, 'full-matrix');
});

test('checklist prose is owned by lightweight V3 governance, not heavy workflows', () => {
  const dataChecks = fs.readFileSync('.github/workflows/data-checks.yml', 'utf8');
  const visual = fs.readFileSync('.github/workflows/place-rounds-governance.yml', 'utf8');
  const v3 = fs.readFileSync('.github/workflows/place-production-v3.yml', 'utf8');
  assert.equal(dataChecks.includes("- 'docs/PLACE_PRODUCTION_CHECKLIST.md'"), false);
  assert.equal(visual.includes('- "docs/PLACE_PRODUCTION_CHECKLIST.md"'), false);
  assert.equal(v3.includes("- 'docs/PLACE_PRODUCTION_CHECKLIST.md'"), true);
});

test('V2 registry is the only active full-matrix routing owner', () => {
  assert.equal(registry.governanceOnlyPaths.includes('docs/PLACE_PRODUCTION_CHECKLIST.md'), true);
  assert.equal(registry.fullMatrixPaths.includes('docs/PLACE_PRODUCTION_CHECKLIST.md'), false);
  const v3Workflow = fs.readFileSync('.github/workflows/place-production-v3.yml', 'utf8');
  for (const required of [
    '.github/ci/place-production-routing-v2.json',
    'scripts/place-production-routing-v2-lib.mjs',
    'scripts/place-production-routing-v2.mjs',
  ]) {
    assert.equal(v3Workflow.includes(required), true, `missing V3 workflow trigger: ${required}`);
  }
});
