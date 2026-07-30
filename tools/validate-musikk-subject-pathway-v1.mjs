#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/quiz/musikk/musikk_subject_pathways_v1.json';
const SCHEMA = 'data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json';
const QUESTION_SCHEMA = 'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json';
const MODULE = 'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json';
const METHODS = 'data/fag/musikk/musikkvitenskap_canonical_v1/method_protocols_v1.json';
const STAGES = ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'];

const SET_CONFIGS = Object.freeze([
  {
    emne: 'em_musikk_vit_rytme_meter_groove_timing',
    target: 'subject_musikk_rytme_meter_groove_timing',
    evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    claim: 'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    object: 'obj_sioros_2014_zenodo_1221315',
    method: 'rytme_mikrotiminganalyse',
    objectType: 'datasett_og_kode',
    primarySource: 'prod_src_sioros_syncopation_synthesized_2014',
    allowedSources: ['prod_src_sioros_syncopation_synthesized_2014', 'obj_sioros_2014_zenodo_1221315'],
    objectUrlPattern: /^https:\/\/zenodo\.org\/records\/1221315/,
    rightsCheck(object) {
      return object?.rights?.history_go_use_mode === 'external_link_and_metadata_only'
        && object?.rights?.redistribution_allowed === false
        && object?.rights?.modification_allowed === false;
    }
  },
  {
    emne: 'em_musikk_vit_melodi_motiv_frasering',
    target: 'subject_musikk_melodi_motiv_frasering',
    evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json',
    claim: 'claim_musikk_melody_boss_alpha_salience_development',
    object: 'obj_beethoven_op10_1_dcml_v2_5_05_1',
    method: 'notasjons_kildeanalyse',
    objectType: 'notert_kilde',
    primarySource: 'prod_src_boss_hidden_repetition_beethoven_1999',
    allowedSources: ['prod_src_boss_hidden_repetition_beethoven_1999', 'prod_src_hentschel_annotated_piano_corpus_2024', 'obj_beethoven_op10_1_dcml_v2_5_05_1'],
    objectUrlPattern: /^https:\/\/github\.com\/DCMLab\/beethoven_piano_sonatas\/blob\/v2\.5\/MS3\/05-1\.mscx/,
    rightsCheck(object) {
      return object?.rights?.history_go_use_mode === 'external_link_and_metadata_only'
        && object?.rights?.commercial_compatibility_with_history_go === 'not_resolved';
    }
  }
]);

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
function splitClaims(value) {
  const source = text(value).replace(/\s+/g, ' ');
  if (!source) return [];
  const protectedText = source
    .replace(/\b(bl|ca|dvs|dr|f\.eks|mfl|mr|nr|osv|prof|st)\./gi, (match) => match.replace('.', '∯'))
    .replace(/(\d)\.(\d)/g, '$1∯$2');
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/)
    .map((part) => part.replaceAll('∯', '.').trim())
    .filter((part) => part.length >= 12 && !part.endsWith('?'));
}
function sameOrder(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function main() {
  const pkg = readJson(PACKAGE);
  const schema = readJson(SCHEMA);
  const questionSchema = readJson(QUESTION_SCHEMA);
  const module = readJson(MODULE);
  const methods = readJson(METHODS);
  const topicById = new Map(list(module.topics).map((item) => [item.emne_id, item]));
  const methodIds = new Set(list(methods.protocols).map((item) => item.method_id));

  for (const field of list(schema.required_top_fields)) ok(Object.hasOwn(pkg, field), `pakken mangler toppfelt ${field}`);
  ok(pkg.schema === 'history_go_subject_pathway_package_v1', 'feil package schema');
  ok(pkg.package_kind === 'subject_pathway', 'package_kind må være subject_pathway');
  ok(pkg.categoryId === 'musikk' && pkg.subject_id === 'musikk', 'pakken må tilhøre musikk');
  ok(pkg.targetId === 'subject_musikk', 'topp-target må være subject_musikk');
  ok(pkg.status === 'pilot_active', 'Musikk-pathway skal være pilot_active');
  ok(pkg.production_context?.profile === 'subject_pathway_pilot_2x5', 'feil pilotprofil');
  ok(pkg.production_context?.blocked_canonical_topic_count === 46, 'piloten må eksplisitt holde 46 canonicale temaer blokkert');
  ok(pkg.production_context?.rights_mode === 'external_link_and_metadata_only', 'rettighetsmodus må være external_link_and_metadata_only');
  ok(sameOrder(pkg.production_context?.released_emne_ids, SET_CONFIGS.map((item) => item.emne)), 'released_emne_ids er usynkronisert');
  ok(sameOrder(pkg.production_context?.question_ready_claim_ids, SET_CONFIGS.map((item) => item.claim)), 'question_ready_claim_ids er usynkronisert');
  ok(sameOrder(pkg.production_context?.direct_object_ids, SET_CONFIGS.map((item) => item.object)), 'direct_object_ids er usynkronisert');
  ok(list(pkg.production_context?.released_evidence_files).length === SET_CONFIGS.length, 'released_evidence_files må dekke begge settene');

  const packageSources = new Map(list(pkg.sources).map((item) => [item.id, item]));
  const expectedSourceIds = unique(SET_CONFIGS.flatMap((item) => item.allowedSources));
  ok(packageSources.size === expectedSourceIds.length, `pakken skal ha nøyaktig ${expectedSourceIds.length} frigjorte kilder/objekter`);
  for (const sourceId of expectedSourceIds) ok(packageSources.has(sourceId), `pakken mangler source/object ${sourceId}`);

  ok(list(pkg.sets).length === SET_CONFIGS.length, `Musikk-piloten skal ha nøyaktig ${SET_CONFIGS.length} sett`);
  const setByEmne = new Map(list(pkg.sets).map((set) => [set.emne_id, set]));
  const requiredQuestionFields = unique([...list(questionSchema.required_fields), ...list(schema.question_contract?.required_fields)]);
  const seenQuestionIds = new Set();
  let totalQuestions = 0;

  for (const [configIndex, config] of SET_CONFIGS.entries()) {
    const evidence = readJson(config.evidence);
    const claims = new Map(list(evidence.claim_records).map((item) => [item.claim_id, item]));
    const objects = new Map(list(evidence.direct_objects).map((item) => [item.object_id, item]));
    const extensions = new Set(list(evidence.production_source_extensions).map((item) => item.source_id));
    const gate = evidence.direct_object_gate || {};
    const claim = claims.get(config.claim);
    const object = objects.get(config.object);
    const topic = topicById.get(config.emne);

    ok(evidence.status === 'question_release_ready', `${config.emne}: upstream fulltekstevidens er ikke question_release_ready`);
    ok(gate.question_release_ready === true, `${config.emne}: upstream direct-object gate er ikke åpen`);
    ok(sameOrder(gate.question_ready_claim_ids, [config.claim]), `${config.emne}: upstream gate frigir ikke nøyaktig forventet claim`);
    ok(gate.selected_object_id === config.object, `${config.emne}: upstream gate peker ikke til forventet direct object`);
    ok(Boolean(claim), `${config.emne}: frigitt claim mangler`);
    ok(Boolean(object), `${config.emne}: direct object mangler`);
    ok(extensions.has(config.primarySource), `${config.emne}: primær production extension mangler`);
    ok(claim?.object_scope?.direct_object_id === config.object, `${config.emne}: claimet peker ikke til direct object`);
    ok(list(claim?.source_ids).includes(config.primarySource), `${config.emne}: claimet peker ikke til primær fulltekstkilde`);
    ok(object?.object_type === config.objectType, `${config.emne}: direct object har feil object_type`);
    ok(list(object?.locators).length >= 2, `${config.emne}: direct object må ha minst to locatorer`);
    ok(config.rightsCheck(object), `${config.emne}: upstream rights gate er ikke kompatibel med package use mode`);

    ok(Boolean(topic), `${config.emne}: canonicalt emne mangler`);
    ok(topic?.domain_id === 'musikalsk_analyse_lyd_struktur', `${config.emne}: emnet ligger i feil domene`);
    ok(list(topic?.research_object_types).includes(config.objectType), `${config.emne}: emnet tillater ikke ${config.objectType}`);
    ok(list(topic?.method_protocol_ids).includes(config.method), `${config.emne}: emnet tillater ikke ${config.method}`);
    ok(methodIds.has(config.method), `${config.emne}: metoden mangler i method_protocols`);

    const packagedObject = packageSources.get(config.object) || {};
    ok(packagedObject.use_mode === 'external_link_and_metadata_only', `${config.emne}: pakket direct object har feil use_mode`);
    ok(config.objectUrlPattern.test(text(packagedObject.url)), `${config.emne}: pakket direct object har feil persistent URL`);

    const set = setByEmne.get(config.emne) || {};
    for (const field of list(schema.set_contract?.required_fields)) ok(Object.hasOwn(set, field), `${config.emne}: settet mangler felt ${field}`);
    ok(set.phase === 'subject_pathway' && set.target_kind === 'subject_area', `${config.emne}: settet har feil subject-pathway type`);
    ok(set.targetId === config.target && set.area_id === 'musikalsk_analyse_lyd_struktur', `${config.emne}: settet peker til feil target/domene`);
    ok(set.order === configIndex + 1, `${config.emne}: feil set order`);
    ok(sameOrder(set.sequence, STAGES), `${config.emne}: settsekvensen er ikke canonical femtrinnsrekkefølge`);
    ok(sameOrder(set.question_ready_claim_ids, [config.claim]), `${config.emne}: settet kan ikke frigi andre claims`);
    ok(sameOrder(set.direct_object_ids, [config.object]), `${config.emne}: settet kan ikke bruke andre direct objects`);
    ok(list(set.questions).length === schema.set_contract?.questions_per_set, `${config.emne}: subject pathway skal ha fem spørsmål`);

    const answerIndexes = [];
    for (const [questionIndex, question] of list(set.questions).entries()) {
      totalQuestions += 1;
      const label = `${config.emne}/q${questionIndex + 1}`;
      for (const field of requiredQuestionFields) ok(Object.hasOwn(question, field), `${label}: mangler obligatorisk felt ${field}`);
      ok(!seenQuestionIds.has(question.id), `${label}: duplikat question id`);
      seenQuestionIds.add(question.id);
      ok(question.categoryId === 'musikk', `${label}: feil categoryId`);
      ok(question.targetId === config.target && question.question_scope === 'subject_area', `${label}: feil subject target/scope`);
      ok(question.emne_id === config.emne, `${label}: feil emne_id`);
      ok(question.method_id === config.method, `${label}: feil method_id`);
      ok(question.direct_object_id === config.object, `${label}: feil direct_object_id`);
      ok(question.pathway_stage === STAGES[questionIndex], `${label}: feil pathway stage`);
      ok(list(question.options).length >= 3 && list(question.options).length <= 4, `${label}: options må ha 3–4 alternativer`);
      ok(question.answerIndex >= 0 && question.answerIndex < list(question.options).length, `${label}: answerIndex utenfor options`);
      ok(question.answer === list(question.options)[question.answerIndex], `${label}: answer og answerIndex er usynkronisert`);
      answerIndexes.push(question.answerIndex);
      ok(text(question.knowledge).length > 20 && text(question.claim_basis).length > 20, `${label}: knowledge/claim_basis er for kort`);
      ok(question.source_origin === 'external', `${label}: synlig kunnskap må ha external source_origin`);
      ok(list(question.source).length >= 1, `${label}: source mangler`);
      for (const source of list(question.source)) {
        ok(config.allowedSources.includes(source.source_id), `${label}: ikke-frigitt kilde/objekt ${source.source_id}`);
        ok(text(source.locator).length > 4, `${label}: source locator mangler`);
        if (source.source_id === config.object) {
          ok(source.use_mode === 'external_link_and_metadata_only', `${label}: direct object mangler sikker use_mode`);
          ok(config.objectUrlPattern.test(text(source.url)), `${label}: direct object må bruke forventet persistent URL`);
        }
      }
      if (question.claim_id) ok(question.claim_id === config.claim && list(gate.question_ready_claim_ids).includes(question.claim_id), `${label}: claim_id er ikke frigitt`);
      if (questionIndex < 4) ok(question.claim_id === config.claim, `${label}: de fire forskningsspørsmålene må peke til det frigitte claimet`);
      if (questionIndex === 4) ok(!question.claim_id && question.evidence_type === 'rights_and_reuse_metadata', `${label}: rettighetstrinnet skal bygge på objektmetadata, ikke late som forskningsclaim`);
      const concepts = list(question.core_concepts);
      ok(concepts.length >= 2, `${label}: core_concepts mangler`);
      ok(sameOrder(question.concept_ids, concepts.map((value) => stableId('co', 'musikk', value))), `${label}: concept_ids er ikke deterministiske`);
      ok(sameOrder(question.term_ids, list(question.terms).map((value) => stableId('term', 'musikk', value))), `${label}: term_ids er ikke deterministiske`);
      const summary = text(question.knowledge_payload?.summary);
      const claimsFromSummary = splitClaims(summary);
      const effectiveClaims = claimsFromSummary.length ? claimsFromSummary : [summary];
      const expectedKnowledgeIds = effectiveClaims.map((item) => stableId('ku', 'musikk', item));
      ok(question.primary_knowledge_unit_id === expectedKnowledgeIds[0], `${label}: primary knowledge unit id er ikke deterministisk`);
      ok(sameOrder(question.knowledge_unit_ids, expectedKnowledgeIds), `${label}: knowledge_unit_ids er usynkronisert med canonical claim splitting`);
      ok(text(question.knowledge_payload?.explanation).length > 40, `${label}: knowledge explanation er for kort`);
      ok(question.feedback_basis === 'source_trace_and_explanation', `${label}: feedback_basis er feil`);
    }
    ok(new Set(answerIndexes).size >= 3, `${config.emne}: riktige svar må være fordelt over minst tre answerIndex-posisjoner`);
  }

  ok(totalQuestions === SET_CONFIGS.length * 5, `forventet ${SET_CONFIGS.length * 5} spørsmål totalt`);
  console.log(`Musikk subject pathway v1: ${pass} PASS, ${fail} FAIL`);
  console.log(`Pilot: ${pkg.sets.length} sett, ${totalQuestions} spørsmål, ${pkg.production_context.question_ready_claim_ids.length} released claims, ${pkg.production_context.direct_object_ids.length} direct objects, ${pkg.production_context.blocked_canonical_topic_count} temaer fortsatt blokkert.`);
  for (const error of errors) console.error(`FAIL: ${error}`);
  if (fail) process.exitCode = 1;
}

main();
