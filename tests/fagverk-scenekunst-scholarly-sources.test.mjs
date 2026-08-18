import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenekunstScholarlySources } from '../scripts/audit-fagverk-scenekunst-scholarly-sources.mjs';

test('Scenekunst scholarly review dekker 20 emner og 60 faktiske claims', () => {
  const r = auditScenekunstScholarlySources();
  assert.equal(r.summary.canonicalEmneCount, 20);
  assert.equal(r.summary.claimCount, 60);
  assert.equal(r.summary.chapterCount, 4);
  assert.equal(r.gates.allCanonicalEmnerScholarlyReviewed, true);
  assert.equal(r.gates.allClaimsScholarlyReviewed, true);
  assert.equal(r.gates.scholarlyCoverageBoundToActualParagraphClaims, true);
});

test('Scenekunst skiller inspectable primærkilder fra scholarly research', () => {
  const r = auditScenekunstScholarlySources();
  assert.ok(r.summary.scholarlySourceCount >= 20);
  assert.ok(r.summary.peerReviewedArticleCount >= 2);
  assert.ok(r.summary.minimumSourcesPerEmne >= 2);
  assert.equal(r.gates.sourceTypeDistinctionExplicit, true);
  assert.equal(r.gates.universityProgrammePagesNotCountedAsResearch, true);
  assert.equal(r.gates.primaryAndScholarlyRolesSeparated, true);
});

test('Hvert Scenekunst-kapittel har selvstendig scholarly breadth', () => {
  const r = auditScenekunstScholarlySources();
  for (const count of Object.values(r.chapterScholarlySourceCounts)) assert.ok(count >= 3);
  assert.equal(r.gates.everyChapterHasScholarlyBreadth, true);
  assert.equal(r.gates.everyEmneHasMultipleScholarlySources, true);
});
