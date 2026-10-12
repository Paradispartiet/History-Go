'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');

const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH);
const m = manifest.roles.arbeidsledig;
const raw = {
  role: read(m.role),
  roleThreads: read(m.threads), roleScenes: read(m.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
const base = C.buildContent(clone(raw));
const descriptors = base.role.symposium.fortsettelser;
const packs = Object.fromEntries(descriptors.map(d => [d.id, read(d.path)]));
const arcs = [
  {
    prefix: 'frilans', destination: 'miljo_kryss_med_frilans',
    chain: ['frilans_med_lea', 'frilans_neste_steg', 'frilans_etter_neste_steg'],
    scenePrefix: 'kryss_frilans_arvid', outputRole: 'subkultur_gangster',
    variants: ['klar', 'egen', 'pause']
  },
  {
    prefix: 'grunder', destination: 'musikk_kryss_med_grunder',
    chain: ['grunder_med_lea', 'grunder_neste_steg', 'grunder_etter_neste_steg'],
    scenePrefix: 'kryss_grunder_mira', outputRole: 'musikk_frilansmusiker',
    variants: ['klar', 'egen', 'pause']
  }
];
let activeRole = null;
globalThis.CivicationLifePositions = {
  getLifeContext: () => ({primary_life_position: activeRole})
};
function useRole(scope) {
  const role = base.role.symposium.rollebroer.find(b => b.role_scope === scope);
  assert.ok(role, 'known life position: ' + scope);
  activeRole = {badge_id: role.badge_id, label: role.navn};
}
function restore(saved) {
  let content = C.buildContent(clone(raw));
  for (const id of R.getContinuationIds(saved)) {
    content = C.appendContinuation(content, packs[id]);
  }
  S.reconcileContent(saved, content);
  return content;
}
function progress(saved, content, through, overrides = {}) {
  while (true) {
    while (!saved.dagFerdig) {
      const scene = R.selectNextScene(saved, content);
      assert.ok(scene, 'authored scene missing on day ' + saved.dag + '/' + saved.fase);
      const choice = overrides[scene.id] || scene.valg[0].id;
      R.applyChoice(saved, content, scene.id, choice);
      const original = JSON.stringify(saved);
      saved = clone(saved);
      content = restore(saved);
      assert.equal(JSON.stringify(saved), original, 'reload preserves the complete choice history');
    }
    if (saved.dag === through) return {saved, content};
    assert.ok(saved.dag < through);
    R.startNextDay(saved, content);
  }
}
function startChapter(saved, content, id) {
  const d = descriptors.find(d => d.id === id), pack = packs[id];
  assert.ok(d && pack);
  useRole(pack.role_scope);
  assert.ok(R.canStartContinuation(saved, content, d), id + ' chapter must be playable');
  const appended = C.appendContinuation(content, pack);
  const previous = clone(saved);
  R.startContinuation(saved, content, appended, id, E.resolveEnding(saved, content));
  assert.deepEqual(saved.arkiv, previous.arkiv);
  assert.deepEqual(saved.tidligereValg, previous.tidligereValg);
  assert.deepEqual(saved.relasjoner, previous.relasjoner);
  assert.equal(saved.meters.penger, previous.meters.penger);
  return appended;
}
function reachDay16(arc, variant) {
  let content = base, saved = S.createInitialState(content);
  ({saved, content} = progress(saved, content, 7, {d2_en_retning: 'prosjekt'}));
  for (const id of arc.chain) {
    content = startChapter(saved, content, id);
    const overrides = {};
    if (id === arc.chain[2]) {
      if (variant === 'egen') {
        overrides['d14_' + arc.prefix + '_beholdt'] = 'privat';
        overrides['d15_' + arc.prefix + '_privat'] = 'skrive';
      } else if (variant === 'pause') {
        overrides['d16_' + arc.prefix + '_avgrenset'] = 'avslutt';
      }
    }
    ({saved, content} = progress(saved, content, packs[id].sisteDag, overrides));
    assert.equal(saved.threadState[packs[id].hovedtraad].status, 'completed');
  }
  assert.equal(saved.dag, 16);
  assert.equal(saved.tidligereValg[arc.prefix + '_16_ending'], variant);
  assert.equal(saved.tidligereValg[arc.prefix + '_16_' + variant], true);
  return {saved, content};
}
const editorial = read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
assert.deepEqual([editorial.literaryTracks.length,editorial.sevenPlotModels.length,editorial.contemporaryTypes.length],[24,7,24]);
assert.equal(editorial.crossCharacterProduction.length,5);
for (const arc of arcs) {
  const p = packs[arc.destination], descriptor = descriptors.find(d => d.id === arc.destination);
  const book = editorial.crossCharacterProduction.find(e => e.id === arc.destination);
  assert.ok(book && p && descriptor);
  assert.deepEqual(descriptor.etterFortsettelser,[arc.chain[2]]);
  assert.equal(descriptor.etterDag,16);
  assert.equal(descriptor.role_scope,arc.outputRole);
  assert.deepEqual([...new Set(p.scenes.map(s=>s.dag))],[17,18,19]);
  assert.deepEqual(book.days,[17,18,19]);
  assert.ok(book.literaryTracks.includes('L11'));
  for(const k of book.literaryTracks)assert.ok(editorial.literaryTracks.some(x=>x.id===k));
  for(const k of book.contemporaryTypes)assert.ok(editorial.contemporaryTypes.some(x=>x.id===k));
  for(const k of book.plotLenses)assert.ok(editorial.sevenPlotModels.some(x=>x.id===k));
  assert.ok(p.scenes.every(s=>s.valg.every(v=>v.konsekvensTekst && v.effekter && !v.effekter.meters?.penger)));
  assert.ok(p.scenes.every(s=>s.threadId===p.hovedtraad));
}
const seen = new Set();
let paths = 0, handoffs = 0;
for (const arc of arcs) for (const variant of arc.variants) {
  let {saved,content} = reachDay16(arc,variant);
  const prior = clone(saved), pack = packs[arc.destination], next = descriptors.find(d=>d.id===pack.id);
  useRole(pack.role_scope);
  assert.ok(R.canStartContinuation(saved,content,next));
  content = startChapter(saved,content,pack.id);
  assert.equal(saved.dag,17);
  assert.equal(saved.kapittelArkiv.length,4,'the complete prior chapter history remains visible');
  assert.deepEqual(R.getContinuationIds(saved).at(-1),pack.id);
  const first = R.selectNextScene(saved,content);
  assert.equal(first.id,'d17_'+arc.scenePrefix+'_'+variant);
  const baseline = clone(saved);
  const archive = clone(prior.arkiv), meter = prior.meters.penger, flags = clone(prior.tidligereValg);
  activeRole = null;
  assert.ok(R.isContinuationPaused(saved,content),'new character role is required');
  assert.throws(()=>R.applyChoice(saved,content,first.id,first.valg[0].id),/ikke tilgjengelig/);
  assert.deepEqual(saved,baseline,'wrong role cannot change saved history');
  useRole(pack.role_scope);
  assert.equal(R.selectNextScene(saved,content).id,first.id);
  handoffs++;
  // Complete every choice combination from the actual day-16 save.
  for(const firstChoice of first.valg) for(const midChoice of [0,1]) for(const lastChoice of [0,1]){
    let live=clone(baseline), liveContent=restore(live);
    while(true) {
      while(!live.dagFerdig){
        const scene=R.selectNextScene(live,liveContent);
        assert.ok(scene && pack.scenes.some(s=>s.id===scene.id),'chapter scene');
        const selected=scene.dag===17?firstChoice.id
          :scene.dag===18?scene.valg[midChoice].id
          :scene.dag===19 && scene.fase!=='kveld'?scene.valg[lastChoice].id
          :scene.valg[0].id;
        seen.add(scene.id+'/'+selected);
        R.applyChoice(live,liveContent,scene.id,selected);
        const serialized=JSON.stringify(live);
        live=clone(live);liveContent=restore(live);
        assert.equal(JSON.stringify(live),serialized);
        assert.deepEqual(live.arkiv.slice(0,archive.length),archive);
        assert.equal(live.meters.penger,meter,'no fictitious job or income');
        for(const [key,value] of Object.entries(flags)) assert.deepEqual(live.tidligereValg[key],value,'preserved '+key);
      }
      if(live.dag===19)break;
      R.startNextDay(live,liveContent);
    }
    assert.equal(live.threadState[pack.hovedtraad].status,'completed');
    assert.equal(live.tidligereValg[arc.scenePrefix+'_19_kapittel_avsluttet'],true);
    assert.equal(E.isFinalDay(live,liveContent),true);
    assert.throws(()=>R.startNextDay(live,liveContent),/neste kapittel/);
    paths++;
  }
}
delete globalThis.CivicationLifePositions;
assert.equal(handoffs,6);
assert.equal(paths,48);
for(const arc of arcs) {
  const pack=packs[arc.destination];
  for(const scene of pack.scenes) for(const choice of scene.valg){
    assert.ok(seen.has(scene.id+'/'+choice.id),'every authored choice exercised: '+scene.id+'/'+choice.id);
  }
}
console.log('Civication Lea crossovers: '+paths+' completed paths, '+seen.size+' distinct choices, '+handoffs+' role handoffs, all prior outcomes and saved archives preserved.');
