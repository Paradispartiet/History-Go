import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const p = read('data/places/musikk/oslo/places_musikk/rockefeller.json');
const runtime = read('data/runtime/place-open/rockefeller.json');
const registry = read('data/fagverk/fagverk_registry.json');
const quiz = read('data/quiz/musikk/rockefeller_sets_merged.json');
const cards = read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');

test('Rockefeller owns a source-backed, live-chapter Fagverk page', () => {
  assert.equal(p.id, 'rockefeller');
  assert.deepEqual(p.underbadge_ids, ['konsertsteder']);
  assert.equal(p.fagverk.schema, 'history_go_place_fagverk_v2');
  assert.equal(p.fagverk.level, 'standard');
  assert.equal(p.fagverk.status, 'curated');
  assert.equal(p.fagverk.article.length, 3);
  for (const paragraph of p.fagverk.article) assert.ok(paragraph.length > 260);
  assert.equal(registry.placeLinks.rockefeller.field, 'fagverk');
  assert.equal(registry.placeLinks.rockefeller.sourceFile, 'places/musikk/oslo/places_musikk/rockefeller.json');
  const subjects = registry.subjects.musikk.chapters;
  const byChapter = new Map(subjects.map(chapter => [chapter.id, chapter]));
  assert.deepEqual(p.fagverk.chapter_ids, ['historisk-musikkvitenskap-historiografi', 'institusjoner-okonomi-politikk-offentlighet']);
  const covered = new Set(p.fagverk.chapter_ids.flatMap(id => {
    assert.ok(byChapter.has(id), id);
    return byChapter.get(id).emne_ids;
  }));
  for (const id of p.fagverk.emne_ids) assert.ok(covered.has(id), id);
  for (const lens of p.fagverk.lenses) assert.ok(covered.has(lens.emne_id), lens.id);
  const knownSources = new Set(p.externalLinks.map(item => item.url));
  for (const url of p.fagverk.source_urls) assert.ok(knownSources.has(url), url);
  for (const image of [p.image,p.frontImage,p.cardImage]) assert.ok(image.endsWith('.webp'), image);
  assert.deepEqual(runtime.place.fagverk, p.fagverk);
  assert.deepEqual(runtime.place.underbadge_ids, p.underbadge_ids);
});

test('Existing Rockefeller story, People, quiz and QuizCard are kept stable', () => {
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.stories[0].id, 'st_rockefeller_folkets_hus_ble_konsertscene');
  assert.equal(runtime.stories[0].title, 'Torggata bad ble konsertscene');
  assert.equal(runtime.people.length, 3);
  assert.equal(quiz.sets.length, 5);
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map(q => q.id)).size, 30);
  const card = cards.cards.find(item => item.targetId === 'rockefeller');
  assert.ok(card);
  assert.equal(card.questions.length, 10);
  const byId = new Map(questions.map(q => [q.id,q]));
  for (const cq of card.questions) {
    const q = byId.get(cq.sourceQuestionId);
    assert.ok(q,cq.sourceQuestionId);
    assert.equal(q.question,cq.question,cq.sourceQuestionId);
    assert.equal(q.answer,cq.answer,cq.sourceQuestionId);
    assert.equal(q.knowledge_link_status,'linked',q.id);
  }
});
