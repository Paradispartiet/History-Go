#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/quiz/musikk/musikk_subject_pathways_v1.json';
const SCHEMA = 'data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json';
const QUESTION_SCHEMA = 'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json';
const EVIDENCE = 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json';
const MODULE = 'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json';
const METHODS = 'data/fag/musikk/musikkvitenskap_canonical_v1/method_protocols_v1.json';

const EXPECTED = Object.freeze({
  subject: 'musikk',
  domain: 'musikalsk_analyse_lyd_struktur',
  emne: 'em_musikk_vit_rytme_meter_groove_timing',
  target: 'subject_musikk_rytme_meter_groove_timing',
  claim: 'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
  object: 'obj_sioros_2014_zenodo_1221315',
  source: 'prod_src_sioros_syncopation_synthesized_2014',
  method: 'rytme_mikrotiminganalyse',
  stages: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify']
});

let pass = 0;
let fail = 0;
const errors = [];
const ok = (condition, message) => {
  if (condition) pass += 1;
  else { fail += 1; errors.push(message); }
};
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const text = (value) => typeof value === 'string' ? value.trim() : '';
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values)];

function normalize(value) {
  return text(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function slug(value, max = 48) {
  return normalize(value).replace(/\s+/g, '_').replace(/^_+|_+$/g, '').slice(0, max);
}
function digest(value, length = 10) {
  return createHash('sha256').update(text(value), 'utf8').digest('hex').slice(0, length);
}
function stableId(prefix, subjectId, value) {
  const readable = slug(value, prefix === 'ku' ? 24 : 36) || 'item';
  return `${prefix}_${slug(subjectId, 24) || 'unknown'}_${readable}_${digest(`${subjectId}\0${normalize(value)}`)}`;
}
function sameOrder(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function main() {
  const pkg = readJson(PACKAGE);
  const schema = readJson(SCHEMA);
  const questionSchema = readJson(QUESTION_SCHEMA);
  const evidence = readJson(EVIDENCE);
  const module = readJson(MODULE);
  const methods = readJson(METHODS);

  for (const field of list(schema.required_top_fields)) ok(Object.hasOwn(pkg, field), `pakken mangler toppfelt ${field}`);
  ok(pkg.schema === 'history_go_subject_pathway_package_v1', 'feil package schema');
  ok(pkg.package_kind === 'subject_pathway', 'package_kind må være subject_pathway');
  ok(pkg.categoryId === EXPECTED.subject && pkg.subject_id === EXPECTED.subject, 'pakken må tilhøre musikk');
  ok(pkg.targetId === 'subject_musikk', 'topp-target må være subject_musikk');
  ok(pkg.status === 'pilot_active', 'første Musikk-pathway skal være pilot_active');
  ok(pkg.production_context?.profile === 'subject_pathway_pilot_1x5', 'feil pilotprofil');
  ok(pkg.production_context?.blocked_canonical_topic_count === 47, 'piloten må eksplisitt holde 47 canonicale temaer blokkert');
  ok(pkg.production_context?.rights_mode === 'external_link_and_metadata_only', 'rettighetsmodus må være external_link_and_metadata_only');
  ok(sameOrder(pkg.production_context?.question_ready_claim_ids, [EXPECTED.claim]), 'kun ett frigitt claim kan ligge i produksjonskonteksten');
  ok(sameOrder(pkg.production_context?.direct_object_ids, [EXPECTED.object]), 'kun det verifiserte Zenodo-objektet kan ligge i produksjonskonteksten');
  ok(sameOrder(pkg.production_context?.released_emne_ids, [EXPECTED.emne]), 'kun rytme/groove-emnet kan være released');

  const evidenceClaims = new Map(list(evidence.claim_records).map((item) => [item.claim_id, item]));
  const evidenceObjects = new Map(list(evidence.direct_objects).map((item) => [item.object_id, item]));
  const productionSources = new Map(list(evidence.production_source_extensions).map((item) => [item.source_id, item]));
  const gate = evidence.direct_object_gate || {};
  ok(evidence.status === 'question_release_ready', 'upstream fulltekstevidens er ikke question_release_ready');
  ok(gate.question_release_ready === true, 'upstream direct-object gate er ikke åpen');
  ok(sameOrder(gate.question_ready_claim_ids, [EXPECTED.claim]), 'upstream gate frigir ikke nøyaktig det forventede claimet');
  ok(gate.selected_object_id === EXPECTED.object, 'upstream gate peker ikke til forventet direct object');

  const claim = evidenceClaims.get(EXPECTED.claim);
  const object = evidenceObjects.get(EXPECTED.object);
  const prodSource = productionSources.get(EXPECTED.source);
  ok(Boolean(claim), 'frigitt claim mangler i fulltekstevidensen');
  ok(Boolean(object), 'direct object mangler i fulltekstevidensen');
  ok(Boolean(prodSource), 'production extension-kilden mangler i fulltekstevidensen');
  ok(claim?.object_scope?.direct_object_id === EXPECTED.object, 'claimet peker ikke til direct object');
  ok(list(claim?.source_ids).includes(EXPECTED.source), 'claimet peker ikke til production extension-kilden');
  ok(object?.object_type === 'datasett_og_kode', 'direct object har feil object_type');
  ok(list(object?.locators).length >= 2, 'direct object må ha minst to locatorer');
  ok(object?.rights?.history_go_use_mode === 'external_link_and_metadata_only', 'upstream History Go-use mode er feil');
  ok(object?.rights?.redistribution_allowed === false, 'redistribusjon skal være eksplisitt forbudt');
  ok(object?.rights?.modification_allowed === false, 'endring skal være eksplisitt forbudt');

  const topic = list(module.topics).find((item) => item.emne_id === EXPECTED.emne);
  const methodIds = new Set(list(methods.protocols).map((item) => item.method_id));
  ok(Boolean(topic), 'canonicalt rytme/groove-emne mangler');
  ok(topic?.domain_id === EXPECTED.domain, 'emnet ligger i feil domene');
  ok(list(topic?.research_object_types).includes('datasett_og_kode'), 'emnet tillater ikke datasett_og_kode');
  ok(list(topic?.method_protocol_ids).includes(EXPECTED.method), 'emnet tillater ikke rytme_mikrotiminganalyse');
  ok(methodIds.has(EXPECTED.method), 'metoden mangler i method_protocols');

  ok(list(pkg.sources).length === 2, 'pakken skal ha nøyaktig artikkel + direct object som kilder');
  const packageSources = new Map(list(pkg.sources).map((item) => [item.id, item]));
  ok(packageSources.has(EXPECTED.source), 'pakken mangler production extension-kilden');
  ok(packageSources.has(EXPECTED.object), 'pakken mangler direct object-kilden');
  const packagedObject = packageSources.get(EXPECTED.object) || {};
  ok(packagedObject.use_mode === 'external_link_and_metadata_only', 'pakket direct object har feil use_mode');
  ok(packagedObject.redistribution_allowed === false && packagedObject.modification_allowed === false, 'pakken må bevare rettighetsrestriksjonene');
  ok(/^https:\/\/zenodo\.org\/records\/1221315/.test(text(packagedObject.url)), 'pakken må bruke persistent Zenodo-record');

  ok(list(pkg.sets).length === 1, 'Musikk-piloten skal ha nøyaktig ett sett');
  const set = list(pkg.sets)[0] || {};
  for (const field of list(schema.set_contract?.required_fields)) ok(Object.hasOwn(set, field), `settet mangler felt ${field}`);
  ok(set.phase === 'subject_pathway' && set.target_kind === 'subject_area', 'settet har feil subject-pathway type');
  ok(set.targetId === EXPECTED.target && set.area_id === EXPECTED.domain && set.emne_id === EXPECTED.emne, 'settet peker til feil target/domene/emne');
  ok(sameOrder(set.sequence, EXPECTED.stages), 'settsekvensen er ikke canonical femtrinnsrekkefølge');
  ok(sameOrder(set.question_ready_claim_ids, [EXPECTED.claim]), 'settet kan ikke frigi andre claims');
  ok(sameOrder(set.direct_object_ids, [EXPECTED.object]), 'settet kan ikke bruke andre direct objects');
  ok(list(set.questions).length === schema.set_contract?.questions_per_set, 'subject pathway skal ha fem spørsmål');

  const requiredQuestionFields = unique([
    ...list(questionSchema.required_fields),
    ...list(schema.question_contract?.required_fields)
  ]);
  const answerIndexes = [];
  const seenIds = new Set();
  for (const [index, question] of list(set.questions).entries()) {
    const label = `q${index + 1}`;
    for (const field of requiredQuestionFields) ok(Object.hasOwn(question, field), `${label}: mangler obligatorisk felt ${field}`);
    ok(!seenIds.has(question.id), `${label}: duplikat question id`);
    seenIds.add(question.id);
    ok(question.categoryId === EXPECTED.subject, `${label}: feil categoryId`);
    ok(question.targetId === EXPECTED.target && question.question_scope === 'subject_area', `${label}: feil subject target/scope`);
    ok(question.emne_id === EXPECTED.emne, `${label}: feil emne_id`);
    ok(question.method_id === EXPECTED.method, `${label}: feil method_id`);
    ok(question.direct_object_id === EXPECTED.object, `${label}: feil direct_object_id`);
    ok(question.pathway_stage === EXPECTED.stages[index], `${label}: feil pathway stage`);
    ok(list(question.options).length >= 3 && list(question.options).length <= 4, `${label}: options må ha 3–4 alternativer`);
    ok(question.answerIndex >= 0 && question.answerIndex < list(question.options).length, `${label}: answerIndex utenfor options`);
    ok(question.answer === list(question.options)[question.answerIndex], `${label}: answer og answerIndex er usynkronisert`);
    answerIndexes.push(question.answerIndex);
    ok(text(question.knowledge).length > 20 && text(question.claim_basis).length > 20, `${label}: knowledge/claim_basis er for kort`);
    ok(question.source_origin === 'external', `${label}: synlig kunnskap må ha external source_origin`);
    ok(list(question.source).length >= 1, `${label}: source mangler`);
    for (const source of list(question.source)) {
      ok([EXPECTED.source, EXPECTED.object].includes(source.source_id), `${label}: ikke-frigitt kilde/objekt ${source.source_id}`);
      ok(text(source.locator).length > 4, `${label}: source locator mangler`);
      if (source.source_id === EXPECTED.object) {
        ok(source.use_mode === 'external_link_and_metadata_only', `${label}: dataset-kilde mangler sikker use_mode`);
        ok(/^https:\/\/zenodo\.org\/records\/1221315/.test(text(source.url)), `${label}: dataset-kilde må bruke persistent Zenodo-lenke`);
      }
    }
    if (question.claim_id) ok(question.claim_id === EXPECTED.claim && gate.question_ready_claim_ids.includes(question.claim_id), `${label}: claim_id er ikke frigitt`);
    if (index < 4) ok(question.claim_id === EXPECTED.claim, `${label}: de fire forskningsspørsmålene må peke til det frigjorte claimet`);
    if (index === 4) ok(!question.claim_id && question.evidence_type === 'rights_and_reuse_metadata', `${label}: rettighetstrinnet skal bygge på objektmetadata, ikke late som det er et forskningsclaim`);
    const concepts = list(question.core_concepts);
    ok(concepts.length >= 2, `${label}: core_concepts mangler`);
    ok(sameOrder(question.concept_ids, concepts.map((value) => stableId('co', EXPECTED.subject, value))), `${label}: concept_ids er ikke deterministiske`);
    ok(sameOrder(question.term_ids, list(question.terms).map((value) => stableId('term', EXPECTED.subject, value))), `${label}: term_ids er ikke deterministiske`);
    const summary = text(question.knowledge_payload?.summary);
    ok(question.primary_knowledge_unit_id === stableId('ku', EXPECTED.subject, summary), `${label}: primary knowledge unit id er ikke deterministisk`);
    ok(sameOrder(question.knowledge_unit_ids, [question.primary_knowledge_unit_id]), `${label}: knowledge_unit_ids er usynkronisert`);
    ok(text(question.knowledge_payload?.explanation).length > 40, `${label}: knowledge explanation er for kort`);
    ok(question.feedback_basis === 'source_trace_and_explanation', `${label}: feedback_basis er feil`);
  }
  ok(new Set(answerIndexes).size >= 3, 'riktige svar må være fordelt over minst tre answerIndex-posisjoner');

  console.log(`Musikk subject pathway v1: ${pass} PASS, ${fail} FAIL`);
  console.log(`Pilot: ${pkg.sets.length} sett, ${set.questions.length} spørsmål, ${pkg.production_context.question_ready_claim_ids.length} released claim, ${pkg.production_context.direct_object_ids.length} direct object, ${pkg.production_context.blocked_canonical_topic_count} temaer fortsatt blokkert.`);
  for (const error of errors) console.error(`FAIL: ${error}`);
  if (fail) process.exitCode = 1;
}

main();
