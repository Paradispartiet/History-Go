import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

test('Litteratur har komplett oversiktslag og et kildeført grunnkapittel', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 24,
    topicCount: 144,
    conceptCount: 24,
    moduleCount: 3,
    sourceCount: 10,
    claimCount: 18
  });
});
