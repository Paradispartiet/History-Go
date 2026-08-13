import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionRitualMaterialitySpaceArticles } from '../scripts/audit-fagverk-religion-ritual-materiality-space-articles-v1.mjs';

test('Religion materialiserer ritual, materialitet og hellige rom som område 7 med 42/72 artikler', () => {
  const { report } = auditReligionRitualMaterialitySpaceArticles({ checkReport: false });
  assert.equal(report.status, 'religion_ritual_materiality_space_articles_complete');
  assert.equal(report.coverage.materializedArticleCount, 6);
  assert.equal(report.coverage.completedUniversityAreaCount, 7);
  assert.equal(report.coverage.totalUniversityAreaCount, 12);
  assert.equal(report.coverage.completedTopicCount, 42);
  assert.equal(report.coverage.totalTopicCount, 72);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 650));
  assert.ok(report.depth.totalEditorialWordCount >= 4800);
});

test('Ritual, materialitet og hellige rom-batchen har full claim-, kilde-, metode- og scenariointegritet', () => {
  const { report } = auditReligionRitualMaterialitySpaceArticles({ checkReport: false });
  assert.equal(report.evidence.registeredSourceCount, 20);
  assert.equal(report.evidence.registeredClaimCount, 36);
  assert.equal(report.evidence.usedSourceCount, 20);
  assert.equal(report.evidence.usedClaimCount, 36);
  assert.equal(report.methods.materializedRequiredMethodCount, 18);
  assert.deepEqual(report.methods.requiredAreaMethodIds, [
    'met_religion_ritual_and_performance_analysis',
    'met_religion_material_visual_and_architectural_analysis',
    'met_religion_spatial_route_and_landscape_analysis'
  ]);
  assert.ok(Object.values(report.depth.scenarioCounts).every((count) => count >= 2));
});

test('Alle 54 Religion-artikler består egenart og seksdelt 29/30-port uten for tidlig complete', () => {
  const { report } = auditReligionRitualMaterialitySpaceArticles({ checkReport: false });
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.editorial.allReligionArticleCountReviewed, 54);
  assert.equal(report.editorial.exactParagraphDuplicates, 0);
  assert.ok(report.editorial.maximumFiveGramJaccard < 0.12);
  assert.equal(report.quality.total, 29);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
