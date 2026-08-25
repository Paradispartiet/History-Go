#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const registryPath = '.github/ci/fagverk-utdanning-domain-registry-v1.json';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function requireFile(path, reason) {
  if (!path || !existsSync(path)) throw new Error(`${reason}: missing ${String(path)}`);
}

function run(command, args, label) {
  process.stdout.write(`\n=== ${label} ===\n${command} ${args.join(' ')}\n`);
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function runNode(args, label) {
  run(process.execPath, args, label);
}

const registry = readJson(registryPath);
const domains = [...registry.domains].sort((a, b) => a.ordinal - b.ordinal);
if (registry.version !== 1 || registry.subject !== 'utdanning' || registry.totalDomains !== 14) {
  throw new Error('Unsupported Utdanning CI registry contract');
}
if (domains.length !== registry.totalDomains) {
  throw new Error(`Utdanning CI registry expected ${registry.totalDomains} domains, found ${domains.length}`);
}
for (let index = 0; index < domains.length; index += 1) {
  if (domains[index].ordinal !== index + 1) throw new Error(`Utdanning CI ordinals must be contiguous at ${index + 1}`);
}

const pensum = readJson(registry.canonicalPensum);
if (pensum.subject_id !== 'utdanning' || pensum.domain_order?.length !== 14 || pensum.domains?.length !== 14) {
  throw new Error('Canonical Utdanning pensum must expose exactly 14 domains');
}
const pensumById = new Map(pensum.domains.map((row) => [row.domain_id, row]));
for (const domain of domains) {
  if (pensum.domain_order[domain.ordinal - 1] !== domain.domainId || !pensumById.has(domain.domainId)) {
    throw new Error(`Utdanning CI registry order differs from canonical pensum at ${domain.ordinal}`);
  }
}

const materializedOrdinals = domains
  .filter((domain) => pensumById.get(domain.domainId)?.status === 'materialized')
  .map((domain) => domain.ordinal);
const count = materializedOrdinals.length;
for (let ordinal = 1; ordinal <= count; ordinal += 1) {
  if (!materializedOrdinals.includes(ordinal)) throw new Error(`Utdanning materialization must be monotone; missing ordinal ${ordinal}`);
}
for (let ordinal = count + 1; ordinal <= domains.length; ordinal += 1) {
  const state = pensumById.get(domains[ordinal - 1].domainId)?.status;
  if (state !== 'planned') throw new Error(`Unmaterialized Utdanning domain ${ordinal} must remain planned, found ${String(state)}`);
}

process.stdout.write(`Utdanning generic CI: ${count}/${registry.totalDomains} materialized domains\n`);

for (const domain of domains.filter((entry) => entry.ordinal <= count)) {
  requireFile(domain.fulltextMaterializer, `Utdanning ${domain.slug} fulltext materializer`);
  requireFile(domain.fulltextAudit, `Utdanning ${domain.slug} fulltext audit`);
  requireFile(domain.fulltextTest, `Utdanning ${domain.slug} fulltext test`);
}

const nextDomain = domains.find((entry) => entry.ordinal === count + 1);
if (nextDomain) {
  requireFile(nextDomain.sourceBrief, `Utdanning ${nextDomain.slug} source brief`);
  requireFile(nextDomain.sourceBriefScript, `Utdanning ${nextDomain.slug} source script`);
  requireFile(nextDomain.sourceBriefTest, `Utdanning ${nextDomain.slug} source test`);
  runNode([nextDomain.sourceBriefScript], `Utdanning ${nextDomain.slug} source-first brief`);
}

const latestDomain = domains.find((entry) => entry.ordinal === count);
if (latestDomain) {
  runNode([latestDomain.fulltextMaterializer], `Utdanning ${latestDomain.slug} deterministic fulltext materialization`);
  runNode([latestDomain.fulltextAudit], `Utdanning ${latestDomain.slug} fulltext audit`);
}

if (count === registry.totalDomains) {
  for (const file of [
    registry.strictCompletion?.bindings,
    registry.strictCompletion?.auditReport,
    registry.strictCompletion?.completionReport,
    registry.strictCompletion?.audit,
    registry.strictCompletion?.materializer,
    registry.strictCompletion?.auditTest,
    registry.strictCompletion?.completionTest,
  ]) requireFile(file, 'Utdanning strict completion contract');
  runNode([registry.strictCompletion.audit], 'Utdanning strict theory-integrity audit');
  runNode([registry.strictCompletion.materializer], 'Utdanning strict completion materialization');
}

for (const [script, args] of [
  ['scripts/audit-fagverk-subject-inventory.mjs', []],
  ['scripts/audit-fagverk-general-engine.mjs', []],
  ['scripts/audit-fagverk-theory-quality.mjs', []],
  ['scripts/audit-fagverk-theory-integrity.mjs', []],
  ['scripts/build-fagverk-release-manifest.mjs', ['--check']],
]) {
  requireFile(script, 'Shared Fagverk/Utdanning audit contract');
  runNode([script, ...args], script);
}

const tests = [];
if (nextDomain) tests.push(nextDomain.sourceBriefTest);
if (latestDomain) tests.push(latestDomain.fulltextTest);
if (count === registry.totalDomains) tests.push(registry.strictCompletion.auditTest, registry.strictCompletion.completionTest);
for (const test of [
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  'tests/fagverk-release-manifest.test.mjs',
]) {
  requireFile(test, 'Shared Fagverk/Utdanning test contract');
  tests.push(test);
}
runNode(['--test', ...tests], `Utdanning active/shared suite (${tests.length} files)`);

run('git', ['diff', '--exit-code', '--', 'data/fag/utdanning', 'data/fagverk/utdanning', 'data/fagverk/fagverk_registry.json', 'data/fagverk/subject_status.json', 'data/fagverk/fagverk_release.json', 'reports/fagverk'], 'Verify deterministic Utdanning/Fagverk outputs');

process.stdout.write('\nUtdanning registry-driven CI passed.\n');
