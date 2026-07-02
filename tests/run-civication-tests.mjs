// tests/run-civication-tests.mjs
// Kjører ALLE tests/civication-*.test.js (glob, ikke håndvedlikeholdt liste) og
// rapporterer samtlige feil før den exiter. Erstatter den gamle &&-kjeden i
// package.json som stoppet ved første feil og lot 61 testfiler stå uregistrert.
//
// Bruk:
//   node tests/run-civication-tests.mjs             # alle
//   node tests/run-civication-tests.mjs phase-bundle # filtrer på delstreng(er)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const filters = process.argv.slice(2).filter((a) => !a.startsWith("-"));

const files = fs.readdirSync(TESTS_DIR)
  .filter((f) => /^civication-.*\.test\.js$/.test(f))
  .filter((f) => !filters.length || filters.some((q) => f.includes(q)))
  .sort();

if (!files.length) {
  console.error("Ingen testfiler matchet tests/civication-*.test.js" + (filters.length ? ` med filter: ${filters.join(", ")}` : ""));
  process.exit(1);
}

const failures = [];
const started = Date.now();

for (const file of files) {
  const abs = path.join(TESTS_DIR, file);
  try {
    execFileSync(process.execPath, [abs], { stdio: "pipe", timeout: 120000 });
    process.stdout.write(`✓ ${file}\n`);
  } catch (err) {
    failures.push({ file, err });
    process.stdout.write(`✗ ${file}\n`);
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\n${files.length - failures.length}/${files.length} testfiler OK (${seconds}s)`);

if (failures.length) {
  console.error(`\n${failures.length} feilet:`);
  for (const { file, err } of failures) {
    console.error(`\n=== ${file} ===`);
    const out = `${err.stdout || ""}${err.stderr || ""}`.trim();
    console.error(out.split("\n").slice(-25).join("\n"));
  }
  process.exit(1);
}
