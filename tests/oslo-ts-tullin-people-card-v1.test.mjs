import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const place=read('data/places/by/oslo/places/tullin.json');
const quiz=read('data/quiz/by/tullin_sets.json');
const batch=read('data/quizcards/by/topp10_by_kort_batch7.json');
const card=batch.cards.find(c=>c.targetId==='tullin');
const people=read('data/people/by/oslo/tullin/claus_tullin.json');
const claims=read('data/people/claims/by/oslo/tullin/claus_tullin.claims.json');
const manifest=read('data/people/manifest.json');
const all=quiz.sets.flatMap(s=>s.questions);
test('Tullin preserves canonical rich Place, Fagverk, source-licensed image, and 42/42 quiz',()=>{
 assert.equal(place.id,'tullin');assert.equal(place.coordStatus,'verified_geometry');
 assert.equal(place.fagverk.status,'curated');assert.equal(place.fagverk.article.length,3);
 assert.equal(place.fagverk.lenses.length,4);
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7,7,7,7]);
 assert.equal(all.length,42);assert.ok(all.every(q=>q.knowledge_link_status==='linked'&&q.primary_knowledge_unit_id));
 assert.equal(place.imageMeta.license,'CC BY-SA 4.0');
 assert.deepEqual(place.related_people_ids,['claus_tullin','bjornstjerne_bjornson']);
});
test('Existing Tullin QuizCard 10/10 exact fullquiz and Knowledge parity; other collection preserved',()=>{
 assert.equal(batch.cards.length,2);assert.equal(card.card_id,'by_quizkort_minimum_v1_tullin');
 assert.equal(card.questions.length,10);assert.equal(card.questionCount,10);assert.equal(card.answerKey.length,10);
 const map=new Map(all.map(q=>[q.id,q]));
 for(let n=0;n<10;n++){const row=card.questions[n],src=map.get(row.sourceQuestionId);
 assert.ok(src,'Missing quiz question '+row.sourceQuestionId);
 for(const key of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])assert.deepEqual(row[key],src[key]);
 assert.deepEqual(card.answerKey[n],{number:n+1,answer:src.answer,answerIndex:src.answerIndex});
 assert.equal(row.sourceQuizId,src.quiz_id);assert.equal(row.sourceQuizFile,'data/quiz/by/tullin_sets.json');}
 assert.ok(card.questions.some(q=>q.answer==='Claus Tullin'));
 assert.ok(card.questions.some(q=>q.answer==='Bjørnstjerne Bjørnson'));
});
test('Claus Tullin is one canonical, source-curated person distinct from his father',()=>{
 assert.equal(people.length,1);const p=people[0];assert.equal(p.id,'claus_tullin');assert.equal(p.placeId,'tullin');
 assert.equal(p.profileStandard,'people_profile_v1.0');assert.equal(p.profileStatus,'source_curated_media_pending');
 assert.equal(p.claimsFile,'data/people/claims/by/oslo/tullin/claus_tullin.claims.json');
 assert.equal(p.image,'');assert.ok(p.roundHoldbacks.includes('tullin'));
 assert.equal(claims.person_id,'claus_tullin');assert.equal(claims.identity.identity_status,'verified');
 assert.equal(claims.claims.length,7);
 assert.ok(claims.claims.every(x=>x.status==='verified'&&x.source_url));
 assert.ok(claims.identity.not.some(x=>x.includes('Christian Braunmann Tullin')));
 assert.ok(manifest.files.includes('people/by/oslo/tullin/claus_tullin.json'));
});
test('Both relevant People remain visible in generated Place-open runtime without duplicated identities',()=>{
 const rt=read('data/runtime/place-open/tullin.json');
 const ids=rt.people.map(x=>x.id);
 for(const id of ['claus_tullin','bjornstjerne_bjornson'])assert.equal(ids.filter(x=>x===id).length,1,id);
 const claus=rt.people.find(x=>x.id==='claus_tullin');
 assert.equal(claus.profileStatus,'source_curated_media_pending');
});
