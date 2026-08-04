import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHistoryPeriodModules } from '../tools/validate-historie-period-modules.mjs';

test('de tre tidligere Historie-gapene har variable, evidensklare periodemoduler', () => {
  const result = validateHistoryPeriodModules();
  assert.deepEqual(result, {
    modules: 3,
    units: 21,
    sources: 18,
    cases: 9,
    unitCounts: [8, 7, 6]
  });
});
