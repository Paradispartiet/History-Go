import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

import {
  loadWorkflowRecord,
  placeDerivedArtifactPlan,
  placeVerifyOnlySteps,
} from '../scripts/place-production-v3-lib.mjs';
import { checkPlaceTranslationFreshness } from '../scripts/check-place-i18n-freshness.mjs';

test('Place v3 derived artifact plan preserves dependency order', () => {
  const record = {
    place_id: 'example_place',
    modules: {
      quiz: {
        status: 'PASS',
        refs: [
          'data/quiz/example/example_place_sets.json',
          'data/quiz/production_context/example/example_place.json',
        ],
      },
    },
  };

  const plan = placeDerivedArtifactPlan(record);
  assert.deepEqual(plan.map((step) => step.id), [
    'places-index',
    'place-open',
    'quiz-production-context',
    'epoke-place-index',
    'v3-projections',
  ]);

  const quiz = plan.find((step) => step.id === 'quiz-production-context');
  assert.deepEqual(quiz.build, [
    'node',
    [
      'scripts/build-quiz-production-context.mjs',
      '--category', 'example',
      '--target', 'example_place',
      '--output', 'data/quiz/production_context/example/example_place.json',
    ],
  ]);
  assert.deepEqual(quiz.verify[1].slice(-1), ['--check']);
  assert.ok(plan.findIndex((step) => step.id === 'place-open') < plan.findIndex((step) => step.id === 'epoke-place-index'));
});

test('Place v3 only schedules quiz context when the workflow owns one', () => {
  const plan = placeDerivedArtifactPlan({
    place_id: 'example_place',
    modules: { quiz: { status: 'PASS', refs: ['data/quiz/example/example_place_sets.json'] } },
  });
  assert.equal(plan.some((step) => step.id === 'quiz-production-context'), false);
  assert.equal(plan.some((step) => step.id === 'epoke-place-index'), true);
});

test('Place v3 verify always checks existing translation freshness', () => {
  assert.deepEqual(placeVerifyOnlySteps({ place_id: 'example_place' }), [
    {
      id: 'i18n-freshness',
      verify: ['node', ['scripts/check-place-i18n-freshness.mjs', 'example_place']],
    },
  ]);
});

test('Klassekampen exercises the quiz-context branch and is currently synchronized', () => {
  const record = loadWorkflowRecord('klassekampen_redaksjon');
  const plan = placeDerivedArtifactPlan(record);
  assert.equal(plan.some((step) => step.id === 'quiz-production-context'), true);

  const i18n = checkPlaceTranslationFreshness('klassekampen_redaksjon');
  assert.deepEqual(i18n.errors, []);
  assert.deepEqual(i18n.checked.sort(), ['en', 'es', 'pt']);

  execFileSync(process.execPath, [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'media',
    '--target', 'klassekampen_redaksjon',
    '--output', 'data/quiz/production_context/media/klassekampen_redaksjon.json',
    '--check',
  ], { stdio: 'inherit' });
});
