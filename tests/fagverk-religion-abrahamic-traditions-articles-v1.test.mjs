import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionAbrahamicTraditionsArticles } from '../scripts/audit-fagverk-religion-abrahamic-traditions-articles-v1.mjs';

test('Religion materialiserer jødedom, kristendom og islam som område 3 med 18/72 artikler', () => {
  const { report } = auditReligionAbrahamicTraditionsArticles({ checkReport: false });
  assert.equal(report.status, 'religion_abrahamic_traditions_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 3);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 18);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 4800);
});

test('Religion Abrahamic traditions har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionAbrahamicTraditionsArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 20);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedSourceCount, 20);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.evidence.allClaimsResolve, true);
  assert.equal(report.evidence.allSourcesResolve, true);
  assert.equal(report.methods.materializedRequiredMethodCount, 12);
  assert.deepEqual(report.methods.newlyMaterializedMethodIds, [
    'met_religion_ritual_and_performance_analysis',
    'met_religion_sociological_institutional_analysis'
  ]);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Alle atten Religion-artikler består egenart og seksdelt 29/30-port uten for tidlig complete', () => {
  const { report } = auditReligionAbrahamicTraditionsArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.allReligionArticleCountReviewed, 18);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.quality.dimensions).every((score) => score >= 4));
  assert.deepEqual(report.quality.criticalFlags, []);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
