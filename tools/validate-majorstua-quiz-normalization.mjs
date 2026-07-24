#!/usr/bin/env node
import fs from 'node:fs';
import { auditQuizContent } from '../scripts/audit-quiz-content-quality.mjs';

const QUIZ_PATH = 'data/quiz/by/majorstua_sets.json';
const INVENTORY_PATH = 'reports/quiz-normal-opening-migration-inventory.json';
const POLICY_PATH = 'data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json';
const EXPECTED_REVISION = 'majorstua-normal-opening-2026-07-24';
const doc = JSON.parse(fs.readFileSync(QUIZ_PATH, 'utf8'));
const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
const policy = JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8'));
let pass = 0;

function ok(value, message) {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass += 1;
}

const questions = doc.sets.flatMap((set) => set.questions);
ok(doc.targetId === 'majorstuen_krysset', 'Riktig Majorstua-mål er bevart');
ok(doc.categoryId === 'by', 'By-kategorien er bevart');
ok(doc.quality_revision === EXPECTED_REVISION, 'Majorstua har ny kvalitetsrevisjon');
ok(doc.normal_opening_policy?.version === '1.1', 'Quizfila dokumenterer global åpningspolicy 1.1');
ok(doc.sets.length === 7, 'Majorstua har fortsatt sju sett');
ok(JSON.stringify(doc.sets.map((set) => set.questions.length)) === JSON.stringify([7, 7, 6, 6, 6, 6, 6]), 'Settene følger 7 + 7 + 6 + 6 + 6 + 6 + 6');
ok(questions.length === 44, 'Majorstua har 44 spørsmål');
ok(new Set(questions.map((question) => question.quiz_id)).size === 44, 'Alle quiz-ID-er er unike');
ok(new Set(questions.map((question) => question.id)).size === 44, 'Alle interne spørsmål-ID-er er unike');

for (const question of questions) {
  ok(Boolean(String(question.question || '').trim()), `${question.quiz_id} har spørsmålstekst`);
  ok(Array.isArray(question.options) && question.options.length >= 3, `${question.quiz_id} har minst tre alternativer`);
  ok(question.answerIndex === 0, `${question.quiz_id} har eksplisitt answerIndex 0`);
  ok(question.options[question.answerIndex] === question.answer, `${question.quiz_id} har fasit blant alternativene`);
  ok(Array.isArray(question.source) && question.source.length > 0, `${question.quiz_id} har kilde`);
  ok(Boolean(question.primary_knowledge_unit_id), `${question.quiz_id} har primær Knowledge-enhet`);
  ok(Array.isArray(question.knowledge_unit_ids) && question.knowledge_unit_ids.length > 0, `${question.quiz_id} har Knowledge-kobling`);
  ok(question.knowledge_link_status === 'linked', `${question.quiz_id} har kanonisk Knowledge-status`);
}

const openingQuestions = doc.sets.slice(0, 2).flatMap((set) => set.questions);
ok(openingQuestions.length === policy.opening_block.total_questions, 'Åpningen har nøyaktig fjorten spørsmål');
const allowedOpeningTypes = new Set(policy.opening_block.allowed_question_types);
const forbiddenBindingFields = policy.opening_block.forbidden_binding_fields;
for (const question of openingQuestions) {
  ok(allowedOpeningTypes.has(question.question_type), `${question.quiz_id} bruker tillatt åpningstype`);
  ok(forbiddenBindingFields.every((field) => !question[field]), `${question.quiz_id} har ingen forbudt fagbinding i åpningen`);
}

const forbiddenVisiblePatterns = [
  /hvordan kan .*leses som/iu,
  /hvorfor passer .*emnet/iu,
  /mest presise faglige lesning/iu,
  /hvilket begrep (?:passer|beskriver|forklarer)/iu,
  /hvilken (?:teori|teoretiker|metode|hook)/iu,
  /hvilken norsk tenker/iu,
  /hvem er mest nyttig/iu,
  /canonical-mapping/iu,
  /hvilket emne passer best/iu,
  /hva gjør .*relevant for emnet/iu,
  /hva gjør .*mer enn/iu
];
for (const question of questions) {
  ok(forbiddenVisiblePatterns.every((pattern) => !pattern.test(question.question)), `${question.quiz_id} unngår oppkonstruert maltekst`);
}

const audit = await auditQuizContent({ rootDir: 'data/quiz' });
const majorstuaGroup = audit.groups.find((group) => group.file === QUIZ_PATH && group.target === 'majorstuen_krysset');
ok(Boolean(majorstuaGroup), 'Majorstua finnes i innholdsauditen');
ok(JSON.stringify(majorstuaGroup.counts) === JSON.stringify({ fact: 22, context: 12, theory: 10 }), 'Innholdsbalansen er 22 fakta / 12 sammenheng / 10 teori');
ok(majorstuaGroup.violations.length === 0, 'Majorstua har ingen balansebrudd');
ok(audit.templateViolations.filter((item) => item.file === QUIZ_PATH).length === 0, 'Majorstua har ingen gamle malbrudd');
ok(audit.optionLengthSignals.filter((item) => item.file === QUIZ_PATH).length === 0, 'Majorstua har ingen svarlengdesignaler');

const record = inventory.files.find((item) => item.file === QUIZ_PATH);
ok(Boolean(record), 'Majorstua finnes i migreringsinventaret');
ok(record.status === 'manifest_only', 'Majorstua forblir manifestregistrert legacy-fil');
ok(record.opening.compliant === true, 'Majorstua består global 2 × 7 i inventaret');
ok(record.opening.structuralViolations.length === 0, 'Majorstua har ingen strukturelle åpningsbrudd');
ok(record.opening.questionViolations.length === 0, 'Majorstua har ingen åpningsspørsmålsbrudd');
ok(record.content.templateViolations === 0, 'Inventaret viser null malbrudd');
ok(record.content.balanceViolations === 0, 'Inventaret viser null balansebrudd');
ok(record.content.optionLengthSignals === 0, 'Inventaret viser null svarlengdesignaler');
ok(record.migrationRequired === false, 'Majorstua er ute av migreringskøen');
ok(record.contentReviewRequired === (record.content.repeatedOpeningSignals > 0), 'Eventuelt gjennomgangsflagg skyldes bare informativ gjentakelsesaudit');

for (const id of ['by_majorstua_set_1_q7', 'by_majorstua_set_2_q7']) {
  const question = questions.find((item) => item.quiz_id === id);
  ok(Boolean(question), `${id} finnes`);
  ok(question.source.every((url) => /^https:\/\//u.test(url)), `${id} bruker eksterne kilder`);
}

console.log(`PASS: ${pass}`);
console.log('RESULTAT: PASS');
