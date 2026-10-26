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

// The editorial source draft remains independent of runtime publication. Garmanngården
// is the first activated quiz of the six; the other five remain candidates.
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

// Canonical fullquiz, linked QuizCard and deterministic production context must agree.
const fullQuizPath='data/quiz/historie/garmanngarden_sets.json';
const cardPath='data/quizcards/historie/garmanngarden_quizkort_v1.json';
const fullQuiz=read(fullQuizPath);
const cardPreview=read(cardPath);
assert.equal(fullQuiz.targetId,'garmanngarden');
assert.equal(fullQuiz.categoryId,'historie');
assert.equal(fullQuiz.production_status,'manifested_knowledge_linked_browser_qa_passed');
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
  assert.equal(q.knowledge_link_status,'linked');
  assert.ok(q.primary_knowledge_unit_id?.startsWith('ku_historie_'),'Missing canonical Knowledge unit');
  assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id),'Primary Knowledge unit not in IDs');
  assert.equal(q.knowledge_contract_version,1);
}
assert.equal(cardPreview.production_status,'knowledge_linked_fullquiz_browser_passed_visual_pending');
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
  assert.equal(item.knowledge_link_status,'linked');
  assert.equal(item.primary_knowledge_unit_id,q.primary_knowledge_unit_id);
  assert.deepEqual(item.knowledge_unit_ids,q.knowledge_unit_ids);
  assert.equal(item.knowledge_contract_version,q.knowledge_contract_version);
}
assert.equal((quizManifest.sets||[]).filter(s=>s.targetId==='garmanngarden'&&s.file===fullQuizPath).length,1,'Garmanngården fullquiz not registered exactly once');
assert.equal(quizCardSources.historie.collections.filter(f=>f==='garmanngarden_quizkort_v1.json').length,1,'Linked QuizCard must be registered exactly once');
const canonicalKnowledge=read('data/knowledge/knowledge_units.generated.json');
const knowledgeIds=new Set((canonicalKnowledge.units||[]).map(u=>u.knowledge_unit_id));
for(const q of fullQuestions)for(const id of q.knowledge_unit_ids){
  assert.ok(knowledgeIds.has(id),'Missing unit '+id+' in generated canonical Knowledge registry');
}
const persistedContext=read('data/quiz/production_context/historie/garmanngarden.json');
assert.equal(persistedContext.targetId,'garmanngarden');
assert.equal(persistedContext.claim_bank.length,21);
assert.equal(persistedContext.question_balance.counts.concept_theory,4);
assert.deepEqual(persistedContext.set_plan.map(x=>x.planned_questions),[7,7,7]);
// Krigsskolen is the second active quiz, with canonical Knowledge linking,
// but visual place/front-card QA is a separate release decision.
const krigId='den_gamle_krigsskolen';
const krigQuizPath='data/quiz/historie/'+krigId+'_sets.json';
const krigCardPath='data/quizcards/historie/'+krigId+'_quizkort_v1.json';
const krigQuiz=read(krigQuizPath);
const krigCard=read(krigCardPath);
const krigBrief=read('data/quiz/production_briefs/historie/'+krigId+'.json');
const krigContext=read('data/quiz/production_context/historie/'+krigId+'.json');
assert.equal(krigQuiz.targetId,krigId);
assert.equal(krigQuiz.production_status,'manifested_knowledge_linked_browser_qa_passed');
assert.equal(krigContext.profile,'narrow_3x7');
assert.equal(krigContext.source_review_status,'reviewed');
assert.equal(krigContext.claim_bank.length,21);
assert.deepEqual(krigContext.question_balance.counts,{fact:12,context:5,concept_theory:4});
assert.deepEqual(krigContext.set_plan.map(s=>s.planned_questions),[7,7,7]);
assert.deepEqual(krigQuiz.sets.map(s=>s.questions.length),[7,7,7]);
const krigQuestions=krigQuiz.sets.flatMap(s=>s.questions);
assert.equal(krigQuestions.length,21);
assert.equal(krigBrief.claims.length,21);
assert.equal(krigQuestions.filter(isDirectYearRecall).length,0,'Krigsskolen must not turn into date trivia');
assert.ok(krigQuestions.slice(0,14).every(q=>q.question_type!=='concept'),'First two Krigsskolen sets must be ordinary place/history questions');
const krigIds=new Set();
for(const [i,q] of krigQuestions.entries()){
  assert.equal(q.id,'den_gamle_krigsskolen_quiz_'+String(i+1).padStart(2,'0'));
  assert.ok(!krigIds.has(q.id),'Duplicate Krigsskolen quiz ID');
  krigIds.add(q.id);
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.equal(new Set(q.options).size,4);
  assert.equal(q.claim_id,krigBrief.claims[i].claim_id);
  assert.equal(q.knowledge,krigBrief.claims[i].statement);
  assert.deepEqual(q.source,krigBrief.claims[i].source_ids);
  assert.equal(q.knowledge_link_status,'linked');
  assert.ok(q.primary_knowledge_unit_id?.startsWith('ku_historie_'));
  assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id));
}
assert.equal(quizRefs.filter(r=>r.targetId===krigId&&r.file===krigQuizPath).length,1,'Krigsskolen quiz not registered once');
assert.equal(quizCardSources.historie.collections.filter(x=>x===krigId+'_quizkort_v1.json').length,1,'Krigsskolen QuizCard not registered once');
assert.equal(krigCard.production_status,'knowledge_linked_fullquiz_browser_passed_visual_pending');
assert.equal(krigCard.cards[0].questionCount,10);
assert.equal(krigCard.cards[0].questions.length,10);
assert.equal(krigCard.cards[0].questions.filter(q=>q.knowledge_link_status==='linked').length,10);
for(const [i,item] of krigCard.cards[0].questions.entries()){
  const orig=krigQuestions.find(q=>q.id===item.sourceQuestionId);
  assert.ok(orig,'QuizCard refers to a missing fullquiz question');
  assert.equal(item.question,orig.question);
  assert.deepEqual(item.options,orig.options);
  assert.equal(item.answer,orig.answer);
  assert.equal(item.answerIndex,orig.answerIndex);
  assert.deepEqual(item.source_refs,orig.source);
  assert.equal(item.primary_knowledge_unit_id,orig.primary_knowledge_unit_id);
  assert.deepEqual(item.knowledge_unit_ids,orig.knowledge_unit_ids);
  assert.equal(krigCard.cards[0].answerKey[i].answer,orig.answer);
}
// Stattholdergården has a reviewed, 21-question production source brief and
// a fully answered MCQ review bank. It must remain out of runtime manifests
// until the existing context builder and Knowledge synchronizer have run.
const stattholderId='stattholdergarden';
const stattholderBrief=read('data/quiz/production_briefs/historie/'+stattholderId+'.json');
const stattholderReview=read('reports/place-production/oslo-kvadraturen-stattholdergarden-21-fullquiz-review-20261025.json');
assert.equal(stattholderBrief.targetId,stattholderId);
assert.equal(stattholderBrief.status,'reviewed');
assert.equal(stattholderBrief.claims.length,21);
assert.equal(stattholderBrief.profile_decision.profile,'narrow');
assert.equal(stattholderBrief.profile_decision.set_count,3);
assert.deepEqual(stattholderReview.sections.map(s=>s.questions.length),[7,7,7]);
assert.deepEqual(stattholderReview.sections.map(s=>s.phase),['opening','bridge','final']);
assert.equal(stattholderReview.status.includes('unmanifested'),true);
const stattholderItems=stattholderReview.sections.flatMap(s=>s.questions);
assert.equal(stattholderItems.filter(isDirectYearRecall).length,0,'Stattholdergården should prioritize people and building layers, not date recall');
assert.equal(new Set(stattholderItems.map(q=>q.question)).size,21,'Stattholdergården duplicate questions');
assert.ok(new Set(stattholderItems.map(q=>q.answerIndex)).size===4,'Stattholdergården answer positions lack variety');
for(const [i,q] of stattholderItems.entries()){
  assert.equal(q.id,stattholderId+'_quiz_'+String(i+1).padStart(2,'0'));
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.ok(q.knowledge.length>=55,'Missing source explanation for '+q.id);
  assert.equal(q.claim_id,stattholderBrief.claims[i].claim_id);
  assert.equal(q.knowledge,stattholderBrief.claims[i].statement);
  assert.deepEqual(q.source,stattholderBrief.claims[i].source_ids);
  assert.ok(q.source.length>=1);
  for(const ref of q.source){
    assert.equal(stattholderBrief.sources[ref]?.review_status,'reviewed',q.id+': unreviewed source '+ref);
  }
  if(i<14)assert.ok(['fact','context'].includes(q.question_type),q.id+': advanced pedagogy in normal opening');
}
assert.equal(stattholderItems.some(q=>/1862|1863/u.test(q.question)),false,'Conflicting Engebret transfer dates must not become single answer');
// Hotel du Nord has a source-reviewed 21-question quiz preparation bank,
// with the primary source dating departure before Christmas 2024, not today.
const hotelId='hotel_du_nord';
const hotelBrief=read('data/quiz/production_briefs/naeringsliv/'+hotelId+'.json');
const hotelReview=read('reports/place-production/oslo-kvadraturen-hotel-du-nord-21-fullquiz-review-20261025.json');
assert.equal(hotelBrief.status,'reviewed');
assert.equal(hotelBrief.targetId,hotelId);
assert.equal(hotelBrief.claims.length,21);
assert.equal(hotelReview.targetId,hotelId);
assert.equal(hotelReview.status.includes('unmanifested'),true);
assert.equal(hotelReview.profile,'narrow_3x7');
assert.deepEqual(hotelReview.sections.map(s=>s.questions.length),[7,7,7]);
assert.deepEqual(hotelReview.sections.map(s=>s.phase),['opening','bridge','final']);
const hotelItems=hotelReview.sections.flatMap(s=>s.questions);
assert.equal(hotelItems.filter(isDirectYearRecall).length,0,'Hotel du Nord focuses on change, people and place rather than isolated date recall');
assert.equal(new Set(hotelItems.map(q=>q.question)).size,21,'Hotel du Nord duplicate questions');
assert.equal(new Set(hotelItems.map(q=>q.answerIndex)).size,4,'Hotel du Nord missing varied correct options');
for(const [i,q] of hotelItems.entries()){
  assert.equal(q.id,hotelId+'_quiz_'+String(i+1).padStart(2,'0'));
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);
  assert.equal(q.options[q.answerIndex],q.answer);
  assert.ok(q.knowledge.length>=55);
  assert.equal(q.claim_id,hotelBrief.claims[i].claim_id);
  assert.equal(q.knowledge,hotelBrief.claims[i].statement);
  assert.deepEqual(q.source,hotelBrief.claims[i].source_ids);
  for(const src of q.source)assert.equal(hotelBrief.sources[src]?.review_status,'reviewed');
  if(i<14)assert.ok(['fact','context'].includes(q.question_type));
}
assert.match(hotelItems[20].knowledge,/1991.*før jul 2024/u,'Hotel du Nord must use the primary-source departure date');
assert.equal(hotelBrief.sources.riksantikvaren_flytting.url,'https://riksantikvaren.no/kommet-i-hus-pa-gronland/');
assert.ok(hotelItems[20].source.includes('riksantikvaren_flytting'),'Departure date needs the primary source');
// The remaining two Næringsliv source packages use the same existing
// canonical production contract. These banks are reviewed editorial inputs,
// not independently registered playable quiz files.
for(const targetId of ['cafe_engebret','treschowgarden']){
  const bankName='reports/place-production/oslo-kvadraturen-'+targetId.replaceAll('_','-')+'-21-fullquiz-review-20261025.json';
  const productionBrief=read('data/quiz/production_briefs/naeringsliv/'+targetId+'.json');
  const bank=read(bankName);
  assert.equal(productionBrief.status,'reviewed');
  assert.equal(productionBrief.targetId,targetId);
  assert.equal(productionBrief.categoryId,'naeringsliv');
  assert.equal(productionBrief.claims.length,21);
  assert.equal(bank.targetId,targetId);
  assert.equal(bank.profile,'narrow_3x7');
  assert.equal(bank.status.includes('unmanifested'),true);
  assert.deepEqual(bank.sections.map(s=>s.questions.length),[7,7,7]);
  assert.deepEqual(bank.sections.map(s=>s.phase),['opening','bridge','final']);
  const list=bank.sections.flatMap(s=>s.questions);
  assert.equal(new Set(list.map(q=>q.question)).size,21,targetId+': duplicated question');
  assert.equal(new Set(list.map(q=>q.answerIndex)).size,4,targetId+': missing answer-index variety');
  assert.equal(list.filter(isDirectYearRecall).length,0,targetId+': unwanted isolated date recall');
  for(const [i,q] of list.entries()){
    assert.equal(q.id,targetId+'_quiz_'+String(i+1).padStart(2,'0'));
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.equal(q.answer,q.options[q.answerIndex]);
    assert.ok(q.knowledge.length>=45);
    assert.equal(q.claim_id,productionBrief.claims[i].claim_id);
    assert.equal(q.knowledge,productionBrief.claims[i].statement);
    assert.deepEqual(q.source,productionBrief.claims[i].source_ids);
    for(const src of q.source) assert.equal(productionBrief.sources[src]?.review_status,'reviewed',q.id+': unreviewed source '+src);
    if(i<14) assert.ok(['fact','context'].includes(q.question_type),q.id+': specialized method before two normal sets');
  }
  assert.equal(quizRefs.filter(r=>r.targetId===targetId&&r.file==='data/quiz/naeringsliv/'+targetId+'_sets.json').length,1,targetId+': missing linked fullquiz manifest');
  assert.equal(quizCardSources.naeringsliv.collections.filter(f=>f===targetId+'_quizkort_v1.json').length,1,targetId+': missing QuizCard manifest');
  const q=read('data/quiz/naeringsliv/'+targetId+'_sets.json');
  const cards=read('data/quizcards/naeringsliv/'+targetId+'_quizkort_v1.json');
  const context=read('data/quiz/production_context/naeringsliv/'+targetId+'.json');
  assert.equal(q.targetId,targetId);
  assert.equal(q.production_status,'manifested_knowledge_linked_browser_qa_passed');
  assert.equal(cards.production_status,'knowledge_linked_fullquiz_browser_passed_visual_pending');
  assert.equal(context.profile,'narrow_3x7');
  assert.equal(context.claim_bank.length,21);
  assert.deepEqual(context.question_balance.counts,{fact:12,context:5,concept_theory:4});
  assert.deepEqual(q.sets.map(x=>x.questions.length),[7,7,7]);
  assert.ok(q.sets.slice(0,2).every(set=>set.questions.every(x=>x.question_type!=='concept')),'Specialized theory before final set');
  const qs=q.sets.flatMap(set=>set.questions);
  assert.equal(qs.filter(isDirectYearRecall).length,0,'Date memorization in '+targetId);
  assert.equal(qs.length,21);
  for(const [i,item] of qs.entries()){
    const claim=productionBrief.claims[i];
    assert.equal(item.claim_id,claim.claim_id);
    assert.equal(item.claim_basis,claim.statement);
    assert.deepEqual(item.source,claim.source_ids);
    assert.equal(item.answer,item.options[item.answerIndex]);
    assert.equal(new Set(item.options).size,4);
    assert.equal(item.knowledge_link_status,'linked');
    assert.ok(item.primary_knowledge_unit_id?.startsWith('ku_naeringsliv_'));
    assert.ok(item.knowledge_unit_ids?.includes(item.primary_knowledge_unit_id));
  }
  assert.equal(cards.cards[0].questions.length,10);
  const byId=new Map(qs.map(x=>[x.id,x]));
  for(const [i,item] of cards.cards[0].questions.entries()){
    const source=byId.get(item.sourceQuestionId);
    assert.ok(source,targetId+': QuizCard source not found');
    assert.equal(item.question,source.question);
    assert.deepEqual(item.options,source.options);
    assert.equal(item.answer,source.answer);
    assert.equal(item.answerIndex,source.answerIndex);
    assert.deepEqual(item.source_refs,source.source);
    assert.equal(item.knowledge_link_status,'linked');
    assert.equal(item.primary_knowledge_unit_id,source.primary_knowledge_unit_id);
    assert.deepEqual(item.knowledge_unit_ids,source.knowledge_unit_ids);
    assert.equal(cards.cards[0].answerKey[i].answer,source.answer);
  }
}
// Stattholdergården is the third active source-backed quiz, not a completed v1 Place.
const statQuizPath='data/quiz/historie/stattholdergarden_sets.json';
const statCardPath='data/quizcards/historie/stattholdergarden_quizkort_v1.json';
const statQuiz=read(statQuizPath);
const statCard=read(statCardPath);
const statContext=read('data/quiz/production_context/historie/stattholdergarden.json');
const statQuestions=statQuiz.sets.flatMap(s=>s.questions);
assert.equal(statQuiz.production_status,'manifested_knowledge_linked_browser_qa_passed');
assert.equal(statContext.profile,'narrow_3x7');
assert.deepEqual(statContext.set_plan.map(s=>s.planned_questions),[7,7,7]);
assert.deepEqual(statContext.question_balance.counts,{fact:12,context:5,concept_theory:4});
assert.equal(statQuestions.length,21);
assert.deepEqual(statQuiz.sets.map(s=>s.questions.length),[7,7,7]);
assert.equal(statQuestions.filter(isDirectYearRecall).length,0);
assert.ok(statQuestions.slice(0,14).every(q=>['fact','context'].includes(q.question_type)));
for(const [i,q] of statQuestions.entries()){
  const claim=stattholderBrief.claims[i];
  assert.equal(q.claim_id,claim.claim_id);
  assert.equal(q.claim_basis,claim.statement);
  assert.deepEqual(q.source,claim.source_ids);
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.equal(q.knowledge_link_status,'linked');
  assert.ok(q.primary_knowledge_unit_id?.startsWith('ku_historie_'));
  assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id));
}
assert.equal(quizRefs.filter(x=>x.targetId==='stattholdergarden'&&x.file===statQuizPath).length,1);
assert.equal(quizCardSources.historie.collections.filter(x=>x==='stattholdergarden_quizkort_v1.json').length,1);
assert.equal(statCard.production_status,'knowledge_linked_fullquiz_browser_passed_visual_pending');
assert.equal(statCard.cards[0].questions.length,10);
const statById=new Map(statQuestions.map(q=>[q.id,q]));
for(const item of statCard.cards[0].questions){
  const src=statById.get(item.sourceQuestionId);
  assert.ok(src);
  assert.equal(item.question,src.question);
  assert.deepEqual(item.options,src.options);
  assert.equal(item.answerIndex,src.answerIndex);
  assert.deepEqual(item.source_refs,src.source);
  assert.equal(item.knowledge_link_status,'linked');
  assert.equal(item.primary_knowledge_unit_id,src.primary_knowledge_unit_id);
  assert.deepEqual(item.knowledge_unit_ids,src.knowledge_unit_ids);
}

