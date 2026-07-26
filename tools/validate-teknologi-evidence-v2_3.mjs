#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const arr = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === "string" ? value.trim() : "";
const unique = (values) => values.length === new Set(values).size;
const setEquals = (a, b) => a.size === b.size && [...a].every((value) => b.has(value));
const countBy = (items, key) => {
  const out = {};
  for (const item of items) out[item[key]] = (out[item[key]] || 0) + 1;
  return out;
};
const failures = [];
const requireCondition = (condition, reason, details = {}) => {
  if (!condition) failures.push({ reason, ...details });
};

const baseDir = "data/fag/teknologi/teknologi_scientific_v2";
const paths = {
  index: `${baseDir}/index.json`,
  profile: "data/fag/teknologi/supersetQUIZMAL_teknologi.json",
  objects: `${baseDir}/knowledge_object_ontology_v2_2.json`,
  concepts: `${baseDir}/concept_ontology_v2_2.json`,
  sources: `${baseDir}/source_registry_v2_3.json`,
  anchors: `${baseDir}/technology_anchor_registry_v2_3.json`,
  tasks: `${baseDir}/assessment_tasks_v2_3.json`,
  pathways: `${baseDir}/quiz_pathways_v2_3.json`,
  report: "reports/teknologi-evidence-production-validation.json"
};

const [index, profile, objectOntology, conceptOntology, sourceRegistry, anchorRegistry, taskRegistry, pathwayRegistry, ...areaDocs] =
  await Promise.all([
    readJson(paths.index),
    readJson(paths.profile),
    readJson(paths.objects),
    readJson(paths.concepts),
    readJson(paths.sources),
    readJson(paths.anchors),
    readJson(paths.tasks),
    readJson(paths.pathways),
    ...arr((await readJson(paths.index)).area_files).map(readJson)
  ]);

const areaIds = new Set(areaDocs.map((doc) => doc.area_id));
const objects = [...arr(objectOntology.legacy_classification), ...arr(objectOntology.extensions)];
const objectIds = new Set(objects.map((item) => item.id));
const concepts = [...arr(conceptOntology.existing_concept_typing), ...arr(conceptOntology.new_concepts)];
const conceptIds = new Set(concepts.map((item) => item.id));
const relations = arr(conceptOntology.typed_relations);
const relationKeys = new Set(relations.map((item) => `${item.area_id}|${item.source_id}|${item.relation_type}|${item.target_id}`));
const sourceIds = new Set(arr(sourceRegistry.sources).map((item) => item.id));
const anchorIds = new Set(arr(anchorRegistry.anchors).map((item) => item.id));
const taskIds = new Set(arr(taskRegistry.tasks).map((item) => item.id));
const pathways = arr(pathwayRegistry.pathways);
const questions = pathways.flatMap((pathway) => arr(pathway.questions));

requireCondition(areaIds.size === 12, "V2.3 skal dekke 12 fagområder", { actual: areaIds.size });
requireCondition(objectIds.size === 48, "V2.3 forventer 48 kunnskapsobjekter", { actual: objectIds.size });
requireCondition(conceptIds.size === 136, "V2.3 forventer 136 begreper", { actual: conceptIds.size });

