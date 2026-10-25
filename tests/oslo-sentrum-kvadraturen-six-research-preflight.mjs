#!/usr/bin/env node
// Pre-production identity/source gate for PR #6578. This is NOT a v1 acceptance test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const ledger=read('reports/place-production/oslo-sentrum-kvadraturen-six-source-ledger-20261024.json');
assert.equal(ledger.schema,'history_go_oslo_kvadraturen_six_source_ledger_v1');
assert.equal(ledger.status,'research_only_not_published');
assert.equal(ledger.places.length,6);
assert.equal(ledger.publication_policy.v1_status,'NONE_APPROVED');
assert.equal(new Set(ledger.places.map(p=>p.place_id)).size,6);
const allPaths=new Set(read('data/places/manifest.json').files.map(p=>p.startsWith('data/')?p:'data/'+p));
const quizManifest=read('data/quiz/manifest.json');
const quizRefs=[...(quizManifest.sets||[]),...(quizManifest.targets||[])];
const quizCardSources={
  historie:read('data/quizcards/historie/manifest.json'),
  naeringsliv:read('data/quizcards/naeringsliv/manifest.json')
};
const report=[];
for(const p of ledger.places){
  assert.equal(allPaths.has(p.path),true,p.place_id+': canonical path absent from place manifest');
  assert.equal(fs.existsSync(p.path),true,p.place_id+': canonical Place missing');
  const place=read(p.path);
  assert.equal(place.id,p.place_id,p.place_id+': ID mismatch');
  assert.equal(place.category,p.category,p.place_id+': category mismatch');
  assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon),p.place_id+': no coordinates');
  assert.ok(typeof place.desc==='string'&&place.desc.length>50,p.place_id+': missing ingress');
  assert.ok(typeof place.popupDesc==='string'&&place.popupDesc.length>250,p.place_id+': missing historical article');
  assert.ok(p.sources.length>=1 && p.claims.length>=4,p.place_id+': insufficient traceable research');
  for(const [n,c] of p.claims.entries()){
    assert.equal(c.claim_id,p.place_id+'_source_'+String(n+1).padStart(2,'0'),p.place_id+': noncanonical claim id');
    assert.ok(c.statement.length>=40 && c.refs.length>=1,p.place_id+': empty or unreferenced claim');
    for(const ref of c.refs) assert.ok(Number.isInteger(ref)&&ref>=0&&ref<p.sources.length,p.place_id+': invalid citation index');
  }
  for(const url of p.sources) assert.match(url,/^https:\/\//);
  const relevantQuiz=quizRefs.filter(r=>r.targetId===p.place_id);
  const categoryQuizCardPaths=quizCardSources[p.category].collections.map(n=>'data/quizcards/'+p.category+'/'+n);
  const missingLegacyQuizCardFiles=categoryQuizCardPaths.filter(f=>!fs.existsSync(f));
  const categoryQuizCardMatches=categoryQuizCardPaths.filter(f=>
    fs.existsSync(f) && fs.readFileSync(f,'utf8').includes('"'+p.place_id+'"')
  );
  const articleReady=place.fagverk?.schema==='history_go_place_fagverk_v2' &&
    place.fagverk?.status==='curated' &&
    Array.isArray(place.fagverk?.article)&&place.fagverk.article.length>0;
  const visualReady=Boolean(place.frontImage&&place.image&&place.cardImage);
  report.push({id:p.place_id,canonical:true,sourceClaims:p.claims.length,quizSetFiles:relevantQuiz.map(z=>z.file),quizCardCollections:categoryQuizCardMatches,missingLegacyQuizCardFiles,fagverkReady:articleReady,visualFieldsReady:visualReady,notYetV1:!(relevantQuiz.length&&categoryQuizCardMatches.length&&articleReady&&visualReady)});
}
// Source-led quiz candidates are editorial inputs, never automatically published sets.
const quizCandidates=read('reports/place-production/oslo-sentrum-kvadraturen-first20-quiz-candidates-20261024.json');
assert.equal(quizCandidates.schema,'history_go_oslo_kvadraturen_quiz_candidates_v1');
assert.equal(quizCandidates.status,'editorial_candidates_not_manifested');
assert.equal(quizCandidates.places.length,2);
const additionalQuizCandidates=read('reports/place-production/oslo-sentrum-kvadraturen-next40-quiz-candidates-20261025.json');
assert.equal(additionalQuizCandidates.schema,'history_go_oslo_kvadraturen_quiz_candidates_v1');
assert.equal(additionalQuizCandidates.status,'editorial_candidates_not_manifested');
assert.equal(additionalQuizCandidates.places.length,4);
const candidateGroups=[...quizCandidates.places,...additionalQuizCandidates.places];
const candidatePlaceIds=candidateGroups.map(g=>g.place_id);
assert.equal(new Set(candidatePlaceIds).size,6,'missing or repeated place groups');
assert.deepEqual(new Set(candidatePlaceIds),new Set(ledger.places.map(p=>p.place_id)));
const allClaims=new Map(ledger.places.flatMap(p=>p.claims.map(c=>[c.claim_id,p.place_id])));
const allCandidateIds=new Set();
let candidateCount=0;
for(const group of candidateGroups){
  assert.ok(ledger.places.some(p=>p.place_id===group.place_id),group.place_id+': outside approved scope');
  assert.equal(group.questions.length,10,group.place_id+': not 10 candidates');
  for(const q of group.questions){
    candidateCount++;
    assert.ok(!allCandidateIds.has(q.candidate_id),'Repeated candidate ID');
    allCandidateIds.add(q.candidate_id);
    assert.equal(q.options.length,4,q.candidate_id+': options');
    assert.ok(q.options.every(o=>typeof o==='string'&&o.trim().length>2),q.candidate_id+': empty options');
    assert.ok(Number.isInteger(q.answer_index)&&q.answer_index>=0&&q.answer_index<4,q.candidate_id+': invalid answer index');
    assert.equal(new Set(q.options).size,4,q.candidate_id+': duplicate distractor');
    assert.equal(q.options[q.answer_index],q.answer,q.candidate_id+': wrong answer mapping');
    assert.ok(q.question.length>25&&q.claim_ids.length>=1,q.candidate_id+': no question or source claim');
    for(const id of q.claim_ids) assert.equal(allClaims.get(id),group.place_id,q.candidate_id+': cross-place claim');
    assert.equal(q.status,'source_led_editorial_candidate',q.candidate_id+': falsely approved candidate');
  }
}
assert.equal(candidateCount,60);
console.log(JSON.stringify({schema:'oslo_six_research_preflight_v1',status:'PASS_RESEARCH_IDENTITY_ONLY_NOT_V1',candidateCount,records:report},null,2));
