import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionUniversityReadiness } from '../scripts/audit-fagverk-religion-university-readiness.mjs';

test('Religion har en låst universitetsmatrise uten for tidlig complete-status', () => {
  const { report } = auditReligionUniversityReadiness();
  assert.equal(report.subject.id, 'religion');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'remaining_religion_area_article_production');
  assert.equal(report.subject.completionGate, 'university_matrix_domain_articles_concepts_sources_and_methods');
  assert.equal(report.subject.completeReady, false);
  assert.deepEqual(report.target, {
    universityAreaCount: 12,
    canonicalTopicCount: 72,
    requiredMethodCount: 18,
    minimumArticleWords: 650
  });
});

test('Religion har fullført første område, men forblir låst på 6/72 og 8/18', () => {
  const { report } = auditReligionUniversityReadiness();
  assert.equal(report.areaStatuses.theory_method, 'complete');
  assert.equal(report.gaps.standaloneTopicArticlesMaterialized, 6);
  assert.equal(report.gaps.standaloneTopicArticlesRemaining, 66);
  assert.equal(report.gaps.universityMethodsMaterialized, 8);
  assert.equal(report.gaps.universityMethodsRemaining, 10);
  assert.equal(report.gates.firstUniversityAreaCompleteAtHighQuality, true);
  assert.equal(report.subject.completeReady, false);
});

test('Religion dekker tolv eksakte områder med seks unike emner hver', () => {
  const { report, readiness } = auditReligionUniversityReadiness();
  assert.equal(Object.keys(report.areaStatuses).length, 12);
  assert.ok(Object.values(readiness.required_topics_by_area).every((topics) => topics.length === 6));
  const topics = Object.values(readiness.required_topics_by_area).flat();
  assert.equal(topics.length, 72);
  assert.equal(new Set(topics).size, 72);
  assert.equal(report.gates.seventyTwoUniqueTopicsLocked, true);
});

test('Religion-completion krever artikler, metoder, kilder, claims og seksdelt kvalitetsport', () => {
  const { report, readiness } = auditReligionUniversityReadiness();
  assert.equal(readiness.topic_article_contract.minimum_documented_cases_or_scenarios, 2);
  assert.equal(readiness.topic_article_contract.generic_template_text_forbidden, true);
  assert.equal(readiness.topic_article_contract.internal_diversity_and_nonessentialism_required, true);
  assert.ok(readiness.completion_contract.requirements.includes('all_72_standalone_topic_articles_materialized_and_sourced'));
  assert.ok(readiness.completion_contract.requirements.includes('all_18_required_methods_materialized_and_linked'));
  assert.ok(readiness.completion_contract.requirements.includes('six_dimension_quality_score_at_least_27_without_critical_flags'));
  assert.equal(report.gates.prematureCompleteStatusBlocked, true);
});
