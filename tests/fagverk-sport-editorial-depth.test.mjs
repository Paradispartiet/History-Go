import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSportEditorialDepth } from '../scripts/audit-fagverk-sport-editorial-depth.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('Sport har 116 selvstendige dybdeartikler og 140/140 integrerte begreper', () => {
  const report = auditSportEditorialDepth();
  assert.equal(report.status, 'editorial_depth_complete');
  assert.deepEqual({ emner: report.summary.canonicalEmneCount, articles: report.summary.standaloneArticleCount, concepts: report.summary.integratedConceptCount, domains: report.summary.domainCount }, { emner: 116, articles: 116, concepts: 140, domains: 6 });
  assert.ok(report.summary.minimumWordsPerArticle >= 500);
  assert.ok(report.summary.minimumSectionsPerArticle >= 8);
  assert.ok(report.summary.minimumParagraphsPerArticle >= 15);
});

test('hver Sport-artikkel er selvstendig, lesbar og claimsporet', () => {
  const registry = readJson('data/fagverk/sport/sport_article_registry_v1.json');
  for (const row of registry.articles) {
    const article = readJson(row.file);
    assert.equal(article.emne_id, row.emne_id);
    assert.equal(article.status, 'standalone_complete');
    assert.ok(article.lead.length >= 180, row.emne_id);
    assert.ok(article.quality.word_count >= 500, row.emne_id);
    assert.ok(article.sections.length >= 8, row.emne_id);
    assert.ok(article.theory_unit_ids.length >= 2, row.emne_id);
    assert.ok(article.method_ids.length >= 1, row.emne_id);
    assert.ok(article.claim_ids.length >= 1, row.emne_id);
    assert.ok(article.concept_explanations.length >= 1, row.emne_id);
    assert.ok(article.sections.some((s) => s.id === 'metode'), row.emne_id);
    assert.ok(article.sections.some((s) => s.id === 'avgrensning'), row.emne_id);
  }
});

test('alle 140 canonicale Sport-begreper er skrevet ut, ikke bare referert med ID', () => {
  const concepts = new Map(readJson('data/fag/sport/begreper_sport_canonical_v5.json').concepts.filter((c) => c.status === 'canonical').map((c) => [c.concept_id, c]));
  const registry = readJson('data/fagverk/sport/sport_article_registry_v1.json');
  const seen = new Set();
  for (const row of registry.articles) {
    const article = readJson(row.file);
    for (const item of article.concept_explanations) {
      const canonical = concepts.get(item.concept_id);
      assert.ok(canonical, item.concept_id);
      assert.equal(item.label, canonical.label);
      assert.match(item.explanation, new RegExp(canonical.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.ok(item.explanation.length >= 250, item.concept_id);
      assert.equal(item.distinguishes_from, canonical.distinguishes_from);
      assert.equal(item.common_misconception, canonical.common_misconception);
      seen.add(item.concept_id);
    }
  }
  assert.equal(seen.size, 140);
  assert.deepEqual([...concepts.keys()].filter((id) => !seen.has(id)), []);
});

test('Sport completion og fagverk-registry eksponerer artikkellaget', () => {
  const completion = readJson('data/fagverk/sport/sport_completion_v1.json');
  const sport = readJson('data/fagverk/fagverk_registry.json').subjects.sport;
  assert.equal(completion.version, '1.2.0');
  assert.equal(completion.editorial_depth.status, 'complete');
  assert.equal(completion.editorial_depth.standalone_article_count, 116);
  assert.equal(completion.editorial_depth.concepts_integrated_count, 140);
  assert.equal(completion.editorial_depth.all_concepts_written_out_in_articles, true);
  assert.equal(sport.articleRegistryFile, 'data/fagverk/sport/sport_article_registry_v1.json');
  assert.equal(sport.standaloneArticleCount, 116);
  assert.equal(sport.integratedConceptCount, 140);
});
