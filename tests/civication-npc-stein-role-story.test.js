#!/usr/bin/env node
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const sources = [
  "js/Civication/systems/civicationActorRoleContract.js",
  "js/Civication/systems/civicationNPCs.js",
  "js/Civication/systems/civicationSceneInteraction.js",
  "js/Civication/systems/day/dayChoiceDirector.js",
  "js/Civication/systems/day/dayNpcCharacterThreads.js",
  "js/Civication/systems/civicationNarrativeSceneSource.js"
];
const index = JSON.parse(read("data/Civication/roleWorlds/index.json"));
const npcs = JSON.parse(read("data/Civication/npcs/naeringsliv.json"));
const stream = JSON.parse(read("data/Civication/narratives/work/naeringsliv/stein_role_change.json"));
const frodeStream = JSON.parse(read("data/Civication/narratives/work/naeringsliv/frode_role_change.json"));
const ingerStream = JSON.parse(read("data/Civication/narratives/work/naeringsliv/inger_role_change.json"));
const manifest = JSON.parse(read("data/Civication/narratives/manifest.json"));
const editorialMatrix = JSON.parse(read("data/Civication/narratives/editorial/npcRoleStoryMatrixV1.json"));
const literaryCrosswalk = JSON.parse(read("data/Civication/lifestory/editorial/narrativeCrosswalkV1.json"));
const STORE_KEY = "hg_civi_npc_character_threads_v1";
const STEIN = "stein_peer_mellomleder";
const roleChanged = "stein_role_story:confirmed_appointment";
const dataPaths = new Map([
  ["data/Civication/roleWorlds/index.json", index],
  ["data/Civication/npcs/naeringsliv.json", npcs],
  ["data/Civication/narratives/manifest.json", manifest],
  ["data/Civication/narratives/work/naeringsliv/stein_role_change.json", stream],
  ["data/Civication/narratives/work/naeringsliv/frode_role_change.json", frodeStream],
  ["data/Civication/narratives/work/naeringsliv/inger_role_change.json", ingerStream]
]);

function setup(backing = new Map(), chosenStream = stream) {
  let pending = null;
  let baseCalls = 0;
  let workday = 0;
  const progress = {};
  const adapters = new Map();
  const storage = {
    getItem: key => backing.get(key) || null,
    setItem(key, value) { backing.set(key, String(value)); }
  };
  function MockEventEngine() {}
  MockEventEngine.prototype.getPendingEvent = () => pending ? { event: pending } : null;
  MockEventEngine.prototype.answer = async function (eventId, choiceId) {
    baseCalls += 1;
    if (!pending || pending.id !== eventId) return { ok: false, reason: "not_found" };
    if (!pending.choices.some(c => c.id === choiceId)) return { ok: false, reason: "bad_choice" };
    return { ok: true };
  };
  const window = {
    DEBUG: false, addEventListener() {}, dispatchEvent() {},
    CivicationEventEngine: MockEventEngine,
    CivicationSceneCatalog: {
      registerSourceAdapter(name, adapter) { adapters.set(name, adapter); return true; },
      getSourceAdapter(name) { return adapters.get(name); }
    },
    CivicationState: {
      getState() { return {}; },
      getActivePosition() { return { career_id: "fagarbeider", role_key: "fagarbeider" }; }
    },
    CivicationCareerRoleResolver: { resolveCareerRoleScope: () => "fagarbeider" },
    CivicationWorkdayRuntime: { getWorkdayDayIndex: () => workday }
  };
  window.window = window;
  const context = vm.createContext({
    window, document: { readyState: "complete", addEventListener() {} },
    localStorage: storage,
    Event: class Event { constructor(type) { this.type = type; } },
    fetch: async url => {
      if (!dataPaths.has(url)) throw new Error("Unknown path " + url);
      return { ok: true, json: async () => dataPaths.get(url) };
    },
    console
  });
  for (const source of sources) vm.runInContext(read(source), context, { filename: source });
  const source = window.CivicationNarrativeSceneSource;
  const used = [];
  const flags = [];
  async function scene() {
    const available = await source.sourceAdapter.getScenes({
      mode: "slot", phaseId: "forenoon", phase: { id: "forenoon" },
      active: { role_key: "fagarbeider" }, state: {},
      candidate_stream_ids: [chosenStream.id],
      used_storylet_keys: used.map(id => chosenStream.id + "::" + id),
      narrativeState: { active_streams: [chosenStream.id], flags, stream_progress: progress },
      date: "2026-10-13", ordinal: used.length + 1
    });
    if (!available.length) return null;
    return { ...available[0], scene_source_adapter: "narrative", scene_catalog_owner: "CivicationSceneCatalog" };
  }
  const engine = new MockEventEngine();
  async function answer(event, choiceId) {
    pending = event;
    const result = await engine.answer(event.id, choiceId);
    if (result.ok) {
      used.push(event.narrative_storylet_id);
      progress[chosenStream.id + "::" + event.narrative_storylet_id] = {
        answered: true, answered_workday_day: workday
      };
      const sourceStory = chosenStream.storylets.find(s => s.id === event.narrative_storylet_id);
      flags.push(...(sourceStory.adds_flags || []), ...(event.choices.find(c => c.id === choiceId)?.tags || []));
    }
    return result;
  }
  return { window, backing, engine, scene, answer, used, flags, progress,
    advanceWorkdays(n = 1) { workday += n; },
    baseCalls: () => baseCalls };
}

