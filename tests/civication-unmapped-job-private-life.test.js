#!/usr/bin/env node
'use strict';
// A real formal job without a matching authored work-role pack must not
// erase private life or replay the unemployment workday as paid employment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');

const root = path.join(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const manifest = read(C.MANIFEST_PATH);
const role = manifest.roles.arbeidsledig;
const all = C.buildContent({
  role: read(role.role),
  roleThreads: read(role.threads),
  roleScenes: read(role.scenes),
  lifeThreads: read(manifest.life.threads),
  lifeScenes: read(manifest.life.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions)
});
const privateContent = C.privateLifeOnly(all);
assert.equal(privateContent.role.id, 'arbeidsledig', 'saved internal story key is stable');
assert.equal(privateContent.role.navn, 'Privatliv', 'private UI must not label employment as unemployment');
assert.equal(all.role.navn !== privateContent.role.navn, true, 'source is not mutated');
assert.ok(privateContent.threads.length > 0);
assert.ok(privateContent.threads.every(thread => thread.type === 'privatliv'));
const allowed = new Set(privateContent.threads.map(thread => thread.id));
assert.ok(privateContent.scenes.length > 0);
assert.ok(privateContent.scenes.every(scene => allowed.has(scene.threadId)));
assert.ok(!privateContent.scenes.some(scene => /^(meldekort_|soknad_|d1_nav_)/.test(scene.id)),
  'NAV and unemployment work messages do not masquerade as a private job story');
assert.throws(() => C.privateLifeOnly(C.buildContent({
  role: { ...read(role.role), id: 'another_role' },
  roleThreads: read(role.threads),
  roleScenes: read(role.scenes),
  lifeThreads: read(manifest.life.threads),
  lifeScenes: read(manifest.life.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions)
})), /privatliv trenger felles grunnpakke/);

const state = S.createInitialState(all);
const originalChoices = new Set();
const preferred = {
  d2_en_retning: 'skape',
  wave_e_life21_d8_foerste_spor: 'skape',
  wave_e_life21_d15_tredje_uke: 'skape',
  wave_e_life21_d21_skape_veien: 'skaper'
};
let total = 0;
for (let day = 1; day <= 21; day++) {
  assert.equal(state.livsdag, day, 'shared private life day remains canonical');
  let actions = 0;
  while (!state.dagFerdig) {
    const scene = R.selectNextScene(state, privateContent);
    if (scene) {
      assert.ok(allowed.has(scene.threadId), 'every scene belongs to the private life');
      const choice = scene.valg.find(row => row.id === preferred[scene.id])
        || scene.valg.find(row => !row.skills_requirement);
      assert.ok(choice, 'every private event has an ordinary available choice');
      R.applyChoice(state, privateContent, scene.id, choice.id);
      originalChoices.add(scene.id);
      actions++;
    } else R.advance(state, privateContent);
    assert.ok(++total < 1100, 'private life cannot loop indefinitely');
  }
  assert.ok(actions > 0, 'every private life day remains playable: ' + day);
  if (day < 21) R.startNextDay(state, privateContent);
}
assert.equal(state.livsdag, 21);
assert.ok(originalChoices.has('wave_e_life21_d8_foerste_spor'));
assert.ok(originalChoices.has('wave_e_life21_d15_tredje_uke'));
assert.ok(originalChoices.has('wave_e_life21_d21_skape_veien'));
assert.ok(state.arkiv.every(entry => privateContent.scenes.some(scene => scene.id === entry.sceneId)));
assert.equal(new Set(state.arkiv.map(entry => entry.sceneId)).size, state.arkiv.length);
console.log('Civication private-only job fallback: 21 playable life days, ' + total + ' steps, no fake unemployment mail or role reset.');
