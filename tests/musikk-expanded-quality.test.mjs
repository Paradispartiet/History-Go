import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMusikkExpandedQuality } from '../tools/audit-musikk-expanded-quality.mjs';
import { auditMusikkSourceRefreshPlaceCaseExpansion } from '../scripts/audit-musikk-source-refresh-place-case-expansion.mjs';

test('Musikk post-completion maintenance proves whole-subject expanded quality across all eight canonical chapters', () => {
  const maintenance = auditMusikkSourceRefreshPlaceCaseExpansion();
  assert.equal(maintenance.status, 'passed');
  assert.equal(maintenance.round, 1);
  assert.equal(maintenance.chapter_count, 8);
  assert.equal(maintenance.canonical_chapter_count, 8);
  assert.equal(maintenance.source_refresh_count, 16);
  assert.equal(maintenance.case_count, 8);
  assert.equal(maintenance.baseline_unique_place_count, 0);
  assert.equal(maintenance.new_unique_place_count, 8);
  assert.equal(maintenance.projected_unique_place_count, 8);
  assert.equal(maintenance.gates.existing_place_only, true);
  assert.equal(maintenance.gates.inference_boundaries_explicit, true);
  assert.equal(maintenance.gates.no_chapter_prose_rewrite, true);

  const report = auditMusikkExpandedQuality();
  assert.equal(report.status, 'PROVEN_WHOLE_SUBJECT_EXPANSION');
  assert.equal(report.canonical_editorial_status_mutated, false);
  assert.equal(report.canonical_editorial_status, 'complete');
  assert.equal(report.quality_status, 'expanded_and_audited');
  assert.equal(report.whole_subject_expansion_proven, true);
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
  assert.equal(report.summary.maintenanceRounds, 1);
  assert.equal(report.summary.reconciledChapters, 8);
  assert.equal(report.summary.maintenanceCases, 8);
  assert.equal(report.summary.sourceRefreshes, 16);
  assert.equal(report.summary.projectedUniquePlaces, 8);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
  assert.equal(report.readOnlyPlanSnapshot.preserved, true);
  assert.equal(report.readOnlyPlanSnapshot.priorWholeSubjectExpansionProven, false);
  assert.equal(report.domains.length, 8);
  assert.ok(report.domains.every((row) =>
    row.strictTheoryProven === true &&
    row.postCompletionSourceCaseExpansionProven === true &&
    row.postCompletionCaseCount === 1 &&
    row.substantiveContentGapProven === false
  ));
});
