#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const writeJson = async (file, value) => {
  await mkdir(path.dirname(path.resolve(root, file)), { recursive: true });
  await writeFile(path.resolve(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};
const arr = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values)];
const groupBy = (items, keyFn) => {
  const out = {};
  for (const item of items) {
    const key = keyFn(item);
    (out[key] ||= []).push(item);
  }
  return out;
};
const slug = (value) => String(value)
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

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
  reportMarkdown: "reports/teknologi-evidens-og-quiz-v2_3.md"
};



const blueprintPath = `${baseDir}/evidence_blueprint_v2_3.json`;
const [index, profile, objectOntology, conceptOntology, blueprint] = await Promise.all([
  readJson(paths.index),
  readJson(paths.profile),
  readJson(paths.objects),
  readJson(paths.concepts),
  readJson(blueprintPath)
]);
const areaConfig = arr(blueprint.areas);

const objects = [...arr(objectOntology.legacy_classification), ...arr(objectOntology.extensions)];
const concepts = [...arr(conceptOntology.existing_concept_typing), ...arr(conceptOntology.new_concepts)];
const relations = arr(conceptOntology.typed_relations);

const objectsByArea = groupBy(objects, (item) => item.area_id);
const conceptsByArea = groupBy(concepts, (item) => item.area_id);
const relationsByArea = groupBy(relations, (item) => item.area_id);

const sourceEntries = [];
const areaSourcePolicies = [];
const knowledgeObjectBindings = [];
const conceptBindings = [];
const anchors = [];
const tasks = [];
const pathways = [];

