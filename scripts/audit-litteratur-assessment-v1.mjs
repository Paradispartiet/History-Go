#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  pathway: 'data/quiz/litteratur/litteratur_subject_pathways_v1.json',
  legacyAudit: 'data/quiz/litteratur/litteratur_legacy_quiz_audit_v1.json',
  coverage: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',
  topics: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/topic_foundations_v1.json',
  index: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/index.json',
  emner: 'data/fag/litteratur/emner_litteratur_canonical_v4_5.json',
  methods: 'data/fag/litteratur/methods_litteratur_canonical_v4_5.json',
  quizManifest: 'data/quiz/manifest.json',
  knowledgeManifest: 'data/knowledge/knowledge_manifest.json',
  knowledgeUnits: 'data/knowledge/subjects/litteratur/knowledge_units.generated.json',
  concepts: 'data/knowledge/subjects/litteratur/concepts.generated.json',
  terms: 'data/knowledge/subjects/litteratur/terms.generated.json',
  fagManifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json'
});

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();
const unique = (values) => [...new Set(values.flat().filter(Boolean))];
function check(condition, message, failures) { if (!condition) failures.push(message); }

export function auditLitteraturAssessment() {
  const failures = [];
  const pkg = read(PATHS.pathway);
  const legacy = read(PATHS.legacyAudit);
  const coverage = read(PATHS.coverage);
  const topics = read(PATHS.topics);
  const index = read(PATHS.index);
  const quizManifest = read(PATHS.quizManifest);
  const knowledgeManifest = read(PATHS.knowledgeManifest);
  const fagManifest = read(PATHS.fagManifest);
  const inventory = read(PATHS.inventory);
  const status = read(PATHS.status).subjects.find((item) => item.id === 'litteratur');
  const canonicalEmner = new Set(read(PATHS.emner).map((item) => item.emne_id));
  const canonicalMethods = new Set(read(PATHS.methods).methods.map((item) => item.method_id));
  const registeredUnits = new Set(read(PATHS.knowledgeUnits).units.map((item) => item.knowledge_unit_id));
  const registeredConcepts = new Set(read(PATHS.concepts).concepts.map((item) => item.concept_id));
  const registeredTerms = new Set(read(PATHS.terms).terms.map((item) => item.term_id));
  const expectedSequence = ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'];
  const expectedAreas = coverage.coverage_areas.map((area) => area.id);
  const expectedArticles = topics.areas.flatMap((area) => area.topics.map((topic) => topic.id));
  const sourceIds = new Set(pkg.sources.map((source) => source.source_id));
  const articleClaims = new Map();

  for (const area of coverage.coverage_areas) {
    const chapter = read(`data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/${area.id}.json`);
    for (const moduleFile of chapter.moduleFiles) {
      const module = read(moduleFile);
      for (const section of module.sections) articleClaims.set(section.coverageTopic, new Set(section.paragraphClaimIds.flat()));
    }
  }

  check(pkg.schema === 'history_go_subject_pathway_package_v1', 'Feil pathway-schema', failures);
  check(pkg.status === 'canonical' && pkg.package_kind === 'subject_pathway', 'Pathway-pakken er ikke canonical', failures);
  check(pkg.categoryId === 'litteratur' && pkg.subject_id === 'litteratur' && pkg.targetId === 'subject_litteratur', 'Feil fagidentitet', failures);
  check(pkg.sources.length === 384 && sourceIds.size === 384, 'Pathway-pakken må ha 384 unike canonicale kilder', failures);
  check(pkg.sets.length === 28, 'Litteratur må ha 28 pathways', failures);
  check(JSON.stringify(pkg.sets.map((set) => set.area_id)) === JSON.stringify(expectedAreas), 'Pathways følger ikke canonical områderekkefølge', failures);

  const questions = [];
  const articleBindings = [];
  const claimBindings = [];
  for (const [setIndex, set] of pkg.sets.entries()) {
    check(set.order === setIndex + 1, `${set.set_id}: feil rekkefølge`, failures);
    check(set.phase === 'subject_pathway' && set.target_kind === 'subject_area', `${set.set_id}: feil pathway-identitet`, failures);
    check(JSON.stringify(set.sequence) === JSON.stringify(expectedSequence), `${set.set_id}: feil femtrinnssekvens`, failures);
    check(set.questions.length === 5, `${set.set_id}: må ha fem spørsmål`, failures);
    check(set.article_ids.length === 6 && new Set(set.article_ids).size === 6, `${set.set_id}: må dekke seks ulike artikler`, failures);
    for (const [questionIndex, question] of set.questions.entries()) {
      questions.push(question);
      articleBindings.push(...question.article_ids);
      claimBindings.push(...question.claim_ids);
      const required = ['id', 'quiz_id', 'categoryId', 'targetId', 'question_scope', 'question', 'options', 'answer', 'answerIndex', 'knowledge', 'difficulty', 'question_type', 'emne_id', 'source', 'primary_knowledge_unit_id', 'knowledge_unit_ids', 'concept_ids', 'term_ids', 'learning_objective_id', 'evidence_type', 'knowledge_payload', 'feedback_basis'];
      for (const field of required) check(question[field] != null && question[field] !== '', `${question.id}: mangler ${field}`, failures);
      check(question.pathway_stage === expectedSequence[questionIndex], `${question.id}: feil pathway-trinn`, failures);
      check(question.categoryId === 'litteratur' && question.subject_id === 'litteratur' && question.question_scope === 'subject_area', `${question.id}: feil scope`, failures);
      check(list(question.options).length === 3 && new Set(question.options).size === 3, `${question.id}: må ha tre unike alternativer`, failures);
      check(question.options[question.answerIndex] === question.answer, `${question.id}: svarindeks er inkonsistent`, failures);
      check(text(question.question).length >= 55 && text(question.knowledge).length >= 45, `${question.id}: for kort fagtekst`, failures);
      check(!/\b(?:TODO|TBD|placeholder|undefined|null)\b/i.test(`${question.question} ${question.knowledge} ${question.explanation}`), `${question.id}: generatorfyll oppdaget`, failures);
      check(canonicalEmner.has(question.emne_id) && list(question.emne_ids).every((id) => canonicalEmner.has(id)), `${question.id}: ugyldig emne`, failures);
      check(canonicalMethods.has(question.method_id), `${question.id}: ugyldig metode`, failures);
      check(question.case_fact === false, `${question.id}: universelt pathway kan ikke være case_fact`, failures);
      check(question.knowledge_link_status === 'linked' && question.knowledge_link_evidence?.method === 'explicit', `${question.id}: Knowledge-lenken er ikke eksplisitt`, failures);
      check(question.knowledge_unit_ids.includes(question.primary_knowledge_unit_id), `${question.id}: primary Knowledge unit mangler i listen`, failures);
      for (const id of question.knowledge_unit_ids) check(registeredUnits.has(id), `${question.id}: ukjent Knowledge unit ${id}`, failures);
      for (const id of question.concept_ids) check(registeredConcepts.has(id), `${question.id}: ukjent concept ${id}`, failures);
      for (const id of question.term_ids) check(registeredTerms.has(id), `${question.id}: ukjent term ${id}`, failures);
      check(question.source.length >= 2, `${question.id}: trenger minst to kildespor`, failures);
      for (const source of question.source) {
        check(sourceIds.has(source.source_id), `${question.id}: ukjent kilde ${source.source_id}`, failures);
        check(/^https:\/\//.test(text(source.url)) && text(source.locator) && text(source.claim_basis), `${question.id}: ufullstendig inspectable kilde`, failures);
      }
      check(question.article_ids.length === (questionIndex === 4 ? 2 : 1), `${question.id}: feil artikkeldekning for trinnet`, failures);
      for (const articleId of question.article_ids) check(articleClaims.has(articleId), `${question.id}: ukjent artikkel ${articleId}`, failures);
      for (const claimId of question.claim_ids) {
        check(question.article_ids.some((articleId) => articleClaims.get(articleId)?.has(claimId)), `${question.id}: claim ${claimId} tilhører ikke bundet artikkel`, failures);
      }
    }
  }

  check(questions.length === 140, 'Litteratur må ha 140 pathway-spørsmål', failures);
  check(new Set(questions.map((item) => item.id)).size === 140, 'Spørsmåls-ID-er må være unike', failures);
  check(new Set(questions.map((item) => item.question)).size === 140, 'Spørsmålstekster må være unike', failures);
  check(new Set(questions.map((item) => item.knowledge)).size === 140, 'Knowledge-tekster må være unike', failures);
  check(articleBindings.length === 168 && new Set(articleBindings).size === 168, 'Spørsmålene må dekke hver av 168 artikler nøyaktig én gang', failures);
  check(JSON.stringify([...new Set(articleBindings)].sort()) === JSON.stringify([...expectedArticles].sort()), 'Artikkelbindingene avviker fra topic foundation-registeret', failures);
  check(claimBindings.length === 168 && new Set(claimBindings).size === 168, 'Vurderingslaget må bruke 168 unike verifiserte claims', failures);
  check(new Set(questions.map((item) => item.emne_id)).size >= 35, 'Emnebredden er for lav', failures);
  check(new Set(questions.map((item) => item.method_id)).size >= 35, 'Metodebredden er for lav', failures);
  check(new Set(questions.flatMap((item) => item.concept_ids)).size >= 450, 'Begrepsbredden er for lav', failures);

  check(legacy.status === 'complete' && legacy.summary.reviewed === 421 && legacy.records.length === 421, 'Legacy-auditen må dekke 421 spørsmål', failures);
  check(legacy.summary.prior_active === 201 && legacy.summary.retained_active === 0, 'Udokumenterte aktive legacyspørsmål er ikke avviklet', failures);
  check(!quizManifest.files.includes('data/quiz/quiz_litteratur.json') && !quizManifest.files.includes('data/quiz/quiz_litteratur_from_populaerkultur.json'), 'Legacy-litteraturquiz står fortsatt aktivt i manifestet', failures);
  const subjectPackage = quizManifest.subjectPackages.find((item) => item.subjectId === 'litteratur');
  check(subjectPackage?.file === PATHS.pathway && subjectPackage?.status === 'active', 'Quizmanifestet mangler aktiv Litteratur-pathway', failures);
  check(knowledgeManifest.runtime?.subjectPathwaySources?.litteratur === '../quiz/litteratur/litteratur_subject_pathways_v1.json', 'Knowledge-manifestet mangler Litteratur-pathway', failures);
  check(knowledgeManifest.runtime?.subjectCanonicalRegistries?.litteratur?.knowledge_units === 'subjects/litteratur/knowledge_units.generated.json', 'Knowledge-manifestet mangler Litteratur-registeret', failures);
  check(fagManifest.litteratur?.subjectPathwayPackage === '../quiz/litteratur/litteratur_subject_pathways_v1.json', 'Fagmanifestet mangler Litteratur-pathway', failures);
  const inventoryEntry = inventory.subjects.find((item) => item.id === 'litteratur');
  check(inventoryEntry?.optionalManifestFields.includes('subjectPathwayPackage'), 'Fagverkinventaret mangler pathway-feltet', failures);
  check(status?.navigationStatus === 'materialized' && status?.assessmentStatus === 'audited' && status?.editorialStatus === 'complete', 'Global sluttstatus er ikke materialized/audited/complete', failures);
  check(status?.nextGate === 'maintenance_and_source_refresh', 'Neste port skal være vedlikehold og kildeoppfriskning', failures);
  check(index.status === 'canonical_scientific_package_complete' && index.summary?.assessment_status === 'audited', 'Vitenskapelig pakke mangler komplett vurderingsstatus', failures);
  check(index.files?.subject_pathway_assessment === '../../../quiz/litteratur/litteratur_subject_pathways_v1.json', 'Vitenskapelig pakke har feil vurderingspeker', failures);
  check(index.files?.legacy_quiz_audit === '../../../quiz/litteratur/litteratur_legacy_quiz_audit_v1.json', 'Vitenskapelig pakke har feil legacy-auditpeker', failures);

  if (failures.length) throw new Error(failures.join('\n'));
  return {
    pathways: pkg.sets.length,
    questions: questions.length,
    assessed_articles: new Set(articleBindings).size,
    assessed_claims: new Set(claimBindings).size,
    knowledge_units: new Set(questions.flatMap((item) => item.knowledge_unit_ids)).size,
    concepts: new Set(questions.flatMap((item) => item.concept_ids)).size,
    emner: new Set(questions.flatMap((item) => item.emne_ids)).size,
    methods: new Set(questions.map((item) => item.method_id)).size,
    sources: pkg.sources.length,
    legacy_reviewed: legacy.summary.reviewed,
    next_gate: status.nextGate
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = auditLitteraturAssessment();
    console.log(`Litteratur assessment OK: ${report.pathways} pathways, ${report.questions} spørsmål, ${report.assessed_articles} artikler, ${report.knowledge_units} Knowledge units og ${report.legacy_reviewed} legacybeslutninger.`);
  } catch (error) {
    console.error(`Litteratur assessment FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
