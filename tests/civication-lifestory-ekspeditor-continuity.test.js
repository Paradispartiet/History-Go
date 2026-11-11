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

// These cases intentionally leave real work pending before a saved day rollover.
for (const stage of ['investigation', 'report', 'check']) for (const resumeDay of [2, 3]) {
  let s = start();
  play(s, 'prisfeil_02_koen', stage === 'investigation' ? 'gjett_pris' : 'rett_synlig');
  if (stage === 'investigation') play(s, 'prisfeil_03_undersok_etter_snarevei', 'la_sta_apent');
  else if (stage === 'report') play(s, 'prisfeil_03_meld_avvik', 'utsett_melding');
  else {
    play(s, 'prisfeil_03_meld_avvik', 'send_notat');
    play(s, 'prisfeil_04_lene_bekrefter', 'kontroller_selv');
    play(s, 'prisfeil_05_sjekk_selv', 'ikke_kontrollert');
  }
  assert(!s.tidligereValg.eksp_life_pris_etterkontroll_verifisert);
  finishDay(s);
  s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  const base = stage === 'investigation' ? 'prisfeil_03_undersok_etter_snarevei'
    : stage === 'report' ? 'prisfeil_03_meld_avvik' : 'prisfeil_05_sjekk_selv';
  if (resumeDay === 3) {
    until(s, base + '_d2');
    play(s, base + '_d2', stage === 'investigation' ? 'la_sta_apent' : stage === 'report' ? 'utsett_melding' : 'ikke_kontrollert');
    finishDay(s);
    s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  }
  const suffix = '_d' + resumeDay;
  until(s, base + suffix);
  if (stage === 'investigation') play(s, base + suffix, 'sjekk_selv');
  if (stage !== 'check') {
    play(s, 'prisfeil_03_meld_avvik' + suffix, 'send_notat');
    play(s, 'prisfeil_04_lene_bekrefter' + suffix, 'amir_kontrollerer');
    assert(!s.tidligereValg.eksp_life_pris_etterkontroll_verifisert);
    assert.equal(Runner.selectNextScene(s, content).id, 'prisfeil_05_amir_sjekker' + suffix, 'only agreed delegated check appears');
    play(s, 'prisfeil_05_amir_sjekker' + suffix, 'registrer_amir');
    assert(s.tidligereValg.eksp_life_pris_etterkontroll_amir);
    assert(!s.tidligereValg.eksp_life_pris_etterkontroll_egen);
  } else play(s, base + suffix, 'kontroller_39');
  assert(s.tidligereValg.eksp_life_pris_etterkontroll_verifisert);
  assert.equal(s.threadState.prisfeilen_i_koen.status, 'completed');
  assert(Runner.getSymposium(s, content).tidslinje.some(row => row.sceneId.endsWith(suffix) && row.threadId === 'prisfeilen_i_koen'));
  finishDay(s);
  if (resumeDay === 2) s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  assert(!Runner.getCandidateScenes(s, content).some(row => row.id.startsWith('prisfeil')), 'completed task cannot recover again');
}
for (const ending of ['full_lukking', 'laas_presis']) {
  const s = start();
  until(s, 'lukking_01_fem_minutter');
  const integrity = s.meters.integritet;
  play(s, 'lukking_01_fem_minutter', ending);
  assert(s.meters.integritet >= integrity, 'agreed handover must not penalize integrity');
  assert(s.tidligereValg.ryddet_for_neste_skift);
  assert(!s.tidligereValg.laaste_presis, 'ordinary handover cannot record locking the shop');
  assert(!s.tidligereValg.tok_nokkelansvar);
}
const own = start(), colleague = start();
const ownBefore = own.meters.integritet, colleagueBefore = colleague.meters.integritet;
const visibility = colleague.meters.synlighet;
play(own, 'prisfeil_02_koen', 'rett_synlig');
play(colleague, 'prisfeil_02_koen', 'rop_paa_amir');
assert.equal(colleague.meters.integritet - colleagueBefore, own.meters.integritet - ownBefore);
assert(colleague.meters.synlighet >= visibility, 'sound help-seeking must not incur an unexplained visibility penalty');
console.log('Ekspeditor continuity: 6 real day-2/day-3 recovery paths at 3 stages, actor attribution, no replay, ordinary shift and sound help-seeking OK');
