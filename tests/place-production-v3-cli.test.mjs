import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { placeDerivedArtifactPlan, validateWorkflowRecord } from '../scripts/place-production-v3-lib.mjs';

function run(...args) {
  return spawnSync(process.execPath, ['scripts/place-production-v3.mjs', ...args], {
    encoding: 'utf8',
  });
}

test('plan prints deterministic Akershus slott summary', () => {
  const result = run('plan', 'akershus_slott');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Place: akershus_slott$/m);
  assert.match(result.stdout, /^Profile: major \(confirmed\)$/m);
  assert.match(result.stdout, /^State: complete$/m);
  assert.match(result.stdout, /^Collections: people, objects, brands, productions$/m);
  assert.match(result.stdout, /^Blocked: none$/m);
  assert.match(result.stdout, /^Factuality: data\/places\/production\/akershus_slott\.json$/m);
});

test('derived build steps are explicit argument arrays, never shell strings', () => {
  const steps = placeDerivedArtifactPlan({ place_id: 'fixture_place', modules: {} });
  assert.deepEqual(steps.map((step) => step.id), [
    'places-index',
    'place-open',
    'fagverk-release',
    'epoke-place-index',
    'v3-projections',
  ]);
  for (const step of steps) {
    assert.equal(Array.isArray(step.build), true);
    assert.equal(typeof step.build[0], 'string');
    assert.equal(Array.isArray(step.build[1]), true);
    assert.equal(Array.isArray(step.verify), true);
    assert.equal(typeof step.verify[0], 'string');
    assert.equal(Array.isArray(step.verify[1]), true);
  }
});

test('validator rejects a complete claim with a BLOCKED decision', () => {
  const contracts = { place_production: 'v3', place_card_collections: 'v2', quiz_production: 'canonical-v1' };
  const record = {
    schema: 'history_go_place_production_workflow_v3',
    place_id: 'blocked_fixture',
    category: 'historie',
    contracts,
    sources: { factuality_record: 'data/places/production/blocked_fixture.json' },
    read_first: {
      schema: 'history_go_place_read_first_v3',
      status: 'PASS',
      recorded_at: '2026-09-16T12:30:00Z',
      rule_files: ['fixture-rule.md'],
      contracts,
      attestation: 'Fixture rules were read before production decisions were recorded.',
    },
    profile: { id: 'standard', status: 'confirmed', reason: 'Fixture.' },
    source_review: { status: 'complete' },
    collections: { people: { status: 'BLOCKED', reason: 'Missing evidence.' } },
    modules: {},
    blockers: [],
    manual_reviews: { images: { status: 'PASS' }, final_ui: { status: 'PASS' } },
    state: 'complete',
  };
  assert.equal(validateWorkflowRecord(record).ok, false);
});
