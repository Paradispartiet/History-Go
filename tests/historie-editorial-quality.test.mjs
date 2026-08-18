import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHistoryEditorialQuality } from '../tools/validate-historie-editorial-quality.mjs';

test('atten Historie-kapitler har håndredigert fagprofil og emnelinser', () => {
  const result = validateHistoryEditorialQuality();
  assert.deepEqual(result, {
    profiles: 18,
    sectionLenses: 180,
    editorialHookSections: 180,
    caseAnchors: 54,
    causalSteps: 72,
    debates: 18,
    primaryHookOwners: 230
  });
});
