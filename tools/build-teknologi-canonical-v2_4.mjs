#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");
if (!WRITE && !CHECK) throw new Error("Bruk --write eller --check");

const INDEX_PATH = "data/fag/teknologi/teknologi_scientific_v2/index.json";
const BASE_DIR = "data/fag/teknologi/teknologi_scientific_v2";
const OUTPUTS = {
  pensum: "data/fag/teknologi/teknologipensum_canonical_v2_4.json",
  emner: "data/fag/teknologi/emner_teknologi_canonical_v2_4.json",
  fagkart: "data/fag/teknologi/fagkart_teknologi_canonical_v2_4.json",
  methods: "data/fag/teknologi/methods_teknologi_canonical_v2_4.json",
  subjectPackage: "data/quiz/teknologi/teknologi_subject_pathways_v1.json",
  subjectSchema: "data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json",
  report: "reports/teknologi-canonical-integration-v2_4.md"
};

const arr = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value ?? "").trim();
const unique = (values) => [...new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]).map(clean).filter(Boolean))];
const readJson = async (relative) => JSON.parse(await readFile(path.resolve(ROOT, relative), "utf8"));
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const normalize = (value) => clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const slug = (value, max = 48) => normalize(value).replace(/\s+/g, "_").replace(/^_+|_+$/g, "").slice(0, max);
const digest = (value, length = 12) => createHash("sha256").update(clean(value), "utf8").digest("hex").slice(0, length);
const stableId = (prefix, subjectId, value) => `${prefix}_${slug(subjectId, 24) || "unknown"}_${slug(value, prefix === "ku" ? 24 : 36) || "item"}_${digest(`${subjectId}\0${normalize(value)}`, 10)}`;

function splitClaims(value) {
  const source = clean(value).replace(/\s+/g, " ");
  if (!source) return [];
  const protectedText = source
    .replace(/\b(bl|ca|dvs|dr|f\.eks|mfl|mr|nr|osv|prof|st)\./gi, (match) => match.replace(".", "∯"))
    .replace(/(\d)\.(\d)/g, "$1∯$2");
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/)
    .map((part) => part.replaceAll("∯", ".").trim())
    .filter((part) => part.length >= 12 && !part.endsWith("?"));
}

const changed = [];
async function writeExpected(relative, content) {
  const next = typeof content === "string" ? content : jsonText(content);
  let previous = "";
  try { previous = await readFile(path.resolve(ROOT, relative), "utf8"); } catch {}
  if (previous === next) return;
  changed.push(relative);
  if (WRITE) {
    await mkdir(path.dirname(path.resolve(ROOT, relative)), { recursive: true });
    await writeFile(path.resolve(ROOT, relative), next, "utf8");
  }
}

function questionType(stage) {
  if (stage === "observe") return "observation";
  if (stage === "evaluate_evidence") return "comparison";
  if (stage === "explain") return "concept";
  return "analysis";
}

const index = await readJson(INDEX_PATH);
const areaDocs = await Promise.all(arr(index.area_files).map(readJson));
const curriculum = await readJson(`${BASE_DIR}/curriculum_quality_v2_1.json`);
const sourceRegistry = await readJson(`${BASE_DIR}/source_registry_v2_3.json`);
const pathwayRegistry = await readJson(`${BASE_DIR}/quiz_pathways_v2_3.json`);
const conceptOntology = await readJson(`${BASE_DIR}/concept_ontology_v2_2.json`);
const objectOntology = await readJson(`${BASE_DIR}/knowledge_object_ontology_v2_2.json`);

const areaById = new Map(areaDocs.map((doc) => [doc.area_id, doc]));
const curriculumById = new Map(arr(curriculum.modules).map((module) => [module.module_id, module]));
const sourceById = new Map(arr(sourceRegistry.sources).map((source) => [source.id, source]));
const concepts = [...arr(conceptOntology.existing_concept_typing), ...arr(conceptOntology.new_concepts)];
const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
const objects = [...arr(objectOntology.legacy_classification), ...arr(objectOntology.extensions)];
const objectById = new Map(objects.map((object) => [object.id, object]));
void objectById;

