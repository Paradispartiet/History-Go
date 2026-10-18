#!/usr/bin/env node
// Third content installment: validate canonical packages and execute each
// added branch through the EXISTING Life Story runner. This is not a browser
// walkthrough or an artificial advance of the player's real saved days.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../js/Civication/lifestory/lifestoryContent");
const S = require("../js/Civication/lifestory/lifestoryState");
const R = require("../js/Civication/lifestory/lifestoryRunner");
const root = path.join(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const copy = v => JSON.parse(JSON.stringify(v));
const manifest = read(C.MANIFEST_PATH);
const bindings = read("data/Civication/lifestory/editorial/inspiration/waveAThirdInstallmentsV1.json");
const seen = new Set();

function base(roleId) {
  const entry = manifest.roles[roleId];
  assert.ok(entry, "manifest role " + roleId);
  return C.buildContent({
    role: read(entry.role),
    roleThreads: read(entry.threads),
    roleScenes: read(entry.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes)
  });
}

function fullPackage(storyId) {
  const workRoles = { C06: "arealplanlegger", C17: "renholder" };
  let content = base(workRoles[storyId] || "arbeidsledig");
  const chapters = {
    C02: ["musikk_med_mira"],
    C03: ["sideprosjekt_med_lea", "sideprosjekt_neste_steg"],
    C07: ["miljo_med_arvid", "miljo_navnet_ditt"],
    C23: ["sideprosjekt_med_lea", "sideprosjekt_neste_steg", "sideprosjekt_etter_neste_steg"]
  }[storyId] || [];
  for (const id of chapters) {
    const entry = content.role.symposium.fortsettelser.find(row => row.id === id);
    assert.ok(entry, "real declared chapter " + id);
    content = C.appendContinuation(content, read(entry.path));
  }
  if (content.fortsettelse) {
    const bridge = content.role.symposium.rollebroer.find(
      row => row.role_scope === content.fortsettelse.role_scope
    );
    assert.ok(bridge, "badge-bound continuation");
    globalThis.CivicationLifePositions = {
      getLifeContext: () => ({ primary_life_position: { badge_id: bridge.badge_id, label: bridge.navn } })
    };
  } else {
    delete globalThis.CivicationLifePositions;
  }
  return content;
}

function sourceChoice(content, key, value) {
  return content.scenes.flatMap(scene => (scene.valg || []).map(choice => ({ scene, choice })))
    .find(({ choice }) => Object.prototype.hasOwnProperty.call(choice.effekter?.flagg || {}, key) &&
      choice.effekter.flagg[key] === value);
}

function testBranch(content, child, choice) {
  const required = Object.entries(child.conditions?.flagg || {});
  assert.equal(required.length, 1, child.id + " has one causal predecessor");
  const [flag, value] = required[0];
  const producer = sourceChoice(content, flag, value);
  assert.ok(producer, "previous authored choice creates " + flag + "=" + value);
  assert.match(producer.scene.id, /^wave_b_/, "Wave C is triggered by Wave B");
  assert.equal(producer.scene.dag, child.dag, "predecessor is on same story day");
  assert.equal(producer.scene.fase, child.fase, "predecessor is in same day phase");

  const state = S.createInitialState(content);
  state.dag = producer.scene.dag;
  state.livsdag = producer.scene.dag;
  state.fase = producer.scene.fase;
  state.dagFerdig = false;
  // Synthetic boundary snapshot only: predecessor prerequisites are verified
  // against authored choices, NOT guessed and saved as fictitious history.
  for (const thread of content.threads) {
    if (thread.startDag <= state.dag && !state.threadState[thread.id])
      state.threadState[thread.id] = { status: "active", step: 0, lastSceneId: null };
  }
  for (const [parentFlag, parentValue] of Object.entries(producer.scene.conditions?.flagg || {})) {
    assert.ok(sourceChoice(content, parentFlag, parentValue),
      "parent prerequisite has a real authored source: " + parentFlag);
    state.tidligereValg[parentFlag] = parentValue;
  }
  const before = copy(state.arkiv);
  assert.ok(R.getCandidateScenes(state, content).some(row => row.id === producer.scene.id),
    "Wave B parent is a real candidate: " + producer.scene.id);
  assert.ok(!R.getCandidateScenes(state, content).some(row => row.id === child.id),
    "Wave C must not run before the previous choice: " + child.id);
  R.applyChoice(state, content, producer.scene.id, producer.choice.id);
  assert.equal(state.tidligereValg[flag], value);
  assert.ok(R.getCandidateScenes(state, content).some(row => row.id === child.id),
    "Wave C unlocked by actual choice: " + child.id);
  assert.throws(() => R.applyChoice(state, content, child.id, "__bad_choice__"));
  const money = state.meters.penger;
  const priorArchive = copy(state.arkiv);
  const result = R.applyChoice(state, content, child.id, choice.id);
  assert.ok(result?.state);
  assert.equal(state.meters.penger, money, "no implied payment/income");
  assert.deepEqual(state.arkiv.slice(0, priorArchive.length), priorArchive);
  assert.equal(state.arkiv.filter(entry => entry.sceneId === child.id).length, 1);
  for (const [key, value] of Object.entries(choice.effekter.flagg || {})) {
    assert.match(key, /^wa_c_/);
    assert.equal(state.tidligereValg[key], value);
  }
  assert.throws(() => R.applyChoice(state, content, child.id, choice.id),
    "repeat reply cannot duplicate one story");
  assert.equal(state.arkiv.length, before.length + 2);
  const restored = copy(state);
  S.reconcileContent(restored, content);
  assert.deepEqual(restored.arkiv, state.arkiv, "reloading never invents choices");
  seen.add(child.id + "/" + choice.id);
}

test("eight stories, 17 real third-wave scenes and 34 choices", () => {
  assert.equal(bindings.stories.length, 8);
  const expected = ["C01", "C02", "C03", "C05", "C06", "C07", "C17", "C23"];
  assert.deepEqual(bindings.stories.map(s => s.story_type_id).sort(), expected);
  let count = 0, choices = 0;
  const sources = read("data/Civication/lifestory/editorial/inspiration/waveAChapterBindingsV1.json");
  for (const binding of bindings.stories) {
    const original = sources.stories.find(s => s.story_type_id === binding.story_type_id);
    assert.ok(original && binding.work_ids.join("|") === original.work_ids.join("|"),
      "Goodreads/IMDb/Film Producer source binding is preserved");
    const content = fullPackage(binding.story_type_id);
    const authored = read(binding.runtime_path).scenes.filter(s => s.id.startsWith("wave_c_" + binding.story_type_id.toLowerCase() + "_"));
    assert.deepEqual(authored.map(s => s.id), binding.scene_ids);
    const threadIds = new Set(content.threads.map(t => t.id));
    for (const child of authored) {
      assert.ok(threadIds.has(child.threadId), "registered story thread " + child.threadId);
      assert.equal(child.valg.length, 2);
      assert.equal(child.tilgjengelighet, "start");
      assert.deepEqual(binding.entry_conditions.find(v => v.scene_id === child.id)?.after_flag,
        child.conditions.flagg);
      for (const choice of child.valg) {
        count += 0;
        choices++;
        testBranch(content, child, choice);
      }
      count++;
    }
  }
  assert.equal(count, 17);
  assert.equal(choices, 34);
  assert.equal(seen.size, 34);
  assert.equal(bindings.verification.expected_total_scenes, 74 + count);
  assert.equal(bindings.verification.expected_total_choices, 148 + choices);
});

test("legacy saves do not acquire retroactive third-wave memories", () => {
  const content = base("arbeidsledig");
  const state = S.createInitialState(content);
  state.dag = 7;
  state.fase = "kveld";
  const before = copy(state.arkiv);
  S.reconcileContent(state, content);
  assert.deepEqual(state.arkiv, before);
  assert.ok(!Object.keys(state.tidligereValg).some(k => k.startsWith("wa_c_")));
  assert.ok(!state.spilteScener.some(k => k.startsWith("wave_c_")));
});
