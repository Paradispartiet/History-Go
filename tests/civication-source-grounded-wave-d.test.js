#!/usr/bin/env node
// Wave D: 34 authored consequences of 34 distinct Wave C decisions, in existing Life Story.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../js/Civication/lifestory/lifestoryContent");
const S = require("../js/Civication/lifestory/lifestoryState");
const R = require("../js/Civication/lifestory/lifestoryRunner");
const root = path.join(__dirname, "..");
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH);
const bindings = read("data/Civication/lifestory/editorial/inspiration/waveAFourthInstallmentsV1.json");
const third = read("data/Civication/lifestory/editorial/inspiration/waveAThirdInstallmentsV1.json");
const seen = new Set();

function base(roleId) {
  const e = manifest.roles[roleId];
  assert.ok(e);
  return C.buildContent({ role: read(e.role), roleThreads: read(e.threads),
    roleScenes: read(e.scenes), phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) });
}

function fullPackage(storyId) {
  const workRoles = { C06: "arealplanlegger", C17: "renholder" };
  let content = base(workRoles[storyId] || "arbeidsledig");
  const continuations = {
    C02: ["musikk_med_mira"],
    C03: ["sideprosjekt_med_lea", "sideprosjekt_neste_steg"],
    C07: ["miljo_med_arvid", "miljo_navnet_ditt"],
    C23: ["sideprosjekt_med_lea", "sideprosjekt_neste_steg", "sideprosjekt_etter_neste_steg"]
  }[storyId] || [];
  for (const id of continuations) {
    const entry = content.role.symposium.fortsettelser.find(row => row.id === id);
    assert.ok(entry, "declared continuation " + id);
    content = C.appendContinuation(content, read(entry.path));
  }
  if (content.fortsettelse) {
    const bridge = content.role.symposium.rollebroer.find(row =>
      row.role_scope === content.fortsettelse.role_scope);
    assert.ok(bridge);
    globalThis.CivicationLifePositions = { getLifeContext: () => ({
      primary_life_position: { badge_id: bridge.badge_id, label: bridge.navn }
    }) };
  } else {
    delete globalThis.CivicationLifePositions;
  }
  return content;
}

function producerFor(content, flag, value) {
  return content.scenes.flatMap(scene =>
    (scene.valg || []).map(choice => ({ scene, choice }))
  ).find(row => row.choice.effekter?.flagg?.[flag] === value);
}
function activateThreads(state, content, day) {
  for (const thread of content.threads) {
    if (thread.startDag <= day && thread.startVedValg !== true && !state.threadState[thread.id]) {
      state.threadState[thread.id] = { status: "active", step: 0, lastSceneId: null };
    }
  }
}
function playRoute(content, record, child, chosen) {
  const parent = content.scenes.find(s => s.id === record.after_scene);
  assert.ok(parent, record.after_scene);
  const priorChoice = parent.valg.find(v => v.id === record.after_choice);
  assert.ok(priorChoice);
  assert.match(parent.id, /^wave_c_/);
  assert.ok(child.dag >= parent.dag);
  assert.deepEqual(child.conditions?.flagg, record.after_flag);
  const pairs = Object.entries(record.after_flag);
  assert.equal(pairs.length, 1, "one causal Wave C outcome");
  const [key, value] = pairs[0];
  assert.equal(priorChoice.effekter?.flagg?.[key], value);

  const state = S.createInitialState(content);
  state.dag = parent.dag; state.livsdag = parent.dag; state.fase = parent.fase;
  state.dagFerdig = false; activateThreads(state, content, parent.dag);
  for (const [requiredFlag, requiredValue] of Object.entries(parent.conditions?.flagg || {})) {
    const origin = producerFor(content, requiredFlag, requiredValue);
    assert.ok(origin && /^wave_b_/.test(origin.scene.id), "authored Wave B prerequisite");
    state.tidligereValg[requiredFlag] = requiredValue;
  }
  assert.ok(R.getCandidateScenes(state, content).some(s => s.id === parent.id),
    "Wave C parent is available");
  assert.ok(!R.getCandidateScenes(state, content).some(s => s.id === child.id),
    "Wave D cannot predate Wave C decision");
  R.applyChoice(state, content, parent.id, priorChoice.id);
  assert.equal(state.tidligereValg[key], value, "Wave C choice is written by runner");

  // For a next-day child, move only the synthetic test clock to that authored
  // boundary. This does NOT claim the full intervening day was played.
  state.dag = child.dag; state.livsdag = child.dag; state.fase = child.fase;
  state.dagFerdig = false; activateThreads(state, content, child.dag);
  const matched = R.getCandidateScenes(state, content).filter(s =>
    s.id.startsWith("wave_d_") && s.threadId === child.threadId);
  assert.deepEqual(matched.map(s => s.id), [child.id],
    "exactly the authored choice-specific consequence is available");
  const before = clone(state.arkiv), money = state.meters.penger;
  assert.throws(() => R.applyChoice(state, content, child.id, "__invalid__"));
  R.applyChoice(state, content, child.id, chosen.id);
  assert.equal(state.meters.penger, money, "no imaginary payment or benefit");
  assert.deepEqual(state.arkiv.slice(0, before.length), before);
  assert.equal(state.arkiv.filter(e => e.sceneId === child.id).length, 1);
  for (const [flag, nextValue] of Object.entries(chosen.effekter?.flagg || {})) {
    assert.match(flag, /^wa_d_/);
    assert.equal(state.tidligereValg[flag], nextValue);
  }
  assert.throws(() => R.applyChoice(state, content, child.id, chosen.id),
    "cannot answer a consequence twice");
  const restored = clone(state);
  S.reconcileContent(restored, content);
  assert.deepEqual(restored.arkiv, state.arkiv, "reload does not invent or lose messages");
  seen.add(child.id + "/" + chosen.id);
}

