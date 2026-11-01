import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url),'utf8'));
test('Fyrstikk-Story retains identity, corrects Bryn anchor and duration, and syncs runtime',()=>{
 const s=read('data/stories/stories_bryn_industriomrade.json')[0];
 const m=read('data/stories/stories_manifest.json');
 const a=read('data/runtime/place-open/akerselva.json'),b=read('data/runtime/place-open/bryn_industriomrade.json');
 assert.equal(s.id,'st_akerselva_fyrstikkpikene_1889');
 assert.equal(s.place_id,'bryn_industriomrade');
 assert.match(s.story,/23. oktober/);
 assert.match(s.story,/desember/);
 assert.doesNotMatch(s.story,/ti dager|langs Akerselva/);
 assert.ok(m.files.some(x=>x.entity_id==='bryn_industriomrade'&&x.path==='data/stories/stories_bryn_industriomrade.json'));
 assert.ok(!a.stories.some(x=>x.id===s.id));
 assert.deepEqual(b.stories,[s]);
});
test('Akerselva has independent source-backed 1990 river incident Story',()=>{
 const s=read('data/stories/stories_akerselva.json')[0];
 const a=read('data/runtime/place-open/akerselva.json');
 const e=read('data/stories/stories_episode_v1_manifest.json');
 assert.equal(s.place_id,'akerselva');
 assert.equal(s.quality_profile,'episode_v1');
 assert.match(s.story,/saltsyre/);
 assert.doesNotMatch(s.story,/svovelsyre/);
 assert.equal(s.year,1990);
 assert.deepEqual(a.stories,[s]);
 for(const f of ['data/stories/stories_akerselva.json','data/stories/stories_bryn_industriomrade.json'])assert.ok(e.files.includes(f));
});
