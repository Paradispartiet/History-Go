#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowRoot = path.join(repoRoot, '.github', 'workflows');

const aggregatePaths = new Set([
  'data/fag/fag_manifest.json',
  'data/fag/**',
  'data/fagverk/**',
  'data/fagverk/fagverk_registry.json',
  'data/fagverk/subject_status.json',
  'data/fagverk/fagverk_release.json',
]);

const allowedAggregatePaths = new Map([
  ['fagverk-release.yml', new Set(['data/fag/**', 'data/fagverk/**'])],
  ['fagverk-inventory.yml', new Set(['data/fag/fag_manifest.json', 'data/fag/**', 'data/fagverk/subject_status.json'])],
  ['fagverk-general-engine.yml', new Set(['data/fag/fag_manifest.json'])],
  ['fagverk-phase3.yml', new Set(['data/fag/fag_manifest.json'])],
  ['fagverk.yml', new Set(['data/fag/fag_manifest.json'])],
  ['data-checks.yml', new Set(['data/fag/fag_manifest.json'])],
]);

const exclusivePathOwners = new Map([
  ['reports/fagverk/general-engine-audit.json', 'fagverk-general-engine.yml'],
  ['tests/fagverk-general-engine.test.mjs', 'fagverk-general-engine.yml'],
  ['scripts/audit-fagverk-general-engine.mjs', 'fagverk-general-engine.yml'],
  ['reports/fagverk/subject-inventory-audit.json', 'fagverk-inventory.yml'],
  ['tests/fagverk-subject-inventory.test.mjs', 'fagverk-inventory.yml'],
  ['scripts/audit-fagverk-subject-inventory.mjs', 'fagverk-inventory.yml'],
  ['scripts/build-fagverk-release-manifest.mjs', 'fagverk-release.yml'],
]);

const categoryContractOwners = new Set(['fagverk-general-engine.yml', 'vitenskap-teknologi-category.yml']);

const requiredDomainPaths = new Map([
  ['build-nature-place-candidates.yml', 'data/places/natur/**'],
  ['fagverk.yml', 'data/fagverk/*/**'],
  ['naeringsliv-subject-quality.yml', 'data/fagverk/naeringsliv/**'],
  ['natur-subject-quality.yml', 'data/fagverk/natur/**'],
  ['politikk-subject-quality.yml', 'data/fagverk/politikk/**'],
  ['teknologi-scientific-quality.yml', 'data/fag/teknologi/**'],
  ['vitenskap-teknologi-category.yml', 'data/fagverk/vitenskap/**'],
]);

const allowedPullRequestAndPush = new Set([
  // This one-shot worker writes only to dedicated coordinate branches.
  'coordinate-branch-runner.yml',
  // Main pushes dispatch the committed release digest to AHA-EchoNet.
  'fagverk-release.yml',
]);

const cancellationExempt = new Set([
  // Cancelling a mutating one-shot job could strand a half-finished branch.
  'coordinate-branch-runner.yml',
]);

const routingRules = new Map([
  ['knowledge-checks.yml', new Set(['scripts/knowledge-canonical-data.mts', 'data/knowledge/**', 'data/quiz/**'])],
  ['data-checks.yml', new Set(['data/fag/**'])],
  ['oslo-micro-places-governance.yml', new Set([
    'data/places/production/**',
    'data/places/manifest.json',
    'data/places/places_index.json',
    'data/places/place_image_backlog_summary.json',
    'data/runtime/place-open/**',
  ])],
  ['place-rounds-governance.yml', new Set([
    'data/stories/**',
    'data/people/manifest.json',
    'data/brands/**',
    'bilder/kort/people/**',
    'bilder/kort/brands/**',
    'bilder/brands/**',
    'data/places/places_index.json',
  ])],
]);

const routingScenarios = [
  {
    name: 'full place production',
    maxWorkflows: 16,
    forbidden: new Set(['knowledge-checks.yml', 'oslo-micro-places-governance.yml', 'place-rounds-governance.yml']),
    paths: [
      'data/places/industri/oslo/places_industri/freia.json',
      'data/places/production/freia.json',
      'data/people/industri/oslo/freia/people_freia.json',
      'data/quiz/production_context/industri/freia.json',
      'data/knowledge/places/oslo/freia.json',
      'data/stories/oslo/freia.json',
      'data/leksikon/places/oslo/industri/leksikon_freia.json',
      'data/lesespor/oslo/lesespor_oslo_industri.json',
      'data/places/manifest.json',
      'data/places/places_index.json',
      'data/places/place_image_backlog_summary.json',
      'data/runtime/place-open/freia.json',
      'reports/place-production/freia-industri-v1.json',
    ],
  },
  {
    name: 'Utdanning subject production',
    maxWorkflows: 12,
    forbidden: new Set(['fagverk-film-tv-phase3.yml', 'fagverk-musikk.yml', 'fagverk-natur-pilot.yml']),
    paths: [
      'data/fag/utdanning/emner_utdanning_canonical_v1.json',
      'data/fagverk/utdanning/subject.json',
      'data/fagverk/fagverk_registry.json',
      'data/fagverk/subject_status.json',
      'data/fagverk/fagverk_release.json',
      'data/fagverk/subject_inventory.json',
      'reports/fagverk/utdanning-quality-audit.json',
      'reports/fagverk/general-engine-audit.json',
      'reports/fagverk/subject-inventory-audit.json',
      'scripts/audit-fagverk-utdanning.mjs',
      'scripts/audit-fagverk-general-engine.mjs',
      'scripts/audit-fagverk-subject-inventory.mjs',
      'scripts/build-fagverk-release-manifest.mjs',
      'tests/utdanning-quality.test.mjs',
      'tests/fagverk-general-engine.test.mjs',
      'tests/fagverk-subject-inventory.test.mjs',
    ],
  },
  {
    name: 'Oslo Micro Place production',
    maxWorkflows: 16,
    forbidden: new Set(['place-rounds-governance.yml']),
    paths: [
      'data/places/natur/oslo/miljo_gjenbruk/reparasjon.json',
      'data/places/production/reparasjon.json',
      'data/categories/category_contract.json',
      'data/places/manifest.json',
      'data/places/places_index.json',
      'data/places/place_image_backlog_summary.json',
      'data/runtime/place-open/reparasjon.json',
      'reports/oslo-micro-place-expansion-2026/review-audit.json',
    ],
  },
];