// Source registry.
requireCondition(sourceRegistry.schema === "teknologi_source_registry_v2_3", "kilderegisteret har feil schema");
requireCondition(sourceRegistry.version === "2.3" && sourceRegistry.status === "canonical", "kilderegisteret er ikke kanonisk V2.3");
requireCondition(sourceIds.size === arr(sourceRegistry.sources).length, "kilde-ID-er er ikke unike");
requireCondition(sourceIds.size >= 30, "kilderegisteret er for tynt", { actual: sourceIds.size });
for (const source of arr(sourceRegistry.sources)) {
  requireCondition(areaIds.has(source.area_id), "kilde har ukjent fagområde", { id: source.id, area_id: source.area_id });
  requireCondition(text(source.type).length >= 4, "kilde mangler type", { id: source.id });
  requireCondition(text(source.title).length >= 8, "kilde mangler tittel", { id: source.id });
  requireCondition(text(source.publisher_or_author).length >= 3, "kilde mangler forfatter eller utgiver", { id: source.id });
  requireCondition(text(source.date_or_version).length >= 4, "kilde mangler dato eller versjon", { id: source.id });
  requireCondition(text(source.locator).length >= 12, "kilde mangler konkret lokator", { id: source.id });
  requireCondition(arr(source.claim_classes).length >= 2, "kilde mangler påstandsklasser", { id: source.id });
  requireCondition(arr(source.supports?.knowledge_object_ids).length >= 3, "kilde mangler objektdekning", { id: source.id });
  requireCondition(arr(source.supports?.concept_ids).length >= 10, "kilde mangler begrepsdekning", { id: source.id });
}
const sourcesPerArea = countBy(arr(sourceRegistry.sources), "area_id");
for (const areaId of areaIds) {
  requireCondition((sourcesPerArea[areaId] || 0) >= 2, "fagområde har færre enn to kilder", { area_id: areaId });
}
const areaPolicies = arr(sourceRegistry.area_source_policies);
requireCondition(areaPolicies.length === 12, "kildepolicy mangler fagområder");
for (const policy of areaPolicies) {
  requireCondition(areaIds.has(policy.area_id), "kildepolicy har ukjent fagområde", { area_id: policy.area_id });
  requireCondition(policy.minimum_independent_sources_per_assessment >= 2, "kildepolicy tillater for få kilder", { area_id: policy.area_id });
  requireCondition(policy.primary_or_official_source_required === true, "kildepolicy krever ikke primær eller offisiell kilde", { area_id: policy.area_id });
  requireCondition(arr(policy.source_ids).every((id) => sourceIds.has(id)), "kildepolicy peker til ukjent kilde", { area_id: policy.area_id });
}

const objectBindings = arr(sourceRegistry.knowledge_object_bindings);
const objectBindingIds = new Set(objectBindings.map((item) => item.knowledge_object_id));
requireCondition(objectBindings.length === 48 && setEquals(objectBindingIds, objectIds), "alle kunnskapsobjekter må ha eksakt én kildebinding");
for (const binding of objectBindings) {
  requireCondition(arr(binding.source_ids).length >= 2, "kunnskapsobjekt har for få kilder", { id: binding.knowledge_object_id });
  requireCondition(arr(binding.source_ids).every((id) => sourceIds.has(id)), "kunnskapsobjekt peker til ukjent kilde", { id: binding.knowledge_object_id });
  requireCondition(binding.locator_required_in_question === true, "objektbinding krever ikke spørsmålslokator", { id: binding.knowledge_object_id });
}

const conceptBindings = arr(sourceRegistry.concept_bindings);
const conceptBindingIds = new Set(conceptBindings.map((item) => item.concept_id));
requireCondition(conceptBindings.length === 136 && setEquals(conceptBindingIds, conceptIds), "alle begreper må ha eksakt én kildebinding");
for (const binding of conceptBindings) {
  requireCondition(arr(binding.source_ids).length >= 2, "begrep har for få kilder", { id: binding.concept_id });
  requireCondition(arr(binding.source_ids).every((id) => sourceIds.has(id)), "begrep peker til ukjent kilde", { id: binding.concept_id });
  requireCondition(binding.locator_required_when_scored === true, "begrepsbinding krever ikke lokator ved vurdering", { id: binding.concept_id });
}

// Anchor registry.
const anchors = arr(anchorRegistry.anchors);
requireCondition(anchorRegistry.schema === "teknologi_anchor_registry_v2_3", "ankerregisteret har feil schema");
requireCondition(anchors.length === 24 && anchorIds.size === 24, "V2.3 skal ha 24 unike ankre", { actual: anchors.length });
const anchorsPerArea = countBy(anchors, "area_id");
for (const areaId of areaIds) {
  requireCondition(anchorsPerArea[areaId] === 2, "fagområde skal ha nøyaktig to ankre", { area_id: areaId, actual: anchorsPerArea[areaId] || 0 });
}
for (const anchor of anchors) {
  requireCondition(areaIds.has(anchor.area_id), "anker har ukjent fagområde", { id: anchor.id });
  requireCondition(text(anchor.label).length >= 10, "anker har svak label", { id: anchor.id });
  requireCondition(text(anchor.anchor_type).length >= 5, "anker mangler type", { id: anchor.id });
  requireCondition(text(anchor.system_boundary).length >= 45, "anker mangler presis systemgrense", { id: anchor.id });
  requireCondition(text(anchor.operational_context).length >= 35, "anker mangler driftskontekst", { id: anchor.id });
  requireCondition(arr(anchor.observables).length >= 3, "anker har for få observabler", { id: anchor.id });
  requireCondition(arr(anchor.failure_modes).length >= 2, "anker har for få feilmodi", { id: anchor.id });
  requireCondition(arr(anchor.source_ids).length >= 2 && arr(anchor.source_ids).every((id) => sourceIds.has(id)), "anker har ugyldig kildespor", { id: anchor.id });
  requireCondition(arr(anchor.knowledge_object_ids).length >= 2 && arr(anchor.knowledge_object_ids).every((id) => objectIds.has(id)), "anker har ugyldig objektspor", { id: anchor.id });
  requireCondition(arr(anchor.concept_ids).length >= 4 && arr(anchor.concept_ids).every((id) => conceptIds.has(id)), "anker har ugyldig begrepsspor", { id: anchor.id });
}

