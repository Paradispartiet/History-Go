#!/usr/bin/env node
/**
 * Tests *real* canonical Grini production audits using an isolated manifest
 * overlay and a simulated 10x7 active quiz, in an ephemeral CI checkout only.
 * Does not commit files or publish the quiz.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";
import { auditQuizProductionContext } from "./audit-quiz-production-context.mjs";
import { auditQuizProgression } from "./audit-quiz-progression.mjs";
import { auditQuizTheoryBinding } from "./audit-quiz-theory-binding.mjs";
import { buildGriniStagingPreview, buildGriniCanonicalCandidate, readStagingInputs } from "./prepare-grini-quiz-staging.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FAG_MANIFEST = "data/fag/fag_manifest.json";
const QUIZ_PATH = "data/quiz/historie/grini_fangeleir_sets.json";
const CONTEXT_PATH = "data/quiz/production_context/historie/grini_fangeleir.json";
const TARGET_ENTRY = {
  source_brief: "../quiz/production_briefs/historie/grini_fangeleir.json",
  context_artifact: "../quiz/production_context/historie/grini_fangeleir.json",
  quiz_file: "../quiz/historie/grini_fangeleir_sets.json"
};
const ensure = (condition, reason) => { if(!condition) throw new Error(reason); };
const writeJson = async (relative, data) => {
  const dest = path.join(ROOT, relative);
  await fs.mkdir(path.dirname(dest), { recursive:true });
  await fs.writeFile(dest, JSON.stringify(data, null, 2) + "\n", "utf8");
};
async function main() {
  ensure(process.env.GITHUB_ACTIONS === "true" && process.env.GRINI_DISPOSABLE_CANONICAL_TEST === "1",
    "SAFETY: run only as explicit disposable GitHub Actions simulation.");
  const inputs = await readStagingInputs(ROOT);
  const preview = buildGriniStagingPreview(inputs);
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, FAG_MANIFEST), "utf8"));
  for (const [categoryId, entry] of Object.entries(manifest)) {
    if (!entry?.quizProduction) continue;
    if (categoryId === "historie") entry.quizProduction.targets = { grini_fangeleir: TARGET_ENTRY };
    else delete entry.quizProduction; // only the Grini target is audited in this simulation
  }
  await writeJson(FAG_MANIFEST, manifest);
  const artifact = await buildQuizProductionContext({ root:ROOT, categoryId:"historie", targetId:"grini_fangeleir" });
  ensure(artifact.profile === "major_10x7" && artifact.claim_bank.length === 70,
    "canonical source context profile/claims mismatch");
  const quiz = buildGriniCanonicalCandidate(preview, artifact);
  await writeJson(QUIZ_PATH, quiz);
  await writeJson(CONTEXT_PATH, artifact);
  const audits = [
    ["quiz-production-context", await auditQuizProductionContext({root:ROOT})],
    ["quiz-progression", await auditQuizProgression({root:ROOT})],
    ["quiz-theory-binding", await auditQuizTheoryBinding({root:ROOT})]
  ];
  for (const [name, report] of audits) {
    if (report.status !== "passed") {
      console.error(JSON.stringify({ audit:name, status:report.status, failures:report.failures?.slice(0,35) }, null, 2));
      throw new Error(`${name} failed in isolated Grini canonical simulation`);
    }
  }
  console.log(JSON.stringify({
    status:"ISOLATED_CANONICAL_AUDITS_PASS_NOT_ACTIVATED",
    scope:"ONLY Grini target in isolated fag_manifest overlay",
    context_claims:artifact.claim_bank.length,
    set_count:quiz.sets.length,
    question_count:quiz.sets.flatMap(s=>s.questions).length,
    resolved_hash_inputs:Object.keys(artifact.resolved_files).length,
    audits:audits.map(([name,r])=>({name,status:r.status,checked:r.quizFilesChecked})),
    runtime_manifest_unchanged:true,
    all_repository_checks_passed:false,
    published:false
  },null,2));
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode=1; });
