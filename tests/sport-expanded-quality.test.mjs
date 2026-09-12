import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSportExpandedQuality } from '../tools/audit-sport-expanded-quality.mjs';

test('Sport whole-subject audit stays fail-closed when expansion proof is absent and no content gap is proven', () => {
  const report = auditSportExpandedQuality();
  assert.equal(report.status, 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN');
  assert.equal(report.canonical_editorial_status_mutated, false);
  assert.equal(report.canonical_editorial_status, 'complete');
  assert.equal(report.quality_status, 'high_quality_complete_without_separate_whole_subject_expansion_proof');
  assert.equal(report.whole_subject_expansion_proven, false);
  assert.equal(report.content_gap_proven, false);
  assert.equal(report.content_rewrite_required, false);
  assert.equal(report.summary.canonicalDomains, 6);
  assert.equal(report.summary.canonicalChapters, 6);
  assert.equal(report.summary.canonicalEmner, 116);
  assert.equal(report.summary.canonicalMethods, 109);
  assert.equal(report.summary.canonicalHooks, 60);
  assert.equal(report.summary.baselineSections, 54);
  assert.equal(report.summary.baselineParagraphs, 162);
  assert.equal(report.summary.baselineClaims, 162);
  assert.equal(report.summary.baselineSources, 74);
  assert.equal(report.summary.standaloneArticles, 116);
  assert.equal(report.summary.strictFields, 6);
  assert.equal(report.summary.theoryObjects, 12);
  assert.equal(report.summary.legacyKnowledgeSections, 10);
  assert.equal(report.summary.legacyCanonicalSupersedes, 9);
  assert.equal(report.summary.legacyMigratedSections, 1);
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
