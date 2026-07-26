#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const readJson = async (relative) => JSON.parse(await readFile(path.resolve(ROOT, relative), "utf8"));
const arr = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value ?? "").trim();
const failures = [];
const requireCondition = (condition, reason, details = {}) => { if (!condition) failures.push({ reason, ...details }); };
const uniqueIds = (items, selector) => {
  const ids = items.map(selector).filter(Boolean);
  return ids.length === new Set(ids).size;
};

const paths = {
  manifest: "data/fag/fag_manifest.json",
  pensum: "data/fag/teknologi/teknologipensum_canonical_v2_4.json",
  emner: "data/fag/teknologi/emner_teknologi_canonical_v2_4.json",
  fagkart: "data/fag/teknologi/fagkart_teknologi_canonical_v2_4.json",
  methods: "data/fag/teknologi/methods_teknologi_canonical_v2_4.json",
  subjectPackage: "data/quiz/teknologi/teknologi_subject_pathways_v1.json",
  subjectSchema: "data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json",
  quizManifest: "data/quiz/manifest.json",
  questionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json",
  knowledgeManifest: "data/knowledge/knowledge_manifest.json",
  knowledgeUnits: "data/knowledge/knowledge_units.generated.json",
  knowledgeReview: "data/knowledge/knowledge_emne_review_queue.generated.json",
  report: "reports/teknologi-canonical-integration-validation.json"
};

const [manifest, pensum, emner, fagkart, methods, subjectPackage, subjectSchema, quizManifest, questionSchema, knowledgeManifest, knowledgeUnits, knowledgeReview] = await Promise.all([
  readJson(paths.manifest), readJson(paths.pensum), readJson(paths.emner), readJson(paths.fagkart), readJson(paths.methods),
  readJson(paths.subjectPackage), readJson(paths.subjectSchema), readJson(paths.quizManifest), readJson(paths.questionSchema),
  readJson(paths.knowledgeManifest), readJson(paths.knowledgeUnits), readJson(paths.knowledgeReview)
]);

const technology = manifest.teknologi || {};
requireCondition(technology.pensum === "teknologi/teknologipensum_canonical_v2_4.json", "manifestet resolver ikke V2.4-pensum");
requireCondition(technology.emner === "teknologi/emner_teknologi_canonical_v2_4.json", "manifestet resolver ikke V2.4-emner");
requireCondition(technology.fagkart === "teknologi/fagkart_teknologi_canonical_v2_4.json", "manifestet resolver ikke V2.4-fagkart");
requireCondition(technology.methods === "teknologi/methods_teknologi_canonical_v2_4.json", "manifestet resolver ikke V2.4-metoder");
requireCondition(technology.canonicalModelVersion === "2.4", "manifestet mangler canonicalModelVersion 2.4");
requireCondition(technology.subjectPathwayPackage === "../quiz/teknologi/teknologi_subject_pathways_v1.json", "manifestet mangler subject pathway-pakken");
requireCondition(technology.universalCoverage?.status === "complete", "universell fagdekning er ikke markert komplett");
requireCondition(technology.geographicProduction?.status === "separate", "geografisk produksjon er ikke eksplisitt separert");

const modules = arr(pensum.modules);
const topics = arr(emner);
const categories = arr(fagkart.categories);
const methodItems = arr(methods.methods);
const hooks = categories.flatMap((category) => arr(category.topic_hooks));
requireCondition(modules.length === 12, "canonical pensum skal ha 12 moduler", { actual: modules.length });
requireCondition(topics.length === 48, "canonical emnefil skal ha 48 emner", { actual: topics.length });
requireCondition(categories.length === 12, "canonical fagkart skal ha 12 områder", { actual: categories.length });
requireCondition(methodItems.length === 35, "canonical metodefil skal ha 35 metoder", { actual: methodItems.length });
requireCondition(hooks.length === 36, "canonical fagkart skal ha 36 hooks", { actual: hooks.length });
requireCondition(uniqueIds(modules, (item) => item.module_id), "dupliserte modul-ID-er");
requireCondition(uniqueIds(topics, (item) => item.emne_id), "dupliserte emne-ID-er");
requireCondition(uniqueIds(categories, (item) => item.id), "dupliserte område-ID-er");
requireCondition(uniqueIds(methodItems, (item) => item.method_id), "dupliserte metode-ID-er");
requireCondition(uniqueIds(hooks, (item) => item.id), "dupliserte hook-ID-er");

