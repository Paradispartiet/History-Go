import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const quizPath = 'data/quiz/historie/var_frelsers_gravlund_sets.json';
const briefPath = 'data/quiz/production_briefs/historie/var_frelsers_gravlund.json';
const contextPath = 'data/quiz/production_context/historie/var_frelsers_gravlund.json';
const quiz = readJson(quizPath);
const brief = readJson(briefPath);
const context = readJson(contextPath);
const quizManifest = readJson('data/quiz/manifest.json');
const fagManifest = readJson('data/fag/fag_manifest.json');
const productionReport = readJson('data/places/historie-production/var_frelsers_gravlund.json');
const knowledgeRegistry = readJson('data/knowledge/knowledge_units.generated.json');
const conceptRegistry = readJson('data/knowledge/concepts.generated.json');
const termRegistry = readJson('data/knowledge/terms.generated.json');
const release = readJson('data/fagverk/fagverk_release.json');
const workcard = fs.readFileSync('reports/place-production/var-frelsers-gravlund-workcard-current.md', 'utf8');
const questions = quiz.sets.flatMap(set => set.questions);
const opening = quiz.sets.slice(0, 2).flatMap(set => set.questions);
const finalSet = quiz.sets[3].questions;
const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));

test('Vår Frelsers er én reviewed normal 4 × 7-produksjonspakke', () => {
  assert.deepEqual(quizManifest.sets.filter(entry => entry.targetId === quiz.targetId), [
    { targetId: quiz.targetId, file: quizPath }
  ]);
  assert.deepEqual(fagManifest.historie.quizProduction.targets.var_frelsers_gravlund, {
    source_brief: '../quiz/production_briefs/historie/var_frelsers_gravlund.json',
    context_artifact: '../quiz/production_context/historie/var_frelsers_gravlund.json',
    quiz_file: '../quiz/historie/var_frelsers_gravlund_sets.json'
  });
  assert.equal(brief.status, 'reviewed');
  assert.equal(context.profile, 'normal_4x7');
  assert.equal(quiz.production_context.profile, 'normal_4x7');
  assert.deepEqual(quiz.sets.map(set => [set.phase, set.questions.length]), [
    ['opening', 7],
    ['middle', 7],
    ['bridge', 7],
    ['final', 7]
  ]);
  assert.equal(questions.length, 28);
});

