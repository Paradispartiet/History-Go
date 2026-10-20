#!/usr/bin/env node
"use strict";

// Organic Life Story acceptance probe + transparent wellbeing calibration.
// No preseeded badge points, test jobs, fictitious salary or unlocked chapters.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../js/Civication/lifestory/lifestoryContent");
const S = require("../js/Civication/lifestory/lifestoryState");
const R = require("../js/Civication/lifestory/lifestoryRunner");
const ROOT = path.resolve(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const clone = x => JSON.parse(JSON.stringify(x));
const manifest = read(C.MANIFEST_PATH);
function pack(role) {
  const entry = manifest.roles[role];
  return C.buildContent({
    role: read(entry.role),
    roleThreads: read(entry.threads),
    roleScenes: read(entry.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes)
  });
}
function finishDay(state, content, select = scene => scene.valg[0].id) {
  let steps = 0;
  while (!state.dagFerdig) {
    const scene = R.selectNextScene(state, content);
    if (scene) R.applyChoice(state, content, scene.id, select(scene));
    else R.advance(state, content);
    assert.ok(++steps < 200, "one real day must terminate");
  }
}
test("low energy adds a small, visible strain only for strenuous choices", () => {
  const content = pack("ekspeditor");
  const exhausted = S.createInitialState(content);
  exhausted.meters.energi = 18;
  exhausted.meters.psyke = 24;
  exhausted.meters.handlingsrom = 45;
  const result = R.applyChoice(exhausted, content, "apning_01_forste_okt", "sjekk_plakatene");
  assert.equal(exhausted.meters.energi, 15, "authored physical effort remains intact");
  assert.equal(exhausted.meters.psyke, 23, "strenuous work has a bounded extra cost");
  assert.equal(exhausted.meters.handlingsrom, 44, "joint low capacity has modest practical effect");
  assert.match(result.konsekvensTekst, /Lite energi/);
  assert.match(exhausted.arkiv.at(-1).konsekvensTekst, /handlingsrom/);
  assert.match(R.capacityWarning(exhausted), /Lav energi og lite psykisk overskudd/);

  const better = S.createInitialState(content);
  better.meters.energi = 18;
  better.meters.psyke = 24;
  R.applyChoice(better, content, "apning_01_forste_okt", "aapne_raskt");
  assert.equal(better.meters.psyke, 24, "brief low-effort work must not incur extra strain");
  assert.equal(better.meters.handlingsrom, 45, "only justified extra effects may apply");
});
test("a night's recovery is gradual, idempotent and can be saved", () => {
  const content = pack("ekspeditor");
  const state = S.createInitialState(content);
  finishDay(state, content);
  const night = state.meters.energi;
  const beforeDay = state.livsdag;
  R.startNextDay(state, content);
  assert.equal(state.livsdag, beforeDay + 1);
  assert.equal(state.meters.energi, Math.max(night, Math.min(85, night + 8)));
  assert.deepEqual(clone(state).meters, state.meters, "metrics persist without hidden recalculation");
  assert.throws(() => R.startNextDay(state, content), /ikke ferdig/,
    "repeated next-day requests must not grant extra recovery");
});
test("low-capacity work creates authored, delayed consequences on day three", () => {
  const content = pack("ekspeditor");
  const state = S.createInitialState(content);
  // Earn low capacity through actual authored decisions: skip breakfast and
  // the lunch break during a full shift, rather than injecting a meter value.
  finishDay(state, content, scene =>
    ["privat_morgen_start", "lunsj_01_pausen"].includes(scene.id)
      ? scene.valg.at(-1).id : scene.valg[0].id);
  R.startNextDay(state, content);
  assert.ok(state.meters.energi <= 60,
    "skipping meals and rest during a complete shift led to meaningful fatigue");
  const fatigue = R.selectNextScene(state, content);
  assert.equal(fatigue?.id, "d2_morgen_vaktpress_etter_stenging");
  R.applyChoice(state, content, fatigue.id, "press_videre");
  assert.equal(state.tidligereValg.ekspeditor_presset_videre_d2, true);
  finishDay(state, content);
  R.startNextDay(state, content);
  let outcome = null, guard = 0;
  while (!state.dagFerdig && !outcome) {
    const scene = R.selectNextScene(state, content);
    if (scene?.id === "d3_ettermiddag_presset_sitter") {
      outcome = scene;
      break;
    }
    if (scene) R.applyChoice(state, content, scene.id, scene.valg[0].id);
    else R.advance(state, content);
    assert.ok(++guard < 100, "the later consequence must be reachable");
  }
  assert.ok(outcome, "overwork returns as a specific later event");
  const fresh = clone(state);
  const other = content.scenes.find(s => s.id === "d3_ettermiddag_pause_virket");
  assert.equal(R.conditionsMet(state, other), false, "no pause was fabricated");
  R.applyChoice(state, content, outcome.id, "si_fra_nu");
  assert.ok(state.arkiv.some(x => x.sceneId === outcome.id));
  assert.equal(state.tidligereValg.ekspeditor_brøt_pressmønster, true);
  assert.equal(state.threadState.arbeidsrytme_og_overskudd.status, "completed");
  assert.notDeepEqual(state.meters, fresh.meters, "later relief changes actual state");
});
test("wellbeing and integrity follow the person through job changes", () => {
  const shop = pack("ekspeditor");
  const cleaning = pack("renholder");
  let s = S.createInitialState(shop);
  s.meters.energi = 17;
  s.meters.psyke = 29;
  s.meters.integritet = 37;
  s.meters.synlighet = 78;
  s.meters.handlingsrom = 13;
  s = S.selectRole(clone(s), cleaning);
  assert.equal(s.meters.energi, 17);
  assert.equal(s.meters.psyke, 29);
  assert.equal(s.meters.integritet, 37);
  assert.equal(s.meters.synlighet, cleaning.role.startState.meters.synlighet,
    "public visibility remains specific to the new job");
  assert.equal(s.meters.handlingsrom, cleaning.role.startState.meters.handlingsrom);
  assert.equal(s.dagStartMeters.energi, 17);
  s.meters.energi = 12;
  s = S.selectRole(clone(s), shop);
  assert.equal(s.meters.energi, 12, "returning to an old job cannot reset fatigue");
  assert.equal(s.meters.psyke, 29);
  assert.equal(s.meters.integritet, 37);
  assert.equal(s.meters.synlighet, 78, "the old job keeps its own reputation");
  assert.equal(s.rolleBytter.length, 2);
});
test("fresh-player fourteen-day acceptance exposes genuine unlock gate", () => {
  // This is an acceptance DIAGNOSTIC, not a fake proof of a complete 14-day
  // browser journey. In particular it cannot award a History Go badge,
  // switch jobs, mint money or inject a life-position role.
  const content = pack("arbeidsledig");
  let state = S.createInitialState(content);
  let days = 0, blocked = false;
  while (state.livsdag <= 14) {
    finishDay(state, content);
    days++;
    const snapshot = clone(state);
    assert.deepEqual(snapshot.arkiv, state.arkiv, "all authored decisions survive JSON reload");
    assert.ok(!state.rolleBytter.length, "no simulated employment transition");
    if (state.livsdag === 14) break;
    const eligible = (content.role.symposium?.fortsettelser || [])
      .filter(next => R.canStartContinuation(state, content, next));
    assert.deepEqual(eligible, [], "no unearned role or chapter may be unlocked");
    try { R.startNextDay(state, content); }
    catch (error) {
      assert.match(String(error.message), /neste kapittel/);
      blocked = true;
      break;
    }
    assert.ok(days < 15, "finite organic journey");
  }
  assert.ok(days >= 7 && days <= 14, "the real seven-day starting story is playable");
  assert.ok(blocked || state.livsdag === 14, "the gate must be reported, not bypassed");
  // Blocked means the complete organic, cross-app fourteen-day acceptance
  // test remains outstanding until genuine History Go progression is tested.
  console.log("Civication fresh-player acceptance probe", {
    completedStoryDays: days, fourteenDayAcceptanceProven: !blocked && days === 14,
    requiresGenuineHistoryGoUnlock: blocked
  });
});
