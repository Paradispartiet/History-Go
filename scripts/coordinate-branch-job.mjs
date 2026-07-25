import fs from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

function reconstruct(label, files, expectedLength, expectedHash, target) {
  const encoded = files.map((file) => fs.readFileSync(file, "utf8").trim()).join("");
  if (encoded.length !== expectedLength) throw new Error(`${label} transport length mismatch: ${encoded.length}`);
  const source = gunzipSync(Buffer.from(encoded, "base64"));
  const hash = createHash("sha256").update(source).digest("hex");
  if (hash !== expectedHash) throw new Error(`${label} SHA mismatch: ${hash}`);
  fs.writeFileSync(target, source);
}

const specFiles = [
  "scripts/history-phase6-spec.part1.b64",
  "scripts/history-phase6-spec.part2.b64",
  "scripts/history-phase6-spec.part3.b64"
];
const builderFiles = [
  "scripts/history-phase6-builder.part1.b64",
  "scripts/history-phase6-builder.part2.b64",
  "scripts/history-phase6-builder.part3.b64"
];
const validatorFiles = ["scripts/history-phase6-validator.b64"];

reconstruct("History phase 6 spec", specFiles, 10692, "171b8b402431c72008c4171aa2215c8bcf4e6965ba63745ffc6dae7c9a9eb27a", "/tmp/history-phase6-spec.json");
reconstruct("History phase 6 builder", builderFiles, 8596, "9447ddd8e9e86750642391a15baad608b339a6e3825bf4464b7f2b4f8fe14f23", "/tmp/history-phase6-builder.mjs");
reconstruct("History phase 6 validator", validatorFiles, 2576, "12cac84e4735eeaa0873587cd0c376e841c5784ccc37953c6bd3c7a43f21ebfa", "tools/validate-historie-byhistorie.mjs");

await import(pathToFileURL("/tmp/history-phase6-builder.mjs").href);

fs.mkdirSync("reports/historie-canonical-migration", { recursive: true });
function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit" });
}

let validation = run("node", ["tools/validate-historie-byhistorie.mjs"], { capture: true });
fs.writeFileSync("reports/historie-canonical-migration/byhistorie-vertical-chain-validation.txt", validation);

run("npm", ["run", "knowledge:canonical:write"]);

for (const target of ["grindheim_runestein", "grindheim_steinkross", "grindheimsveien_nord_gravfelt", "hoyland_gravhaug_etne"]) {
  run("node", [
    "scripts/build-quiz-production-context.mjs",
    "--category", "historie",
    "--target", target,
    "--output", `data/quiz/production_context/historie/${target}.json`
  ]);
}

validation = run("node", ["tools/validate-historie-byhistorie.mjs"], { capture: true });
fs.writeFileSync("reports/historie-canonical-migration/byhistorie-vertical-chain-validation.txt", validation);
run("npm", ["run", "test:quiz-production"]);
run("git", ["diff", "--check"]);

for (const file of [...specFiles, ...builderFiles, ...validatorFiles]) {
  fs.rmSync(file, { force: true });
}
fs.rmSync("/tmp/history-phase6-spec.json", { force: true });
fs.rmSync("/tmp/history-phase6-builder.mjs", { force: true });
fs.rmSync("scripts/coordinate-branch-job.mjs", { force: true });

console.log("History phase 6 materialised and validated.");
