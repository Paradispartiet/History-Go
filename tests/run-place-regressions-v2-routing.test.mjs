import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPlaceRegressionPlan } from '../scripts/run-place-regressions-v1.mjs';

const docs = ['docs/PLACE_PRODUCTION_CHECKLIST.md'];
const torggata = ['data/places/by/oslo/places/torggata.json'];
const runtime = ['js/ui/place-card.js'];
const unknown = ['data/places/workflow/not_registered_yet.json'];

test('docs-only change selects no Place-specific regressions', () => {
  const plan = selectPlaceRegressionPlan(docs);
  assert.equal(plan.mode, 'governance-only');
  assert.deepEqual(plan.tests, []);
});

test('Torggata-specific change selects Torggata tests only', () => {
  const plan = selectPlaceRegressionPlan(torggata);
  assert.deepEqual(plan.places, ['torggata']);
  assert.ok(plan.tests.length > 0);
  assert.ok(plan.tests.every((value) => value.includes('torggata')));
});

test('shared runtime selects all registered Place tests', () => {
  const plan = selectPlaceRegressionPlan(runtime);
  assert.equal(plan.mode, 'full-matrix');
  assert.ok(plan.places.length >= 9);
});

test('unknown V3 workflow path remains fail-closed', () => {
  const plan = selectPlaceRegressionPlan(unknown);
  assert.deepEqual(plan.unknown, unknown);
});
