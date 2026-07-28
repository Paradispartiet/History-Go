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
const hasValue = (value) => value !== undefined && value !== null && (!(typeof value === "string") || clean(value));

const paths = {
  manifest: "data/fag/fag_manifest.json",
  scientificIndex: "data/fag/teknologi/teknologi_scientific_v2/index.json",
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
  knowledgeConcepts: "data/knowledge/concepts.generated.json",
  knowledgeTerms: "data/knowledge/terms.generated.json",
  knowledgeReview: "data/knowledge/knowledge_emne_review_queue.generated.json",
  report: "reports/teknologi-canonical-integration-validation.json"
};

const [manifest, scientificIndex, pensum, emner, fagkart, methods, subjectPackage, subjectSchema, quizManifest, questionSchema, knowledgeManifest, knowledgeUnits, knowledgeConcepts, knowledgeTerms, knowledgeReview] = await Promise.all([
  readJson(paths.manifest), readJson(paths.scientificIndex), readJson(paths.pensum), readJson(paths.emner), readJson(paths.fagkart), readJson(paths.methods),
  readJson(paths.subjectPackage), readJson(paths.subjectSchema), readJson(paths.quizManifest), readJson(paths.questionSchema),
  readJson(paths.knowledgeManifest), readJson(paths.knowledgeUnits), readJson(paths.knowledgeConcepts), readJson(paths.knowledgeTerms), readJson(paths.knowledgeReview)
]);

const areaEntries = await Promise.all(arr(scientificIndex.area_files).map(async (file) => ({ file, doc: await readJson(file) })));
const areaFileById = new Map(areaEntries.map(({ file, doc }) => [doc.area_id, file]));

const technology = manifest.vitenskap?.specializations?.teknologi || {};
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
requireCondition(areaFileById.size === categories.length, "scientific index dekker ikke alle canonical områder", { indexed: areaFileById.size, canonical: categories.length });

const categoryIds = new Set(categories.map((item) => item.id));
const topicIds = new Set(topics.map((item) => item.emne_id));
const methodIds = new Set(methodItems.map((item) => item.method_id));
const hookIds = new Set(hooks.map((item) => item.id));
const topicAreaById = new Map(topics.map((item) => [item.emne_id, item.area_id]));
const methodAreaById = new Map(methodItems.map((item) => [item.method_id, item.area_id]));
const hookAreaById = new Map(categories.flatMap((category) => arr(category.topic_hooks).map((hook) => [hook.id, category.id])));
for (const module of modules) {
  requireCondition(arr(module.emner).length >= 4 && arr(module.emner).every((id) => topicIds.has(id)), "modul har ugyldige emner", { module_id: module.module_id });
  requireCondition(arr(module.metoder).length >= 2 && arr(module.metoder).every((id) => methodIds.has(id)), "modul har ugyldige metoder", { module_id: module.module_id });
}
for (const topic of topics) {
  requireCondition(String(topic.emne_id || "").startsWith("em_tek_"), "emne har feil prefix", { emne_id: topic.emne_id });
  requireCondition(categoryIds.has(topic.area_id), "emne peker til ukjent område", { emne_id: topic.emne_id, area_id: topic.area_id });
  requireCondition(arr(topic.method_ids).every((id) => methodIds.has(id)), "emne peker til ukjent metode", { emne_id: topic.emne_id });
  requireCondition(arr(topic.hook_ids).every((id) => hookIds.has(id)), "emne peker til ukjent hook", { emne_id: topic.emne_id });
}
requireCondition(!hookIds.has("hook_tek_tek_teknologihistorie_samfunn_risiko_feil"), "legacy typo-hook finnes fortsatt i canonical fagkart");

const subjectEntry = arr(quizManifest.subjectPackages).find((entry) => entry.subjectId === "teknologi" && entry.parentSubjectId === "vitenskap" && entry.specializationId === "teknologi");
requireCondition(subjectEntry?.file === paths.subjectPackage, "quizmanifestet mangler Teknologi subject package");
requireCondition(!arr(quizManifest.files).includes(paths.subjectPackage), "subject package er feilregistrert som vanlig quizfil");
requireCondition(!arr(quizManifest.sets).some((entry) => entry?.file === paths.subjectPackage), "subject package er feilregistrert som stedssett");
requireCondition(subjectSchema.package_kind === "subject_pathway", "subject schema har feil package_kind");
requireCondition(subjectPackage.package_kind === "subject_pathway", "subject package har feil package_kind");
requireCondition(subjectPackage.categoryId === "teknologi" && subjectPackage.targetId === "subject_teknologi", "subject package har feil identitet");
requireCondition(subjectPackage.production_context?.geographic_activation === false, "subject package kan feilaktiveres geografisk");
for (const field of arr(subjectSchema.required_top_fields)) {
  requireCondition(hasValue(subjectPackage[field]), "subject package mangler obligatorisk toppfelt", { field });
}

