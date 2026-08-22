import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const quizPath = 'data/quiz/historie/gamle_aker_kirke_sets.json';
const briefPath = 'data/quiz/production_briefs/historie/gamle_aker_kirke.json';
const contextPath = 'data/quiz/production_context/historie/gamle_aker_kirke.json';
const quiz = readJson(quizPath);
const brief = readJson(briefPath);
const context = readJson(contextPath);
const quizManifest = readJson('data/quiz/manifest.json');
const fagManifest = readJson('data/fag/fag_manifest.json');
const productionReport = readJson('data/places/historie-production/gamle_aker_kirke.json');
const knowledgeRegistry = readJson('data/knowledge/knowledge_units.generated.json');
const conceptRegistry = readJson('data/knowledge/concepts.generated.json');
const termRegistry = readJson('data/knowledge/terms.generated.json');
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');
const questions = quiz.sets.flatMap(set => set.questions);
const opening = quiz.sets.slice(0, 2).flatMap(set => set.questions);
const finalSet = quiz.sets[2].questions;
const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));

test('Gamle Aker løses til én reviewed 3 × 7-produksjonspakke', () => {
  const manifestEntries = quizManifest.sets.filter(entry => entry.targetId === 'gamle_aker_kirke');
  assert.deepEqual(manifestEntries, [{ targetId: 'gamle_aker_kirke', file: quizPath }]);
  assert.deepEqual(fagManifest.historie.quizProduction.targets.gamle_aker_kirke, {
    source_brief: '../quiz/production_briefs/historie/gamle_aker_kirke.json',
    context_artifact: '../quiz/production_context/historie/gamle_aker_kirke.json',
    quiz_file: '../quiz/historie/gamle_aker_kirke_sets.json'
  });
  assert.equal(brief.status, 'reviewed');
  assert.equal(context.source_review_status, 'reviewed');
  assert.equal(context.profile, 'narrow_3x7');
  assert.equal(quiz.production_context.profile, 'narrow_3x7');
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7]);
  assert.equal(questions.length, 21);
});

