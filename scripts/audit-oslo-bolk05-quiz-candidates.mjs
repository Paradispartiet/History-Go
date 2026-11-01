#!/usr/bin/env node
// Scoped read-only QA for Oslo sentrum bolk 05. Never registers or publishes quiz.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const scope = [
  ['kunstnernes_hus','kunst','kunstnernes-hus'],
  ['historisk_museum','historie','historisk-museum'],
  ['ibsen_museum_teater','litteratur','ibsen-museum-teater'],
  ['blitzhuset','subkultur','blitzhuset'],
  ['kulturkirken_jakob_litteratur','musikk','kulturkirken-jakob-litteratur']
];
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const candidatesFile = 'reports/place-production/oslo-bolk05-quizcards50-candidates-20261101.json';
const cards = read(candidatesFile);
const manifest = read('data/quiz/manifest.json');
const cardManifest = read('data/quizcards/scenekunst/manifest.json');
const globallySeen = new Set();
const errors = [];
const findings = [];
const fail = (id, issue) => errors.push({placeId:id,issue});
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);

if (cards.expectedCollections !== 5 || cards.expectedQuestions !== 50 || cards.collections?.length !== 5)
  fail('bolk05','QuizCard candidate manifest must have exactly five collections and 50 questions');
const ownedTargets = new Set(scope.map(x=>x[0]));
for (const entry of cards.collections||[])
  if (!ownedTargets.has(entry.placeId)) fail('bolk05','QuizCard candidate file includes out-of-scope target '+entry.placeId);

for (const [id, category, slug] of scope) {
  const filename = 'reports/place-production/oslo-bolk05-'+slug+'-quiz21-candidates-20261101.json';
  const data = read(filename);
  const packet = read('data/places/production/'+id+'.json');
  const collection = cards.collections.find(x=>x.placeId===id);
  const qs = data.questions || [];
  const cq = collection?.cards || [];
  const claims = new Map((packet.claims||[]).map(c=>[c.id,c]));
  const briefFile='data/quiz/production_briefs/'+category+'/'+id+'.json';
  const brief=read(briefFile);
  if(brief.categoryId!==category || brief.targetId!==id || brief.status!=='partial')
    fail(id,'Production brief must be correctly scoped and transparently partial');
  if(brief.profile_decision?.set_count!==3 || brief.profile_decision?.questions_per_set!==7)
    fail(id,'Production brief must specify three sets of seven');
  if(brief.claims?.length!==21) fail(id,'Production brief must document all 21 candidate claims');
  for(const [i,q] of qs.entries()){
    const claim=brief.claims?.[i];
    if(claim?.order!==i+1 || claim?.statement!==q.knowledge ||
       claim?.source_ids?.length!==q.source_urls?.length ||
       !equal(claim?.source_ids,q.source_urls))
      fail(id,'Production brief claim or URL drift at '+(i+1));
    for(const sourceId of q.source_urls||[]){
      if(!brief.sources?.[sourceId] || brief.sources[sourceId].url!==sourceId)
        fail(id,'Production brief missing source '+sourceId);
    }
  }
  if (data.targetId!==id || data.categoryId!==category || packet.placeId!==id)
    fail(id,'Place ID/category not in expected canonical scope');
  if(qs.length!==21 || cq.length!==10 || collection?.sourceQuestionIds?.length!==10)
    fail(id,'Expected 21 fullquiz candidates and 10 QuizCard candidates');
  const localIds=new Set(), localQuestions=new Set();
  for(const [i,q] of qs.entries()) {
    const expectedSet=Math.floor(i/7)+1, expectedOrder=i%7+1;
    if (q.set!==expectedSet || q.order!==expectedOrder) fail(id,'set and order must be 3x7 at '+(i+1));
    if(!q.candidate_id || localIds.has(q.candidate_id) || globallySeen.has(q.candidate_id))
      fail(id,'missing or duplicate candidate ID '+String(q.candidate_id));
    localIds.add(q.candidate_id);globallySeen.add(q.candidate_id);
    if(!q.question || localQuestions.has(q.question)) fail(id,'missing or duplicate question at '+(i+1));
    localQuestions.add(q.question);
    if(!Array.isArray(q.options) || q.options.length!==4 || new Set(q.options).size!==4)
      fail(id,'must have four distinct options at '+(i+1));
    if(!Number.isInteger(q.answerIndex) || q.options?.[q.answerIndex]!==q.answer)
      fail(id,'answer/index mismatch at '+(i+1));
    if(!q.knowledge || !q.source_urls?.length ||
       q.source_urls.some(url=>typeof url!=='string' || !url.startsWith('https://')))
      fail(id,'missing knowledge or inspectable source URL at '+(i+1));
    if(!claims.has(q.claim_id) || claims.get(q.claim_id)?.status!=='verified')
      fail(id,'unknown/unverified source claim '+String(q.claim_id));
    if(!Array.isArray(q.knowledge_unit_ids) || q.knowledge_unit_ids.length!==0)
      fail(id,'candidates must not invent canonical Knowledge IDs');
  }
  const idsFromCards=[];
  for(const [i,c] of cq.entries()){
    const q=qs.find(x=>x.candidate_id===c.source_candidate_id);
    idsFromCards.push(c.source_candidate_id);
    if(!q) {fail(id,'QuizCard missing candidate '+String(c.source_candidate_id));continue}
    for(const field of ['question','options','answer','answerIndex','knowledge','claim_id','source_urls'])
      if(!equal(c[field],q[field])) fail(id,'QuizCard parity error '+field+' at '+(i+1));
    if(c.number!==i+1) fail(id,'QuizCard numbers must be 1-10');
  }
  if(new Set(idsFromCards).size!==10 ||
     !equal(collection?.sourceQuestionIds,idsFromCards))
    fail(id,'QuizCard source IDs are not a unique ordered copy of the source questions');
  const canonicalManifestEntries=(manifest.sets||[]).filter(x=>x.targetId===id);
  const yearMemorization=qs.filter(x=>/hvilket år|når ble|i hvilket år/iu.test(x.question)).length;
  findings.push({placeId:id,categoryId:category,candidateQuestions:qs.length,
    candidateCardQuestions:cq.length,claims:claims.size,
    canonicalManifestEntries:canonicalManifestEntries.length,
    yearMemorizationQuestions:yearMemorization,
    openGates:['source-claim-editorial-signoff','Fagverk theory/method review',
      'canonical Knowledge generation','quiz and card manifest integration','real app 390/1440 QA']});
}

