import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const p='data/places/natur/oslo/places_oslo_natur_akerselvarute/bjoelsenparken_elvenaer.json';
const id='bjoelsenparken_elvenaer';
const place=read(p),f=place.fagverk;
const runtime=read('data/runtime/place-open/'+id+'.json').place;
const registry=read('data/fagverk/fagverk_registry.json');
const rel=read('data/fagverk/fagverk_release.json');
const qs=read('data/quiz/natur/'+id+'_sets.json').sets.flatMap(s=>s.questions);

test('Identity is Advokat Dehlis plass, not elvenær Bjølsenparken',()=>{
 assert.equal(place.id,id);
 assert.match(place.name,/Advokat Dehlis plass/);
 assert.match(place.quiz_profile.signature_features.join(' '),/Advokat Dehlis plass/);
 assert.doesNotMatch(place.quiz_profile.signature_features.join(' '),/Bjølsenparken \(elvenær del\)/);
 assert.deepEqual(runtime.quiz_profile,place.quiz_profile);
});
test('Curated source-bound Fagverk uses canonical Natur links and honest observations',()=>{
 assert.equal(f.schema,'history_go_place_fagverk_v2');
 assert.equal(f.level,'standard');assert.equal(f.status,'curated');
 assert.ok(f.article.join(' ').trim().split(/\s+/).length>=70);
 assert.ok(f.intro.trim().split(/\s+/).length>=12);
 assert.equal(f.lenses.length,3);assert.equal(f.observable_traces.length,2);
 assert.ok(f.guiding_questions.length>=4);assert.ok(f.source_urls.length>=5);
 for(const url of f.source_urls)assert.ok(place.externalLinks.some(link=>link.url===url&&link.label),url);
 for(const lens of f.lenses)assert.ok(f.emne_ids.includes(lens.emne_id));
 assert.deepEqual(runtime.fagverk,f);
 const idx=registry.placeLinks[id];assert.ok(idx);
 assert.equal(idx.status,'curated');assert.equal(idx.level,'standard');
 assert.equal(idx.sourceFile,p.replace('data/',''));
 assert.ok(rel,'Fagverk release should be readable');
});
test('Existing 21 quiz IDs and learned Knowledge remain unchanged',()=>{
 assert.equal(qs.length,21);
 assert.equal(new Set(qs.map(q=>q.quiz_id)).size,21);
 assert.equal(new Set(qs.map(q=>q.id)).size,21);
 assert.ok(qs.every(q=>q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id)));
 assert.equal(qs.filter(q=>q.knowledge_link_status==='linked').length,8);
 assert.equal(qs.filter(q=>q.knowledge_link_status==='editorial_review_required').length,13);
});
