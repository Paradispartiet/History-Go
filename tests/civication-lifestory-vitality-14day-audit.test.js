#!/usr/bin/env node
// Civication: vitality calibration and an honest, unseeded 14-day journey audit.
// This is NOT a full shell/browser acceptance: jobs, economy, people and cloud
// still require an integrated, real-user playthrough.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const manifest = read(C.MANIFEST_PATH);
const copy = value => JSON.parse(JSON.stringify(value));

function pack(roleId) {
  const files = manifest.roles[roleId];
  assert.ok(files, 'real published role: ' + roleId);
  return C.buildContent({
    role: read(files.role), roleThreads: read(files.threads),
    roleScenes: read(files.scenes), lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions)
  });
}

test('capacity load applies only to demanding choices when exhausted, visibly and once', () => {
  const content = pack('ekspeditor');
  const first = R.selectNextScene(S.createInitialState(content), content);
  assert.ok(first?.valg?.some(x => Number(x.effekter?.meters?.energi) <= -2));
  const choice = first.valg.find(x => Number(x.effekter?.meters?.energi) <= -2);

  const tired = S.createInitialState(content);
  tired.meters.energi = 28;
  tired.meters.psyke = 28;
  const before = copy(tired.meters);
  const result = R.applyChoice(tired, content, first.id, choice.id);
  assert.equal(tired.meters.energi, before.energi + choice.effekter.meters.energi);
  assert.equal(tired.meters.psyke, before.psyke + (choice.effekter.meters.psyke || 0) - 1);
  assert.equal(tired.meters.handlingsrom, before.handlingsrom + (choice.effekter.meters.handlingsrom || 0) - 1);
  assert.match(result.konsekvensTekst, /Lite energi/);
  assert.match(result.konsekvensTekst, /handlingsrom/);
  assert.match(tired.arkiv.at(-1).konsekvensTekst, /Lite energi/);
  assert.match(R.capacityWarning(tired), /Lav energi og lite psykisk overskudd/);

  const rested = S.createInitialState(content);
  rested.meters.energi = 76;
  rested.meters.psyke = 60;
  const good = R.applyChoice(rested, content, first.id, choice.id);
  assert.equal(rested.meters.energi, 76 + choice.effekter.meters.energi);
  assert.equal(rested.meters.psyke, 60 + (choice.effekter.meters.psyke || 0));
  assert.doesNotMatch(good.konsekvensTekst || '', /Lite energi gjorde|Lite energi og/);
  assert.throws(() => R.applyChoice(tired, content, first.id, choice.id), /allerede spilt/);
});

test('overnight recovery is modest, bounded, and follows the ordinary day gate', () => {
  const content = pack('ekspeditor');
  const state = S.createInitialState(content);
  let guard = 0;
  while (!state.dagFerdig) {
    const scene = R.selectNextScene(state, content);
    if (scene) R.applyChoice(state, content, scene.id, scene.valg[0].id);
    else R.advance(state, content);
    assert.ok(++guard < 80);
  }
  const atNight = state.meters.energi;
  const psycheAtNight = state.meters.psyke;
  const snapshot = copy(state);
  R.startNextDay(state, content);
  assert.equal(state.dag, 2);
  assert.equal(state.livsdag, 2);
  assert.equal(state.meters.energi, Math.max(atNight, Math.min(85, atNight + 8)));
  assert.equal(state.meters.psyke, Math.max(0, psycheAtNight - (atNight <= 20 ? 1 : 0)));
  assert.deepEqual(state.arkiv, snapshot.arkiv, 'sleep does not invent events');
  assert.equal(state.dagStartMeters.energi, state.meters.energi);
  assert.equal(state.dagStartMeters.psyke, state.meters.psyke);
  assert.throws(() => R.startNextDay(state, content), /dagen er ikke ferdig/);
});

test('body and integrity follow a person through jobs; workplace standing does not', () => {
  const unemployed = pack('arbeidsledig');
  const clerk = pack('ekspeditor');
  const cleaner = pack('renholder');
  const state = S.createInitialState(unemployed);
  Object.assign(state.meters, { energi: 19, psyke: 31, integritet: 42, synlighet: 13, handlingsrom: 17 });
  const atWork = S.selectRole(state, clerk);
  assert.deepEqual(['energi','psyke','integritet'].map(x => atWork.meters[x]), [19,31,42]);
  assert.equal(atWork.meters.synlighet, clerk.role.startState.meters.synlighet);
  assert.equal(atWork.meters.handlingsrom, clerk.role.startState.meters.handlingsrom);
  atWork.meters.energi = 12;
  atWork.meters.psyke = 27;
  atWork.meters.integritet = 38;
  const second = S.selectRole(atWork, cleaner);
  assert.deepEqual(['energi','psyke','integritet'].map(x => second.meters[x]), [12,27,38]);
  assert.deepEqual(['energi','psyke','integritet'].map(x => second.rolleTilstander.ekspeditor.meters[x]), [12,27,38]);
  const returned = S.selectRole(second, unemployed);
  assert.deepEqual(['energi','psyke','integritet'].map(x => returned.meters[x]), [12,27,38]);
  assert.equal(returned.meters.synlighet, 13);
  assert.equal(returned.meters.handlingsrom, 17);
  assert.equal(returned.rolleBytter.length, 3);
});

