import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturArticleEditorialQuality } from '../scripts/audit-litteratur-article-editorial-quality-v1.mjs';

test('bare faktisk omskrevne litteraturområder passerer redaksjonell artikkelport', () => {
  assert.deepEqual(auditLitteraturArticleEditorialQuality(), {
    areaCount: 15,
    articleCount: 90,
    paragraphCount: 666,
    pendingAreaCount: 13
  });
});