const sets = arr(subjectPackage.sets);
const questions = sets.flatMap((set) => arr(set.questions));
const requiredSequence = ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"];
const requiredGlobalSubjectFields = ["primary_knowledge_unit_id", "knowledge_unit_ids", "concept_ids", "term_ids", "learning_objective_id", "evidence_type", "knowledge_payload", "feedback_basis"];
const requiredTargetFields = ["targetId", "question_scope", "emne_id"];
requireCondition(sets.length === 12, "subject package skal ha 12 fagområdeforløp", { actual: sets.length });
requireCondition(questions.length === 60, "subject package skal ha 60 spørsmål", { actual: questions.length });
requireCondition(uniqueIds(sets, (item) => item.set_id), "dupliserte set-ID-er");
requireCondition(uniqueIds(sets, (item) => item.area_id), "dupliserte område-ID-er i subject pathways");
requireCondition(uniqueIds(sets, (item) => item.targetId), "dupliserte subject target-ID-er");
requireCondition(uniqueIds(questions, (item) => item.id), "dupliserte spørsmåls-ID-er");
const setAreaIds = new Set(sets.map((set) => set.area_id));
requireCondition(setAreaIds.size === categoryIds.size && [...categoryIds].every((id) => setAreaIds.has(id)), "subject pathways dekker ikke hvert canonical område nøyaktig én gang");
const requiredQuestionFields = arr(subjectSchema.question_contract?.required_fields);
for (const field of requiredGlobalSubjectFields) {
  requireCondition(arr(questionSchema.subject_area_required_fields).includes(field), "globalt spørsmålsskjema mangler obligatorisk subject-area-felt", { field });
  requireCondition(requiredQuestionFields.includes(field), "subject pathway-skjema mangler globalt obligatorisk felt", { field });
}
for (const field of requiredTargetFields) {
  requireCondition(arr(questionSchema.target_fields?.subject_area_question).includes(field), "globalt spørsmålsskjema mangler subject-area targetfelt", { field });
}

for (const set of sets) {
  for (const field of arr(subjectSchema.set_contract?.required_fields)) {
    requireCondition(hasValue(set[field]), "subject-sett mangler obligatorisk felt", { set_id: set.set_id, field });
  }
  requireCondition(set.phase === "subject_pathway" && set.target_kind === "subject_area", "sett har feil subject-pathway-identitet", { set_id: set.set_id });
  requireCondition(categoryIds.has(set.area_id), "sett peker til ukjent canonical område", { set_id: set.set_id, area_id: set.area_id });
  requireCondition(set.targetId === `subject_teknologi_${set.area_id}`, "sett har targetId som ikke samsvarer med området", { set_id: set.set_id, targetId: set.targetId, area_id: set.area_id });
  requireCondition(JSON.stringify(set.sequence) === JSON.stringify(requiredSequence), "sett har feil femtrinnssekvens", { set_id: set.set_id });
  requireCondition(arr(set.questions).length === 5, "sett skal ha fem spørsmål", { set_id: set.set_id });
  requireCondition(JSON.stringify(arr(set.questions).map((question) => question.pathway_stage)) === JSON.stringify(requiredSequence), "spørsmål følger ikke femtrinnssekvensen", { set_id: set.set_id });
  const expectedAreaFile = areaFileById.get(set.area_id);
  for (const question of arr(set.questions)) {
    requireCondition(question.targetId === set.targetId, "spørsmål og sett har ulik targetId", { id: question.id, set_id: set.set_id });
    requireCondition(topicAreaById.get(question.emne_id) === set.area_id, "spørsmålets emne tilhører feil område", { id: question.id, emne_id: question.emne_id, area_id: set.area_id });
    requireCondition(methodAreaById.get(question.method_id) === set.area_id, "spørsmålets metode tilhører feil område", { id: question.id, method_id: question.method_id, area_id: set.area_id });
    requireCondition(hookAreaById.get(question.topic_hook_id) === set.area_id, "spørsmålets hook tilhører feil område", { id: question.id, topic_hook_id: question.topic_hook_id, area_id: set.area_id });
    requireCondition(question.concept_relation?.area_id === set.area_id, "spørsmålets begrepsrelasjon tilhører feil område", { id: question.id, area_id: set.area_id });
    requireCondition(Boolean(expectedAreaFile) && arr(question.guidance_basis).includes(expectedAreaFile), "spørsmålets guidance_basis peker ikke til korrekt områdefil", { id: question.id, expected: expectedAreaFile });
  }
}

