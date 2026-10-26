import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const existing = read('data/quiz/politikk/politikk_subject_pathways_v1.json');
const pack = read('data/quiz/politikk/politikk_subject_pathways_v1.json');
const evidence = read('data/fag/politikk/advanced_political_science_wave8_hungary_poland_comparison_v1.json');
const schema = read('data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json');
const quizSchema = read('data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json');
const manifest = read('data/quiz/manifest.json');
const qs = pack.sets[1].questions;
const claims = new Map(evidence.claim_bank.map(x => [x.id, x]));
const sources = new Map(evidence.sources.map(x => [x.id, x]));
const stages = ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'];

test('Bølge 9: kandidat oppfyller femtrinns- og Knowledge-kontrakten', () => {
  assert.equal(pack.schema, 'history_go_subject_pathway_package_v1');
  for (const key of schema.required_top_fields) assert.ok(Object.hasOwn(pack, key), key);
  for (const key of schema.set_contract.required_fields) assert.ok(Object.hasOwn(pack.sets[1], key), key);
  assert.equal(qs.length, 5);
  assert.deepEqual(qs.map(q => q.pathway_stage), stages);
  for (const q of qs) {
    for (const key of [...quizSchema.required_fields, ...schema.question_contract.required_fields])
      assert.ok(Object.hasOwn(q, key), q.id + ': ' + key);
    assert.equal(q.categoryId, 'politikk');
    assert.equal(q.targetId, pack.sets[1].targetId);
    assert.equal(q.question_scope, 'subject_area');
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.equal(q.feedback_by_option.length, 4);
    assert.equal(q.feedback_by_option.filter(x => x.startsWith('Riktig:')).length, 1);
    assert.ok(q.feedback_by_option[q.answerIndex].startsWith('Riktig:'));
    assert.ok(q.knowledge.length > 160 && q.knowledge_payload.explanation.length > 140);
    assert.ok(q.knowledge_payload.summary.length > 85 && q.knowledge_payload.why_it_matters.length > 60);
    assert.deepEqual(q.knowledge_unit_ids, [q.primary_knowledge_unit_id]);
    assert.match(q.primary_knowledge_unit_id, /^ku_politikk_hupl_wave9_0[1-5]$/);
    assert.equal(q.knowledge_contract_version, 1);
    assert.equal(q.knowledge_link_status, 'linked');
    assert.equal(q.canonical_claim.split(/(?<=[.!?])\s+|;\s+(?=[A-ZÆØÅ0-9])/u).filter(Boolean).length, 1, q.id + ': precisely one capturable claim');
    assert.equal(q.emne_id, evidence.canonical_links.emne_id);
    assert.equal(q.method_id, evidence.canonical_links.method_id);
    assert.equal(q.concept_ids.length, q.core_concepts.length);
    assert.ok(q.canonical_politikk_concept_ids.every(id => evidence.canonical_links.concept_ids.includes(id)));
    const claim = claims.get(q.claim_id);
    assert.ok(claim, q.id);
    assert.equal(q.claim_basis, claim.statement);
    assert.deepEqual(q.source.map(s => s.source_id), claim.source_ids);
    for (const s of q.source) {
      const record = sources.get(s.source_id);
      assert.ok(record, s.source_id);
      assert.equal(s.url, record.url);
      assert.equal(s.locator, claim.locator);
      assert.equal(s.inference_boundary, claim.inference_limit);
    }
  }
  for (const field of ['id','quiz_id','learning_objective_id','primary_knowledge_unit_id','claim_id'])
    assert.equal(new Set(qs.map(q => q[field])).size, 5, field);
  assert.deepEqual(qs.map(q => q.answerIndex), [2,1,3,0,2]);
});

test('Bølge 9: to aktive sett og ti unike Knowledge-enheter i samme Politikk-manifest', () => {
  assert.equal(existing.status, 'pilot_active');
  assert.equal(pack.sets.length, 2);
  assert.equal(pack.sets[0].questions.length, 5);
  assert.equal(pack.sets[1].questions.length, 5);
  assert.notEqual(pack.sets[0].targetId, pack.sets[1].targetId);
  assert.equal(pack.production_context.active_question_count, 10);
  assert.equal(pack.production_context.runtime_activation, true);
  assert.equal(pack.production_context.quiz_manifest_registered, true);
  assert.ok(manifest.subjectPackages.some(p => p.subjectId === 'politikk' && p.file === 'data/quiz/politikk/politikk_subject_pathways_v1.json'));
  assert.equal(new Set(pack.sets.flatMap(set => set.questions.map(q => q.primary_knowledge_unit_id))).size, 10);
  assert.ok(!manifest.subjectPackages.some(p => p.file?.includes('hungary_poland_pathway_candidate')));
});
