import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionLivedIdentityMigrationArticles } from '../scripts/audit-fagverk-religion-lived-identity-migration-articles-v1.mjs';

test('Religion bevarer levd religion, identitet og migrasjon som område 10 når totalen er 72/72 artikler', () => {
  const { report } = auditReligionLivedIdentityMigrationArticles({ checkReport: false });
  assert.equal(report.status, 'religion_lived_identity_migration_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 10);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 60);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 5400);
});

test('Levd religion, identitet og migrasjon har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionLivedIdentityMigrationArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 20);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedSourceCount, 20);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.methods.materializedRequiredMethodCount, 18);
  assert.deepEqual(report.methods.requiredAreaMethodIds, [
    'met_religion_ethnographic_observation',
    'met_religion_qualitative_interview',
    'met_religion_research_ethics_privacy_and_representation'
  ]);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Alle 72 Religion-artikler består egenart og seksdelt 29/30-port uten for tidlig complete', () => {
  const { report } = auditReligionLivedIdentityMigrationArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.allReligionArticleCountReviewed, 72);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