test("Stein is authored in canonical narrative manifest and has four gated scenes", () => {
  assert(manifest.streams.some(x => x.id === stream.id && x.path.endsWith("stein_role_change.json")));
  assert.equal(stream.schema, "civication_narrative_stream_v1");
  assert.deepEqual(stream.storylets.map(x => x.id), [
    "stein_peer_priority", "stein_job_opening", "stein_confirmed_appointment", "stein_new_role_followup"
  ]);
  assert(stream.storylets.every(x => x.npc_story?.npc_id === STEIN));
  assert.equal(stream.storylets[2].npc_story.role_transition.from, "naeringsliv/mellomleder");
  assert.equal(stream.storylets[2].npc_story.role_transition.to, "naeringsliv/avdelingsleder");
});

test("A real choice passes ChoiceDirector, preserves Stein and changes role once", async () => {
  const h = setup();
  let stage = await h.scene();
  assert.equal(stage.narrative_storylet_id, "stein_peer_priority");
  assert.equal(stage.scene_source_adapter, "narrative");
  let result = await h.answer(stage, "A");
  assert.equal(result.ok, true);
  assert.equal(h.window.CivicationNpcCharacterThreads.getState().characters[STEIN].trust_score, 2);
  const stateBefore = h.window.CivicationNpcCharacterThreads.getState().characters[STEIN];
  assert.equal(stateBefore.name, "Stein Mæland");
  assert.equal(stateBefore.role_history, undefined);

  assert.equal(await h.scene(), null, "next chapter must not appear on the same workday");
  h.advanceWorkdays(1);
  stage = await h.scene();
  assert.equal(stage.narrative_storylet_id, "stein_job_opening");
  result = await h.answer(stage, "A");
  assert.equal(result.ok, true);
  assert.equal(h.window.CivicationNpcCharacterThreads.getState().characters[STEIN].trust_score, 3);

  assert.equal(await h.scene(), null, "appointment cannot happen on the same day as the opening");
  h.advanceWorkdays(1);
  assert.equal(await h.scene(), null, "appointment requires two completed workdays");
  h.advanceWorkdays(1);
  stage = await h.scene();
  assert.equal(stage.narrative_storylet_id, "stein_confirmed_appointment");
  result = await h.answer(stage, "A");
  assert.equal(result.ok, true);
  const handler = result.choice_director.handler_results.find(row => row.name === "npc_character_story");
  assert.equal(handler.ok, true);
  assert.equal(handler.value.role_scope, "avdelingsleder");

  const stored = h.window.CivicationNpcCharacterThreads.getState().characters[STEIN];
  assert.equal(stored.name, "Stein Mæland");
  assert.equal(stored.role, "Mellomleder, naboavdeling", "original social label survives role transition");
  assert.equal(stored.role_history.length, 1);
  assert.equal(stored.role_history[0].event_id, roleChanged);
  assert.equal(stored.role_history[0].from, "naeringsliv/mellomleder");
  assert.equal(stored.role_history[0].to, "naeringsliv/avdelingsleder");
  assert.equal(stored.beats.length, 3);
  assert.equal(stored.trust_score, 4);
  assert.deepEqual([...h.backing.keys()], [STORE_KEY]);
  for (const field of ["salary", "employment", "account_id", "history_people", "canonical_person_id"]) {
    assert.equal(stored[field], undefined);
  }

  const retry = await h.engine.answer(stage.id, "B");
  assert.equal(retry.ok, true, "a replay with a different choice must not grant another beat");
  const afterRetry = h.window.CivicationNpcCharacterThreads.getState().characters[STEIN];
  assert.equal(afterRetry.role_history.length, 1);
  assert.equal(afterRetry.beats.length, 3);
  assert.equal(afterRetry.trust_score, 4);

  assert.equal(await h.scene(), null, "followup cannot occur immediately after appointment");
  h.advanceWorkdays(1);
  const meeting = await h.scene();
  assert.equal(meeting.narrative_storylet_id, "stein_new_role_followup");
  assert(meeting.situation.some(x => x.includes("samme ærlighet")));
  const final = await h.answer(meeting, "B");
  assert.equal(final.ok, true);
  const done = h.window.CivicationNpcCharacterThreads.getState().characters[STEIN];
  assert.equal(done.role_history.length, 1);
  assert.equal(done.trust_score, 3);
  assert.equal(done.beats.length, 4);
});

