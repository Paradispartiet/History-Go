#!/usr/bin/env node
// Editorial integrity guard. Passing this is NOT historical source approval,
// Knowledge linking, browser acceptance or permission to publish.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const load = path => JSON.parse(fs.readFileSync(path,'utf8'));
const root = 'reports/place-production/oslo-sentrum-next-six-';
const first = load(root+'first42-mcq-candidates-20261027.json');
const rest = load(root+'additional84-mcq-candidates-20261027.json');
const cards = load(root+'quizcard60-candidates-20261027.json');
const media = load(root+'media-provenance-20261027.json');
const files = {
  kontraskjaeret:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04/kontraskjaeret.json',
  palehaven_paleet:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04/palehaven_paleet.json',
  avisen_tiden_radhusgata_10:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01/avisen_tiden_radhusgata_10.json',
  egertorget:'data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/egertorget.json',
  mustadgarden_kongens_gate_3:'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01/mustadgarden_kongens_gate_3.json',
  wessels_plass:'data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/wessels_plass.json'
};
const assertSame = (a,b,msg) => assert.deepEqual(a,b,msg);
let totalQuiz=0,totalCards=0;
const positionCounts=[0,0,0,0];
const candidateIds = new Set();
for(const [id,path] of Object.entries(files)){
  const place = load(path);
  assert.equal(place.id,id,id+' canonical identity');
  const a=first.places.find(x=>x.place_id===id);
  const b=rest.places.find(x=>x.place_id===id);
  const c=cards.collections.find(x=>x.place_id===id);
  assert.ok(a && b && c,id+' three editorial inventories');
  assert.equal(a.questions.length,7,id+' original seven');
  assert.equal(b.questions.length,14,id+' next fourteen');
  assert.equal(c.questions.length,10,id+' selected ten');
  const questions=[...a.questions,...b.questions];
  const ids=new Map();
  const questionText=new Set();
  for(const q of questions){
    assert.equal(q.options?.length,4,id+' options');
    assert.equal(new Set(q.options.map(s=>s.trim().toLocaleLowerCase('nb-NO'))).size,4,id+' unique options');
    assert.equal(Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<4,true,id+' answer index');
    assert.ok(q.explanation?.length>=30,id+' substantive explanation');
    assert.ok(q.question?.length>=20 && q.question.endsWith('?'),id+' question format');
    assert.ok(q.source_urls?.length>=1 && q.source_urls.every(s=>s.startsWith('https://')),id+' external provenance');
    assert.equal(q.review_status,'source_and_distractor_review_pending',id+' cannot preapprove sources');
    assert.ok(!/^\d{4}$/.test(q.options[q.answerIndex].trim()),id+' no year-answer drill');
    assert.ok(!/\bhvilket år\b/i.test(q.question),id+' no year drilling');
    assert.ok(!ids.has(q.candidate_id)&&!candidateIds.has(q.candidate_id),id+' no duplicate candidate ID');
    const key=q.question.replaceAll(/\s+/g,' ').toLocaleLowerCase('nb-NO');
    assert.ok(!questionText.has(key),id+' no duplicate question');
    questionText.add(key);
    ids.set(q.candidate_id,q);
    candidateIds.add(q.candidate_id);
    positionCounts[q.answerIndex]++;
  }
  for(const card of c.questions){
    const quiz=ids.get(card.source_candidate_id);
    assert.ok(quiz,id+' missing source candidate');
    assert.equal(card.review_status,'candidate_source_review_pending');
    assertSame(card.options,quiz.options,id+' card option parity');
    assert.equal(card.question,quiz.question,id+' card question parity');
    assert.equal(card.answerIndex,quiz.answerIndex,id+' card answer parity');
    assert.equal(card.answer,quiz.options[quiz.answerIndex],id+' card exact answer');
    assertSame(card.source_urls,quiz.source_urls,id+' card sources');
    assert.deepEqual(card.knowledge_unit_ids,[],id+' do not fake Knowledge links');
  }
  for(const key of ['image','frontImage','cardImage']){
    assert.ok(place[key]?.endsWith('.webp') && fs.existsSync(place[key]),id+' requires locally present '+key);
  }
  assert.ok(place.imageLicense && place.imageSourceUrl?.startsWith('https://commons.wikimedia.org/'),id+' licensed image');
  if (id!=='wessels_plass') {
    const rec=media.items.find(x=>x.placeId===id);
    assert.ok(rec && rec.assets.length===3,id+' traceable local images');
    for(const asset of rec.assets){
      assert.ok(fs.existsSync(asset.target),id+' missing asset '+asset.target);
      const bytes=fs.readFileSync(asset.target);
      const sha=crypto.createHash('sha256').update(bytes).digest('hex');
      assert.equal(sha,asset.sha256,id+' changed asset without provenance refresh');
      const tag=asset.target===place.image?'imageMeta':asset.target===place.frontImage?'frontImageMeta':'cardImageMeta';
      assert.equal(place[tag]?.outputSha256,sha,id+' metadata hash parity '+tag);
    }
  }
  totalQuiz+=questions.length;totalCards+=c.questions.length;
}
assert.equal(totalQuiz,126);
assert.equal(totalCards,60);
assert.equal(candidateIds.size,126);
assert.ok(positionCounts.every(n=>n>=20 && n<=45),'excessive answer-position imbalance');
console.log('OSLO_NEXT_SIX_EDITORIAL_PARITY_PASS',JSON.stringify({places:6,fullQuizCandidates:totalQuiz,quizCardCandidates:totalCards,answerPositions:positionCounts,liveQuestions:false}));
