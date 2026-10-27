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
const thirdStatuses = {
  c01: ['grense_staar', 'samtaletema_valgt'],
  c02: ['krav_egne', 'kommentar_etterspurt'],
  c03: ['sporsmaal_formulert', 'bilde_holdt_tilbake'],
  c05: ['usendt_bevart', 'kvittering_kontrollert'],
  c06: ['forbehold_uavklart', 'ansvar_identifisert'],
  c07: ['tid_ikke_reservert', 'skriftlig_rammesporsmal'],
  c17: ['drift_venter', 'ferdigkrav_notert'],
  c23: ['stillhet_respektert', 'internt_rettet']
};
const all = base.scenes.filter(s => s.id.startsWith('wave_g_'));
assert.equal(all.length, 48, 'Wave G first three batches: 48 scenes');
assert.equal(all.reduce((sum,s) => sum+s.valg.length,0),96,'96 authored choices');
const third = all.filter(s => {
  const story = s.threadId.slice('wave_g_'.length);
  return thirdStatuses[story]?.includes(s.conditions?.flagg?.['wa_f_'+story+'_status']);
});
assert.equal(third.length, 16, 'third batch includes 16 branched scenes');

let acted = 0;
for (const [story, values] of Object.entries(thirdStatuses)) {
  const pair = third.filter(s => s.threadId === 'wave_g_' + story);
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
console.log('Wave G third batch: 16 scenes, 32 played choices, 8 histories, full F anchor and role-switch persistence OK ('+acted+').');
