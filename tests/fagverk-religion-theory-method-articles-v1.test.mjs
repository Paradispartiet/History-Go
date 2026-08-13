import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionTheoryMethodArticles } from '../scripts/audit-fagverk-religion-theory-method-articles-v1.mjs';

test('Religion materialiserer eksakt første universitetsområde med 6/72 artikler', () => {
  const { report } = auditReligionTheoryMethodArticles({ checkReport: false });
  assert.equal(report.status, 'religion_theory_method_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 1);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 6);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 5200);
});

test('Religion theory/method har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionTheoryMethodArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 15);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.evidence.allClaimsResolve, true);
  assert.equal(report.evidence.allSourcesResolve, true);
  assert.equal(report.methods.materializedRequiredMethodCount, 8);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Religion theory/method består redaksjonell egenart og seksdelt 29/30-port uten for tidlig complete', () => {
  const { report } = auditReligionTheoryMethodArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.quality.dimensions).every((score) => score >= 4));
  assert.deepEqual(report.quality.criticalFlags, []);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
