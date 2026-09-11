#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const categoryId = "by";
const targetId = "stortorget";
const contextFile = "data/quiz/production_context/by/stortorget.json";
const quizFile = "data/quiz/by/stortorget_sets.json";
const finalizerFile = "tools/finalize-stortorget-quiz.mjs";
const trackedAuditReports = [
  "reports/knowledge-contract-audit.json",
  "reports/knowledge-universe-readers.json"
];

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: "inherit" });

// Permanent fix: the quiz package must reuse the canonical held-back list from the
// deterministic context instead of maintaining a divergent handwritten paraphrase.
const finalizerPath = path.join(root, finalizerFile);
let finalizer = fs.readFileSync(finalizerPath, "utf8");
const staleHeldBack = '  held_back_candidates: ["Identisk kamerapunkt mellom 1843 og 2019.", "Udokumenterte salgs- eller besøkstall.", "Falske Brands for torgflaten."],';
const canonicalHeldBack = "  held_back_candidates: context.held_back_candidates,";
if (finalizer.includes(staleHeldBack)) {
  finalizer = finalizer.replace(staleHeldBack, canonicalHeldBack);
  fs.writeFileSync(finalizerPath, finalizer, "utf8");
} else if (!finalizer.includes(canonicalHeldBack)) {
  throw new Error("Fant ikke forventet Stortorget held_back_candidates-blokk i finalizeren");
}

// Rebuild the context against the final Stories/Places state and synchronize every
// package field that is contractually derived from that context.
const context = await runBuildQuizProductionContext({ root, categoryId, targetId, outputPath: contextFile });
const quiz = readJson(quizFile);
if (!quiz.production_context || typeof quiz.production_context !== "object") {
  throw new Error("Stortorget-quizpakken mangler production_context");
}
quiz.production_context = {
  ...quiz.production_context,
  profile: context.profile,
  resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([key, value]) => [key, value.path])),
  required_inputs_loaded: context.required_inputs_loaded,
  pensum_module_ids: context.selected_curriculum.module_ids,
  emne_ids: context.selected_curriculum.emne_ids,
  topic_hook_ids: context.selected_curriculum.topic_hook_ids,
  method_ids: context.selected_curriculum.method_ids,
  thinker_ids: context.selected_curriculum.thinker_ids,
  works: context.selected_curriculum.works,
  source_review_status: context.source_review_status,
  existing_quiz_audit: context.existing_quiz_audit,
  profile_decision: context.profile_decision,
  held_back_candidates: context.held_back_candidates
};
writeJson(quizFile, quiz);

// Materialize canonical Knowledge outputs. The audit reports are runtime/check artifacts,
// not part of this place closure, so preserve their tracked snapshots while keeping the
// canonical registry and backfill report produced by the writer.
const snapshots = new Map();
for (const relative of trackedAuditReports) {
  const absolute = path.join(root, relative);
  if (fs.existsSync(absolute)) snapshots.set(relative, fs.readFileSync(absolute));
}
try {
  run("npm", ["run", "knowledge:canonical:write"]);
  run("npm", ["run", "audit:quiz-production-context"]);
  run("npm", ["run", "knowledge:canonical:check"]);
  run("npm", ["run", "knowledge:legacy:check"]);
  run("npm", ["run", "audit:knowledge"]);
  run(process.execPath, ["scripts/audit-knowledge-links.mjs"]);
  run("git", ["diff", "--check"]);
} finally {
  for (const [relative, bytes] of snapshots) {
    fs.writeFileSync(path.join(root, relative), bytes);
  }
}

console.log("Stortorget closure regeneration complete: quiz context + Knowledge canonical outputs are synchronized.");
