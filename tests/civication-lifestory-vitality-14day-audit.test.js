#!/usr/bin/env node
// Civication: vitality calibration and a genuine, unseeded 21-day private-life journey.
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

// A canonical, badge-free three-week playthrough with real authored choices;
// unlike the old 14-day audit, it fails rather than accepting an early stop.
function playThreeWeeks(focusChoice, opts = {}) {
  const content = pack('arbeidsledig');
  let state = S.createInitialState(content);
  let steps = 0;
  const daily = [];
  for (let day = 1; day <= 21; day++) {
    let scenes = 0;
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      if (scene) {
        let choice = scene.valg.find(v => !v.skills_requirement);
        if (scene.id === 'wave_e_c21_d8_et_eget_spor') choice = scene.valg.find(v => v.id === focusChoice);
        if (opts.skipFollowThrough && /^wave_e_c21_d16_/.test(scene.id)) choice = scene.valg.find(v => v.id === 'vent');
        if (opts.keepOpen && scene.id === 'wave_e_c21_d21_tre_ukers_valg') choice = scene.valg.find(v => v.id === 'fortsett_aapent');
        assert.ok(choice, 'every day has a playable ordinary choice');
        R.applyChoice(state, content, scene.id, choice.id);
        scenes++;
      } else R.advance(state, content);
      assert.ok(++steps < 2000, 'the whole three-week journey terminates');
    }
    daily.push({ day, scenes, livsdag: state.livsdag,
      privateChoices: state.arkiv.filter(e => e.livsdag === day && e.sceneId.startsWith('wave_e_c21_')).length });
    assert.equal(state.livsdag, day, 'story and life day stay aligned without role switching');
    if (day < 21) R.startNextDay(state, content);
  }
  return { state, daily, content };
}
test('a genuine unemployed player can play 21 days on three different private-life routes', () => {
  for (const focus of ['mennesker','skape','laere']) {
    const { state, daily } = playThreeWeeks(focus);
    assert.deepEqual(daily.map(x => x.day), Array.from({ length:21 }, (_, i) => i + 1));
    assert.ok(daily.slice(7).every(x => x.privateChoices > 0),
      'each day 8–21 has a real private scene, not an empty calendar advancement');
    assert.equal(state.rolle, 'arbeidsledig', 'life direction must never silently replace unemployment');
    assert.deepEqual(state.rolleBytter, [], 'no fabricated job or position');
    assert.equal(state.tidligereValg.wa_e_c21_reflection, 'gjennomfort');
    assert.equal(state.tidligereValg.wa_e_c21_practice, state.tidligereValg.wa_e_c21_focus);
    assert.equal(state.tidligereValg.wa_e_c21_followthrough, state.tidligereValg.wa_e_c21_focus);
    assert.ok(state.privatHistorie?.arkiv.some(e => e.sceneId === 'wave_e_c21_d21_tre_ukers_valg'),
      'private three-week decisions are retained for later job changes');
    assert.throws(() => R.startNextDay(state, pack('arbeidsledig')), /neste kapittel må åpnes/,
      'after day 21 no unearned extra chapter is silently given');
  }
});

test('earned 21-day life orientation is player-selected and requires repeated real action', () => {
  const savedLoad = S.load;
  const originalStorage = globalThis.localStorage;
  const originalCatalog = globalThis.CIVI_LIFE_POSITION_CATALOG;
  const originalPositions = globalThis.CivicationLifePositions;
  const store = new Map();
  globalThis.localStorage = {
    getItem: k => store.has(k) ? store.get(k) : null,
    setItem: (k,v) => store.set(k,String(v)),
    removeItem: k => store.delete(k)
  };
  globalThis.CIVI_LIFE_POSITION_CATALOG = { badges: [] };
  const Positions = require('../js/Civication/systems/civicationLifePositionRuntime');
  try {
    for (const [focus, name] of [
      ['mennesker','Lokal bidragsyter'],
      ['skape','Praktisk skaper'],
      ['laere','Aktiv kunnskapsutforsker']
    ]) {
      store.clear();
      const { state } = playThreeWeeks(focus);
      S.load = () => state;
      const available = Positions.getEarnedPracticePositions();
      assert.equal(available.length,1, 'exactly one relevant earned life path');
      assert.equal(available[0].label,name);
      assert.equal(Positions.getLifeContext().primary_life_position,null,
        'earned path is not activated without the player');
      assert.ok(Positions.getAllUnlockedPositions().some(p => p.label === name));
      const chosen = Positions.activate('liv_egen_praksis',name);
      assert.equal(chosen.ok,true, 'player can explicitly select the earned direction');
      assert.equal(Positions.getLifeContext().primary_life_position.label,name);
      assert.equal(Positions.getFormalEmploymentStatus().is_employed,false);
      assert.equal(store.get('merits_by_category'),undefined,'no invented History Go merits');
      // Changing job retains the actual private action chain and earned option.
      const switched = S.selectRole(state,pack('ekspeditor'));
      S.load = () => switched;
      assert.equal(Positions.getEarnedPracticePositions()[0].label,name);
    }
    const incomplete = playThreeWeeks('mennesker', { skipFollowThrough:true }).state;
    S.load = () => incomplete;
    assert.deepEqual(Positions.getEarnedPracticePositions(),[], 'planning plus one action is not enough');
    const open = playThreeWeeks('laere', { keepOpen:true }).state;
    S.load = () => open;
    assert.deepEqual(Positions.getEarnedPracticePositions(),[], 'player may keep identity open');
  } finally {
    S.load = savedLoad;
    globalThis.localStorage = originalStorage;
    globalThis.CIVI_LIFE_POSITION_CATALOG = originalCatalog;
    globalThis.CivicationLifePositions = originalPositions;
  }
});
