#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const manifest = read(C.MANIFEST_PATH);
const role = manifest.roles.arbeidsledig;
const content = C.buildContent({
  role: read(role.role), roleThreads: read(role.threads), roleScenes: read(role.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
});
// Keep the regression for the first production batch scoped to its original
// sixteen outcomes when later Wave G continuations are added.
const firstOutcomes = {
  c01: ['vennskap_pa_egne_vilkar', 'nytt_samtaleforslag'],
  c02: ['spilletid_eget_valg', 'fridager_uten_binding'],
  c03: ['anonymisering_vurderes', 'eksempel_internt'],
  c05: ['skille_dokumentert', 'oversikt_klar'],
  c06: ['utvalg_begrenset', 'dataoversikt_etterspurt'],
  c07: ['bare_gjest', 'besoksramme'],
  c17: ['lager_ikke_ferdig', 'tilkomst_adskilt'],
  c23: ['ingen_ny_kontakt', 'intern_laerdom']
};
const scenes = content.scenes.filter(s => s.id.startsWith('wave_g_') &&
  firstOutcomes[s.threadId.slice('wave_g_'.length)]?.includes(
    s.conditions?.flagg?.['wa_f_' + s.threadId.slice('wave_g_'.length) + '_status']));
const waveF = content.scenes.filter(s => s.id.startsWith('wave_f_'));
const stories = ['c01','c02','c03','c05','c06','c07','c17','c23'];
assert.equal(scenes.length, 16);
assert.equal(waveF.length, 68, 'Wave F is preserved unchanged');
assert.equal(scenes.reduce((sum,s) => sum + s.valg.length, 0), 32);
for (const story of stories) {
  const selected = scenes.filter(s => s.threadId === 'wave_g_' + story);
  assert.equal(selected.length, 2, story + ' has two distinct follow-ups');
  assert.ok(content.threads.some(t => t.id === 'wave_g_' + story && t.konflikt));
  for (const scene of selected) {
    const anchor = 'wa_f_' + story + '_status';
    const expected = scene.conditions?.flagg?.[anchor];
    assert.ok(expected, scene.id + ' needs a specific earlier choice');
    assert.equal(scene.etterValgDager.flagg, anchor);
    assert.equal(scene.etterValgDager.dager, 4);
    assert.ok(waveF.some(f => f.threadId === 'wave_f_' + story
      && f.valg.some(v => v.effekter?.flagg?.[anchor] === expected)), 'unreachable predecessor: ' + scene.id);
    assert.equal(new Set(scene.valg.map(v => v.effekter.flagg['wa_g_'+story+'_status'])).size, 2);
    assert.ok(scene.valg.every(v => v.konsekvensTekst && Object.keys(v.effekter?.flagg || {}).length === 1));
    const state = S.createInitialState(content);
    state.livsdag = 30;
    state.tidligereValg[anchor] = expected;
    state.privatHistorie ||= {flagg:{},flaggDager:{},spilteScener:[],arkiv:[],relasjoner:{}};
    state.privatHistorie.flaggDager[anchor] = 26;
    assert.equal(R.conditionsMet(state, scene), true, 'matches exact choice: '+scene.id);
    assert.equal(R.sceneDue(state, scene), true, 'eligible 4 days later: '+scene.id);
    state.privatHistorie.flaggDager[anchor] = 27;
    assert.equal(R.sceneDue(state, scene), false, 'cannot fire before elapsed delay: '+scene.id);
    state.privatHistorie.flaggDager[anchor] = 26;
    state.tidligereValg[anchor] = 'unrelated_prior_choice';
    assert.equal(R.conditionsMet(state, scene), false, 'must not leak into another ending: '+scene.id);
  }
}
console.log('Wave G first batch: 8 story threads, 16 gated scenes, 32 choices, valid timing and predecessors');


// Role-switch persistence: the actual runner, not only a JSON condition check,
// must archive a Wave G choice and preserve it in the player's private history.
const renholder = manifest.roles.renholder;
const nextRole = C.buildContent({
  role: read(renholder.role), roleThreads: read(renholder.threads), roleScenes: read(renholder.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
});
let persisted = 0;
for (const scene of scenes) {
  const story = scene.id.split('_')[2], anchor = 'wa_f_' + story + '_status';
  for (const choice of scene.valg) {
    const state = S.createInitialState(content);
    state.livsdag = 30;
    state.fase = scene.fase;
    state.tidligereValg[anchor] = scene.conditions.flagg[anchor];
    state.privatHistorie = {
      flagg: {[anchor]: scene.conditions.flagg[anchor]},
      flaggDager: {[anchor]: 26},
      spilteScener: [], arkiv: [], relasjoner: {}
    };
    assert.ok(R.getCandidateScenes(state, content).some(s => s.id === scene.id),
      'Wave G scene eligible with a real delayed flag');
    R.applyChoice(state, content, scene.id, choice.id);
    const result = choice.effekter.flagg['wa_g_' + story + '_status'];
    assert.equal(state.tidligereValg['wa_g_' + story + '_status'], result);
    assert.ok(state.arkiv.some(e => e.sceneId === scene.id && e.valgId === choice.id));
    assert.ok(state.privatHistorie.arkiv.some(e => e.sceneId === scene.id));

    // Role-switch persistence: no retroactive choices or lost flags.
    const switched = S.selectRole(JSON.parse(JSON.stringify(state)), nextRole);
    assert.equal(switched.tidligereValg[anchor], scene.conditions.flagg[anchor]);
    assert.equal(switched.tidligereValg['wa_g_' + story + '_status'], result);
    assert.ok(switched.privatHistorie.arkiv.some(e => e.sceneId === scene.id));
    const returned = S.selectRole(switched, content);
    assert.equal(returned.tidligereValg['wa_g_' + story + '_status'], result);
    assert.ok(returned.arkiv.some(e => e.sceneId === scene.id && e.valgId === choice.id));
    persisted++;
  }
}
console.log('Role-switch persistence: ' + persisted + ' real Wave G choices retained.');