function eventBlock(source, eventName) {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.match(new RegExp(`^  ${eventName}:`)));
  if (start < 0) return null;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^  [A-Za-z_][A-Za-z0-9_-]*:/.test(lines[index]) || /^[A-Za-z_][A-Za-z0-9_-]*:/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

function declaredPaths(source) {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => /^\s{4}paths:\s*$/.test(line));
  if (start < 0) return [];
  const paths = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s{4}\S/.test(line)) break;
    const match = line.match(/^\s{6,}-\s*(.+?)\s*$/);
    if (match) {
      const value = match[1];
      paths.push((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))
        ? value.slice(1, -1)
        : value);
    }
  }
  return paths;
}

function activePullRequest(source) {
  const block = eventBlock(source, 'pull_request');
  return Boolean(block && !/^\s*types:\s*\[closed\]\s*$/m.test(block));
}

function globRegex(glob) {
  let regex = '^';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === '*' && glob[index + 1] === '*') {
      if (glob[index + 2] === '/') {
        regex += '(?:.*/)?';
        index += 2;
      } else {
        regex += '.*';
        index += 1;
      }
    } else if (char === '*') {
      regex += '[^/]*';
    } else if (char === '?') {
      regex += '[^/]';
    } else {
      regex += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    }
  }
  return new RegExp(`${regex}$`);
}

function workflowMatches(paths, changedPaths) {
  if (!paths.length) return true;
  return changedPaths.some((changedPath) => {
    let matched = false;
    for (const pattern of paths) {
      const negative = pattern.startsWith('!');
      const regex = globRegex(negative ? pattern.slice(1) : pattern);
      if (regex.test(changedPath)) matched = !negative;
    }
    return matched;
  });
}

function scenarioRoutes(workflows, changedPaths) {
  return workflows
    .filter(({ source }) => activePullRequest(source))
    .filter(({ source }) => workflowMatches(declaredPaths(eventBlock(source, 'pull_request')), changedPaths))
    .map(({ file }) => file)
    .sort();
}

