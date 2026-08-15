import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const coverage = json('data/fagverk/filosofi/filosofi_field_coverage_v1.json');
const fagkart = json('data/fag/filosofi/fagkart_filosofi_canonical_v1.json');
const pensum = json('data/fag/filosofi/filosofipensum_canonical_v1.json');
const emner = json('data/fag/filosofi/emner_filosofi_canonical_v1.json');
const concepts = json('data/fag/filosofi/begreper_filosofi_canonical_v2.json');
const methods = json('data/fag/filosofi/methods_filosofi_canonical_v1.json');
const registry = json('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const completion = json('data/fagverk/filosofi/filosofi_completion_v1.json');
const fagverkRegistry = json('data/fagverk/fagverk_registry.json');
const philosophyRegistry = fagverkRegistry.subjects.filosofi;
const articles = new Map(registry.articles.map((r) => [r.id, json(r.file)]));
const domainIds = new Set(fagkart.categories.map((x) => x.id));
const E = coverage.expected_counts;

test('major-university-field benchmark er eksplisitt, kildeført og ærlig avgrenset', () => {
  assert.equal(coverage.status, 'major_university_fields_complete');
  assert.match(coverage.benchmark.primary.url, /^https:\/\/www\.philosophy\.ox\.ac\.uk\//);
  assert.match(coverage.scope_definition, /major university fields/i);
  assert.match(coverage.scope_definition, /ikke at enhver mulig forskningsnisje/i);
  assert.match(coverage.excluded_scope, /micro-specialties/i);
  assert.equal(coverage.fields.every((x) => x.coverage === 'covered' && x.domain_ids.length >= 1), true);
  for (const field of coverage.fields) {
    for (const id of field.domain_ids) {
      assert.ok(domainIds.has(id), `benchmarkfelt ${field.field_id} peker til ukjent ${id}`);
    }
  }
});

test('de syv tidligere hullene er egne canonicale hovedområder med universitetsdybde', () => {
  assert.deepEqual(coverage.newly_closed_gaps.sort(), [
    'fysikkfilosofi',
    'handlingsfilosofi',
    'matematikkfilosofi',
    'religionsfilosofi',
    'rettsfilosofi',
    'sannsynlighet_beslutning',
    'sprakfilosofi'
  ]);
  for (const id of coverage.newly_closed_gaps) {
    const cat = fagkart.categories.find((x) => x.id === id);
    assert.ok(cat, `${id} mangler fagområde`);
    assert.equal(cat.emne_ids.length, 2, `${id} skal ha to selvstendige emner`);
    assert.equal(cat.topic_hooks.length, 2, `${id} skal ha to hooks`);
    const module = pensum.modules.find((x) => x.emner?.some((e) => cat.emne_ids.includes(e)));
    assert.ok(module, `${id} mangler pensummodul`);
    for (const emneId of cat.emne_ids) {
      const art = articles.get(emneId);
      assert.ok(art, `${emneId} mangler artikkel`);
      assert.equal(art.editorial_quality, 'university_depth_reviewed');
      assert.equal(art.university_quality?.reviewed_against_university_gate ?? true, true);
      assert.equal(art.university_quality?.real_rival, true);
      assert.equal(art.source_ids.length >= 3, true);
    }
  }
});

test('feltbenchmarkens forventede tall matcher alle canonicale kilder', () => {
  assert.equal(fagkart.categories.length, E.domains);
  assert.equal(pensum.modules.length, E.domains);
  assert.equal(emner.length, E.articles);
  assert.equal(registry.articles.length, E.articles);
  assert.equal(registry.chapters.length, E.chapters);
  assert.equal(concepts.concepts.length, E.concepts);
  assert.equal(methods.methods.length, E.methods);
  assert.equal(fagkart.categories.flatMap((x) => x.topic_hooks || []).length, E.hooks);
});

test('complete krever både 100 prosent universitetreview og 100 prosent benchmarkdekning', () => {
  const reviewed = [...articles.values()].filter((a) => a.editorial_quality === 'university_depth_reviewed').length;
  assert.equal(reviewed, E.articles);
  assert.equal(completion.reviewed_article_count, E.articles);
  assert.equal(completion.remaining_university_review_count, 0);
  assert.equal(completion.complete_ready, true);
  assert.equal(coverage.complete_ready, true);
  assert.equal(completion.quality_standard, 'substantive_university_philosophy_v3_major_fields');
});

test('fagverk-registryet kan ikke drive tilbake til gammel 13/54/162 eller 4/54-status', () => {
  assert.equal(philosophyRegistry.chapters.length, E.chapters);
  assert.equal(philosophyRegistry.editorialPlan.targetChapterCount, E.chapters);

  const requirements = philosophyRegistry.editorialPlan.completionRequirements;
  for (const requirement of [
    `all_${E.domains}_canonical_domains_covered`,
    `all_${E.articles}_canonical_emners_have_standalone_articles`,
    `all_${E.concepts}_canonical_concepts_written_out`,
    `all_${E.articles}_articles_pass_substantive_university_review`,
    `all_${E.methods}_canonical_methods_materialized`,
    `all_${E.hooks}_topic_hooks_materialized`,
    `all_${E.chapters}_chapters_registered`
  ]) {
    assert.ok(requirements.includes(requirement), `mangler registry-krav ${requirement}`);
  }
  for (const stale of [
    'all_13_canonical_domains_covered',
    'all_54_canonical_emners_have_standalone_articles',
    'all_162_canonical_concepts_written_out',
    'all_54_articles_pass_substantive_university_review'
  ]) {
    assert.equal(requirements.includes(stale), false, `stale registry-krav står fortsatt igjen: ${stale}`);
  }

  assert.equal(philosophyRegistry.qualityRemediation.status, 'complete');
  assert.equal(philosophyRegistry.qualityRemediation.standard, completion.quality_standard);
  assert.equal(philosophyRegistry.qualityRemediation.reviewedArticleCount, E.articles);
  assert.equal(philosophyRegistry.qualityRemediation.totalArticleCount, E.articles);
  assert.equal(philosophyRegistry.qualityRemediation.remainingArticleCount, 0);
});
