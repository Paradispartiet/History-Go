#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const resolvePath = (file) => path.resolve(root, file);
const readJson = async (file) => JSON.parse(await readFile(resolvePath(file), "utf8"));
const arr = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === "string" ? value.trim() : "";
const failures = [];
const requireCondition = (condition, reason, details = {}) => {
  if (!condition) failures.push({ reason, ...details });
};
const uniqueBy = (items, key) => {
  const ids = items.map((item) => item?.[key]).filter(Boolean);
  return ids.length === new Set(ids).size;
};
const setEquals = (a, b) => a.size === b.size && [...a].every((value) => b.has(value));
const allResolve = (ids, known, reason, owner) => {
  for (const id of arr(ids)) requireCondition(known.has(id), reason, { owner, referenced_id: id });
};
const minText = (value, minimum) => text(value).length >= minimum;

const paths = {
  contract: "data/categories/category_contract.json",
  badge: "data/badges/vitenskap.json",
  manifest: "data/fag/fag_manifest.json",
  profile: "data/fag/teknologi/supersetQUIZMAL_teknologi.json",
  index: "data/fag/teknologi/teknologi_scientific_v2/index.json",
  report: "reports/teknologi-scientific-quality-validation.json"
};

const [contract, badge, manifest, profile, index] = await Promise.all([
  readJson(paths.contract),
  readJson(paths.badge),
  readJson(paths.manifest),
  readJson(paths.profile),
  readJson(paths.index)
]);

const qualityPaths = index.quality_layer || {};
const requiredQualityKeys = [
  "standard",
  "area_profiles",
  "curated_hooks",
  "theory_registry",
  "topic_alignment_overrides",
  "curriculum_quality"
];
for (const key of requiredQualityKeys) {
  requireCondition(minText(qualityPaths[key], 10), "indeksen mangler kvalitetsressurs", { key });
}

const [quality, areaProfilesDoc, curatedHookIndex, theoryRegistry, topicOverrides, curriculumQuality] =
  await Promise.all([
    readJson(qualityPaths.standard),
    readJson(qualityPaths.area_profiles),
    readJson(qualityPaths.curated_hooks),
    readJson(qualityPaths.theory_registry),
    readJson(qualityPaths.topic_alignment_overrides),
    readJson(qualityPaths.curriculum_quality)
  ]);

const areaDocs = await Promise.all(arr(index.area_files).map(readJson));
const hookShards = await Promise.all(arr(curatedHookIndex.shard_files).map(readJson));
const curatedHooks = hookShards.flatMap((shard) => arr(shard.hooks));
const topics = areaDocs.flatMap((doc) => arr(doc.topics));
const methods = areaDocs.flatMap((doc) => arr(doc.methods));
const concepts = areaDocs.flatMap((doc) => arr(doc.concepts));
const thinkers = areaDocs.flatMap((doc) => arr(doc.thinkers));
const theories = areaDocs.flatMap((doc) => arr(doc.theory_objects));
const legacyHooks = areaDocs.flatMap((doc) => arr(doc.hooks));
const modules = areaDocs.map((doc) => doc.module).filter(Boolean);
const areaProfiles = arr(areaProfilesDoc.profiles);
const theoryQuality = arr(theoryRegistry.theories);
const overrides = arr(topicOverrides.overrides);
const curriculumModules = arr(curriculumQuality.modules);
const claimClasses = arr(quality.claim_classes);

const areaIds = new Set(areaDocs.map((item) => item.area_id));
const topicIds = new Set(topics.map((item) => item.id));
const methodIds = new Set(methods.map((item) => item.id));
const conceptIds = new Set(concepts.map((item) => item.id));
const thinkerIds = new Set(thinkers.map((item) => item.id));
const theoryIds = new Set(theories.map((item) => item.id));
const legacyHookIds = new Set(legacyHooks.map((item) => item.id));
const curatedHookIds = new Set(curatedHooks.map((item) => item.id));
const moduleIds = new Set(modules.map((item) => item.id));
const claimClassIds = new Set(claimClasses.map((item) => item.id));
const templateIds = new Set(Object.keys(curatedHookIndex.templates || {}));