const modules = areaDocs.map((doc) => {
  const module = doc.module || {};
  const quality = curriculumById.get(module.id) || {};
  return {
    module_id: module.id,
    title: doc.title,
    level: module.level,
    estimated_minutes: 60,
    mål: arr(quality.learning_outcomes),
    emner: arr(module.topic_ids),
    metoder: arr(module.method_ids),
    prerequisite_module_ids: arr(quality.prerequisite_module_ids),
    core_question: quality.core_question || arr(doc.research_questions)[0],
    required_evidence: arr(quality.required_evidence),
    assessment_task: quality.assessment_task || "",
    mastery_criteria: arr(quality.mastery_criteria),
    status: "active"
  };
});

const pensum = {
  subject_id: "teknologi",
  label: "Teknologi – pensum",
  version: "2.4",
  status: "canonical",
  source_package: INDEX_PATH,
  progression_model: curriculum.progression_model,
  modules,
  capstone: curriculum.capstone
};

const emner = areaDocs.flatMap((doc) => arr(doc.topics).map((topic) => ({
  emne_id: topic.id,
  subject_id: "teknologi",
  domain: doc.area_id,
  area_id: doc.area_id,
  area_label: doc.title,
  level: topic.level,
  title: topic.title,
  short_label: topic.title,
  status: "active",
  definition: topic.definition,
  why_it_matters: `Emnet gjør det mulig å analysere ${doc.title.toLowerCase()} gjennom dokumenterte mekanismer, evidens, feilmodi og avveininger.`,
  core_concepts: arr(topic.concept_ids),
  concept_ids: arr(topic.concept_ids),
  method_ids: arr(topic.method_ids),
  hook_ids: arr(topic.hook_ids),
  theory_ids: arr(topic.theory_ids),
  quiz_priority: "high",
  direct_quiz_ok: true,
  requires_technology_anchor: true,
  requires_external_claim_basis: true
})));

const methods = {
  subject_id: "teknologi",
  version: "2.4",
  status: "canonical",
  source_package: INDEX_PATH,
  methods: areaDocs.flatMap((doc) => arr(doc.methods).map((method) => ({
    method_id: method.id,
    subject_id: "teknologi",
    area_id: doc.area_id,
    label: method.label,
    purpose: method.purpose,
    status: "active"
  })))
};

const fagkart = {
  subject_id: "teknologi",
  subject_title: "Teknologi",
  type: "fagkart",
  version: "2.4-canonical",
  purpose: "Én universell og vitenskapelig fagmodell for Teknologi i History Go.",
  source_package: INDEX_PATH,
  principles: {
    source_first: true,
    external_claim_basis_required: true,
    concrete_system_before_theory: true,
    uncertainty_must_be_explicit: true,
    comparison_requires_common_basis: true,
    emne_prefix_required: "em_tek_"
  },
  categories: areaDocs.map((doc) => ({
    id: doc.area_id,
    title: doc.title,
    definition: doc.definition,
    research_questions: arr(doc.research_questions),
    focus: arr(doc.topics).map((topic) => topic.id),
    topic_hooks: arr(doc.hooks).map((hook) => ({
      id: hook.id,
      title: hook.title,
      problem: hook.problem,
      emne_ids: arr(hook.topic_ids),
      concept_ids: arr(hook.concept_ids),
      recommended_method_ids: arr(hook.method_ids),
      thinker_ids: arr(hook.thinker_ids),
      theory_ids: arr(hook.theory_ids)
    })),
    thinkers: arr(doc.thinkers),
    theory_objects: arr(doc.theory_objects)
  })),
  meta: {
    area_count: areaDocs.length,
    topic_count: emner.length,
    hook_count: areaDocs.flatMap((doc) => arr(doc.hooks)).length,
    method_count: methods.methods.length,
    thinker_count: areaDocs.flatMap((doc) => arr(doc.thinkers)).length,
    theory_object_count: areaDocs.flatMap((doc) => arr(doc.theory_objects)).length
  }
};

