#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const arr = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === "string" ? value.trim() : "";
const failures = [];
const requireCondition = (condition, reason, details = {}) => {
  if (!condition) failures.push({ reason, ...details });
};
const unique = (values) => values.length === new Set(values).size;
const setEquals = (a, b) => a.size === b.size && [...a].every((value) => b.has(value));
const minText = (value, minimum) => text(value).length >= minimum;
const countBy = (items, key) => {
  const result = {};
  for (const item of items) result[item[key]] = (result[item[key]] || 0) + 1;
  return result;
};

const paths = {
  index: "data/fag/teknologi/teknologi_scientific_v2/index.json",
  profile: "data/fag/teknologi/supersetQUIZMAL_teknologi.json",
  report: "reports/teknologi-ontology-depth-validation.json"
};

const index = await readJson(paths.index);
const profile = await readJson(paths.profile);
const depth = index.depth_layer || {};

for (const key of ["knowledge_object_ontology", "concept_ontology", "validator", "report"]) {
  requireCondition(minText(depth[key], 10), "indeksen mangler V2.2-ressurs", { key });
}
requireCondition(depth.version === "2.2", "depth_layer har feil versjon", { actual: depth.version });
requireCondition(depth.legacy_ids_stable === true, "depth_layer bevarer ikke eksplisitt eksisterende ID-er");
requireCondition(depth.uneven_depth_by_domain === true, "depth_layer tillater ikke faglig ulik dybde");

const [objectOntology, conceptOntology, theoryRegistry, ...areaDocs] = await Promise.all([
  readJson(depth.knowledge_object_ontology),
  readJson(depth.concept_ontology),
  readJson(index.quality_layer.theory_registry),
  ...arr(index.area_files).map(readJson)
]);

const areaIds = new Set(areaDocs.map((doc) => doc.area_id));
const legacyTheoryIds = new Set(arr(theoryRegistry.theories).map((item) => item.id));
const legacyConcepts = areaDocs.flatMap((doc) => arr(doc.concepts));
const legacyConceptIds = new Set(legacyConcepts.map((item) => item.id));

requireCondition(areaIds.size === 12, "V2.2 skal dekke 12 fagområder");
requireCondition(legacyTheoryIds.size === 24, "forventet 24 eksisterende kunnskapsobjekter", { actual: legacyTheoryIds.size });
requireCondition(legacyConceptIds.size === 72, "forventet 72 eksisterende begreper", { actual: legacyConceptIds.size });

// Knowledge-object ontology.
const allowedObjectTypes = new Set(["theory", "model", "principle", "framework", "law", "theorem", "architecture_pattern"]);
const typeDefinitions = arr(objectOntology.object_types);
const classifiedLegacy = arr(objectOntology.legacy_classification);
const extensions = arr(objectOntology.extensions);
const classifiedIds = new Set(classifiedLegacy.map((item) => item.id));
const extensionIds = new Set(extensions.map((item) => item.id));

requireCondition(objectOntology.schema === "teknologi_knowledge_object_ontology_v2_2", "kunnskapsobjektontologien har feil schema");
requireCondition(objectOntology.version === "2.2" && objectOntology.status === "canonical", "kunnskapsobjektontologien er ikke kanonisk V2.2");
requireCondition(setEquals(new Set(typeDefinitions.map((item) => item.id)), allowedObjectTypes), "objekttypene er ufullstendige");
requireCondition(classifiedLegacy.length === 24 && classifiedIds.size === 24, "alle 24 eksisterende objekter må klassifiseres én gang");
requireCondition(setEquals(classifiedIds, legacyTheoryIds), "klassifiseringen dekker ikke nøyaktig de eksisterende teori-ID-ene");
requireCondition(extensions.length === 24 && extensionIds.size === 24, "V2.2 skal legge til 24 unike kunnskapsobjekter");
requireCondition([...extensionIds].every((id) => id.startsWith("kobj_tek_")), "nye kunnskapsobjekter har feil prefix");
requireCondition([...classifiedIds].every((id) => !extensionIds.has(id)), "ny og eksisterende objekt-ID kolliderer");