// Domain and package identity.
requireCondition(!contract.runtimeCategories.includes("teknologi"), "teknologi skal ikke være egen runtimekategori");
requireCondition(!contract.fagSubjects.includes("teknologi"), "teknologi skal ikke være eget toppfag");
requireCondition(contract.aliases?.teknologi === "vitenskap", "teknologi-aliaset peker ikke til vitenskap");
requireCondition(contract.labels?.vitenskap === "Vitenskap & teknologi", "feil felleslabel");
requireCondition(badge.id === "vitenskap" && badge.name === "Vitenskap & teknologi", "fellesbadget har feil identitet");
requireCondition(arr(badge.tiers).length >= 10, "badge har for få nivåer");
requireCondition(manifest.vitenskap?.specializations?.teknologi?.status === "canonical_scientific_specialization", "manifestet markerer ikke Teknologi som vitenskapelig spesialisering");
requireCondition(manifest.vitenskap?.specializations?.teknologi?.scientificPackage === "teknologi/teknologi_scientific_v2/index.json", "spesialiseringen mangler scientificPackage");
requireCondition(profile.categoryId === "teknologi", "quizprofil har feil kategori");
requireCondition(profile.required_emne_prefix === "em_tek_", "quizprofil har feil emneprefix");
requireCondition(profile.scientificPackage === paths.index, "quizprofilen peker ikke til vitenskapelig pakke");
requireCondition(index.version === "2.1", "vitenskapelig indeks har feil versjon");
requireCondition(index.status === "canonical_scientific_subject", "indeksen er ikke kanonisk vitenskapelig fag");
requireCondition(minText(index.definition, 100), "fagdefinisjonen er for svak");
requireCondition(arr(index.object_of_study).length >= 5, "faget mangler eksplisitt studieobjekt");
requireCondition(arr(index.knowledge_forms).length >= 8, "faget mangler kunnskapsformer");
requireCondition(index.governance?.uncertainty_must_be_explicit === true, "usikkerhet er ikke eksplisitt krav");
requireCondition(index.governance?.comparison_requires_common_basis === true, "sammenligning mangler felles grunnlag");
requireCondition(index.governance?.marketing_is_not_independent_evidence === true, "markedsføring er ikke avgrenset som evidens");
requireCondition(index.governance?.claim_class_must_be_explicit === true, "påstandsklasse er ikke eksplisitt krav");

// Baseline scientific package integrity.
const expectedCounts = {
  areas: areaDocs.length,
  topics: topics.length,
  methods: methods.length,
  hooks: legacyHooks.length,
  concepts: concepts.length,
  thinkers: thinkers.length,
  theory_objects: theories.length,
  modules: modules.length
};
for (const [key, actual] of Object.entries(expectedCounts)) {
  requireCondition(index.counts?.[key] === actual, "indekstelling avviker", {
    key,
    expected: index.counts?.[key],
    actual
  });
}
requireCondition(areaDocs.length === 12, "fagpakken skal ha 12 fagområder");
requireCondition(topics.length === 48, "fagpakken skal ha 48 emner");
requireCondition(methods.length >= 35, "fagpakken har for få metoder");
requireCondition(legacyHooks.length === 36, "fagpakken skal ha 36 hook-ID-er");
requireCondition(concepts.length === 72, "fagpakken skal ha 72 begreper");
requireCondition(thinkers.length === 60, "fagpakken skal ha 60 fagpersoner");
requireCondition(theories.length === 24, "fagpakken skal ha 24 teoriobjekter");
requireCondition(modules.length === 12, "fagpakken skal ha 12 moduler");
requireCondition(uniqueBy(areaDocs, "area_id"), "dupliserte område-ID-er");
requireCondition(uniqueBy(topics, "id"), "dupliserte emne-ID-er");
requireCondition(uniqueBy(methods, "id"), "dupliserte metode-ID-er");
requireCondition(uniqueBy(concepts, "id"), "dupliserte begreps-ID-er");
requireCondition(uniqueBy(thinkers, "id"), "dupliserte fagperson-ID-er");
requireCondition(uniqueBy(theories, "id"), "dupliserte teoriobjekt-ID-er");
requireCondition(uniqueBy(legacyHooks, "id"), "dupliserte hook-ID-er");
requireCondition(uniqueBy(modules, "id"), "dupliserte modul-ID-er");

