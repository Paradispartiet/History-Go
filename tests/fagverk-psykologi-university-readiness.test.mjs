import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPsykologiUniversityReadiness,
  expectedSubjectState,
  sourceIsInspectable,
  validatedSourceIndex,
  sourcedDocumentCoverage
} from '../scripts/audit-fagverk-psykologi-university-readiness.mjs';

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

test('Fem basalområder samt metode/statistikk er ferdige, mens øvrige universitetsporter holder complete tilbake', () => {
  const { report } = auditPsykologiUniversityReadiness();
  assert.equal(report.completeReady, false);
  assert.equal(report.biologicalPsychology.requiredTopicCount, 15);
  assert.equal(report.biologicalPsychology.materializedTopicCount, 15);
  assert.equal(report.biologicalPsychology.sourceCount, 8);
  assert.deepEqual(report.biologicalPsychology.familyCounts, {
    cellular_systems: 4,
    development_variation: 3,
    regulation_behavior: 6,
    methods_inference: 2
  });
  assert.equal(report.biologicalPsychology.auditComplete, true);
  assert.equal(report.biologicalPsychology.complete, true);
  assert.equal(report.completionGates.biologicalPsychologyBranchComplete, true);
  assert.equal(report.cognitivePsychology.requiredTopicCount, 17);
  assert.equal(report.cognitivePsychology.materializedTopicCount, 17);
  assert.equal(report.cognitivePsychology.sourceCount, 14);
  assert.deepEqual(report.cognitivePsychology.familyCounts, {
    perception_attention: 4,
    memory_learning: 4,
    language_representation: 4,
    reasoning_decision_control: 5
  });
  assert.equal(report.cognitivePsychology.auditComplete, true);
  assert.equal(report.cognitivePsychology.complete, true);
  assert.equal(report.completionGates.cognitivePsychologyBranchComplete, true);
  assert.equal(report.developmentalPsychology.requiredTopicCount, 20);
  assert.equal(report.developmentalPsychology.materializedTopicCount, 20);
  assert.equal(report.developmentalPsychology.sourceCount, 19);
  assert.deepEqual(report.developmentalPsychology.familyCounts, {
    foundations_methods: 5,
    early_development: 5,
    childhood_adolescence: 5,
    adulthood_aging_context: 5
  });
  assert.equal(report.developmentalPsychology.auditComplete, true);
  assert.equal(report.developmentalPsychology.complete, true);
  assert.equal(report.completionGates.developmentalPsychologyBranchComplete, true);
  assert.equal(report.socialPsychology.requiredTopicCount, 20);
  assert.equal(report.socialPsychology.materializedTopicCount, 20);
  assert.equal(report.socialPsychology.sourceCount, 22);
  assert.deepEqual(report.socialPsychology.familyCounts, {
    social_cognition_attitudes: 5,
    influence_groups_power: 5,
    relations_cooperation_conflict: 5,
    intergroup_methods_context: 5
  });
  assert.equal(report.socialPsychology.auditComplete, true);
  assert.equal(report.socialPsychology.complete, true);
  assert.equal(report.completionGates.socialPsychologyBranchComplete, true);
  assert.equal(report.personalityPsychology.requiredTopicCount, 16);
  assert.equal(report.personalityPsychology.materializedTopicCount, 16);
  assert.equal(report.personalityPsychology.sourceCount, 11);
  assert.deepEqual(report.personalityPsychology.familyCounts, {
    structure_models: 4,
    person_context_development: 4,
    origins_culture: 4,
    measurement_inference: 4
  });
  assert.equal(report.personalityPsychology.auditComplete, true);
  assert.equal(report.personalityPsychology.complete, true);
  assert.equal(report.completionGates.personalityPsychologyBranchComplete, true);
  assert.equal(report.methodsStatistics.requiredTopicCount, 20);
  assert.equal(report.methodsStatistics.materializedTopicCount, 20);
  assert.equal(report.methodsStatistics.sourceCount, 7);
  assert.deepEqual(report.methodsStatistics.familyCounts, {
    design: 6,
    sampling_measurement: 4,
    statistics: 6,
    inference_integrity: 4
  });
  assert.equal(report.methodsStatistics.auditComplete, true);
  assert.equal(report.methodsStatistics.complete, true);
  assert.equal(report.completionGates.researchMethodsStatisticsBranchComplete, true);
  assert.equal(report.topicArticles.requiredCount, 58);
  assert.ok(report.topicArticles.completeCount < 58);
  assert.equal(report.topicArticles.complete, false);
  assert.equal(report.concepts.complete, false);
  assert.ok(report.sourceRegistry.registeredCount >= 122);
  assert.equal(report.sourceRegistry.validCount, report.sourceRegistry.registeredCount);
  assert.equal(report.completionGates.allRequiredUniversityCoreAreasComplete, false);
  assert.equal(report.completionGates.all58StandaloneTopicArticlesComplete, false);
  assert.equal(report.completionGates.canonicalConceptRegistryComplete, false);
  assert.ok(!report.blockersToComplete.some((item) => item.startsWith('university_core:biological_psychology:')));
  assert.ok(!report.blockersToComplete.some((item) => item.startsWith('university_core:cognitive_psychology:')));
  assert.ok(!report.blockersToComplete.some((item) => item.startsWith('university_core:developmental_psychology:')));
  assert.ok(!report.blockersToComplete.some((item) => item.startsWith('university_core:social_psychology:')));
  assert.ok(!report.blockersToComplete.some((item) => item.startsWith('university_core:personality_psychology:')));
  assert.ok(!report.blockersToComplete.some((item) => item.startsWith('university_core:research_methods_statistics:')));
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('standalone_topic_articles:')));
  assert.ok(report.blockersToComplete.some((item) => item.startsWith('canonical_concept_registry:')));
});

