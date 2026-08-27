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
  ['fagverk-inventory.yml', new Set([
    'data/fag/fag_manifest.json',
    'data/fag/**',
    'data/fagverk/subject_status.json',
  ])],
  ['fagverk-general-engine.yml', new Set(['data/fag/fag_manifest.json'])],
  ['fagverk-phase3.yml', new Set(['data/fag/fag_manifest.json'])],
  ['fagverk.yml', new Set(['data/fag/fag_manifest.json'])],
  ['data-checks.yml', new Set(['data/fag/**'])],
]);

const routedDomainWorkflows = new Set([
  'build-nature-place-candidates.yml',
  'fagverk.yml',
  'naeringsliv-subject-quality.yml',
  'natur-subject-quality.yml',
  'politikk-subject-quality.yml',
  'teknologi-scientific-quality.yml',
  'vitenskap-teknologi-category.yml',
]);

const requiredDomainPaths = new Map([
  ['build-nature-place-candidates.yml', 'data/places/natur/**'],
  ['fagverk.yml', 'data/fagverk/*/**'],
  ['naeringsliv-subject-quality.yml', 'data/fagverk/naeringsliv/**'],
  ['natur-subject-quality.yml', 'data/fagverk/natur/**'],
  ['politikk-subject-quality.yml', 'data/fagverk/politikk/**'],
  ['teknologi-scientific-quality.yml', 'data/fag/teknologi/**'],
  ['vitenskap-teknologi-category.yml', 'data/fagverk/vitenskap/**'],
]);

function declaredPaths(source) {
  return [...source.matchAll(/^\s*-\s*['"]([^'"]+)['"]\s*$/gm)].map((match) => match[1]);
}

export function auditFagverkWorkflowRouting() {
  const failures = [];
  const files = fs.readdirSync(workflowRoot)
    .filter((name) => name.endsWith('.yml'))
    .sort();

  let routedPullRequestWorkflows = 0;
  for (const file of files) {
    const source = fs.readFileSync(path.join(workflowRoot, file), 'utf8');
    if (!/^\s{2}pull_request:/m.test(source)) continue;

    const paths = new Set(declaredPaths(source));
    const allowed = allowedAggregatePaths.get(file) ?? new Set();
    for (const declaredPath of paths) {
      if (aggregatePaths.has(declaredPath) && !allowed.has(declaredPath)) {
        failures.push(`${file}: broad aggregate trigger is not routed: ${declaredPath}`);
      }
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

    if (file.startsWith('fagverk-') || routedDomainWorkflows.has(file)) {
      routedPullRequestWorkflows += 1;
      if (!/^concurrency:\s*$/m.test(source)) {
        failures.push(`${file}: missing top-level concurrency policy`);
      }
      if (!/^\s{2}cancel-in-progress:\s*true\s*$/m.test(source)) {
        failures.push(`${file}: stale pull-request runs are not cancelled`);
      }
    }
  }

  const releaseSource = fs.readFileSync(path.join(workflowRoot, 'fagverk-release.yml'), 'utf8');
  if (/\bgit\s+(?:commit|push)\b/.test(releaseSource)) {
    failures.push('fagverk-release.yml: pull-request validation must not commit or push');
  }
  if (!/^permissions:\s*\n\s{2}contents:\s*read\s*$/m.test(releaseSource)) {
    failures.push('fagverk-release.yml: release validation must be contents-read-only');
  }
  if (!/build-fagverk-release-manifest\.mjs --check/.test(releaseSource)) {
    failures.push('fagverk-release.yml: deterministic release check is missing');
  }

  for (const file of files.filter((name) => name.startsWith('fagverk-'))) {
    const source = fs.readFileSync(path.join(workflowRoot, file), 'utf8');
    if (/\bgit\s+(?:commit|push)\b/.test(source)) {
      failures.push(`${file}: Fagverk validation must not commit or push`);
    }
  }

  return { failures, routedPullRequestWorkflows };
}

const { failures, routedPullRequestWorkflows } = auditFagverkWorkflowRouting();
if (failures.length) {
  console.error(`CI workflow routing audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`CI workflow routing audit passed for ${routedPullRequestWorkflows} routed pull-request workflows.`);
}
