#!/usr/bin/env node
/**
 * A single, read-only integration handoff for six Oslo place candidates.
 *
 * This file deliberately does not write to data/places, the quiz manifest,
 * QuizCard runtime collections, Knowledge or Fagverk registry.
 * Source review and geographic qualification are prerequisites for those writes.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixFullquizReview } from './build-oslo-six-fullquiz-review.mjs';
import { buildOsloSixRemainingFullquizReview } from './build-oslo-six-remaining-fullquiz-review.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
const fail = reason => { throw new Error('Oslo six integration preview: ' + reason); };
const norm = s => String(s).normalize('NFKC').trim().toLowerCase();

export function buildOsloSixIntegrationPreview({
  gates = load('reports/place-production/oslo-six-places-integration-gates-20261022.json'),
  geo = load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json'),
  fagverk = load('reports/place-production/oslo-six-fagverk-preintegration-20261022.json'),
  linderud = load('reports/place-production/linderud-gard-quiz-preintegration-20261022.json')
} = {}) {
  const first = buildOsloSixFullquizReview();
  const remaining = buildOsloSixRemainingFullquizReview();
  const candidates = [linderud, ...first.places, ...remaining.places];
  const byId = new Map(candidates.map(p => [p.place_id, p]));
  const fagverkById = new Map(fagverk.places.map(p => [p.place_id, p]));
  const geoById = new Map(geo.places.map(p => [p.place_id, p]));
  const expectedCount = new Map([['linderud_gard', 28]]);
  const uniqueIds = (rows, label) => {
    if (new Set(rows.map(p => p.place_id)).size !== rows.length) fail(label + ': duplicate place IDs');
  };

  if (gates.safeguards.active_places !== 0 || gates.safeguards.v1_certified !== 0 ||
      gates.places.length !== 6 || candidates.length !== 6 ||
      fagverk.places.length !== 6 || geo.places.length !== 6)
    fail('six distinct, unpublished candidates are required');
  if (fagverk.status !== 'STAGING_ONLY_NOT_IN_REGISTRY' ||
      geo.release_status !== 'RESEARCH_ONLY_NO_COORDINATES_OR_PINS')
    fail('Fagverk or geography unexpectedly activated');
  uniqueIds(candidates, 'quiz'); uniqueIds(fagverk.places, 'Fagverk'); uniqueIds(geo.places, 'geography');

  const allQuestionIds = new Set();
  const places = gates.places.map(gate => {
    const id = gate.place_id;
    const quiz = byId.get(id), page = fagverkById.get(id), anchor = geoById.get(id);
    if (!quiz || !page || !anchor || page.categoryId !== gate.category_candidate)
      fail(id + ': canonical identity/category mismatch');
    if (gate.release_status !== 'BLOCKED' ||
        !Object.values(gate.publication_gates).every(v => v === false) ||
        gate.geographical_anchor.status !== 'HOLD' ||
        gate.geographical_anchor.lat !== null ||
        gate.geographical_anchor.lon !== null || gate.geographical_anchor.radius_m !== null)
      fail(id + ': publication or geographic hold removed prematurely');
    if (!['HOLD', 'HARD_HOLD'].includes(anchor.coordinate_status) ||
        anchor.coordinate !== null || anchor.radius_m !== null ||
        anchor.place_id !== id)
      fail(id + ': coordinate and access audit is not fail-closed');
    if (id === 'kristiania_teglverk_bryn' &&
        (anchor.coordinate_status !== 'HARD_HOLD' || anchor.address_source_status !== 'conflicting_14_18'))
      fail('teglverk address 14/18 conflict must remain a hard HOLD');
    if (page.canonical_place_bound !== false || page.fagverk_registry_registered !== false ||
        page.fagverk_browser_qa_passed !== false ||
        page.source_claim_review !== 'pending_independent_line_by_line' ||
        page.fagverk.schema !== 'history_go_place_fagverk_v2')
      fail(id + ': staged Fagverk was mistaken for active content');

    const expected = expectedCount.get(id) || 21;
    const expectedSets = id === 'linderud_gard' ? 4 : 3;
    if (quiz.sets.length !== expectedSets ||
        quiz.sets.some(set => set.questions.length !== 7))
      fail(id + ': incorrect 7-question fullquiz profile');
    const originalQuestions = quiz.sets.flatMap(set => set.questions);
    if (originalQuestions.length !== expected) fail(id + ': unexpected question count');

    const questions = originalQuestions.map((q, index) => {
      if (!q.id || allQuestionIds.has(q.id) || q.targetId !== id ||
          q.categoryId !== gate.category_candidate ||
          !q.question?.trim() || !q.knowledge?.trim() ||
          !Array.isArray(q.options) || q.options.length !== 4 ||
          new Set(q.options.map(norm)).size !== 4 ||
          q.answerIndex < 0 || q.answerIndex > 3 ||
          q.options[q.answerIndex] !== q.answer ||
          q.runtime_registered === true)
        fail(id + ': invalid or prematurely active question at ' + (index + 1));
      allQuestionIds.add(q.id);
      const sourceUrls = id === 'linderud_gard'
        ? (q.source || []).map(key => linderud.sources[key])
        : [q.source_url];
      if (!sourceUrls.length || sourceUrls.some(url => typeof url !== 'string' || !url.startsWith('https://')))
        fail(id + ': untraceable source URL for ' + q.id);
      const review = q.review_status || q.external_claim_review || q.source_review;
      if (!review || !/pending|candidate/i.test(review))
        fail(id + ': unverified source question marked approved: ' + q.id);
      return {
        id: q.id, targetId: id, categoryId: gate.category_candidate,
        question: q.question, options: q.options, answer: q.answer,
        answerIndex: q.answerIndex, knowledge: q.knowledge,
        source_urls: sourceUrls, source_review_status: review,
        claim_id: q.claim_id || null,
        claim_basis: q.claim_basis || null,
        needs_independent_claim_review: true,
        // All Frognerseteren questions now describe the main restaurant, not
        // adjacent villas, Sportshallen, Skimuseet or the railway station.
        // Independent claim-level approval is still required before release.
        adjacent_building_scope_hold: false,
        runtime_registered: false
      };
    });
    const selected = quiz.quizcard_selection || quiz.quizcard_question_ids;
    if (selected.length !== 10 || new Set(selected).size !== 10)
      fail(id + ': QuizCard must select 10 unique fullquiz IDs');
    const questionById = new Map(questions.map(q => [q.id, q]));
    const card = selected.map((questionId, index) => {
      const question = questionById.get(questionId);
      if (!question) fail(id + ': QuizCard does not belong to fullquiz: ' + questionId);
      return {
        number: index + 1, sourceQuestionId: question.id,
        question: question.question, options: question.options,
        answer: question.answer, answerIndex: question.answerIndex,
        knowledge: question.knowledge,
        source_urls: question.source_urls,
        needs_independent_claim_review: true,
        runtime_registered: false
      };
    });
    return {
      place_id: id, name: gate.name, categoryId: gate.category_candidate,
      public_release: false, canonical_place_registered: false,
      geo_status: anchor.coordinate_status, access_status: anchor.entrance_status,
      v1_status: 'BLOCKED',
      proposed_quiz_profile: expectedSets === 4 ? 'normal_4x7_UNCONFIRMED' : 'narrow_3x7_UNCONFIRMED',
      fullquiz_preview: questions, quizcard_preview: card,
      fagverk_preview: page.fagverk,
      fagverk_registered: false, knowledge_synced: false,
      images_integrated: false, browser_qa_passed: false
    };
  });
  const questionCount = places.reduce((n, p) => n + p.fullquiz_preview.length, 0);
  const cardCount = places.reduce((n, p) => n + p.quizcard_preview.length, 0);
  if (questionCount !== 133 || cardCount !== 60 || allQuestionIds.size !== 133)
    fail('133 candidate questions and 60 QuizCard selections required');
  return {
    schema: 'history_go_oslo_six_integration_preview_v1',
    publication_status: 'BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES',
    place_count: 6, fullquiz_candidate_count: questionCount,
    quizcard_candidate_count: cardCount, fagverk_candidate_count: places.length,
    requirements_before_activation: [
      'source_to_claim_line_review', 'semantic_duplicate_and_question_scope_review',
      'validated_visitor_coordinates_and_safe_radius', 'place_rule_preflight',
      'licensed_image_and_three_crops', 'canonical_place_and_fagverk_registry',
      'quiz_and_quizcard_manifest', 'knowledge_sync', 'mobile_and_desktop_browser_qa'
    ],
    places
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const preview = buildOsloSixIntegrationPreview();
    if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(preview, null, 2) + '\n');
    else console.log('Oslo six preview: ' + preview.fullquiz_candidate_count +
      ' fullquiz and ' + preview.quizcard_candidate_count +
      ' QuizCard candidates, six Fagverk previews, 0 runtime registrations');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
