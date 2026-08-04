#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  pathway: 'data/quiz/subkultur/subkultur_subject_pathways_v1.json',
  legacyAudit: 'data/quiz/subkultur/subkultur_legacy_quiz_audit_v1.json',
  quizManifest: 'data/quiz/manifest.json',
  knowledgeManifest: 'data/knowledge/knowledge_manifest.json',
  knowledgeUnits: 'data/knowledge/subjects/subkultur/knowledge_units.generated.json',
  concepts: 'data/knowledge/subjects/subkultur/concepts.generated.json',
  terms: 'data/knowledge/subjects/subkultur/terms.generated.json',
  knowledgeAudit: 'reports/knowledge-contract-audit.json',
  fagManifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  chapterManifest: 'data/fagverk/subkultur/manifest.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json'
});

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();
function assert(condition, message) { if (!condition) throw new Error(message); }

export function auditSubkulturQuizKnowledge() {
  const pkg = readJson(PATHS.pathway);
  const legacyAudit = readJson(PATHS.legacyAudit);
  const quizManifest = readJson(PATHS.quizManifest);
  const knowledgeManifest = readJson(PATHS.knowledgeManifest);
  const knowledgeAudit = readJson(PATHS.knowledgeAudit);
  const fagManifest = readJson(PATHS.fagManifest);
  const inventory = readJson(PATHS.inventory);
  const status = list(readJson(PATHS.status).subjects).find((item) => item.id === 'subkultur');
  const chapterManifest = readJson(PATHS.chapterManifest);
  const canonicalClaims = new Set(readJson(PATHS.claims).claims.map((item) => item.claim_id));
  const canonicalMethods = new Set(readJson(PATHS.methods).methods.map((item) => item.method_id));
  const canonicalEmner = new Set(readJson(PATHS.emner).map((item) => item.emne_id));
  const registeredKnowledge = new Set(readJson(PATHS.knowledgeUnits).units.map((item) => item.knowledge_unit_id));
  const registeredConcepts = new Set(readJson(PATHS.concepts).concepts.map((item) => item.concept_id));
  const registeredTerms = new Set(readJson(PATHS.terms).terms.map((item) => item.term_id));
  const expectedSequence = ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'];

  assert(pkg.schema === 'history_go_subject_pathway_package_v1', 'Pathway-pakken har feil schema');
  assert(pkg.status === 'canonical' && pkg.package_kind === 'subject_pathway', 'Pathway-pakken er ikke canonical');
  assert(pkg.categoryId === 'subkultur' && pkg.subject_id === 'subkultur', 'Pathway-pakken har feil fagidentitet');
  assert(list(pkg.sets).length === 8, 'Subkultur må ha åtte pathways');
  assert(list(pkg.sources).length >= 20, 'Pathway-pakken må ha et inspectable faglig kildegrunnlag');

  const questions = [];
  const failures = [];
  for (const [setIndex, set] of list(pkg.sets).entries()) {
    const setQuestions = list(set.questions);
    if (set.order !== setIndex + 1) failures.push(`${set.set_id}: feil rekkefølge`);
    if (set.phase !== 'subject_pathway' || set.target_kind !== 'subject_area') failures.push(`${set.set_id}: feil pathway-identitet`);
    if (JSON.stringify(set.sequence) !== JSON.stringify(expectedSequence)) failures.push(`${set.set_id}: feil sekvens`);
    if (setQuestions.length !== 5) failures.push(`${set.set_id}: må ha fem spørsmål`);
    if (new Set(list(set.emne_ids)).size !== 5) failures.push(`${set.set_id}: må vurdere fem ulike emner`);
    setQuestions.forEach((question, questionIndex) => {
      questions.push(question);
      if (question.pathway_stage !== expectedSequence[questionIndex]) failures.push(`${question.id}: feil trinn`);
      if (question.categoryId !== 'subkultur' || question.subject_id !== 'subkultur') failures.push(`${question.id}: feil fag`);
      if (!text(question.emne_id).startsWith('em_sub_') || !canonicalEmner.has(question.emne_id)) failures.push(`${question.id}: ugyldig emne`);
      if (!canonicalMethods.has(question.method_id)) failures.push(`${question.id}: ugyldig metode`);
      if (!canonicalClaims.has(question.claim_id)) failures.push(`${question.id}: ugyldig claim`);
      if (question.case_fact !== false) failures.push(`${question.id}: theory pathway kan ikke være case_fact`);
      if (list(question.options).length !== 3 || question.options[question.answerIndex] !== question.answer) failures.push(`${question.id}: svarindeks er inkonsistent`);
      if (list(question.source).length < 2 || question.source.some((source) => !text(source.url) || !text(source.claim_basis))) failures.push(`${question.id}: kildeparet er ufullstendig`);
      if (!text(question.primary_knowledge_unit_id) || !list(question.knowledge_unit_ids).includes(question.primary_knowledge_unit_id)) failures.push(`${question.id}: mangler primary Knowledge unit`);
      list(question.knowledge_unit_ids).forEach((id) => { if (!registeredKnowledge.has(id)) failures.push(`${question.id}: ukjent Knowledge unit ${id}`); });
      list(question.concept_ids).forEach((id) => { if (!registeredConcepts.has(id)) failures.push(`${question.id}: ukjent concept ${id}`); });
      list(question.term_ids).forEach((id) => { if (!registeredTerms.has(id)) failures.push(`${question.id}: ukjent term ${id}`); });
      if (question.knowledge_link_status !== 'linked' || question.knowledge_link_evidence?.method !== 'explicit') failures.push(`${question.id}: Knowledge-lenken er ikke eksplisitt`);
    });
  }

  assert(failures.length === 0, failures.join('\n'));
  assert(questions.length === 40, 'Subkultur må ha 40 pathway-spørsmål');
  assert(new Set(questions.map((item) => item.id)).size === 40, 'Spørsmåls-ID-er må være unike');
  assert(new Set(questions.map((item) => item.question)).size === 40, 'Spørsmålstekster må være unike');
  assert(new Set(questions.map((item) => item.knowledge)).size === 40, 'Knowledge-tekster må være unike');
  assert(new Set(questions.map((item) => item.emne_id)).size === 40, 'Pathways må vurdere 40 ulike emner');

  assert(legacyAudit.status === 'complete', 'Legacy-auditen er ikke komplett');
  assert(legacyAudit.summary.reviewed === 83, 'Legacy-auditen må dekke 83 spørsmål');
  assert(legacyAudit.summary.retained_active === 0, 'Udokumenterte legacyspørsmål kan ikke være aktive');
  assert(legacyAudit.summary.foreign_emne_bindings_active_after_audit === 0, 'Fremmede emnebindinger er fortsatt aktive');
  assert(list(legacyAudit.records).length === 83, 'Legacy-auditen mangler radbeslutninger');

  assert(!list(quizManifest.files).includes('data/quiz/quiz_subkultur.json'), 'Legacyquiz står fortsatt i runtime-manifestet');
  const subjectEntry = list(quizManifest.subjectPackages).find((item) => item.subjectId === 'subkultur');
  assert(subjectEntry?.file === PATHS.pathway && subjectEntry?.status === 'active', 'Quizmanifestet mangler aktiv Subkultur-pathway');
  assert(knowledgeManifest.runtime?.subjectPathwaySources?.subkultur === '../quiz/subkultur/subkultur_subject_pathways_v1.json', 'Knowledge-manifestet mangler Subkultur-pathway');
  assert(knowledgeManifest.runtime?.subjectCanonicalRegistries?.subkultur?.knowledge_units === 'subjects/subkultur/knowledge_units.generated.json', 'Knowledge-manifestet mangler Subkultur-registeret');
  assert(fagManifest.subkultur?.subjectPathwayPackage === '../quiz/subkultur/subkultur_subject_pathways_v1.json', 'Fagmanifestet mangler Subkultur-pathway');
  const inventoryEntry = list(inventory.subjects).find((item) => item.id === 'subkultur');
  assert(list(inventoryEntry?.optionalManifestFields).includes('subjectPathwayPackage'), 'Fagverkinventaret mangler pathway-feltet');

  assert(list(knowledgeAudit.failures).filter((item) => item.subject_id === 'subkultur').length === 0, 'Knowledge-auditen har Subkultur-feil');
  assert(list(knowledgeAudit.warnings).filter((item) => item.subject_id === 'subkultur').length === 0, 'Knowledge-auditen har Subkultur-advarsler');
  assert(status?.navigationStatus === 'planned' && status?.assessmentStatus === 'pending' && status?.editorialStatus === 'not_started', 'Global status er forskuttert før runtime');
  assert(status?.nextGate === 'runtime_materialization_and_final_gate', 'Neste port skal være runtime-materialisering');
  assert(chapterManifest.assessment?.pathways === 8 && chapterManifest.assessment?.questions === 40, 'Kapittelmanifestet mangler assessment-oppsummering');
  assert(chapterManifest.next_gate === 'runtime_materialization_and_final_gate', 'Kapittelmanifestet har feil neste port');

  return {
    pathways: pkg.sets.length,
    questions: questions.length,
    assessed_emner: new Set(questions.map((item) => item.emne_id)).size,
    knowledge_units: new Set(questions.flatMap((item) => item.knowledge_unit_ids)).size,
    sources: pkg.sources.length,
    legacy_reviewed: legacyAudit.summary.reviewed,
    active_legacy: legacyAudit.summary.retained_active,
    subkultur_knowledge_failures: 0,
    subkultur_knowledge_warnings: 0,
    next_gate: status.nextGate
  };
}

function main() {
  try {
    const report = auditSubkulturQuizKnowledge();
    console.log(`Subkultur Quiz/Knowledge OK: ${report.pathways} pathways, ${report.questions} spørsmål, ${report.knowledge_units} Knowledge units, ${report.legacy_reviewed} legacybeslutninger.`);
  } catch (error) {
    console.error(`Subkultur Quiz/Knowledge FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
