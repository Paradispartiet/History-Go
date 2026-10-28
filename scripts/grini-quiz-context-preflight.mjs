#!/usr/bin/env node
/**
 * Read-only-to-GitHub production context preflight.
 *
 * Build the true canonical context from full manifest+category inputs in a
 * disposable CI checkout, then restore the exact original fag manifest bytes.
 * Optional CI artifact preview is written to runner temp, never the repository.
 * No quiz/Knowledge/production_context file is published by this script.
 *
 * Run this alone (not in parallel with other repo tests) because it uses a
 * short-lived in-checkout fag manifest overlay.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";
import { buildGriniStagingPreview, buildGriniCanonicalCandidate, readStagingInputs } from "./prepare-grini-quiz-staging.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "data/fag/fag_manifest.json");
const expectedTarget = {
  source_brief: "../quiz/production_briefs/historie/grini_fangeleir.json",
  context_artifact: "../quiz/production_context/historie/grini_fangeleir.json",
  quiz_file: "../quiz/historie/grini_fangeleir_sets.json"
};

function ensure(test, message) { if (!test) throw new Error(message); }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

async function main() {
  const preview = buildGriniStagingPreview(await readStagingInputs(root));
  ensure(preview.preflight.question_count === 70, "staging changed");
  const original = await fs.readFile(manifestPath);
  const manifest = JSON.parse(original.toString("utf8"));
  ensure(manifest.historie?.quizProduction?.targets, "missing history quiz production targets");
  const current = manifest.historie.quizProduction.targets.grini_fangeleir;
  ensure(!current || same(current, expectedTarget), "existing Grini manifest entry diverges from the approved target contract");
  const overlay = structuredClone(manifest);
  overlay.historie.quizProduction.targets.grini_fangeleir = expectedTarget;
  let result, failure;
  try {
    await fs.writeFile(manifestPath, JSON.stringify(overlay, null, 2) + "\n", "utf8");
    const context = await buildQuizProductionContext({
      root, categoryId: "historie", targetId: "grini_fangeleir"
    });
    ensure(context.categoryId === "historie" && context.targetId === "grini_fangeleir", "wrong context target");
    ensure(context.profile === "major_10x7", `unexpected resolved profile: ${context.profile}`);
    ensure(context.claim_bank.length === 70 && context.set_plan.length === 10, "context claim/set counts incorrect");
    ensure(context.set_plan.every((s, i) =>
      s.set_id === preview.sets[i].set_id &&
      s.phase === preview.sets[i].phase &&
      same(s.claim_ids, preview.sets[i].questions.map(q => q.claim_id))),
      "context set plan diverges from editorial candidate");
    ensure(context.source_files.brief.path === "data/quiz/production_briefs/historie/grini_fangeleir.json",
      "context source brief path mismatch");
    ensure(context.planned_quiz_file === "data/quiz/historie/grini_fangeleir_sets.json",
      "context canonical quiz target mismatch");
    ensure(context.manifest.matches === 1, "manifest target not uniquely resolved");
    ensure(context.required_inputs_loaded.length === 7, "not all canonical history inputs loaded");
    ensure(Object.keys(context.resolved_files).length === 7 &&
      Object.values(context.resolved_files).every(record => record.sha256?.length === 64 && record.bytes > 0),
      "missing full-fag input hash evidence");
    ensure(context.source_files.brief.sha256?.length === 64, "missing source-brief hash");
    if (process.env.GRINI_CANDIDATE_ARTIFACT === "1") {
      ensure(process.env.GITHUB_ACTIONS === "true" && process.env.RUNNER_TEMP,
        "candidate artifacts may only be written to the disposable CI runner");
      const packageCandidate = buildGriniCanonicalCandidate(preview, context);
      const directory = path.resolve(process.env.RUNNER_TEMP, "grini-integration-preview");
      const gitRoot = path.resolve(root);
      ensure(!directory.startsWith(gitRoot + path.sep),
        "candidate preview directory must be outside the checkout");
      await fs.mkdir(directory, { recursive: true });
      const writePreview = async (name, obj) => fs.writeFile(
        path.join(directory, name), JSON.stringify(obj, null, 2) + "\\n", "utf8");
      await writePreview("grini_fangeleir_sets.CANDIDATE_NOT_ACTIVE.json", packageCandidate);
      await writePreview("grini_fangeleir_context.FULL_INPUT_PREVIEW.json", context);
      await writePreview("README_NOT_FOR_PUBLICATION.json", {
        status: "STAGING_CANDIDATE_ONLY_NOT_PUBLISHED",
        source_commit: process.env.REVIEWED_HEAD_SHA || "not_supplied",
        source_brief_sha256: context.source_files.brief.sha256,
        manifest_overlay: "Full original fag_manifest.json with only a temporary Grini quizProduction target appended",
        expected_target: expectedTarget,
        files_are_not_merged_or_activated: true,
        knowledge_registry_sync_performed: false,
        next_gate: "Independent 70-question editorial signoff followed by atomic integration, canonical Knowledge sync and runtime QA"
      });
    }

    result = {
      status: "STAGING_CONTEXT_BUILT_NOT_ACTIVATED",
      categoryId: context.categoryId,
      targetId: context.targetId,
      resolved_profile: context.profile,
      required_inputs_loaded: context.required_inputs_loaded,
      inputs_with_sha256: Object.keys(context.resolved_files).length,
      source_brief_sha256: context.source_files.brief.sha256,
      claim_count: context.claim_bank.length,
      set_count: context.set_plan.length,
      phases: context.set_plan.map(s => s.phase),
      planned_quiz_file: context.planned_quiz_file,
      activation_allowed: false,
      production_context_persisted: false,
      knowledge_sync: "NOT_RUN",
      official_audits: "NOT_RUN"
    };
  } catch (e) {
    failure = e;
  } finally {
    await fs.writeFile(manifestPath, original);
    const restored = await fs.readFile(manifestPath);
    ensure(restored.equals(original), "fag manifest restore failed");
  }
  if (failure) throw failure;
  console.log(JSON.stringify(result, null, 2));
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; });
