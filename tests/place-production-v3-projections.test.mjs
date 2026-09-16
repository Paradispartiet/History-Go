import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderWorkcardProjection,
  renderQualityGateProjection,
  stableJson,
} from '../scripts/place-production-v3-lib.mjs';

const record = {
  schema: 'history_go_place_production_workflow_v3',
  place_id: 'example_place',
  category: 'historie',
  contracts: {
    place_production: 'v3',
    place_card_collections: 'v2',
    quiz_production: 'canonical-v1',
  },
  sources: { factuality_record: 'data/places/production/example_place.json' },
  profile: { id: 'standard', status: 'confirmed', reason: 'Source-backed.' },
  source_review: { status: 'complete' },
  collections: {
    people: { status: 'PASS' },
    objects: { status: 'BEGRUNNET_NA', reason: 'No qualifying object.' },
    historical_events: { status: 'PASS' },
  },
  modules: {},
  blockers: [],
  manual_reviews: {
    images: { status: 'PASS' },
    final_ui: { status: 'PASS' },
  },
  state: 'complete',
};

test('renders generated workcard projection without legacy preflight snapshot', () => {
  const workcard = renderWorkcardProjection(record);
  assert.equal(workcard.generated, true);
  assert.equal(workcard.source, 'data/places/workflow/example_place.json');
  assert.deepEqual(workcard.selected_collections, ['people', 'historical_events']);
  assert.equal(workcard.profile.id, 'standard');
  assert.equal('rule_preflight' in workcard, false);
});

test('renders quality gate from derived workflow state', () => {
  const gate = renderQualityGateProjection(record);
  assert.equal(gate.generated, true);
  assert.equal(gate.derived_state, 'complete');
  assert.deepEqual(gate.blockers, []);
});

test('projection JSON is byte-stable', () => {
  const first = stableJson(renderWorkcardProjection(record));
  const second = stableJson(renderWorkcardProjection(structuredClone(record)));
  assert.equal(first, second);
  assert.ok(first.endsWith('\n'));
});
