#!/usr/bin/env node
// One-time Bjølsenfossen quiz migration. Run in PR #7342; never on main.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,j)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');};
const qp='data/quiz/historie/bjoelsenfossen_sets.json';
const rp='reports/place-production/oslo-akerselva-sagene-grunerlokka-v1-20261116.md';
const ap='data/knowledge/preserved_quiz_sources/bjoelsenfossen_legacy_20261121.json';
const bp='data/quiz/production_briefs/historie/bjoelsenfossen.json';
const cp='data/quizcards/historie/bjoelsenfossen_quizcard_v1.json';
const old=read(qp),original=old.sets.flatMap(s=>s.questions);
assert.equal(old.sets.length,6);assert.equal(original.length,42);
const report=fs.readFileSync(rp,'utf8'),rows=new Map();
for(const line of report.split('\n')){
 const m=/^\|\s*([1-4])\.([1-7])\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
 if(!m)continue;
 const [all,s,n,question,answer,distractors,explanation]=m;
 const options=[answer,...distractors.split(' · ')];
 assert.equal(options.length,3,'Two distractors missing '+s+'.'+n);
 rows.set(s+'.'+n,{question,answer,options,explanation});
}
assert.equal(rows.size,28,'Canonical report must contain 28 questions');
const urls={
 f:'https://oslobyleksikon.no/side/Bj%C3%B8lsenfallet',
 b:'https://oslobyleksikon.no/side/Valsem%C3%B8llebrua',
 m:'https://oslobyleksikon.no/side/Bj%C3%B8lsen_Valsem%C3%B8lle',
 s:'https://snl.no/Bj%C3%B8lsen_Valsem%C3%B8lle',
 a:'https://www.akerselvasvenner.no/2016/01/01/2396/',
 r:'https://www.regal.no/om-oss/moller-i-norge/',
 u:'https://commons.wikimedia.org/wiki/File:Valsem%C3%B8llebrua_over_Bj%C3%B8lsenfossen_-_Oslo_Museum_-_OMu.A15631.jpg',
 i:'https://oslobyleksikon.no/side/Fil:Valsem%C3%B8llebrua.jpg',
 k:'https://www.oslo.kommune.no/slik-bygger-vi-oslo/bjolsenfossen-hvordan-gjore-omradet-rundt-fossen-tilgjengelig-forprosjekt-med-omregulering/'
};
const refs=['fa','f','f','fab','f','b','b','ms','b','k','b','mr','a','am',
'm','m','m','m','m','s','b','u','b','ui','b','b','b','k'];
assert.equal(refs.length,28);
const retain=new Set(['bjoelsenfossen_s1_q1','bjoelsenfossen_s1_q4','bjoelsenfossen_s2_q1','bjoelsenfossen_s2_q3','bjoelsenfossen_s2_q5']);
const byId=new Map(original.map(q=>[q.id,q]));
const archived=original.filter(q=>!retain.has(q.id));
assert.equal(archived.length,37);
const ledger=original.map((q,i)=>({ordinal:i+1,legacy_id:q.id,legacy_quiz_id:q.quiz_id,
 legacy_primary_knowledge_unit_id:q.primary_knowledge_unit_id,legacy_knowledge_unit_ids:[...q.knowledge_unit_ids],
 current_question:q.question,current_answer:q.answer,knowledge_link_status:q.knowledge_link_status,
 disposition:retain.has(q.id)?'retain':'archive_as_knowledge_only'}));
