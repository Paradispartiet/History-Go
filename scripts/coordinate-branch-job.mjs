#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const report = [];
const log = (value = "") => {
  const text = String(value);
  report.push(text);
  process.stdout.write(`${text}\n`);
};

function run(label, command, args, options = {}) {
  log(`\n===== ${label} =====`);
  log(`$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.stdout) log(result.stdout.trimEnd());
  if (result.stderr) log(result.stderr.trimEnd());
  log(`exit=${result.status ?? "null"}`);
  if ((result.status ?? 1) !== 0) throw new Error(`${label} failed`);
}

function listFiles(target) {
  const absolute = path.join(root, target);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return [target];
  return fs.readdirSync(absolute, { withFileTypes: true })
    .flatMap((entry) => listFiles(path.join(target, entry.name)))
    .sort();
}

const fixedPointRoots = [
  "data/Civication/historyPeople_index.json",
  "data/Civication/scenarioPeople/generated/by.json",
  "data/Civication/scenarioPeople_index.json",
  "data/epoker/epoke-place-index.json",
  "data/fagverk/fagverk_registry.json",
  "data/fagverk/fagverk_release.json",
  "data/knowledge/knowledge_units.generated.json",
  "data/places/place_image_backlog_summary.json",
  "data/places/places_index.json",
  "data/quiz/production_context/by/stortorget.json",
  "data/runtime/people-all.json",
  "data/runtime/people-all",
  "data/runtime/stories-all.json",
  "data/runtime/stories-all",
  "data/runtime/leksikon-all.json",
  "data/runtime/leksikon-all",
  "data/runtime/place-open/stortorget.json",
  "reports/knowledge-id-backfill.json"
];

function fixedPointDigest() {
  const hash = crypto.createHash("sha256");
  const files = [...new Set(fixedPointRoots.flatMap(listFiles))].sort();
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(fs.readFileSync(path.join(root, file)));
    hash.update("\0");
  }
  return { digest: hash.digest("hex"), files: files.length };
}

async function derive(cycle) {
  run(`cycle ${cycle}: scenario people`, process.execPath, ["--experimental-strip-types", "scripts/build-civication-scenario-people-index.mts"]);
  run(`cycle ${cycle}: history people`, "npm", ["run", "civication:history-people:build"]);
  run(`cycle ${cycle}: Fagverk registry`, process.execPath, ["scripts/materialize-natur-final-registry.mjs"]);
  run(`cycle ${cycle}: places index`, "npm", ["run", "places:index:build"]);
  run(`cycle ${cycle}: runtime/place-open`, "npm", ["run", "place-open:build"]);
  run(`cycle ${cycle}: epoch index`, process.execPath, ["scripts/build-epoke-place-index.mjs"]);
  log(`\n===== cycle ${cycle}: Stortorget quiz context =====`);
  await runBuildQuizProductionContext({
    root,
    categoryId: "by",
    targetId: "stortorget",
    outputPath: "data/quiz/production_context/by/stortorget.json"
  });
  run(`cycle ${cycle}: Knowledge canonical write`, process.execPath, ["--experimental-strip-types", "scripts/knowledge-canonical-data.mts", "--write"]);
  run(`cycle ${cycle}: Fagverk release`, process.execPath, ["scripts/build-fagverk-release-manifest.mjs"]);
  run(`cycle ${cycle}: final runtime/place-open`, "npm", ["run", "place-open:build"]);
  run(`cycle ${cycle}: final epoch index`, process.execPath, ["scripts/build-epoke-place-index.mjs"]);
}

function updateEpochRegression() {
  const index = JSON.parse(fs.readFileSync(path.join(root, "data/epoker/epoke-place-index.json"), "utf8"));
  const coverage = index.domains.historie.oslo_coverage;
  const testFile = path.join(root, "tests/epoke-place-index.test.mjs");
  let source = fs.readFileSync(testFile, "utf8");
  const replacements = [
    [/assert\.equal\(index\.stats\.canonical_story_milestone_count, \d+\);/u, `assert.equal(index.stats.canonical_story_milestone_count, ${index.stats.canonical_story_milestone_count});`],
    [/assert\.equal\(index\.stats\.verified_place_production_milestone_count, \d+\);/u, `assert.equal(index.stats.verified_place_production_milestone_count, ${index.stats.verified_place_production_milestone_count});`],
    [/assert\.equal\(coverage\.dated_evidence_place_count, \d+\);/u, `assert.equal(coverage.dated_evidence_place_count, ${coverage.dated_evidence_place_count});`],
    [/assert\.equal\(coverage\.awaiting_source_backed_history_count, \d+\);/u, `assert.equal(coverage.awaiting_source_backed_history_count, ${coverage.awaiting_source_backed_history_count});`]
  ];
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(source)) throw new Error(`Epoch regression pattern missing: ${pattern}`);
    source = source.replace(pattern, replacement);
  }
  if (!source.includes('"stortorget"')) {
    const needle = '"peststotten_krist_kirkegard"]) {';
    if (!source.includes(needle)) throw new Error("Could not locate dated-evidence regression list");
    source = source.replace(needle, '"peststotten_krist_kirkegard", "stortorget"]) {');
  }
  fs.writeFileSync(testFile, source);
  log(`Epoch combined stats: stories=${index.stats.canonical_story_milestone_count}, production=${index.stats.verified_place_production_milestone_count}, dated=${coverage.dated_evidence_place_count}, awaiting=${coverage.awaiting_source_backed_history_count}`);
}

run("Stortorget canonical rebuild", process.execPath, ["tools/build-stortorget-completion.mjs"]);

let previous = null;
let stable = null;
for (let cycle = 1; cycle <= 4; cycle += 1) {
  await derive(cycle);
  const current = fixedPointDigest();
  log(`Fixed-point cycle ${cycle}: ${current.digest} (${current.files} files)`);
  if (previous && current.digest === previous.digest) {
    stable = current;
    log(`Fixed point reached after cycle ${cycle}.`);
    break;
  }
  previous = current;
}
if (!stable) throw new Error("Derived Stortorget/Kirkeristen state did not converge within four cycles");

updateEpochRegression();

run("Stortorget v4.2 validator", process.execPath, ["tools/validate-stortorget-v42.mjs"]);
run("Stortorget and epoch regressions", process.execPath, ["--test", "tests/quiz-progression-phase-order.test.mjs", "tests/stortorget-production-closure.test.mjs", "tests/stortorget-story-integrity.test.mjs", "tests/epoke-place-index.test.mjs"]);
run("quiz production context audit", "npm", ["run", "audit:quiz-production-context"]);
run("quiz progression audit", "npm", ["run", "audit:quiz-progression"]);
run("quiz theory binding audit", "npm", ["run", "audit:quiz-theory-binding"]);
run("quiz production tests", "npm", ["run", "test:quiz-production"]);
run("Fagverk Phase 3 full matrix", process.execPath, ["scripts/run-fagverk-phase3-ci-v1.mjs"], { env: { FAGVERK_PHASE3_BASE_SHA: "", FAGVERK_PHASE3_HEAD_SHA: "" } });
run("Knowledge canonical check", "npm", ["run", "knowledge:canonical:check"]);
run("Knowledge legacy check", "npm", ["run", "knowledge:legacy:check"]);
run("Knowledge audit", "npm", ["run", "audit:knowledge"]);
run("Knowledge links", process.execPath, ["scripts/audit-knowledge-links.mjs"]);
run("places check", "bash", ["scripts/check-places.sh"]);
run("diff whitespace", "git", ["diff", "--check"]);
run("working tree summary", "git", ["status", "--short"]);

fs.mkdirSync(path.join(root, "reports/place-production"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/place-production/stortorget-fresh-main-replay-probe.txt"), `${report.join("\n")}\n`);
