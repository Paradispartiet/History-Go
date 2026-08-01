#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'makt-regulering-baerekraft';
const DOMAIN_ID = 'makt_regulering_baerekraft';
const TODAY = '2026-07-31';
const CHAPTER_FILE = `data/fagverk/naeringsliv/${CHAPTER_ID}.json`;
const BASE = `data/fagverk/naeringsliv/${CHAPTER_ID}`;
const MODULE_FILES = [`${BASE}/01-grunnlag.json`, `${BASE}/02-fordypning.json`, `${BASE}/03-anvendelse.json`];
const BRIEF_FILE = `${BASE}/brief.json`;
const CLAIMS_FILE = `${BASE}/claims.json`;
const PENSUM_FILE = 'data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json';
const RUNTIME_FILE = 'data/fag/naeringsliv/naeringsliv_runtime_manifest.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const README_FILE = 'reports/fagverk/README.md';
const OLD_AUDIT_FILE = 'scripts/audit-naeringsliv-chapter-logistikk-infrastruktur-okonomisk-rom.mjs';
const WORKFLOW_FILE = '.github/workflows/naeringsliv-subject-quality.yml';
const SELF_FILE = 'scripts/materialize-naeringsliv-chapter-makt-regulering-baerekraft-v1.mjs';

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const writeJson = (relative, value) => {
  fs.mkdirSync(path.dirname(abs(relative)), { recursive: true });
  fs.writeFileSync(abs(relative), `${JSON.stringify(value, null, 2)}\n`);
};
const bumpMinor = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(version || ''));
  if (!match) throw new Error(`Cannot bump non-semver version: ${version}`);
  return `${match[1]}.${Number(match[2]) + 1}.0`;
};
const run = (...args) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });

const permanentWorkflow = `name: Økonomi og næringsliv subject quality

on:
  pull_request:
    paths:
      - 'data/fag/naeringsliv/**'
      - 'data/badges/naeringsliv.json'
      - 'data/fagverk/**'
      - 'tools/validate-okonomi-naeringsliv-*.mjs'
      - 'scripts/audit-naeringsliv-*.mjs'
      - 'tests/naeringsliv-*.test.mjs'
      - 'tests/fagverk-subject-inventory.test.mjs'
      - 'reports/fagverk/naeringsliv-*.json'
      - 'reports/fagverk/general-engine-audit.json'
      - 'reports/fagverk/subject-baseline.json'
      - 'reports/fagverk/README.md'
      - '.github/workflows/naeringsliv-subject-quality.yml'
  push:
    branches: [main]
    paths:
      - 'data/fag/naeringsliv/**'
      - 'data/badges/naeringsliv.json'
      - 'data/fagverk/**'
      - 'tools/validate-okonomi-naeringsliv-*.mjs'
      - 'scripts/audit-naeringsliv-*.mjs'
      - 'tests/naeringsliv-*.test.mjs'
      - 'tests/fagverk-subject-inventory.test.mjs'
      - 'reports/fagverk/naeringsliv-*.json'
      - 'reports/fagverk/general-engine-audit.json'
      - 'reports/fagverk/subject-baseline.json'
      - 'reports/fagverk/README.md'
      - '.github/workflows/naeringsliv-subject-quality.yml'

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
      - run: npm ci
      - name: Validate Økonomi og næringsliv quality contracts
        run: |
          node --check scripts/audit-naeringsliv-subject-quality.mjs
          for audit in scripts/audit-naeringsliv-chapter-*.mjs; do
            node --check "$audit"
            node "$audit"
          done
          node --check tools/validate-okonomi-naeringsliv-universitetsramme.mjs
          node --check tools/validate-okonomi-naeringsliv-emnerevisjon.mjs
          node --check tools/validate-okonomi-naeringsliv-handelshogskole.mjs
          node tools/validate-okonomi-naeringsliv-universitetsramme.mjs
          node tools/validate-okonomi-naeringsliv-emnerevisjon.mjs
          node tools/validate-okonomi-naeringsliv-handelshogskole.mjs
          node scripts/audit-naeringsliv-subject-quality.mjs
          node --test tests/naeringsliv-*.test.mjs
          node scripts/audit-fagverk-general-engine.mjs
          node scripts/audit-fagverk-subject-inventory.mjs
          node --test tests/fagverk-general-engine.test.mjs tests/fagverk-subject-inventory.test.mjs tests/fagverk-documentation-contract.test.mjs
          npm run typecheck:web
`;