for (const item of classifiedLegacy) {
  requireCondition(areaIds.has(item.area_id), "eksisterende objekt har ukjent område", { id: item.id, area_id: item.area_id });
  requireCondition(allowedObjectTypes.has(item.object_type), "eksisterende objekt har ugyldig objekttype", { id: item.id, object_type: item.object_type });
}
for (const item of extensions) {
  requireCondition(areaIds.has(item.area_id), "nytt objekt har ukjent område", { id: item.id, area_id: item.area_id });
  requireCondition(allowedObjectTypes.has(item.object_type), "nytt objekt har ugyldig objekttype", { id: item.id, object_type: item.object_type });
  requireCondition(minText(item.scope, 55), "nytt objekt har for svakt virkeområde", { id: item.id });
  requireCondition(minText(item.core_claim, 60), "nytt objekt har for svak kjernepåstand", { id: item.id });
  requireCondition(arr(item.assumptions).length >= 2, "nytt objekt mangler antakelser", { id: item.id });
  requireCondition(arr(item.observable_indicators).length >= 2, "nytt objekt mangler observerbare indikatorer", { id: item.id });
  requireCondition(arr(item.limitations).length >= 2, "nytt objekt mangler begrensninger", { id: item.id });
  requireCondition(arr(item.misuse_risks).length >= 2, "nytt objekt mangler misbruksrisiko", { id: item.id });
  requireCondition(arr(item.concept_ids).length >= 4, "nytt objekt har for få begrepskoblinger", { id: item.id });
}
const objectCounts = countBy([...classifiedLegacy, ...extensions], "area_id");
requireCondition(Object.keys(objectCounts).length === 12, "kunnskapsobjektene dekker ikke alle fagområder");
for (const [areaId, count] of Object.entries(objectCounts)) {
  requireCondition(count >= 3, "fagområde har for få kunnskapsobjekter", { area_id: areaId, count });
}
for (const [areaId, minimum] of Object.entries(objectOntology.coverage?.advanced_area_minimums || {})) {
  requireCondition((objectCounts[areaId] || 0) >= minimum, "avansert fagområde når ikke dybdemål", { area_id: areaId, expected: minimum, actual: objectCounts[areaId] || 0 });
}
requireCondition(new Set([...classifiedLegacy, ...extensions].map((item) => item.object_type)).size >= 7, "ontologien bruker ikke hele objekttaksonomien");

// Concept ontology.
const existingTyping = arr(conceptOntology.existing_concept_typing);
const newConcepts = arr(conceptOntology.new_concepts);
const relations = arr(conceptOntology.typed_relations);
const relationTypes = new Set(arr(conceptOntology.relation_types).map((item) => item.id));
const typedExistingIds = new Set(existingTyping.map((item) => item.id));
const newConceptIds = new Set(newConcepts.map((item) => item.id));
const allConceptIds = new Set([...legacyConceptIds, ...newConceptIds]);

requireCondition(conceptOntology.schema === "teknologi_concept_ontology_v2_2", "begrepsontologien har feil schema");
requireCondition(conceptOntology.version === "2.2" && conceptOntology.status === "canonical", "begrepsontologien er ikke kanonisk V2.2");
requireCondition(existingTyping.length === 72 && typedExistingIds.size === 72, "alle eksisterende begreper må få type");
requireCondition(setEquals(typedExistingIds, legacyConceptIds), "begrepstypingen dekker ikke nøyaktig de eksisterende begrepene");
requireCondition(newConcepts.length === 64 && newConceptIds.size === 64, "V2.2 skal legge til 64 unike begreper");
requireCondition(allConceptIds.size === 136, "samlet begrepsmengde skal være 136", { actual: allConceptIds.size });
requireCondition(relations.length >= 160, "begrepsgrafen har for få typede relasjoner", { actual: relations.length });
requireCondition(relationTypes.size >= 15, "relasjonstaksonomien er for smal", { actual: relationTypes.size });