test("Later scene is gated on an actual recorded role, not just flags", async () => {
  const h = setup();
  h.used.push("stein_peer_priority", "stein_job_opening", "stein_confirmed_appointment");
  h.flags.push("stein_role_stage1", "stein_role_stage2", "stein_role_stage3");
  for (let i = 0; i < 3; i += 1) {
    h.progress[stream.id + "::" + stream.storylets[i].id] = {
      answered: true, answered_workday_day: i === 2 ? 3 : i
    };
  }
  h.advanceWorkdays(4);
  assert.equal(await h.scene(), null);
  assert.equal(h.backing.size, 0);
});

test("Low trust produces a different remembered reply and a successful role event survives reload", async () => {
  const backing = new Map();
  const h = setup(backing);
  for (let i = 0; i < 3; i += 1) {
    const event = await h.scene();
    assert(event);
    const result = await h.answer(event, "B");
    assert.equal(result.ok, true);
    h.advanceWorkdays(i === 1 ? 2 : 1);
  }
  const meeting = await h.scene();
  assert(meeting.situation.some(x => x.includes("Vi har ikke vært enige")));
  const resumed = setup(backing);
  const actor = await resumed.window.CivicationNPCs.resolveActor(STEIN);
  assert.equal(actor.actor_id, "npc:" + STEIN);
  assert.equal(actor.role_ref.role_scope, "avdelingsleder");
  assert.equal(actor.role_history.length, 1);
  assert.equal(resumed.window.CivicationNpcCharacterThreads.getState().characters[STEIN].trust_score, -4);
});

test("Rejected/invalid answers never write NPC role events or trust", async () => {
  const h = setup();
  const stage = await h.scene();
  const blocked = await h.engine.answer(stage.id, "A");
  assert.equal(blocked.ok, false);
  const invalid = await h.answer(stage, "WRONG");
  assert.equal(invalid.ok, false);
  assert.equal(h.backing.size, 0);
  assert.equal(h.used.length, 0);
});

