import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const pathway = read('data/quiz/politikk/politikk_subject_pathways_v1.json');
const evidence = read('data/fag/politikk/advanced_political_science_wave6_poland_case_evidence_v1.json');
const wave5 = read('data/fag/politikk/advanced_political_science_wave5_election_case_assessment_v1.json');
const concepts = read('data/fag/politikk/concepts_politikk_canonical_v1.json').concepts;
const emner = read('data/fag/politikk/emner_politikk_canonical_v4_5.json');
const methods = read('data/fag/politikk/methods_politikk_canonical_v4_5.json').methods;
const schema = read('data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json');
const qSchema = read('data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json');
const qManifest = read('data/quiz/manifest.json');
const knowledgeManifest = read('data/knowledge/knowledge_manifest.json');
const fagManifest = read('data/fag/fag_manifest.json');
const unique = (xs) => new Set(xs).size === xs.length;
const allQuestions = pathway.sets[0].questions;
const bySource = new Map(evidence.sources.map(s => [s.id,s]));
const byClaim = new Map(evidence.claim_bank.map(c => [c.id,c]));
const byConcept = new Map(concepts.map(c => [c.concept_id,c]));
const emneId = 'em_pol_institusjonsfordypning_demokratisk_tilbakegang';
const methodId = 'met_pol_institusjonell_tilbakegangsanalyse';
const stages = ['observe','explain','evaluate_evidence','diagnose_failure','decide_and_justify'];

test('Statsvitenskap v6: selvstendig pakke oppfyller femtrinnskontrakten', () => {
  for (const key of schema.required_top_fields) assert.ok(Object.hasOwn(pathway,key),key);
  assert.equal(pathway.schema, 'history_go_subject_pathway_package_v1');
  assert.equal(pathway.package_kind, 'subject_pathway');
  assert.equal(pathway.categoryId, 'politikk');
  assert.equal(pathway.subject_id, 'politikk');
  assert.equal(pathway.targetId, 'subject_politikk');
  assert.equal(pathway.sets.length, 2);
  const set = pathway.sets[0];
  for (const key of schema.set_contract.required_fields) assert.ok(Object.hasOwn(set,key),key);
  assert.equal(set.phase, 'subject_pathway');
  assert.equal(set.target_kind, 'subject_area');
  assert.equal(set.questions.length, schema.set_contract.questions_per_set);
  assert.deepEqual(set.sequence, stages);
  assert.deepEqual(set.questions.map(q => q.pathway_stage), stages);
  assert.ok(set.targetId.startsWith('subject_politikk_'));
  assert.equal(set.emne_id, emneId);
  assert.equal(set.area_id, 'komparativ_politikk_regimer_institusjoner');
  assert.equal(set.completion_rule.minimum_correct, 4);
});

test('Statsvitenskap v6: alle 5 spørsmål er komplette og faglig begrunnet', () => {
  assert.equal(allQuestions.length, 5);
  assert.ok(unique(allQuestions.map(q => q.id)));
  assert.ok(unique(allQuestions.map(q => q.quiz_id)));
  assert.ok(unique(allQuestions.map(q => q.learning_objective_id)));
  assert.ok(unique(allQuestions.map(q => q.primary_knowledge_unit_id)));
  assert.ok(unique(allQuestions.map(q => q.claim_id)));
  for (const [index,q] of allQuestions.entries()) {
    for (const key of [...qSchema.required_fields,...schema.question_contract.required_fields])
      assert.ok(Object.hasOwn(q,key),q.id+': '+key);
    assert.equal(q.question_scope, 'subject_area');
    assert.equal(q.categoryId, 'politikk');
    assert.equal(q.emne_id, emneId);
    assert.equal(q.targetId, pathway.sets[0].targetId);
    assert.equal(q.method_id, methodId);
    assert.ok(qSchema.question_type_values.includes(q.question_type),q.id);
    assert.ok(q.options.length >= 3 && q.options.length <= 4);
    assert.ok(unique(q.options));
    assert.equal(q.options[q.answerIndex],q.answer);
    assert.equal(q.feedback_by_option.length,q.options.length);
    assert.equal(q.feedback_by_option.filter(x => /^Riktig:/.test(x)).length,1,q.id);
    assert.ok(q.feedback_by_option[q.answerIndex].startsWith('Riktig:'),q.id);
    assert.ok(q.question.length > 75 && q.knowledge.length > 160,q.id);
    assert.ok(q.knowledge_payload.summary.length > 85,q.id);
    assert.ok(q.knowledge_payload.explanation.length > 140,q.id);
    assert.ok(q.knowledge_payload.why_it_matters.length > 60,q.id);
    assert.equal(q.feedback_basis,'source_trace_and_explanation');
    assert.equal(q.source_origin,'external');
    assert.equal(q.knowledge_contract_version,1);
    assert.equal(q.knowledge_link_status,'linked');
    assert.equal(q.primary_knowledge_unit_id,'ku_politikk_pl2023_'+String(index+1).padStart(2,'0'));
    assert.deepEqual(q.knowledge_unit_ids,[q.primary_knowledge_unit_id]);
    assert.match(q.primary_knowledge_unit_id,/^ku_[a-z0-9_]+$/);
    assert.match(q.learning_objective_id,/^lo_politikk_pl2023_/);
    assert.ok(q.terms.length && q.core_concepts.length);
    assert.equal(q.term_ids.length,q.terms.length);
    assert.equal(q.concept_ids.length,q.core_concepts.length);
    assert.equal(q.canonical_politikk_concept_ids.length,q.core_concepts.length);
    assert.ok(q.term_ids.every(id => /^term_[a-z0-9_]+$/.test(id)),q.id);
    assert.ok(q.concept_ids.every(id => /^co_[a-z0-9_]+$/.test(id)),q.id);
    assert.ok(q.concept_ids.every(id => !id.startsWith('pol_concept_')),q.id);
  }
});

