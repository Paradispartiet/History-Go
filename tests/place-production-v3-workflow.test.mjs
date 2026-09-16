import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateWorkflowRecord,
  deriveSelectedCollections,
  deriveWorkflowState,
} from '../scripts/place-production-v3-lib.mjs';

const complete = {
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

test('derives only PASS collections', () => {
  assert.deepEqual(deriveSelectedCollections(complete), ['people', 'historical_events']);
});

test('complete record validates and derives complete', () => {
  assert.equal(validateWorkflowRecord(complete).ok, true);
  assert.equal(deriveWorkflowState(complete), 'complete');
});

test('BLOCKED fails closed', () => {
  const record = structuredClone(complete);
  record.collections.brands = { status: 'BLOCKED', reason: 'Asset missing.' };
  record.state = 'blocked';
  assert.equal(deriveWorkflowState(record), 'blocked');
  assert.equal(validateWorkflowRecord(record).ok, true);
});

test('rich is not a production profile', () => {
  const record = structuredClone(complete);
  record.profile.id = 'rich';
  assert.equal(validateWorkflowRecord(record).ok, false);
});

test('BEGRUNNET_NA and BLOCKED require reasons', () => {
  const record = structuredClone(complete);
  record.collections.objects = { status: 'BEGRUNNET_NA' };
  assert.equal(validateWorkflowRecord(record).ok, false);
});

test('a false complete claim is invalid', () => {
  const record = structuredClone(complete);
  record.manual_reviews.images.status = 'PENDING';
  assert.equal(validateWorkflowRecord(record).ok, false);
});
