import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Tøyen trafo news: exact-first-party date, future event and canonical materialization',()=>{
  const manifest=JSON.parse(fs.readFileSync('data/leksikon/manifest.json','utf8'));
  const filename='data/leksikon/places/oslo/naeringsliv/leksikon_toyen_trafo_news_2026.json';
  assert.ok(manifest.files.includes(filename));
  const note=JSON.parse(fs.readFileSync(filename,'utf8'));
  assert.equal(note.length,1);
  const n=note[0];
  assert.equal(n.place_id,'toyen_trafo');
  assert.equal(n.type,'news_note');
  assert.equal(n.date,'2026-11-03');
  assert.equal(n.event_date,'2026-12-04');
  assert.equal(n.status,'announced_upcoming_at_verification');
  assert.ok(n.sources.some(s=>s.url==='https://osloteatersenter.no/2026/11/03/oslo-fri-verkstedival-4-desember/'));
  assert.match(n.popupDesc,/ikke at arrangementet allerede er avholdt/);
  const runtime=JSON.parse(fs.readFileSync('data/runtime/place-open/toyen_trafo.json','utf8'));
  assert.ok(runtime.leksikon.find(z=>z.id===n.id));
  assert.ok(runtime.leksikon.find(z=>z.id==='toyen_trafo_industri_til_kunstnerhus'));
  assert.equal(runtime.leksikon.filter(z=>z.type==='news_note').length,1);
  assert.equal(runtime.stories.length,1);
  assert.equal(runtime.lesespor.length,4);
  assert.deepEqual(runtime.place.place_card_profile.collection_ids,['people','objects','brands','productions']);
});