for (const doc of areaDocs) {
  requireCondition(doc.schema === "teknologi_scientific_area_v2", "fagområde har feil schema", { area_id: doc.area_id });
  requireCondition(doc.subject_id === "teknologi", "fagområde har feil subject_id", { area_id: doc.area_id });
  requireCondition(minText(doc.definition, 80), "fagområde har svak definisjon", { area_id: doc.area_id });
  requireCondition(arr(doc.research_questions).length >= 3, "fagområde mangler forskningsspørsmål", { area_id: doc.area_id });
}
for (const topic of topics) {
  requireCondition(String(topic.id || "").startsWith("em_tek_"), "emne har feil prefix", { id: topic.id });
  requireCondition(minText(topic.definition, 60), "emne har svak definisjon", { id: topic.id });
  requireCondition(arr(topic.concept_ids).length >= 3, "emne mangler begrepsbredde", { id: topic.id });
  requireCondition(arr(topic.method_ids).length >= 2, "emne mangler metodekobling", { id: topic.id });
  requireCondition(arr(topic.theory_ids).length >= 1, "emne mangler teoriobjekt", { id: topic.id });
  allResolve(topic.concept_ids, conceptIds, "emne peker til ukjent begrep", topic.id);
  allResolve(topic.method_ids, methodIds, "emne peker til ukjent metode", topic.id);
  allResolve(topic.hook_ids, legacyHookIds, "emne peker til ukjent hook", topic.id);
  allResolve(topic.theory_ids, theoryIds, "emne peker til ukjent teoriobjekt", topic.id);
}
for (const method of methods) {
  requireCondition(String(method.id || "").startsWith("met_tek_"), "metode har feil prefix", { id: method.id });
  requireCondition(minText(method.purpose, 60), "metode har for svakt formål", { id: method.id });
}
for (const concept of concepts) {
  requireCondition(minText(concept.definition, 45), "begrep har svak definisjon", { id: concept.id });
  requireCondition(minText(concept.distinction, 35), "begrep mangler avgrensning", { id: concept.id });
  requireCondition(arr(concept.related_ids).length >= 3, "begrep mangler relasjoner", { id: concept.id });
  allResolve(concept.related_ids, conceptIds, "begrep peker til ukjent begrep", concept.id);
}
for (const theory of theories) {
  requireCondition(String(theory.id || "").startsWith("teori_tek_"), "teoriobjekt har feil prefix", { id: theory.id });
  allResolve(theory.concept_ids, conceptIds, "teoriobjekt peker til ukjent begrep", theory.id);
  allResolve(theory.method_ids, methodIds, "teoriobjekt peker til ukjent metode", theory.id);
}
for (const module of modules) {
  allResolve(module.topic_ids, topicIds, "modul peker til ukjent emne", module.id);
  allResolve(module.method_ids, methodIds, "modul peker til ukjent metode", module.id);
  allResolve(module.hook_ids, legacyHookIds, "modul peker til ukjent hook", module.id);
  allResolve(module.concept_ids, conceptIds, "modul peker til ukjent begrep", module.id);
  allResolve(module.theory_ids, theoryIds, "modul peker til ukjent teoriobjekt", module.id);
}

// Quality standard and claim classes.
requireCondition(quality.schema === "teknologi_scientific_quality_standard_v2_1", "kvalitetsstandarden har feil schema");
requireCondition(quality.status === "canonical", "kvalitetsstandarden er ikke kanonisk");
requireCondition(claimClasses.length === 7, "kvalitetsstandarden skal ha sju påstandsklasser");
requireCondition(uniqueBy(claimClasses, "id"), "dupliserte påstandsklasser");
for (const claim of claimClasses) {
  requireCondition(minText(claim.question, 20), "påstandsklasse mangler spørsmål", { id: claim.id });
  requireCondition(arr(claim.minimum_evidence).length >= 2, "påstandsklasse mangler evidenskrav", { id: claim.id });
}
requireCondition(arr(quality.evidence_policy?.preferred_order).length >= 5, "evidenshierarkiet er for svakt");
requireCondition(quality.evidence_policy?.source_minimum?.causal_or_contested_claim >= 2, "kausale påstander krever for få kilder");
requireCondition(quality.evidence_policy?.source_minimum?.safety_or_risk_claim >= 2, "risikopåstander krever for få kilder");
requireCondition(arr(quality.uncertainty_protocol?.types).length >= 6, "usikkerhetstypene er ufullstendige");
requireCondition(arr(quality.comparison_protocol?.required_common_basis).length >= 6, "sammenligningsprotokollen er for svak");
requireCondition(arr(quality.assessment_rules?.score).length >= 6, "vurderingskriteriene er for svake");
requireCondition(arr(quality.anti_patterns).length >= 7, "antimønsterregisteret er for lite");

