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


test('organic 21-day private arcs: first, last and career-interest routes all stay playable', () => {
  const content = pack('arbeidsledig');
  for (const strategy of ['first', 'last', 'career']) {
    const state = S.createInitialState(content);
    const counts = [];
    for (let day = 1; day <= 21; day++) {
      let choices = 0;
      while (!state.dagFerdig) {
        const scene = R.selectNextScene(state, content);
        if (scene) {
          const available = scene.valg.filter(choice => !choice.skills_requirement);
          const choice = strategy === 'last' ? available.at(-1)
            : strategy === 'career' && [
                'wave_e_life21_d8_foerste_spor',
                'wave_e_life21_d15_tredje_uke'
              ].includes(scene.id)
              ? available.find(value => value.handling?.type === 'aapne_karriere')
              : available[0];
          assert.ok(choice, 'a real choice exists, no seeded Skills');
          R.applyChoice(state, content, scene.id, choice.id);
          choices++;
        } else R.advance(state, content);
        assert.ok(choices < 180, 'no duplicate/infinite scenes');
      }
      counts.push(choices);
      assert.equal(state.livsdag, day, 'day advances with no invented calendar skip');
      if (day < 21) R.startNextDay(state, content);
    }
    assert.equal(counts.length, 21);
    assert.ok(counts.every(value => value > 0), strategy + ': no empty day through three weeks');
    assert.equal(state.rolle, 'arbeidsledig', 'looking for work never awards a job');
    assert.deepEqual(state.rolleBytter, [], 'work interests do not invent job changes');
    assert.ok(['skaper', 'narmiljobygger', 'relasjonsbygger', 'hverdagsbygger', 'utforsker']
      .includes(state.tidligereValg.life21_direction));
    assert.ok(state.arkiv.some(row => row.sceneId.startsWith('wave_e_life21_d21_') && row.livsdag === 21));
    if (strategy === 'career') {
      assert.equal(state.tidligereValg.life21_initial_focus, 'jobb');
      assert.equal(state.tidligereValg.life21_week3_focus, 'jobb');
    }
  }
});

test('day-21 life direction is earned from a saved choice; career remains independent', () => {
  const vm = require('node:vm');
  const content = pack('arbeidsledig');
  const clerk = pack('ekspeditor');
  const state = S.createInitialState(content);
  const saved = { raw: JSON.stringify(state), values: {},
    getItem(key) { return key === S.STORAGE_KEY ? this.raw : this.values[key] ?? null; },
    setItem(key, value) { if (key === S.STORAGE_KEY) this.raw = value; else this.values[key] = value; }
  };
  const app = { localStorage: saved, dispatchEvent() {},
    CivicationState: { getActivePosition: () => null } };
  const sandbox = { window: app, localStorage: saved, Event: class Event { constructor(type) { this.type = type; } }, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root,
    'js/Civication/systems/civicationLifePositionRuntime.js'), 'utf8'), sandbox);
  const positions = app.CivicationLifePositions;
  assert.equal(positions.getUnlockedPositions('liv_treuker').length, 0);
  const forged = copy(state);
  forged.tidligereValg.life21_direction = 'skaper';
  saved.raw = JSON.stringify(forged);
  assert.equal(positions.getUnlockedPositions('liv_treuker').length, 0,
    'a fabricated flag is not proof of a played personal chapter');
  saved.raw = JSON.stringify(state);
  for (let day = 1; day <= 21; day++) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      if (scene) R.applyChoice(state, content, scene.id, scene.valg[0].id);
      else R.advance(state, content);
    }
    saved.raw = JSON.stringify(state);
    if (day < 21) {
      assert.equal(positions.getUnlockedPositions('liv_treuker').length, 0,
        'no early unlock before completing a real three-week path');
      R.startNextDay(state, content);
    }
  }
  assert.equal(positions.getUnlockedPositions('liv_treuker')[0].label, 'Skaper');
  // Day 21's declared identity is not sufficient without a witnessed
  // first step and an archived, focus-relevant practice on day 16.
  for (const missing of ['wave_e_life21_d8_foerste_spor', 'wave_e_life21_d16_arbeidsro']) {
    const altered = copy(state);
    altered.arkiv = altered.arkiv.filter(entry => entry.sceneId !== missing);
    if (altered.privatHistorie?.arkiv) {
      altered.privatHistorie.arkiv = altered.privatHistorie.arkiv
        .filter(entry => entry.sceneId !== missing);
    }
    saved.raw = JSON.stringify(altered);
    assert.equal(positions.getUnlockedPositions('liv_treuker').length, 0,
      'a declared life direction must have archived development: ' + missing);
  }
  saved.raw = JSON.stringify(state);
  assert.equal(positions.getUnlockedPositions('liv_treuker')[0].label, 'Skaper');
  assert.equal(positions.getLifeContext().primary_life_position, null,
    'life direction is never auto-selected');
  const atWork = S.selectRole(state, clerk);
  assert.equal(atWork.privatHistorie?.flagg?.life21_direction, 'skaper',
    'private choices follow the person, not the former job');
  assert.ok(atWork.privatHistorie?.arkiv?.some(x => x.sceneId === 'wave_e_life21_d21_skape_veien'));
  saved.raw = JSON.stringify(atWork);
  app.CivicationState.getActivePosition = () => ({ career_id: 'naeringsliv', title: 'Ekspeditør' });
  assert.equal(positions.getUnlockedPositions('liv_treuker')[0].label, 'Skaper',
    'earned direction is still available after an actual job change');
  assert.equal(positions.activate('liv_treuker', 'Skaper').ok, true);
  assert.equal(positions.getLifeContext().primary_life_position.label, 'Skaper');
  assert.equal(positions.getFormalEmploymentStatus().is_employed, true,
    'existing job is independent of selected personal life direction');
  assert.equal(saved.getItem('merits_by_category'), null,
    'neither a job interest nor life direction grants History Go merits');
});


