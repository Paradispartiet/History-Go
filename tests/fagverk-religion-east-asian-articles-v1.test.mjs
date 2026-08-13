import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionEastAsianArticles } from '../scripts/audit-fagverk-religion-east-asian-articles-v1.mjs';

test('Religion materialiserer Øst-Asias religioner som område 5 med 30/72 artikler', () => {
  const { report } = auditReligionEastAsianArticles({ checkReport: false });
  assert.equal(report.status, 'religion_east_asian_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 5);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 30);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 4800);
});

test('Øst-Asia-batchen har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionEastAsianArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 20);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedSourceCount, 20);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.methods.materializedRequiredMethodCount, 18);
  assert.deepEqual(report.methods.newlyMaterializedMethodIds, [
    'met_religion_spatial_route_and_landscape_analysis',
    'met_religion_digital_ethnography_and_media_analysis'
  ]);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Alle 48 Religion-artikler består egenart og seksdelt 29/30-port uten for tidlig complete', () => {
  const { report } = auditReligionEastAsianArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.allReligionArticleCountReviewed, 48);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
