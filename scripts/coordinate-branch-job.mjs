import fs from "node:fs";
import { execFileSync } from "node:child_process";

function run(command, args, capture = false) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });
}

run("npm", ["run", "knowledge:canonical:write"]);

const contexts = [
  ["by", "deichman_bjorvika"],
  ["naeringsliv", "telegrafbygningen"],
  ["naeringsliv", "oslo_posthus"],
  ["naeringsliv", "havnelageret"],
  ["historie", "grindheim_runestein"],
  ["historie", "grindheim_steinkross"],
  ["historie", "grindheimsveien_nord_gravfelt"],
  ["historie", "hoyland_gravhaug_etne"]
];

for (const [category, target] of contexts) {
  run("node", [
    "scripts/build-quiz-production-context.mjs",
    "--category", category,
    "--target", target,
    "--output", `data/quiz/production_context/${category}/${target}.json`
  ]);
}

const validation = run("node", ["tools/validate-historie-migrasjon.mjs"], true);
fs.mkdirSync("reports/historie-canonical-migration", { recursive: true });
fs.writeFileSync(
  "reports/historie-canonical-migration/migrasjon-vertical-chain-validation.txt",
  validation
);

run("npm", ["run", "test:quiz-production"]);
run("npm", ["run", "knowledge:canonical:check"]);
run("npm", ["run", "knowledge:legacy:check"]);
run("git", ["diff", "--check"]);

fs.rmSync("scripts/coordinate-branch-job.mjs", { force: true });
run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["add",
  "data/knowledge/concepts.generated.json",
  "data/knowledge/knowledge_emne_review_queue.generated.json",
  "data/knowledge/knowledge_units.generated.json",
  "data/quiz/historie/nedre_foss_sets.json",
  "data/quiz/production_context/by/deichman_bjorvika.json",
  "data/quiz/production_context/naeringsliv/telegrafbygningen.json",
  "data/quiz/production_context/naeringsliv/oslo_posthus.json",
  "data/quiz/production_context/naeringsliv/havnelageret.json",
  "data/quiz/production_context/historie/grindheim_runestein.json",
  "data/quiz/production_context/historie/grindheim_steinkross.json",
  "data/quiz/production_context/historie/grindheimsveien_nord_gravfelt.json",
  "data/quiz/production_context/historie/hoyland_gravhaug_etne.json",
  "reports/historie-canonical-migration/migrasjon-vertical-chain-validation.txt",
  "reports/knowledge-contract-audit.json",
  "reports/knowledge-id-backfill.json"
]);
run("git", ["add", "-A", "scripts/coordinate-branch-job.mjs"]);
run("git", ["commit", "-m", "Apply History phase 7 generated outputs"]);
run("git", ["push", "origin", `HEAD:${process.env.GITHUB_REF_NAME}`]);

console.log("History phase 7 and global quiz contexts rebuilt, validated and published.");
