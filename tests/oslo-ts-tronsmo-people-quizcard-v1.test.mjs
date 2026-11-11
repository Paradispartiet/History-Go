import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const place=read('data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json');
const quiz=read('data/quiz/litteratur/tronsmo_bokhandel.json');
const manifest=read('data/quiz/manifest.json');
const pm=read('data/people/manifest.json');
const people=read('data/people/litteratur/oslo/people_litteratur_oslo.json');
const byQuiz=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
const target='tronsmo_bokhandel';
const cards=['topp10_lit_kort_batch4.json','topp10_lit_kort_batch5.json','topp10_lit_kort_batch6.json','topp10_lit_kort_batch7.json'];
test('Tronsmo preserved geometry, licensed image, canonical 28/28 quiz and curated Fagverk',()=>{
 assert.equal(place.id,target);assert.equal(place.coordStatus,'verified');assert.equal(place.address.street,'Universitetsgata');assert.equal(place.address.number,'12');
 assert.equal(place.imageLicense,'CC BY-SA 4.0');
 assert.equal(place.fagverk.status,'curated');assert.ok(place.fagverk.article.length>=3);
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7,7]);assert.equal(manifest.sets.filter(s=>s.targetId===target).length,1);
 assert.equal(byQuiz.size,28);
 for(const q of byQuiz.values()){assert.equal(q.knowledge_link_status,'linked');assert.ok(q.primary_knowledge_unit_id);assert.equal(q.answer,q.options[q.answerIndex]);}
});
test('All four legacy Tronsmo QuizCards retain IDs and have 40/40 exact canonical parity',()=>{
 const expected=['litteratur_quizkort_topp10_batch4_tronsmo_bokhandel','litteratur_quizkort_videre2_batch5_tronsmo_bokhandel','litteratur_quizkort_videre3_batch6_tronsmo_bokhandel','litteratur_quizkort_videre4_batch7_tronsmo_bokhandel'];
 for(const [i,filename] of cards.entries()){const collection=read('data/quizcards/litteratur/'+filename),card=collection.cards.filter(c=>c.targetId===target)[0];
 assert.equal(card.card_id,expected[i]);assert.equal(card.questions.length,10);assert.equal(card.questionCount,10);assert.equal(card.answerKey.length,10);
 for(let j=0;j<10;j++){const q=card.questions[j],src=byQuiz.get(q.sourceQuestionId);assert.ok(src,'stale '+q.sourceQuestionId);
 for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])assert.deepEqual(q[k],src[k]);assert.deepEqual(card.answerKey[j],{number:j+1,answer:src.answer,answerIndex:src.answerIndex});}
 }
});
test('Three source-curated People have disclosed original editorial images; Per Petterson stays directly linked',()=>{
 const rel=['ivar_tronsmo','per_petterson','lars_fiske','bendik_kaltenborn'];assert.deepEqual(place.related_people_ids,rel);
 const per=people.find(x=>x.id==='per_petterson');assert.ok(per?.places.includes(target));assert.equal(per.placeId,'nasjonalbiblioteket');assert.equal(per.image,'bilder/illustrasjoner/people/per_petterson_historygo_editorial.svg');assert.equal(per.cardImage,per.image);assert.equal(per.imageStatus,'original_editorial_not_an_authentic_portrait');assert.match(fs.readFileSync(new URL('../'+per.image,import.meta.url),'utf8'),/IKKE ET AUTENTISK PORTRETT/);
 for(const [id,profile,claims] of [
 ['ivar_tronsmo','people/litteratur/oslo/tronsmo_bokhandel/ivar_tronsmo.json','people/claims/litteratur/oslo/tronsmo_bokhandel/ivar_tronsmo.claims.json'],
 ['lars_fiske','people/kunst/oslo/tronsmo_bokhandel/lars_fiske.json','people/claims/kunst/oslo/tronsmo_bokhandel/lars_fiske.claims.json'],
 ['bendik_kaltenborn','people/kunst/oslo/tronsmo_bokhandel/bendik_kaltenborn.json','people/claims/kunst/oslo/tronsmo_bokhandel/bendik_kaltenborn.claims.json']
 ]){assert.ok(pm.files.includes(profile));const p=read('data/'+profile)[0],c=read('data/'+claims);
 assert.equal(p.id,id);assert.ok(p.places.includes(target));assert.equal(p.profileStatus,'ready_people_v1');assert.equal(p.image,`bilder/illustrasjoner/people/${id}_historygo_editorial.svg`);assert.equal(p.cardImage,p.image);assert.equal(p.imageStatus,'original_editorial_not_an_authentic_portrait');assert.equal(p.imageMeta.source,'history_go_original_editorial_illustration');assert.match(p.imageMeta.disclosure,/ikke/);const svg=fs.readFileSync(new URL('../'+p.image,import.meta.url),'utf8');assert.match(svg,/<svg /);assert.match(svg,/width="1024" height="1024"/);assert.match(svg,/IKKE ET AUTENTISK PORTRETT/);assert.equal(c.person_id,id);assert.equal(c.identity.identity_status,'verified');assert.ok(c.claims.length>=6);assert.ok(c.claims.every(x=>x.status==='verified'&&x.source_url));}
});
test('Generated runtime includes founder, employee, and the two window artists',()=>{
 const r=read('data/runtime/place-open/tronsmo_bokhandel.json'),ids=r.people.map(p=>p.id);
 for(const id of ['ivar_tronsmo','per_petterson','lars_fiske','bendik_kaltenborn'])assert.equal(ids.filter(x=>x===id).length,1,id);for(const id of ['ivar_tronsmo','lars_fiske','bendik_kaltenborn']){const p=r.people.find(p=>p.id===id);assert.equal(p.image,`bilder/illustrasjoner/people/${id}_historygo_editorial.svg`);assert.equal(p.imageStatus,'original_editorial_not_an_authentic_portrait');}const per=r.people.find(p=>p.id==='per_petterson');assert.equal(per.image,'bilder/illustrasjoner/people/per_petterson_historygo_editorial.svg');assert.equal(per.imageStatus,'original_editorial_not_an_authentic_portrait');
});
