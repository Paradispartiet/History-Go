import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('Sport-artiklene har polert, artikkelspesifikk prosa', () => {
  const registry = readJson('data/fagverk/sport/sport_article_registry_v1.json');
  assert.equal(registry.prose_quality?.status, 'polished');
  const leads = [];
  const forbidden = [/handler om emnet\b/i, /Bruksgrensen er derfor at/i, /En vanlig misforståelse er at/i, /TODO|TBD|placeholder/i];
  for (const row of registry.articles) {
    const article = readJson(row.file);
    const prose = article.sections.flatMap((s) => s.paragraphs || []).join('\n');
    leads.push(article.lead);
    assert.ok(article.quality.prose_polish_passed, row.emne_id);
    assert.ok(article.lead.includes(article.title), `${row.emne_id}: ingress er ikke artikkelspesifikk`);
    assert.ok(article.sections.find((s) => s.id === 'mekanisme')?.paragraphs.every((p) => p.includes(article.title) || /teoriramme/.test(p)), `${row.emne_id}: mekanismetekst er ikke tilpasset`);
    for (const pattern of forbidden) assert.doesNotMatch(prose, pattern, `${row.emne_id}: maskinaktig eller uferdig frase`);
    for (const concept of article.concept_explanations) {
      assert.ok(concept.explanation.includes(article.title), `${row.emne_id}: begrepsforklaring mangler artikkelkontekst`);
      assert.ok(concept.explanation.includes(concept.label), `${row.emne_id}: begrepsnavn mangler i forklaring`);
    }
  }
  assert.equal(new Set(leads).size, 116, 'Ingressene skal være unike for alle 116 artikler');
});

test('Sport-artiklene er dybdetekst, ikke korte emnekort', () => {
  const registry = readJson('data/fagverk/sport/sport_article_registry_v1.json');
  const wordCounts = registry.articles.map((row) => readJson(row.file).quality.word_count);
  assert.equal(wordCounts.length, 116);
  assert.ok(Math.min(...wordCounts) >= 500);
  assert.ok(wordCounts.reduce((a, b) => a + b, 0) >= 100000, 'Samlet Sport-artikkelkorpus skal ha reell dybde');
});