test('Statsvitenskap v6: gjenbruker Politikk-konsepter og eksisterende metode, ingen ny kanon', () => {
  const emne = emner.find(e => e.emne_id === emneId);
  assert.ok(emne);
  assert.equal(emne.domain,'komparativ_politikk_regimer_institusjoner');
  assert.ok(emne.method_ids.includes(methodId));
  assert.ok(methods.find(m=>m.method_id===methodId));
  assert.equal(evidence.canonical_emne_id,emneId);
  assert.equal(evidence.method_guard,methodId);
  assert.equal(evidence.new_curricular_units,0);
  for (const q of allQuestions) {
    for (const [i,id] of q.canonical_politikk_concept_ids.entries()) {
      const c = byConcept.get(id);
      assert.ok(c, id);
      assert.ok(c.source_emne_ids.includes(emneId),id);
      assert.equal(q.core_concepts[i],c.label);
      assert.match(q.concept_ids[i],/^co_politikk_/);
    }
  }
});

test('Statsvitenskap v6: alle fem spørsmålsclaims har eksternt kildebelegg og lokator', () => {
  assert.equal(evidence.claim_bank.length,5);
  assert.equal(evidence.verified_claims_ready_for_question_drafts,5);
  assert.equal(byClaim.size,5);
  assert.ok(unique(evidence.sources.map(s=>s.id)));
  for (const q of allQuestions) {
    const claim = byClaim.get(q.claim_id);
    assert.ok(claim,q.id);
    assert.equal(q.claim_basis,claim.claim);
    assert.equal(q.source.length,claim.source_ids.length);
    assert.ok(claim.scope.length>45);
    assert.ok(claim.locator.length>40);
    for (const s of q.source) {
      const record = bySource.get(s.source_id);
      assert.ok(record,q.id+': '+s.source_id);
      assert.ok(claim.source_ids.includes(s.source_id));
      assert.equal(s.url,record.url);
      assert.equal(s.locator,claim.locator);
      assert.equal(s.inference_boundary,claim.scope);
      assert.equal(s.claim_basis,claim.claim);
      assert.ok(s.url.startsWith('https://odihr.osce.org/'));
      assert.equal(record.role==='method_background_only_not_poland_evidence',false);
    }
  }
  assert.deepEqual(pathway.production_context.question_ready_claim_ids.slice(0,5),allQuestions.map(q=>q.claim_id));
  assert.ok(pathway.sources.length>=evidence.sources.length);
  assert.match(evidence.source_review_scope,/ikke systematisk fulltekst-auditert/);
  assert.ok(evidence.sources.find(s=>s.id==='dixon_landau_2024'&&s.doi==='10.1017/9781009447713.004'));
});

test('Statsvitenskap v6: bevarer tidligere empirisk oppgave og avgrenser slutninger', () => {
  const prior=wave5.assessment;
  const q=allQuestions[2];
  assert.equal(q.question,prior.question);
  assert.deepEqual(q.options,prior.options);
  assert.equal(q.answerIndex,prior.answerIndex);
  assert.equal(q.answer,prior.answer);
  assert.match(allQuestions[3].knowledge,/ikke .*bevis for at stemmer ble telt feil/i);
  assert.match(allQuestions[4].knowledge,/ikke at den er gjennomført eller bevist effektiv/i);
  assert.match(pathway.production_context.scope_limit,/ikke uttømmende fulltekstgjennomgang/i);
});

test('Statsvitenskap v7: Polen-forløpet er registrert i eksisterende fag- og Knowledge-manifester', () => {
  assert.equal(pathway.status,'pilot_active');
  assert.equal(pathway.production_context.runtime_activation,true);
  assert.equal(pathway.production_context.knowledge_registry_materialized,true);
  assert.equal(pathway.production_context.quiz_manifest_registered,true);
  assert.equal(pathway.production_context.knowledge_manifest_registered,true);
  assert.equal(pathway.production_context.fag_manifest_registered,true);
  assert.equal(evidence.published_quiz_claims,5);
  assert.ok(qManifest.subjectPackages?.some(x=>x.subjectId==='politikk' && x.status==='active' && x.file==='data/quiz/politikk/politikk_subject_pathways_v1.json'));
  assert.equal(knowledgeManifest.runtime.subjectPathwaySources?.politikk,'../quiz/politikk/politikk_subject_pathways_v1.json');
  assert.equal(fagManifest.politikk?.subjectPathwayPackage,'../quiz/politikk/politikk_subject_pathways_v1.json');
  assert.match(pathway.production_context.release_gate,/Knowledge canonical --write\/--check/);
  assert.ok(allQuestions.every(q=>q.knowledge_link_status==='linked'));
  assert.ok(!qManifest.subjectPackages.filter(x=>x.subjectId==='politikk').slice(1).length);
});
