'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../js/Civication/lifestory/lifestoryContent');
const S=require('../js/Civication/lifestory/lifestoryState');
const R=require('../js/Civication/lifestory/lifestoryRunner');
const E=require('../js/Civication/lifestory/lifestoryEndings');

const root=path.resolve(__dirname,'..');
const read=filename=>JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const clone=value=>JSON.parse(JSON.stringify(value));
const manifest=read(C.MANIFEST_PATH),m=manifest.roles.arbeidsledig;
const raw={
 role:read(m.role),roleThreads:read(m.threads),roleScenes:read(m.scenes),
 phaseDefinitions:read(manifest.shared.phaseDefinitions),
 lifeThreads:read(manifest.life.threads),lifeScenes:read(manifest.life.scenes)
};
const base=C.buildContent(clone(raw));
const descriptors=base.role.symposium.fortsettelser;
const packs=Object.fromEntries(descriptors.map(d=>[d.id,read(d.path)]));
const arcs=[
 {direction:'musikk',chain:['musikk_med_mira','musikk_foresporselen','musikk_etter_foresporselen','sideprosjekt_kryss_med_mira','miljo_etter_leas_program'],next:'lea_etter_arvids_ansvar',prefix:'rel_lea_arvid',old20:'ensemble_arvid_program_20_retning',a:['vis','stopp'],old21:'ensemble_arvid_program_21_retning',b:['samlet','hver']},
 {direction:'prosjekt',chain:['sideprosjekt_med_lea','sideprosjekt_neste_steg','sideprosjekt_etter_neste_steg','miljo_kryss_med_lea','musikk_etter_arvids_tekst'],next:'mira_etter_samtalen_med_lea',prefix:'rel_mira_lea',old20:'ensemble_mira_tekst_20_retning',a:['mira','lea'],old21:'ensemble_mira_tekst_21_retning',b:['direkte','skille']},
 {direction:'miljo',chain:['miljo_med_arvid','miljo_navnet_ditt','miljo_etter_invitasjonen','musikk_kryss_med_arvid','frilans_etter_miras_navn'],next:'arvid_etter_leas_notat',prefix:'rel_arvid_fortelling',old20:'ensemble_lea_navn_20_retning',a:['anonym','samtykke'],old21:'ensemble_lea_navn_21_retning',b:['endre','privat']},
 {direction:'prosjekt',chain:['frilans_med_lea','frilans_neste_steg','frilans_etter_neste_steg','miljo_kryss_med_frilans','frilans_etter_arvids_kreditering'],next:'arvid_etter_leas_grense',prefix:'rel_arvid_grense',old20:'ensemble_lea_kreditering_20_retning',a:['direkte','arvid'],old21:'ensemble_lea_kreditering_21_retning',b:['rolle','avstand']},
 {direction:'prosjekt',chain:['grunder_med_lea','grunder_neste_steg','grunder_etter_neste_steg','musikk_kryss_med_grunder','miljo_etter_miras_lyd'],next:'mira_etter_lydfilens_rykte',prefix:'rel_mira_lyd',old20:'ensemble_arvid_lyd_20_retning',a:['stans','sporr'],old21:'ensemble_arvid_lyd_21_retning',b:['slett','begrens']}
];
let activeRole=null;
globalThis.CivicationLifePositions={getLifeContext:()=>({primary_life_position:activeRole})};
function setRole(scope){
 const role=base.role.symposium.rollebroer.find(x=>x.role_scope===scope);
 assert.ok(role,'role exists '+scope);
 activeRole={badge_id:role.badge_id,label:role.navn};
}
function restore(state) {
 let content=C.buildContent(clone(raw));
 for(const id of R.getContinuationIds(state))content=C.appendContinuation(content,packs[id]);
 S.reconcileContent(state,content);
 return content;
}
function complete(state,content,to,overrides={}) {
 while(true){
  while(!state.dagFerdig){
   const scene=R.selectNextScene(state,content);
   assert.ok(scene,'expected authored scene on day '+state.dag+' phase '+state.fase);
   const choice=overrides[scene.id]||scene.valg[0].id;
   R.applyChoice(state,content,scene.id,choice);
   const frozen=JSON.stringify(state);
   state=clone(state);content=restore(state);
   assert.equal(JSON.stringify(state),frozen,'reload preserves exact prior state');
  }
  if(state.dag===to)return {state,content};
  assert.ok(state.dag<to,'day overflow');
  R.startNextDay(state,content);
 }
}
function append(state,content,id){
 const d=descriptors.find(x=>x.id===id),pack=packs[id];
 assert.ok(d&&pack,'continuation exists '+id);
 setRole(pack.role_scope);
 assert.ok(R.canStartContinuation(state,content,d),'valid role and chapter handoff: '+id);
 const before=clone(state),merged=C.appendContinuation(content,pack);
 R.startContinuation(state,content,merged,id,E.resolveEnding(state,content));
 assert.deepEqual(state.arkiv,before.arkiv,'old archive stable');
 assert.deepEqual(state.tidligereValg,before.tidligereValg,'old flags stable');
 assert.deepEqual(state.relasjoner,before.relasjoner,'no hidden relationship changes on handoff');
 assert.equal(state.meters.penger,before.meters.penger,'no payment on handoff');
 return merged;
}
function reach22(arc,a,b){
 let content=base,state=S.createInitialState(base);
 ({state,content}=complete(state,content,7,{d2_en_retning:arc.direction}));
 for(const id of arc.chain){
  content=append(state,content,id);
  const pack=packs[id],overrides={};
  if(id===arc.chain[4]){
   for(const sc of pack.scenes.filter(s=>s.dag===20))overrides[sc.id]=a;
   for(const sc of pack.scenes.filter(s=>s.dag===21))overrides[sc.id]=b;
  }
  ({state,content}=complete(state,content,pack.sisteDag,overrides));
  assert.equal(state.threadState[pack.hovedtraad].status,'completed');
 }
 assert.equal(state.dag,22);
 assert.equal(state.tidligereValg[arc.old20],a);
 assert.equal(state.tidligereValg[arc.old21],b);
 assert.equal(state.kapittelArkiv.length,5);
 return {state,content};
}
const editor=read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
assert.deepEqual([editor.literaryTracks.length,editor.sevenPlotModels.length,editor.contemporaryTypes.length],[24,7,24]);
assert.equal(editor.crossCharacterProduction.length,5);
assert.equal(editor.ensembleProduction.length,5);
assert.deepEqual(editor.relationshipProduction.map(x=>x.id),arcs.map(x=>x.next));
for(const arc of arcs){
 const d=descriptors.find(x=>x.id===arc.next),p=packs[arc.next],e=editor.relationshipProduction.find(x=>x.id===arc.next);
 assert.ok(d&&p&&e);
 assert.equal(d.etterDag,22);
 assert.deepEqual(d.etterFortsettelser,[arc.chain[4]]);
 assert.equal(e.prior,arc.chain[4]);
 assert.deepEqual(e.days,[23,24,25]);
 assert.equal(e.role,p.role_scope);
 for(const key of e.literaryTracks)assert.ok(editor.literaryTracks.some(x=>x.id===key));
 for(const key of e.contemporaryTypes)assert.ok(editor.contemporaryTypes.some(x=>x.id===key));
 for(const key of e.plotLenses)assert.ok(editor.sevenPlotModels.some(x=>x.id===key));
 assert.equal(p.scenes.length,9);
 assert.equal(p.endings.length,5);
 assert.equal(p.scenes.filter(s=>s.dag===23).length,4);
 assert.equal(p.scenes.filter(s=>s.dag===24).length,2);
 assert.equal(p.scenes.filter(s=>s.dag===25).length,3);
 assert.ok(p.scenes.every(s=>s.threadId===p.hovedtraad));
 assert.ok(p.scenes.every(s=>s.valg.every(v=>v.tekst&&v.konsekvensTekst&&v.effekter&&!v.effekter.meters?.penger&&!v.effekter.arbeid)));
 for(const a of arc.a)for(const b of arc.b){
  assert.equal(p.scenes.filter(s=>s.dag===23&&s.conditions?.flagg?.[arc.old20]===a&&s.conditions?.flagg?.[arc.old21]===b).length,1);
 }
 const statuses=new Set(p.endings.filter(x=>!x.standard).map(x=>Object.keys(x.kriterier.flagg)[0]));
 assert.equal(statuses.size,4,'four distinct relation outcomes');
}
let completePaths=0,reloads=0,roleGates=0;
const seen=new Set(),allEndings=new Set(),relationshipResults=new Set();
for(const arc of arcs)for(const a of arc.a)for(const b of arc.b){
 let {state,content}=reach22(arc,a,b),pack=packs[arc.next];
 const prior=clone(state);
 content=append(state,content,arc.next);
 assert.equal(state.dag,23);
 assert.equal(state.kapittelArkiv.length,6);
 assert.equal(R.getContinuationIds(state).length,6);
 const firstId='d23_'+arc.prefix+'_'+a+'_'+b;
 assert.equal(R.selectNextScene(state,content).id,firstId);
 const initial=clone(state);
 const wrong=base.role.symposium.rollebroer.find(x=>x.role_scope!==pack.role_scope);
 activeRole={badge_id:wrong.badge_id,label:wrong.navn};
 assert.equal(R.isContinuationPaused(state,content),true);
 assert.throws(()=>R.applyChoice(state,content,firstId,pack.scenes[0].valg[0].id));
 assert.deepEqual(state,initial);
 setRole(pack.role_scope);roleGates++;
 for(let pick23=0;pick23<2;pick23++)for(let pick24=0;pick24<2;pick24++)for(let pick25=0;pick25<2;pick25++){
  let s=clone(initial),c=restore(s);
  const oldFlags=clone(prior.tidligereValg),oldArchive=JSON.stringify(prior.arkiv),oldMoney=prior.meters.penger;
  const outcome=pack.scenes.find(x=>x.dag===25&&x.conditions?.flagg?.[arc.prefix+'_24_retning']===(pick24===0?'ansvar':'vern')).valg[pick25].effekter.flagg[arc.prefix+'_25_result'];
  while(true){
   while(!s.dagFerdig){
    const scene=R.selectNextScene(s,c);
    assert.ok(scene&&pack.scenes.some(x=>x.id===scene.id),'must use authored day 23–25 scenes');
    const index=scene.dag===23?pick23:scene.dag===24?pick24:(scene.dag===25&&scene.fase!=='kveld'?pick25:0);
    const selection=scene.valg[index];
    assert.ok(selection);
    seen.add(scene.id+'/'+selection.id);
    R.applyChoice(s,c,scene.id,selection.id);
    const snap=JSON.stringify(s);
    s=clone(s);c=restore(s);reloads++;
    assert.equal(JSON.stringify(s),snap);
    assert.equal(JSON.stringify(s.arkiv.slice(0,prior.arkiv.length)),oldArchive);
    for(const [key,value]of Object.entries(oldFlags))assert.deepEqual(s.tidligereValg[key],value,'historic choice preserved '+key);
    assert.equal(s.meters.penger,oldMoney,'no payment or contract');
   }
   if(s.dag===25)break;
   R.startNextDay(s,c);
  }
  assert.equal(s.threadState[pack.hovedtraad].status,'completed');
  assert.equal(s.tidligereValg[arc.prefix+'_25_kapittel_avsluttet'],true);
  assert.equal(s.tidligereValg[arc.prefix+'_25_result'],outcome);
  const ending=E.resolveEnding(s,c);
  assert.ok(ending&&ending.id===arc.prefix+'_25_'+outcome,'outcome-specific ending');
  relationshipResults.add(arc.next+':'+outcome);
  allEndings.add(ending.id);
  assert.equal(E.isFinalDay(s,c),true);
  assert.throws(()=>R.startNextDay(s,c),/neste kapittel/);
  completePaths++;
 }
}
for(const arc of arcs)for(const scene of packs[arc.next].scenes)for(const choice of scene.valg){
 assert.ok(seen.has(scene.id+'/'+choice.id),'reachable choice '+scene.id+'/'+choice.id);
}
assert.equal(completePaths,160);
assert.equal(roleGates,20);
assert.equal(relationshipResults.size,20);
assert.equal(allEndings.size,20);
delete globalThis.CivicationLifePositions;
console.log('Civication relationships: '+completePaths+' day 23–25 complete paths, '+relationshipResults.size+' distinct endings, '+seen.size+' unique choices, '+roleGates+' role-gated starts, '+reloads+' reload checks, 24/7/24 taxonomy unchanged.');
