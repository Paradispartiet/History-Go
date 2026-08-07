import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

test('Litteratur har synkronisert oversiktslag og kildeførte full-dybde-kapitler', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 25,
    topicCount: 150,
    completeAreaCount: 3,
    fullDepthChapterCount: 2,
    conceptCount: 72,
    moduleCount: 9,
    sourceCount: 34,
    claimCount: 69
  });
});
