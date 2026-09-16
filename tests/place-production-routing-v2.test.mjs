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
