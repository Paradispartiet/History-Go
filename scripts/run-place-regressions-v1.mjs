import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const registryPath = '.github/ci/place-regression-registry-v1.json';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const base = process.env.PLACE_REGRESSION_BASE_SHA || '';
const head = process.env.PLACE_REGRESSION_HEAD_SHA || '';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function changedFiles() {
  if (!base || !head) return null;
  const result = spawnSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'git diff failed\n');
    process.exit(result.status ?? 1);
  }
  return result.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

const changed = changedFiles();
const fullMatrix = !changed || changed.some((path) => registry.sharedFullMatrixPaths.some((shared) => path === shared || path.startsWith(`${shared}/`)));
const selected = fullMatrix
  ? registry.places
  : registry.places.filter((place) => changed.some((path) => place.match.some((needle) => path.toLowerCase().includes(needle.toLowerCase()))));

if (!selected.length) {
  console.log('No registered place-specific regressions are affected; generic place contracts remain authoritative.');
  process.exit(0);
}

const tests = [...new Set(selected.flatMap((place) => place.tests))];
for (const test of tests) {
  if (!fs.existsSync(test)) {
    console.error(`Registered place regression is missing: ${test}`);
    process.exit(1);
  }
}

console.log(`Place regression mode: ${fullMatrix ? 'full matrix' : 'affected places'}`);
console.log(`Selected places: ${selected.map((place) => place.id).join(', ')}`);
run(process.execPath, ['--test', ...tests]);
