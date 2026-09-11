import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditLitteraturExpandedArticleRequirements } from '../scripts/audit-litteratur-article-editorial-quality-v1.mjs';
import { auditLitteraturExpandedQuality } from '../tools/audit-litteratur-expanded-quality.mjs';

const REQUIRED_RULES = [
  'whole_subject_editorial_expansion_required',
  'all_canonical_areas_must_be_editorial_ready',
  'all_canonical_topics_must_be_editorial_ready',
  'every_article_must_pass_expanded_requirement_review',
  'strict_theory_integrity_required_per_major_field',
  'specialized_full_field_contracts_are_additional_depth_not_universal_denominator',
  'missing_specialized_wrapper_is_not_a_content_gap_when_universal_editorial_and_strict_gates_pass',
  'content_rewrite_allowed_only_for_proven_substantive_gap',
  'quality_status_is_separate_from_global_editorial_lifecycle',
  'global_subject_lifecycle_is_read_only_for_this_reconciliation',
  'all_declared_rules_and_required_gates_are_enforced'
];

test('Litteratur proves whole-subject expanded quality without mutating global lifecycle status', () => {
  const r = auditLitteraturExpandedQuality({ checkReport: true });
  assert.equal(r.subject_id, 'litteratur');
  assert.equal(r.status, 'PROVEN_WHOLE_SUBJECT_EXPANSION');
  assert.equal(r.canonical_editorial_status_mutated, false);
  assert.equal(r.internal_editorial_status, 'editorial_ready_complete');
  assert.equal(r.quality_status, 'expanded_and_audited');
  assert.equal(r.summary.canonicalAreas, 28);
  assert.equal(r.summary.canonicalTopics, 168);
  assert.equal(r.summary.editorialReadyAreas, 28);
  assert.equal(r.summary.editorialReadyTopics, 168);
  assert.equal(r.summary.fullyReviewedArticles, 168);
  assert.equal(r.summary.articleRequirementDimensions, 8);
  assert.equal(r.summary.articleRequirementGaps, 0);
  assert.equal(r.summary.rewritePendingAreas, 0);
  assert.equal(r.summary.rewritePendingTopics, 0);
  assert.equal(r.summary.assessedArticles, 168);
  assert.equal(r.summary.assessmentQuestions, 140);
  assert.equal(r.summary.assessmentSources, 384);
  assert.equal(r.summary.strictFields, 28);
  assert.equal(r.summary.specializedFullFieldAreas, 18);
  assert.equal(r.summary.legacyEditorialExpansionAreas, 10);
  assert.equal(r.summary.substantiveContentGapsProven, 0);
  assert.equal(r.specializedFullFieldAreaIds.length, 18);
  assert.equal(r.legacyEditorialExpansionAreaIds.length, 10);

  const status = JSON.parse(fs.readFileSync(new URL('../data/fagverk/subject_status.json', import.meta.url), 'utf8'));
  const litteratur = status.subjects.find((row) => row.id === 'litteratur');
  assert.equal(litteratur.editorialStatus, 'complete');
  assert.equal(litteratur.nextGate, 'maintenance_and_source_refresh');
});

test('expanded proof is fail-closed over all 168 article requirement reviews', () => {
  const review = auditLitteraturExpandedArticleRequirements();
  assert.equal(review.articleCount, 168);
  assert.equal(review.fullyReviewedArticleCount, 168);
  assert.equal(review.articleRequirementGapCount, 0);
  assert.equal(review.requiredDimensions, 8);
  assert.equal(review.reviews.length, 168);
  for (const article of review.reviews) {
    assert.equal(article.missing.length, 0, `${article.topicId}: ${article.missing.join(', ')}`);
    assert.deepEqual(Object.keys(article.requirements), [
      'precise_definition',
      'historical_or_systemic_background',
      'theories_researchers_and_findings',
      'methods_and_limitations',
      'boundaries_and_disagreements',
      'documented_cases_or_teaching_scenarios',
      'key_questions',
      'resolved_source_and_claim_ids'
    ]);
    assert.equal(Object.values(article.requirements).every(Boolean), true, `${article.topicId}: minst én artikkeldimensjon er falsk`);
    assert.ok(article.evidence.declaredCaseEvidence.length >= 2, `${article.topicId}: færre enn to deklarerte case/scenario-evidenser`);
    assert.ok(article.evidence.claimIds.length >= 4, `${article.topicId}: for få løste claims`);
    assert.ok(article.evidence.sourceIds.length >= 2, `${article.topicId}: for få løste kilder`);
  }
});

test('expanded contract declares and enforces every rule and required gate', () => {
  const contract = JSON.parse(fs.readFileSync(new URL('../data/fag/litteratur/litteraturvitenskap_canonical_v1/expanded_quality_contract_v1.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(contract.rules), REQUIRED_RULES);
  for (const rule of REQUIRED_RULES) assert.equal(contract.rules[rule], true, `${rule} er ikke fail-closed true`);
  assert.deepEqual(contract.required_gates, [
    'docs/LITTERATUR_ARTICLE_EDITORIAL_CONTRACT_V1.md',
    'scripts/audit-litteratur-article-editorial-quality-v1.mjs',
    'tools/audit-litteratur-theory-integrity.mjs',
    'scripts/audit-litteratur-assessment-v1.mjs',
    'tools/audit-litteratur-expanded-quality.mjs',
    'tests/litteratur-article-editorial-quality-v1.test.mjs',
    'tests/litteratur-expanded-quality.test.mjs'
  ]);
  assert.equal(contract.expected.fully_reviewed_articles, 168);
  assert.equal(contract.expected.article_requirement_gaps, 0);
  assert.equal(contract.expected.article_requirement_dimensions, 8);
});
