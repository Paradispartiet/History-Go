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
  if(articleReady){
    assert.equal(place.fagverk.subject_ids?.includes(p.category),true,p.place_id+': Fagverk subject/category mismatch');
    assert.ok(place.fagverk.article.length>=4,p.place_id+': Fagverk article too short');
    assert.ok(place.fagverk.lenses?.length>=4,p.place_id+': missing Fagverk lenses');
    assert.ok(place.fagverk.guiding_questions?.length>=5,p.place_id+': missing Fagverk questions');
    assert.ok(place.fagverk.observable_traces?.length>=2,p.place_id+': missing observable traces');
    assert.ok(place.fagverk.source_urls?.length>=1,p.place_id+': missing Fagverk sources');
    assert.ok(place.fagverk.source_urls.every(u=>p.sources.includes(u)),p.place_id+': Fagverk source not in research ledger');
    for(const lens of place.fagverk.lenses){
      assert.equal(lens.subject_id,p.category,p.place_id+': lens domain mismatch');
      assert.ok(place.fagverk.emne_ids.includes(lens.emne_id),p.place_id+': unknown lens emne');
    }
  }
  const runtimePlace=read('data/runtime/place-open/'+p.place_id+'.json').place;
  assert.deepEqual(runtimePlace.fagverk,place.fagverk,p.place_id+': runtime place-open Fagverk out of sync');
  assert.match(place.image||'',/^https:\/\//,p.place_id+': missing documentary image');
  assert.match(place.imageSourceUrl||'',/^https:\/\//,p.place_id+': missing image source');
  assert.ok(place.imageCredit&&place.imageLicense,p.place_id+': missing copyright credit or license');
  assert.equal(place.imageMeta?.sourcePage,place.imageSourceUrl,p.place_id+': image metadata source mismatch');
  assert.equal(place.imageMeta?.license,place.imageLicense,p.place_id+': image metadata license mismatch');
  assert.equal(runtimePlace.image,place.image,p.place_id+': runtime image mismatch');
  assert.deepEqual(runtimePlace.imageMeta,place.imageMeta,p.place_id+': runtime image rights mismatch');
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
// A historical quiz should teach people, place changes and consequences, not a list of dates.
// Allow at most one direct year/date-answer per ten questions; dates remain in
// explanations and source evidence when they matter.
const isDirectYearRecall=q=>/^(?:til\s*)?\d{3,4}(?:[-–](?:tallet|årene))?$/.test(String(q.answer).trim()) ||
  /^(?:når\b|i hvilket år\b|hvilket år\b|hvilket århundre\b|hvor lenge\b)/i.test(String(q.question).trim());
const allCandidateIds=new Set();
let candidateCount=0;
for(const group of candidateGroups){
  assert.ok(ledger.places.some(p=>p.place_id===group.place_id),group.place_id+': outside approved scope');
  assert.equal(group.questions.length,10,group.place_id+': not 10 candidates');
  assert.ok(group.questions.filter(isDirectYearRecall).length<=1,group.place_id+': too much date memorization in candidate quiz');
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

// Garmanngården has 21 editorially reviewed draft questions, but is NOT
// registered as a fullquiz/QuizCard until its Knowledge and production-context gates pass.
const garmannDraft=read('reports/place-production/garmanngarden-21-question-editorial-review-20261025.json');
const garmannBrief=read('data/quiz/production_briefs/historie/garmanngarden.json');
assert.equal(garmannDraft.status,'editorial_review_not_manifested');
assert.equal(garmannDraft.targetId,'garmanngarden');
assert.equal(garmannDraft.questions.length,21);
assert.ok(garmannDraft.questions.filter(isDirectYearRecall).length<=2,'Garmanngården draft relies too heavily on exact year memorization');
assert.deepEqual(garmannDraft.sets.map(s=>s.count),[7,7,7]);
assert.deepEqual(garmannDraft.sets.map(s=>s.phase),['opening','bridge','final']);
assert.equal(garmannBrief.targetId,garmannDraft.targetId);
assert.equal(garmannBrief.status,'reviewed');
assert.equal(garmannBrief.claims.length,21);
assert.equal(garmannBrief.profile_decision.set_count,3);
assert.equal(garmannBrief.profile_decision.questions_per_set,7);
assert.equal(garmannDraft.questions.some(q=>/1807|1811/u.test(q.question)),false,'conflicting Hauge years must not be answer questions');
assert.equal(garmannDraft.questions.filter(q=>q.phase==='opening').length,7);
assert.equal(garmannDraft.questions.filter(q=>q.phase==='bridge').length,7);
assert.equal(garmannDraft.questions.filter(q=>q.phase==='final').length,7);
const draftQuestionIds=new Set();
for(const [i,q] of garmannDraft.questions.entries()){
  assert.equal(q.number,i+1,'Non-sequential Garmanngården question');
  assert.equal(q.answer,q.options[q.answerIndex],'Garmanngården incorrect answer index');
  assert.equal(new Set(q.options).size,4,'Garmanngården repeated answer options');
  assert.ok(!draftQuestionIds.has(q.question),'Garmanngården duplicate question');
  draftQuestionIds.add(q.question);
  assert.ok(q.knowledge.length>=30,'Garmanngården missing pedagogical explanation');
  assert.equal(q.claim_id,garmannBrief.claims[i].claim_id,'Garmanngården claim mismatch');
  assert.deepEqual(q.source_ids,garmannBrief.claims[i].source_ids,'Garmanngården source mismatch');
  for(const sid of q.source_ids)assert.equal(garmannBrief.sources[sid].review_status,'reviewed');
}
assert.ok(/kildene|kilder/.test(garmannDraft.questions[20].question.toLowerCase())&&/ulike sluttår/.test(garmannDraft.questions[20].knowledge.toLowerCase()),'Missing evidence-driven source-conflict question');
assert.equal(garmannDraft.status.includes('manifested'),true);

// Canonical-format files exist for Garmanngården, but publishing them requires
// generated Knowledge IDs and the deterministic quiz production context.
const fullQuizPath='data/quiz/historie/garmanngarden_sets.json';
const cardPath='data/quizcards/historie/garmanngarden_quizkort_v1.json';
const fullQuiz=read(fullQuizPath);
const cardPreview=read(cardPath);
assert.equal(fullQuiz.targetId,'garmanngarden');
assert.equal(fullQuiz.categoryId,'historie');
assert.equal(fullQuiz.production_status,'unmanifested_awaiting_deterministic_context_and_knowledge');
assert.deepEqual(fullQuiz.sets.map(s=>s.questions.length),[7,7,7]);
assert.deepEqual(fullQuiz.sets.map(s=>s.phase),['opening','bridge','final']);
const fullQuestions=fullQuiz.sets.flatMap(s=>s.questions);
assert.equal(fullQuestions.length,21);
assert.equal(new Set(fullQuestions.map(q=>q.id)).size,21);
assert.ok(fullQuestions.filter(isDirectYearRecall).length<=2,'Fullquiz requires too much date memorization');
const garmannClassifications=fullQuestions.reduce((out,q)=>{
  const type=(q.question_type==='concept'||q.topic_hook_id)?'concept_theory':(['analysis','context','comparison'].includes(q.question_type)?'context':'fact');
  out[type]=(out[type]||0)+1;
  return out;
},{fact:0,context:0,concept_theory:0});
assert.deepEqual(garmannClassifications,{fact:12,context:5,concept_theory:4},'Lopsided Garmanngården content; must teach more than isolated facts');
const methodQuestion=fullQuestions.find(q=>q.id==='garmanngarden_quiz_21');
assert.equal(methodQuestion.method_id,'met_kildekritikk');
assert.equal(methodQuestion.topic_hook_id,'his_kildekritikk');
assert.equal(methodQuestion.thinker_id,'marc_bloch');
assert.equal(methodQuestion.theory_ref?.topic_hook_id,methodQuestion.topic_hook_id);
assert.ok(methodQuestion.theory_ref?.why_it_helps?.length>50);
assert.equal(garmannBrief.claims[20].family,'concept_theory');
assert.equal(garmannBrief.claims[20].method_id,methodQuestion.method_id);

for(const [i,q] of fullQuestions.entries()){
  const claim=garmannBrief.claims[i];
  const draft=garmannDraft.questions[i];
  assert.equal(q.id,'garmanngarden_quiz_'+String(i+1).padStart(2,'0'));
  assert.equal(q.question,draft.question);
  assert.equal(q.answer,draft.answer);
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.equal(q.claim_id,claim.claim_id);
  assert.equal(q.claim_basis,claim.statement);
  assert.deepEqual(q.source,claim.source_ids);
  assert.equal(q.knowledge,draft.knowledge);
  assert.equal(q.knowledge_link_status,'pending_canonical_generation');
  assert.ok(!q.primary_knowledge_unit_id,'Unverified Knowledge ID cannot be declared linked');
}
assert.equal(cardPreview.production_status,'unmanifested_awaiting_knowledge_parity');
assert.equal(cardPreview.cards.length,1);
const preview=cardPreview.cards[0];
assert.equal(preview.targetId,'garmanngarden');
assert.equal(preview.questionCount,10);
assert.equal(preview.questions.length,10);
assert.equal(preview.answerKey.length,10);
for(const [i,item] of preview.questions.entries()){
  const q=fullQuestions.find(x=>x.id===item.sourceQuestionId);
  assert.ok(q,'QuizCard question is not backed by fullquiz');
  assert.equal(item.question,q.question);
  assert.deepEqual(item.options,q.options);
  assert.equal(item.answerIndex,q.answerIndex);
  assert.equal(item.answer,q.answer);
  assert.equal(item.sourceQuizId,q.quiz_id);
  assert.equal(item.sourceQuizFile,fullQuizPath);
  assert.deepEqual(item.source_refs,q.source);
  assert.deepEqual(item.source_urls,q.source.map(ref=>fullQuiz.sources[ref]));
  assert.equal(item.knowledge,q.knowledge);
  assert.equal(preview.answerKey[i].answer,q.answer);
}
assert.equal((quizManifest.sets||[]).some(s=>s.targetId==='garmanngarden'),false,'Pending Knowledge fullquiz must not be activated');
assert.equal(quizCardSources.historie.collections.includes('garmanngarden_quizkort_v1.json'),false,'Unlinked QuizCard must not be activated');

console.log(JSON.stringify({schema:'oslo_six_research_preflight_v1',status:'PASS_RESEARCH_IDENTITY_ONLY_NOT_V1',candidateCount,records:report},null,2));