const stageMethodIndex = { observe: 0, explain: 0, evaluate_evidence: 1, diagnose_failure: 1, decide_and_justify: 0 };
const subjectSets = arr(pathwayRegistry.pathways).map((pathway, setIndex) => {
  const doc = areaById.get(pathway.area_id);
  if (!doc) throw new Error(`Ukjent area_id i pathway: ${pathway.area_id}`);
  const topicIds = arr(doc.topics).map((topic) => topic.id);
  const methodIds = arr(doc.methods).map((method) => method.id);
  const hookIds = arr(doc.hooks).map((hook) => hook.id);
  const questions = arr(pathway.questions).map((question, questionIndex) => {
    const emneId = topicIds[Math.min(questionIndex, topicIds.length - 1)];
    const relation = question.concept_relation || {};
    const relationConcepts = unique([
      conceptById.get(relation.source_id)?.label || relation.source_id,
      conceptById.get(relation.target_id)?.label || relation.target_id
    ]);
    const canonicalClaim = clean(question.knowledge || question.explanation);
    const claims = splitClaims(canonicalClaim);
    const effectiveClaims = claims.length ? claims : [canonicalClaim];
    const knowledgeIds = effectiveClaims.map((claim) => stableId("ku", "teknologi", claim));
    const conceptIds = relationConcepts.map((label) => stableId("co", "teknologi", label));
    const termIds = relationConcepts.map((label) => stableId("term", "teknologi", label));
    const source = arr(question.source_locators).map((locator) => {
      const sourceRecord = sourceById.get(locator.source_id) || {};
      return {
        source_id: locator.source_id,
        source_type: sourceRecord.type || "reference",
        title: sourceRecord.title || locator.source_id,
        publisher_or_author: sourceRecord.publisher_or_author || "",
        date_or_version: sourceRecord.date_or_version || "",
        locator: locator.locator,
        claim_basis: clean(question.explanation)
      };
    });
    return {
      ...question,
      question_type: questionType(question.pathway_stage),
      emne_id: emneId,
      emne_ids: [emneId],
      method_id: methodIds[stageMethodIndex[question.pathway_stage] ?? 0] || methodIds[0],
      topic_hook_id: hookIds[Math.min(questionIndex, hookIds.length - 1)] || hookIds[0],
      concepts: relationConcepts,
      core_concepts: relationConcepts,
      concept_ids: conceptIds,
      terms: relationConcepts,
      term_ids: termIds,
      primary_knowledge_unit_id: knowledgeIds[0],
      knowledge_unit_ids: knowledgeIds,
      learning_objective_id: `lo_teknologi_${pathway.area_id}_${question.pathway_stage}`,
      feedback_basis: "source_trace_and_explanation",
      knowledge_payload: {
        summary: canonicalClaim,
        explanation: question.explanation,
        why_it_matters: `Spørsmålet trener ${pathway.label.toLowerCase()} gjennom et dokumentert teknisk anker.`
      },
      source,
      source_origin: "external",
      claim_basis: question.explanation,
      guidance_basis: [INDEX_PATH, index.area_files[setIndex]],
      knowledge_contract_version: 1,
      knowledge_link_status: "linked",
      knowledge_link_evidence: { method: "explicit", confidence: 1 }
    };
  });
  return {
    set_id: pathway.id,
    title: pathway.label,
    level: Math.max(...questions.map((question) => Number(question.level) || 1)),
    order: setIndex + 1,
    phase: "subject_pathway",
    target_kind: "subject_area",
    targetId: pathway.targetId,
    area_id: pathway.area_id,
    sequence: pathway.sequence,
    completion_rule: pathway.completion_rule,
    anchor_ids: pathway.anchor_ids,
    assessment_task_ids: pathway.assessment_task_ids,
    questions
  };
});

