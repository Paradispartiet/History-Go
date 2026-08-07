import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

test('Litteratur har synkronisert oversiktslag og kildeførte full-dybde-kapitler', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 28,
    topicCount: 168,
    completeAreaCount: 6,
    fullDepthChapterCount: 5,
    conceptCount: 144,
    moduleCount: 18,
    sourceCount: 70,
    claimCount: 150
  });
});