test('low energy triggers a real, authored shop-floor follow-up with a choice', () => {
  const content = pack('ekspeditor');
  const name = 'd2_morgen_vaktpress_etter_stenging';
  const state = S.createInitialState(content);
  // Use a real completed first day: changing the day number alone leaves
  // the newly authored day-two work thread dormant and hides its scene.
  let steps = 0;
  while (!state.dagFerdig) {
    const scene = R.selectNextScene(state, content);
    if (scene) R.applyChoice(state, content, scene.id, scene.valg[0].id);
    else R.advance(state, content);
    assert.ok(++steps < 100, 'day one terminates before boundary testing');
  }
  R.startNextDay(state, content);
  assert.equal(state.dag, 2);
  assert.equal(state.threadState.arbeidsrytme_og_overskudd.status, 'active');
  // Boundary values below exercise the scene condition, not fake a journey.
  state.meters.energi = 62;
  assert.equal(R.getCandidateScenes(state, content).some(s => s.id === name), false);
  state.meters.energi = 55;
  assert.equal(R.selectNextScene(state, content)?.id, name);
  const before = copy(state.meters);
  R.applyChoice(state, content, name, 'kort_pause');
  assert.equal(state.meters.energi, before.energi + 4);
  assert.equal(state.meters.psyke, before.psyke + 2);
  assert.equal(state.meters.penger, before.penger, 'no fabricated payment');
  assert.equal(state.tidligereValg.ekspeditor_tok_pause_d2, true);
  assert.ok(state.spilteScener.includes(name));
  assert.throws(() => R.applyChoice(state, content, name, 'kort_pause'), /allerede spilt/);
});

test('prolonged emotional strain has a small energy cost that the player can see', () => {
  const content = pack('ekspeditor');
  const scene = content.scenes.find(s => s.id === 'retur_01_uten_kvittering');
  const state = S.createInitialState(content);
  state.fase = scene.fase;
  state.meters.energi = 65;
  state.meters.psyke = 24;
  assert.ok(R.getCandidateScenes(state, content).some(s => s.id === scene.id));
  const choice = scene.valg.find(c => c.id === 'hold_regelen');
  const result = R.applyChoice(state, content, scene.id, choice.id);
  assert.equal(state.meters.psyke, 24 + choice.effekter.meters.psyke);
  assert.equal(state.meters.energi, 64,
    'when already stressed, this authored stressful situation costs one extra energy');
  assert.match(result.konsekvensTekst, /Lavt psykisk overskudd/);
  assert.equal(state.arkiv.at(-1).konsekvensTekst, result.konsekvensTekst);
});

test('unseeded 14-day target reports the actual progression gate, not fake achievements', () => {
  // Run the real day-1 to day-7 story without a fabricated History Go badge
  // or forced life-position. Any later Wave E scenes must be earned from
  // decisions actually made during the first seven days.
  const content = pack('arbeidsledig');
  let state = S.createInitialState(content);
  assert.equal(state.arkiv.length, 0);
  assert.deepEqual(state.rolleBytter, []);
  const targetDays = 14;
  const achievedDays = [];
  let steps = 0;
  let blockedByChapter = false;
  while (state.dag <= targetDays) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      if (scene) R.applyChoice(state, content, scene.id, scene.valg[0].id);
      else R.advance(state, content);
      assert.ok(++steps < 1500, 'the true player journey must terminate');
    }
    achievedDays.push(state.dag);
    if (state.dag >= targetDays) break;
    try { R.startNextDay(state, content); }
    catch (error) {
      assert.match(String(error), /neste kapittel må åpnes/);
      blockedByChapter = true;
      break;
    }
  }
  assert.deepEqual(achievedDays.slice(0, 7), [1,2,3,4,5,6,7],
    'the first seven days must be playable without injected role state');
  assert.ok(state.spilteScener.length > 7);
  assert.ok(state.arkiv.every(entry => entry.sceneId && Number.isInteger(entry.livsdag)));
  assert.equal(state.rolle, 'arbeidsledig', 'do not fabricate a new job');
  assert.equal(state.rolleBytter.length, 0);
  assert.ok(state.livsdag >= 7 && state.livsdag <= 14);
  console.log('14-day organic acceptance: days completed=' + achievedDays.length
    + '/14; chapter gate=' + blockedByChapter
    + '; badge-free='+true
    + '; full shell / economy / real account acceptance still unverified');
});


