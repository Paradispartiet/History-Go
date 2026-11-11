#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');
const State = require('../js/Civication/lifestory/lifestoryState.js');
const Runner = require('../js/Civication/lifestory/lifestoryRunner.js');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read('data/Civication/lifestory/manifest.json');
const entry = manifest.roles.ekspeditor;
const content = Content.buildContent({ role: read(entry.role), roleScenes: read(entry.scenes),
  roleThreads: read(entry.threads), phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeScenes: read(manifest.life.scenes), lifeThreads: read(manifest.life.threads) });
const ordinary = scene => scene.valg.find(c => !c.skills_requirement).id;
function play(state, sceneId, choiceId) {
  assert(Runner.getCandidateScenes(state, content).some(s => s.id === sceneId), sceneId + ' must actually be available');
  return Runner.applyChoice(state, content, sceneId, choiceId);
}
function until(state, id) {
  for (let n = 0; n < 60; n++) {
    const scene = Runner.selectNextScene(state, content);
    assert(scene, 'scene missing before ' + id);
    if (scene.id === id) return;
    play(state, scene.id, ordinary(scene));
  }
  assert.fail('did not reach ' + id);
}
function start(opening = 'aapne_raskt') {
  const s = State.createInitialState(content);
  until(s, 'apning_01_forste_okt');
  const before = s.meters.integritet;
  play(s, 'apning_01_forste_okt', opening);
  if (opening === 'aapne_raskt') assert.equal(s.meters.integritet, before, 'on-time shift start must not imply neglected work');
  until(s, 'prisfeil_02_koen');
  return s;
}
function finishDay(s) {
  for (let n = 0; !s.dagFerdig && n < 60; n++) {
    const scene = Runner.selectNextScene(s, content);
    assert(scene);
    play(s, scene.id, ordinary(scene));
  }
  assert(s.dagFerdig, 'day terminates');
}
for (const opening of ['aapne_raskt', 'sjekk_plakatene', 'spor_amir']) {
  for (const price of ['rett_synlig', 'rop_paa_amir', 'gjett_pris']) {
    const s = start(opening);
    play(s, 'prisfeil_02_koen', price);
    assert.notEqual(s.threadState.prisfeilen_i_koen.status, 'completed', 'sale does not finish source repair');
    assert(!s.tidligereValg.prisavvik_overtatt);
    assert(!s.tidligereValg.prisavvik_etterkontrollert);
    until(s, 'prisavvik_d1_meld');
    play(s, 'prisavvik_d1_meld', 'kontroller_og_meld');
    assert(s.tidligereValg.meldte_prisavvik_til_lene);
    assert(!s.tidligereValg.prisavvik_overtatt, 'sent is not received');
    play(s, 'prisavvik_d1_mottak', 'egen_kontroll');
    assert(s.tidligereValg.prisavvik_overtatt);
    assert(!s.tidligereValg.prisavvik_etterkontrollert);
    const saved = JSON.parse(JSON.stringify(s));
    play(saved, 'prisavvik_d1_kontroll', 'kontroller_retting');
    assert(saved.tidligereValg.prisavvik_etterkontrollert);
    assert.equal(saved.threadState.prisfeilen_i_koen.status, 'completed');
    const book = Runner.getSymposium(saved, content);
    const records = book.tidslinje.filter(row => row.threadId === 'prisfeilen_i_koen');
    assert.deepEqual(records.slice(-4).map(row => row.sceneId), [
      'prisfeil_02_koen', 'prisavvik_d1_meld', 'prisavvik_d1_mottak', 'prisavvik_d1_kontroll'
    ]);
    assert.throws(() => play(saved, 'prisfeil_02_koen', price), /available/);
    finishDay(saved);
    assert(!saved.tidligereValg.laaste_presis, 'handover must not register locking the shop');
    assert(!saved.tidligereValg.tok_nokkelansvar, 'new employee has not accepted lock responsibility on day one');
  }
}
for (const deferredAt of ['report', 'check']) {
  let s = start();
  play(s, 'prisfeil_02_koen', 'rett_synlig');
  if (deferredAt === 'report') play(s, 'prisavvik_d1_meld', 'utsett_oppfolging');
  else {
    play(s, 'prisavvik_d1_meld', 'kontroller_og_meld');
    play(s, 'prisavvik_d1_mottak', 'egen_kontroll');
    play(s, 'prisavvik_d1_kontroll', 'utsett_kontroll');
  }
  assert(!s.tidligereValg.prisavvik_etterkontrollert);
  finishDay(s);
  s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  if (deferredAt === 'report') {
    until(s, 'prisavvik_d2_meld');
    play(s, 'prisavvik_d2_meld', 'kontroller_og_meld');
    play(s, 'prisavvik_d2_mottak', 'egen_kontroll');
  } else until(s, 'prisavvik_d2_kontroll');
  play(s, 'prisavvik_d2_kontroll', 'kontroller_retting');
  assert(s.tidligereValg.prisavvik_etterkontrollert);
  assert.equal(s.threadState.prisfeilen_i_koen.status, 'completed');
}
const delegated = start();
play(delegated, 'prisfeil_02_koen', 'rop_paa_amir');
play(delegated, 'prisavvik_d1_meld', 'kontroller_og_meld');
play(delegated, 'prisavvik_d1_mottak', 'amir_kontrollerer');
assert(!delegated.tidligereValg.prisavvik_etterkontrollert);
play(delegated, 'prisavvik_d1_amir', 'registrer_resultat');
assert(delegated.tidligereValg.prisavvik_etterkontroll_av_amir);
assert(delegated.tidligereValg.prisavvik_etterkontrollert);
console.log('Life Story ekspeditør: 9 opening/price routes, 2 next-day recoveries, delegated result and real Symposium history OK');
