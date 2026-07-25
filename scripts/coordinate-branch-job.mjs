import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Cleanup retrigger after workflow validation.
const root = process.cwd();
const restorePaths = [
  'data/places/places_index.json',
  'reports/coordinate-evidence-audit.md',
  'reports/place-coordinate-intake-gate.md',
  'reports/place-coordinate-quality-gate.md',
  '.github/workflows/coordinate-branch-runner.yml'
];

function restoreFromMain(relativePath) {
  const object = `origin/main:${relativePath}`;
  const exists = spawnSync('git', ['cat-file', '-e', object], {
    cwd: root,
    encoding: 'utf8'
  });
  const target = path.join(root, relativePath);
  if (exists.status !== 0) {
    fs.rmSync(target, { force: true, recursive: true });
    console.log(`Fjernet ${relativePath}; finnes ikke på main`);
    return;
  }

  const result = spawnSync('git', ['show', object], {
    cwd: root,
    encoding: null,
    maxBuffer: 512 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Kunne ikke hente ${relativePath} fra main\n${String(result.stderr || '')}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.stdout);
  console.log(`Tilbakestilte ${relativePath} fra origin/main`);
}

for (const relativePath of restorePaths) restoreFromMain(relativePath);

const runnerReports = path.join(
  root,
  'reports',
  'coordinate-branch-runner',
  'agent_oslo-coordinate-history-v5-5-power-curation-v2'
);
fs.rmSync(runnerReports, { recursive: true, force: true });

const diffCheck = spawnSync('git', ['diff', '--check'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024
});
if (diffCheck.error || diffCheck.status !== 0) {
  throw new Error(`git diff --check feilet\n${diffCheck.stderr || diffCheck.stdout || ''}`);
}

console.log('Historie-PR-diffen er renset for stedsindeks, koordinatrapporter og runnerlogger.');