// Assessment tasks.
const tasks = arr(taskRegistry.tasks);
requireCondition(taskRegistry.schema === "teknologi_assessment_tasks_v2_3", "oppgaveregisteret har feil schema");
requireCondition(tasks.length === 24 && taskIds.size === 24, "V2.3 skal ha 24 unike vurderingsoppgaver", { actual: tasks.length });
const tasksPerArea = countBy(tasks, "area_id");
for (const areaId of areaIds) {
  requireCondition(tasksPerArea[areaId] === 2, "fagområde skal ha to vurderingsoppgaver", { area_id: areaId, actual: tasksPerArea[areaId] || 0 });
}
for (const task of tasks) {
  requireCondition(anchorIds.has(task.anchor_id), "oppgave peker til ukjent anker", { id: task.id, anchor_id: task.anchor_id });
  requireCondition(text(task.prompt).length >= 80, "oppgaveprompt er for svak", { id: task.id });
  requireCondition(arr(task.source_ids).length >= 2 && arr(task.source_ids).every((id) => sourceIds.has(id)), "oppgave har ugyldige kilder", { id: task.id });
  requireCondition(arr(task.knowledge_object_ids).length >= 2 && arr(task.knowledge_object_ids).every((id) => objectIds.has(id)), "oppgave har ugyldige objekter", { id: task.id });
  requireCondition(arr(task.deliverables).length >= 3, "oppgave har for få leveranser", { id: task.id });
  const relation = task.concept_relation || {};
  requireCondition(relationKeys.has(`${relation.area_id}|${relation.source_id}|${relation.relation_type}|${relation.target_id}`), "oppgave har ukjent begrepsrelasjon", { id: task.id, relation });
  requireCondition(task.evidence_requirements?.minimum_sources >= 2, "oppgave krever for få kilder", { id: task.id });
  requireCondition(task.evidence_requirements?.source_locator_per_claim_required === true, "oppgave krever ikke kildelokator per påstand", { id: task.id });
  requireCondition(arr(task.rubric).reduce((sum, item) => sum + Number(item.points || 0), 0) === 100, "oppgaverubrikk summerer ikke til 100", { id: task.id });
}

// Quiz pathways and questions.
requireCondition(pathwayRegistry.schema === "teknologi_quiz_pathways_v2_3", "quizforløpsregisteret har feil schema");
requireCondition(pathwayRegistry.runtime_activation?.status === "subject_package_ready", "quizforløpene er ikke produksjonsklare som fagpakke");
requireCondition(pathwayRegistry.runtime_activation?.global_place_manifest_activation === false, "fagområdeforløp skal ikke registreres som sted/person");
requireCondition(pathways.length === 12, "V2.3 skal ha 12 quizforløp", { actual: pathways.length });
requireCondition(new Set(pathways.map((item) => item.area_id)).size === 12, "quizforløp dekker ikke alle fagområder");
const expectedStages = ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"];
requireCondition(questions.length === 60, "V2.3 skal ha 60 faktiske quizspørsmål", { actual: questions.length });
requireCondition(unique(questions.map((item) => item.id)), "quizspørsmål har duplikate id-er");
requireCondition(unique(questions.map((item) => item.quiz_id)), "quizspørsmål har duplikate quiz_id-er");

