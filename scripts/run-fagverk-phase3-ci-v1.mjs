import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const registry = JSON.parse(fs.readFileSync('.github/ci/fagverk-phase3-registry-v1.json', 'utf8'));
const base = process.env.FAGVERK_PHASE3_BASE_SHA || '';
const head = process.env.FAGVERK_PHASE3_HEAD_SHA || '';

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
const shared = [
  'fagverk.html',
  'fagverk-forside.html',
  'data/categories/category_contract.json',
  'data/fag/fag_manifest.json',
  'data/fagverk/fagverk_registry.json',
  'data/fagverk/subject_status.json',
  'data/fagverk/fagverk_release.json',
  'js/fagverk-subject-core.js',
  'js/fagverk-subject-model.js',
  'js/fagverk.js',
  'scripts/audit-fagverk-subject-inventory.mjs',
  'scripts/audit-fagverk-general-engine.mjs',
  'scripts/build-fagverk-release-manifest.mjs',
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  'tests/fagverk-release-manifest.test.mjs',
  'scripts/run-fagverk-phase3-ci-v1.mjs',
  '.github/ci/fagverk-phase3-registry-v1.json',
  '.github/workflows/fagverk-phase3.yml'
];
const full = !changed || changed.some((file) => shared.includes(file));
const selected = Object.entries(registry.subjects).filter(([, subject]) =>
  full || changed.some((file) => subject.match.some((needle) => file.includes(needle)))
);

console.log(`Fagverk Phase 3 mode: ${full ? 'full matrix' : 'affected subjects'}`);
console.log(`Selected subjects: ${selected.map(([id]) => id).join(', ') || '(shared-only)'}`);

exec(process.execPath, ['scripts/audit-fagverk-subject-inventory.mjs']);
exec(process.execPath, ['scripts/audit-fagverk-general-engine.mjs']);

for (const [id, subject] of selected) {
  for (const file of [...subject.syntax, ...subject.run, ...subject.tests]) {
    if (!fs.existsSync(file)) {
      console.error(`Phase 3 registry for ${id} references missing file: ${file}`);
      process.exit(1);
    }
  }
  for (const file of subject.syntax) exec(process.execPath, ['--check', file]);
  for (const file of subject.run) exec(process.execPath, [file]);
}

exec(process.execPath, ['scripts/build-fagverk-release-manifest.mjs', '--check']);

const tests = [
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  ...selected.flatMap(([, subject]) => subject.tests),
  'tests/fagverk-release-manifest.test.mjs'
];
exec(process.execPath, ['--test', ...tests]);