// Hotel du Nord is the fourth canonically linked fullquiz, without bypassing
// the two remaining unmanifested Næringsliv research banks.
const hotelQuizPath='data/quiz/naeringsliv/hotel_du_nord_sets.json';
const hotelCardPath='data/quizcards/naeringsliv/hotel_du_nord_quizkort_v1.json';
const hotelQuiz=read(hotelQuizPath);
const hotelCard=read(hotelCardPath);
const hotelContext=read('data/quiz/production_context/naeringsliv/hotel_du_nord.json');
const hotelQuestions=hotelQuiz.sets.flatMap(x=>x.questions);
assert.equal(hotelQuiz.production_status,'manifested_knowledge_linked_browser_qa_passed');
assert.equal(hotelContext.profile,'narrow_3x7');
assert.deepEqual(hotelContext.question_balance.counts,{fact:12,context:5,concept_theory:4});
assert.deepEqual(hotelContext.set_plan.map(x=>x.planned_questions),[7,7,7]);
assert.equal(hotelQuestions.length,21);
assert.deepEqual(hotelQuiz.sets.map(x=>x.questions.length),[7,7,7]);
assert.equal(hotelQuestions.filter(isDirectYearRecall).length,0);
assert.ok(hotelQuestions.slice(0,14).every(q=>['fact','context'].includes(q.question_type)));
assert.ok(hotelQuestions.slice(14).some(q=>q.method_id));
assert.ok(hotelQuestions.slice(14).some(q=>q.topic_hook_id));
assert.equal(quizRefs.filter(x=>x.targetId==='hotel_du_nord'&&x.file===hotelQuizPath).length,1);
assert.equal(quizCardSources.naeringsliv.collections.filter(x=>x==='hotel_du_nord_quizkort_v1.json').length,1);
assert.equal(hotelCard.cards[0].questions.length,10);
assert.equal(hotelCard.production_status,'knowledge_linked_fullquiz_browser_passed_visual_pending');
const hotelById=new Map(hotelQuestions.map(q=>[q.id,q]));
for(const [i,item] of hotelCard.cards[0].questions.entries()){
  const original=hotelById.get(item.sourceQuestionId);
  assert.ok(original,'Hotel du Nord QuizCard source question not found');
  assert.equal(item.question,original.question);
  assert.deepEqual(item.options,original.options);
  assert.equal(item.answer,original.answer);
  assert.equal(item.answerIndex,original.answerIndex);
  assert.deepEqual(item.source_refs,original.source);
  assert.equal(item.knowledge_link_status,'linked');
  assert.equal(item.primary_knowledge_unit_id,original.primary_knowledge_unit_id);
  assert.deepEqual(item.knowledge_unit_ids,original.knowledge_unit_ids);
  assert.equal(hotelCard.cards[0].answerKey[i].answer,original.answer);
}
for(const [i,q] of hotelQuestions.entries()){
  const claim=hotelBrief.claims[i];
  assert.equal(q.claim_id,claim.claim_id);
  assert.equal(q.claim_basis,claim.statement);
  assert.deepEqual(q.source,claim.source_ids);
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.equal(q.knowledge_link_status,'linked');
  assert.ok(q.primary_knowledge_unit_id?.startsWith('ku_naeringsliv_'));
  assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id));
}