test('Kildegrunnlaget dokumenterer førtilstand, profilvalg og holdte påstander', () => {
  assert.equal(Object.keys(brief.sources).length, 7);
  assert.ok(Object.values(brief.sources).every(source => source.review_status === 'reviewed'));
  assert.ok(Object.values(brief.sources).every(source => /^https:\/\//.test(source.url)));
  assert.equal(brief.existing_quiz_audit.active_before.sets, 1);
  assert.equal(brief.existing_quiz_audit.active_before.questions, 5);
  assert.equal(brief.existing_quiz_audit.active_before.knowledge_units, 9);
  assert.equal(brief.profile_decision.profile, 'narrow');
  assert.equal(brief.profile_decision.set_count, 3);
  assert.equal(brief.claims.length, 21);
  assert.equal(new Set(brief.claims.map(claim => claim.claim_id)).size, 21);
  assert.deepEqual(brief.claims.map(claim => claim.order), Array.from({ length: 21 }, (_, index) => index + 1));
  assert.deepEqual(brief.held_back_candidates.map(item => item.candidate), [
    'En eldre trekirke på stedet',
    'Olav Kyrre som sikker grunnlegger',
    'Et førkristent tingsted ved kirken',
    'Thomas Blix-inventaret datert til ett sikkert år'
  ]);
});

test('Produksjonskonteksten viser full fagpakke og eksakt settplan', () => {
  assert.deepEqual(context.required_inputs_loaded, [
    'pensum',
    'emner',
    'fagkart',
    'methods',
    'supersetQuizMal',
    'quizStandard',
    'quizQuestionSchema'
  ]);
  assert.ok(Object.values(context.resolved_files).every(file => file.bytes > 0 && /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.deepEqual(context.set_plan.map(set => [set.order, set.phase, set.planned_questions]), [
    [1, 'opening', 7],
    [2, 'bridge', 7],
    [3, 'final', 7]
  ]);
  assert.deepEqual(context.question_balance.counts, { fact: 12, context: 5, concept_theory: 4 });
  assert.equal(context.source_files.target.path, 'data/places/historie/oslo/places_historie/gamle_aker_kirke.json');
  assert.ok(context.story_units.some(unit => unit.id === 'st_gamle_aker_kirke_dronning_maud_i_krypten'));
});

test('De første fjorten er vanlige spørsmål uten metode- eller teorispråk', () => {
  assert.equal(opening.length, 14);
  const forbiddenFields = ['method_id', 'topic_hook_id', 'thinker_id', 'theory_ref'];
  for (const question of opening) {
    assert.ok(['fact', 'context', 'observation', 'comparison', 'analysis'].includes(question.question_type));
    for (const field of forbiddenFields) assert.equal(Object.hasOwn(question, field), false, `${question.id}: ${field}`);
    assert.doesNotMatch(question.question, /fagplan|fagkart|metode|teori|teoretiker|History Go|mest presise faglige/i);
  }
  assert.deepEqual(opening.map(question => question.id), Array.from({ length: 14 }, (_, index) => `gamle_aker_kirke_quiz_${String(index + 1).padStart(2, '0')}`));
});

test('Alle spørsmål har gyldig claim, kilde, svar og læringsevidens', () => {
  const sourceIds = new Set(Object.keys(quiz.sources));
  const objectiveIds = new Set();
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, `${question.id}: ukjent claim`);
    assert.equal(question.claim_basis, claim.statement);
    assert.ok(question.source.length >= 1);
    assert.ok(question.source.every(sourceId => sourceIds.has(sourceId)));
    assert.ok(question.options.length >= 3 && question.options.length <= 4);
    assert.equal(new Set(question.options).size, question.options.length);
    assert.equal(question.answer, question.options[question.answerIndex]);
    assert.ok(question.knowledge.length >= 100);
    assert.match(question.learning_objective_id, /^lo_historie_gamle_aker_\d{2}$/);
    objectiveIds.add(question.learning_objective_id);
    assert.ok(['recognize', 'recall', 'explain', 'compare', 'connect', 'apply'].includes(question.evidence_type));
    assert.ok(question.feedback_basis.length >= 60);
  }
  assert.equal(objectiveIds.size, 21);
});

test('Sett 3 bærer kildekritikk, metode og fire inspectable teoribindinger', () => {
  assert.equal(finalSet.length, 7);
  assert.equal(finalSet.filter(question => question.method_id).length, 4);
  const theoryQuestions = finalSet.filter(question => question.theory_ref);
  assert.equal(theoryQuestions.length, 4);
  assert.deepEqual(theoryQuestions.map(question => question.topic_hook_id), [
    'his_spor_materialitet',
    'his_bevaring_restaurering_autentisitet',
    'his_kulturminneutvelgelse_verdi',
    'his_middelalder_by_kirke'
  ]);
  for (const question of theoryQuestions) {
    assert.equal(question.theory_ref.topic_hook_id, question.topic_hook_id);
    assert.equal(question.theory_ref.thinker_id, question.thinker_id);
    assert.equal(question.theory_ref.work, question.work);
    assert.ok(question.theory_ref.why_it_helps.length >= 90);
  }
});

test('Canonical Knowledge-synk dekker alle spørsmål, concepts og terms', () => {
  const knowledgeIds = new Set(knowledgeRegistry.units.map(unit => unit.knowledge_unit_id));
  const conceptIds = new Set(conceptRegistry.concepts.map(concept => concept.concept_id));
  const termIds = new Set(termRegistry.terms.map(term => term.term_id));
  const quizKnowledgeIds = new Set();
  const quizConceptIds = new Set();
  const quizTermIds = new Set();
  for (const question of questions) {
    assert.equal(question.knowledge_link_status, 'linked');
    assert.ok(question.knowledge_unit_ids.includes(question.primary_knowledge_unit_id));
    assert.ok(question.knowledge_unit_ids.every(id => knowledgeIds.has(id)));
    assert.ok(question.concept_ids.length >= 1);
    assert.ok(question.concept_ids.every(id => conceptIds.has(id)));
    assert.ok(question.term_ids.every(id => termIds.has(id)));
    question.knowledge_unit_ids.forEach(id => quizKnowledgeIds.add(id));
    question.concept_ids.forEach(id => quizConceptIds.add(id));
    question.term_ids.forEach(id => quizTermIds.add(id));
  }
  assert.equal(quizKnowledgeIds.size, 42);
  assert.equal(quizConceptIds.size, 45);
  assert.equal(quizTermIds.size, 8);
  const units = knowledgeRegistry.units.filter(unit => unit.quiz_refs?.some(ref => ref.startsWith('historie_gamle_aker_kirke_set_')));
  assert.equal(units.length, 42);
  assert.ok(units.every(unit => unit.status === 'reviewed' && unit.sources.length >= 2));
});

test('Usikre tradisjoner og kildekonflikten er ikke gjort til quizfasit', () => {
  const userFacing = questions.map(question => `${question.question} ${question.answer} ${question.knowledge}`).join(' ');
  assert.doesNotMatch(userFacing, /Olav Kyrre|førkristent tingsted|eldre trekirke|Thomas Blix|1715|1725/i);
});

test('Historie-gaten og fasekortet lukker fase 8 og åpner rundingsfasen', () => {
  assert.deepEqual(productionReport.quizOpening, {
    status: 'PASS',
    quizTargetId: 'gamle_aker_kirke',
    firstTwoSetsQuestionCount: 14,
    sourceBrief: briefPath,
    productionContext: contextPath,
    requiredInputs: ['pensum', 'emner', 'fagkart', 'methods', 'supersetQuizMal', 'quizStandard', 'quizQuestionSchema']
  });
  assert.equal(productionReport.gates.G.status, 'PASS');
  assert.ok(productionReport.gates.G.evidenceRefs.includes('quizOpening'));
  assert.match(report, /\| 8 \| Mer \| \*\*GODKJENT – PR #5186, merge `3bc252d347b3dd8561155bdbd49c354378401767`\*\* \|/);
  assert.match(report, /\| 9 \| Quizåpning 2 × 7 og Knowledge \| \*\*GODKJENT – PR #5188, merge `5c400fdb79fa16af7eb23fcd61c3e8b70ef8e01b`\*\* \|/);
  assert.match(report, /\| 10 \| People, Objects, Brands og Badges\/rundinger \| \*\*KLAR FOR REVIEW – STANDARD 4\+1, KILDE- OG BILDEKONTROLLERT\*\* \|/);
});
