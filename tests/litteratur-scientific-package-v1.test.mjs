import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

test('Litteratur har synkronisert oversiktslag og kildeførte full-dybde-kapitler', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 28,
    topicCount: 168,
    completeAreaCount: 12,
    fullDepthChapterCount: 11,
    conceptCount: 291,
    moduleCount: 36,
    sourceCount: 142,
    claimCount: 294
  });
});
