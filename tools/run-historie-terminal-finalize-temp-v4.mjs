#!/usr/bin/env node
// Explicit one-shot retrigger after terminal audit reduced to stale semantic result-key assertions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function replaceExact(file, before, after, label) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.includes(before), `${label}: source changed; refusing blind patch`);
  fs.writeFileSync(file, text.replace(before, after));
}

replaceExact(
  'tests/historie-completion.test.mjs',
  "  assert.equal(result.canonical_emner, 230);\n  assert.equal(result.unique_primary_semantic_keys, 230);\n  assert.equal(result.curated_mismatches, 0);\n  assert.ok(result.curated_blueprint_rows > 0);\n",
  "  assert.equal(result.canonical_emners, 230);\n  assert.equal(result.unique_primary_semantic_keys, 230);\n  assert.equal(result.canonical_hook_mismatches, 0);\n  assert.equal(result.curated_editorial_hook_mismatches, 0);\n  assert.ok(result.active_curated_blueprint_rows > 0);\n  assert.equal(result.curated_editorial_coverage, 30);\n  assert.equal(result.canonical_identity_preserved, true);\n  assert.equal(result.editorial_layer_separate_from_ownership, true);\n",
  'History completion semantic result contract'
);

replaceExact(
  'tools/run-historie-terminal-finalize-temp-v2.mjs',
  "  'tests/fagverk-historie.test.mjs',\n",
  "  'tests/fagverk-historie.test.mjs',\n  'tests/historie-completion.test.mjs',\n",
  'terminal staging includes completion regression test'
);

const run = spawnSync('node', ['tools/run-historie-terminal-finalize-temp-v3.mjs'], {
  stdio: 'inherit',
  encoding: 'utf8'
});
if (run.error) throw run.error;
process.exit(run.status ?? 1);