for (const pathway of pathways) {
  requireCondition(areaIds.has(pathway.area_id), "quizforløp har ukjent fagområde", { id: pathway.id });
  requireCondition(pathway.status === "canonical_production_ready", "quizforløp er ikke produksjonsklart", { id: pathway.id });
  requireCondition(JSON.stringify(pathway.sequence) === JSON.stringify(expectedStages), "quizforløp har feil progresjon", { id: pathway.id });
  requireCondition(arr(pathway.anchor_ids).length === 2 && arr(pathway.anchor_ids).every((id) => anchorIds.has(id)), "quizforløp har ugyldige ankre", { id: pathway.id });
  requireCondition(arr(pathway.assessment_task_ids).length === 2 && arr(pathway.assessment_task_ids).every((id) => taskIds.has(id)), "quizforløp har ugyldige oppgaver", { id: pathway.id });
  requireCondition(arr(pathway.questions).length === 5, "quizforløp skal ha fem spørsmål", { id: pathway.id });
  requireCondition(JSON.stringify(arr(pathway.questions).map((item) => item.pathway_stage)) === JSON.stringify(expectedStages), "quizspørsmål følger ikke femtrinnsprogresjonen", { id: pathway.id });
}

for (const question of questions) {
  requireCondition(question.categoryId === "teknologi", "quizspørsmål har feil kategori", { id: question.id });
  requireCondition(question.question_scope === "subject_area", "quizspørsmål har feil scope", { id: question.id });
  requireCondition(text(question.question).length >= 25, "quizspørsmål er for kort", { id: question.id });
  requireCondition(arr(question.options).length === 3, "quizspørsmål skal ha tre alternativer", { id: question.id });
  requireCondition(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < question.options.length, "quizspørsmål har ugyldig answerIndex", { id: question.id });
  requireCondition(question.answer === question.options[question.answerIndex], "quizfasit matcher ikke answerIndex", { id: question.id });
  requireCondition(text(question.explanation).length >= 80, "quizspørsmål mangler faglig forklaring", { id: question.id });
  requireCondition(anchorIds.has(question.anchor_id), "quizspørsmål har ukjent anker", { id: question.id });
  requireCondition(taskIds.has(question.assessment_task_id), "quizspørsmål har ukjent oppgave", { id: question.id });
  requireCondition(objectIds.has(question.knowledge_object_id), "quizspørsmål har ukjent kunnskapsobjekt", { id: question.id });
  const object = objects.find((item) => item.id === question.knowledge_object_id);
  requireCondition(question.knowledge_object_type === object?.object_type, "quizspørsmål har feil objekttype", { id: question.id });
  const relation = question.concept_relation || {};
  requireCondition(relationKeys.has(`${relation.area_id}|${relation.source_id}|${relation.relation_type}|${relation.target_id}`), "quizspørsmål har ukjent begrepsrelasjon", { id: question.id });
  requireCondition(arr(question.source_ids).length >= 2 && arr(question.source_ids).every((id) => sourceIds.has(id)), "quizspørsmål har for få eller ukjente kilder", { id: question.id });
  requireCondition(arr(question.source_locators).length === arr(question.source_ids).length, "quizspørsmål mangler lokator for en kilde", { id: question.id });
  for (const locator of arr(question.source_locators)) {
    requireCondition(question.source_ids.includes(locator.source_id), "lokator peker til kilde som ikke er valgt", { id: question.id, source_id: locator.source_id });
    requireCondition(text(locator.locator).length >= 12, "quizspørsmål har svak kildelokator", { id: question.id, source_id: locator.source_id });
  }
  requireCondition(text(question.claim_class).length >= 5, "quizspørsmål mangler påstandsklasse", { id: question.id });
  requireCondition(text(question.analysis_method).length >= 5, "quizspørsmål mangler analysemetode", { id: question.id });
  requireCondition(text(question.evidence_type).length >= 5, "quizspørsmål mangler evidenstype", { id: question.id });
  requireCondition(text(question.uncertainty).length >= 5, "quizspørsmål mangler usikkerhet", { id: question.id });
  requireCondition(text(question.comparison_basis).length >= 12, "quizspørsmål mangler sammenligningsgrunnlag eller eksplisitt ikke-komparativ status", { id: question.id });
}