// Area-specific quality profiles.
requireCondition(areaProfilesDoc.schema === "teknologi_area_quality_profiles_v2_1", "områdeprofilene har feil schema");
requireCondition(areaProfiles.length === 12, "det skal finnes 12 områdeprofiler");
requireCondition(uniqueBy(areaProfiles, "area_id"), "dupliserte områdeprofiler");
requireCondition(setEquals(new Set(areaProfiles.map((item) => item.area_id)), areaIds), "områdeprofilene dekker ikke alle og bare fagområdene");
for (const item of areaProfiles) {
  requireCondition(arr(item.canonical_mechanisms).length >= 4, "områdeprofil mangler mekanismer", { area_id: item.area_id });
  requireCondition(arr(item.preferred_evidence).length >= 3, "områdeprofil mangler evidenstyper", { area_id: item.area_id });
  requireCondition(arr(item.mandatory_failure_modes).length >= 3, "områdeprofil mangler feilmodi", { area_id: item.area_id });
  requireCondition(arr(item.comparison_basis).length >= 4, "områdeprofil mangler sammenligningsgrunnlag", { area_id: item.area_id });
  requireCondition(arr(item.misconceptions).length >= 2, "områdeprofil mangler misforståelser", { area_id: item.area_id });
  requireCondition(arr(item.anchor_types).length >= 3, "områdeprofil mangler tekniske ankertyper", { area_id: item.area_id });
  requireCondition(arr(item.quantitative_dimensions).length >= 4, "områdeprofil mangler kvantitative dimensjoner", { area_id: item.area_id });
  requireCondition(minText(item.boundary_note, 80), "områdeprofil mangler faggrense", { area_id: item.area_id });
}

// Curated hooks replace generic production prompts while preserving canonical IDs.
requireCondition(curatedHookIndex.schema === "teknologi_curated_hooks_index_v2_1", "kuraterte hooks har feil indeks-schema");
requireCondition(hookShards.length === 4, "kuraterte hooks skal ligge i fire shards");
requireCondition(curatedHooks.length === 36, "det skal finnes 36 kuraterte hooks");
requireCondition(uniqueBy(curatedHooks, "id"), "dupliserte kuraterte hook-ID-er");
requireCondition(setEquals(curatedHookIds, legacyHookIds), "kuraterte hooks dekker ikke nøyaktig de kanoniske hook-ID-ene");
requireCondition(templateIds.has("mechanism") && templateIds.has("failure") && templateIds.has("consequence"), "hook-malene er ufullstendige");
for (const [templateId, template] of Object.entries(curatedHookIndex.templates || {})) {
  requireCondition(arr(template.analysis_steps).length >= 4, "hook-mal mangler analysetrinn", { template_id: templateId });
  requireCondition(arr(template.uncertainty_checks).length >= 2, "hook-mal mangler usikkerhetskontroll", { template_id: templateId });
}
const hooksPerArea = new Map();
for (const hook of curatedHooks) {
  requireCondition(areaIds.has(hook.area_id), "kuraterte hook peker til ukjent område", { id: hook.id });
  requireCondition(templateIds.has(hook.template_id), "kuraterte hook peker til ukjent mal", { id: hook.id });
  requireCondition(claimClassIds.has(hook.claim_class), "kuraterte hook har ukjent påstandsklasse", { id: hook.id });
  requireCondition(minText(hook.question, 45) && hook.question.endsWith("?"), "kuraterte hook mangler presist spørsmål", { id: hook.id });
  requireCondition(!hook.question.toLowerCase().includes("hvordan virker") || !hook.question.toLowerCase().includes("i et konkret system"), "generisk hook-formulering er ikke kuratert", { id: hook.id });
  requireCondition(arr(hook.evidence_required).length >= 3, "kuraterte hook mangler evidenskrav", { id: hook.id });
  requireCondition(arr(hook.comparison_basis).length >= 4, "kuraterte hook mangler sammenligningsgrunnlag", { id: hook.id });
  requireCondition(arr(hook.quantitative_dimensions).length >= 4, "kuraterte hook mangler kvantitative dimensjoner", { id: hook.id });
  hooksPerArea.set(hook.area_id, (hooksPerArea.get(hook.area_id) || 0) + 1);
}
for (const areaId of areaIds) requireCondition(hooksPerArea.get(areaId) === 3, "fagområdet skal ha tre kuraterte hooks", { area_id: areaId });