const topicIds = new Set(topics.map((item) => item.emne_id));
const methodIds = new Set(methodItems.map((item) => item.method_id));
const hookIds = new Set(hooks.map((item) => item.id));
for (const module of modules) {
  requireCondition(arr(module.emner).length >= 4 && arr(module.emner).every((id) => topicIds.has(id)), "modul har ugyldige emner", { module_id: module.module_id });
  requireCondition(arr(module.metoder).length >= 2 && arr(module.metoder).every((id) => methodIds.has(id)), "modul har ugyldige metoder", { module_id: module.module_id });
}
for (const topic of topics) {
  requireCondition(String(topic.emne_id || "").startsWith("em_tek_"), "emne har feil prefix", { emne_id: topic.emne_id });
  requireCondition(arr(topic.method_ids).every((id) => methodIds.has(id)), "emne peker til ukjent metode", { emne_id: topic.emne_id });
  requireCondition(arr(topic.hook_ids).every((id) => hookIds.has(id)), "emne peker til ukjent hook", { emne_id: topic.emne_id });
}
requireCondition(!hookIds.has("hook_tek_tek_teknologihistorie_samfunn_risiko_feil"), "legacy typo-hook finnes fortsatt i canonical fagkart");

const subjectEntry = arr(quizManifest.subjectPackages).find((entry) => entry.subjectId === "teknologi");
requireCondition(subjectEntry?.file === paths.subjectPackage, "quizmanifestet mangler Teknologi subject package");
requireCondition(!arr(quizManifest.files).includes(paths.subjectPackage), "subject package er feilregistrert som vanlig quizfil");
requireCondition(!arr(quizManifest.sets).some((entry) => entry?.file === paths.subjectPackage), "subject package er feilregistrert som stedssett");
requireCondition(subjectSchema.package_kind === "subject_pathway", "subject schema har feil package_kind");
requireCondition(subjectPackage.package_kind === "subject_pathway", "subject package har feil package_kind");
requireCondition(subjectPackage.categoryId === "teknologi" && subjectPackage.targetId === "subject_teknologi", "subject package har feil identitet");
requireCondition(subjectPackage.production_context?.geographic_activation === false, "subject package kan feilaktiveres geografisk");

