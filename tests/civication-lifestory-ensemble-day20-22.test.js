'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');

const root = path.resolve(__dirname, '..');
const read = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH), m = manifest.roles.arbeidsledig;
const raw = {
  role: read(m.role), roleThreads: read(m.threads), roleScenes: read(m.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
const base = C.buildContent(clone(raw));
const descriptors = base.role.symposium.fortsettelser;
const packs = Object.fromEntries(descriptors.map(d => [d.id,read(d.path)]));
const arcs = [
  {direction:'musikk', chain:['musikk_med_mira','musikk_foresporselen','musikk_etter_foresporselen','sideprosjekt_kryss_med_mira'],
    next:'miljo_etter_leas_program',oldPrefix:'samspill_lea',old20:'samspill_lea17_spor',a:['avklar','skjerm'],
    old19:'samspill_lea19_ending',b:['presiser','stans'],opening:'ensemble_arvid_program'},
  {direction:'prosjekt',chain:['sideprosjekt_med_lea','sideprosjekt_neste_steg','sideprosjekt_etter_neste_steg','miljo_kryss_med_lea'],
    next:'musikk_etter_arvids_tekst',oldPrefix:'samspill_arvid',old20:'samspill_arvid17_spor',a:['avklar','skjerm'],
    old19:'samspill_arvid19_ending',b:['presiser','stans'],opening:'ensemble_mira_tekst'},
  {direction:'miljo',chain:['miljo_med_arvid','miljo_navnet_ditt','miljo_etter_invitasjonen','musikk_kryss_med_arvid'],
    next:'frilans_etter_miras_navn',oldPrefix:'samspill_mira',old20:'samspill_mira17_spor',a:['avklar','skjerm'],
    old19:'samspill_mira19_ending',b:['presiser','stans'],opening:'ensemble_lea_navn'},
  {direction:'prosjekt',chain:['frilans_med_lea','frilans_neste_steg','frilans_etter_neste_steg','miljo_kryss_med_frilans'],
    next:'frilans_etter_arvids_kreditering',oldPrefix:'kryss_frilans_arvid',old20:'kryss_frilans_arvid_17_retning',a:['kontakt','stopp'],
    old19:'kryss_frilans_arvid_19_ending',b:['rette','avgrense'],opening:'ensemble_lea_kreditering'},
  {direction:'prosjekt',chain:['grunder_med_lea','grunder_neste_steg','grunder_etter_neste_steg','musikk_kryss_med_grunder'],
    next:'miljo_etter_miras_lyd',oldPrefix:'kryss_grunder_mira',old20:'kryss_grunder_mira_17_retning',a:['avtal','privat'],
    old19:'kryss_grunder_mira_19_ending',b:['samtykke','egen'],opening:'ensemble_arvid_lyd'}
];
let primary = null;
globalThis.CivicationLifePositions = {getLifeContext: () => ({primary_life_position:primary})};
function setRole(scope) {
  const bridge = base.role.symposium.rollebroer.find(b => b.role_scope === scope);
  assert.ok(bridge,'known role '+scope);
  primary = {badge_id:bridge.badge_id,label:bridge.navn};
}
function restore(state) {
  let content = C.buildContent(clone(raw));
  for (const id of R.getContinuationIds(state)) content = C.appendContinuation(content,packs[id]);
  S.reconcileContent(state,content);
  return content;
}
function finish(state,content,to,overrides={}) {
  while(true) {
    while(!state.dagFerdig) {
      const scene=R.selectNextScene(state,content);
      assert.ok(scene,'missing scene on day '+state.dag+' / '+state.fase);
      const choice = overrides[scene.id] || scene.valg[0].id;
      R.applyChoice(state,content,scene.id,choice);
      const serialized = JSON.stringify(state);
      state=clone(state);
      content=restore(state);
      assert.equal(JSON.stringify(state),serialized,'save unchanged on reload');
    }
    if(state.dag===to)return {state,content};
    assert.ok(state.dag<to,'day overflow');
    R.startNextDay(state,content);
  }
}
function append(state,content,id) {
  const d=descriptors.find(x=>x.id===id),pack=packs[id];
  assert.ok(d && pack,'known continuation '+id);
  setRole(pack.role_scope);
  assert.ok(R.canStartContinuation(state,content,d),'chapter available '+id);
  const saved = clone(state),next=C.appendContinuation(content,pack);
  R.startContinuation(state,content,next,id,E.resolveEnding(state,content));
  assert.deepEqual(state.arkiv,saved.arkiv,'historical archive stays intact');
  assert.deepEqual(state.tidligereValg,saved.tidligereValg,'old decisions unchanged');
  assert.deepEqual(state.relasjoner,saved.relasjoner);
  assert.equal(state.meters.penger,saved.meters.penger);
  return next;
}
function approachDay19(arc,a,b) {
  let content=base,state=S.createInitialState(base);
  ({state,content}=finish(state,content,7,{d2_en_retning:arc.direction}));
  for(const id of arc.chain) {
    content=append(state,content,id);
    const pack=packs[id],overrides={};
    if(id===arc.chain[3]){
      for(const scene of pack.scenes.filter(s=>s.dag===17))overrides[scene.id]=a;
      for(const scene of pack.scenes.filter(s=>s.dag===18))overrides[scene.id]=b;
    }
    ({state,content}=finish(state,content,pack.sisteDag,overrides));
    assert.equal(state.threadState[pack.hovedtraad].status,'completed');
  }
  assert.equal(state.dag,19);
  assert.equal(state.tidligereValg[arc.old20],a);
  assert.equal(state.tidligereValg[arc.old19],b);
  assert.equal(state.kapittelArkiv.length,4,'all previous chapters archived at day 19');
  return {state,content};
}
const editor=read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
assert.deepEqual([editor.literaryTracks.length,editor.sevenPlotModels.length,editor.contemporaryTypes.length],[24,7,24]);
assert.equal(editor.crossCharacterProduction.length,5);
assert.deepEqual(editor.ensembleProduction.map(x=>x.id),arcs.map(x=>x.next));
for(const arc of arcs){
  const desc=descriptors.find(d=>d.id===arc.next),pack=packs[arc.next],entry=editor.ensembleProduction.find(e=>e.id===arc.next);
  assert.ok(desc&&pack&&entry);
  assert.equal(desc.etterDag,19);
  assert.deepEqual(desc.etterFortsettelser,[arc.chain[3]]);
  assert.deepEqual(entry.days,[20,21,22]);
  assert.equal(entry.role,pack.role_scope);
  for(const t of entry.literaryTracks)assert.ok(editor.literaryTracks.some(x=>x.id===t));
  for(const t of entry.contemporaryTypes)assert.ok(editor.contemporaryTypes.some(x=>x.id===t));
  for(const t of entry.plotLenses)assert.ok(editor.sevenPlotModels.some(x=>x.id===t));
  assert.equal(pack.scenes.length,9);
  assert.ok(pack.scenes.every(s=>s.threadId===pack.hovedtraad));
  assert.ok(pack.scenes.every(s=>s.valg.every(v=>v.konsekvensTekst && v.effekter && !v.effekter.meters?.penger)));
  assert.equal(pack.scenes.filter(s=>s.dag===20).length,4);
  for(const a of arc.a)for(const b of arc.b){
    const candidates=pack.scenes.filter(s=>s.dag===20 && s.conditions?.flagg?.[arc.old20]===a&&s.conditions?.flagg?.[arc.old19]===b);
    assert.equal(candidates.length,1,'one opening per pair of historic decisions');
  }
}
const seen=new Set();
let completed=0, handoffs=0, reloads=0, roleGates=0;
for(const arc of arcs)for(const a of arc.a)for(const b of arc.b) {
  let {state,content}=approachDay19(arc,a,b);
  const prior=clone(state),pack=packs[arc.next];
  content=append(state,content,arc.next);
  assert.equal(state.dag,20);
  assert.equal(state.kapittelArkiv.length,5);
  assert.equal(R.getContinuationIds(state).length,5);
  assert.equal(R.selectNextScene(state,content).id,'d20_'+arc.opening+'_'+a+'_'+b);
  const initial=clone(state);
  primary=null;
  assert.ok(R.isContinuationPaused(state,content),'wrong role pauses next chapter');
  assert.throws(()=>R.applyChoice(state,content,'d20_'+arc.opening+'_'+a+'_'+b,pack.scenes[0].valg[0].id),/ikke tilgjengelig/);
  assert.deepEqual(state,initial,'role-gated choice cannot modify save');
  setRole(pack.role_scope);
  handoffs++;roleGates++;
  const choices20=pack.scenes.find(s=>s.id==='d20_'+arc.opening+'_'+a+'_'+b).valg.map(v=>v.id);
  for(const choice20 of choices20)for(let choice21=0;choice21<2;choice21++)for(let choice22=0;choice22<2;choice22++){
    let s=clone(initial),c=restore(s);
    const before=JSON.stringify(prior.arkiv), oldFlags=clone(prior.tidligereValg),oldMoney=prior.meters.penger;
    while(true){
      while(!s.dagFerdig){
        const scene=R.selectNextScene(s,c);
        assert.ok(scene&&pack.scenes.some(x=>x.id===scene.id),'authored ensemble scene');
        const selected=scene.dag===20?choice20
          :scene.dag===21?scene.valg[choice21].id
          :scene.dag===22&&scene.fase!=='kveld'?scene.valg[choice22].id
          :scene.valg[0].id;
        seen.add(scene.id+'/'+selected);
        R.applyChoice(s,c,scene.id,selected);
        const serialized=JSON.stringify(s);
        s=clone(s);c=restore(s);reloads++;
        assert.equal(JSON.stringify(s),serialized);
        assert.equal(JSON.stringify(s.arkiv.slice(0,prior.arkiv.length)),before);
        for(const [k,v] of Object.entries(oldFlags))assert.deepEqual(s.tidligereValg[k],v,'earlier flag preserved '+k);
        assert.equal(s.meters.penger,oldMoney,'no automatic payment');
      }
      if(s.dag===22)break;
      R.startNextDay(s,c);
    }
    assert.equal(s.threadState[pack.hovedtraad].status,'completed');
    assert.equal(s.tidligereValg[arc.opening+'_22_kapittel_avsluttet'],true);
    assert.equal(E.isFinalDay(s,c),true);
    assert.throws(()=>R.startNextDay(s,c),/neste kapittel/);
    completed++;
  }
}
for(const arc of arcs)for(const scene of packs[arc.next].scenes)for(const choice of scene.valg){
  assert.ok(seen.has(scene.id+'/'+choice.id),'all choices reached: '+scene.id+'/'+choice.id);
}
assert.equal(completed,160);
assert.equal(handoffs,20);
assert.equal(roleGates,20);
delete globalThis.CivicationLifePositions;
console.log('Civication ensemble: '+completed+' day 20–22 complete paths, '+seen.size+' unique choices, '+handoffs+' role handoffs, '+reloads+' clean reloads, 24/7/24 taxonomy intact.');