test("Wave D: 8 stories, 34 consequences, 68 choices and intact source links", () => {
  assert.deepEqual(bindings.stories.map(s => s.story_type_id).sort(),
    ["C01","C02","C03","C05","C06","C07","C17","C23"]);
  let count = 0, choices = 0;
  for (const record of bindings.stories) {
    const thirdStory = third.stories.find(x => x.story_type_id === record.story_type_id);
    assert.ok(thirdStory);
    assert.deepEqual(record.work_ids, thirdStory.work_ids,
      "Goodreads/IMDb/Film Producer links preserved");
    assert.deepEqual(record.problem_ids, thirdStory.problem_ids);
    const content = fullPackage(record.story_type_id);
    const all = read(record.runtime_path).scenes.filter(s =>
      s.id.startsWith("wave_d_" + record.story_type_id.toLowerCase() + "_"));
    assert.deepEqual(all.map(s => s.id), record.scene_ids);
    for (const scene of all) {
      const entry = record.entry_conditions.find(e => e.scene_id === scene.id);
      assert.ok(entry);
      assert.equal(scene.threadId, record.thread_ids[0]);
      assert.ok(content.threads.some(t => t.id === scene.threadId));
      assert.equal(scene.tilgjengelighet, "start");
      assert.equal(scene.valg.length, 2);
      assert.equal(scene.dag, entry.day);
      for (const choice of scene.valg) {
        playRoute(content, entry, scene, choice);
        choices++;
      }
      count++;
    }
  }
  assert.equal(count, 34);
  assert.equal(choices, 68);
  assert.equal(seen.size, 68);
  assert.equal(bindings.verification.expected_total_scenes,
    bindings.verification.prior_scenes + count);
  assert.equal(bindings.verification.expected_total_choices,
    bindings.verification.prior_choices + choices);
});

test("old saves do not acquire Wave D memories during reconciliation", () => {
  const content = base("arbeidsledig"), saved = S.createInitialState(content);
  saved.dag = 7; saved.fase = "kveld";
  const original = clone(saved.arkiv);
  S.reconcileContent(saved, content);
  assert.deepEqual(saved.arkiv, original);
  assert.ok(!saved.spilteScener.some(id => id.startsWith("wave_d_")));
  assert.ok(!Object.keys(saved.tidligereValg).some(id => id.startsWith("wa_d_")));
});