test("Frode and Inger retain identity through their own delayed role outcomes", async () => {
  const scenarios = [
    { stream: frodeStream, id: "frode_formann", name: "Frode Aas", from: "formann",
      to: "mellomleder", event: "frode_role_story:confirmed_appointment" },
    { stream: ingerStream, id: "inger_avdelingsleder", name: "Inger Holm",
      from: "avdelingsleder", to: "mellomleder",
      event: "inger_role_story:confirmed_reorganization" }
  ];
  for (const expected of scenarios) {
    assert(manifest.streams.some(x => x.id === expected.stream.id),
      "Narrative must be registered in canonical manifest");
    assert.equal(expected.stream.storylets.length, 4);
    assert(expected.stream.storylets.every(x => x.npc_story?.npc_id === expected.id));
    assert.equal(expected.stream.storylets[2].npc_story.role_transition.from,
      "naeringsliv/" + expected.from);
    assert.equal(expected.stream.storylets[2].npc_story.role_transition.to,
      "naeringsliv/" + expected.to);

    const h = setup(new Map(), expected.stream);
    for (let stage = 0; stage < 4; stage += 1) {
      const event = await h.scene();
      assert(event, "Expected available stage " + stage + " for " + expected.id);
      assert.equal(event.narrative_storylet_id, expected.stream.storylets[stage].id);
      assert.equal(event.npc_story.npc_id, expected.id);
      const result = await h.answer(event, stage < 3 ? "B" : "A");
      assert.equal(result.ok, true);
      if (stage < 3) {
        assert.equal(await h.scene(), null, "Workday gap must be enforced");
        h.advanceWorkdays(stage === 1 ? 2 : 1);
      }
      if (stage === 2) {
        const handler = result.choice_director.handler_results.find(x => x.name === "npc_character_story");
        assert.equal(handler.ok, true);
        assert.equal(handler.value.role_scope, expected.to);
      }
    }
    const record = h.window.CivicationNpcCharacterThreads.getState().characters[expected.id];
    assert.equal(record.name, expected.name);
    assert.equal(record.role_history.length, 1);
    assert.equal(record.role_history[0].event_id, expected.event);
    assert.equal(record.role_history[0].from, "naeringsliv/" + expected.from);
    assert.equal(record.role_history[0].to, "naeringsliv/" + expected.to);
    assert.equal(record.beats.length, 4);
    assert.equal(record.trust_score, -3);
    assert.deepEqual([...h.backing.keys()], [STORE_KEY]);
    assert(!Object.hasOwn(record, "salary"), "No NPC story may allocate salary");
    const resumed = setup(h.backing, expected.stream);
    const actor = await resumed.window.CivicationNPCs.resolveActor(expected.id);
    assert.equal(actor.actor_id, "npc:" + expected.id);
    assert.equal(actor.role_ref.role_scope, expected.to);
    assert.equal(actor.role_history.length, 1);
    assert.equal((await resumed.window.CivicationNPCs.resolveActor(expected.id)).role_history.length, 1);
  }
});

test("Three NPC arcs and 12 chapters agree with their editorial matrix and literary candidates", () => {
  assert.equal(editorialMatrix.schema, "civication_npc_role_story_editorial_matrix_v1");
  assert.equal(editorialMatrix.editorial_only, true);
  assert.equal(editorialMatrix.stories.length, 3);
  const allStreams = [stream, frodeStream, ingerStream];
  const canonicalContemporaryIds = new Set(literaryCrosswalk.contemporaryTypes.map(c => c.id));
  let total = 0;
  for (const entry of editorialMatrix.stories) {
    const source = allStreams.find(x => x.id === entry.stream_id);
    assert(source, "Unknown stream " + entry.stream_id);
    assert(manifest.streams.some(x => x.id === entry.stream_id && x.path === entry.source_path));
    const npc = npcs.npcs.find(x => x.id === entry.npc_id);
    assert(npc && npc.role_ref, "Every narrative actor must have a fictional catalog role");
    assert.deepEqual(entry.player_role_scopes, source.applies_when.role_scopes);
    assert.deepEqual(entry.chapters.map(x => x.scene_id), source.storylets.map(x => x.id));
    assert.equal(entry.role_transition.from,
      npc.role_ref.category + "/" + npc.role_ref.role_scope);
    assert.equal(source.storylets[2].npc_story.role_transition.event_id, entry.role_transition.event_id);
    assert.equal(source.storylets[2].npc_story.role_transition.from, entry.role_transition.from);
    assert.equal(source.storylets[2].npc_story.role_transition.to, entry.role_transition.to);
    assert.equal(source.storylets[2].id, entry.role_transition.confirmation_chapter);
    for (const [i, chapter] of entry.chapters.entries()) {
      const authored = source.storylets[i];
      assert.equal(authored.npc_story.npc_id, entry.npc_id);
      assert(authored.choices.length >= 2);
      assert(authored.choices.every(c => c.npc_response && Number.isFinite(c.npc_response.trust_delta)));
      assert.equal(authored.npc_story.available_after?.min_workdays || 0,
        chapter.minimum_workdays_after_prior);
      if (chapter.role_required) assert.equal(authored.npc_story.requires_role_ref, chapter.role_required);
      total += 1;
    }
    assert(entry.narrative_crosswalk_candidates.c_story_ids.every(id => canonicalContemporaryIds.has(id)));
  }
  assert.equal(total, 12);
});