// Index and quiz profile consumption.
requireCondition(index.version === "2.1", "fagindeksens bakoverkompatible hovedversjon er endret", { actual: index.version });
requireCondition(index.evidence_layer?.version === "2.3" && index.evidence_layer?.status === "canonical", "fagindeksen mangler kanonisk evidence_layer");
for (const [key, expected] of Object.entries({
  source_registry: paths.sources,
  anchor_registry: paths.anchors,
  assessment_tasks: paths.tasks,
  quiz_pathways: paths.pathways,
  validator: "tools/validate-teknologi-evidence-v2_3.mjs",
  report: paths.report
})) {
  requireCondition(index.evidence_layer?.[key] === expected, "fagindeksen har feil V2.3-referanse", { key, actual: index.evidence_layer?.[key], expected });
}
requireCondition(index.counts?.sources === sourceIds.size, "indeksen har feil kildeantall");
requireCondition(index.counts?.technology_anchors === anchors.length, "indeksen har feil ankerantall");
requireCondition(index.counts?.assessment_tasks === tasks.length, "indeksen har feil oppgaveantall");
requireCondition(index.counts?.quiz_pathways === pathways.length, "indeksen har feil forløpsantall");
requireCondition(index.counts?.quiz_questions === questions.length, "indeksen har feil spørsmålsantall");

requireCondition(profile.version === "3.1", "quizprofilens bakoverkompatible hovedversjon er endret", { actual: profile.version });
requireCondition(profile.depth_version === "2.2", "quizprofilens ontologiversjon er endret", { actual: profile.depth_version });
requireCondition(profile.evidence_version === "2.3", "quizprofilen mangler evidence_version 2.3", { actual: profile.evidence_version });
for (const [key, expected] of Object.entries({
  source_registry: paths.sources,
  technology_anchor_registry: paths.anchors,
  assessment_tasks: paths.tasks,
  quiz_pathways: paths.pathways
})) {
  requireCondition(profile.governance?.[key] === expected, "quizprofilen har feil V2.3-referanse", { key, actual: profile.governance?.[key], expected });
}
for (const field of ["source_ids", "source_locators", "anchor_id", "assessment_task_id", "pathway_stage"]) {
  requireCondition(arr(profile.question_design?.required_fields).includes(field), "quizprofilen krever ikke V2.3-felt", { field });
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.3",
  subject_id: "teknologi",
  counts: {
    areas: areaIds.size,
    sources: sourceIds.size,
    source_types: new Set(arr(sourceRegistry.sources).map((item) => item.type)).size,
    knowledge_object_bindings: objectBindings.length,
    concept_bindings: conceptBindings.length,
    technology_anchors: anchors.length,
    assessment_tasks: tasks.length,
    quiz_pathways: pathways.length,
    quiz_questions: questions.length
  },
  per_area: {
    sources: sourcesPerArea,
    anchors: anchorsPerArea,
    assessment_tasks: tasksPerArea,
    quiz_questions: countBy(questions.map((question) => ({ ...question, area_id: pathways.find((p) => p.questions.some((q) => q.id === question.id))?.area_id })), "area_id")
  },
  gates: {
    all_knowledge_objects_source_bound: objectBindings.length === 48 && setEquals(objectBindingIds, objectIds),
    all_concepts_source_bound: conceptBindings.length === 136 && setEquals(conceptBindingIds, conceptIds),
    two_concrete_anchors_per_area: [...areaIds].every((id) => anchorsPerArea[id] === 2),
    two_assessment_tasks_per_area: [...areaIds].every((id) => tasksPerArea[id] === 2),
    five_stage_pathway_per_area: pathways.length === 12 && pathways.every((item) => JSON.stringify(item.sequence) === JSON.stringify(expectedStages)),
    every_answer_has_traceability_chain: questions.every((question) =>
      anchorIds.has(question.anchor_id) &&
      taskIds.has(question.assessment_task_id) &&
      objectIds.has(question.knowledge_object_id) &&
      arr(question.source_ids).length >= 2 &&
      arr(question.source_locators).length === arr(question.source_ids).length
    ),
    profile_consumes_v2_3: profile.evidence_version === "2.3"
  },
  failures
};

await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
await writeFile(path.resolve(root, paths.report), JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
