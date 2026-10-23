#!/usr/bin/env node
/**
 * Single-scoped quiz draft production for PR #6579.
 * Does not publish: --apply stages canonical quiz/brief/manifest files and a
 * single QuizCard collection so full validators can run before a git commit.
 * Source claims come only from the manually curated 23 October research bank.
 * No other Place file, QuizCard collection, Fagverk or Oslo batch is modified.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const ids=['hoyesteretts_hus','folkets_hus_oslo','hoyres_hus','hoyblokka','victoria_terrasse','y_blokka'];
const CFG={
  hoyesteretts_hus: {title:'Høyesteretts hus', module:'rett_lov_rettssikkerhet', emne:'em_pol_domstoler_rettspraksis', finalEmne:'em_pol_maktbegrensning',hook:'rettsstat',thinker:'montesquieu',method:'met_pol_rettslig_analyse',special:'hoyesteretts_card_10',reason:'Rett og domstol, Justisbygningens tre institusjoner og Høyesteretts utvikling er forankret i domstolens historikk og Grunnloven.'},
  folkets_hus_oslo: {title:'Folkets Hus',module:'konflikt_makt_sivilsamfunn',emne:'em_pol_arbeidsliv_kollektiv_kamp',finalEmne:'em_pol_mediert_offentlighet',hook:'offentlighet',thinker:'nancy_fraser',method:'met_pol_offentlighetsanalyse',special:'folkets_hus_oslo_s1_q4',reason:'Arbeiderbevegelsens arkiv gir egen byggehistorie, finansiering, kontorfunksjoner og skillet mellom organisering inne og offentlig mobilisering ute.'},
  hoyres_hus:{title:'Høyres Hus',module:'demokrati_representasjon_offentlighet',emne:'em_pol_demokrati_representasjon',finalEmne:'em_pol_demokrati_representasjon',hook:'representasjon',thinker:'robert_dahl',method:'met_pol_institusjonsanalyse',special:'hoyres_hus_card_07',reason:'Bygningen har dokumentert partiorganisering fra 1935 og flere atskilte tidslag, men ikke nok uavhengige forhold til å utvide til fire komplette sett nå.'},
  hoyblokka:{title:'Høyblokka',module:'styring_institusjoner_forvaltning',emne:'em_pol_byrakrati_forvaltning',finalEmne:'em_pol_maktens_geografi',hook:'stat_og_by',thinker:'theda_skocpol',method:'met_pol_institusjonsanalyse',special:'hoyblokka_card_08',reason:'Kildegrunnlag gir dokumentert arkitektur, 1958-funksjon, 2011-skader og rehabilitering frem til åpningen av byggetrinn 1 i 2026.'},
  victoria_terrasse:{title:'Victoria terrasse',module:'styring_institusjoner_forvaltning',emne:'em_pol_institusjoner_styring',finalEmne:'em_pol_maktens_geografi',hook:'stat_og_by',thinker:'theda_skocpol',method:'met_pol_dokumentanalyse',special:'victoria_terrasse_card_08',reason:'Kildegrunnlaget beskriver boligkompleks, UD, Gestapo/Statspolitiet, krigshistorie og fredningen fra 2025; 1912/1913 er holdt utenfor.'},
  y_blokka:{title:'Y-blokka',module:'demokrati_representasjon_offentlighet',emne:'em_pol_maktens_geografi',finalEmne:'em_pol_minnesteder_politisk_kamp',hook:'minne_og_makt',thinker:'pierre_bourdieu',method:'met_pol_dokumentanalyse',special:'y_blokka_card_10',reason:'Kilder dekker sikkerhet og regulering, rivingen i 2020, integrert kunst og ny plassering uten å forveksle bevaring av kunst med bevaring av bygningen.'}
};
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const write=(p,v)=>{const full=path.join(ROOT,p);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,JSON.stringify(v,null,2)+'\n','utf8');};
const fail=s=>{throw new Error(s)};
const hasHold=q=>/hold|held/i.test(q.review_status||'');
const sourceId=url=>'src_'+crypto.createHash('sha256').update(url).digest('hex').slice(0,12);
const bank=read('reports/place-production/oslo-sentrum-politikk-six-quiz-sourcebank-20261023.json');
const manifest=read('data/quiz/manifest.json'),fag=read('data/fag/fag_manifest.json');
const folkActive=read('data/quiz/politikk/folkets_hus_oslo_sets.json');
if(folkActive.sets.length!==1||folkActive.sets[0].questions.length!==5)fail('Existing Folkets Hus quiz has changed; manual conflict resolution needed');
const canonicalIds=folkActive.sets[0].questions.map(q=>q.id);
for(let i=0;i<5;i++)if(canonicalIds[i]!=='folkets_hus_oslo_s1_q'+(i+1))fail('Unexpected Folkets House original question IDs');
for(const id of ids){
 const rows=(manifest.sets||[]).filter(s=>s.targetId===id);
 if(id==='folkets_hus_oslo'){
   if(rows.length!==1||rows[0].file!=='data/quiz/politikk/folkets_hus_oslo_sets.json')fail('Foreign folkets house quiz manifest conflict');
 }else if(rows.length>0)fail('Existing active quiz discovered for '+id+'; cannot overwrite');
 if(fag.politikk.quizProduction.targets[id])fail('Other quiz production owns '+id);
}
const batch={collection_id:'politikk_quizkort_oslo_sentrum_six_pr6579',categoryId:'politikk',
 title:'Oslo sentrum – seks politiske og historiske steder',
 cardFormatRule:'single_surface_top10_with_answer_key',
 sourceBasis:'Utvalgte flervalgsspørsmål fra de seks tilhørende canonical quizpakkene, med egne eksternkilder.',
 cards:[]};
const owned=['data/quiz/manifest.json','data/fag/fag_manifest.json'];
const briefs=[], quizzes=[];
for(const id of ids){
 const cfg=CFG[id],record=bank.targets.find(t=>t.place_id===id);
 if(!record)fail('Missing sourcebank '+id);
 let all=[...record.ten_quizcard_candidates,...(record.additional_fullquiz_candidates||[])].map(q=>({...q}));
 if(id==='folkets_hus_oslo'){
  const original=all.find(q=>q.id==='folkets_hus_oslo_s1_q1');
  if(!original)fail('Lost old q1');
  // Preserve canonical Q1 ID, replace only the unsupported visual inference.
  original.question='Hva rommet Folkets Hus da organisasjonskvartalet var fullført i 1962?';
  original.options=['Et samlet anlegg med kontorer, møterom og saler','Bare én konsertsal og ingen organisasjonskontorer','Kun to bolighus med privat bruk'];
  original.answer='Et samlet anlegg med kontorer, møterom og saler';
  original.answerIndex=0;
  original.knowledge='Da arbeidet var fullført i 1962, hadde fagbevegelsen fått et sammensatt kvartal for kontorer, møter og forsamlingslokaler.';
  original.source_urls=['https://www.arbark.no/Bildeserier/folketshus/Folkets_Hus.htm'];
  original.review_status='rewritten_source_checked_pending_final_editorial_audit';
  all=all.filter(q=>q.id!==original.id);
  all.unshift(original);
 }
 const usable=all.filter(q=>!hasHold(q));
 const special=usable.find(q=>q.id===cfg.special);
 if(!special)fail('Missing special pedagogical topic '+id);
 const others=usable.filter(q=>q.id!==cfg.special);
 if(others.length<20)fail('Fewer than 21 independent claim candidates '+id);
 // Prefer introductory site and chronology facts, then development/case distinctions.
 const selected=[...others.slice(0,20),special];
 if(new Set(selected.map(q=>q.id)).size!==21)fail('Duplicate source IDs '+id);
 const phases=['opening','bridge','final'];
 const sourceRegistry={};const questionRows=[];const claims=[];
 for(let i=0;i<21;i++){
   const raw=selected[i],phase=phases[Math.floor(i/7)],last=i===20;
   const urls=[...new Set(raw.source_urls)];
   const sourceIds=urls.map(url=>{
     const key=sourceId(url);
     if(!sourceRegistry[key])sourceRegistry[key]={url,source_type:url.includes('domstol.no')||url.includes('regjeringen.no')||url.includes('statsbygg.no')||url.includes('lovdata.no')||url.includes('riksantikvaren.no')?'official_institution':'specialist_historical_reference',
       review_status:'reviewed',review_note:'Historisk kjernepåstand dokumentert med denne lenken i 23. oktober-researchbanken; kandidatens feilsvar og progresjon må dessuten kontrolleres før v1-godkjenning.'};
     return key;
   });
   if(!urls.length||sourceIds.length<1)fail('No source '+raw.id);
   // Balanced positions in stored data; runtime will independently shuffle.
   const options=[...raw.options];
   const shift=(raw.answerIndex-(i%3)+3)%3;
   for(let j=0;j<shift;j++) options.push(options.shift());
   const ans=options.indexOf(raw.answer);
   if(ans!==i%3)fail('Cannot balance answer for '+raw.id);
   const claimId='claim_oslo_six_'+raw.id;
   const emne=last?cfg.finalEmne:cfg.emne;
   const kind= i<12?'fact':i<14?'context':i<17?'context':i<20?'concept':'concept';
   const q={
      id:raw.id,quiz_id:'politikk_'+id+'_set_'+(Math.floor(i/7)+1)+'_q'+(i%7+1),
      categoryId:'politikk',placeId:id,targetId:id,question_scope:'place',
      question:raw.question,options,answer:raw.answer,answerIndex:ans,
      knowledge:raw.knowledge,difficulty:i<7?1:i<14?2:3,
      question_type:kind,emne_id:emne,
      source:sourceIds,source_origin:'external',
      claim_basis:raw.knowledge,claim_id:claimId,
      guidance_basis:['data/fag/politikk/emner_politikk_canonical_v4_5.json','data/fag/politikk/methods_politikk_canonical_v4_5.json'],
      core_concepts:[],tags:['oslo_sentrum_politikk_six','multiple_choice']
   };
   if(i>=17 && i<20){q.method_id=cfg.method;}
   if(last){
     q.method_id=cfg.method;
     q.topic_hook_id=cfg.hook;
     q.thinker_id=cfg.thinker;
     q.theory_ref={topic_hook_id:cfg.hook,why_it_helps:
       'Perspektivet gir et prøvbart skille mellom den dokumenterte institusjonelle/historiske handlingen ved dette stedet og videre politiske virkninger som krever egne kilder.'};
   }
   // Only existing Folkets Hus questions preserve their existing stable question IDs.
   // Knowledge canonical pipeline will reconcile the revised facts and unit references.
   claims.push({claim_id:claimId,order:i+1,planned_phase:phase,
      family:kind,statement:q.claim_basis,source_ids:sourceIds,source_origin:'external',
      emne_id:emne,...(q.method_id?{method_id:q.method_id}:{}),
      ...(q.topic_hook_id?{topic_hook_id:q.topic_hook_id,thinker_id:q.thinker_id}:{})});
   questionRows.push(q);
 }
 const claimStatus={
   searched_paths:['data/quiz/manifest.json','data/quiz/politikk/'+id+'_sets.json','data/quizcards/politikk/manifest.json','data/quizcards/politikk/topp10_politikk_oslo_v1_batch1.json','reports/place-production/oslo-sentrum-politikk-six-quiz-sourcebank-20261023.json'],
   active_before:id==='folkets_hus_oslo'?{file:'data/quiz/politikk/folkets_hus_oslo_sets.json',set_count:1,question_count:5,
     finding:'Fem eksisterende koblede spørsmål; ett fasadespørsmål krever omskriving på samme ID.'}:
     {file:null,set_count:0,question_count:0,finding:'Ingen direkte aktiv settmanifestoppføring i denne kategori-/målauditen.'},
   decisions:id==='folkets_hus_oslo'?['Behold alle fem identiteter for eksisterende spørsmål; revider misvisende vindusfasade-påstand i s1_q1.','Benytt 21 egne påstander fra 23. oktober-banken uten de eksplisitte HOLD-kandidatene.']:
     ['Velg 21 kildebårne, forskjellige påstander og skille tidligere bruk fra dagens sted.','Ingen hypotetiske, fritekstbaserte eller ikke-kildebelagte oppgaver tas inn.'],
   knowledge_migration:id==='folkets_hus_oslo'?'Behold fem historiske spørsmåls-ID-er; regenerer de kanoniske Knowledge-koblingene etter omskrevet påstandsinnhold.':
     'Generer canonical Knowledge-ID-er fra de nye kildesporbare quizspørsmålene.'
 };
 const held=all.filter(q=>hasHold(q)).map(q=>q.id);
 const profileDecision={profile:'narrow',set_count:3,questions_per_set:7,
 justification:cfg.reason+' Tre konkrete, kildestøttede sett er avgrenset til stedshistorie, dokumentert endring og avsluttende institusjonell sammenligning; øvrige kandidater er ikke selvstendig dokumenterte ekstra sett.'};
 const brief={schema_version:'1.0',status:'reviewed',categoryId:'politikk',targetId:id,profile_hint:'narrow',
 reviewed_at:'2026-10-23',review_note:'Stedsspesifikk forskningsbank med kontroll av kjernepåstander og åpne redaksjonelle forbehold. Se quiz-editorial-audit; teknisk audit er ikke en erstatning for mobilvisning eller full faglig uavhengig review.',
 scope:{place:cfg.title,production_profile:'narrow',set_count:3,questions_per_set:7,total_questions:21,normal_opening_questions:14},
 sources:sourceRegistry,
 selected_curriculum:{module_ids:[cfg.module],emne_ids:[...new Set([cfg.emne,cfg.finalEmne])],topic_hook_ids:[cfg.hook],method_ids:[cfg.method],thinker_ids:[cfg.thinker],works:[]},
 existing_quiz_audit:claimStatus,profile_decision:profileDecision,
 held_back_candidates:[...held,'Spørsmål og svaralternativer med utilstrekkelig kildestøtte, tidspresisjon eller pedagogisk relevans beholdes utenfor denne narrow-profilen.'],
 claims
 };
 const briefPath='data/quiz/production_briefs/politikk/'+id+'.json';
 const contextPath='data/quiz/production_context/politikk/'+id+'.json';
 const quizPath='data/quiz/politikk/'+id+'_sets.json';
 briefs.push({path:briefPath,brief,contextPath});
 const resolved={
   pensum:'data/fag/'+fag.politikk.pensum,
   emner:'data/fag/'+fag.politikk.emner,
   fagkart:'data/fag/'+fag.politikk.fagkart,
   methods:'data/fag/'+fag.politikk.methods,
   supersetQuizMal:'data/fag/'+fag.politikk.supersetQuizMal,
   quizStandard:'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md',
   quizQuestionSchema:'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json'
 };
 const ctx={manifest_category:'politikk',profile:'narrow_3x7',standard_version:'3.4',
   source_brief:briefPath,context_artifact:contextPath,resolved_files:resolved,
   required_inputs_loaded:[...fag.politikk.quizProduction.required_inputs],
   pensum_module_ids:[cfg.module],emne_ids:[...new Set([cfg.emne,cfg.finalEmne])],
   topic_hook_ids:[cfg.hook],method_ids:[cfg.method],thinker_ids:[cfg.thinker],works:[],
   source_review_status:'reviewed',
   existing_quiz_audit:claimStatus,profile_decision:profileDecision,
   held_back_candidates:brief.held_back_candidates,
   theory_start_phase:'final',method_start_phase:'final'};
 const sets=Array.from({length:3},(_,j)=>({
   set_id:'politikk_'+id+'_set_'+(j+1),title:['Stedet og historien','Institusjoner og forandring','Kilder, ansvar og sammenheng'][j],
   level:j+1,order:j+1,phase:phases[j],xp:50,questions:questionRows.slice(j*7,(j+1)*7)
 }));
 const quiz={targetId:id,categoryId:'politikk',sources:Object.fromEntries(Object.entries(sourceRegistry).map(([k,v])=>[k,v.url])),production_context:ctx,sets};
 quizzes.push({path:quizPath,quiz,source:briefPath,context:contextPath});
 fag.politikk.quizProduction.targets[id]={
   source_brief:'../quiz/production_briefs/politikk/'+id+'.json',
   context_artifact:'../quiz/production_context/politikk/'+id+'.json',
   quiz_file:'../quiz/politikk/'+id+'_sets.json'
 };
 if(!manifest.sets.some(e=>e.targetId===id))manifest.sets.push({targetId:id,file:quizPath});
 manifest.politikk[id]='politikk/'+id+'_sets.json';
 batch.cards.push({
   card_id:'politikk_quizkort_minimum_v1_'+id,categoryId:'politikk',targetId:id,title:cfg.title,
   subtitle:'Ti kildebelagte flervalgsspørsmål',order:batch.cards.length+1,
   format:'single_surface_top10_with_answer_key',questionCount:10,
   questions:questionRows.slice(0,10).map((q,i)=>({
     number:i+1,question:q.question,options:q.options,answer:q.answer,
     answerIndex:q.answerIndex,sourceQuestionId:q.id,sourceQuizId:q.quiz_id,
     difficulty:q.difficulty,source_urls:q.source.map(k=>sourceRegistry[k].url),source_refs:q.source,
     tags:['politikk',id,'stedsspesifikk']
   })),
   answerKey:questionRows.slice(0,10).map((q,i)=>({number:i+1,answer:q.answer,answerIndex:q.answerIndex})),
   sourceFile:quizPath
 });
}
const cardPath='data/quizcards/politikk/topp10_politikk_oslo_sentrum_six_pr6579.json';
const cardManifest=read('data/quizcards/politikk/manifest.json');
if(cardManifest.collections.some(x=>x===path.basename(cardPath)))fail('Collection already exists; manual review');
cardManifest.collections.push(path.basename(cardPath));
if(process.argv.includes('--apply')){
 for(const entry of briefs)write(entry.path,entry.brief);
 for(const entry of quizzes)write(entry.path,entry.quiz);
 write('data/fag/fag_manifest.json',fag);
 write('data/quiz/manifest.json',manifest);
 write(cardPath,batch);
 write('data/quizcards/politikk/manifest.json',cardManifest);
}
const checked=quizzes.map(row=>({id:row.quiz.targetId,sets:row.quiz.sets.length,
 questions:row.quiz.sets.flatMap(z=>z.questions).length,card:batch.cards.find(c=>c.targetId===row.quiz.targetId).questions.length,
 phases:row.quiz.sets.map(s=>s.phase),theory:row.quiz.sets[2].questions.filter(q=>q.topic_hook_id).length,
 method:row.quiz.sets[2].questions.filter(q=>q.method_id).length,
 answers:[0,1,2].map(n=>row.quiz.sets.flatMap(s=>s.questions).filter(q=>q.answerIndex===n).length)
}));
if(checked.some(x=>x.questions!==21||x.card!==10||x.theory<1||x.method<1||x.answers.some(k=>k!==7)))fail('Invalid quiz output');
console.log(JSON.stringify({status:process.argv.includes('--apply')?'wrote_draft_canonical_files':'preview_only',rows:checked,quizCards:batch.cards.length,allQuestions:126},null,2));
