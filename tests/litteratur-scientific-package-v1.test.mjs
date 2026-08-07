import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

test('Litteratur har synkronisert oversiktslag og kildeførte full-dybde-kapitler', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 27,
    topicCount: 162,
    completeAreaCount: 5,
    fullDepthChapterCount: 4,
    conceptCount: 120,
    moduleCount: 15,
    sourceCount: 58,
    claimCount: 117
  });
});
