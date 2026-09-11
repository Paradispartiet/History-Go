import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMusikkExpandedQuality } from '../tools/audit-musikk-expanded-quality.mjs';

test('Musikk whole-subject audit stays fail-closed when expansion proof is absent and no content gap is proven', () => {
  const report = auditMusikkExpandedQuality();
  assert.equal(report.status, 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN');
  assert.equal(report.canonical_editorial_status_mutated, false);
  assert.equal(report.canonical_editorial_status, 'complete');
  assert.equal(report.quality_status, 'high_quality_complete_without_separate_whole_subject_expansion_proof');
  assert.equal(report.whole_subject_expansion_proven, false);
  assert.equal(report.content_gap_proven, false);
  assert.equal(report.content_rewrite_required, false);
  assert.equal(report.summary.canonicalDomains, 8);
  assert.equal(report.summary.canonicalChapters, 8);
  assert.equal(report.summary.canonicalEmner, 48);
  assert.equal(report.summary.canonicalMethods, 18);
  assert.equal(report.summary.baselineClaims, 55);
  assert.equal(report.summary.baselineSources, 67);
  assert.equal(report.summary.baselineParagraphs, 216);
  assert.equal(report.summary.baselineUniquePlaces, 0);
  assert.equal(report.summary.strictFields, 8);
  assert.equal(report.summary.theoryObjects, 16);
  assert.equal(report.summary.legacyKnowledgeSections, 8);
  assert.equal(report.summary.legacyCanonicalSupersedes, 8);
  assert.equal(report.summary.legacyMigratedSections, 0);
  assert.equal(report.summary.postCompletionExpansionArtifacts, 0);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
  assert.equal(report.readOnlyPlanSnapshot.preserved, true);
  assert.equal(report.readOnlyPlanSnapshot.priorWholeSubjectExpansionProven, false);
  assert.equal(report.domains.length, 8);
  assert.ok(report.domains.every((row) =>
    row.strictTheoryProven === true &&
    row.separatePostCompletionExpansionEvidence === false &&
    row.substantiveContentGapProven === false
  ));
});
