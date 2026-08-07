import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturArticleEditorialQuality } from '../scripts/audit-litteratur-article-editorial-quality-v1.mjs';

test('bare faktisk omskrevne litteraturområder passerer redaksjonell artikkelport', () => {
  assert.deepEqual(auditLitteraturArticleEditorialQuality(), {
    areaCount: 23,
    articleCount: 138,
    paragraphCount: 1050,
    pendingAreaCount: 5
  });
});
