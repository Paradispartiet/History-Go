import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const base = process.env.FAGVERK_BY_BASE_SHA || '';
const head = process.env.FAGVERK_BY_HEAD_SHA || '';
const auditPrefix = 'audit-fagverk-by-';
const auditSuffix = '-phase4.mjs';
const testPrefix = 'fagverk-by-';
const testSuffix = '-phase4.test.mjs';

const auditBySlug = new Map(
  fs.readdirSync('scripts')
    .filter((name) => name.startsWith(auditPrefix) && name.endsWith(auditSuffix))
    .map((name) => [name.slice(auditPrefix.length, -auditSuffix.length), path.join('scripts', name)])
);
const testBySlug = new Map(
  fs.readdirSync('tests')
    .filter((name) => name.startsWith(testPrefix) && name.endsWith(testSuffix))
    .map((name) => [name.slice(testPrefix.length, -testSuffix.length), path.join('tests', name)])
);
const allSlugs = [...new Set([...auditBySlug.keys(), ...testBySlug.keys()])].sort();

function exec(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function diffFiles() {
  if (!base || !head) return null;
  const result = spawnSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'git diff failed\n');
    process.exit(result.status ?? 1);
  }
  return result.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

const changed = diffFiles();
const sharedPaths = [
  'data/fagverk/fagverk_registry.json',
  'data/fagverk/subject_status.json',
  'data/fagverk/fagverk_release.json',
  'data/fag/fag_manifest.json',
  'scripts/audit-fagverk-subject-inventory.mjs',
  'scripts/audit-fagverk-general-engine.mjs',
  'scripts/build-fagverk-release-manifest.mjs',
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  'tests/fagverk-release-manifest.test.mjs',
  'scripts/run-fagverk-by-phase4-ci-v1.mjs',
  '.github/workflows/fagverk-by-phase4.yml'
];

const full = !changed || changed.some((file) => sharedPaths.includes(file));
const selected = new Set(full ? allSlugs : []);

if (changed && !full) {
  for (const file of changed) {
    let match = file.match(/^scripts\/audit-fagverk-by-(.+)-phase4\.mjs$/);
    if (match) selected.add(match[1]);
    match = file.match(/^tests\/fagverk-by-(.+)-phase4\.test\.mjs$/);
    if (match) selected.add(match[1]);
    match = file.match(/^data\/fagverk\/by\/([^/]+?)(?:\.json|\/)/);
    if (match) selected.add(match[1]);
    match = file.match(/^reports\/fagverk\/by-(.+?)-phase4-audit\.json$/);
    if (match) selected.add(match[1]);
  }
}

const selectedSlugs = [...selected].filter((slug) => auditBySlug.has(slug) || testBySlug.has(slug)).sort();
console.log(`Fagverk By Phase 4 mode: ${full ? 'full matrix' : 'affected chapters'}`);
console.log(`Selected chapters: ${selectedSlugs.join(', ') || '(shared-only)'}`);

exec(process.execPath, ['scripts/audit-fagverk-subject-inventory.mjs']);
exec(process.execPath, ['scripts/audit-fagverk-general-engine.mjs']);

for (const slug of selectedSlugs) {
  const audit = auditBySlug.get(slug);
  if (audit) {
    exec(process.execPath, ['--check', audit]);
    exec(process.execPath, [audit]);
  }
}

exec(process.execPath, ['scripts/build-fagverk-release-manifest.mjs', '--check']);

const tests = [
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  ...selectedSlugs.map((slug) => testBySlug.get(slug)).filter(Boolean),
  'tests/fagverk-release-manifest.test.mjs'
];
exec(process.execPath, ['--test', ...tests]);