export function auditWorkflowRouting() {
  const failures = [];
  const workflows = fs.readdirSync(workflowRoot)
    .filter((name) => name.endsWith('.yml'))
    .sort()
    .map((file) => ({ file, source: fs.readFileSync(path.join(workflowRoot, file), 'utf8') }));

  let activePullRequestWorkflows = 0;
  for (const { file, source } of workflows) {
    const pullRequest = eventBlock(source, 'pull_request');
    if (!pullRequest) continue;
    const paths = new Set(declaredPaths(pullRequest));

    if (activePullRequest(source)) {
      activePullRequestWorkflows += 1;
      if (!/^concurrency:\s*$/m.test(source)) failures.push(`${file}: missing top-level concurrency policy`);
      if (!cancellationExempt.has(file) && !/^\s{2}cancel-in-progress:\s*true\s*$/m.test(source)) {
        failures.push(`${file}: stale pull-request runs are not cancelled`);
      }
    }

    if (eventBlock(source, 'push') && !allowedPullRequestAndPush.has(file)) {
      failures.push(`${file}: duplicates pull-request validation on push; use main-integrity.yml`);
    }

    const allowedAggregates = allowedAggregatePaths.get(file) ?? new Set();
    for (const declaredPath of paths) {
      if (aggregatePaths.has(declaredPath) && !allowedAggregates.has(declaredPath)) {
        failures.push(`${file}: broad aggregate trigger is not routed: ${declaredPath}`);
      }
      const owner = exclusivePathOwners.get(declaredPath);
      if (owner && owner !== file) failures.push(`${file}: shared trigger ${declaredPath} is owned by ${owner}`);
      if (declaredPath === 'reports/fagverk/**') failures.push(`${file}: reports/fagverk/** must be domain-routed`);
      if (declaredPath === 'data/categories/category_contract.json' && file.startsWith('fagverk-') && !categoryContractOwners.has(file)) {
        failures.push(`${file}: category contract belongs to the central/category gates`);
      }
    }

    const forbiddenPaths = routingRules.get(file) ?? new Set();
    for (const forbiddenPath of forbiddenPaths) {
      if (paths.has(forbiddenPath)) failures.push(`${file}: trigger belongs to another gate: ${forbiddenPath}`);
    }

    if (file.startsWith('fagverk-') && file !== 'fagverk-release.yml') {
      const hasDomainInput = [...paths].some((declaredPath) =>
        (declaredPath.startsWith('data/fag/') || declaredPath.startsWith('data/fagverk/'))
        && !aggregatePaths.has(declaredPath));
      if (!hasDomainInput) failures.push(`${file}: domain-specific Fagverk input is missing`);
    }

    const requiredDomainPath = requiredDomainPaths.get(file);
    if (requiredDomainPath && !paths.has(requiredDomainPath)) {
      failures.push(`${file}: required routed input is missing: ${requiredDomainPath}`);
    }

    if ((file.startsWith('fagverk-') || file === 'fagverk.yml') && /\bgit\s+(?:commit|push)\b/.test(source)) {
      failures.push(`${file}: Fagverk validation must not commit or push`);
    }
  }

  for (const [ownedPath, owner] of exclusivePathOwners) {
    const workflow = workflows.find(({ file }) => file === owner);
    const paths = new Set(declaredPaths(eventBlock(workflow.source, 'pull_request')));
    if (!paths.has(ownedPath)) failures.push(`${owner}: owned trigger is missing: ${ownedPath}`);
  }

  const civicationPaths = new Set(declaredPaths(eventBlock(
    workflows.find(({ file }) => file === 'civication.yml').source,
    'pull_request',
  )));
  for (const exclusion of [
    '!data/Civication/historyPeople_index.json',
    '!data/Civication/scenarioPeople/**',
    '!data/Civication/scenarioPeople_index.json',
  ]) {
    if (!civicationPaths.has(exclusion)) failures.push(`civication.yml: specialized exclusion is missing: ${exclusion}`);
  }

  const dataCheckPaths = new Set(declaredPaths(eventBlock(
    workflows.find(({ file }) => file === 'data-checks.yml').source,
    'pull_request',
  )));
  for (const knowledgeInput of ['data/fag/fag_manifest.json', 'data/fag/*/emner*.json']) {
    if (!dataCheckPaths.has(knowledgeInput)) failures.push(`data-checks.yml: canonical Knowledge input is missing: ${knowledgeInput}`);
  }

  const releaseSource = workflows.find(({ file }) => file === 'fagverk-release.yml').source;
  if (!/^permissions:\s*\n\s{2}contents:\s*read\s*$/m.test(releaseSource)) {
    failures.push('fagverk-release.yml: release validation must be contents-read-only');
  }
  if (!/build-fagverk-release-manifest\.mjs --check/.test(releaseSource)) {
    failures.push('fagverk-release.yml: deterministic release check is missing');
  }

  const routingSource = workflows.find(({ file }) => file === 'ci-workflow-routing.yml').source;
  if (!declaredPaths(eventBlock(routingSource, 'pull_request')).includes('.github/workflows/**')) {
    failures.push('ci-workflow-routing.yml: must audit every workflow change');
  }

  const mainIntegritySource = workflows.find(({ file }) => file === 'main-integrity.yml')?.source ?? '';
  for (const required of [
    'node scripts/audit-ci-workflow-routing.mjs',
    'npm run build:web:check',
    'npm run places:index:check',
    'npm run knowledge:canonical:check',
    'node scripts/build-fagverk-release-manifest.mjs --check',
  ]) {
    if (!mainIntegritySource.includes(required)) failures.push(`main-integrity.yml: missing composed check: ${required}`);
  }
  if (!/^permissions:\s*\n\s{2}contents:\s*read\s*$/m.test(mainIntegritySource)) {
    failures.push('main-integrity.yml: must be contents-read-only');
  }

  const scenarios = [];
  for (const scenario of routingScenarios) {
    const routes = scenarioRoutes(workflows, scenario.paths);
    scenarios.push({ name: scenario.name, workflows: routes.length, routes });
    if (routes.length > scenario.maxWorkflows) {
      failures.push(`${scenario.name}: ${routes.length} workflows exceed budget ${scenario.maxWorkflows}`);
    }
    for (const forbidden of scenario.forbidden) {
      if (routes.includes(forbidden)) failures.push(`${scenario.name}: unrelated workflow routed: ${forbidden}`);
    }
  }

  return { failures, activePullRequestWorkflows, scenarios };
}

const { failures, activePullRequestWorkflows, scenarios } = auditWorkflowRouting();
for (const scenario of scenarios) console.log(`${scenario.name}: ${scenario.workflows} workflow(s)`);
if (failures.length) {
  console.error(`CI workflow routing audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`CI workflow routing audit passed for ${activePullRequestWorkflows} active pull-request workflows.`);
}
