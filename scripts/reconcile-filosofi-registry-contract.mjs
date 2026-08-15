import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const fail = (message) => {
  throw new Error(`Philosophy registry reconciliation refused: ${message}`);
};

const registryPath = 'data/fagverk/fagverk_registry.json';
const coveragePath = 'data/fagverk/filosofi/filosofi_field_coverage_v1.json';
const completionPath = 'data/fagverk/filosofi/filosofi_completion_v1.json';

const registry = load(registryPath);
const coverage = load(coveragePath);
const completion = load(completionPath);
const subject = registry.subjects?.filosofi;
const E = coverage.expected_counts;

if (!subject) fail('data/fagverk/fagverk_registry.json has no subjects.filosofi entry');
if (!E) fail('field coverage contract has no expected_counts');
if (coverage.status !== 'major_university_fields_complete') fail(`coverage status is ${coverage.status}`);
if (coverage.complete_ready !== true) fail('field coverage is not complete_ready');
if (completion.complete_ready !== true) fail('completion audit is not complete_ready');
if (completion.reviewed_article_count !== E.articles) {
  fail(`completion reviewed_article_count=${completion.reviewed_article_count}, expected ${E.articles}`);
}
if (completion.remaining_university_review_count !== 0) {
  fail(`completion still reports ${completion.remaining_university_review_count} university reviews remaining`);
}
if (subject.chapters?.length !== E.chapters) {
  fail(`registry has ${subject.chapters?.length ?? 'no'} chapters, expected ${E.chapters}`);
}

subject.editorialPlan ??= {};
subject.editorialPlan.targetChapterCount = E.chapters;
subject.editorialPlan.completionRequirements = [
  `all_${E.domains}_canonical_domains_covered`,
  `all_${E.articles}_canonical_emners_have_standalone_articles`,
  `all_${E.concepts}_canonical_concepts_written_out`,
  `all_${E.articles}_articles_pass_substantive_university_review`,
  `all_${E.methods}_canonical_methods_materialized`,
  `all_${E.hooks}_topic_hooks_materialized`,
  `all_${E.chapters}_chapters_registered`,
  'article_specific_real_argument_and_rival',
  'primary_work_grounding_where_applicable',
  'topic_specific_secondary_sources',
  'no_generic_argument_template_as_quality_evidence',
  'full_subject_audit_green'
];
subject.editorialPlan.nextGate = 'maintenance_source_refresh_and_place_case_expansion';

subject.qualityRemediation = {
  ...(subject.qualityRemediation ?? {}),
  status: 'complete',
  standard: completion.quality_standard,
  reviewedArticleCount: E.articles,
  totalArticleCount: E.articles,
  remainingArticleCount: 0
};

fs.writeFileSync(path.join(ROOT, registryPath), `${JSON.stringify(registry, null, 2)}\n`);
console.log(JSON.stringify({
  subject: 'filosofi',
  status: subject.qualityRemediation.status,
  standard: subject.qualityRemediation.standard,
  reviewed: subject.qualityRemediation.reviewedArticleCount,
  total: subject.qualityRemediation.totalArticleCount,
  remaining: subject.qualityRemediation.remainingArticleCount,
  expected: E
}, null, 2));
