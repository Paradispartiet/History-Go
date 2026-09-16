import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  deriveSelectedCollections,
  deriveWorkflowState,
  loadWorkflowRecord,
} from '../scripts/place-production-v3-lib.mjs';

const PLACE_ID = 'norges_bank_bankplassen_4';

test('Norges Bank Bankplassen 4 is a complete Place Production v3 workflow', () => {
  const record = loadWorkflowRecord(PLACE_ID);

  assert.equal(record.schema, 'history_go_place_production_workflow_v3');
  assert.equal(record.place_id, PLACE_ID);
  assert.equal(record.category, 'naeringsliv');
  assert.deepEqual(record.contracts, {
    place_production: 'v3',
    place_card_collections: 'v2',
    quiz_production: 'canonical-v1',
  });

  assert.equal(record.profile.id, 'standard');
  assert.equal(record.profile.status, 'confirmed');
  assert.equal(record.source_review.status, 'complete');
  assert.deepEqual(deriveSelectedCollections(record).sort(), [
    'brands',
    'objects',
    'people',
    'productions',
  ]);

  for (const collection of ['people', 'objects', 'brands', 'productions']) {
    assert.equal(record.collections[collection]?.status, 'PASS', `${collection} must be PASS`);
  }

  for (const module of ['fagverk', 'quiz', 'chronology', 'reading_tracks', 'language', 'stories', 'runtime']) {
    assert.equal(record.modules[module]?.status, 'PASS', `${module} must be PASS`);
  }
  assert.equal(record.modules.news?.status, 'BEGRUNNET_NA');
  assert.equal(record.modules.before_after?.status, 'BEGRUNNET_NA');

  assert.deepEqual(record.blockers, []);
  assert.equal(record.manual_reviews.images.status, 'PASS');
  assert.equal(record.manual_reviews.final_ui.status, 'PASS');
  assert.equal(deriveWorkflowState(record), 'complete');
  assert.equal(record.state, 'complete');

  const factuality = path.resolve(record.sources.factuality_record);
  assert.equal(fs.existsSync(factuality), true, `missing factuality record: ${record.sources.factuality_record}`);
});