const ec=['em_his_industri_produksjon_energi','em_his_spor_materialitet','em_his_kildekritikk_arkiv_spor','em_his_styring_krise_kontinuitet','em_his_kulturminner_bevaring'];
const emne=n=>n>=22?ec[2]:[2,5,6,9,11,21].includes(n)?ec[1]:[3,7,10,13].includes(n)?ec[3]:ec[0];
const phases=['opening','middle','bridge','final'],claims=[],proposed=[],sets=[];
const truncateSources=t=>{
 const m=/\.\s+(?:Bjølsenfallet|Valsemøllebrua|Akerselvas Venner|Bjølsen Valsemølle|Oslo Museum|Oslo kommunes forprosjekt)/.exec(t);
 return m?t.slice(0,m.index+1):t;
};
for(let s=1;s<=4;s++){
 const questions=[];
 for(let n=1;n<=7;n++){
  const i=(s-1)*7+n,row=rows.get(s+'.'+n),oldId='bjoelsenfossen_s'+s+'_q'+n;
  assert.ok(row,'Missing '+s+'.'+n);
  const kept=retain.has(oldId),prev=byId.get(oldId);
  if(kept)assert.ok(prev);
  const refIds=refs[i-1].split(''),urlList=refIds.map(id=>urls[id]);
  const explanation=truncateSources(row.explanation);
  const claimId='claim_bjoelsenfossen_quiz_'+String(i).padStart(2,'0');
  const knowledge=kept?prev.knowledge:explanation.replace(/\.\s+(?=[A-ZÆØÅ])/g,'; ');
  const primary=kept?prev.primary_knowledge_unit_id:'ku_historie_bjoelsenfossen_v1_s'+s+'_q'+n+'_20261121';
  const eid=emne(i);
  const q={id:kept?prev.id:'bjoelsenfossen_v1_s'+s+'_q'+n,
   quiz_id:kept?prev.quiz_id:'historie_bjoelsenfossen_v1_set_'+s+'_q'+n,
   categoryId:'historie',placeId:'bjoelsenfossen',targetId:'bjoelsenfossen',question_scope:'place',
   question:row.question,options:row.options,answer:row.answer,answerIndex:0,
   knowledge,explanation,difficulty:s<=2?1:(s===3?2:3),
   question_type:s===4?'analysis':(s===3?'context':'fact'),
   question_layer:phases[s-1],emne_id:eid,emne_ids:[eid],
   source:refIds,source_urls:urlList,source_origin:'external',
   sources:refIds.map(id=>({source_id:'src_bjoelsen_'+id,source_type:'historical_reference',
    url:urls[id],review_status:'reviewed',reviewed_at:'2026-11-21',claim_basis:explanation})),
   claim_id:claimId,claim_basis:explanation,concept_ids:kept?[...(prev.concept_ids||[])]:[],
   term_ids:kept?[...(prev.term_ids||[])]:[],knowledge_contract_version:1,
   tags:['bjoelsenfossen','reviewed_20261121'],primary_knowledge_unit_id:primary,
   knowledge_unit_ids:kept?[...prev.knowledge_unit_ids]:[primary],knowledge_link_status:'linked',
   knowledge_link_evidence:{method:'explicit',confidence:1,reviewedAt:'2026-11-21',sourceUrls:urlList}};
  if(s===4)q.method_id='met_kildekritikk';
  assert.equal(q.options[q.answerIndex],q.answer);
  if(kept){assert.equal(q.quiz_id,prev.quiz_id);assert.equal(q.knowledge,prev.knowledge);assert.deepEqual(q.knowledge_unit_ids,prev.knowledge_unit_ids);}
  questions.push(q);
  claims.push({claim_id:claimId,order:i,planned_phase:phases[s-1],
   family:s===4&&n>=3?'concept_theory':s>=3?'context':'fact',
   statement:explanation,source_ids:refIds,source_origin:'external',
   emne_id:eid,review_status:'reviewed',use_decision:'usable_with_stated_limitations'});
  proposed.push({planned_set:s,planned_question:n,source_claim_id:claimId,
   question:row.question,options:row.options,answer:row.answer,answerIndex:0,
   knowledge:explanation,source:urlList,source_origin:'external',review_status:'draft_not_playable',
   legacy_knowledge_migration:kept?'keep_legacy_question_and_knowledge_id':'new_ids_archive_original'});
 }
 sets.push({set_id:old.sets[s-1].set_id,level:s,order:s,phase:phases[s-1],
  title:['Fossen, dammen og vannet','Arbeid, mølla og elverommet','Valsemøllas utvikling','Arkiv, kart og kilder'][s-1],
  xp:40+s*10,mode:['place_intro_story','place_life_people_events','industrial_history','source_criticism'][s-1],questions});
}
const qs=sets.flatMap(s=>s.questions);
assert.equal(qs.length,28);assert.equal(new Set(qs.map(q=>q.quiz_id)).size,28);
const originalActive=new Set(original.map(q=>q.quiz_id));
assert.equal(qs.filter(q=>originalActive.has(q.quiz_id)).length,5);
const picked=[0,2,3,5,7,9,11,16,21,27].map((i,n)=>({
 ...qs[i],number:n+1,sourceQuestionId:qs[i].id,sourceQuizId:qs[i].quiz_id,
 sourceQuizFile:qp,source_refs:[...qs[i].source_urls]}));
const curriculum={module_ids:['his_kilder_arkiv_spor','his_byhistorie_stedsendring','his_minne_kulturarv_historiebruk'],
 emne_ids:ec,topic_hook_ids:['his_kildekritikk'],method_ids:['met_sporlesning','met_kildekritikk'],
 thinker_ids:['knut_kjeldstadli'],works:['Fortida er ikke hva den en gang var']};