for (const area of areaConfig) {
  const areaObjects = arr(objectsByArea[area.id]);
  const areaConcepts = arr(conceptsByArea[area.id]);
  const areaRelations = arr(relationsByArea[area.id]);
  if (areaObjects.length < 3) throw new Error(`Area ${area.id} has too few knowledge objects`);
  if (areaConcepts.length < 10) throw new Error(`Area ${area.id} has too few concepts`);
  if (areaRelations.length < 2) throw new Error(`Area ${area.id} has too few concept relations`);

  const sourceIds = area.sources.map((source) => source.id);
  for (const source of area.sources) {
    sourceEntries.push({
      ...source,
      area_id: area.id,
      status: "canonical_reference",
      access_note: source.url
        ? "Bruk persistent URL eller oppgitt bibliografisk lokator; kontroller versjon ved normativ bruk."
        : "Bruk oppgitt standardnummer, DOI eller ISBN og kontroller tilgjengelig utgave før normativ bruk.",
      supports: {
        knowledge_object_ids: areaObjects.map((item) => item.id),
        concept_ids: areaConcepts.map((item) => item.id),
        anchor_ids: area.anchors.map((anchor) => `anchor_tek_${anchor.slug}`)
      }
    });
  }

  areaSourcePolicies.push({
    area_id: area.id,
    minimum_independent_sources_per_assessment: 2,
    primary_or_official_source_required: true,
    source_ids: sourceIds,
    rule: "Et spørsmål kan ikke arve hele fagområdets bibliografi ukritisk; hvert svar må angi konkrete source_ids og locator eller avsnitt."
  });

  for (const object of areaObjects) {
    knowledgeObjectBindings.push({
      knowledge_object_id: object.id,
      area_id: area.id,
      source_ids: sourceIds,
      binding_scope: "definition_mechanism_assumptions_limitations_and_domain_use",
      locator_required_in_question: true
    });
  }
  for (const concept of areaConcepts) {
    conceptBindings.push({
      concept_id: concept.id,
      area_id: area.id,
      source_ids: sourceIds.slice(0, Math.min(2, sourceIds.length)),
      binding_scope: "definition_distinction_and_domain_context",
      locator_required_when_scored: true
    });
  }

  const anchorIds = [];
  for (const [anchorIndex, anchor] of area.anchors.entries()) {
    const anchorId = `anchor_tek_${anchor.slug}`;
    anchorIds.push(anchorId);
    anchors.push({
      id: anchorId,
      area_id: area.id,
      label: anchor.label,
      anchor_type: anchor.anchor_type,
      system_boundary: anchor.system_boundary,
      operational_context: anchor.context,
      observables: anchor.observables,
      failure_modes: anchor.failure_modes,
      source_ids: sourceIds,
      knowledge_object_ids: areaObjects.slice(anchorIndex, anchorIndex + 3).map((item) => item.id),
      concept_ids: areaConcepts.slice(anchorIndex * 4, anchorIndex * 4 + 6).map((item) => item.id),
      allowed_claim_classes: ["descriptive", "mechanistic", "performance", "causal", "predictive", "normative"],
      prohibited_shortcuts: [
        "påstand uten eksplisitt systemgrense",
        "ytelsessammenligning uten felles driftsbetingelser",
        "sikkerhets- eller bærekraftspåstand basert på én partskilde"
      ],
      observation_protocol: {
        before: ["definer funksjon og systemgrense", "registrer driftsbetingelser og versjon"],
        during: ["observer målbare signaler og avvik", "skill direkte observasjon fra tolkning"],
        after: ["koble observasjon til kilde og kunnskapsobjekt", "registrer usikkerhet og alternative forklaringer"]
      }
    });
  }

  for (const [taskIndex, task] of area.tasks.entries()) {
    const taskId = `task_tek_${slug(area.id)}_${taskIndex + 1}`;
    const anchor = anchors.find((item) => item.id === anchorIds[taskIndex]);
    const relation = areaRelations[taskIndex % areaRelations.length];
    tasks.push({
      id: taskId,
      area_id: area.id,
      title: task.title,
      anchor_id: anchor.id,
      prompt: task.prompt,
      claim_classes: taskIndex === 0 ? ["mechanistic", "performance"] : ["causal", "normative"],
      source_ids: sourceIds,
      knowledge_object_ids: anchor.knowledge_object_ids,
      concept_relation: relation,
      deliverables: task.deliverables,
      evidence_requirements: {
        minimum_sources: 2,
        primary_or_official_source_required: true,
        measured_or_inspected_evidence_required: true,
        source_locator_per_claim_required: true,
        uncertainty_register_required: true
      },
      rubric: [
        { criterion: "systemgrense_og_anker", points: 20 },
        { criterion: "korrekt_kunnskapsobjektbruk", points: 20 },
        { criterion: "evidens_og_kildesporbarhet", points: 25 },
        { criterion: "usikkerhet_og_alternativer", points: 20 },
        { criterion: "presis_begrepsrelasjon", points: 15 }
      ],
      mastery_threshold: 70
    });
  }

  const questions = area.questions.map((entry, questionIndex) => {
    const [question, correct, distractorA, distractorB] = entry;
    const anchor = anchors.find((item) => item.id === anchorIds[questionIndex % anchorIds.length]);
    const task = tasks.find((item) => item.area_id === area.id && item.anchor_id === anchor.id);
    const relation = areaRelations[questionIndex % areaRelations.length];
    const object = areaObjects[questionIndex % areaObjects.length];
    const selectedSources = sourceIds.slice(0, questionIndex >= 3 ? Math.min(3, sourceIds.length) : 2);
    return {
      id: `quiz_tek_${slug(area.id)}_q${questionIndex + 1}`,
      quiz_id: `teknologi_${slug(area.id)}_pathway_q${questionIndex + 1}`,
      categoryId: "teknologi",
      targetId: `subject_teknologi_${area.id}`,
      question_scope: "subject_area",
      level: questionIndex + 1,
      pathway_stage: ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"][questionIndex],
      question,
      options: [correct, distractorA, distractorB],
      answer: correct,
      answerIndex: 0,
      knowledge: `Riktig svar må begrunnes med ${object.label || object.id}, det konkrete ankeret ${anchor.label} og minst én eksplisitt begrepsrelasjon.`,
      explanation: `Ankeret avgrenser analysen til ${anchor.system_boundary}. Svaret er etterprøvbart fordi det peker til en mekanisme eller vurderingsregel og krever dokumenterte driftsbetingelser og usikkerhet.`,
      difficulty: questionIndex < 2 ? 2 : questionIndex < 4 ? 3 : 4,
      claim_class: ["descriptive", "mechanistic", "performance", "causal", "normative"][questionIndex],
      anchor_id: anchor.id,
      technology_anchor: anchor.label,
      assessment_task_id: task.id,
      knowledge_object_id: object.id,
      knowledge_object_type: object.object_type,
      concept_relation: relation,
      source_ids: selectedSources,
      source_locators: selectedSources.map((sourceId) => {
        const source = sourceEntries.find((item) => item.id === sourceId);
        return { source_id: sourceId, locator: source.locator };
      }),
      analysis_method: ["systemavgrensning", "mekanismeanalyse", "evidensvurdering", "feilmodusanalyse", "designavveining"][questionIndex],
      evidence_type: questionIndex < 2 ? "technical_documentation" : questionIndex === 2 ? "measurement_or_test" : "triangulated_evidence",
      uncertainty: questionIndex < 2 ? "model_and_boundary" : "measurement_model_and_scenario",
      comparison_basis: questionIndex === 4
        ? "samme funksjon, systemgrense, driftsbetingelser, metrikk og livsløpsfase"
        : "ikke en komparativ påstand",
      tags: ["teknologi", area.id, anchor.anchor_type, `stage_${questionIndex + 1}`]
    };
  });

  pathways.push({
    id: `pathway_tek_${slug(area.id)}`,
    area_id: area.id,
    label: area.label,
    status: "canonical_production_ready",
    target_kind: "subject_area",
    targetId: `subject_teknologi_${area.id}`,
    sequence: ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"],
    anchor_ids: anchorIds,
    assessment_task_ids: tasks.filter((item) => item.area_id === area.id).map((item) => item.id),
    completion_rule: {
      minimum_correct: 4,
      explanation_required_for_stages: ["evaluate_evidence", "diagnose_failure", "decide_and_justify"],
      source_trace_required_for_mastery: true
    },
    questions
  });
}