// Theory quality registry.
requireCondition(theoryRegistry.schema === "teknologi_theory_quality_registry_v2_1", "teoriregisteret har feil schema");
requireCondition(theoryQuality.length === 24, "teoriregisteret skal ha 24 teoriobjekter");
requireCondition(uniqueBy(theoryQuality, "id"), "dupliserte teoriobjekter i kvalitetsregisteret");
requireCondition(setEquals(new Set(theoryQuality.map((item) => item.id)), theoryIds), "teoriregisteret dekker ikke nøyaktig fagets teoriobjekter");
for (const theory of theoryQuality) {
  requireCondition(areaIds.has(theory.area_id), "teorikvalitet peker til ukjent område", { id: theory.id });
  requireCondition(minText(theory.scope, 55), "teori mangler virkeområde", { id: theory.id });
  requireCondition(arr(theory.assumptions).length >= 2, "teori mangler antakelser", { id: theory.id });
  requireCondition(minText(theory.mechanism_or_logic, 75), "teori mangler mekanisme eller logikk", { id: theory.id });
  requireCondition(arr(theory.observable_indicators).length >= 2, "teori mangler observerbare indikatorer", { id: theory.id });
  requireCondition(arr(theory.limitations).length >= 2, "teori mangler begrensninger", { id: theory.id });
  requireCondition(arr(theory.misuse_risks).length >= 2, "teori mangler misbruksrisiko", { id: theory.id });
}

// Curated corrections for weak topic-method-theory bindings.
requireCondition(topicOverrides.schema === "teknologi_topic_alignment_overrides_v2_1", "emneoverstyringene har feil schema");
requireCondition(overrides.length >= 12, "for få kuraterte emnekorrigeringer");
requireCondition(uniqueBy(overrides, "topic_id"), "dupliserte emnekorrigeringer");
for (const override of overrides) {
  requireCondition(topicIds.has(override.topic_id), "emnekorrigering peker til ukjent emne", { id: override.topic_id });
  requireCondition(minText(override.reason, 60), "emnekorrigering mangler begrunnelse", { id: override.topic_id });
  allResolve(override.preferred_theory_ids, theoryIds, "emnekorrigering peker til ukjent teori", override.topic_id);
  allResolve(override.preferred_method_ids, methodIds, "emnekorrigering peker til ukjent metode", override.topic_id);
  allResolve(override.claim_classes, claimClassIds, "emnekorrigering peker til ukjent påstandsklasse", override.topic_id);
}

