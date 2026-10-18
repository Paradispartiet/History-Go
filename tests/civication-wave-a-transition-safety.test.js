#!/usr/bin/env node
// Narrow regression for the *published* wave-A Life Story runner.
// The eight future narrative-entry contracts require a separate inbox/calendar
// acceptance run once their runtime sources have been committed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');

const root = path.resolve(__dirname, '..');
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = json(C.MANIFEST_PATH);

function roleContent(role) {
  const entry = manifest.roles[role];
  return C.buildContent({
    role: json(entry.role),
    roleThreads: json(entry.threads),
    roleScenes: json(entry.scenes),
    phaseDefinitions: json(manifest.shared.phaseDefinitions),
    lifeThreads: json(manifest.life.threads),
    lifeScenes: json(manifest.life.scenes)
  });
}

function finishThroughDay(state, content, lastDay) {
  let steps = 0;
  while (state.dag <= lastDay) {
    while (!state.dagFerdig) {
      const next = R.selectNextScene(state, content);
      if (next) R.applyChoice(state, content, next.id, next.valg[0].id);
      else R.advance(state, content);
      assert.ok(++steps < 500, 'day loop must terminate');
    }
    if (state.dag === lastDay) return state;
    R.startNextDay(state, content);
  }
  throw new Error('lastDay was not reached');
}

test('future scene and invalid choice are rejected transactionally', () => {
  const content = roleContent('arbeidsledig');
  const state = S.createInitialState(content);
  const future = content.scenes.find(scene => scene.id === 'wave_a_c01_invitasjon');
  assert.ok(future && future.dag > state.dag);
  const original = clone(state);
  assert.throws(
    () => R.applyChoice(state, content, future.id, future.valg[0].id),
    /ikke tilgjengelig nå/
  );
  assert.deepEqual(state, original, 'premature actions must not alter save or archive');

  const actual = R.selectNextScene(state, content);
  assert.ok(actual && actual.valg.length);
  assert.throws(
    () => R.applyChoice(state, content, actual.id, '__rejected_choice__'),
    /ukjent valg/
  );
  assert.deepEqual(state, original, 'rejected answer must be atomic');
});

test('repeated answer neither duplicates history nor reapplies effects', () => {
  const content = roleContent('arbeidsledig');
  const state = S.createInitialState(content);
  const actual = R.selectNextScene(state, content);
  assert.ok(actual && actual.valg.length);
  R.applyChoice(state, content, actual.id, actual.valg[0].id);
  const after = clone(state);
  assert.equal(after.arkiv.filter(entry => entry.sceneId === actual.id).length, 1);
  assert.throws(
    () => R.applyChoice(state, content, actual.id, actual.valg[0].id),
    /allerede spilt/
  );
  assert.deepEqual(state, after, 'duplicate input must not modify save');
});

test('job and workplace role changes preserve the existing save when returning', () => {
  const unemployed = roleContent('arbeidsledig');
  const cleaning = roleContent('renholder');
  const planning = roleContent('arealplanlegger');
  const state = finishThroughDay(S.createInitialState(unemployed), unemployed, 7);
  const original = clone({
    arkiv: state.arkiv, tidligereValg: state.tidligereValg,
    relasjoner: state.relasjoner, spilteScener: state.spilteScener,
    threadState: state.threadState
  });
  const changed = S.selectRole(clone(state), cleaning);
  const changedAgain = S.selectRole(changed, planning);
  const returned = S.selectRole(changedAgain, unemployed);
  S.reconcileContent(returned, unemployed);
  for (const field of Object.keys(original)) {
    assert.deepEqual(returned[field], original[field], field + ' survives the role changes');
  }
  assert.equal(returned.rolle, 'arbeidsledig');
  assert.ok(returned.rolleBytter.length >= 3);
});

test('an expired or legacy agreement is not inferred to have happened', () => {
  const content = roleContent('arbeidsledig');
  // Legacy entry without a witnessed outcome: the agreement was made,
  // but no visit, attendance, cancellation or answer has been recorded.
  const legacy = S.createInitialState(content);
  legacy.dag = 7;
  legacy.livsdag = 7;
  legacy.tidligereValg.wa_c01_tur_avtalt = true;
  const archived = clone(legacy.arkiv);
  S.reconcileContent(legacy, content);
  assert.deepEqual(legacy.arkiv, archived);
  assert.equal(legacy.tidligereValg.wa_c01_tur_avtalt, true);
  assert.equal(legacy.tidligereValg.wa_c01_tur_gjennomfort, undefined);
  assert.equal(legacy.tidligereValg.wa_c01_tur_avlyst, undefined);
  const reloaded = clone(legacy);
  S.reconcileContent(reloaded, content);
  assert.equal(reloaded.tidligereValg.wa_c01_tur_gjennomfort, undefined);
  assert.deepEqual(reloaded.arkiv, archived);
});
