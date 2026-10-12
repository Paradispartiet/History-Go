'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');

const root = path.join(__dirname, '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const clone = object => JSON.parse(JSON.stringify(object));
const manifest = read(C.MANIFEST_PATH);
const entry = manifest.roles.arbeidsledig;
const raw = {
  role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
const descriptors = raw.role.symposium.fortsettelser;
const packs = Object.fromEntries(descriptors.map(d => [d.id, read(d.path)]));
const newIds = ['sideprosjekt_kryss_med_mira', 'miljo_kryss_med_lea', 'musikk_kryss_med_arvid'];
const journeys = [
  { direction: 'musikk', chain: ['musikk_med_mira','musikk_foresporselen','musikk_etter_foresporselen'],
    next: 'sideprosjekt_kryss_med_mira', prefix: 'samspill_lea', priorPrefix: 'mira16',
    priorValues: ['grense','kontakt','egen','avsluttet'] },
  { direction: 'prosjekt', chain: ['sideprosjekt_med_lea','sideprosjekt_neste_steg','sideprosjekt_etter_neste_steg'],
    next: 'miljo_kryss_med_lea', prefix: 'samspill_arvid', priorPrefix: 'sideprosjekt_16',
    priorValues: ['klar','egen','pause'] },
  { direction: 'miljo', chain: ['miljo_med_arvid','miljo_navnet_ditt','miljo_etter_invitasjonen'],
    next: 'musikk_kryss_med_arvid', prefix: 'samspill_mira', priorPrefix: 'arvid16',
    priorValues: ['grense','avstand','uavklart'] }
];
const editorial = read('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
assert.equal(editorial.literaryTracks.length,24);
assert.equal(editorial.sevenPlotModels.length,7);
assert.equal(editorial.contemporaryTypes.length,24);
assert.deepEqual(editorial.crossCharacterProduction.map(p=>p.id),newIds);
for(const item of editorial.crossCharacterProduction){
  const d=descriptors.find(x=>x.id===item.id);
  assert.ok(d && packs[item.id]);
  assert.equal(d.etterDag,16);
  assert.deepEqual(d.etterFortsettelser,[item.prior]);
  assert.deepEqual(item.days,[17,18,19]);
  assert.equal(item.characters.length,2);
  for(const t of item.literaryTracks) assert.ok(editorial.literaryTracks.some(x=>x.id===t));
  for(const t of item.contemporaryTypes) assert.ok(editorial.contemporaryTypes.some(x=>x.id===t));
  for(const t of item.plotLenses) assert.ok(editorial.sevenPlotModels.some(x=>x.id===t));
}
let primary = null;
globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: primary }) };
function useRole(scope) {
  const bridge = raw.role.symposium.rollebroer.find(b => b.role_scope === scope);
  assert.ok(bridge, 'registered life position: ' + scope);
  primary = { badge_id: bridge.badge_id, label: bridge.navn };
}
function contentFor(state) {
  let c = C.buildContent(clone(raw));
  for (const id of R.getContinuationIds(state)) c = C.appendContinuation(c, packs[id]);
  S.reconcileContent(state, c);
  return c;
}
function finish(state, content, lastDay, overrides = {}) {
  let count = 0;
  while (true) {
    while (!state.dagFerdig) {
      const selected = R.selectNextScene(state, content);
      assert.ok(selected, 'no empty story day: ' + state.dag + ' / ' + state.fase);
      const id = overrides[selected.id] || selected.valg[0].id;
      R.applyChoice(state, content, selected.id, id);
      const saved = JSON.stringify(state);
      state = clone(state);
      content = contentFor(state);
      assert.equal(JSON.stringify(state), saved, 'reopening chapter does not rewrite save');
      assert.ok(++count < 350, 'story progressed');
    }
    if (state.dag === lastDay) return { state, content };
    R.startNextDay(state, content);
  }
}
function reachSixteen(spec) {
  let content = C.buildContent(clone(raw));
  let state = S.createInitialState(content);
  ({state,content} = finish(state,content,7,{d2_en_retning:spec.direction}));
  for (const id of spec.chain) {
    const pack = packs[id], descriptor = descriptors.find(d => d.id === id);
    useRole(pack.role_scope);
    assert.ok(R.canStartContinuation(state,content,descriptor), 'chapter boundary: ' + id);
    const nextContent = C.appendContinuation(content,pack);
    R.startContinuation(state,content,nextContent,id,E.resolveEnding(state,content));
    ({state,content} = finish(state,nextContent,pack.sisteDag));
  }
  assert.equal(state.dag,16);
  assert.ok(state.kapittelArkiv.length >= 3);
  return {state,content};
}
let paths = 0, choices = 0;
for (const id of newIds) {
  const pack = packs[id];
  assert.equal(pack.sisteDag,19);
  for (const scene of pack.scenes) {
    assert.ok(scene.valg.length >= 1);
    assert.ok(scene.valg.every(v => !!v.konsekvensTekst && !!v.effekter));
    assert.ok(!scene.valg.some(v => v.effekter?.meters?.penger), 'no implicit payment');
  }
}
for (const spec of journeys) {
  const {state: at16,content: oldContent} = reachSixteen(spec);
  const pack = packs[spec.next], descriptor = descriptors.find(d => d.id === spec.next);
  assert.deepEqual(descriptor.etterFortsettelser,[spec.chain[2]]);
  const previousSnapshot = clone(at16);
  useRole(pack.role_scope);
  assert.ok(R.canStartContinuation(at16,oldContent,descriptor), 'cross-role handoff allowed');
  const withChapter = C.appendContinuation(oldContent,pack);
  R.startContinuation(at16,oldContent,withChapter,pack.id,E.resolveEnding(at16,oldContent));
  assert.equal(at16.dag,17);
  assert.deepEqual(at16.tidligereValg,previousSnapshot.tidligereValg);
  assert.deepEqual(at16.arkiv,previousSnapshot.arkiv);
  assert.deepEqual(at16.relasjoner,previousSnapshot.relasjoner);
  assert.equal(at16.meters.penger,previousSnapshot.meters.penger);
  assert.equal(at16.kapittelArkiv.length,4);
  const firstScene = R.selectNextScene(at16,withChapter);
  assert.ok(firstScene.id.startsWith('d17_'+spec.prefix));
  assert.equal(Object.entries(firstScene.conditions.flagg).filter(([key,value]) => value===true && at16.tidligereValg[key]===true).length,1,'opening matches archived choice');
  // Every possible day-16 outcome has its own authored response at day 17.
  for (const value of spec.priorValues) {
    const expected = spec.priorPrefix+'_'+value;
    const matches = pack.scenes.filter(s=>s.dag===17 && s.conditions?.flagg?.[expected] === true);
    assert.equal(matches.length,1, 'one response to '+expected);
    const flagState = clone(at16);
    for (const previous of spec.priorValues) delete flagState.tidligereValg[spec.priorPrefix+'_'+previous];
    flagState.tidligereValg[expected] = true;
    const candidate = pack.scenes.filter(s=>s.dag===17 && R.conditionsMet(flagState,s));
    assert.deepEqual(candidate.map(x=>x.id),matches.map(x=>x.id), 'no overlapping opening branches');
  }
  const queue = [{}], covered = new Set();
  while (queue.length) {
    const overrides = queue.shift(), actual = {};
    let state = clone(at16),content = contentFor(state);
    while (true) {
      while (!state.dagFerdig) {
        const scene = R.selectNextScene(state,content);
        assert.ok(scene && pack.scenes.some(s=>s.id===scene.id), 'authored cross-character scene');
        const selected = overrides[scene.id] || scene.valg[0].id;
        const key = scene.id+'/'+selected;
        if (!covered.has(key)) {
          covered.add(key);choices++;
          for (const other of scene.valg) if(other.id!==selected && !covered.has(scene.id+'/'+other.id)) queue.push({...actual,[scene.id]:other.id});
        }
        actual[scene.id] = selected;
        R.applyChoice(state,content,scene.id,selected);
        state = clone(state);content = contentFor(state);
        for (const [k,v] of Object.entries(previousSnapshot.tidligereValg)) assert.deepEqual(state.tidligereValg[k],v);
        assert.deepEqual(state.arkiv.slice(0,previousSnapshot.arkiv.length),previousSnapshot.arkiv);
        assert.equal(state.meters.penger,previousSnapshot.meters.penger);
      }
      if(state.dag===19)break;
      R.startNextDay(state,content);
    }
    assert.equal(state.threadState[pack.hovedtraad].status,'completed');
    assert.ok(state.tidligereValg[spec.prefix+'19_kapittel_avsluttet']);
    assert.ok(['presiser','stans'].includes(state.tidligereValg[spec.prefix+'19_ending']));
    assert.equal(E.isFinalDay(state,content),true);
    const before = JSON.stringify(state);
    assert.throws(()=>R.startNextDay(state,content),/neste kapittel/);
    assert.equal(JSON.stringify(state),before);
    paths++;
    assert.ok(paths<200);
  }
  assert.ok(covered.size>=11, 'choices visited in the complete chapter');
  assert.ok(!R.canStartContinuation(at16,withChapter,descriptor),'no replaying same cross chapter');
}
delete globalThis.CivicationLifePositions;
console.log('Cross-character Civication: '+paths+' complete day 17–19 paths, '+choices+' choices; three real role handoffs and ten day-16 consequences checked.');
