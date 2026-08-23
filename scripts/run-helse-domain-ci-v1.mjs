import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const registryPath = ".github/ci/fagverk-helse-domain-registry-v1.json";
const fagverkRegistryPath = "data/fagverk/fagverk_registry.json";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function requireFile(path, reason) {
  if (!path || !existsSync(path)) {
    throw new Error(`${reason}: missing ${String(path)}`);
  }
}

function run(command, args, label) {
  process.stdout.write(`\n=== ${label} ===\n${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function runNode(args, label) {
  run(process.execPath, args, label);
}

const registry = readJson(registryPath);
const domains = [...registry.domains].sort((a, b) => a.ordinal - b.ordinal);

if (registry.version !== 1 || registry.subject !== "helse") {
  throw new Error("Unsupported Helse CI registry contract");
}
if (domains.length !== registry.totalDomains) {
  throw new Error(
    `Helse CI registry expected ${registry.totalDomains} domains, found ${domains.length}`,
  );
}
for (let index = 0; index < domains.length; index += 1) {
  const domain = domains[index];
  if (domain.ordinal !== index + 1) {
    throw new Error(`Helse CI domain ordinals must be contiguous at ${index + 1}`);
  }
}

const fagverkRegistry = readJson(fagverkRegistryPath);
const count = Number(
  fagverkRegistry?.subjects?.helse?.editorialPlan?.registeredChapterCount,
);
if (!Number.isInteger(count) || count < 0 || count > registry.totalDomains) {
  throw new Error(`Invalid Helse registeredChapterCount: ${String(count)}`);
}

process.stdout.write(
  `Helse generic CI: ${count}/${registry.totalDomains} registered domains\n`,
);

// Materialized domains must retain their permanent fulltext contracts. Older
// phase tests are retained as evidence but are not replayed at a later chapter
// count: several encode the exact historical N/12 checkpoint. Cross-domain
// monotonicity is owned by the cumulative audit below.
for (const domain of domains.filter((entry) => entry.ordinal <= count)) {
  requireFile(domain.fulltextMaterializer, `Helse ${domain.slug} fulltext contract`);
  requireFile(domain.fulltextAudit, `Helse ${domain.slug} fulltext audit contract`);
  requireFile(domain.fulltextTest, `Helse ${domain.slug} fulltext test contract`);
}

// Source-first stays mandatory for the NEXT not-yet-materialized domain. This
// is where the source brief is a production prerequisite rather than a frozen
// historical checkpoint.
const nextDomain = domains.find((entry) => entry.ordinal === count + 1);
if (nextDomain) {
  requireFile(nextDomain.sourceBriefScript, `Helse ${nextDomain.slug} source contract`);
  requireFile(nextDomain.sourceBriefTest, `Helse ${nextDomain.slug} source test contract`);
  runNode(
    [nextDomain.sourceBriefScript],
    `Helse ${nextDomain.slug} source-first brief`,
  );
}

// Re-materialize and audit only the latest registered domain. This matches the
// monotone behavior of the previous per-domain workflows: historical domain
// checkpoints fall back to cumulative validation after later domains exist.
const latestDomain = domains.find((entry) => entry.ordinal === count);
if (latestDomain) {
  requireFile(
    latestDomain.fulltextMaterializer,
    `Helse ${latestDomain.slug} latest fulltext contract`,
  );
  requireFile(
    latestDomain.fulltextAudit,
    `Helse ${latestDomain.slug} latest fulltext audit`,
  );
  requireFile(
    latestDomain.fulltextTest,
    `Helse ${latestDomain.slug} latest fulltext test`,
  );
  runNode(
    [latestDomain.fulltextMaterializer],
    `Helse ${latestDomain.slug} deterministic fulltext materialization`,
  );
  runNode(
    [latestDomain.fulltextAudit],
    `Helse ${latestDomain.slug} fulltext audit`,
  );
}

const sharedAudits = [
  ["scripts/audit-helse-cumulative-progress-v1.mjs", []],
  ["scripts/audit-fagverk-subject-inventory.mjs", []],
  ["scripts/audit-fagverk-general-engine.mjs", []],
  ["scripts/audit-fagverk-theory-quality.mjs", []],
  ["scripts/audit-fagverk-theory-integrity.mjs", []],
  ["scripts/build-fagverk-release-manifest.mjs", ["--check"]],
];

for (const [script, args] of sharedAudits) {
  requireFile(script, "Shared Fagverk/Helse audit contract");
  runNode([script, ...args], script);
}

const tests = [];
if (nextDomain) {
  tests.push(nextDomain.sourceBriefTest);
}
if (latestDomain) {
  tests.push(latestDomain.fulltextTest);
}
for (const test of [
  "tests/helse-cumulative-progress-v1.test.mjs",
  "tests/fagverk-subject-inventory.test.mjs",
  "tests/fagverk-general-engine.test.mjs",
  "tests/fagverk-release-manifest.test.mjs",
]) {
  requireFile(test, "Shared Fagverk/Helse test contract");
  tests.push(test);
}

runNode(
  ["--test", ...tests],
  `Helse active/cumulative suite (${tests.length} files)`,
);

// Active materializers/audits are deterministic. Any generated drift left in
// the working tree means the committed branch is not the canonical output.
run(
  "git",
  [
    "diff",
    "--exit-code",
    "--",
    "data/fag/fag_manifest.json",
    "data/fag/helse",
    "data/fagverk/helse",
    "data/fagverk/fagverk_registry.json",
    "data/fagverk/subject_inventory.json",
    "data/fagverk/subject_status.json",
    "data/fagverk/fagverk_release.json",
    "reports/fagverk",
  ],
  "Verify deterministic Helse/Fagverk outputs",
);

process.stdout.write("\nHelse registry-driven CI passed.\n");
