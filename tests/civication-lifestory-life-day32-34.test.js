'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../js/Civication/lifestory/lifestoryContent');
const S=require('../js/Civication/lifestory/lifestoryState');
const R=require('../js/Civication/lifestory/lifestoryRunner');
const E=require('../js/Civication/lifestory/lifestoryEndings');

const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const manifest=read(C.MANIFEST_PATH),m=manifest.roles.arbeidsledig;
const raw={role:read(m.role),roleThreads:read(m.threads),roleScenes:read(m.scenes),
 phaseDefinitions:read(manifest.shared.phaseDefinitions),lifeThreads:read(manifest.life.threads),lifeScenes:read(manifest.life.scenes)};
const base=C.buildContent(clone(raw));
const descriptors=base.role.symposium.fortsettelser;
const packs=Object.fromEntries(descriptors.map(d=>[d.id,read(d.path)]));
const arcs=[
 {direction:'musikk',chain:['musikk_med_mira','musikk_foresporselen','musikk_etter_foresporselen','sideprosjekt_kryss_med_mira','miljo_etter_leas_program','lea_etter_arvids_ansvar','arvid_etter_leas_tillit','arvid_og_det_aapne_lokalet'],next:'arvid_og_nokkelen_til_lokalet',prefix:'liv_arvid_nokkel',old:'lang_arvid_lokale',first:['avstem','avgrens'],second:['klart','vent'],third:['sammen','egen']},
 {direction:'prosjekt',chain:['sideprosjekt_med_lea','sideprosjekt_neste_steg','sideprosjekt_etter_neste_steg','miljo_kryss_med_lea','musikk_etter_arvids_tekst','mira_etter_samtalen_med_lea','lea_etter_miras_vennskap','lea_og_sporsmaalene_som_gjenstaar'],next:'lea_og_den_foerste_hypotesen',prefix:'liv_lea_hypotese',old:'lang_lea_sporsmaal',first:['avgrens','sammenlign'],second:['skriv','pause'],third:['faglig','menneske']},
 {direction:'miljo',chain:['miljo_med_arvid','miljo_navnet_ditt','miljo_etter_invitasjonen','musikk_kryss_med_arvid','frilans_etter_miras_navn','arvid_etter_leas_notat','lea_etter_arvids_fortelling','lea_og_kildene_i_skrivearbeidet'],next:'lea_og_foresporselen_om_honorar',prefix:'liv_lea_honorar',old:'lang_lea_kilder',first:['kontroll','ramme'],second:['versjon','retur'],third:['metode','grenser']},
 {direction:'prosjekt',chain:['frilans_med_lea','frilans_neste_steg','frilans_etter_neste_steg','miljo_kryss_med_frilans','frilans_etter_arvids_kreditering','arvid_etter_leas_grense','lea_etter_arvids_avstand','lea_og_fellesskapet_uten_plikt'],next:'lea_og_elins_vanskelige_uke',prefix:'liv_lea_elin',old:'lang_lea_fellesskap',first:['tur','svar'],second:['lytt','lett'],third:['initiativ','balanse']},
 {direction:'prosjekt',chain:['grunder_med_lea','grunder_neste_steg','grunder_etter_neste_steg','musikk_kryss_med_grunder','miljo_etter_miras_lyd','mira_etter_lydfilens_rykte','mira_etter_nye_takter','mira_og_musikken_i_hverdagen'],next:'mira_og_invitasjonen_fra_musikeren',prefix:'liv_mira_ovingsrom',old:'lang_mira_hverdag',first:['rytme','pusterom'],second:['noter','laa'],third:['plan','frihet']}
];
let activeRole=null;
globalThis.CivicationLifePositions={getLifeContext:()=>({primary_life_position:activeRole})};
function useRole(scope){
 const role=base.role.symposium.rollebroer.find(b=>b.role_scope===scope);
 assert.ok(role,'registered role '+scope);
 activeRole={badge_id:role.badge_id,label:role.navn};
}
function restore(state){
 let content=C.buildContent(clone(raw));
 for(const id of R.getContinuationIds(state))content=C.appendContinuation(content,packs[id]);
 S.reconcileContent(state,content);
 return content;
}
function progress(state,content,to,overrides={}){
 while(true){
  while(!state.dagFerdig){
   const scene=R.selectNextScene(state,content);
   assert.ok(scene,'authored scene on day '+state.dag+' and phase '+state.fase);
   const id=overrides[scene.id]||scene.valg[0].id;
   R.applyChoice(state,content,scene.id,id);
   const snapshot=JSON.stringify(state);
   state=clone(state);content=restore(state);
   assert.equal(JSON.stringify(state),snapshot,'reload preserves journal and choices');
  }
  if(state.dag===to)return {state,content};
  assert.ok(state.dag<to,'day should advance forward');
  R.startNextDay(state,content);
 }
}
function append(state,content,id){
 const descriptor=descriptors.find(x=>x.id===id),pack=packs[id];
 assert.ok(descriptor&&pack,'registered chapter '+id);
 useRole(pack.role_scope);
 assert.ok(R.canStartContinuation(state,content,descriptor),'role and immediate predecessor gate '+id);
 const prior=clone(state),next=C.appendContinuation(content,pack);
 R.startContinuation(state,content,next,id,E.resolveEnding(state,content));
 assert.deepEqual(state.arkiv,prior.arkiv,'old journal stays intact');
 assert.deepEqual(state.tidligereValg,prior.tidligereValg,'all old decisions stay intact');
 assert.deepEqual(state.relasjoner,prior.relasjoner,'no hidden relationship effects on chapter handoff');
 assert.equal(state.meters.penger,prior.meters.penger,'no reward on chapter handoff');
 return next;
}
function day31State(arc,a,b,c){
 let state=S.createInitialState(base),content=base;
 ({state,content}=progress(state,content,7,{d2_en_retning:arc.direction}));
 for(const id of arc.chain){
  content=append(state,content,id);
  const pack=packs[id],overrides={};
  if(id===arc.chain[7]){
   for(const s of pack.scenes.filter(x=>x.dag===29))overrides[s.id]=a;
   for(const s of pack.scenes.filter(x=>x.dag===30))overrides[s.id]=b;
   for(const s of pack.scenes.filter(x=>x.dag===31&&x.valg.length===2))overrides[s.id]=c;
  }
  ({state,content}=progress(state,content,pack.sisteDag,overrides));
  assert.equal(state.threadState[pack.hovedtraad].status,'completed');
 }
 assert.equal(state.dag,31);
 assert.equal(state.kapittelArkiv.length,8);
 assert.equal(state.tidligereValg[arc.old+'_31_result'],a+'_'+b+'_'+c);
 assert.equal(E.resolveEnding(state,content).id,arc.old+'_31_'+a+'_'+b+'_'+c);
 return {state,content};
}
const editorial=read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
assert.deepEqual([editorial.literaryTracks.length,editorial.sevenPlotModels.length,editorial.contemporaryTypes.length],[24,7,24]);
assert.deepEqual([editorial.crossCharacterProduction.length,editorial.ensembleProduction.length,editorial.relationshipProduction.length,editorial.consequenceProduction.length,editorial.longTermProduction.length,editorial.lifeConsequencesProduction.length],[5,5,5,5,5,5]);
assert.deepEqual(editorial.lifeConsequencesProduction.map(x=>x.id),arcs.map(x=>x.next));
let reviewed=0;
for(const arc of arcs){
 const pack=packs[arc.next],old=packs[arc.chain[7]],d=descriptors.find(x=>x.id===arc.next);
 const e=editorial.lifeConsequencesProduction.find(x=>x.id===arc.next);
 assert.ok(pack&&old&&d&&e);
 assert.equal(d.etterDag,31);
 assert.deepEqual(d.etterFortsettelser,[arc.chain[7]]);
 assert.equal(pack.role_scope,d.role_scope);
 assert.equal(e.role,pack.role_scope);
 assert.equal(e.prior,arc.chain[7]);
 assert.deepEqual(e.days,[32,33,34]);
 for(const k of e.literaryTracks)assert.ok(editorial.literaryTracks.some(x=>x.id===k));
 for(const k of e.contemporaryTypes)assert.ok(editorial.contemporaryTypes.some(x=>x.id===k));
 for(const k of e.plotLenses)assert.ok(editorial.sevenPlotModels.some(x=>x.id===k));
 assert.equal(pack.scenes.length,15);
 assert.equal(pack.endings.length,9);
 assert.equal(pack.scenes.filter(x=>x.dag===32).length,8);
 assert.equal(pack.scenes.filter(x=>x.dag===33).length,2);
 assert.equal(pack.scenes.filter(x=>x.dag===34).length,5);
 for(const scene of pack.scenes.filter(s=>s.dag===34&&s.valg.length===2)){
  assert.ok(scene.tittel.length>15,'day-34 scene needs a narrative title, not a routing key: '+scene.id);
  assert.ok(scene.tekst.length>100,'day-34 scene needs authored prose, not a routing key: '+scene.id);
 }
 assert.ok(pack.scenes.every(s=>s.threadId===pack.hovedtraad));
 assert.ok(pack.scenes.every(s=>s.valg.every(v=>v.tekst&&v.konsekvensTekst&&v.effekter&&!v.effekter.meters?.penger&&!v.effekter.arbeid&&!v.effekter.inntekt)));
 assert.equal(new Set(pack.endings.filter(x=>!x.standard).map(e=>Object.keys(e.kriterier.flagg)[0])).size,8);
 for(const a of arc.first)for(const b of arc.second)for(const c of arc.third){
  assert.equal(pack.scenes.filter(s=>s.dag===32&&s.conditions?.flagg?.[arc.old+'_31_result']===a+'_'+b+'_'+c).length,1,'eight unique day-29 openings');
 }
 for(const scene of old.scenes.filter(s=>s.dag===31&&s.valg.length===2)){
  assert.ok(scene.tittel.length>15,'previous chapter must display an authored title: '+scene.id);
  assert.ok(scene.tekst.length>100,'previous chapter must display actual narrative, not a routing token: '+scene.id);
  reviewed++;
 }
}
let completePaths=0,roleGates=0,reloads=0;
const seen=new Set(),endings=new Set();
for(const arc of arcs)for(const a of arc.first)for(const b of arc.second)for(const c of arc.third){
 let {state,content}=day31State(arc,a,b,c),pack=packs[arc.next],previous=clone(state);
 content=append(state,content,arc.next);
 assert.equal(state.dag,32);
 assert.equal(state.kapittelArkiv.length,9);
 assert.equal(R.getContinuationIds(state).length,9);
 const id='d32_'+arc.prefix+'_'+a+'_'+b+'_'+c;
 assert.equal(R.selectNextScene(state,content).id,id,'correct day-31 result chooses day-32 opening');
 const initial=clone(state);
 const wrong=base.role.symposium.rollebroer.find(x=>x.role_scope!==pack.role_scope);
 activeRole={badge_id:wrong.badge_id,label:wrong.navn};
 assert.ok(R.isContinuationPaused(state,content),'wrong position prevents progression');
 assert.throws(()=>R.applyChoice(state,content,id,pack.scenes[0].valg[0].id));
 assert.deepEqual(state,initial,'blocked choices cannot mutate state');
 useRole(pack.role_scope);roleGates++;
 for(let pick29=0;pick29<2;pick29++)for(let pick30=0;pick30<2;pick30++)for(let pick31=0;pick31<2;pick31++){
  let s=clone(initial),current=restore(s);
  const oldFlags=clone(previous.tidligereValg),oldJournal=JSON.stringify(previous.arkiv),money=previous.meters.penger,initialRel=clone(previous.relasjoner);
  while(true){
   while(!s.dagFerdig){
    const scene=R.selectNextScene(s,current);
    assert.ok(scene&&pack.scenes.some(q=>q.id===scene.id),'must use one of the new chapter scenes');
    const index=scene.dag===32?pick29:scene.dag===33?pick30:(scene.dag===34&&scene.fase!=='kveld'?pick31:0);
    const selected=scene.valg[index];
    assert.ok(selected);
    seen.add(scene.id+'/'+selected.id);
    R.applyChoice(s,current,scene.id,selected.id);
    const snapshot=JSON.stringify(s);
    s=clone(s);current=restore(s);reloads++;
    assert.equal(JSON.stringify(s),snapshot);
    assert.equal(JSON.stringify(s.arkiv.slice(0,previous.arkiv.length)),oldJournal);
    for(const [k,v] of Object.entries(oldFlags))assert.deepEqual(s.tidligereValg[k],v,'earlier choice immutable '+k);
    assert.equal(s.meters.penger,money,'never create a salary, booking, or payment');
   }
   if(s.dag===34)break;
   R.startNextDay(s,current);
  }
  assert.equal(s.threadState[pack.hovedtraad].status,'completed');
  assert.equal(s.tidligereValg[arc.prefix+'_34_kapittel_avsluttet'],true);
  assert.notDeepEqual(s.relasjoner,initialRel,'meaningful relationship effect');
  const ending=E.resolveEnding(s,current);
  const expected=arc.prefix+'_34_'+s.tidligereValg[arc.prefix+'_34_result'];
  assert.equal(ending.id,expected,'eight outcome-specific endings');
  endings.add(ending.id);
  assert.ok(E.isFinalDay(s,current));
  assert.throws(()=>R.startNextDay(s,current),/neste kapittel/);
  completePaths++;
 }
}
for(const arc of arcs)for(const sc of packs[arc.next].scenes)for(const choice of sc.valg)assert.ok(seen.has(sc.id+'/'+choice.id),'all choices playable '+sc.id+'/'+choice.id);
assert.equal(completePaths,320);
assert.equal(endings.size,40);
assert.equal(roleGates,40);
assert.equal(reviewed,20);
delete globalThis.CivicationLifePositions;
console.log('Civication day 32–34: '+completePaths+' full paths, '+endings.size+' endings, '+roleGates+' role-gated starts, '+reviewed+' day-31 narrative validation, '+seen.size+' reachable choices, '+reloads+' save/reload checks. 24/7/24 unchanged.');
