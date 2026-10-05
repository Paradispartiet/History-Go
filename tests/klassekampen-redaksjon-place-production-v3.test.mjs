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
const IMAGE_AUDIT_PATH = 'reports/place-production/klassekampen-image-asset-audit-v1.md';
const PLACE_PATH = 'data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json';
const QUIZ_PATH = 'data/quiz/media/klassekampen_redaksjon_sets.json';
const SOURCE_BRIEF_PATH = 'data/quiz/production_briefs/media/klassekampen_redaksjon.json';
const CONTEXT_PATH = 'data/quiz/production_context/media/klassekampen_redaksjon.json';
const QUIZCARD_MANIFEST_PATH = 'data/quizcards/media/manifest.json';
const QUIZCARD_COLLECTION_PATH = 'data/quizcards/media/klassekampen_redaksjon_quizkort_v1.json';
const PEOPLE_ID = 'bjorgulv_braanen';
const PEOPLE_IMAGE = 'bilder/people/bjorgulv_braanen.jpg';
const PEOPLE_IMAGE_SOURCE = 'https://commons.wikimedia.org/wiki/File:Bj%C3%B8rgulv_Braanen_(174850).jpg';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

test('Klassekampen-redaksjonen is registered in Place Production v3 routing', () => {
  const routing = readJson('.github/ci/place-production-routing-v2.json');
  const entry = routing.places.find((candidate) => candidate.id === PLACE_ID);
  assert.ok(entry, `${PLACE_ID} must be registered in Place Production v3 routing`);
  assert.deepEqual(entry.match, ['klassekampen_redaksjon', 'klassekampen-redaksjon']);
  assert.deepEqual(entry.gates, ['places', 'place-production-v3']);
  assert.deepEqual(entry.tests, [TEST_PATH]);
});

test('Media is upgraded to the governed adaptive quiz-production contract for its first pilot', () => {
  const manifest = readJson('data/fag/fag_manifest.json');
  const media = manifest.media;
  assert.ok(media, 'missing Media fag manifest entry');
  assert.equal(media.quizPackageSchema, '../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json');
  assert.equal(media.quizProduction?.status, 'pilot');
  assert.deepEqual(media.quizProduction?.required_inputs, [
    'pensum',
    'emner',
    'fagkart',
    'methods',
    'supersetQuizMal',
    'quizStandard',
    'quizQuestionSchema',
  ]);
  assert.equal(media.quizProduction?.context_builder, 'scripts/build-quiz-production-context.mjs');
  assert.equal(media.quizProduction?.profile_system, 'adaptive_relative_superset');

  const superset = readJson('data/fag/media/supersetQUIZMAL_media.json');
  assert.equal(superset.version, '3.0');
  assert.equal(superset.governance?.authority, 'category_content_and_orchestration');
  assert.equal(superset.governance?.package_schema, 'data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json');
  assert.equal(superset.adaptive_profiles?.normal?.sets, 4);
  assert.equal(superset.adaptive_profiles?.normal?.questions_per_set, 7);
  assert.deepEqual(superset.relative_progression?.phase_sequences?.['4'], ['opening', 'middle', 'bridge', 'final']);
});

test('Klassekampen Phase 1 evidence remains intact while Phase 2 collections, quiz and runtime are materialized', () => {
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

  assert.deepEqual(deriveSelectedCollections(record), ['people', 'objects', 'brands', 'productions']);
  for (const collection of ['people', 'objects', 'brands', 'productions']) {
    assert.equal(record.collections[collection]?.status, 'PASS', `${collection} must be canonical before Phase 2 can pass`);
  }

  for (const module of ['fagverk', 'chronology', 'language', 'quiz', 'runtime']) {
    assert.equal(record.modules[module]?.status, 'PASS', `${module} must pass in the materialized Phase 2 contract`);
  }
  assert.equal(record.manual_reviews.images.status, 'PASS');
  assert.ok(record.manual_reviews.images.evidence?.includes(IMAGE_AUDIT_PATH));
  assert.equal(fs.existsSync(IMAGE_AUDIT_PATH), true, `missing image asset audit: ${IMAGE_AUDIT_PATH}`);

  // Story, before/after and final UI retain their own governance gates. This test
  // intentionally does not force the overall workflow to complete before those reviews.
  assert.notEqual(deriveWorkflowState(record), 'complete');
});

