#!/usr/bin/env node
/**
 * Grini 10x7 canonical-shape STAGING preview.
 *
 * Does not edit data/quiz/{manifest.json,historie/grini_fangeleir_sets.json},
 * data/fag/fag_manifest.json, Knowledge or production_context.
 * --output is restricted to reports/place-production/.
 *
 * Activation must be atomic with actual buildQuizProductionContext output,
 * Knowledge regeneration and canonical audits.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = "grini_fangeleir";
const CATEGORY = "historie";
const BRIEF = "data/quiz/production_briefs/historie/grini_fangeleir.json";
const DRAFT = "reports/place-production/grini-fangeleir-quiz-full-draft-2026-10-28.json";
const LIVE = "data/quiz/historie/grini_fangeleir_sets.json";
const SUPERSET = "data/fag/historie/supersetQUIZMAL_historie.json";

const ensure = (condition, reason) => { if (!condition) throw new Error(reason); };
const entries = (arr) => Array.isArray(arr) ? arr : [];
const json = (obj) => JSON.stringify(obj, null, 2) + "\n";

function family(q) {
  if (q.topic_hook_id || q.thinker_id || q.theory_ref || q.method_id || q.question_type === "concept") return "concept_theory";
  if (["analysis", "context", "comparison"].includes(q.question_type)) return "context";
  return "fact";
}

/**
 * Pure converter; returns a candidate with canonical question/source/set SHAPE,
 * not a published quiz or an approved production_context.
 */
