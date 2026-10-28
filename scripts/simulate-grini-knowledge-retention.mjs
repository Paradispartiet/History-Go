#!/usr/bin/env node
/**
 * Destructive LOCAL WORKTREE simulation: intended ONLY for a disposable CI
 * checkout (all changes are thrown away with the GitHub Actions runner).
 * Simulates replacing playable Grini 1x3 with 10x7, then invokes the real
 * Knowledge canonical write generator. Never commits, publishes or pushes.
 * Refuses execution outside GitHub Actions.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildGriniStagingPreview, readStagingInputs } from "./prepare-grini-quiz-staging.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTIVE = "data/quiz/historie/grini_fangeleir_sets.json";
const PRESERVED = "data/knowledge/preserved_quiz_sources/grini_fangeleir_legacy_1x3.json";
const UNITS = "data/knowledge/knowledge_units.generated.json";

function ensure(condition, error) { if (!condition) throw new Error(error); }
async function readJson(relative) {
  return JSON.parse(await fs.readFile(path.join(ROOT, relative), "utf8"));
}
function findUnits(registry, ids) {
  const map = new Map((registry.units || []).map(u => [u.knowledge_unit_id, u]));
  return ids.map(id => map.get(id));
}
async function main() {
  ensure(process.env.GITHUB_ACTIONS === "true" && process.env.GRINI_DISPOSABLE_KNOWLEDGE_TEST === "1",
    "SAFETY: this script only runs in a disposable GitHub Actions checkout with explicit test flag.");
  const inputs = await readStagingInputs(ROOT);
  const preview = buildGriniStagingPreview(inputs);
  const preserve = await readJson(PRESERVED);
  ensure(preserve.status === "preserved_legacy_knowledge_only_not_playable" &&
    preserve.questions.length === 3, "preserved legacy source invalid");
  ensure(JSON.stringify(preserve.questions) === JSON.stringify(inputs.live.sets[0].questions),
    "preserved snapshot differs from active legacy questions");
  const oldIds = preserve.questions.map(q => q.primary_knowledge_unit_id);
  ensure(new Set(oldIds).size === 3, "old Knowledge ownership is not unique");
  const baseline = await readJson(UNITS);
  const originals = findUnits(baseline, oldIds);
  ensure(originals.every(Boolean), "baseline Knowledge registry does not contain all 3 old Grini KUs");
  // Simulate the canonical manifest's existing Grini file being replaced.
  // The real Knowledge generator still sees it through data/quiz/manifest.json,
  // and retains the displaced legacy units from PRESERVED.
  const quiz = {
    categoryId: "historie", targetId: "grini_fangeleir",
    generator_version: "staging-knowledge-test-only",
    generated_from: preview.source_brief,
    sources: preview.sources,
    sets: preview.sets
  };
  await fs.writeFile(path.join(ROOT, ACTIVE), JSON.stringify(quiz, null, 2) + "\n");
  const child = spawnSync(process.execPath, ["dist/scripts/knowledge-canonical-data.mjs", "--write"], {
    cwd: ROOT, encoding: "utf8", env: process.env, maxBuffer: 20 * 1024 * 1024
  });
  ensure(child.status === 0, `canonical Knowledge generator failed: ${child.stderr || child.stdout}`);
  const regenerated = await readJson(UNITS);
  const retained = findUnits(regenerated, oldIds);
  ensure(retained.every(Boolean), "Knowledge migration simulation dropped at least one old KU");
  for (let i = 0; i < oldIds.length; i++) {
    ensure(retained[i].canonical_claim === originals[i].canonical_claim,
      `canonical claim changed for original KU ${oldIds[i]}`);
    ensure(JSON.stringify(retained[i].concept_ids) === JSON.stringify(originals[i].concept_ids),
      `concept links changed for original KU ${oldIds[i]}`);
    ensure(retained[i].quiz_refs.includes(preserve.questions[i].quiz_id),
      `original KU lost its historic quiz reference: ${oldIds[i]}`);
  }
  const newQuiz = await readJson(ACTIVE);
  const questions = newQuiz.sets.flatMap(s => s.questions);
  ensure(questions.length === 70 && questions.every(q =>
    q.knowledge_contract_version === 1 &&
    q.knowledge_link_status === "linked" &&
    q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id)),
    "new Grini questions have incomplete canonical Knowledge links");
  const map = new Map((regenerated.units || []).map(u => [u.knowledge_unit_id, u]));
  ensure(questions.every(q => q.knowledge_unit_ids.every(id => map.has(id))),
    "new quiz question references missing canonical Knowledge unit");
  ensure(questions.every(q => q.knowledge_unit_ids.every(id => !oldIds.includes(id))),
    "old canonical Knowledge ID reused for a different new question");
  console.log(JSON.stringify({
    status:"DRY_RUN_PASS_NOT_ACTIVATED",
    retained_old_ku_ids:oldIds,
    retained_old_ku_count:retained.length,
    new_quiz_questions_linked:questions.length,
    new_question_knowledge_links_complete:true,
    old_quiz_ref_ownership_retained:true,
    actual_canonical_knowledge_generator_ran:true,
    disposable_checkout_only:true,
    active_source_committed:false,
    production_approval:false
  },null,2));
}
main().catch(err=>{console.error(err.stack||err.message);process.exitCode=1;});
