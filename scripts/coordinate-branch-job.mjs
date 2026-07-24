// Retry 2: fixed updated_emner builder typo.
import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const resolve = (...parts) => path.resolve(root, ...parts);

function run(command, args, label) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function validateDomain() {
  console.log("\n=== Validate History phase 3 domain ===");
  const result = spawnSync(
    "node",
    ["tools/validate-historie-makt-stat-institusjoner.mjs"],
    { cwd: root, encoding: "utf8", env: process.env }
  );
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  process.stdout.write(output);
  fs.mkdirSync(resolve("reports/historie-canonical-migration"), { recursive: true });
  fs.writeFileSync(
    resolve("reports/historie-canonical-migration/makt-stat-institusjoner-vertical-chain-validation.txt"),
    output,
    "utf8"
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`History phase 3 validator failed with exit code ${result.status}`);
  }
}

function replaceExactly(text, oldValue, newValue, expectedCount) {
  const count = text.split(oldValue).length - 1;
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} occurrences of ${oldValue}, found ${count}`);
  }
  return text.split(oldValue).join(newValue);
}

function removeIfExists(relativePath) {
  const target = resolve(relativePath);
  if (fs.existsSync(target)) fs.rmSync(target, { force: true, recursive: true });
}

const encodedBuilderPath = resolve("tools/.build-historie-makt-phase3.py.gz.b64");
const builderPath = resolve("tools/build-historie-makt-phase3.py");
const encodedBuilder = fs.readFileSync(encodedBuilderPath, "utf8").trim();
fs.writeFileSync(builderPath, gunzipSync(Buffer.from(encodedBuilder, "base64")));

run("python3", ["-m", "py_compile", "tools/build-historie-makt-phase3.py"], "Compile phase 3 builder");
run("python3", ["tools/build-historie-makt-phase3.py"], "Build phase 3 canonical package");

const testPath = resolve("tests/quiz-production-pipeline.test.mjs");
let testText = fs.readFileSync(testPath, "utf8");
testText = replaceExactly(
  testText,
  "assert.equal(context.considered_curriculum.counts.emner, 53);",
  "assert.equal(context.considered_curriculum.counts.emner, 57);",
  4
);
testText = replaceExactly(
  testText,
  "assert.equal(context.considered_curriculum.counts.topic_hooks, 31);",
  "assert.equal(context.considered_curriculum.counts.topic_hooks, 39);",
  4
);
testText = replaceExactly(
  testText,
  "assert.equal(context.considered_curriculum.counts.methods, 23);",
  "assert.equal(context.considered_curriculum.counts.methods, 28);",
  4
);
fs.writeFileSync(testPath, testText, "utf8");
console.log("Updated four History production test blocks.");

run("node", ["--check", "tools/validate-historie-makt-stat-institusjoner.mjs"], "Syntax-check permanent validator");

const jsonPaths = [
  "data/fag/historie/fagkart_historie_canonical_v4_5.json",
  "data/fag/historie/historiepensum_canonical_v4_5.json",
  "data/fag/historie/emner_historie_canonical_v4_5.json",
  "data/fag/historie/emnemapping_historie_canonical_v4_5.json",
  "data/fag/historie/methods_historie_canonical_v4_5.json",
  "data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json",
  "reports/historie-canonical-migration/makt-stat-institusjoner-question-blueprints.json",
];
for (const jsonPath of jsonPaths) {
  JSON.parse(fs.readFileSync(resolve(jsonPath), "utf8"));
}
console.log(`JSON OK | ${jsonPaths.length} files`);
validateDomain();

run("npm", ["run", "knowledge:canonical:write"], "Regenerate canonical Knowledge data");

const manifest = JSON.parse(fs.readFileSync(resolve("data/fag/fag_manifest.json"), "utf8"));
const targets = manifest.historie?.quizProduction?.targets || {};
for (const [targetId, config] of Object.entries(targets)) {
  const outputPath = path.resolve(root, "data/fag", config.context_artifact);
  await runBuildQuizProductionContext({
    root,
    categoryId: "historie",
    targetId,
    outputPath,
  });
  console.log(`Rebuilt ${targetId}: ${path.relative(root, outputPath)}`);
}

validateDomain();
run("npm", ["run", "knowledge:canonical:check"], "Check canonical Knowledge data");
run("npm", ["run", "knowledge:legacy:check"], "Check legacy Knowledge compatibility");
run("npm", ["run", "audit:knowledge"], "Audit Knowledge contract");
run("npm", ["run", "test:quiz-content-audit"], "Test quiz content audit");
run("npm", ["run", "test:quiz-production"], "Test quiz production");
run("npm", ["run", "audit:quiz-production-context"], "Audit quiz production contexts");
run("npm", ["run", "audit:quiz-progression"], "Audit quiz progression");
run("npm", ["run", "audit:quiz-theory-binding"], "Audit quiz theory binding");
run("git", ["diff", "--check"], "Check diff whitespace");

removeIfExists(".github/workflows/history-phase3-build.yml");
removeIfExists("tools/.build-historie-makt-phase3.py.gz.b64");
removeIfExists("tools/build-historie-makt-phase3.py");
removeIfExists("reports/historie-canonical-migration/makt-stat-phase3-research.json");
removeIfExists("reports/historie-canonical-migration/makt-stat-phase3-build-diagnostic.md");

console.log("History phase 3 package built, validated and cleaned.");