const sourceRegistry = {
  schema: "teknologi_source_registry_v2_3",
  version: "2.3",
  status: "canonical",
  subject_id: "teknologi",
  purpose: "Binder faglige påstander, kunnskapsobjekter, begreper, teknologiske ankre og quizsvar til konkrete kilder og lokatorer.",
  governance: {
    bibliography_without_claim_binding_is_insufficient: true,
    question_specific_locator_required: true,
    primary_or_official_source_required_for_mechanism_and_standard_claims: true,
    independent_source_required_for_performance_safety_causal_and_contested_claims: true,
    source_version_must_be_visible: true,
    superseded_standard_must_not_be_presented_as_current_compliance: true
  },
  source_types: unique(sourceEntries.map((item) => item.type)),
  sources: sourceEntries,
  area_source_policies: areaSourcePolicies,
  knowledge_object_bindings: knowledgeObjectBindings,
  concept_bindings: conceptBindings
};

const anchorRegistry = {
  schema: "teknologi_anchor_registry_v2_3",
  version: "2.3",
  status: "canonical",
  subject_id: "teknologi",
  governance: {
    concrete_system_boundary_required: true,
    operational_context_required: true,
    observables_and_failure_modes_required: true,
    source_binding_required: true,
    minimum_anchors_per_area: 2
  },
  anchors
};

const assessmentRegistry = {
  schema: "teknologi_assessment_tasks_v2_3",
  version: "2.3",
  status: "canonical",
  subject_id: "teknologi",
  governance: {
    task_must_use_real_anchor: true,
    deliverable_must_expose_reasoning: true,
    evidence_and_uncertainty_are_scored: true,
    personal_opinion_is_not_mastery: true
  },
  tasks
};

const pathwayRegistry = {
  schema: "teknologi_quiz_pathways_v2_3",
  version: "2.3",
  status: "canonical",
  subject_id: "teknologi",
  runtime_activation: {
    status: "subject_package_ready",
    global_place_manifest_activation: false,
    reason: "Forløpene er fagområdeforløp med subject targets, ikke sted- eller person-targets. De skal konsumeres av Teknologi-fagets Knowledge/quizruntime uten å feilregistreres som sted."
  },
  progression_model: {
    stages: ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"],
    rule: "Spilleren går fra konkret observasjon til mekanisme, evidens, feil og begrunnet designbeslutning. Hvert spørsmål har kilde-, anker-, objekt- og begrepsspor."
  },
  pathways
};

