import test from 'node:test';
import assert from 'node:assert/strict';
import { auditKunstExpandedQuality } from '../tools/audit-kunst-expanded-quality.mjs';

test('Kunst proves whole-subject expanded quality without rewriting content', () => {
  const report = auditKunstExpandedQuality();
  assert.equal(report.status, 'PROVEN_WHOLE_SUBJECT_EXPANSION');
  assert.equal(report.canonical_editorial_status_mutated, false);
  assert.equal(report.canonical_editorial_status, 'complete');
  assert.equal(report.quality_status, 'expanded_and_audited');
  assert.equal(report.content_rewrite_required, false);
  assert.equal(report.summary.canonicalDomains, 6);
  assert.equal(report.summary.canonicalChapters, 6);
  assert.equal(report.summary.canonicalEmner, 21);
  assert.equal(report.summary.reconciledChapters, 6);
  assert.equal(report.summary.maintenanceCases, 6);
  assert.equal(report.summary.sourceRefreshes, 12);
  assert.equal(report.summary.projectedUniquePlaces, 17);
  assert.equal(report.summary.strictFields, 6);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
  assert.equal(report.readOnlyPlanSnapshot.preserved, true);
  assert.equal(report.readOnlyPlanSnapshot.priorWholeSubjectExpansionProven, false);
  assert.equal(report.domains.length, 6);
  assert.ok(report.domains.every((row) =>
    row.strictTheoryProven === true &&
    row.postCompletionSourceCaseExpansionProven === true &&
    row.postCompletionCaseCount === row.chapterCount &&
    row.substantiveContentGapProven === false
  ));
});
