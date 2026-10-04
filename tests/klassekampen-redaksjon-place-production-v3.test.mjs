import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  deriveSelectedCollections,
  deriveWorkflowState,
  loadWorkflowRecord,
} from '../scripts/place-production-v3-lib.mjs';

const PLACE_ID = 'klassekampen_redaksjon';
const TEST_PATH = 'tests/klassekampen-redaksjon-place-production-v3.test.mjs';

test('Klassekampen-redaksjonen is registered in Place Production v3 routing', () => {
  const routing = JSON.parse(fs.readFileSync('.github/ci/place-production-routing-v2.json', 'utf8'));
  const entry = routing.places.find((candidate) => candidate.id === PLACE_ID);
  assert.ok(entry, `${PLACE_ID} must be registered in Place Production v3 routing`);
  assert.deepEqual(entry.match, ['klassekampen_redaksjon', 'klassekampen-redaksjon']);
  assert.deepEqual(entry.gates, ['places', 'place-production-v3']);
  assert.deepEqual(entry.tests, [TEST_PATH]);
});

test('Klassekampen Phase 1 is preserved fail-closed in Place Production v3', () => {
  const record = loadWorkflowRecord(PLACE_ID);

  assert.equal(record.schema, 'history_go_place_production_workflow_v3');
  assert.equal(record.place_id, PLACE_ID);
  assert.equal(record.category, 'media');
  assert.deepEqual(record.contracts, {
    place_production: 'v3',
    place_card_collections: 'v2',
    quiz_production: 'canonical-v1',
  });
  assert.equal(record.profile.id, 'standard');
  assert.equal(record.profile.status, 'confirmed');
  assert.equal(record.source_review.status, 'complete');

  assert.deepEqual(deriveSelectedCollections(record), []);
  for (const collection of ['people', 'objects', 'brands', 'productions']) {
    assert.equal(record.collections[collection]?.status, 'BLOCKED', `${collection} must remain BLOCKED until Phase 2 is canonical`);
  }

  for (const module of ['fagverk', 'chronology', 'language']) {
    assert.equal(record.modules[module]?.status, 'PASS', `${module} Phase 1 evidence must be preserved`);
  }
  assert.equal(record.modules.quiz?.status, 'BLOCKED');
  assert.equal(record.modules.runtime?.status, 'BLOCKED');
  assert.equal(record.manual_reviews.images.status, 'PENDING');
  assert.equal(record.manual_reviews.final_ui.status, 'PENDING');
  assert.ok(record.blockers.length >= 2);
  assert.equal(deriveWorkflowState(record), 'blocked');
  assert.equal(record.state, 'blocked');

  assert.equal(fs.existsSync(record.sources.factuality_record), true, `missing factuality record: ${record.sources.factuality_record}`);
});

test('Klassekampen canonical Place carries the source-reviewed Media underbadges and Fagverk', () => {
  const placePath = 'data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json';
  const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
  assert.deepEqual(place.underbadge_ids, [
    'aviser',
    'nettaviser',
    'journalistikk',
    'mediehus_og_redaksjoner',
  ]);
  assert.equal(place.production_profile, 'standard');
  assert.equal(place.profile_status, 'confirmed');
  assert.equal(place.fagverk?.schema, 'history_go_place_fagverk_v2');
  assert.equal(place.fagverk?.status, 'curated');
  assert.ok(Array.isArray(place.knowledge?.sources) && place.knowledge.sources.length >= 5);
});

test('Klassekampen factuality and language records retain the verified Phase 1 boundary', () => {
  const factuality = JSON.parse(fs.readFileSync('data/places/production/klassekampen_redaksjon.json', 'utf8'));
  assert.equal(factuality.placeId, PLACE_ID);
  assert.equal(factuality.status, 'ready_v4_2');
  assert.equal(factuality.identity?.status, 'resolved');

  const language = JSON.parse(fs.readFileSync('data/leksikon/sprak/places/europe/norway/oslo/klassekampen_redaksjon.json', 'utf8'));
  assert.equal(language.place_id, PLACE_ID);
  assert.equal(language.subject_id, 'media');
  assert.equal(language.entries?.[0]?.term, 'Klassekampen');

  assert.equal(fs.existsSync('reports/place-production/klassekampen-source-review-v1.md'), true);
});
