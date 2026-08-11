import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiUniversityReadiness } from '../scripts/audit-fagverk-psykologi-university-readiness.mjs';

test('Psykologi har en eksplisitt universitetsmatrise uten å miste 6/58-baselinen', () => {
  const { report } = auditPsykologiUniversityReadiness();
  assert.equal(report.status, 'psykologi_university_readiness_in_progress');
  assert.equal(report.subject.editorialStatus, 'expanded_and_audited');
  assert.equal(report.subject.nextGate, 'university_matrix_topic_articles_concept_registry_and_methods');
  assert.equal(report.baseline.domainCount, 6);
  assert.equal(report.baseline.emneCount, 58);
  assert.equal(report.baseline.methodCount, 58);
  assert.equal(report.baseline.chapterCount, 6);
  assert.deepEqual(report.universityCore.map((row) => row.areaId), [
    'biological_psychology',
    'cognitive_psychology',
    'developmental_psychology',
    'social_psychology',
    'personality_psychology',
    'history_science_theory',
    'research_methods_statistics'
  ]);
  assert.ok(Object.values(report.currentGates).every(Boolean));
});

test('Psykologi kan ikke bli complete før emneartikler, begreper og metode/statistikk er ferdige', () => {
  const { report } = auditPsykologiUniversityReadiness();
  assert.equal(report.completeReady, false);
  assert.equal(report.methodsStatistics.requiredTopicCount, 20);
  assert.equal(report.methodsStatistics.complete, false);
  assert.equal(report.topicArticles.requiredCount, 58);
  assert.ok(report.topicArticles.completeCount < 58);
  assert.equal(report.topicArticles.complete, false);
  assert.equal(report.concepts.complete, false);
  assert.equal(report.completionGates.allRequiredUniversityCoreAreasComplete, false);
  assert.equal(report.completionGates.researchMethodsStatisticsBranchComplete, false);
  assert.equal(report.completionGates.all58StandaloneTopicArticlesComplete, false);
  assert.equal(report.completionGates.canonicalConceptRegistryComplete, false);
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('university_core:biological_psychology:')));
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('university_core:personality_psychology:')));
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('university_core:research_methods_statistics:')));
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('standalone_topic_articles:')));
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('canonical_concept_registry:')));
});