export function buildGriniStagingPreview({ brief, draft, live, superset }) {
  ensure(brief?.targetId === TARGET && brief.categoryId === CATEGORY, "source brief has wrong target/category");
  ensure(draft?.place_id === TARGET && draft.status === "DRAFT_NOT_ACTIVE", "expected unpublished editorial draft");
  ensure(live?.targetId === TARGET && live.categoryId === CATEGORY, "active quiz has wrong target/category");
  ensure(brief.profile_decision?.profile === "major" &&
    brief.profile_decision?.set_count === 10 &&
    brief.profile_decision?.questions_per_set === 7, "reviewed 10x7 profile decision missing");
  const phases = entries(superset.relative_progression?.phase_sequences?.["10"]);
  ensure(phases.length === 10, "category superset has no 10-set phase sequence");
  const sourceBank = brief.sources || {};
  const claimRows = entries(brief.claims);
  const claimById = new Map(claimRows.map(c => [c.claim_id, c]));
  ensure(claimRows.length === 70 && claimById.size === 70, "brief must have 70 distinct claims");
  const oldQ = entries(live.sets).flatMap(s => entries(s.questions));
  ensure(entries(live.sets).length === 1 && oldQ.length === 3,
    "existing quiz has changed; re-audit the Knowledge migration before staging");
  const oldIDs = new Set(oldQ.flatMap(q => [q.id, q.quiz_id]));
  const oldKnowledgeIds = oldQ.map(q => q.primary_knowledge_unit_id);
  ensure(oldKnowledgeIds.every(Boolean), "all 3 old questions must retain Knowledge ownership");
  const seenIDs = new Set(), seenQuizIDs = new Set(), usedClaims = new Set(), usedSources = new Set();
  const answerSlots = [0, 0, 0];
  const families = { fact: 0, context: 0, concept_theory: 0 };
  ensure(entries(draft.sets).length === 10, "draft must contain 10 sets");

  const sets = draft.sets.map((set, index) => {
    ensure(set.set_id === `historie_${TARGET}_set_${index + 1}`, "set ID/order mismatch");
    ensure(set.order === index + 1 && set.phase === phases[index], "set phase does not match canonical progression");
    ensure(entries(set.questions).length === 7, `set ${index + 1} must have 7 questions`);
    const questions = set.questions.map((q, questionIndex) => {
      const c = claimById.get(q.claim_id);
      ensure(c && !usedClaims.has(q.claim_id), `missing/duplicate claim at set ${index + 1} q${questionIndex + 1}`);
      ensure(c.order === index * 7 + questionIndex + 1 &&
        c.planned_phase === phases[index], `claim plan out of order: ${q.claim_id}`);
      usedClaims.add(q.claim_id);
      ensure(q.categoryId === CATEGORY && q.targetId === TARGET && q.placeId === TARGET &&
        q.question_scope === "place", `question targets wrong place: ${q.id}`);
      ensure(q.id && q.quiz_id && !seenIDs.has(q.id) && !seenQuizIDs.has(q.quiz_id),
        `missing/duplicate question identity: ${q.id}`);
      ensure(!oldIDs.has(q.id) && !oldIDs.has(q.quiz_id),
        `legacy identity collision: ${q.id}; preserve old Knowledge ownership`);
      seenIDs.add(q.id); seenQuizIDs.add(q.quiz_id);
      ensure(entries(q.options).length >= 3 && entries(q.options).length <= 4 &&
        Number.isInteger(q.answerIndex) && q.options[q.answerIndex] === q.answer,
        `bad correct answer: ${q.id}`);
      ensure(q.question && q.knowledge && q.claim_basis === c.statement, `question/claim mismatch: ${q.id}`);
      ensure(c.family === family(q), `canonical claim family mismatch: ${q.id}`);
      for (const field of ["emne_id", "method_id", "topic_hook_id", "thinker_id", "work"]) {
        if (c[field] !== undefined) ensure(q[field] === c[field], `claim binding mismatch in ${field}: ${q.id}`);
      }
      const ids = entries(c.source_ids);
      ensure(ids.length > 0 && ids.every(id => sourceBank[id]?.review_status === "reviewed"),
        `non-reviewed/unknown claim source: ${q.id}`);
      ensure(JSON.stringify(q.source) === JSON.stringify(ids.map(id => sourceBank[id].url)),
        `draft source URLs diverge from brief: ${q.id}`);
      if (index < 2) {
        ensure(!q.method_id && !q.topic_hook_id && !q.thinker_id && !q.theory_ref &&
          q.question_type === "fact", `first 14 must remain normal: ${q.id}`);
      }
      for (const id of ids) usedSources.add(id);
      answerSlots[q.answerIndex] += 1;
      families[family(q)] += 1;
      // The canonical quiz stores brief source IDs, NOT URLs.
      const { mapped_to_source_brief: _editorialOnly, ...rest } = q;
      return { ...rest, source: ids };
    });
    return {
      set_id: set.set_id,
      order: set.order,
      level: set.order,
      phase: phases[index],
      title: set.title,
      questions
    };
  });
  ensure(usedClaims.size === 70, "not every reviewed claim is covered once");
  ensure(sets.at(-1).questions.some(q => q.topic_hook_id || q.theory_ref) &&
    sets.at(-1).questions.some(q => q.method_id),
    "final set needs real method and theory bindings");
  ensure(answerSlots.join(",") === "24,24,22", "answer slot distribution changed");
  ensure(families.fact === 41 && families.context === 17 && families.concept_theory === 12,
    "editorial family balance changed; re-run review");
  const sources = Object.fromEntries([...usedSources].map(id => [id, sourceBank[id].url]));
  return {
    status: "STAGING_ONLY_NOT_ACTIVE",
    targetId: TARGET,
    categoryId: CATEGORY,
    size_class: "major_10x7",
    source_brief: BRIEF,
    sources,
    sets,
    preflight: {
      question_count: 70,
      set_count: 10,
      answer_slots: { "0": answerSlots[0], "1": answerSlots[1], "2": answerSlots[2] },
      families,
      legacy_question_id_collisions: 0,
      retained_legacy_knowledge_ids: oldKnowledgeIds,
      source_id_normalization: "70/70",
      production_context: "NOT_BUILT",
      knowledge_sync: "NOT_RUN",
      official_audits: "NOT_RUN",
      activation_allowed: false
    }
  };
}


