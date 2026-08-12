import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiMentalHealthTopicArticles, clinicalSafetyReviewApproved, clinicalTextHasNoDirectives } from '../scripts/audit-fagverk-psykologi-topic-articles-mental-health-v1.mjs';

test('Psykologi materialiserer eksakt 12/12 selvstendige emneartikler for første canonicale domene', () => {
  const { report } = auditPsykologiMentalHealthTopicArticles({ checkReport: false });
  assert.equal(report.status, 'psykologi_topic_articles_mental_health_complete');
  assert.equal(report.coverage.requiredArticleCount, 12);
  assert.equal(report.coverage.materializedArticleCount, 12);
  assert.equal(report.coverage.exactCanonicalCoverage, true);
  assert.equal(report.coverage.articleIds.length, 12);
  assert.ok(Object.values(report.depth.articleWordCounts).every((count) => count >= 550));
  assert.ok(report.depth.totalEditorialWordCount >= 7000);
  assert.equal(report.evidence.allArticleSourcesResolve, true);
  assert.equal(report.evidence.allArticleClaimsResolve, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Første artikkelbatch er emnespesifikk og låst mot klinisk overreach og AHA-aktivering', () => {
  const { report } = auditPsykologiMentalHealthTopicArticles({ checkReport: false });
  assert.equal(report.gates.allArticlesMeetStructuralDepth, true);
  assert.equal(report.gates.genericCanonicalTemplateWordingAbsent, true);
  assert.equal(report.gates.noClinicalDiagnosticTreatmentOrCoercionOverreach, true);
  assert.equal(report.gates.noAhaRuntimeActivation, true);
  assert.equal(report.evidence.runtimeActivation.referencingFiles.length, 0);
  assert.deepEqual(report.evidence.runtimeActivation.scannedRoots, ['js', 'data/integrations', 'data/historygo', 'data/psychology']);
});

test('klinisk sikkerhetsport avviser direkte diagnose/tvang og krever eksplisitt redaksjonell review', () => {
  assert.equal(clinicalTextHasNoDirectives({ text: 'Pasienten er schizofren og må tvangsinnlegges.' }), false);
  assert.equal(clinicalSafetyReviewApproved({ editorial_review: { status: 'approved_non_clinical_educational_use' } }), false);
});
