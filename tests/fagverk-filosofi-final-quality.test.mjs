import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const norm = (value) => String(value || '').toLocaleLowerCase('nb').replace(/\s+/g, ' ').trim();

const registry = json('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const sourceRegistry = json('data/fagverk/filosofi/filosofi_sources_v1.json');
const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.id, source]));
const articles = registry.articles.map((row) => json(row.file));

const forbiddenTemplateFragments = [
  'ikke som navnegjetting',
  'det betyr at begrepet må gjøre arbeid i argumentet og kunne endre vurderingen av en rival, ikke bare stå i en ordliste',
  'spørsmålet er filosofisk fordi et svar krever mer enn å registrere et faktum',
  'metoden skal ikke bare navngis. den må produsere et synlig mellomledd'
];

const sectionProse = (article, id) =>
  (article.sections.find((section) => section.id === id)?.paragraphs || []).join(' ');
const allProse = (article) => article.sections.flatMap((section) => section.paragraphs || []).join(' ');

const isSubstantivelyReviewed = (article) =>
  article.editorial_quality === 'university_depth_reviewed' &&
  article.quality?.review_state === 'university_depth_reviewed' &&
  article.quality?.reviewed_against_university_gate === true;

test('university_depth_reviewed kan ikke motsies av artikkelens egen review-state', () => {
  for (const article of articles) {
    if (article.editorial_quality !== 'university_depth_reviewed') continue;
    assert.equal(
      article.quality?.review_state,
      'university_depth_reviewed',
      `${article.id}: top-level university_depth_reviewed motsies av quality.review_state=${article.quality?.review_state}`
    );
    assert.equal(
      article.quality?.reviewed_against_university_gate,
      true,
      `${article.id}: top-level university_depth_reviewed uten faktisk university-gate review`
    );
  }
});

test('universitetsstatus kan ikke sertifiseres av kjent generator-malprosa', () => {
  for (const article of articles.filter(isSubstantivelyReviewed)) {
    const prose = norm(allProse(article));
    for (const fragment of forbiddenTemplateFragments) {
      assert.equal(
        prose.includes(fragment),
        false,
        `${article.id}: university-depth prosa inneholder generator-mal: ${fragment}`
      );
    }
  }
});

test('kildeavsnittet må omtale de faktiske emnespesifikke sekundærkildene og ikke et annet emnes kildeliste', () => {
  const searchableTitles = sourceRegistry.sources
    .filter((source) => norm(source.title).length >= 10)
    .map((source) => ({ id: source.id, title: source.title, needle: norm(source.title) }));

  for (const article of articles.filter(isSubstantivelyReviewed)) {
    const sourceProse = norm(sectionProse(article, 'kilder'));
    assert.ok(sourceProse, `${article.id}: mangler kildedrøfting`);

    for (const sourceId of article.source_ids || []) {
      const source = sourcesById.get(sourceId);
      assert.ok(source, `${article.id}: ukjent source_id ${sourceId}`);
      assert.ok(
        sourceProse.includes(norm(source.title)),
        `${article.id}: kildedrøftingen omtaler ikke faktisk sekundærkilde ${source.title}`
      );
    }

    const declared = new Set(article.source_ids || []);
    const declaredTitles = [...declared]
      .map((id) => sourcesById.get(id))
      .filter(Boolean)
      .map((source) => norm(source.title));

    for (const candidate of searchableTitles) {
      if (declared.has(candidate.id)) continue;
      // A short registry title such as "Metaphysics" can be a literal substring
      // of a longer, legitimately declared title. That is not source contamination.
      if (declaredTitles.some((title) => title.includes(candidate.needle))) continue;
      if (!sourceProse.includes(candidate.needle)) continue;
      assert.fail(
        `${article.id}: kildedrøftingen navngir ${candidate.title}, men artikkelen deklarerer ikke ${candidate.id}`
      );
    }
  }
});

test('primærverk skal være reelle argumentankere, ikke bare metadata', () => {
  for (const article of articles.filter(isSubstantivelyReviewed)) {
    const works = article.primary_work_refs || [];
    assert.ok(works.length >= 1, `${article.id}: mangler primærverk`);
    const theoryProse = norm(sectionProse(article, 'teorihistorie'));
    assert.ok(
      works.some((work) => theoryProse.includes(norm(work))),
      `${article.id}: ingen deklarerte primærverk brukes i teorihistorien`
    );
  }
});