const subjectPackage = {
  schema: "history_go_subject_pathway_package_v1",
  version: 1,
  status: "canonical",
  package_kind: "subject_pathway",
  categoryId: "teknologi",
  subject_id: "teknologi",
  targetId: "subject_teknologi",
  title: "Teknologi – fagområdeforløp",
  sources: arr(sourceRegistry.sources),
  production_context: {
    manifest_category: "teknologi",
    profile: "subject_pathway_12x5",
    standard_version: "QUIZ_PRODUCTION_CANONICAL_3.2+SUBJECT_PATHWAY_V1",
    source_brief: `${BASE_DIR}/source_registry_v2_3.json`,
    context_artifact: INDEX_PATH,
    resolved_files: {
      pensum: OUTPUTS.pensum,
      emner: OUTPUTS.emner,
      fagkart: OUTPUTS.fagkart,
      methods: OUTPUTS.methods,
      scientific_package: INDEX_PATH,
      pathways: `${BASE_DIR}/quiz_pathways_v2_3.json`
    },
    required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "scientificPackage", "subjectPathways"],
    pensum_module_ids: modules.map((module) => module.module_id),
    emne_ids: emner.map((emne) => emne.emne_id),
    topic_hook_ids: fagkart.categories.flatMap((category) => category.topic_hooks.map((hook) => hook.id)),
    method_ids: methods.methods.map((method) => method.method_id),
    thinker_ids: unique(areaDocs.flatMap((doc) => arr(doc.thinkers).map((thinker) => thinker.id))),
    works: unique(areaDocs.flatMap((doc) => arr(doc.thinkers).map((thinker) => thinker.work))),
    source_review_status: "reviewed",
    geographic_activation: false,
    geographic_activation_note: "Fagområdeforløp er universelle subject targets. Stedsquizer produseres separat fra lokale source briefs."
  },
  sets: subjectSets
};

const subjectSchema = {
  version: "1.0",
  status: "canonical_output_contract",
  purpose: "Teknisk kontrakt for universelle fagområdeforløp som leverer vurdering og Knowledge uten å registreres som sted eller person.",
  package_kind: "subject_pathway",
  required_top_fields: ["schema", "version", "status", "package_kind", "categoryId", "subject_id", "targetId", "sources", "production_context", "sets"],
  set_contract: {
    required_fields: ["set_id", "title", "level", "order", "phase", "target_kind", "targetId", "area_id", "sequence", "questions"],
    phase: "subject_pathway",
    target_kind: "subject_area",
    questions_per_set: 5,
    required_sequence: ["observe", "explain", "evaluate_evidence", "diagnose_failure", "decide_and_justify"]
  },
  question_contract: {
    base_schema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json",
    required_fields: ["id", "quiz_id", "categoryId", "targetId", "question_scope", "question", "options", "answer", "answerIndex", "knowledge", "difficulty", "question_type", "emne_id", "source", "primary_knowledge_unit_id", "knowledge_unit_ids", "concept_ids", "term_ids", "learning_objective_id", "evidence_type", "knowledge_payload", "feedback_basis"],
    question_scope: "subject_area"
  },
  separation_rule: "Normalåpningen 2 x 7 gjelder sted-, person- og naturquizer. Et subject pathway er et femtrinns vurderingsforløp og valideres av egen kontrakt."
};

await writeExpected(OUTPUTS.pensum, pensum);
await writeExpected(OUTPUTS.emner, emner);
await writeExpected(OUTPUTS.fagkart, fagkart);
await writeExpected(OUTPUTS.methods, methods);
await writeExpected(OUTPUTS.subjectPackage, subjectPackage);
await writeExpected(OUTPUTS.subjectSchema, subjectSchema);

const manifestPath = "data/fag/fag_manifest.json";
const manifest = await readJson(manifestPath);
manifest.vitenskap.specializations = {
  ...(manifest.vitenskap.specializations || {}),
  teknologi: {
    ...(manifest.vitenskap.specializations?.teknologi || {}),
    id: "teknologi",
    label: "Teknologi",
    canonicalParentSubject: "vitenskap",
    badgeId: "vitenskap",
    schemaFamily: "technology_scientific_v2_4",
    routeStatus: "planned",
    route: "",
    pensum: "teknologi/teknologipensum_canonical_v2_4.json",
    emner: "teknologi/emner_teknologi_canonical_v2_4.json",
    fagkart: "teknologi/fagkart_teknologi_canonical_v2_4.json",
    methods: "teknologi/methods_teknologi_canonical_v2_4.json",
    supersetQuizMal: "teknologi/supersetQUIZMAL_teknologi.json",
    quizStandard: "../quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
    quizQuestionSchema: "../quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json",
    quizPackageSchema: "../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json",
    subjectPathwaySchema: "../quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json",
    subjectPathwayPackage: "../quiz/teknologi/teknologi_subject_pathways_v1.json",
    status: "canonical_scientific_specialization",
    canonicalModelVersion: "2.4",
    scientificPackage: "teknologi/teknologi_scientific_v2/index.json",
    universalCoverage: { status: "complete", areas: 12, topics: 48, methods: 35, modules: 12 },
    geographicProduction: { status: "separate", rule: "Lokale steder, personer, claims, kilder og stedsquizer produseres i geografiske lag." }
  }
};
await writeExpected(manifestPath, manifest);

