import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionSecularNewMediaArticles } from '../scripts/audit-fagverk-religion-secular-new-media-articles-v1.mjs';

test('Religion materialiserer ikke-religion, nye religioner og medier som område 11 med 66/72 artikler', () => {
  const { report } = auditReligionSecularNewMediaArticles({ checkReport: false });
  assert.equal(report.status, 'religion_secular_new_media_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 11);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 66);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 5400);
});

test('Ikke-religion, nye religioner og medier har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionSecularNewMediaArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 20);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedSourceCount, 20);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.methods.materializedRequiredMethodCount, 18);
  assert.deepEqual(report.methods.requiredAreaMethodIds, [
    'met_religion_discourse_and_content_analysis',
    'met_religion_digital_ethnography_and_media_analysis',
    'met_religion_sociological_institutional_analysis'
  ]);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Alle 66 Religion-artikler består egenart og seksdelt 29/30-port uten for tidlig complete', () => {
  const { report } = auditReligionSecularNewMediaArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.allReligionArticleCountReviewed, 66);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