// Curriculum progression and capstone.
requireCondition(curriculumQuality.schema === "teknologi_curriculum_quality_v2_1", "progresjonsfilen har feil schema");
requireCondition(curriculumModules.length === 12, "progresjonsfilen skal ha 12 moduler");
requireCondition(uniqueBy(curriculumModules, "module_id"), "dupliserte progresjonsmoduler");
requireCondition(setEquals(new Set(curriculumModules.map((item) => item.module_id)), moduleIds), "progresjonsfilen dekker ikke nøyaktig kanoniske moduler");
const curriculumById = new Map(curriculumModules.map((item) => [item.module_id, item]));
for (const module of curriculumModules) {
  requireCondition([1, 2, 3].includes(module.level), "modul har ugyldig nivå", { id: module.module_id });
  requireCondition(minText(module.core_question, 50), "modul mangler kjernespørsmål", { id: module.module_id });
  requireCondition(arr(module.learning_outcomes).length >= 4, "modul mangler læringsutbytte", { id: module.module_id });
  requireCondition(arr(module.required_evidence).length >= 3, "modul mangler evidenskrav", { id: module.module_id });
  requireCondition(minText(module.assessment_task, 65), "modul mangler vurderingsoppgave", { id: module.module_id });
  requireCondition(arr(module.mastery_criteria).length >= 3, "modul mangler mestringskriterier", { id: module.module_id });
  for (const prerequisite of arr(module.prerequisite_module_ids)) {
    requireCondition(moduleIds.has(prerequisite), "modul peker til ukjent forkunnskapsmodul", { id: module.module_id, prerequisite });
    const prerequisiteModule = curriculumById.get(prerequisite);
    requireCondition(prerequisiteModule?.level <= module.level, "forkunnskapsmodul har høyere nivå", { id: module.module_id, prerequisite });
  }
}
const rubricWeights = Object.values(curriculumQuality.capstone?.rubric_weights || {});
requireCondition(arr(curriculumQuality.capstone?.required_components).length >= 8, "sluttoppgaven mangler obligatoriske komponenter");
requireCondition(rubricWeights.reduce((sum, value) => sum + Number(value || 0), 0) === 100, "sluttoppgavens vekter summerer ikke til 100");

// Quiz profile must consume the quality layer.
requireCondition(profile.version === "3.1", "quizprofilen har feil kvalitetsversjon");
requireCondition(profile.governance?.quality_standard === qualityPaths.standard, "quizprofilen peker ikke til kvalitetsstandarden");
requireCondition(profile.governance?.area_quality_profiles === qualityPaths.area_profiles, "quizprofilen peker ikke til områdeprofilene");
requireCondition(profile.governance?.curated_hooks === qualityPaths.curated_hooks, "quizprofilen peker ikke til kuraterte hooks");
requireCondition(arr(profile.claim_classes).length === 7, "quizprofilen mangler påstandsklasser");
requireCondition(arr(profile.question_design?.required_fields).length >= 6, "quizprofilen mangler obligatoriske analysefelt");
requireCondition(profile.source_policy?.minimum_sources?.causal_or_contested_claim >= 2, "quizprofilen krever for få kilder ved kausal påstand");
requireCondition(profile.assessment?.explanation_required === true, "quizprofilen krever ikke forklaring");

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.1",
  subject_id: "teknologi",
  counts: {
    ...expectedCounts,
    claim_classes: claimClasses.length,
    area_quality_profiles: areaProfiles.length,
    curated_hooks: curatedHooks.length,
    theory_quality_objects: theoryQuality.length,
    topic_alignment_overrides: overrides.length,
    curriculum_modules: curriculumModules.length
  },
  gates: {
    nested_under_vitenskap: !contract.runtimeCategories.includes("teknologi") && manifest.vitenskap?.specializations?.teknologi?.canonicalParentSubject === "vitenskap",
    canonical_scientific_specialization: manifest.vitenskap?.specializations?.teknologi?.status === "canonical_scientific_specialization",
    claim_classes_governed: claimClasses.length === 7,
    source_and_uncertainty_policy_complete:
      arr(quality.evidence_policy?.preferred_order).length >= 5 &&
      arr(quality.uncertainty_protocol?.types).length >= 6,
    area_quality_profiles_complete:
      areaProfiles.length === 12 &&
      setEquals(new Set(areaProfiles.map((item) => item.area_id)), areaIds),
    curated_hooks_complete:
      curatedHooks.length === 36 && setEquals(curatedHookIds, legacyHookIds),
    theory_quality_complete:
      theoryQuality.length === 24 && setEquals(new Set(theoryQuality.map((item) => item.id)), theoryIds),
    curriculum_progression_complete:
      curriculumModules.length === 12 && setEquals(new Set(curriculumModules.map((item) => item.module_id)), moduleIds),
    all_references_resolve: failures.length === 0
  },
  failures
};

await mkdir(path.dirname(resolvePath(paths.report)), { recursive: true });
await writeFile(resolvePath(paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