index.counts = {
  ...index.counts,
  sources: sourceEntries.length,
  technology_anchors: anchors.length,
  assessment_tasks: tasks.length,
  quiz_pathways: pathways.length,
  quiz_questions: pathways.reduce((sum, pathway) => sum + pathway.questions.length, 0)
};
index.evidence_layer = {
  version: "2.3",
  status: "canonical",
  source_registry: paths.sources,
  anchor_registry: paths.anchors,
  assessment_tasks: paths.tasks,
  quiz_pathways: paths.pathways,
  validator: "tools/validate-teknologi-evidence-v2_3.mjs",
  report: "reports/teknologi-evidence-production-validation.json",
  rule: "Alle produksjonsklare svar skal kunne spores fra fasit til konkret anker, kunnskapsobjekt, begrepsrelasjon og kilde med lokator."
};
index.production_sequence = unique([
  ...arr(index.production_sequence),
  "bind hver vurdert påstand til konkrete source_ids og lokatorer",
  "bruk et kanonisk teknologisk anker med systemgrense, driftskontekst, observabler og feilmodi",
  "la quizforløpet gå fra observasjon via mekanisme og evidens til feil og begrunnet designvalg"
]);
index.validation = {
  ...index.validation,
  evidence_tool: "tools/validate-teknologi-evidence-v2_3.mjs",
  evidence_report: "reports/teknologi-evidence-production-validation.json"
};

profile.evidence_version = "2.3";
profile.governance = {
  ...profile.governance,
  source_registry: paths.sources,
  technology_anchor_registry: paths.anchors,
  assessment_tasks: paths.tasks,
  quiz_pathways: paths.pathways
};
profile.question_design.required_fields = unique([
  ...arr(profile.question_design?.required_fields),
  "source_ids",
  "source_locators",
  "anchor_id",
  "assessment_task_id",
  "pathway_stage"
]);
profile.question_design.required_moves = unique([
  ...arr(profile.question_design?.required_moves),
  "bind fasiten til minst to konkrete kilder når påstanden gjelder ytelse, sikkerhet, årsak eller omstridt virkning",
  "angi lokator eller versjon for kilden som faktisk støtter svaret",
  "bruk en femtrinns progresjon fra observasjon til begrunnet designvalg"
]);
profile.assessment.score = unique([
  ...arr(profile.assessment?.score),
  "sporbar kjede fra svar til kilde, anker, kunnskapsobjekt og begrepsrelasjon"
]);

await Promise.all([
  writeJson(paths.sources, sourceRegistry),
  writeJson(paths.anchors, anchorRegistry),
  writeJson(paths.tasks, assessmentRegistry),
  writeJson(paths.pathways, pathwayRegistry),
  writeJson(paths.index, index),
  writeJson(paths.profile, profile)
]);

const markdown = `# Teknologi V2.3 – evidens, ankre, oppgaver og quizforløp

V2.3 gjør V2.1-standarden og V2.2-ontologien produksjonsnære.

## Omfang

- ${sourceEntries.length} konkrete kilder med type, versjon og lokator
- ${knowledgeObjectBindings.length} kildebindinger for kunnskapsobjekter
- ${conceptBindings.length} kildebindinger for begreper
- ${anchors.length} teknologiske ankre, to per fagområde
- ${tasks.length} vurderingsoppgaver
- ${pathways.length} femtrinns quizforløp
- ${pathways.reduce((sum, pathway) => sum + pathway.questions.length, 0)} faktiske quizspørsmål

## Sporbarhetskjede

Hvert quizspørsmål peker til:

1. konkret teknologisk anker og systemgrense
2. vurderingsoppgave
3. korrekt type kunnskapsobjekt
4. typet begrepsrelasjon
5. konkrete source_ids og source_locators
6. påstandsklasse, evidenstype og usikkerhet

## Runtimegrense

Forløpene er produksjonsklare fagområdeforløp med subject-targets. De registreres ikke i det globale sted/person-manifestet før quizruntime har en egen manifesttype for fagområder.
`;
await writeFile(path.resolve(root, paths.reportMarkdown), markdown, "utf8");

console.log(JSON.stringify({
  status: "built",
  version: "2.3",
  sources: sourceEntries.length,
  knowledge_object_bindings: knowledgeObjectBindings.length,
  concept_bindings: conceptBindings.length,
  anchors: anchors.length,
  tasks: tasks.length,
  pathways: pathways.length,
  questions: pathways.reduce((sum, pathway) => sum + pathway.questions.length, 0)
}, null, 2));