const quizManifestPath = "data/quiz/manifest.json";
const quizManifest = await readJson(quizManifestPath);
quizManifest.subjectPackages = arr(quizManifest.subjectPackages).filter((entry) => entry?.subjectId !== "teknologi");
quizManifest.subjectPackages.push({
  subjectId: "teknologi",
  targetId: "subject_teknologi",
  packageKind: "subject_pathway",
  file: OUTPUTS.subjectPackage,
  schema: OUTPUTS.subjectSchema,
  status: "active",
  parentSubjectId: "vitenskap",
  specializationId: "teknologi"
});
quizManifest.subjectPackages.sort((a, b) => clean(a.subjectId).localeCompare(clean(b.subjectId), "nb"));
await writeExpected(quizManifestPath, quizManifest);

const questionSchemaPath = "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json";
const questionSchema = await readJson(questionSchemaPath);
questionSchema.target_fields = { ...questionSchema.target_fields, subject_area_question: ["targetId", "question_scope", "emne_id"] };
questionSchema.subject_area_required_fields = ["primary_knowledge_unit_id", "knowledge_unit_ids", "concept_ids", "term_ids", "learning_objective_id", "evidence_type", "knowledge_payload", "feedback_basis"];
questionSchema.subject_area_rule = "Subject-area questions use question_scope=subject_area and are validated by QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json; they are not place visits.";
await writeExpected(questionSchemaPath, questionSchema);

const templateRegistryPath = "data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json";
const templateRegistry = await readJson(templateRegistryPath);
templateRegistry.canonical_files = { ...templateRegistry.canonical_files, subject_pathway_schema: OUTPUTS.subjectSchema };
templateRegistry.category_profiles = { ...templateRegistry.category_profiles };
delete templateRegistry.category_profiles.teknologi;
templateRegistry.subject_specialization_profiles = {
  ...(templateRegistry.subject_specialization_profiles || {}),
  vitenskap: { ...(templateRegistry.subject_specialization_profiles?.vitenskap || {}), teknologi: "data/fag/teknologi/supersetQUIZMAL_teknologi.json" }
};
templateRegistry.global_invariants = {
  ...templateRegistry.global_invariants,
  subject_pathway_separation: {
    schema: OUTPUTS.subjectSchema,
    rule: "Universelle fagområdeforløp registreres i manifest.subjectPackages og kan ikke feilregistreres som sted-, person- eller naturmål."
  }
};
await writeExpected(templateRegistryPath, templateRegistry);

const knowledgeManifestPath = "data/knowledge/knowledge_manifest.json";
const knowledgeManifest = await readJson(knowledgeManifestPath);
knowledgeManifest.runtime = {
  ...knowledgeManifest.runtime,
  subjectPathwaySources: { ...(knowledgeManifest.runtime?.subjectPathwaySources || {}), teknologi: `../quiz/teknologi/${path.basename(OUTPUTS.subjectPackage)}` }
};
await writeExpected(knowledgeManifestPath, knowledgeManifest);

const knowledgePipelinePath = "scripts/knowledge-canonical-data.mts";
let knowledgePipeline = await readFile(path.resolve(ROOT, knowledgePipelinePath), "utf8");
const oldManifestFiles = `    ...(Array.isArray(manifest.sets) ? manifest.sets.map((entry: unknown) => isObject(entry) ? entry.file : '') : []),\n  ]);`;
const newManifestFiles = `    ...(Array.isArray(manifest.sets) ? manifest.sets.map((entry: unknown) => isObject(entry) ? entry.file : '') : []),\n    ...(Array.isArray(manifest.subjectPackages) ? manifest.subjectPackages.map((entry: unknown) => isObject(entry) ? entry.file : '') : []),\n  ]);`;
if (!knowledgePipeline.includes("manifest.subjectPackages")) {
  if (!knowledgePipeline.includes(oldManifestFiles)) throw new Error("Fant ikke manifestFiles-blokken i knowledge-canonical-data.mts");
  knowledgePipeline = knowledgePipeline.replace(oldManifestFiles, newManifestFiles);
}
await writeExpected(knowledgePipelinePath, knowledgePipeline);