test('Klassekampen canonical Place carries the source-reviewed Media underbadges, Fagverk, reviewed image contract and four Phase 2 collections', () => {
  const place = readJson(PLACE_PATH);
  assert.deepEqual(place.underbadge_ids, [
    'aviser',
    'nettaviser',
    'journalistikk',
    'mediehus_og_redaksjoner',
  ]);
  assert.equal(place.production_profile, 'standard');
  assert.equal(place.profile_status, 'confirmed');
  assert.equal(place.production_status, 'complete');
  assert.equal(place.fagverk?.schema, 'history_go_place_fagverk_v2');
  assert.equal(place.fagverk?.status, 'curated');
  assert.ok(Array.isArray(place.knowledge?.sources) && place.knowledge.sources.length >= 5);

  assert.equal(place.image, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Groenland%204%20Oslo.jpg');
  assert.equal(place.imageMeta?.fileTitle, 'File:Groenland 4 Oslo.jpg');
  assert.equal(place.imageMeta?.author, 'Mahlum');
  assert.equal(place.imageMeta?.licenseShortName, 'Public domain');
  assert.equal(place.imageMeta?.verifiedAt, '2026-10-04');
  assert.equal(place.frontImage, 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Steplagaarden_gr%C3%B6nland_4_oslo_rk_163836_IMG_8308.JPG');
  assert.equal(place.frontImageMeta?.author, 'Bjoertvedt');
  assert.equal(place.frontImageMeta?.license, 'CC BY-SA 3.0 NO');

  assert.equal(place.place_card_profile?.schema, 'history_go_place_card_profile_v2');
  assert.deepEqual(place.place_card_profile?.collection_ids, ['people', 'objects', 'brands', 'productions']);
  assert.deepEqual(place.rounds, ['people', 'objects', 'brands', 'productions']);
  assert.ok(place.related_people_ids?.includes(PEOPLE_ID));
  assert.ok(place.objects?.some((item) => item.id === 'klassekampen_forste_utgave_1969'));
  assert.deepEqual(
    place.productions?.map((item) => item.id).sort(),
    [
      'klassekampen_avis',
      'klassekampen_bokmagasinet',
      'klassekampen_eavis',
      'klassekampen_musikkmagasinet',
    ].sort(),
  );
});

test('Klassekampen brand and person bindings are explicit and image provenance is present', () => {
  const brandsByPlace = readJson('data/brands/brands_by_place.json');
  assert.deepEqual(brandsByPlace[PLACE_ID], ['klassekampen']);

  const brandsMaster = readJson('data/brands/brands_master.json');
  const brand = brandsMaster.find((item) => item.id === 'klassekampen');
  assert.ok(brand, 'missing canonical Klassekampen brand');
  assert.ok(brand.place_ids?.includes(PLACE_ID));
  assert.ok(brand.source_urls?.length >= 1);

  const people = readJson('data/people/media/oslo/people_media_oslo.json');
  const person = people.find((candidate) => candidate.id === PEOPLE_ID);
  assert.ok(person, 'missing Bjørgulv Braanen canonical person');
  assert.ok(person.places?.includes(PLACE_ID));
  assert.equal(person.image, PEOPLE_IMAGE);
  assert.equal(fs.existsSync(PEOPLE_IMAGE), true, `missing documentary person image: ${PEOPLE_IMAGE}`);

  const attributions = readJson('data/people/people_image_attributions.json');
  const attribution = attributions.find((item) => item.personId === PEOPLE_ID);
  assert.ok(attribution, 'Bjørgulv Braanen image must have explicit provenance before People can pass');
  assert.equal(attribution.file, PEOPLE_IMAGE);
  assert.equal(attribution.sourcePage, PEOPLE_IMAGE_SOURCE);
  assert.equal(attribution.license, 'CC BY-SA 4.0');
});

test('Klassekampen is registered as a canonical Media quiz target with a 4x7 package', () => {
  const manifest = readJson('data/fag/fag_manifest.json');
  const target = manifest.media?.quizProduction?.targets?.[PLACE_ID];
  assert.ok(target, 'Klassekampen must be registered under media.quizProduction.targets');
  assert.equal(target.source_brief, '../quiz/production_briefs/media/klassekampen_redaksjon.json');
  assert.equal(target.context_artifact, '../quiz/production_context/media/klassekampen_redaksjon.json');
  assert.equal(target.quiz_file, '../quiz/media/klassekampen_redaksjon_sets.json');

  assert.equal(fs.existsSync(SOURCE_BRIEF_PATH), true, `missing source brief: ${SOURCE_BRIEF_PATH}`);
  assert.equal(fs.existsSync(CONTEXT_PATH), true, `missing production context: ${CONTEXT_PATH}`);
  assert.equal(fs.existsSync(QUIZ_PATH), true, `missing quiz package: ${QUIZ_PATH}`);

  const quiz = readJson(QUIZ_PATH);
  const sets = Array.isArray(quiz.sets) ? quiz.sets : [];
  assert.equal(sets.length, 4, 'Klassekampen must have four quiz sets');
  for (const set of sets) {
    assert.equal(set.questions?.length, 7, 'each Klassekampen quiz set must have seven questions');
  }
  assert.equal(sets.flatMap((set) => set.questions || []).length, 28);
});

test('Klassekampen QuizCard is discoverable through the shared Media manifest loader', () => {
  const quizCardManifest = readJson(QUIZCARD_MANIFEST_PATH);
  assert.equal(quizCardManifest.categoryId, 'media');
  assert.ok(quizCardManifest.collections?.includes('klassekampen_redaksjon_quizkort_v1.json'));

  const collection = readJson(QUIZCARD_COLLECTION_PATH);
  const card = collection.cards?.find((candidate) => candidate.targetId === PLACE_ID);
  assert.ok(card, 'Media QuizCard collection must bind Klassekampen by targetId');
  assert.equal(card.sourceFile, QUIZ_PATH);
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions?.length, 10);

  const loader = fs.readFileSync('js/ui/placeQuizCards.ts', 'utf8');
  assert.match(loader, /"media\/manifest\.json"/);
});

test('Klassekampen factuality and language records retain the verified Phase 1 boundary', () => {
  const factuality = readJson('data/places/production/klassekampen_redaksjon.json');
  assert.equal(factuality.placeId, PLACE_ID);
  assert.equal(factuality.status, 'ready_v4_2');
  assert.equal(factuality.identity?.status, 'resolved');

  const language = readJson('data/leksikon/sprak/places/europe/norway/oslo/klassekampen_redaksjon.json');
  assert.equal(language.place_id, PLACE_ID);
  assert.equal(language.subject_id, 'media');
  assert.equal(language.entries?.[0]?.term, 'Klassekampen');

  assert.equal(fs.existsSync('reports/place-production/klassekampen-source-review-v1.md'), true);
});


test('Klassekampen-related people never point at missing local image assets', () => {
  const people = readJson('data/people/media/oslo/people_media_oslo.json');
  const relatedPeople = people.filter((person) =>
    person.placeId === PLACE_ID || person.places?.includes(PLACE_ID)
  );
  assert.ok(relatedPeople.length >= 2, 'expected canonical Klassekampen people');

  for (const person of relatedPeople) {
    for (const field of ['image', 'cardImage']) {
      const imagePath = String(person[field] || '').trim();
      if (!imagePath || /^https?:\/\//.test(imagePath)) continue;
      assert.equal(
        fs.existsSync(imagePath),
        true,
        `${person.id}.${field} points to a missing local asset: ${imagePath}`
      );
    }
  }
});
