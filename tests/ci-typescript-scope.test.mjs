import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { classifyChangedPaths } from '../scripts/ci-typescript-scope.mjs';

const scopes = (web, scripts, tools, legacy, shared_ui) => ({
  web, scripts, tools, legacy, shared_ui,
});

test('unrelated workflow and CI routing documentation do not become shared UI changes', () => {
  assert.deepEqual(classifyChangedPaths([
    '.github/workflows/placecard-media-browser-audit.yml',
    '.github/workflows/by-v1-twenty-app-qa.yml',
    'docs/CI_WORKFLOW_ROUTING.md',
  ]), scopes(false, false, false, false, false));
});

test('routing scripts and their test trigger script validation but not Place-open regression', () => {
  assert.deepEqual(classifyChangedPaths([
    'scripts/audit-ci-workflow-routing.mjs',
    'scripts/ci-typescript-scope.mjs',
    'tests/ci-typescript-scope.test.mjs',
    '.github/workflows/ci-workflow-routing.yml',
  ]), scopes(false, true, false, false, false));
  assert.deepEqual(classifyChangedPaths(['scripts/audit-legacy.js']),
    scopes(false, true, false, true, false));
});

test('actual shared PlaceCard UI keeps the complete UI and TypeScript gates', () => {
  assert.deepEqual(classifyChangedPaths(['js/ui/place-card.js', 'docs/CI_WORKFLOW_ROUTING.md']),
    scopes(true, false, false, true, true));
  assert.deepEqual(classifyChangedPaths(['js/Civication/game.js']),
    scopes(true, false, false, true, false));
  assert.deepEqual(classifyChangedPaths(['schemas/place.schema.json']),
    scopes(true, false, false, true, true));
});

test('TypeScript guard self-edits, dependency edits and unknown inputs fail closed', () => {
  const all = scopes(true, true, true, true, true);
  assert.deepEqual(classifyChangedPaths(['.github/workflows/typescript-guard.yml']), all);
  assert.deepEqual(classifyChangedPaths(['package-lock.json']), all);
  assert.deepEqual(classifyChangedPaths(['new/future-source.ts']), all);
  assert.deepEqual(classifyChangedPaths([], { full: true }), all);
});

test('existing web, script, tool and legacy TS scopes remain compatible', () => {
  assert.deepEqual(classifyChangedPaths(['tsconfig.web.json']),
    scopes(true, false, false, false, true));
  assert.deepEqual(classifyChangedPaths(['tools/cli.ts']),
    scopes(false, false, true, false, false));
  assert.deepEqual(classifyChangedPaths(['tsconfig.json']),
    scopes(false, false, false, true, false));
  assert.deepEqual(classifyChangedPaths(['global-runtime.js']),
    scopes(true, false, false, true, true));
});

test('CLI emits all five exact GITHUB_OUTPUT flags', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hg-ts-scope-'));
  const input = path.join(dir, 'changed.txt');
  try {
    fs.writeFileSync(input, [
      'scripts/audit-ci-workflow-routing.mjs',
      '.github/workflows/ci-workflow-routing.yml',
      'docs/CI_WORKFLOW_ROUTING.md',
      '',
    ].join('\n'));
    const run = spawnSync(process.execPath,
      ['scripts/ci-typescript-scope.mjs', input], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout.trim(), [
      'web=false', 'scripts=true', 'tools=false',
      'legacy=false', 'shared_ui=false',
    ].join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
