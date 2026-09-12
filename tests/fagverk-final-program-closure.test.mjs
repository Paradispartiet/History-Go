import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('Fagverk final program closure remains fail-closed and fully reconciled', () => {
  const result = spawnSync(process.execPath, ['tools/audit-fagverk-final-program-closure.mjs'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(
    result.stdout,
    /Fagverk final program closure PASS: 17\/19 expansion-proven, 2\/19 bounded no-proof, 0 content gaps, 20\/20 strict units\./,
  );
});
