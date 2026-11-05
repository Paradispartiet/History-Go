#!/usr/bin/env node
// Runs ONLY after knowledge-canonical-data.mts --write in an isolated checkout
// with Minneparken temporarily added to the local quiz manifest.
// It does not activate, backfill or approve Knowledge data in the PR itself.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ID = 'minneparken_gamlebyen';
const QUIZ_PATH = `data/quiz/historie/${ID}_sets.json`;
const CARD_PATH = `data/quizcards/historie/${ID}_quizcard_v1.json`;
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const manifest = read('data/quiz/manifest.json');
const quiz = read(QUIZ_PATH);
const card = read(CARD_PATH);
const registry = read('data/knowledge/knowledge_units.generated.json');
const contract = read('reports/knowledge-contract-audit.json');
const questions = quiz.sets.flatMap((set) => set.questions);
const unitById = new Map((registry.units || []).map((unit) => [unit.knowledge_unit_id, unit]));
const issues = [];
const report = {
  schema: 'minneparken_isolated_knowledge_preview_v1',
  status: 'pending',
  targetId: ID,
  mode: 'isolated_manifest_injection_no_production_activation',
  disclaimer: 'All links and units here are candidates produced in a disposable worktree, not committed or activated in the canonical quiz/Knowledge manifests.',
  questionCount: questions.length,
  quizCardCount: card.cards?.[0]?.questions?.length || 0,
  primaryKnowledgeLinks: 0,
  knowledgeUnitsReferenced: 0,
  uniqueUnitIds: 0,
  externalSourceLinksVerified: 0,
  registryLinkedQuestions: 0,
  issues,
  links: [],
};

const add = (code, id, detail) => issues.push({ code, question_id: id || null, detail: String(detail || '') });
const activeInDisposableManifest = (manifest.files || []).includes(QUIZ_PATH)
  || (manifest.sets || []).some((entry) => entry?.file === QUIZ_PATH);
if (!activeInDisposableManifest) add('preview_manifest_missing', null, 'Temporary manifest injection was not made');
if (questions.length !== 21 || quiz.sets.length !== 3 || !quiz.sets.every((set) => set.questions.length === 7)) {
  add('quiz_size', null, 'Expected 3 x 7');
}
const uniqueReferenced = new Set();
const ids = new Set();
for (const question of questions) {
  const id = question.quiz_id || question.id;
  if (ids.has(id)) add('duplicate_quiz_id', id, id);
  ids.add(id);
  if (question.knowledge_link_status !== 'linked') add('not_linked', id, question.knowledge_link_status);
  const kuIds = Array.isArray(question.knowledge_unit_ids) ? question.knowledge_unit_ids : [];
  if (!kuIds.length || !kuIds.includes(question.primary_knowledge_unit_id)) add('primary_ku_missing', id, 'No canonical KU owner');
  else report.primaryKnowledgeLinks++;
  const expectedUrls = new Set(question.source_urls || []);
  const objectUrls = new Set((question.sources || []).map((source) => source.url));
  if (!expectedUrls.size || expectedUrls.size !== objectUrls.size || [...expectedUrls].some((url) => !objectUrls.has(url))) {
    add('quiz_source_mismatch', id, 'Knowledge source objects must match reviewed quiz source URLs');
  }
  for (const kuId of kuIds) {
    uniqueReferenced.add(kuId);
    if (!/^ku_historie_/.test(kuId)) add('invalid_ku_id', id, kuId);
    const unit = unitById.get(kuId);
    if (!unit) { add('missing_registry_unit', id, kuId); continue; }
    if (unit.subject_id !== 'historie') add('wrong_subject', id, kuId);
    if (!(unit.quiz_refs || []).includes(id)) add('missing_quiz_ref', id, kuId);
    const actualUrls = new Set((unit.sources || []).map((source) => source.url).filter(Boolean));
    if (!expectedUrls.size || [...expectedUrls].some((url) => !actualUrls.has(url))) {
      add('registry_external_citation_missing', id, kuId);
    } else {
      report.externalSourceLinksVerified++;
    }
    if (unit.status !== 'reviewed' && unit.status !== 'canonical') add('registry_review_status', id, unit.status);
  }
  report.links.push({
    question_id: id,
    claim_id: question.claim_id,
    primary_knowledge_unit_id: question.primary_knowledge_unit_id || null,
    knowledge_unit_ids: kuIds,
    reviewed_source_urls: [...expectedUrls],
  });
  if (kuIds.length && kuIds.every((x) => {
    const u = unitById.get(x); return u?.quiz_refs?.includes(id);
  })) report.registryLinkedQuestions++;
}
report.uniqueUnitIds = uniqueReferenced.size;
report.knowledgeUnitsReferenced = report.links.reduce((sum, x) => sum + x.knowledge_unit_ids.length, 0);

const cardQuestions = card.cards?.[0]?.questions || [];
if (cardQuestions.length !== 10) add('card_count', null, cardQuestions.length);
for (const cardQuestion of cardQuestions) {
  const original = questions.find((q) => q.id === cardQuestion.sourceQuestionId);
  if (!original) { add('card_question_missing', cardQuestion.id, cardQuestion.sourceQuestionId); continue; }
  if (JSON.stringify(original.sources) !== JSON.stringify(cardQuestion.sources)) {
    add('card_sources_diverged', original.quiz_id, 'Source object mismatch');
  }
  if (!original.primary_knowledge_unit_id || !unitById.has(original.primary_knowledge_unit_id)) {
    add('card_source_ku_missing', original.quiz_id, 'Source question lacks generated preview Knowledge unit');
  }
}
const mineErrors = (contract.failures || []).filter((row) => row.target_id === ID || String(row.file || '').includes(ID));
if (mineErrors.length) add('knowledge_contract_errors', null, JSON.stringify(mineErrors.slice(0, 5)));
report.knowledgeContractGlobalErrors = contract.questions_with_errors;
report.knowledgeContractMinneparkenErrors = mineErrors.length;
report.status = issues.length ? 'failed' : 'passed';
const index = process.argv.indexOf('--output');
if (index >= 0) {
  const output = process.argv[index + 1];
  assert.ok(output, '--output requires a path');
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({
  status: report.status,
  questionCount: report.questionCount,
  cardCount: report.quizCardCount,
  primaryLinks: report.primaryKnowledgeLinks,
  referencedUnits: report.knowledgeUnitsReferenced,
  uniqueUnits: report.uniqueUnitIds,
  verifiedUnitSourceEdges: report.externalSourceLinksVerified,
  registryLinkedQuestions: report.registryLinkedQuestions,
  globalContractErrors: report.knowledgeContractGlobalErrors,
  minneparkenErrors: report.knowledgeContractMinneparkenErrors,
  issues: issues.slice(0, 10),
}));
if (issues.length) process.exitCode = 1;
