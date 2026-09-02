#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REGISTRY_PATHS = Object.freeze({
  helse: ".github/ci/fagverk-helse-domain-registry-v1.json",
  utdanning: ".github/ci/fagverk-utdanning-domain-registry-v1.json",
  sosiologi_antropologi: ".github/ci/fagverk-sosiologi-antropologi-domain-registry-v1.json",
  geografi: ".github/ci/fagverk-geografi-domain-registry-v1.json",
  sprak_lingvistikk: ".github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json",
  juss_rettsvitenskap: ".github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json",
  fysikk: ".github/ci/fagverk-fysikk-domain-registry-v1.json",
});
const SHARED_CHANGE_PATHS = new Set([
  "data/fagverk/subject_inventory.json",
  "scripts/audit-fagverk-theory-quality.mjs",
  "scripts/audit-fagverk-theory-integrity.mjs",
  "tests/fagverk-release-manifest.test.mjs",
  "scripts/run-fagverk-domain-ci-v1.mjs",
  "tests/fagverk-domain-ci-registry.test.mjs",
  ".github/workflows/fagverk-domain-registry.yml",
]);
const SHARED_AUDITS = Object.freeze([
  ["scripts/audit-fagverk-subject-inventory.mjs", []],
  ["scripts/audit-fagverk-general-engine.mjs", []],
  ["scripts/audit-fagverk-theory-quality.mjs", []],
  ["scripts/audit-fagverk-theory-integrity.mjs", []],
  ["scripts/build-fagverk-release-manifest.mjs", ["--check"]],
]);
const SHARED_TESTS = Object.freeze([
  "tests/fagverk-domain-ci-registry.test.mjs",
  "tests/fagverk-subject-inventory.test.mjs",
  "tests/fagverk-general-engine.test.mjs",
  "tests/fagverk-release-manifest.test.mjs",
]);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.resolve(root, relativePath), "utf8"));
}

function requireFile(root, relativePath, reason) {
  if (!relativePath || !existsSync(path.resolve(root, relativePath))) {
    throw new Error(`${reason}: missing ${String(relativePath)}`);
  }
}

function pointerValue(document, pointer) {
  return pointer.reduce((value, key) => value?.[key], document);
}

export function loadRegistries(root = process.cwd()) {
  return Object.fromEntries(Object.entries(REGISTRY_PATHS).map(([subject, registryPath]) => [
    subject,
    { ...readJson(root, registryPath), registryPath },
  ]));
}

export function inspectProgress(registry, root = process.cwd()) {
  const progress = registry.ci?.progress;
  if (progress?.kind === "registered_chapter_count") {
    const source = readJson(root, progress.source);
    const count = Number(pointerValue(source, progress.pointer || []));
    if (!Number.isInteger(count) || count < 0 || count > registry.totalDomains) {
      throw new Error(`${registry.subject}: invalid registered chapter count ${String(count)}`);
    }
    return { count, source: progress.source };
  }

  if (progress?.kind === "canonical_pensum_status") {
    const pensum = readJson(root, progress.source);
    const domains = [...registry.domains].sort((a, b) => a.ordinal - b.ordinal);
    if (pensum.subject_id !== registry.subject
      || pensum.domain_order?.length !== registry.totalDomains
      || pensum.domains?.length !== registry.totalDomains) {
      throw new Error(`${registry.subject}: canonical pensum domain contract is inconsistent`);
    }
    const pensumById = new Map(pensum.domains.map((row) => [row.domain_id, row]));
    for (const domain of domains) {
      if (pensum.domain_order[domain.ordinal - 1] !== domain.domainId || !pensumById.has(domain.domainId)) {
        throw new Error(`${registry.subject}: CI registry order differs from canonical pensum at ${domain.ordinal}`);
      }
    }
    const count = domains.filter((domain) => pensumById.get(domain.domainId)?.status === "materialized").length;
    for (let ordinal = 1; ordinal <= domains.length; ordinal += 1) {
      const status = pensumById.get(domains[ordinal - 1].domainId)?.status;
      const expected = ordinal <= count ? "materialized" : "planned";
      if (status !== expected) {
        throw new Error(`${registry.subject}: domain ${ordinal} must be ${expected}, found ${String(status)}`);
      }
    }
    return { count, source: progress.source };
  }

  throw new Error(`${registry.subject}: unsupported progress contract ${String(progress?.kind)}`);
}

export function validateRegistry(registry, root = process.cwd()) {
  if (registry.version !== 1 || !REGISTRY_PATHS[registry.subject]) {
    throw new Error(`Unsupported Fagverk domain registry: ${String(registry.subject)}`);
  }
  const domains = [...registry.domains].sort((a, b) => a.ordinal - b.ordinal);
  if (domains.length !== registry.totalDomains) {
    throw new Error(`${registry.subject}: expected ${registry.totalDomains} domains, found ${domains.length}`);
  }
  const slugs = new Set();
  for (let index = 0; index < domains.length; index += 1) {
    const domain = domains[index];
    if (domain.ordinal !== index + 1) {
      throw new Error(`${registry.subject}: domain ordinals must be contiguous at ${index + 1}`);
    }
    if (!domain.slug || slugs.has(domain.slug)) {
      throw new Error(`${registry.subject}: missing or duplicate domain slug at ${index + 1}`);
    }
    slugs.add(domain.slug);
  }
  const progress = inspectProgress(registry, root);
  return { domains, ...progress };
}

