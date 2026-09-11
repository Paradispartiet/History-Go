import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMediaExpandedQuality } from '../tools/audit-media-expanded-quality.mjs';

test('Media whole-subject audit stays fail-closed when expansion proof is absent and no content gap is proven', () => {
  const report = auditMediaExpandedQuality();
  assert.equal(report.status, 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN');
  assert.equal(report.canonical_editorial_status_mutated, false);
  assert.equal(report.canonical_editorial_status, 'complete');
  assert.equal(report.quality_status, 'high_quality_complete_without_separate_whole_subject_expansion_proof');
  assert.equal(report.whole_subject_expansion_proven, false);
  assert.equal(report.content_gap_proven, false);
  assert.equal(report.content_rewrite_required, false);
  assert.equal(report.summary.canonicalDomains, 6);
  assert.equal(report.summary.canonicalChapters, 6);
  assert.equal(report.summary.canonicalEmner, 120);
  assert.equal(report.summary.canonicalMethods, 115);
  assert.equal(report.summary.strictFields, 6);
  assert.equal(report.summary.theoryObjects, 12);
  assert.equal(report.summary.legacyKnowledgeSections, 10);
  assert.equal(report.summary.legacyCanonicalSupersedes, 10);
  assert.equal(report.summary.legacyMigratedSections, 0);
  assert.equal(report.summary.postCompletionExpansionArtifacts, 0);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
  assert.equal(report.readOnlyPlanSnapshot.preserved, true);
  assert.equal(report.readOnlyPlanSnapshot.priorWholeSubjectExpansionProven, false);
  assert.equal(report.domains.length, 6);
  assert.ok(report.domains.every((row) =>
    row.strictTheoryProven === true &&
    row.separatePostCompletionExpansionEvidence === false &&
    row.substantiveContentGapProven === false
  ));
});
