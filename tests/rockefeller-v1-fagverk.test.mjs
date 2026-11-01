import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const p = read('data/places/musikk/oslo/places_musikk/rockefeller.json');
const open = read('data/runtime/place-open/rockefeller.json');
const reg = read('data/fagverk/fagverk_registry.json');
const tier = read('data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json').places.find(row => row.place_id === 'rockefeller');
const quiz = read('data/quiz/musikk/rockefeller_sets_merged.json').sets.flatMap(x => x.questions);
const card = read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json').cards.find(x => x.targetId === 'rockefeller');
test('Rockefeller owns a source-backed Fagverk standard page with valid chapter bindings', () => {
 assert.equal(p.fagverk.schema, 'history_go_place_fagverk_v2');
 assert.equal(p.fagverk.level, 'standard');
 assert.equal(p.fagverk.status, 'curated');
 assert.equal(p.fagverk.article.length, 3);
 assert.ok(p.fagverk.article.join(' ').split(/\s+/).length >= 210);
 assert.deepEqual(p.underbadge_ids, ['konsertsteder']);
 const idx = reg.placeLinks.rockefeller;
 assert.equal(idx.sourceFile, 'places/musikk/oslo/places_musikk/rockefeller.json');
 assert.equal(idx.field, 'fagverk');
 assert.deepEqual(open.place.fagverk, p.fagverk);
 assert.deepEqual(open.place.externalLinks, p.externalLinks);
 const ch = new Map(reg.subjects.musikk.chapters.map(x => [x.id, x]));
 for (const topic of p.fagverk.emne_ids) assert.ok(p.fagverk.chapter_ids.some(id => ch.get(id)?.emne_ids?.includes(topic)), topic);
 for (const url of p.fagverk.source_urls) assert.ok(p.externalLinks.some(link => link.url === url), url);
 for (const lens of p.fagverk.lenses) assert.ok(p.fagverk.emne_ids.includes(lens.emne_id));
});
test('Rockefeller historical story, People, photos and quiz IDs survive Fagverk integration', () => {
 assert.match(p.desc, /Torggata bad/);
 assert.match(open.stories[0].title, /Torggata bad/);
 assert.equal(open.stories[0].id, 'st_rockefeller_folkets_hus_ble_konsertscene');
 assert.deepEqual(open.people.map(x => x.id).sort(), ['joachim_nielsen','mari_boine','morten_harket']);
 assert.equal(quiz.length, 30);
 assert.equal(new Set(quiz.map(q => q.id)).size, 30);
 assert.equal(quiz.filter(q => q.knowledge_link_status === 'linked').length, 30);
 assert.equal(card.questions.length, 10);
 const byId = new Map(quiz.map(q => [q.id,q]));
 for (const cq of card.questions) {
  const q = byId.get(cq.sourceQuestionId);
  assert.ok(q, cq.sourceQuestionId);
  for (const prop of ['question','answer','options','answerIndex','knowledge']) assert.deepEqual(cq[prop],q[prop],prop);
 }
 for (const file of [p.image,p.frontImage,p.cardImage]) assert.ok(fs.existsSync(file),file);
 assert.equal(tier.content_level, 'v1_candidate', 'Do not claim v1 without real browser validation and full quiz editorial pass');
});