function materialize() {
  const pensum = readJson(PENSUM_FILE);
  const domain = (pensum.domains || []).find((row) => row.domain_id === DOMAIN_ID);
  if (!domain) throw new Error(`Missing canonical domain ${DOMAIN_ID}`);

  const runtime = readJson(RUNTIME_FILE);
  runtime.version = bumpMinor(runtime.version);
  runtime.updatedAt = TODAY;
  runtime.chapterByDomain ||= {};
  runtime.chapterByEmne ||= {};
  runtime.chapterByDomain[DOMAIN_ID] = CHAPTER_ID;
  for (const emneId of domain.emne_ids || []) runtime.chapterByEmne[emneId] = CHAPTER_ID;
  writeJson(RUNTIME_FILE, runtime);

  const registry = readJson(REGISTRY_FILE);
  registry.version = bumpMinor(registry.version);
  if ('updatedAt' in registry) registry.updatedAt = TODAY;
  if ('updated_at' in registry) registry.updated_at = TODAY;
  const subject = registry.subjects?.naeringsliv;
  if (!subject) throw new Error('Registry lacks subjects.naeringsliv');
  subject.chapters ||= [];
  const entry = {
    id: CHAPTER_ID,
    title: 'Makt, regulering og bærekraft',
    subtitle: 'Hvordan markedsmakt, arbeidslivsinstitusjoner, regulering, miljøkostnader og omstilling fordeler ansvar og risiko',
    file: CHAPTER_FILE,
    primary_domain_id: DOMAIN_ID,
    emne_ids: domain.emne_ids,
    method_ids: domain.method_ids,
    moduleFiles: MODULE_FILES,
    briefFile: BRIEF_FILE,
    claimsFile: CLAIMS_FILE,
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex >= 0) subject.chapters[existingIndex] = entry;
  else subject.chapters.push(entry);
  const order = new Map((pensum.domain_order || []).map((id, index) => [id, index]));
  subject.chapters.sort((a, b) => (order.get(a.primary_domain_id) ?? 999) - (order.get(b.primary_domain_id) ?? 999));
  writeJson(REGISTRY_FILE, registry);

  const status = readJson(STATUS_FILE);
  status.version = bumpMinor(status.version);
  if ('updatedAt' in status) status.updatedAt = TODAY;
  if ('updated_at' in status) status.updated_at = TODAY;
  const statusEntry = (status.subjects || []).find((row) => row.id === 'naeringsliv');
  if (!statusEntry) throw new Error('Subject status lacks naeringsliv');
  statusEntry.navigationStatus = 'materialized';
  statusEntry.assessmentStatus = 'audited';
  statusEntry.editorialStatus = 'complete';
  statusEntry.nextGate = 'maintenance_and_source_refresh';
  statusEntry.note = 'Økonomi og næringsliv er redaksjonelt komplett med 6 av 6 canonicale hovedkapitler. Sluttkapittelet Makt, regulering og bærekraft dekker alle tre emner og elleve metoder i fagområdet gjennom tre redigerte moduler, 42 sporede claims, 22 inspectable kilder, to worked examples, fem misoppfatninger, tre anvendelsesoppgaver, åtte selvtester og seks canonicale Oslo-steder.';
  writeJson(STATUS_FILE, status);

  const oldAuditPath = abs(OLD_AUDIT_FILE);
  let oldAudit = fs.readFileSync(oldAuditPath, 'utf8');
  const oldBlock = `  const statusEntry = status.subjects.find((row) => row.id === "naeringsliv");\n  assert(statusEntry?.editorialStatus === "chapters_in_progress", "Næringsliv must remain chapters_in_progress at 5/6");\n  assert(String(statusEntry.note || "").includes("5 av 6"), "Status note does not report 5/6");`;
  const newBlock = `  const statusEntry = status.subjects.find((row) => row.id === "naeringsliv");\n  const registeredChapterCount = registry.subjects?.naeringsliv?.chapters?.length || 0;\n  const canonicalDomainCount = (pensum.domains || []).length;\n  const expectedEditorialStatus = registeredChapterCount === canonicalDomainCount ? "complete" : "chapters_in_progress";\n  assert(statusEntry?.editorialStatus === expectedEditorialStatus, \`Næringsliv status must be \${expectedEditorialStatus}\`);\n  assert(String(statusEntry.note || "").includes(\`\${registeredChapterCount} av \${canonicalDomainCount}\`), "Status note does not report registered coverage");`;
  if (oldAudit.includes(oldBlock)) oldAudit = oldAudit.replace(oldBlock, newBlock);
  else if (!oldAudit.includes('registeredChapterCount = registry.subjects?.naeringsliv?.chapters?.length')) {
    throw new Error('Could not locate chapter-5 status assertions for dynamic patching');
  }
  fs.writeFileSync(oldAuditPath, oldAudit);

  let readme = fs.readFileSync(abs(README_FILE), 'utf8');
  const bullet = '- `naeringsliv-makt-regulering-baerekraft-audit.json` — deterministisk sluttkapittelgate for tre emner, elleve metoder, tre moduler, 42 claims og 22 inspectable kilder.\n';
  if (!readme.includes(bullet.trim())) {
    const anchor = '- `naeringsliv-logistikk-infrastruktur-okonomisk-rom-audit.json`';
    const index = readme.indexOf(anchor);
    if (index < 0) throw new Error('README lacks Næringsliv audit insertion anchor');
    readme = `${readme.slice(0, index)}${bullet}${readme.slice(index)}`;
  }
  const commands = 'node scripts/audit-naeringsliv-chapter-makt-regulering-baerekraft.mjs --write-report\nnode scripts/audit-naeringsliv-chapter-makt-regulering-baerekraft.mjs\n';
  if (!readme.includes('node scripts/audit-naeringsliv-chapter-makt-regulering-baerekraft.mjs --write-report')) {
    const anchor = 'node scripts/audit-naeringsliv-chapter-logistikk-infrastruktur-okonomisk-rom.mjs --write-report';
    const index = readme.indexOf(anchor);
    if (index < 0) throw new Error('README lacks Næringsliv regeneration insertion anchor');
    readme = `${readme.slice(0, index)}${commands}${readme.slice(index)}`;
  }
  fs.writeFileSync(abs(README_FILE), readme);

  fs.writeFileSync(abs(WORKFLOW_FILE), permanentWorkflow);

  run('scripts/audit-naeringsliv-chapter-makt-regulering-baerekraft.mjs', '--write-report');
  run('scripts/audit-naeringsliv-subject-quality.mjs', '--write-report');
  run('scripts/audit-fagverk-general-engine.mjs', '--write-report');
  run('scripts/audit-fagverk-subject-inventory.mjs', '--write-report');

  fs.rmSync(abs(SELF_FILE));
  console.log('Materialized final Næringsliv chapter at 6/6.');
}

try {
  materialize();
} catch (error) {
  console.error(`Materialization failed: ${error.stack || error.message}`);
  process.exitCode = 1;
}
