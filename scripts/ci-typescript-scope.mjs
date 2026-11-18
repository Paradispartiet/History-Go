#!/usr/bin/env node

// Explicit, testable scope classifier for the TypeScript guard.
// Keep a conservative fallback for unknown source files, but do not treat
// unrelated workflow configuration or CI routing documentation as shared UI.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const keys = ['web', 'scripts', 'tools', 'legacy', 'shared_ui'];

export function classifyChangedPaths(changedPaths, { full = false } = {}) {
  const scope = Object.fromEntries(keys.map((key) => [key, false]));
  const include = (...names) => names.forEach((name) => { scope[name] = true; });
  const includeAll = () => include(...keys);

  if (full) {
    includeAll();
    return scope;
  }

  for (const file of changedPaths) {
    if (!file) continue;

    if (file === '.github/workflows/typescript-guard.yml'
        || file === 'package.json' || file === 'package-lock.json') {
      includeAll();
    } else if (file.startsWith('.github/workflows/')
        || file === 'docs/CI_WORKFLOW_ROUTING.md') {
      // Ownership of these files is checked by CI workflow routing governance.
      // Their contents do not change the browser or shared UI runtime.
      continue;
    } else if (file === 'tests/ci-typescript-scope.test.mjs') {
      include('scripts');
    } else if (file === 'tsconfig.web.json' || file.startsWith('build/')
        || file.startsWith('dist/web/')) {
      include('web', 'shared_ui');
    } else if (file === 'tsconfig.scripts.json'
        || file === 'tsconfig.scripts.build.json' || file.startsWith('scripts/')) {
      include('scripts');
    } else if (file === 'tsconfig.tools.json'
        || file === 'tsconfig.tools.build.json'
        || file.startsWith('tools/') || file.startsWith('types/')) {
      include('tools');
    } else if (file === 'tsconfig.json') {
      include('legacy');
    } else if (file.startsWith('schemas/')) {
      include('web', 'legacy', 'shared_ui');
    } else if (file.startsWith('js/')) {
      include('web');
      if (!file.startsWith('js/Civication/')) include('shared_ui');
      if (file.endsWith('.js')) include('legacy');
    } else {
      // Match the old guard's fail-closed behavior for any newly introduced
      // source path, rather than silently omitting potentially relevant checks.
      include('shared_ui');
      if (!file.includes('/') && file.endsWith('.js')) {
        include('legacy', 'web');
      } else {
        includeAll();
      }
    }

    if (file.startsWith('scripts/') && file.endsWith('.js')) include('legacy');
  }

  return scope;
}

const isCli = Boolean(process.argv[1])
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/ci-typescript-scope.mjs --all|<changed-paths-file>');
    process.exitCode = 2;
  } else {
    const full = arg === '--all';
    const changedPaths = full ? [] : fs.readFileSync(arg, 'utf8').split(/\r?\n/u).filter(Boolean);
    const result = classifyChangedPaths(changedPaths, { full });
    for (const key of keys) console.log(`${key}=${result[key]}`);
  }
}