for (const item of existingTyping) {
  requireCondition(areaIds.has(item.area_id), "eksisterende begrep har ukjent område", { id: item.id });
  requireCondition(minText(item.concept_type, 3), "eksisterende begrep mangler begrepstype", { id: item.id });
}
for (const item of newConcepts) {
  requireCondition(areaIds.has(item.area_id), "nytt begrep har ukjent område", { id: item.id });
  requireCondition(minText(item.label, 2), "nytt begrep mangler label", { id: item.id });
  requireCondition(minText(item.concept_type, 3), "nytt begrep mangler begrepstype", { id: item.id });
  requireCondition(minText(item.definition, 65), "nytt begrep har svak definisjon", { id: item.id });
  requireCondition(minText(item.distinction, 45), "nytt begrep mangler presis avgrensning", { id: item.id });
  requireCondition(minText(item.example, 45), "nytt begrep mangler konkret eksempel", { id: item.id });
  requireCondition(minText(item.counterexample, 35), "nytt begrep mangler moteksempel", { id: item.id });
}
const degree = new Map([...allConceptIds].map((id) => [id, 0]));
for (const relation of relations) {
  requireCondition(areaIds.has(relation.area_id), "relasjon har ukjent område", { relation });
  requireCondition(allConceptIds.has(relation.source_id), "relasjon har ukjent kildebegrep", { relation });
  requireCondition(allConceptIds.has(relation.target_id), "relasjon har ukjent målbegrep", { relation });
  requireCondition(relationTypes.has(relation.relation_type), "relasjon har uregistrert type", { relation });
  if (degree.has(relation.source_id)) degree.set(relation.source_id, degree.get(relation.source_id) + 1);
  if (degree.has(relation.target_id)) degree.set(relation.target_id, degree.get(relation.target_id) + 1);
}
for (const [id, value] of degree) {
  requireCondition(value >= 1, "begrep deltar ikke i typet graf", { id });
}
const conceptAreaCounts = {};
for (const item of [...existingTyping, ...newConcepts]) conceptAreaCounts[item.area_id] = (conceptAreaCounts[item.area_id] || 0) + 1;
requireCondition(Object.keys(conceptAreaCounts).length === 12, "begrepsontologien dekker ikke alle områder");
for (const [areaId, count] of Object.entries(conceptAreaCounts)) {
  requireCondition(count >= 10, "fagområde har for få begreper", { area_id: areaId, count });
}
for (const [areaId, minimum] of Object.entries(conceptOntology.coverage?.advanced_area_minimums || {})) {
  requireCondition((conceptAreaCounts[areaId] || 0) >= minimum, "avansert fagområde når ikke begrepsmål", { area_id: areaId, expected: minimum, actual: conceptAreaCounts[areaId] || 0 });
}
requireCondition(new Set(Object.values(conceptAreaCounts)).size >= 3, "begrepsdybden er fortsatt kunstig symmetrisk", { conceptAreaCounts });

// Cross-bind extension objects to the combined concept graph.
for (const item of extensions) {
  for (const conceptId of arr(item.concept_ids)) {
    requireCondition(allConceptIds.has(conceptId), "nytt kunnskapsobjekt peker til ukjent begrep", { object_id: item.id, concept_id: conceptId });
  }
}

// Profile consumption.
requireCondition(profile.version === "3.1", "quizprofilens kanoniske hovedversjon er endret", { actual: profile.version });
requireCondition(profile.depth_version === "2.2", "quizprofilen mangler V2.2-dybdeversjon", { actual: profile.depth_version });
requireCondition(profile.governance?.knowledge_object_ontology === depth.knowledge_object_ontology, "quizprofilen peker ikke til kunnskapsobjektontologien");
requireCondition(profile.governance?.concept_ontology === depth.concept_ontology, "quizprofilen peker ikke til begrepsontologien");
requireCondition(setEquals(new Set(arr(profile.knowledge_object_types)), allowedObjectTypes), "quizprofilen mangler objekttyper");
requireCondition(profile.question_design?.required_fields?.includes("knowledge_object_type"), "spørsmålsdesign krever ikke objekttype");
requireCondition(profile.question_design?.required_fields?.includes("concept_relation"), "spørsmålsdesign krever ikke begrepsrelasjon");
requireCondition(setEquals(new Set(arr(profile.essential_concepts)), allConceptIds), "quizprofilens essential_concepts dekker ikke hele V2.2-begrepsontologien");

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.2",
  subject_id: "teknologi",
  counts: {
    areas: areaIds.size,
    legacy_knowledge_objects: classifiedLegacy.length,
    extension_knowledge_objects: extensions.length,
    total_knowledge_objects: classifiedLegacy.length + extensions.length,
    object_types: allowedObjectTypes.size,
    existing_concepts: existingTyping.length,
    new_concepts: newConcepts.length,
    total_concepts: allConceptIds.size,
    relation_types: relationTypes.size,
    typed_relations: relations.length
  },
  per_area: {
    knowledge_objects: objectCounts,
    concepts: conceptAreaCounts
  },
  gates: {
    legacy_ids_stable: setEquals(classifiedIds, legacyTheoryIds) && setEquals(typedExistingIds, legacyConceptIds),
    knowledge_object_types_explicit: failures.every((item) => !String(item.reason).includes("objekttype")),
    advanced_domains_have_greater_depth: (objectCounts.algoritmer_data_ai || 0) >= 6 && (objectCounts.nettverk_cybersikkerhet_infrastruktur || 0) >= 6,
    concept_graph_typed_and_resolved: [...degree.values()].every((value) => value >= 1),
    concepts_have_examples_and_counterexamples: newConcepts.every((item) => minText(item.example, 45) && minText(item.counterexample, 35)),
    quiz_profile_consumes_v2_2: profile.version === "3.1" && profile.depth_version === "2.2" && profile.governance?.knowledge_object_ontology === depth.knowledge_object_ontology
  },
  failures
};

await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (failures.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
