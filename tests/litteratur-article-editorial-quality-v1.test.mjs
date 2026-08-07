import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturArticleEditorialQuality } from '../scripts/audit-litteratur-article-editorial-quality-v1.mjs';

test('bare faktisk omskrevne litteraturområder passerer redaksjonell artikkelport', () => {
  assert.deepEqual(auditLitteraturArticleEditorialQuality(), {
    areaCount: 19,
    articleCount: 114,
    paragraphCount: 858,
    pendingAreaCount: 9
  });
});