const sets = arr(subjectPackage.sets);
const questions = sets.flatMap((set) => arr(set.questions));
const requiredSequence = ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"];
requireCondition(sets.length === 12, "subject package skal ha 12 fagområdeforløp", { actual: sets.length });
requireCondition(questions.length === 60, "subject package skal ha 60 spørsmål", { actual: questions.length });
requireCondition(uniqueIds(questions, (item) => item.id), "dupliserte spørsmåls-ID-er");
const requiredQuestionFields = arr(subjectSchema.question_contract?.required_fields);
for (const set of sets) {
  requireCondition(set.phase === "subject_pathway" && set.target_kind === "subject_area", "sett har feil subject-pathway-identitet", { set_id: set.set_id });
  requireCondition(JSON.stringify(set.sequence) === JSON.stringify(requiredSequence), "sett har feil femtrinnssekvens", { set_id: set.set_id });
  requireCondition(arr(set.questions).length === 5, "sett skal ha fem spørsmål", { set_id: set.set_id });
  requireCondition(JSON.stringify(arr(set.questions).map((question) => question.pathway_stage)) === JSON.stringify(requiredSequence), "spørsmål følger ikke femtrinnssekvensen", { set_id: set.set_id });
}
for (const question of questions) {
  for (const field of requiredQuestionFields) {
    const value = question[field];
    requireCondition(value !== undefined && value !== null && (!(typeof value === "string") || clean(value)), "subject-spørsmål mangler obligatorisk felt", { id: question.id, field });
  }
  requireCondition(question.categoryId === "teknologi" && question.question_scope === "subject_area", "spørsmål har feil kategori eller scope", { id: question.id });
  requireCondition(topicIds.has(question.emne_id), "spørsmål peker til ukjent canonical emne", { id: question.id, emne_id: question.emne_id });
  requireCondition(methodIds.has(question.method_id), "spørsmål peker til ukjent canonical metode", { id: question.id, method_id: question.method_id });
  requireCondition(hookIds.has(question.topic_hook_id), "spørsmål peker til ukjent canonical hook", { id: question.id, topic_hook_id: question.topic_hook_id });
  requireCondition(arr(question.options).length >= 3 && question.answer === question.options[question.answerIndex], "spørsmål har ugyldig fasit", { id: question.id });
  requireCondition(String(question.primary_knowledge_unit_id || "").startsWith("ku_teknologi_"), "spørsmål mangler stabil Teknologi knowledge-unit-ID", { id: question.id });
  requireCondition(arr(question.concept_ids).every((id) => String(id).startsWith("co_teknologi_")), "spørsmål har ikke canonical concept-ID-er", { id: question.id });
  requireCondition(arr(question.term_ids).every((id) => String(id).startsWith("term_teknologi_")), "spørsmål har ikke canonical term-ID-er", { id: question.id });
}

requireCondition(arr(questionSchema.subject_area_required_fields).length >= 8, "globalt spørsmålsskjema mangler subject-area-felter");
requireCondition(questionSchema.target_fields?.subject_area_question?.includes("emne_id"), "globalt spørsmålsskjema mangler subject-area target contract");
requireCondition(knowledgeManifest.runtime?.subjectPathwaySources?.teknologi === "../quiz/teknologi/teknologi_subject_pathways_v1.json", "Knowledge-manifestet mangler Teknologi subject source");

const registryIds = new Set(arr(knowledgeUnits.units).map((unit) => unit.knowledge_unit_id));
const questionKnowledgeIds = new Set(questions.flatMap((question) => arr(question.knowledge_unit_ids)));
requireCondition([...questionKnowledgeIds].every((id) => registryIds.has(id)), "ikke alle subject-spørsmål er materialisert i canonical Knowledge-register");
const unresolvedForPackage = arr(knowledgeReview.items).filter((item) => item.file === paths.subjectPackage);
requireCondition(unresolvedForPackage.length === 0, "Teknologi subject package har uløste emnekoblinger", { count: unresolvedForPackage.length });

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.4",
  subject_id: "teknologi",
  counts: {
    areas: categories.length,
    modules: modules.length,
    topics: topics.length,
    methods: methodItems.length,
    hooks: hooks.length,
    subject_pathways: sets.length,
    subject_questions: questions.length,
    knowledge_units_referenced: questionKnowledgeIds.size
  },
  gates: {
    one_canonical_subject_model: failures.every((failure) => !String(failure.reason).includes("manifestet resolver")),
    universal_coverage_complete: technology.universalCoverage?.status === "complete",
    subject_pathways_separate_from_place_quiz: subjectEntry?.file === paths.subjectPackage && !arr(quizManifest.files).includes(paths.subjectPackage),
    global_question_contract_complete: questions.every((question) => requiredQuestionFields.every((field) => question[field] !== undefined)),
    knowledge_delivery_complete: [...questionKnowledgeIds].every((id) => registryIds.has(id)) && unresolvedForPackage.length === 0,
    geographic_production_explicitly_separate: technology.geographicProduction?.status === "separate"
  },
  failures
};
await mkdir(path.dirname(path.resolve(ROOT, paths.report)), { recursive: true });
await writeFile(path.resolve(ROOT, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