for (const question of questions) {
  for (const field of requiredQuestionFields) {
    requireCondition(hasValue(question[field]), "subject-spørsmål mangler obligatorisk felt", { id: question.id, field });
  }
  requireCondition(question.categoryId === "teknologi" && question.question_scope === "subject_area", "spørsmål har feil kategori eller scope", { id: question.id });
  requireCondition(topicIds.has(question.emne_id), "spørsmål peker til ukjent canonical emne", { id: question.id, emne_id: question.emne_id });
  requireCondition(methodIds.has(question.method_id), "spørsmål peker til ukjent canonical metode", { id: question.id, method_id: question.method_id });
  requireCondition(hookIds.has(question.topic_hook_id), "spørsmål peker til ukjent canonical hook", { id: question.id, topic_hook_id: question.topic_hook_id });
  requireCondition(arr(question.options).length >= 3 && Number.isInteger(question.answerIndex) && question.answer === question.options[question.answerIndex], "spørsmål har ugyldig fasit", { id: question.id });
  requireCondition(arr(question.source).length > 0 && arr(question.source).every((source) => clean(source?.source_id) && clean(source?.locator) && clean(source?.claim_basis)), "spørsmål mangler komplett kildespor", { id: question.id });
  requireCondition(String(question.primary_knowledge_unit_id || "").startsWith("ku_teknologi_"), "spørsmål mangler stabil Teknologi knowledge-unit-ID", { id: question.id });
  requireCondition(arr(question.knowledge_unit_ids).length > 0 && arr(question.knowledge_unit_ids).includes(question.primary_knowledge_unit_id), "spørsmål har inkonsistente knowledge-unit-ID-er", { id: question.id });
  requireCondition(arr(question.concept_ids).length > 0 && arr(question.concept_ids).every((id) => String(id).startsWith("co_teknologi_")), "spørsmål har ikke canonical concept-ID-er", { id: question.id });
  requireCondition(arr(question.term_ids).length > 0 && arr(question.term_ids).every((id) => String(id).startsWith("term_teknologi_")), "spørsmål har ikke canonical term-ID-er", { id: question.id });
}

requireCondition(knowledgeManifest.runtime?.subjectPathwaySources?.teknologi === "../quiz/teknologi/teknologi_subject_pathways_v1.json", "Knowledge-manifestet mangler Teknologi subject source");

const registryIds = new Set(arr(knowledgeUnits.units).map((unit) => unit.knowledge_unit_id));
const registryConceptIds = new Set(arr(knowledgeConcepts.concepts).map((concept) => concept.concept_id));
const registryTermIds = new Set(arr(knowledgeTerms.terms).map((term) => term.term_id));
const questionKnowledgeIds = new Set(questions.flatMap((question) => arr(question.knowledge_unit_ids)));
const questionConceptIds = new Set(questions.flatMap((question) => arr(question.concept_ids)));
const questionTermIds = new Set(questions.flatMap((question) => arr(question.term_ids)));
requireCondition([...questionKnowledgeIds].every((id) => registryIds.has(id)), "ikke alle subject-spørsmål er materialisert i canonical Knowledge-register");
requireCondition([...questionConceptIds].every((id) => registryConceptIds.has(id)), "ikke alle subject-begreper er materialisert i canonical concept-register");
requireCondition([...questionTermIds].every((id) => registryTermIds.has(id)), "ikke alle subject-termer er materialisert i canonical term-register");
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
    knowledge_units_referenced: questionKnowledgeIds.size,
    concepts_referenced: questionConceptIds.size,
    terms_referenced: questionTermIds.size
  },
  gates: {
    one_canonical_subject_model: failures.every((failure) => !String(failure.reason).includes("manifestet resolver")),
    universal_coverage_complete: technology.universalCoverage?.status === "complete" && setAreaIds.size === categoryIds.size,
    subject_pathways_separate_from_place_quiz: subjectEntry?.file === paths.subjectPackage && !arr(quizManifest.files).includes(paths.subjectPackage),
    subject_area_integrity_complete: sets.every((set) => categoryIds.has(set.area_id) && arr(set.questions).every((question) => topicAreaById.get(question.emne_id) === set.area_id && methodAreaById.get(question.method_id) === set.area_id && hookAreaById.get(question.topic_hook_id) === set.area_id)),
    global_question_contract_complete: questions.every((question) => requiredQuestionFields.every((field) => hasValue(question[field]))),
    knowledge_delivery_complete: [...questionKnowledgeIds].every((id) => registryIds.has(id)) && [...questionConceptIds].every((id) => registryConceptIds.has(id)) && [...questionTermIds].every((id) => registryTermIds.has(id)) && unresolvedForPackage.length === 0,
    geographic_production_explicitly_separate: technology.geographicProduction?.status === "separate"
  },
  failures
};
await mkdir(path.dirname(path.resolve(ROOT, paths.report)), { recursive: true });
await writeFile(path.resolve(ROOT, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
