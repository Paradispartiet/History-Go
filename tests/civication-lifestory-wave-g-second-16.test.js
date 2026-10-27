#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const manifest = read(C.MANIFEST_PATH);
const build = id => {
  const m = manifest.roles[id];
  return C.buildContent({
    role: read(m.role), roleThreads: read(m.threads), roleScenes: read(m.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
  });
};
const base = build('arbeidsledig'), renholder = build('renholder');
const nextStatuses = {
  c01: ['ro_bevart', 'livstegn_sendt'],
  c02: ['oppdrag_ikke_bekreftet', 'vilkaar_forberedt'],
  c03: ['samtykketekst_utkast', 'visning_avventes'],
  c05: ['utkast_forbedret', 'mangelliste_utkast'],
  c06: ['kort_periode_tydelig', 'ny_kontroll_foreslaatt'],
  c07: ['fortsatt_uavklart', 'sporsmal_om_forventning'],
  c17: ['hindring_beskrevet', 'drift_skal_avklare'],
  c23: ['versjoner_bevart', 'lesere_ukjente']
};
const all = base.scenes.filter(s => s.id.startsWith('wave_g_'));
assert.equal(all.length, 48, 'Wave G first three batches: 48 scenes');
assert.equal(all.reduce((sum,s) => sum+s.valg.length,0),96,'96 authored choices');
const second = all.filter(s => {
  const story = s.threadId.slice('wave_g_'.length);
  return nextStatuses[story]?.includes(s.conditions?.flagg?.['wa_f_'+story+'_status']);
});
assert.equal(second.length, 16, 'second batch includes 16 branched scenes');

let acted = 0;
for (const [story, values] of Object.entries(nextStatuses)) {
  const pair = second.filter(s => s.threadId === 'wave_g_' + story);
  assert.equal(pair.length, 2, 'two outcomes in ' + story);
  for (const scene of pair) {
    assert.equal(scene.etterValgDager.flagg,'wa_f_'+story+'_status');
    assert.equal(scene.etterValgDager.dager,4);
    assert.equal(scene.livsdagFra,26);
    assert.ok(scene.tekst.length>250,'written story, not placeholder');
    assert.equal(scene.valg.length,2);
    assert.equal(new Set(scene.valg.map(v=>v.effekter.flagg['wa_g_'+story+'_status'])).size,2);
    assert.ok(scene.valg.every(v=>v.konsekvensTekst?.length>=70 && !v.effekter?.meters?.penger));
    const anchor='wa_f_'+story+'_status', desired=scene.conditions.flagg[anchor];
    const old = base.scenes.find(s=>s.id.startsWith('wave_f_'+story+'_') &&
      s.valg.some(v=>v.effekter.flagg[anchor]===desired));
    assert.ok(old,'Wave F actually produces '+desired);
    const oldChoice=old.valg.find(v=>v.effekter.flagg[anchor]===desired);
    for(const choice of scene.valg){
      const state=S.createInitialState(base);
      state.dag=22;
      state.livsdag=22;
      state.fase=old.fase;
      state.tidligereValg={...old.conditions.flagg};
      state.privatHistorie={
        flagg:{...state.tidligereValg},
        flaggDager:{[old.etterValgDager.flagg]:18},
        spilteScener:[],arkiv:[],relasjoner:{}
      };
      assert.equal(R.sceneDue(state,old),true);
      assert.equal(R.conditionsMet(state,old),true);
      R.applyChoice(state,base,old.id,oldChoice.id);
      assert.equal(state.tidligereValg[anchor],desired);
      assert.equal(state.privatHistorie.flaggDager[anchor],22);
      assert.ok(state.privatHistorie.arkiv.some(e=>e.sceneId===old.id));
      state.dagFerdig=false;
      state.fase=scene.fase;
      state.livsdag=25;
      assert.equal(R.sceneDue(state,scene),false);
      state.livsdag=26;
      assert.equal(R.sceneDue(state,scene),true);
      assert.ok(R.getCandidateScenes(state,base).some(s=>s.id===scene.id));
      const sibling=pair.find(s=>s.id!==scene.id);
      assert.ok(!R.getCandidateScenes(state,base).some(s=>s.id===sibling.id),
        'unselected sibling must remain blocked');
      R.applyChoice(state,base,scene.id,choice.id);
      const outcome=choice.effekter.flagg['wa_g_'+story+'_status'];
      assert.equal(state.tidligereValg['wa_g_'+story+'_status'],outcome);
      assert.ok(state.privatHistorie.arkiv.some(e=>e.sceneId===scene.id));
      const next=S.selectRole(JSON.parse(JSON.stringify(state)),renholder);
      assert.equal(next.tidligereValg[anchor],desired);
      assert.equal(next.tidligereValg['wa_g_'+story+'_status'],outcome);
      const back=S.selectRole(next,base);
      assert.ok(back.arkiv.some(e=>e.sceneId===scene.id&&e.valgId===choice.id));
      assert.equal(back.tidligereValg['wa_g_'+story+'_status'],outcome);
      acted++;
    }
  }
}
console.log('Wave G second batch: 16 scenes, 32 played choices, 8 histories, full F anchor and role-switch persistence OK ('+acted+').');
