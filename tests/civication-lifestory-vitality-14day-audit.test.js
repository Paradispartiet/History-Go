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


test('three organic 21-day paths retain daily private choices and never mint work or History Go merits', () => {
  const content = pack('arbeidsledig');
  const week3 = new Set(['jobb', 'by', 'folk']);
  for (const selection of [0, 1, 2]) {
    let state = S.createInitialState(content);
    const daily = [];
    for (let day = 1; day <= 21; day++) {
      let count = 0;
      while (!state.dagFerdig) {
        const scene = R.selectNextScene(state, content);
        if (scene) {
          const ordinary = scene.valg.filter(choice => !choice.skills_requirement);
          const choice = ordinary[Math.min(selection, ordinary.length - 1)];
          assert.ok(choice, scene.id + ' retains an ordinary alternative');
          R.applyChoice(state, content, scene.id, choice.id);
          count++;
        } else R.advance(state, content);
        assert.ok(count < 130, 'authored day must terminate');
      }
      assert.equal(state.livsdag, day);
      assert.ok(count > 0, 'day ' + day + ' has a concrete private event on route ' + selection);
      daily.push(count);
      if (day < 21) R.startNextDay(state, content);
    }
    assert.equal(daily.length, 21);
    assert.equal(state.spilteScener.includes('wave_e_liv_d21_hovedkapittel'), true);
    assert.equal(week3.has(state.tidligereValg.wa_f_uke3_retning), true);
    assert.equal(state.rolle, 'arbeidsledig');
    assert.equal(state.rolleBytter.length, 0, 'no job is granted by time alone');
    assert.ok(!state.tidligereValg.merits_by_category, 'choices do not forge History Go merits');
    assert.ok(state.arkiv.every(entry => entry.sceneId && Number.isInteger(entry.livsdag)));
    assert.equal(state.arkiv.filter(entry => entry.sceneId === 'wave_e_liv_d21_hovedkapittel').length, 1,
      'week-three reflection is recorded exactly once');
    assert.throws(() => R.startNextDay(state, content), /neste kapittel må åpnes/,
      'the first 21-day chapter ends with authentic career/life-position actions, not a fake 22nd day');
  }
});

test('day 14 accepted job handoff preserves private history and reaches life day 21', () => {
  // In this unit test selectRole represents the consequence of a legitimate
  // offer already accepted elsewhere. It never creates an offer or pays a wage.
  let content = pack('arbeidsledig');
  let state = S.createInitialState(content);
  let savedArchive, savedDirection;
  for (let day = 1; day <= 21; day++) {
    let count = 0;
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      if (scene) {
        const choice = scene.valg.find(item => !item.skills_requirement);
        R.applyChoice(state, content, scene.id, choice.id);
        count++;
      } else R.advance(state, content);
      assert.ok(count < 140);
    }
    if (day === 14) {
      savedArchive = copy(state.arkiv.filter(entry => entry.sceneId.startsWith('wave_e_liv_')));
      savedDirection = state.tidligereValg.wa_f_uke3_retning;
      content = pack('ekspeditor');
      state = S.selectRole(state, content);
      assert.equal(state.livsdag, 14, 'job transition cannot reset calendar or life day');
      assert.equal(state.rolle, 'ekspeditor');
      assert.equal(state.tidligereValg.wa_f_uke3_retning, savedDirection,
        'personal choices remain with the person across employment');
      // Completing the new role's first workday uses normal playable scenes.
      let jobSteps = 0;
      while (!state.dagFerdig) {
        const scene = R.selectNextScene(state, content);
        if (scene) R.applyChoice(state, content, scene.id, scene.valg.find(choice => !choice.skills_requirement).id);
        else R.advance(state, content);
        assert.ok(++jobSteps < 140);
      }
    }
    if (day < 21) R.startNextDay(state, content);
  }
  assert.equal(state.rolle, 'ekspeditor');
  assert.equal(state.livsdag, 21);
  assert.ok(state.rolleBytter.length === 1);
  assert.ok(savedArchive.every(entry => state.arkiv.some(saved => saved.sceneId === entry.sceneId)),
    'early personal history is retained after the job change');
  assert.ok(state.spilteScener.includes('wave_e_liv_d21_hovedkapittel'),
    'private life reaches the same three-week finale during paid employment');
});
