import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionHistoryComparisonArticles } from '../scripts/audit-fagverk-religion-history-comparison-articles-v1.mjs';

test('Religion materialiserer religionshistorie og sammenligning som område 2 med 12/72 artikler', () => {
  const { report } = auditReligionHistoryComparisonArticles({ checkReport: false });
  assert.equal(report.status, 'religion_history_comparison_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 2);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 12);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 4800);
});

test('Religion history/comparison har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionHistoryComparisonArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 20);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedSourceCount, 20);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.evidence.allClaimsResolve, true);
  assert.equal(report.evidence.allSourcesResolve, true);
  assert.equal(report.methods.materializedRequiredMethodCount, 14);
  assert.deepEqual(report.methods.newlyMaterializedMethodIds, [
    'met_religion_historical_source_criticism',
    'met_religion_material_visual_and_architectural_analysis'
  ]);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Historikkbatchen består fortsatt når alle 24 Religion-artikler revideres samlet', () => {
  const { report } = auditReligionHistoryComparisonArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.allReligionArticleCountReviewed, 24);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.quality.dimensions).every((score) => score >= 4));
  assert.deepEqual(report.quality.criticalFlags, []);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
