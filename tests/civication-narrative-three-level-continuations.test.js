'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const clone = v => JSON.parse(JSON.stringify(v));
const cross = read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');

assert.equal(cross.schema, 'civication_narrative_three_level_editorial_v1');
const l = cross.literaryTracks.map(x => x.id), p = cross.sevenPlotModels.map(x => x.id),
  c = cross.contemporaryTypes.map(x => x.id);
for (const [ids, letter, number] of [[l, 'L', 24], [p, 'P', 7], [c, 'C', 24]]) {
 assert.deepEqual(ids, Array.from({length:number},(_,i)=>letter+String(i+1).padStart(2,'0')));
 assert.equal(new Set(ids).size, number);
}
const allLiterary = new Set(), allPlot = new Set();
for (const x of cross.literaryTracks) {
 assert.ok(x.name && x.referenceWorks.length >= 2);
 assert.ok(x.referenceWorks.every(w => !/Tønnesen|Tønnes|Frank Tønnesen/i.test(w)));
}
for (const x of cross.sevenPlotModels) assert.ok(x.theory.includes('Christopher Booker'));
for (const x of cross.contemporaryTypes) {
 assert.ok(x.name && x.roleOrCharacter && x.literaryTracks.length);
 for (const k of x.literaryTracks) {assert.ok(l.includes(k)); allLiterary.add(k);}
 for (const k of x.possiblePlotLenses) {assert.ok(p.includes(k)); allPlot.add(k);}
}
assert.deepEqual([...allLiterary].sort(),[...l].sort(),'all literary main tracks remain available');
assert.deepEqual([...allPlot].sort(),[...p].sort(),'all seven model plots remain available');
assert.ok(cross.contemporaryTypes.some(x=>x.possiblePlotLenses.length===0),'modern scenarios may reject classic plot templates');
assert.ok(cross.contemporaryTypes.some(x=>x.literaryTracks.length>=3),'multiple literary lenses per modern story');

const manifest = read(C.MANIFEST_PATH), entry = manifest.roles.arbeidsledig;
const raw = {
 role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes),
 phaseDefinitions: read(manifest.shared.phaseDefinitions),
 lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
const base = C.buildContent(raw);
const descriptors = base.role.symposium.fortsettelser;
const packs = new Map(descriptors.map(d=>[d.id, read(d.path)]));
const cases = cross.continuationProduction;
assert.equal(cases.length,5);
assert.deepEqual(cases.map(x=>x.id), [
 'musikk_etter_foresporselen', 'sideprosjekt_etter_neste_steg',
 'frilans_etter_neste_steg', 'grunder_etter_neste_steg', 'miljo_etter_invitasjonen'
]);
for (const x of cases) {
 const d=descriptors.find(y=>y.id===x.id),pack=packs.get(x.id);
 assert.ok(d && pack,x.id);
 assert.equal(d.etterDag,13);
 assert.deepEqual(d.etterFortsettelser,[x.prior]);
 assert.equal(d.role_scope,x.role);
 assert.equal(pack.role_scope,x.role);
 assert.equal(pack.sisteDag,16);
 assert.deepEqual([...new Set(pack.scenes.map(s=>s.dag))].sort(),[14,15,16]);
 assert.ok(pack.scenes.filter(s=>s.dag===14).length>=2);
 assert.ok(pack.scenes.some(s=>s.dag===16&&s.conditions?.flagg));
 assert.ok(pack.scenes.every(s=>s.valg.every(v=>v.konsekvensTekst && v.effekter && !v.effekter.meters?.penger)));
 assert.ok(pack.scenes.every(s=>!s.tekst.includes('Tønnes')));
 assert.ok(x.literaryTracks.every(id=>l.includes(id)));
 assert.ok(x.contemporaryTypes.every(id=>c.includes(id)));
}