/**
 * Construct the exact canonical package SHAPE against a REAL context built
 * from the full history manifest. The returned object is still a staging
 * candidate. Do not register it in any runtime manifest or overwrite 1x3
 * without a separate reviewed activation commit and Knowledge sync.
 */
export function buildGriniCanonicalCandidate(preview, context) {
  ensure(preview?.status === "STAGING_ONLY_NOT_ACTIVE", "expected validated preview");
  ensure(context?.categoryId === CATEGORY && context?.targetId === TARGET &&
    context.profile === "major_10x7", "wrong canonical context");
  ensure(context.source_files?.brief?.path === BRIEF, "wrong canonical brief provenance");
  ensure(context.claim_bank?.length === 70 && context.set_plan?.length === 10,
    "context must contain full 70-claim 10-set plan");
  ensure(context.required_inputs_loaded?.length === 7 &&
    Object.values(context.resolved_files || {}).length === 7,
    "seven full category inputs required");
  for (const [i, set] of preview.sets.entries()) {
    ensure(context.set_plan[i].set_id === set.set_id &&
      context.set_plan[i].phase === set.phase &&
      JSON.stringify(context.set_plan[i].claim_ids) === JSON.stringify(set.questions.map(q => q.claim_id)),
      "candidate plan differs from built canonical context");
  }
  const selected = context.selected_curriculum;
  ensure(selected?.emne_ids?.length && selected?.method_ids?.length &&
    selected?.topic_hook_ids?.length, "real curriculum selection missing");
  const production_context = {
    manifest_category: CATEGORY,
    profile: context.profile,
    standard_version: "3.3",
    source_brief: BRIEF,
    context_artifact: "data/quiz/production_context/historie/grini_fangeleir.json",
    resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([k, v]) => [k, v.path])),
    required_inputs_loaded: context.required_inputs_loaded,
    pensum_module_ids: selected.module_ids,
    emne_ids: selected.emne_ids,
    topic_hook_ids: selected.topic_hook_ids,
    method_ids: selected.method_ids,
    thinker_ids: selected.thinker_ids,
    works: selected.works,
    source_review_status: context.source_review_status,
    existing_quiz_audit: context.existing_quiz_audit,
    profile_decision: context.profile_decision,
    held_back_candidates: context.held_back_candidates,
    theory_start_phase: "final",
    method_start_phase: "middle"
  };
  return {
    categoryId: CATEGORY,
    targetId: TARGET,
    size_class: preview.size_class,
    generated_from: preview.source_brief,
    generator_version: "1.0",
    production_context,
    sources: preview.sources,
    sets: preview.sets
  };
}

export async function readStagingInputs(root = ROOT) {
  const read = async (name) => JSON.parse(await fs.readFile(path.join(root, name), "utf8"));
  const [brief, draft, live, superset] = await Promise.all(
    [BRIEF, DRAFT, LIVE, SUPERSET].map(read)
  );
  return { brief, draft, live, superset };
}

async function main() {
  const args = process.argv.slice(2);
  const outputFlag = args.indexOf("--output");
  ensure(args.length === 0 || (outputFlag === 0 && args.length === 2), "Usage: node scripts/prepare-grini-quiz-staging.mjs [--output reports/place-production/<name>.json]");
  const output = outputFlag >= 0 ? args[1] : null;
  const preview = buildGriniStagingPreview(await readStagingInputs());
  if (output) {
    const absolute = path.resolve(ROOT, output);
    const allowed = path.resolve(ROOT, "reports/place-production");
    ensure(absolute.startsWith(allowed + path.sep) && absolute.endsWith(".json"),
      "output must be a .json inside reports/place-production; never write canonical files");
    await fs.writeFile(absolute, json(preview), "utf8");
    console.log(`Wrote STAGING ONLY preview: ${output}`);
  }
  console.log(json({ status: preview.status, ...preview.preflight }));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
