import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByExpandedQuality } from '../tools/audit-by-expanded-quality.mjs';

test('By proves whole-subject expanded quality without rewriting content', () => {
  const report = auditByExpandedQuality();
  assert.equal(report.status, 'PROVEN_WHOLE_SUBJECT_EXPANSION');
  assert.equal(report.canonical_editorial_status_mutated, false);
  assert.equal(report.canonical_editorial_status, 'complete');
  assert.equal(report.quality_status, 'expanded_and_audited');
  assert.equal(report.content_rewrite_required, false);
  assert.equal(report.summary.canonicalDomains, 12);
  assert.equal(report.summary.canonicalChapters, 17);
  assert.equal(report.summary.canonicalEmner, 82);
  assert.equal(report.summary.reconciledChapters, 17);
  assert.equal(report.summary.maintenanceCases, 17);
  assert.equal(report.summary.sourceRefreshes, 36);
  assert.equal(report.summary.strictFields, 12);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
  assert.equal(report.readOnlyPlanSnapshot.preserved, true);
  assert.equal(report.readOnlyPlanSnapshot.priorWholeSubjectExpansionProven, false);
  assert.equal(report.domains.length, 12);
  assert.ok(report.domains.every((row) =>
    row.strictTheoryProven === true &&
    row.postCompletionSourceCaseExpansionProven === true &&
    row.postCompletionCaseCount === row.chapterCount &&
    row.substantiveContentGapProven === false
  ));
});
