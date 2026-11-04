import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const load = path => JSON.parse(fs.readFileSync(path,'utf8'));
const newsFile = 'data/leksikon/places/oslo/sport/leksikon_oslo_sport_toyenbadet_news.json';
const news = load(newsFile);
const manifest = load('data/leksikon/manifest.json');
const main = load('data/leksikon/places/oslo/sport/leksikon_oslo_sport_toyenbadet.json');
const place = load('data/places/sport/europa/norway/oslo_sport/toyenbadet.json');
const runtime = load('data/runtime/place-open/toyenbadet.json');

test('Two dated Tøyenbadet operations news notes are source-owned, not present-time status',()=>{
  assert.equal(main.type,'main');
  assert.equal(place.id,'toyenbadet');
  assert.ok(manifest.files.includes(newsFile));
  assert.equal(news.length,2);
  assert.deepEqual(news.map(n=>n.id),['toyenbadet_news_vedlikehold_august_2026','toyenbadet_news_klormaskin_oktober_2026']);
  for(const note of news){
    assert.equal(note.place_id,'toyenbadet');
    assert.equal(note.type,'news_note');
    assert.equal(note.version,1);
    assert.equal(note.status,'archived');
    assert.match(note.date,/^2026-(?:08|10)-[0-3][0-9]$/);
    assert.ok(note.valid_through.startsWith('2026-'));
    assert.ok(note.popupDesc.length>100);
    assert.equal(note.verifiedAt,'2026-11-04');
    assert.ok(note.sources.length>=2);
    assert.ok(note.sources.every(s=>s.url.startsWith('https://')&&s.label.length>12));
    assert.ok(note.tags.includes('news_note'));
    assert.match(note.verification_note,/2026/);
    assert.doesNotMatch(note.popupDesc,/i dag er badet (åpent|stengt)/i);
  }
  assert.equal(news[0].date,'2026-08-28');
  assert.match(news[0].popupDesc,/7\\. september/);
  assert.equal(news[1].date,'2026-10-16');
  assert.match(news[1].popupDesc,/20\\. oktober/);
  assert.match(news[1].popupDesc,/planlagt/);
});

test('Place-open indexes both news notes without replacing the canonical history article',()=>{
  assert.equal(runtime.place.id,'toyenbadet');
  assert.equal(runtime.leksikon.filter(x=>x.type==='main').length,1);
  const matched=runtime.leksikon.filter(x=>x.type==='news_note');
  assert.deepEqual(matched.map(x=>x.id).sort(),news.map(x=>x.id).sort());
  assert.ok(matched.every(x=>x.sources?.[0]?.url.startsWith('https://')));
});
