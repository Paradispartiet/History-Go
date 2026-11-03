import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const id='trosterudvillaen',p=read('data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08/'+id+'.json'),q=read('data/quiz/historie/'+id+'_sets.json'),card=read('data/quizcards/historie/'+id+'_quizcard_v1.json'),qm=read('data/quiz/manifest.json'),cm=read('data/quizcards/historie/manifest.json'),reg=read('data/fagverk/fagverk_registry.json'),pm=read('data/people/manifest.json');
const all=q.sets.flatMap(x=>x.questions),ids=['henrik_dedichen','kristian_biong','aimee_sommerfelt'];
test('Trosterudvillaen canonical identity, Fagverk and image rights',()=>{
assert.equal(p.id,id);assert.equal(p.year,1901);assert.equal(p.address.number,'28D');assert.equal(p.coordStatus,'verified');
assert.equal(p.fagverk.status,'curated');assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);
assert.equal(p.imageMeta.license,'CC BY-SA 4.0');assert.ok(p.imageSourceUrl.includes('commons.wikimedia.org'));
assert.deepEqual(p.related_people_ids,ids);assert.equal(reg.placeLinks[id].status,'curated');
});
test('Trosterudvillaen 21/21 Knowledge linked questions',()=>{
assert.deepEqual(q.sets.map(x=>x.questions.length),[7,7,7]);assert.equal(qm.sets.filter(x=>x.targetId===id).length,3);
assert.equal(new Set(all.map(x=>x.id)).size,21);
for(const row of all){assert.equal(row.answer,row.options[row.answerIndex]);assert.equal(row.knowledge_link_status,'linked');assert.ok(row.primary_knowledge_unit_id);assert.ok(row.source_urls.length);}});
test('Trosterudvillaen 10/10 QuizCard exact parity with source',()=>{
assert.ok(cm.collections.includes(id+'_quizcard_v1.json'));const c=card.cards[0],by=new Map(all.map(x=>[x.id,x]));assert.equal(c.questions.length,10);
for(let i=0;i<10;i++){const r=c.questions[i],s=by.get(r.sourceQuestionId);assert.ok(s);for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])assert.deepEqual(r[k],s[k]);assert.deepEqual(c.answerKey[i],{number:i+1,answer:s.answer,answerIndex:s.answerIndex});}
});
test('Three source-backed People profiles, two licensed portraits and no invented portrait',()=>{
for(const [personId,file,claimFile,license] of [['henrik_dedichen','data/people/historie/oslo/trosterudvillaen/henrik_dedichen.json','data/people/claims/historie/oslo/trosterudvillaen/henrik_dedichen.claims.json','CC BY-SA 3.0'],['kristian_biong','data/people/historie/oslo/trosterudvillaen/kristian_biong.json','data/people/claims/historie/oslo/trosterudvillaen/kristian_biong.claims.json','Public domain'],['aimee_sommerfelt','data/people/litteratur/oslo/trosterudvillaen/aimee_sommerfelt.json','data/people/claims/litteratur/oslo/trosterudvillaen/aimee_sommerfelt.claims.json',null]]){
const obj=read(file),person=obj[0],claim=read(claimFile);assert.equal(obj.length,1);assert.equal(person.id,personId);assert.equal(person.placeId,id);assert.ok(person.places.includes(id));assert.ok(pm.files.includes(file.replace(/^data\//,'')));
assert.equal(claim.person_id,personId);assert.ok(claim.claims.length>=6);assert.ok(claim.claims.every(x=>x.status==='verified'&&x.source_url));
if(license){assert.equal(person.imageMeta.license,license);assert.equal(person.profileStatus,'ready_people_v1');}else{assert.equal(person.image,'');assert.equal(person.profileStatus,'source_curated_media_pending');}}
assert.equal(pm.priorityFilesByPlace[id].length,3);
});
test('All three People appear in generated Place-open runtime without duplicates',()=>{
const rt=read('data/runtime/place-open/'+id+'.json'),current=rt.people.map(x=>x.id);
for(const personId of ids)assert.equal(current.filter(x=>x===personId).length,1,personId);});