const packagePath = "package.json";
const packageJson = await readJson(packagePath);
packageJson.scripts = {
  ...packageJson.scripts,
  "build:teknologi-canonical": "node tools/build-teknologi-canonical-v2_4.mjs --write",
  "check:teknologi-canonical": "node tools/build-teknologi-canonical-v2_4.mjs --check && node tools/validate-teknologi-canonical-v2_4.mjs"
};
await writeExpected(packagePath, packageJson);

const workflowPath = ".github/workflows/teknologi-scientific-quality.yml";
let workflow = await readFile(path.resolve(ROOT, workflowPath), "utf8");
if (!workflow.includes("build-teknologi-canonical-v2_4.mjs")) {
  workflow = workflow.replace("      - 'tools/build-teknologi-evidence-v2_3.mjs'\n", "      - 'tools/build-teknologi-evidence-v2_3.mjs'\n      - 'tools/build-teknologi-canonical-v2_4.mjs'\n      - 'tools/validate-teknologi-canonical-v2_4.mjs'\n      - 'data/quiz/teknologi/**'\n      - 'data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json'\n      - 'data/knowledge/**'\n      - 'scripts/knowledge-canonical-data.mts'\n");
  workflow = workflow.replace("    name: Technology V2.1, V2.2 and V2.3", "    name: Technology V2.1–V2.4 canonical integration");
  workflow = workflow.replace("      - name: Validate scientific quality V2.1", "      - name: Install dependencies\n        run: npm ci\n\n      - name: Build script runtime\n        run: npm run build:scripts\n\n      - name: Check canonical Technology model V2.4\n        run: node tools/build-teknologi-canonical-v2_4.mjs --check\n\n      - name: Check Knowledge canonical sync\n        run: node dist/scripts/knowledge-canonical-data.mjs --check\n\n      - name: Validate scientific quality V2.1");
  workflow = workflow.replace("      - name: Upload scientific quality reports", "      - name: Validate canonical integration V2.4\n        run: node tools/validate-teknologi-canonical-v2_4.mjs\n\n      - name: Upload scientific quality reports");
  workflow = workflow.replace("            reports/teknologi-evidence-production-validation.json\n", "            reports/teknologi-evidence-production-validation.json\n            reports/teknologi-canonical-integration-validation.json\n");
}
await writeExpected(workflowPath, workflow);

const report = `# Teknologi V2.4 – canonical integrasjon\n\nStatus: **canonical scientific specialization under Vitenskap & teknologi**\n\n- V2-pakken er bevart som Teknologi-spesialiseringen under manifestets canonicale Vitenskap-fag og eier sine pensum-, emne-, fagkart- og metodepekere.\n- 12 fagområder, 48 emner, 35 metoder og 12 moduler er materialisert i de ordinære canonical fagfilene.\n- De 60 V2.3-spørsmålene er normalisert som 12 universelle subject pathways med fem faglige progresjonstrinn.\n- Subject pathways er eksplisitt skilt fra sted-, person- og naturquizer og registreres ikke som fysiske mål.\n- Hvert spørsmål følger globalt spørsmålsskjema og Knowledge-kontrakt med stabile knowledge-unit-, concept- og term-ID-er.\n- Quizmanifestets subjectPackages leses av den canonical Knowledge-datapipelinen.\n- Geografisk produksjonsdekning er fortsatt et separat mål og skal bygges med lokale source briefs og stedsquizer.\n`;
await writeExpected(OUTPUTS.report, report);

if (CHECK && changed.length) {
  console.error(JSON.stringify({ status: "out_of_sync", changed }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "ok", mode: WRITE ? "write" : "check", changed }, null, 2));
