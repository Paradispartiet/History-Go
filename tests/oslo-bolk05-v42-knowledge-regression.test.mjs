import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validatePacket} from '../scripts/validate-place-description-production-v4_2.mjs';

function read(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
const places=[
  ['folketeateret','scenekunst'],
  ['kunstnernes_hus','kunst'],
  ['historisk_museum','historie'],
  ['ibsen_museum_teater','litteratur'],
  ['blitzhuset','subkultur'],
  ['kulturkirken_jakob_litteratur','musikk']
];

for(const [id,cat] of places){
  test(id+' complete v4.2, quiz and runtime alignment',()=>{
    const packetFile='data/places/production/'+id+'.json';
    const packet=read(packetFile);
    const place=read(packet.placeFile);
    const runtime=read('data/runtime/place-open/'+id+'.json');
    assert.equal(place.id,id);
    assert.equal(place.category,cat);
    assert.equal(packet.status,'ready_v4_2');
    assert.deepEqual(validatePacket({packet,place,packetFile}).issues,[]);
    assert.equal(runtime.place.id,id);
    assert.equal(runtime.place.desc,place.desc);
    assert.equal(runtime.place.popupDesc,place.popupDesc);
    const quiz=read('data/quiz/'+cat+'/'+id+'_sets.json');
    assert.equal(quiz.sets.length,3);
    const questions=quiz.sets.flatMap(s=>s.questions);
    assert.equal(questions.length,21);
    assert.ok(questions.every(q=>q.options[q.answerIndex]===q.answer&&q.knowledge_unit_ids?.length>0&&q.knowledge_link_status==='linked'));
  });
}

test('Blitzhuset has 21 canonical Subkultur concepts and matching QuizCard links',()=>{
  const units=new Set(read('data/knowledge/subjects/subkultur/concepts.generated.json').concepts.map(c=>c.concept_id));
  const quiz=read('data/quiz/subkultur/blitzhuset_sets.json');
  const full=quiz.sets.flatMap(s=>s.questions);
  assert.equal(full.length,21);
  for(const q of full){
    assert.ok(q.concept_ids?.length>0,q.id+' has no concept ID');
    for(const concept of q.concept_ids)assert.ok(units.has(concept),q.id+' unknown canonical concept '+concept);
  }
  const byId=new Map(full.map(q=>[q.id,q]));
  const cards=read('data/quizcards/subkultur/blitzhuset_quizkort_v1.json').cards;
  assert.equal(cards.length,1);
  assert.equal(cards[0].questions.length,10);
  for(const q of cards[0].questions){
    const source=byId.get(q.sourceQuestionId);
    assert.ok(source,q.id+' fullquiz source missing');
    assert.deepEqual(q.concept_ids,source.concept_ids,q.id+' QuizCard concept drift');
    assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids,q.id+' Knowledge drift');
    assert.equal(q.answer,source.answer);
  }
});

test('Kulturkirken Jakob has only the Musikk QuizCard, not the retired Litteratur card',()=>{
  const id='kulturkirken_jakob_litteratur';
  const legacy=read('data/quizcards/litteratur/topp10_lit_kort_batch3.json');
  const current=read('data/quizcards/musikk/'+id+'_quizkort_v1.json');
  const manifest=read('data/quizcards/musikk/manifest.json');
  assert.ok(!legacy.cards.some(c=>c.targetId===id));
  assert.equal(current.categoryId,'musikk');
  assert.equal(current.cards.length,1);
  assert.equal(current.cards[0].targetId,id);
  assert.equal(current.cards[0].questions.length,10);
  assert.ok(manifest.collections.includes(id+'_quizkort_v1.json'));
});
