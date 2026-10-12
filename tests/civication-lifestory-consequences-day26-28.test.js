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
const clone=v=>JSON.parse(JSON.stringify(v));
const manifest=read(C.MANIFEST_PATH),m=manifest.roles.arbeidsledig;
const raw={role:read(m.role),roleThreads:read(m.threads),roleScenes:read(m.scenes),
 phaseDefinitions:read(manifest.shared.phaseDefinitions),lifeThreads:read(manifest.life.threads),lifeScenes:read(manifest.life.scenes)};
const base=C.buildContent(clone(raw)),descriptors=base.role.symposium.fortsettelser;
const packs=Object.fromEntries(descriptors.map(d=>[d.id,read(d.path)]));
const variants=['ansvar_naer','ansvar_distanse','vern_naer','vern_distanse'];
const arcs=[
 {direction:'musikk',chain:['musikk_med_mira','musikk_foresporselen','musikk_etter_foresporselen','sideprosjekt_kryss_med_mira','miljo_etter_leas_program','lea_etter_arvids_ansvar'],
 next:'arvid_etter_leas_tillit',old:'rel_lea_arvid',prefix:'felles_arvid'},
 {direction:'prosjekt',chain:['sideprosjekt_med_lea','sideprosjekt_neste_steg','sideprosjekt_etter_neste_steg','miljo_kryss_med_lea','musikk_etter_arvids_tekst','mira_etter_samtalen_med_lea'],
 next:'lea_etter_miras_vennskap',old:'rel_mira_lea',prefix:'felles_lea'},
 {direction:'miljo',chain:['miljo_med_arvid','miljo_navnet_ditt','miljo_etter_invitasjonen','musikk_kryss_med_arvid','frilans_etter_miras_navn','arvid_etter_leas_notat'],
 next:'lea_etter_arvids_fortelling',old:'rel_arvid_fortelling',prefix:'felles_lea_fortelling'},
 {direction:'prosjekt',chain:['frilans_med_lea','frilans_neste_steg','frilans_etter_neste_steg','miljo_kryss_med_frilans','frilans_etter_arvids_kreditering','arvid_etter_leas_grense'],
 next:'lea_etter_arvids_avstand',old:'rel_arvid_grense',prefix:'felles_lea_avstand'},
 {direction:'prosjekt',chain:['grunder_med_lea','grunder_neste_steg','grunder_etter_neste_steg','musikk_kryss_med_grunder','miljo_etter_miras_lyd','mira_etter_lydfilens_rykte'],
 next:'mira_etter_nye_takter',old:'rel_mira_lyd',prefix:'felles_mira_egen'}
];
let activeRole=null;
globalThis.CivicationLifePositions={getLifeContext:()=>({primary_life_position:activeRole})};
function useRole(scope){
 const bridge=base.role.symposium.rollebroer.find(b=>b.role_scope===scope);
 assert.ok(bridge,'role '+scope);
 activeRole={badge_id:bridge.badge_id,label:bridge.navn};
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
   assert.ok(scene,'authored scene on day '+state.dag+' / '+state.fase);
   const selected=overrides[scene.id]||scene.valg[0].id;
   R.applyChoice(state,content,scene.id,selected);
   const snap=JSON.stringify(state);
   state=clone(state);content=restore(state);
   assert.equal(JSON.stringify(state),snap,'save/reload keeps all existing data');
  }
  if(state.dag===to)return {state,content};
  assert.ok(state.dag<to,'no day overflow');
  R.startNextDay(state,content);
 }
}
function append(state,content,id){
 const d=descriptors.find(q=>q.id===id),pack=packs[id];
 assert.ok(d&&pack,'registered continuation '+id);
 useRole(pack.role_scope);
 assert.ok(R.canStartContinuation(state,content,d),'role and predecessor gate '+id);
 const before=clone(state),newContent=C.appendContinuation(content,pack);
 R.startContinuation(state,content,newContent,id,E.resolveEnding(state,content));
 assert.deepEqual(state.arkiv,before.arkiv,'old journal immutable at chapter start');
 assert.deepEqual(state.tidligereValg,before.tidligereValg,'all earlier decisions immutable at chapter start');
 assert.deepEqual(state.relasjoner,before.relasjoner,'no silent relationship changes on handoff');
 assert.equal(state.meters.penger,before.meters.penger,'no money on handoff');
 return newContent;
}
function day25State(arc,variant){
 let content=base,state=S.createInitialState(base);
 ({state,content}=progress(state,content,7,{d2_en_retning:arc.direction}));
 const [middle,final]=variant.split('_');
 for(const id of arc.chain){
  content=append(state,content,id);
  const p=packs[id],overrides={};
  if(id===arc.chain[5]){
   for(const sc of p.scenes.filter(s=>s.dag===24))overrides[sc.id]=middle;
   for(const sc of p.scenes.filter(s=>s.dag===25&&s.valg.length===2))overrides[sc.id]=final;
  }
  ({state,content}=progress(state,content,p.sisteDag,overrides));
  assert.equal(state.threadState[p.hovedtraad].status,'completed','all earlier chapters finished');
 }
 assert.equal(state.dag,25);
 assert.equal(state.tidligereValg[arc.old+'_25_result'],variant,'correct prior ending');
 assert.equal(E.resolveEnding(state,content).id,arc.old+'_25_'+variant,'four possible earlier endings uniquely resolved');
 assert.equal(state.kapittelArkiv.length,6);
 return {state,content};
}
const editor=read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
assert.deepEqual([editor.literaryTracks.length,editor.sevenPlotModels.length,editor.contemporaryTypes.length],[24,7,24]);
assert.equal(editor.crossCharacterProduction.length,5);
assert.equal(editor.ensembleProduction.length,5);
assert.equal(editor.relationshipProduction.length,5);
assert.deepEqual(editor.consequenceProduction.map(x=>x.id),arcs.map(x=>x.next));
for(const arc of arcs){
 const p=packs[arc.next],d=descriptors.find(x=>x.id===arc.next),e=editor.consequenceProduction.find(x=>x.id===arc.next);
 assert.ok(p&&d&&e);
 assert.equal(d.etterDag,25);
 assert.deepEqual(d.etterFortsettelser,[arc.chain[5]]);
 assert.equal(p.role_scope,d.role_scope);
 assert.equal(e.role,p.role_scope);
 assert.equal(e.prior,arc.chain[5]);
 assert.deepEqual(e.days,[26,27,28]);
 for(const id of e.literaryTracks)assert.ok(editor.literaryTracks.some(q=>q.id===id));
 for(const id of e.contemporaryTypes)assert.ok(editor.contemporaryTypes.some(q=>q.id===id));
 for(const id of e.plotLenses)assert.ok(editor.sevenPlotModels.some(q=>q.id===id));
 assert.deepEqual([26,27,28],Array.from(new Set(p.scenes.map(x=>x.dag))).sort());
 assert.equal(p.scenes.length,11);
 assert.equal(p.endings.length,5,'all four branching endings plus fallback');
 assert.equal(p.scenes.filter(x=>x.dag===26).length,4);
 assert.equal(p.scenes.filter(x=>x.dag===27).length,2);
 assert.equal(p.scenes.filter(x=>x.dag===28).length,5);
 assert.ok(p.scenes.every(s=>s.threadId===p.hovedtraad));
 assert.ok(p.scenes.every(s=>s.valg.every(v=>v.tekst&&v.konsekvensTekst&&v.effekter&&!v.effekter.meters?.penger&&!v.effekter.arbeid&&!v.effekter.inntekt)));
 for(const variant of variants)assert.equal(p.scenes.filter(s=>s.dag===26&&s.conditions?.flagg?.[arc.old+'_25_result']===variant).length,1,'unique opening '+variant);
 assert.equal(new Set(p.endings.filter(e=>!e.standard).map(e=>Object.keys(e.kriterier.flagg)[0])).size,4);
}
let completed=0,roleGuards=0,reloads=0;
const reached=new Set(),resolved=new Set();
for(const arc of arcs)for(const variant of variants){
 let {state,content}=day25State(arc,variant);
 const p=packs[arc.next],previous=clone(state);
 content=append(state,content,arc.next);
 assert.equal(state.dag,26);
 assert.equal(state.kapittelArkiv.length,7);
 assert.equal(R.getContinuationIds(state).length,7);
 const first='d26_'+arc.prefix+'_'+variant;
 assert.equal(R.selectNextScene(state,content).id,first);
 const initial=clone(state);
 const wrong=base.role.symposium.rollebroer.find(b=>b.role_scope!==p.role_scope);
 activeRole={badge_id:wrong.badge_id,label:wrong.navn};
 assert.ok(R.isContinuationPaused(state,content),'wrong role pauses chapter');
 assert.throws(()=>R.applyChoice(state,content,first,p.scenes[0].valg[0].id));
 assert.deepEqual(state,initial);
 useRole(p.role_scope);roleGuards++;
 for(let pick26=0;pick26<2;pick26++)for(let pick27=0;pick27<2;pick27++)for(let pick28=0;pick28<2;pick28++){
  let s=clone(initial),c=restore(s);
  const oldFlags=clone(previous.tidligereValg),oldArchive=JSON.stringify(previous.arkiv),oldMoney=previous.meters.penger;
  const priorRelationships=clone(previous.relasjoner);
  while(true){
   while(!s.dagFerdig){
    const scene=R.selectNextScene(s,c);
    assert.ok(scene&&p.scenes.some(q=>q.id===scene.id),'authored next-chapter scene on day '+s.dag);
    const index=scene.dag===26?pick26:scene.dag===27?pick27:(scene.dag===28&&scene.fase!=='kveld'?pick28:0);
    const choice=scene.valg[index];
    assert.ok(choice,'valid branching choice');
    reached.add(scene.id+'/'+choice.id);
    R.applyChoice(s,c,scene.id,choice.id);
    const serialized=JSON.stringify(s);s=clone(s);c=restore(s);reloads++;
    assert.equal(JSON.stringify(s),serialized);
    assert.equal(JSON.stringify(s.arkiv.slice(0,previous.arkiv.length)),oldArchive);
    for(const [k,v] of Object.entries(oldFlags))assert.deepEqual(s.tidligereValg[k],v,'historic choice unchanged '+k);
    assert.equal(s.meters.penger,oldMoney,'never create automatic payment');
   }
   if(s.dag===28)break;
   R.startNextDay(s,c);
  }
  assert.equal(s.threadState[p.hovedtraad].status,'completed');
  assert.equal(s.tidligereValg[arc.prefix+'_28_kapittel_avsluttet'],true);
  assert.notDeepEqual(s.relasjoner,priorRelationships,'choices change relationships');
  const ending=E.resolveEnding(s,c);
  assert.ok(ending&&!ending.id.endsWith('standard'),'specific ending');
  resolved.add(ending.id);
  assert.equal(E.isFinalDay(s,c),true);
  assert.throws(()=>R.startNextDay(s,c),/neste kapittel/);
  completed++;
 }
}
for(const arc of arcs)for(const scene of packs[arc.next].scenes)for(const choice of scene.valg)assert.ok(reached.has(scene.id+'/'+choice.id),'reachable choice '+scene.id+'/'+choice.id);
assert.equal(completed,160);
assert.equal(roleGuards,20);
assert.equal(resolved.size,20);
delete globalThis.CivicationLifePositions;
console.log('Civication next consequences: '+completed+' complete day 26–28 paths, '+resolved.size+' ending variants, '+roleGuards+' gated handoffs, '+reached.size+' reachable choices, '+reloads+' save/reloads; 24/7/24 retained.');