// Existing Folketeateret quiz and card are strictly protected against duplicate ownership.
const folk=read('data/quiz/scenekunst/folketeateret_sets.json');
const folkQuestions=(folk.sets||[]).flatMap(s=>s.questions||[]);
const folkCards=read('data/quizcards/scenekunst/folketeateret_quizkort_v1.json');
const cardList=(folkCards.cards||[]).flatMap(c=>c.questions||[]);
if(folk.targetId!=='folketeateret' || folkQuestions.length!==21 || cardList.length!==10)
  fail('folketeateret','Existing 21 fullquiz questions and 10-card selection must remain intact');
for (const c of cardList){
  const question=folkQuestions.find(q=>q.id===c.sourceQuestionId);
  if(!question || c.question!==question.question || c.answer!==question.answer ||
     c.answerIndex!==question.answerIndex || !equal(c.options,question.options))
     fail('folketeateret','Card is not identical to fullquiz '+String(c.sourceQuestionId));
}
if (!cardManifest.collections?.includes('folketeateret_quizkort_v1.json'))
  fail('folketeateret','Existing card manifest entry is missing');
const result={schema:'oslo_bolk05_quiz_candidate_audit_v1',status:errors.length?'failed':'passed',
  candidateQuestionCount:findings.reduce((n,f)=>n+f.candidateQuestions,0),
  candidateQuizCardCount:findings.reduce((n,f)=>n+f.candidateCardQuestions,0),
  playableFolketeateretQuestions:folkQuestions.length,
  folketeateretCardQuestions:cardList.length,
  findings,errors};
if(process.argv.includes('--json')) console.log(JSON.stringify(result,null,2));
else {
  console.log('OSLO05_QUIZ_CANDIDATE_AUDIT',result.status,
    'candidate',result.candidateQuestionCount,'cards',result.candidateQuizCardCount,
    'folkquiz',folkQuestions.length,'folkcards',cardList.length);
  for(const e of errors)console.error('OSLO05_ERROR',e.placeId,e.issue);
}
if(errors.length)process.exitCode=1;