test('21-day Life Story retains personal evidence and relationships through two real role transitions', () => {
  const unemployed = pack('arbeidsledig');
  const clerk = pack('ekspeditor');
  const cleaner = pack('renholder');
  let state = S.createInitialState(unemployed);
  let switches = 0;
  let played = 0;
  for (let day = 1; day <= 21; day++) {
    assert.equal(state.livsdag, day, 'true player age continues across role changes');
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, unemployed);
      if (scene) {
        const available = scene.valg.filter(choice => !choice.skills_requirement);
        assert.ok(available.length, 'every personal day has an ordinary choice');
        R.applyChoice(state, unemployed, scene.id, available[0].id);
        played++;
      } else R.advance(state, unemployed);
      assert.ok(played < 950, 'no loops through the real story');
    }
    if ([8, 15].includes(day)) {
      const storyProof = state.arkiv.filter(entry => /^wave_e_life21_/.test(entry.sceneId));
      assert.ok(storyProof.length, 'authored personal practice exists before switching roles');
      const family = state.relasjoner.familie;
      const friend = state.relasjoner.venn;
      const focus = state.tidligereValg.life21_initial_focus;
      const newWork = day === 8 ? clerk : cleaner;
      const atWork = S.selectRole(state, newWork);
      switches++;
      assert.equal(atWork.livsdag, day, 'switching jobs never skips a life day');
      assert.equal(atWork.relasjoner.familie, family, 'family follows the person');
      assert.equal(atWork.relasjoner.venn, friend, 'friendships follow the person');
      assert.equal(atWork.tidligereValg.life21_initial_focus, focus);
      assert.ok(storyProof.every(entry => atWork.arkiv.some(row =>
        row.sceneId === entry.sceneId && row.valgId === entry.valgId)),
        'the new job carries actual played private history, not a generic reset');
      state = S.selectRole(atWork, unemployed);
      switches++;
      assert.equal(state.dag, day, 'the previous story resumes on the original day');
      assert.equal(state.livsdag, day);
      assert.equal(state.relasjoner.familie, family);
      assert.equal(state.relasjoner.venn, friend);
      assert.ok(storyProof.every(entry => state.arkiv.some(row =>
        row.sceneId === entry.sceneId && row.valgId === entry.valgId)));
      assert.equal(new Set(state.arkiv.map(row => row.sceneId)).size, state.arkiv.length,
        'round-trip role changes cannot duplicate archived private events');
    }
    if (day < 21) R.startNextDay(state, unemployed);
  }
  assert.equal(switches, 4);
  assert.equal(state.rolleBytter.length, 4, 'both job and return transitions are recorded');
  assert.equal(state.rolle, 'arbeidsledig');
  assert.equal(state.livsdag, 21);
  assert.equal(state.tidligereValg.life21_direction, 'skaper');
  assert.ok(state.privatHistorie?.arkiv?.some(row =>
    row.sceneId === 'wave_e_life21_d16_arbeidsro' && row.livsdag === 16),
    'week-three practice is carried into the final personal state');
  assert.ok(state.arkiv.some(row =>
    row.sceneId === 'wave_e_life21_d21_skape_veien' && row.livsdag === 21),
    'day-21 personal decision remains playable after real role swaps');
});