test('vilkårlige source_ids kan ikke gjøre en artikkel eller et begrep komplett', () => {
  const requiredFields = ['emne_id', 'title', 'source_ids'];
  const base = { emne_id: 'em_psy_test', title: 'Test', source_ids: ['src-finnes-ikke'] };
  const unresolved = sourcedDocumentCoverage([base], {
    requiredIds: new Set(['em_psy_test']),
    idField: 'emne_id',
    requiredFields,
    validSourceIds: new Set(['src-verifisert'])
  });
  assert.equal(unresolved.completeCount, 0);
  assert.equal(unresolved.invalidSourceReferenceCount, 1);

  const resolved = sourcedDocumentCoverage([{ ...base, source_ids: ['src-verifisert'] }], {
    requiredIds: new Set(['em_psy_test']),
    idField: 'emne_id',
    requiredFields,
    validSourceIds: new Set(['src-verifisert'])
  });
  assert.equal(resolved.completeCount, 1);
  assert.equal(resolved.invalidSourceReferenceCount, 0);
});

test('kilderegisteret avviser manglende ID og håndhever URL-regler per kildetype', () => {
  const requiredFields = ['id', 'publisher', 'title', 'url', 'source_location', 'type'];
  const source = { id: 'src-test', publisher: 'Test', title: 'Test', source_location: 'Test', type: 'peer_reviewed_article' };
  assert.throws(() => validatedSourceIndex([{ ...source, id: undefined, url: 'https://example.org' }], requiredFields), /uten id/);
  assert.equal(sourceIsInspectable({ ...source, url: 'data/fagverk/subject_status.json' }, requiredFields), false);
  assert.equal(sourceIsInspectable({ ...source, url: 'https://example.org' }, requiredFields), true);

  const internal = { ...source, type: 'internal_place_record' };
  assert.equal(sourceIsInspectable({ ...internal, url: 'https://example.org' }, requiredFields), false);
  assert.equal(sourceIsInspectable({ ...internal, url: 'data/fagverk/subject_status.json' }, requiredFields), true);
});

test('universitetsporten har en gyldig overgang til endelig complete-status', () => {
  const contract = {
    required_editorial_status_before_final_gate: 'expanded_and_audited',
    final_editorial_status: 'complete',
    next_gate: 'university_matrix_topic_articles_concept_registry_and_methods',
    final_next_gate: 'maintenance_source_refresh_and_place_case_expansion',
    final_matrix_status: 'complete'
  };
  assert.deepEqual(expectedSubjectState(false, contract), {
    editorialStatus: 'expanded_and_audited',
    nextGate: 'university_matrix_topic_articles_concept_registry_and_methods',
    matrixStatus: 'expansion_required_before_complete'
  });
  assert.deepEqual(expectedSubjectState(true, contract), {
    editorialStatus: 'complete',
    nextGate: 'maintenance_source_refresh_and_place_case_expansion',
    matrixStatus: 'complete'
  });
});
