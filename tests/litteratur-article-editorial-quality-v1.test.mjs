import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturArticleEditorialQuality } from '../scripts/audit-litteratur-article-editorial-quality-v1.mjs';

test('bare faktisk omskrevne litteraturområder passerer redaksjonell artikkelport', () => {
  assert.deepEqual(auditLitteraturArticleEditorialQuality(), {
    areaCount: 3,
    articleCount: 18,
    paragraphCount: 126,
    pendingAreaCount: 25
  });
});