const brief={schema_version:'1.0',status:'reviewed',categoryId:'historie',targetId:'bjoelsenfossen',
 scope:'foss_industry_and_source_criticism',reviewed_at:'2026-11-21',
 review_note:'Kildebelagte spørsmål overført fra felles produksjonsrapport; begrenset adkomst og historisk/aktuell drift må skilles.',
 sources:Object.fromEntries(Object.entries(urls).map(([id,url])=>[id,{
  url,source_type:'historical_reference',review_status:'reviewed',reviewed_at:'2026-11-21',
  review_note:'Kilde fra den gjennomgåtte Bjølsenfossen-redaksjonstabellen.'}])),
 selected_curriculum:curriculum,curriculum_selection_status:'reviewed_canonical_manifest_resolver',
 existing_quiz_audit:{searched_paths:[qp,'data/quiz/manifest.json',rp],
  active_before:{set_count:6,question_count:42,linked_knowledge:original.filter(q=>q.knowledge_link_status==='linked').length,
   editorial_review_required:original.filter(q=>q.knowledge_link_status==='editorial_review_required').length},
  knowledge_migration:'5 retained; 37 preserved Knowledge-only; 23 newly numbered',
  legacy_id_knowledge_ledger:ledger},
 held_back_candidates:['Ikke påstå fri adgang.','Foto er ikke vannføringsmåling.','Ikke påstå historisk turbin i drift.'],
 claims,profile_decision:{profile:'normal',set_count:4,questions_per_set:7,
  justification:'28 stedsspesifikke, kildebelagte spørsmål i fire ulike læringsspor uten repetitiv sekssettsfyll.',
  status:'active_in_PR_pending_release_QA',opening_policy:'first_2_sets_7_normal_questions_no_theory'},
 proposed_questions_status:'activated_in_PR_fullquiz_pending_release_QA',proposed_questions:proposed,
 proposed_questions_editorial_check:{checked_at:'2026-11-21',status:'active_PR_pending_CI',expected:28,
 actual:28,question_sets:4,normal_opening_questions:14,retained_exact_legacy_KU_ids:5,
 retired_legacy_questions_in_Knowledge_only:37,new_quiz_ids:23}};
write(ap,{schema:'history_go_preserved_quiz_knowledge_source_v1',
 status:'preserved_legacy_knowledge_only_not_playable',source_quiz_file:qp,
 targetId:'bjoelsenfossen',categoryId:'historie',
 purpose:'37 retired original quiz questions remain Knowledge-only with unchanged earned IDs.',
 questions:archived});
write(bp,brief);
const oset=read('data/quiz/historie/frysjadammen_sets.json');
const prod={...oset.production_context,
 source_brief:bp,context_artifact:'data/quiz/production_context/historie/bjoelsenfossen.json',
 emne_ids:ec,existing_quiz_audit:brief.existing_quiz_audit,
 profile_decision:brief.profile_decision};
write(qp,{...old,title:'Bjølsenfossen – industri og kildebruk',
 generator_version:'history_go_sourced_4x7_20261121',
 production_context:prod,sets});
const man=read('data/quiz/manifest.json'),matches=man.sets.filter(s=>s.targetId==='bjoelsenfossen');
assert.equal(matches.length,6);
const at=man.sets.findIndex(s=>s.targetId==='bjoelsenfossen');
man.sets.splice(at,6,...sets.map(s=>({targetId:'bjoelsenfossen',file:qp,set_id:s.set_id,order:s.order})));
write('data/quiz/manifest.json',man);
const fag=read('data/fag/fag_manifest.json');
assert.ok(!fag.historie.quizProduction.targets.bjoelsenfossen);
fag.historie.quizProduction.targets.bjoelsenfossen={
 source_brief:'../quiz/production_briefs/historie/bjoelsenfossen.json',
 context_artifact:'../quiz/production_context/historie/bjoelsenfossen.json',
 quiz_file:'../quiz/historie/bjoelsenfossen_sets.json'};
write('data/fag/fag_manifest.json',fag);
write(cp,{collection_id:'bjoelsenfossen_quizcard_v1_20261121',categoryId:'historie',
 title:'Bjølsenfossen – foss, mølle og kilder',
 cardFormatRule:'single_surface_top10_with_answer_key',
 sourceBasis:'Ti spørsmål med fasit og Knowledge-ID nøyaktig fra aktiv 4x7-fullquiz.',
 production_status:'PR_source_reviewed_pending_V1_release',
 cards:[{card_id:'historie_quizkort_bjoelsenfossen_v1',categoryId:'historie',
 targetId:'bjoelsenfossen',title:'Bjølsenfossen',subtitle:'Vannkraft, mølle og kildearbeid',
 order:1,format:'single_surface_top10_with_answer_key',questionCount:10,questions:picked}]});
const cm=read('data/quizcards/historie/manifest.json');
assert.ok(!cm.collections.includes('bjoelsenfossen_quizcard_v1.json'));
cm.collections.push('bjoelsenfossen_quizcard_v1.json');
write('data/quizcards/historie/manifest.json',cm);
const gp='scripts/knowledge-canonical-data.mts',code=fs.readFileSync(gp,'utf8');
const anchor="'data/knowledge/preserved_quiz_sources/seilduksfabrikken_nydalen_legacy_20261118.json',";
assert.ok(code.includes(anchor));
fs.writeFileSync(gp,code.replace(anchor,anchor+"\n  '"+ap+"',"));
fs.appendFileSync(rp,'\n### Bjølsenfossen – 4 × 7 migrert i arbeidsgren (21.11.2026)\n\n'+
 'De 28 spørsmålene er nå lagt inn som fire aktive sett på PR-grenen, med 5 uendrede historiske quiz-/Knowledge-ID-er. '+
 '37 utgåtte spørsmål ligger i ikke-spillbart Knowledge-arkiv; 23 nye spørsmål har nye ID-er. '+
 'Ett QuizCard speiler ti av fullquizens spørsmål. Kanonisk Knowledge- og context-regenerering og reell app-test må være grønne før godkjenning. PR forblir DRAFT.\n');
console.log('Migrated 28: 5 existing ID sets, 23 new; archived 37; QuizCard 10.');