export function selectSubjects({ registries, changedFiles = null, requested = [] }) {
  if (requested.length) {
    for (const subject of requested) {
      if (!registries[subject]) throw new Error(`Unknown Fagverk domain subject: ${subject}`);
    }
    return [...new Set(requested)];
  }
  if (!changedFiles) return Object.keys(registries);
  if (changedFiles.some((file) => SHARED_CHANGE_PATHS.has(file))) return Object.keys(registries);
  return Object.entries(registries)
    .filter(([, registry]) => changedFiles.some((file) =>
      (registry.ci?.changeTokens || []).some((token) => file.includes(token))))
    .map(([subject]) => subject);
}

function run(command, args, label, root) {
  process.stdout.write(`\n=== ${label} ===\n${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function runNode(args, label, root) {
  run(process.execPath, args, label, root);
}

function runStrictCompletion(registry, root, tests) {
  const strict = registry.strictCompletion || {};
  for (const [field, label] of [
    ["bindings", "bindings"],
    ["auditReport", "audit report"],
    ["completionReport", "completion report"],
    ["audit", "audit"],
    ["materializer", "materializer"],
    ["auditTest", "audit test"],
    ["completionTest", "completion test"],
  ]) requireFile(root, strict[field], `${registry.subject} strict completion ${label}`);
  runNode([strict.audit], `${registry.subject} strict theory-integrity audit`, root);
  runNode([strict.materializer], `${registry.subject} strict completion materialization`, root);
  tests.push(strict.auditTest, strict.completionTest);
}

function prepareSubject(registry, root, collectedTests) {
  const { domains, count } = validateRegistry(registry, root);
  process.stdout.write(`\n${registry.subject}: ${count}/${registry.totalDomains} materialized domains\n`);

  for (const domain of domains.filter((entry) => entry.ordinal <= count)) {
    requireFile(root, domain.fulltextMaterializer, `${registry.subject} ${domain.slug} materializer`);
    requireFile(root, domain.fulltextAudit, `${registry.subject} ${domain.slug} audit`);
    requireFile(root, domain.fulltextTest, `${registry.subject} ${domain.slug} test`);
  }

  const nextDomain = domains.find((entry) => entry.ordinal === count + 1);
  if (nextDomain) {
    if (nextDomain.sourceBrief) requireFile(root, nextDomain.sourceBrief, `${registry.subject} ${nextDomain.slug} source brief`);
    requireFile(root, nextDomain.sourceBriefScript, `${registry.subject} ${nextDomain.slug} source script`);
    requireFile(root, nextDomain.sourceBriefTest, `${registry.subject} ${nextDomain.slug} source test`);
    runNode([nextDomain.sourceBriefScript], `${registry.subject} ${nextDomain.slug} source-first brief`, root);
    collectedTests.push(nextDomain.sourceBriefTest);
  }

  const latestDomain = domains.find((entry) => entry.ordinal === count);
  if (latestDomain) {
    runNode([latestDomain.fulltextMaterializer], `${registry.subject} ${latestDomain.slug} deterministic materialization`, root);
    if (count === registry.totalDomains && registry.strictCompletion?.runBeforeLatestAudit) {
      runStrictCompletion(registry, root, collectedTests);
    }
    runNode([latestDomain.fulltextAudit], `${registry.subject} ${latestDomain.slug} fulltext audit`, root);
    collectedTests.push(latestDomain.fulltextTest);
    if (count === registry.totalDomains && !registry.strictCompletion?.runBeforeLatestAudit) {
      runStrictCompletion(registry, root, collectedTests);
    }
  }

  for (const script of registry.ci?.cumulativeAudits || []) {
    requireFile(root, script, `${registry.subject} cumulative audit`);
    runNode([script], script, root);
  }
  for (const test of registry.ci?.cumulativeTests || []) {
    requireFile(root, test, `${registry.subject} cumulative test`);
    collectedTests.push(test);
  }
}

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    base: process.env.FAGVERK_BASE_SHA || "",
    head: process.env.FAGVERK_HEAD_SHA || "",
    subjects: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--root") args.root = path.resolve(argv[++index] || args.root);
    else if (token === "--base") args.base = argv[++index] || "";
    else if (token === "--head") args.head = argv[++index] || "";
    else if (token === "--subject") args.subjects.push(argv[++index] || "");
    else if (token === "--all") args.all = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function changedFiles(root, base, head) {
  if (!base || !head) return null;
  const result = spawnSync("git", ["diff", "--name-only", base, head], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "git diff failed");
  return result.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const registries = loadRegistries(args.root);
  const changed = args.all ? null : changedFiles(args.root, args.base, args.head);
  const selected = selectSubjects({ registries, changedFiles: changed, requested: args.subjects.filter(Boolean) });
  if (!selected.length) throw new Error("No Fagverk domain registry matched the changed files");
  process.stdout.write(`Fagverk domain registry selection: ${selected.join(", ")}\n`);

  const tests = [...SHARED_TESTS];
  for (const subject of selected) prepareSubject(registries[subject], args.root, tests);
  for (const [script, scriptArgs] of SHARED_AUDITS) {
    requireFile(args.root, script, "Shared Fagverk audit");
    runNode([script, ...scriptArgs], script, args.root);
  }
  const uniqueTests = [...new Set(tests)];
  for (const test of uniqueTests) requireFile(args.root, test, "Fagverk domain/shared test");
  runNode(["--test", ...uniqueTests], `Fagverk domain/shared suite (${uniqueTests.length} files)`, args.root);

  const deterministicPaths = [...new Set(selected.flatMap((subject) =>
    registries[subject].ci?.deterministicPaths || []))];
  run("git", ["diff", "--exit-code", "--", ...deterministicPaths], "Verify deterministic Fagverk outputs", args.root);
  process.stdout.write("\nFagverk domain registry CI passed.\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) main();
