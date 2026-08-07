import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

test('Litteratur har synkronisert oversiktslag og kildeførte full-dybde-kapitler', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 28,
    topicCount: 168,
    completeAreaCount: 8,
    fullDepthChapterCount: 7,
    conceptCount: 193,
    moduleCount: 24,
    sourceCount: 94,
    claimCount: 198
  });
});
