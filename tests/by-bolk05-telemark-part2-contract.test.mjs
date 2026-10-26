import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ids=['hogga_sluse_telemarkskanalen','lunde_sluse_telemarkskanalen'];
test('By05 Hogga/Lunde editorial source and license contracts',()=>{
 for(const id of ids){
  const p=read('data/places/by/telemark/'+id+'/'+id+'.json');
  assert.equal(p.id,id);
  assert.equal(p.fagverk?.status,'curated');
  assert.equal(p.fagverk?.article?.length,3);
  assert.equal(p.fagverk?.lenses?.length,3);
  assert.ok(p.fagverk?.source_urls?.length>=2);
  assert.ok(p.image?.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/'));
  assert.equal(p.image,p.cardImage);
  for(const k of ['imageCredit','imageLicense','imageSourceUrl','imageLicenseUrl','imageCaption'])assert.ok(p[k],id+':'+k);
 }
});
test('By05 Hogga/Lunde all 20 quiz answers and QuizCards have parity',()=>{
 const cards=read('data/quizcards/by/regional_bolk05_telemark_part2_v1_20261026.json').cards;
 assert.equal(cards.length,2);
 for(const id of ids){
  const qs=read('data/quiz/by/'+id+'_regional_v1_sets.json').sets.flatMap(s=>s.questions);
  const card=cards.find(c=>c.targetId===id);
  assert.ok(card,id);
  assert.equal(qs.length,10);
  assert.equal(card.questionCount,10);
  assert.equal(card.questions.length,10);
  assert.equal(new Set(qs.map(q=>q.question)).size,10);
  assert.ok(qs.filter(q=>/^(?:når|hvilket år|i hvilket år|fra hvilket år)\b/i.test(q.question)).length<=2);
  qs.forEach((q,i)=>{
   assert.equal(q.options[q.answerIndex],q.answer);
   assert.ok(q.source_urls?.length && q.source_urls.every(s=>s.startsWith('https://')));
   assert.equal(q.knowledge_link_status,'pending');
   assert.equal(q.quiz_id,card.questions[i].quiz_id);
   assert.equal(q.answer,card.questions[i].answer);
   assert.deepEqual(q.options,card.questions[i].options);
  });
 }
});