// All six fullquizzes are now Knowledge-linked; v1 Place/image QA remains distinct.
const targetIds=ledger.places.map(p=>p.place_id);
assert.equal(new Set(targetIds).size,6);
for(const placeId of targetIds)assert.equal(quizRefs.filter(r=>r.targetId===placeId).length,1,placeId+': expected one canonical playable quiz');


// KVADRATUREN_PEOPLE_MEDIA_PARITY: prevent broken character artwork in Krigsskolen.
// A genuine Bernt Anker portrait and the Bjelke family's heraldry are distinct media.
const canonicalPeople=read('data/people/historie/oslo/people_historie_oslo.json');
const krigsskolenPeople=read('data/runtime/place-open/den_gamle_krigsskolen.json').people;
for(const id of ['bernt_anker','jens_bjelke']){
  const source=canonicalPeople.find(p=>p.id===id);
  const runtime=krigsskolenPeople.find(p=>p.id===id);
  assert.ok(source&&runtime,id+': missing person source or runtime');
  assert.match(source.image,/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//,id+': missing media must not be published');
  assert.equal(source.image,source.cardImage,id+': card mismatch');
  assert.equal(runtime.image,source.image,id+': stale runtime image');
  assert.equal(runtime.cardImage,source.cardImage,id+': stale runtime card');
  assert.equal(runtime.imageCaption,source.imageCaption,id+': missing media identification');
  assert.equal(runtime.imageSourceUrl,source.imageSourceUrl,id+': missing license provenance');
  assert.equal(runtime.imageLicense,source.imageLicense,id+': missing image license');
}
assert.match(krigsskolenPeople.find(p=>p.id==='jens_bjelke').imageCaption,/ikke et portrett/i);
console.log('KVADRATUREN_PEOPLE_MEDIA_PARITY_PASS_2');

console.log(JSON.stringify({schema:'oslo_six_research_preflight_v1',status:'PASS_RESEARCH_IDENTITY_ONLY_NOT_V1',candidateCount,records:report},null,2));