test('kildebriefen dokumenterer førtilstand, profilvalg og tilbakeholdte feilspor', () => {
  assert.equal(Object.keys(brief.sources).length, 10);
  assert.ok(Object.values(brief.sources).every(source => source.review_status === 'reviewed'));
  assert.ok(Object.values(brief.sources).every(source => /^https:\/\//.test(source.url)));
  assert.equal(brief.existing_quiz_audit.active_before.sets, 1);
  assert.equal(brief.existing_quiz_audit.active_before.questions, 5);
  assert.equal(brief.existing_quiz_audit.active_before.knowledge_units, 9);
  assert.deepEqual(brief.profile_decision, {
    profile: 'normal',
    set_count: 4,
    questions_per_set: 7,
    justification: brief.profile_decision.justification
  });
  assert.equal(brief.claims.length, 28);
  assert.equal(new Set(brief.claims.map(claim => claim.claim_id)).size, 28);
  assert.deepEqual(brief.claims.map(claim => claim.order), Array.from({ length: 28 }, (_, index) => index + 1));
  assert.deepEqual(context.question_balance.counts, { fact: 14, context: 7, concept_theory: 7 });
  assert.deepEqual(brief.held_back_candidates.map(item => item.candidate), [
    'Napoleonskrigene som direkte årsak til etableringen',
    'Gravlunden ble stengt for nye graver i 1952',
    'Alle kjente personer ligger i Æreslunden',
    'Bestemte arter dokumentert av parkpreget alene'
  ]);
});

test('første fjorten spørsmål er stedlige og teorifrie', () => {
  assert.equal(opening.length, 14);
  for (const question of opening) {
    for (const field of ['method_id', 'topic_hook_id', 'thinker_id', 'theory_ref']) {
      assert.equal(Object.hasOwn(question, field), false, `${question.id}: ${field}`);
    }
    assert.doesNotMatch(question.question, /fagplan|fagkart|metode|teori|teoretiker|History Go/i);
  }
  assert.deepEqual(opening.map(question => question.id), Array.from(
    { length: 14 },
    (_, index) => `var_frelsers_gravlund_quiz_${String(index + 1).padStart(2, '0')}`
  ));
});

test('alle spørsmål har unik claim, kilde, svar og læringsevidens', () => {
  const sourceIds = new Set(Object.keys(quiz.sources));
  const objectiveIds = new Set();
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, `${question.id}: ukjent claim`);
    assert.equal(question.claim_basis, claim.statement);
    assert.deepEqual(question.source, claim.source_ids);
    assert.ok(question.source.every(sourceId => sourceIds.has(sourceId)));
    assert.ok(question.options.length >= 3 && question.options.length <= 4);
    assert.equal(new Set(question.options).size, question.options.length);
    assert.equal(question.answer, question.options[question.answerIndex]);
    assert.ok(question.knowledge.length >= 100);
    assert.match(question.learning_objective_id, /^lo_historie_var_frelsers_\d{2}$/);
    objectiveIds.add(question.learning_objective_id);
    assert.ok(['recognize', 'recall', 'explain', 'compare', 'connect', 'apply'].includes(question.evidence_type));
    assert.ok(question.feedback_basis.length >= 60);
  }
  assert.equal(objectiveIds.size, 28);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 28);
});

test('sluttsettet bruker sju metodespørsmål og fem inspectable teoribindinger', () => {
  assert.equal(finalSet.filter(question => question.method_id).length, 7);
  const theoryQuestions = finalSet.filter(question => question.theory_ref);
  assert.equal(theoryQuestions.length, 5);
  assert.deepEqual(theoryQuestions.map(question => question.topic_hook_id), [
    'his_spor_materialitet',
    'his_kulturminneutvelgelse_verdi',
    'his_minnested_ritual_offentlig_sorg',
    'his_kildekritikk',
    'his_kildekritikk'
  ]);
  for (const question of theoryQuestions) {
    assert.equal(question.theory_ref.topic_hook_id, question.topic_hook_id);
    assert.equal(question.theory_ref.thinker_id, question.thinker_id);
    assert.equal(question.theory_ref.work, question.work);
    assert.ok(question.theory_ref.why_it_helps.length >= 100);
  }
  assert.ok(finalSet.every(question => Array.isArray(question.guidance_basis) && question.guidance_basis.length >= 2));
});

test('canonical Knowledge dekker 28 spørsmål, concepts og terms', () => {
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
  assert.equal(quizKnowledgeIds.size, 49);
  assert.equal(quizConceptIds.size, 51);
  assert.equal(quizTermIds.size, 17);
});

test('Fagverk-release og Historie-gate G er synkronisert', () => {
  const releasePaths = release.subjects.historie.package_files.map(file => file.path);
  for (const path of [quizPath, briefPath, contextPath]) assert.ok(releasePaths.includes(path));
  assert.equal(release.summary.missing_file_count, 0);
  assert.deepEqual(productionReport.quizOpening, {
    status: 'PASS',
    quizTargetId: 'var_frelsers_gravlund',
    firstTwoSetsQuestionCount: 14,
    sourceBrief: briefPath,
    productionContext: contextPath,
    requiredInputs: ['pensum', 'emner', 'fagkart', 'methods', 'supersetQuizMal', 'quizStandard', 'quizQuestionSchema']
  });
  assert.equal(productionReport.gates.G.status, 'PASS');
  assert.match(workcard, /Status: \*\*FASE 3 PASS/);
  assert.match(workcard, /3\. \*\*PASS\*\* – quiz 4 × 7/);
});