let roleScope;
globalThis.CivicationLifePositions = {getLifeContext:()=> {
 const bridge=base.role.symposium.rollebroer.find(b=>b.role_scope===roleScope);
 return {primary_life_position:bridge?{badge_id:bridge.badge_id,label:bridge.navn}:null};
}};
const withRole = id => {roleScope=descriptors.find(d=>d.id===id).role_scope;};
function week(kind) {
 let s=S.createInitialState(base);
 while (true) {
  while(!s.dagFerdig){
   const sc=R.selectNextScene(s,base);
   assert.ok(sc);
   const id=sc.id==='d2_en_retning'?kind:sc.valg[0].id;
   R.applyChoice(s,base,sc.id,id);
  }
  if(s.dag===7)return s;
  R.startNextDay(s,base);
 }
}
function applyChapter(saved,content,id,overrides={}) {
 withRole(id);
 const next=descriptors.find(d=>d.id===id), pack=packs.get(id);
 assert.ok(R.canStartContinuation(saved,content,next),'chapter available '+id);
 const previous=clone(saved);
 const merged=C.appendContinuation(content,pack);
 R.startContinuation(saved,content,merged,id,E.resolveEnding(saved,content));
 assert.deepEqual(saved.arkiv,previous.arkiv,'archive unchanged at chapter boundary');
 assert.deepEqual(saved.tidligereValg,previous.tidligereValg,'flags unchanged at chapter boundary');
 let steps=0;
 const played=[];
 while(true){
  while(!saved.dagFerdig) {
   const sc=R.selectNextScene(saved,merged);
   assert.ok(sc && sc.dag===saved.dag,'authored scene available on '+id+' day '+saved.dag);
   assert.ok(pack.scenes.some(x=>x.id===sc.id),'current chapter owns scene');
   const selected=overrides[sc.id] || sc.valg[0].id;
   played.push({day:saved.dag,sceneId:sc.id,choice:selected});
   R.applyChoice(saved,merged,sc.id,selected);
   assert.ok(++steps<70,'finite day progression');
   assert.deepEqual(saved.arkiv.slice(0,previous.arkiv.length),previous.arkiv,'prior decisions preserved');
  }
  if(saved.dag===pack.sisteDag)break;
  R.startNextDay(saved,merged);
 }
 assert.equal(saved.threadState[pack.hovedtraad].status,'completed');
 assert.ok(saved.tidligereValg[Object.keys(pack.scenes.at(-1).valg[0].effekter.flagg)[0]],'chapter closed');
 assert.equal(saved.meters.penger,previous.meters.penger,'story does not mint ParadiseCoin');
 assert.ok(E.isFinalDay(saved,merged));
 assert.deepEqual(saved.fortsettelser.at(-1),id);
 return {state:saved,content:merged,played,prior:previous};
}
function beforeDay14(person,priorOpts={}) {
 let s=week(person==='mira'?'musikk':person==='arvid'?'miljo':'prosjekt');
 let content=base;
 const prior=person==='mira'?['musikk_med_mira','musikk_foresporselen']
   :person==='arvid'?['miljo_med_arvid','miljo_navnet_ditt']
   :[person+'_med_lea',person+'_neste_steg'];
 for (const id of prior) {
  const result=applyChapter(s,content,id,priorOpts[id]||{});
  s=result.state; content=result.content;
 }
 assert.equal(s.dag,13);
 return {state:s,content};
}
const stages=[
 {who:'mira',id:'musikk_etter_foresporselen',alt:'d14_mira_hold',variant:{}},
 {who:'sideprosjekt',id:'sideprosjekt_etter_neste_steg'},
 {who:'frilans',id:'frilans_etter_neste_steg'},
 {who:'grunder',id:'grunder_etter_neste_steg'},
 {who:'arvid',id:'miljo_etter_invitasjonen'}
];
let played=0;
for (const x of stages) {
 const initial=beforeDay14(x.who),old=clone(initial.state);
 const first=applyChapter(initial.state,initial.content,x.id);
 assert.deepEqual(first.state.arkiv.slice(0,old.arkiv.length),old.arkiv);
 assert.deepEqual(first.state.kapittelArkiv.slice(0,old.kapittelArkiv.length),old.kapittelArkiv);
 assert.ok(first.played.some(a=>a.day===14)&&first.played.some(a=>a.day===16));
 const day14=first.played.find(a=>a.day===14);
 const data=packs.get(x.id).scenes.find(s=>s.id===day14.sceneId);
 if(data.valg.length>=2) {
  const different=beforeDay14(x.who),alt=applyChapter(different.state,different.content,x.id,{[data.id]:data.valg.at(-1).id});
  assert.notDeepEqual(alt.played.map(a=>a.sceneId),first.played.map(a=>a.sceneId),'alternate day 14 choice returns later');
  assert.deepEqual(alt.state.arkiv.slice(0,old.arkiv.length),old.arkiv);
  played+=alt.played.length;
 }
 played+=first.played.length;
}
// Old terminal decisions lead to different openings; no cancelled gig,
 // abandoned project or revoked contact becomes an invented success.
for (const [who,id,previous,overrides,expected] of [
 ['mira','musikk_etter_foresporselen','musikk_foresporselen',
  {'d11_musikk_etter_proven':'avsta'},'d14_mira_nei'],
 ['mira','musikk_etter_foresporselen','musikk_foresporselen',
  {'d11_musikk_etter_proven':'vent'},'d14_mira_uavklart'],
 ['sideprosjekt','sideprosjekt_etter_neste_steg','sideprosjekt_neste_steg',
  {'d13_sideprosjekt_vurdering':'avslutt'},'d14_sideprosjekt_avsluttet'],
 ['arvid','miljo_etter_invitasjonen','miljo_navnet_ditt',
  {'d11_arvid_med_kontakt':'avstand'},'d14_arvid_avstand'],
 ['arvid','miljo_etter_invitasjonen','miljo_navnet_ditt',
  {'d11_arvid_med_kontakt':'navn','d12_arvid_navnet':'la_staa','d13_arvid_forventningen':'vent'},'d14_arvid_uklart']
 ]) {
 const original=beforeDay14(who,{[previous]:overrides});
 withRole(id);
 const merged=C.appendContinuation(original.content,packs.get(id));
 assert.ok(R.canStartContinuation(original.state,original.content,descriptors.find(d=>d.id===id)));
 R.startContinuation(original.state,original.content,merged,id,E.resolveEnding(original.state,original.content));
 assert.equal(R.selectNextScene(original.state,merged).id,expected);
}
delete globalThis.CivicationLifePositions;
console.log('Narrative three-level: 24/7/24 crosswalk; 5 day-14–16 chapters, alternate paths, preserved archives; '+played+' scenes played.');
