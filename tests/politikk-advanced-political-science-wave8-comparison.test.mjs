import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const wave8 = read('data/fag/politikk/advanced_political_science_wave8_hungary_poland_comparison_v1.json');
const wave6 = read('data/fag/politikk/advanced_political_science_wave6_poland_case_evidence_v1.json');
const pathway = read('data/quiz/politikk/politikk_subject_pathways_v1.json');
const methods = read('data/fag/politikk/methods_politikk_canonical_v4_5.json').methods;
const concepts = read('data/fag/politikk/concepts_politikk_canonical_v1.json').concepts;
const emner = read('data/fag/politikk/emner_politikk_canonical_v4_5.json');
const stages = ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'];
const sourceById = new Map(wave8.sources.map(source => [source.id, source]));
const claimById = new Map(wave8.claim_bank.map(claim => [claim.id, claim]));

test('Statsvitenskap bølge 8: beholder Polen-piloten og alle kanoniske Politikk-bindinger', () => {
  assert.equal(wave8.schema, 'history_go_politikk_comparative_election_evidence_v1');
  assert.equal(wave8.subject_id, 'politikk');
  assert.equal(wave8.status, 'materialized_as_wave9_subject_pathway');
  assert.equal(wave8.wave, 8);
  assert.equal(pathway.status, 'pilot_active');
  assert.equal(pathway.sets.length, 2);
  assert.equal(wave6.published_quiz_claims, 5);
  assert.equal(wave8.canonical_links.prior_evidence_path, 'data/fag/politikk/advanced_political_science_wave6_poland_case_evidence_v1.json');
  assert.equal(wave8.canonical_links.method_id, wave6.method_guard);
  assert.equal(wave8.canonical_links.emne_id, wave6.canonical_emne_id);
  assert.equal(wave8.canonical_links.domain_id, 'komparativ_politikk_regimer_institusjoner');
  const emne = emner.find(x => x.emne_id === wave8.canonical_links.emne_id);
  assert.ok(emne);
  assert.ok(emne.method_ids.includes(wave8.canonical_links.method_id));
  assert.ok(methods.some(method => method.method_id === wave8.canonical_links.method_id));
  for (const id of wave8.canonical_links.concept_ids) {
    assert.ok(concepts.some(concept => concept.concept_id === id && concept.source_emne_ids.includes(emne.emne_id)), id);
  }
  for (const key of ['new_curricular_units','new_domain_ids','new_method_ids','new_concept_ids']) {
    assert.equal(wave8[key], 0, key);
  }
});

test('Statsvitenskap bølge 8: to daterte case, kilder og fem avgrensede, sporbare påstander', () => {
  assert.deepEqual(wave8.case_pair.map(x => x.election_date), ['2022-04-03','2023-10-15']);
  assert.deepEqual(wave8.case_pair.map(x => x.mission_kind), ['Election Observation Mission','Limited Election Observation Mission']);
  assert.equal(sourceById.size, 4);
  assert.equal(wave8.claim_bank.length, 5);
  assert.equal(claimById.size, 5);
  assert.equal(wave8.verified_claims_prepared, 5);
  for (const source of wave8.sources) {
    assert.ok(source.url.startsWith('https://odihr.osce.org/'), source.id);
    assert.ok(source.reviewed_sections.length >= 2, source.id);
    assert.match(source.kind, /^official_/);
    assert.match(source.published, /^20\d{2}-\d{2}-\d{2}$/);
  }
  for (const claim of wave8.claim_bank) {
    assert.ok(claim.statement.length > 100, claim.id);
    assert.ok(claim.locator.length > 65, claim.id);
    assert.ok(claim.inference_limit.length > 80, claim.id);
    assert.ok(claim.source_ids.length >= 1, claim.id);
    assert.ok(new Set(claim.source_ids).size === claim.source_ids.length, claim.id);
    for (const id of claim.source_ids) assert.ok(sourceById.has(id), claim.id + ' -> ' + id);
  }
  assert.match(wave8.source_review_scope, /ingen systematisk fulltekstgjennomgang/i);
});

test('Statsvitenskap bølge 8: fem faglig begrunnede svarutkast i riktig sekvens, ennå ikke aktivert', () => {
  assert.equal(wave8.question_drafts_prepared, 5);
  assert.equal(wave8.question_drafts.length, 5);
  assert.deepEqual(wave8.question_drafts.map(q => q.stage), stages);
  assert.equal(new Set(wave8.question_drafts.map(q => q.id)).size, 5);
  assert.equal(new Set(wave8.question_drafts.map(q => q.learning_objective_id)).size, 5);
  assert.deepEqual(wave8.question_drafts.map(q => q.claim_id), wave8.claim_bank.map(c => c.id));
  for (const q of wave8.question_drafts) {
    const claim = claimById.get(q.claim_id);
    assert.ok(claim);
    assert.equal(q.status, 'materialized_wave9');
    assert.ok(q.question.length > 95, q.id);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.equal(q.feedback.length, 4);
    assert.ok(q.feedback[q.answerIndex].startsWith('Riktig:'), q.id);
    assert.equal(q.feedback.filter(x => x.startsWith('Riktig:')).length, 1, q.id);
    assert.equal(q.correct_answer, q.options[q.answerIndex]);
    assert.deepEqual(q.source_ids, claim.source_ids);
  }
  assert.equal(wave8.publication_gate.quiz_runtime_active, true);
  assert.equal(wave8.publication_gate.knowledge_registry_materialized, true);
  assert.equal(wave8.publication_gate.manifest_changes_required_before_activation, false);
  assert.equal(wave8.published_quiz_items, 5);
  assert.equal(pathway.sets[1].questions.length, 5);
  assert.ok(wave8.publication_gate.steps.length >= 4);
  assert.ok(wave8.methodological_guards.length >= 4);
});
