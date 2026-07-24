import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const resolve = (...parts) => path.resolve(root, ...parts);

function run(command, args, label) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function validateDomain() {
  console.log("\n=== Validate History phase 4 domain ===");
  const result = spawnSync("node", ["tools/validate-historie-industri-arbeid.mjs"], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  process.stdout.write(output);
  fs.mkdirSync(resolve("reports/historie-canonical-migration"), { recursive: true });
  fs.writeFileSync(
    resolve("reports/historie-canonical-migration/industri-arbeid-vertical-chain-validation.txt"),
    output,
    "utf8"
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`History phase 4 validator failed with exit code ${result.status}`);
}

function replaceExactly(text, oldValue, newValue, expectedCount) {
  const count = text.split(oldValue).length - 1;
  if (count !== expectedCount) throw new Error(`Expected ${expectedCount} occurrences of ${oldValue}, found ${count}`);
  return text.split(oldValue).join(newValue);
}

function removeIfExists(relativePath) {
  const target = resolve(relativePath);
  if (fs.existsSync(target)) fs.rmSync(target, { force: true, recursive: true });
}

const parts = Array.from({ length: 7 }, (_, index) =>
  `tools/.build-historie-industri-phase4.part${String(index + 1).padStart(2, "0")}`
);
const encoded = parts.map((part) => fs.readFileSync(resolve(part), "utf8").trim()).join("");
const expectedLength = 20800;
const expectedBase64Sha = "4118f3d530deb65ba9b4f1654e09d6a399793f9ddee7dabc674d39f5f2bfbbcb";
const actualBase64Sha = createHash("sha256").update(encoded).digest("hex");
if (encoded.length !== expectedLength) throw new Error(`Builder base64 length mismatch: ${encoded.length} != ${expectedLength}`);
if (actualBase64Sha !== expectedBase64Sha) throw new Error(`Builder base64 SHA-256 mismatch: ${actualBase64Sha}`);
console.log(`Builder transport verified: ${encoded.length} chars, ${actualBase64Sha}`);

const gzipBytes = Buffer.from(encoded, "base64");
const gzipSha = createHash("sha256").update(gzipBytes).digest("hex");
if (gzipSha !== "d844e1c6bc30b5850600bf5a997aed39ef602b7e2afab0e7633e3c7e7f4e30d3") {
  throw new Error(`Builder gzip SHA-256 mismatch: ${gzipSha}`);
}
const source = gunzipSync(gzipBytes);
const sourceSha = createHash("sha256").update(source).digest("hex");
if (sourceSha !== "3b2b94fa34698192e29a3cf4e98e3fc316cff8c87095da437c51215c0cede333") {
  throw new Error(`Builder source SHA-256 mismatch: ${sourceSha}`);
}
const builderPath = resolve("tools/build-historie-industri-phase4.py");
fs.writeFileSync(builderPath, source);

run("python3", ["-m", "py_compile", "tools/build-historie-industri-phase4.py"], "Compile phase 4 builder");
run("python3", ["tools/build-historie-industri-phase4.py"], "Build phase 4 canonical package");

const testPath = resolve("tests/quiz-production-pipeline.test.mjs");
let testText = fs.readFileSync(testPath, "utf8");
testText = replaceExactly(testText,
  "assert.equal(context.considered_curriculum.counts.emner, 57);",
  "assert.equal(context.considered_curriculum.counts.emner, 64);", 4);
testText = replaceExactly(testText,
  "assert.equal(context.considered_curriculum.counts.topic_hooks, 39);",
  "assert.equal(context.considered_curriculum.counts.topic_hooks, 48);", 4);
testText = replaceExactly(testText,
  "assert.equal(context.considered_curriculum.counts.methods, 28);",
  "assert.equal(context.considered_curriculum.counts.methods, 33);", 4);
fs.writeFileSync(testPath, testText, "utf8");
console.log("Updated four History production test blocks.");

run("node", ["--check", "tools/validate-historie-industri-arbeid.mjs"], "Syntax-check permanent validator");
const jsonPaths = [
  "data/fag/historie/fagkart_historie_canonical_v4_5.json",
  "data/fag/historie/historiepensum_canonical_v4_5.json",
  "data/fag/historie/emner_historie_canonical_v4_5.json",
  "data/fag/historie/emnemapping_historie_canonical_v4_5.json",
  "data/fag/historie/methods_historie_canonical_v4_5.json",
  "data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json",
  "reports/historie-canonical-migration/industri-arbeid-question-blueprints.json",
];
for (const jsonPath of jsonPaths) JSON.parse(fs.readFileSync(resolve(jsonPath), "utf8"));
console.log(`JSON OK | ${jsonPaths.length} files`);
validateDomain();

run("npm", ["run", "knowledge:canonical:write"], "Regenerate canonical Knowledge data");
const manifest = JSON.parse(fs.readFileSync(resolve("data/fag/fag_manifest.json"), "utf8"));
const targets = manifest.historie?.quizProduction?.targets || {};
for (const [targetId, config] of Object.entries(targets)) {
  const outputPath = path.resolve(root, "data/fag", config.context_artifact);
  await runBuildQuizProductionContext({ root, categoryId: "historie", targetId, outputPath });
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

for (const part of parts) removeIfExists(part);
removeIfExists("tools/build-historie-industri-phase4.py");
console.log("History phase 4 package built, validated and cleaned.");
