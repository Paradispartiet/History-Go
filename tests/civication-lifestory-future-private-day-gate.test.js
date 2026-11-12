'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = read(C.MANIFEST_PATH), role = manifest.roles.arbeidsledig;
const content = C.buildContent({
  role: read(role.role), roleThreads: read(role.threads), roleScenes: read(role.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
});
const state = S.createInitialState(content);
const choices = {
  d2_en_retning: 'skape', wave_e_life21_d8_foerste_spor: 'skape',
  wave_e_life21_d15_tredje_uke: 'skape', wave_e_life21_d21_skape_veien: 'skaper'
};
for (let day = 1; day <= 21; day++) {
  let count = 0;
  while (!state.dagFerdig) {
    const scene = R.selectNextScene(state, content);
    assert.ok(scene, 'every played day has an authored scene');
    R.applyChoice(state, content, scene.id,
      choices[scene.id] || scene.valg.find(choice => !choice.handling)?.id || scene.valg[0].id);
    assert.ok(++count < 220);
  }
  assert.equal(state.livsdag, day);
  if (day === 7 || day === 20) {
    assert.equal(R.hasPendingPrivateScenes(state, content), true,
      'actual next-day private content remains available without a job or life position');
  }
  if (day < 21) R.startNextDay(state, content);
}
const future = content.scenes.find(scene => scene.id === 'wave_g_c05_arkivet_og_middagen');
assert.ok(future && future.livsdagFra === 26, 'the real later archive/dinner scene remains authored');
assert.ok(!state.spilteScener.includes(future.id));
assert.equal(R.hasPendingPrivateScenes(state, content), false,
  'a day-26 hook alone cannot grant a content-free day 22');
const saved = JSON.stringify(state);
assert.throws(() => R.startNextDay(state, content), /neste kapittel/);
assert.equal(JSON.stringify(state), saved, 'refusal preserves the completed day, meters and archive');
// Readiness is read-only and uses the same canonical time predicate. This
// observation does not advance the player or award the future event.
assert.equal(R.sceneDue({ ...state, livsdag: 22 }, future), false);
assert.equal(R.sceneDue({ ...state, livsdag: 26 }, future), true);
console.log('PASS: real 21-day private story, ordinary day 8/21 preserved, no invented day 22 from day-26 content');
