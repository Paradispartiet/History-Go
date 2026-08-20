import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('By theory-integrity probe executes read-only on the committed corpus', () => {
  const result = spawnSync(process.execPath, ['tools/probe-by-theory-integrity.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.schema, 'history_go_by_theory_integrity_probe_v1');
  assert.equal(report.mode, 'read_only_diagnostic');
  assert.equal(report.canonicalMajorFieldCount, 12);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
});