// Acceptance extension: three playable weeks, not fourteen calendar ticks.
// No fabricated Badge, job, Life Position or scene condition is seeded.
test('unseeded 21-day private life has distinct daily play and earned alternatives', () => {
  const vm = require('node:vm');
  const lifeCode = fs.readFileSync(path.join(root,
    'js/Civication/systems/civicationLifePositionRuntime.js'), 'utf8');
  const content = pack('arbeidsledig');
  for (const route of ['first', 'last']) {
    const store = new Map();
    const localStorage = {
      getItem: key => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => { store.set(key, String(value)); },
      removeItem: key => store.delete(key)
    };
    const win = { localStorage, BADGES: [], dispatchEvent: () => {} };
    const ctx = { window: win, localStorage, console };
    vm.runInNewContext(lifeCode, ctx);
    const positions = win.CivicationLifePositions;
    let story = S.createInitialState(content);
    const playedByDay = {};
    assert.equal(positions.getAllUnlockedPositions().filter(p =>
      p.source === 'authored_life_story_21d').length, 0);
    for (let day = 1; day <= 21; day++) {
      let count = 0;
      let steps = 0;
      while (!story.dagFerdig) {
        const scene = R.selectNextScene(story, content);
        if (scene) {
          const available = scene.valg.filter(x => !x.skills_requirement);
          assert(available.length, 'never force a Skills bonus');
          const choice = route === 'first' ? available[0] : available.at(-1);
          R.applyChoice(story, content, scene.id, choice.id);
          (playedByDay[day] ||= []).push(scene.id);
          count++;
        } else R.advance(story, content);
        assert(++steps < 125, 'day ' + day + ' terminates');
      }
      assert(count >= 1, 'day ' + day + ' contains an actual played choice');
      if (day >= 8) assert((playedByDay[day] || []).some(id => id.startsWith('privat_21d_d' + day + '_')),
        'day ' + day + ' has new varied private-life content');
      assert.equal(story.livsdag, day, 'day and life day agree through 21');
      assert.equal(story.rolleBytter.length, 0, 'no fake job');
      localStorage.setItem(S.STORAGE_KEY, JSON.stringify(story));
      const earned = positions.getAllUnlockedPositions().filter(p =>
        p.source === 'authored_life_story_21d');
      assert.equal(earned.length, day === 21 ? 1 : 0, 'position eligibility only after final real choice');
      if (day < 21) R.startNextDay(story, content);
    }
    const end = playedByDay[21][0];
    assert.equal(end.includes(route === 'first' ? 'retning_med_bidrag' : 'retning_som_deltaker'), true);
    assert.equal(playedByDay[13][0].includes(route === 'first' ? 'kaffemoetet' : 'respekt_for_grensen'), true,
      'day-8 choice shapes day-13 contact');
    const unlocked = positions.getAllUnlockedPositions().filter(p =>
      p.source === 'authored_life_story_21d');
    assert.equal(unlocked[0].label, route === 'first' ? 'Nærmiljøbidragsyter' : 'Nærmiljøutforsker');
    assert.equal(positions.getState().primary, null, 'earned means eligible, never auto-activated');
    assert.equal(localStorage.getItem('merits_by_category'), null, 'no quiz merit invention');
    assert.equal(localStorage.getItem('hg_active_position_v1'), null, 'no job invention');
    const chosen = positions.activate(unlocked[0].badge_id, unlocked[0].label);
    assert.equal(chosen.ok, true, 'player can voluntarily activate earned life position');
    assert.equal(positions.getState().primary.label, unlocked[0].label);
    assert.equal(positions.getLifeContext().employment.is_employed, false,
      'life identity does not turn an unemployed person into an employee');
    const clerk = pack('ekspeditor');
    const afterJobChange = S.selectRole(story, clerk);
    assert.equal(afterJobChange.rolle, 'ekspeditor');
    assert(afterJobChange.spilteScener.includes(end), 'shared day-21 memory crosses role switch');
    localStorage.setItem(S.STORAGE_KEY, JSON.stringify(afterJobChange));
    assert.equal(positions.getAllUnlockedPositions().filter(p =>
      p.source === 'authored_life_story_21d')[0].label, unlocked[0].label,
      'earned role remains available after a real job-role change');
    const afterReload = JSON.parse(localStorage.getItem(S.STORAGE_KEY));
    assert.equal(positions.getState().primary.label, unlocked[0].label);
    assert(afterReload.privatHistorie.arkiv.some(entry => entry.sceneId === end),
      'archived choice survives serialization');
    assert.equal(afterReload.rolleBytter.length, 1);
  }
});
