#!/usr/bin/env node
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const json = p => JSON.parse(read(p));
const editorial = json("data/Civication/narratives/editorial/wholeLifeStoryBatchV1.json");
const manifest = json("data/Civication/narratives/manifest.json");
const sourceFiles = [
  "js/Civication/systems/civicationActorRoleContract.js",
  "js/Civication/systems/civicationNPCs.js",
  "js/Civication/systems/civicationSceneInteraction.js",
  "js/Civication/systems/day/dayChoiceDirector.js",
  "js/Civication/systems/day/dayNpcCharacterThreads.js",
  "js/Civication/systems/civicationNarrativeSceneSource.js",
  "js/Civication/systems/civicationDailyMailBuilder.js"
];
const sourceText = sourceFiles.map(p => [p, read(p)]);
const npcCatalog = json("data/Civication/npcs/naeringsliv.json");
const roleIndex = json("data/Civication/roleWorlds/index.json");
const workPaths = ["stein", "frode", "inger"].map(key =>
  "data/Civication/narratives/work/naeringsliv/" + key + "_role_change.json");
const workStreams = workPaths.map(json);
const drafts = editorial.arcs.map(arc => json(arc.source_path));
const data = new Map([
  ["data/Civication/roleWorlds/index.json", roleIndex],
  ["data/Civication/npcs/naeringsliv.json", npcCatalog],
  ...workPaths.map((p, i) => [p, workStreams[i]]),
  ...editorial.arcs.map((arc, i) => [arc.source_path, drafts[i]]),
  // Test-only registration: production manifest remains unchanged.
  ["data/Civication/narratives/manifest.json", {
    ...manifest, streams: [
      ...workPaths.map((p, i) => ({ path: p, id: workStreams[i].id })),
      ...editorial.arcs.map(arc => ({ path: arc.source_path, id: arc.stream_id }))
    ]
  }]
]);

function harness({ state = {}, backing = new Map(), day = 0 } = {}) {
  let pending = null;
  let workday = day;
  const adapters = new Map();
  function Engine() {}
  Engine.prototype.getPendingEvent = () => pending ? { event: pending } : null;
  Engine.prototype.answer = async (eventId, choiceId) => ({
    ok: !!pending && pending.id === eventId && pending.choices.some(c => c.id === choiceId)
  });
  const active = { career_id: "naeringsliv", role_key: "fagarbeider" };
  const window = {
    DEBUG: false, addEventListener() {}, dispatchEvent() {},
    CivicationEventEngine: Engine,
    CivicationState: {
      getState: () => state, getActivePosition: () => active,
      setState(patch) { Object.assign(state, patch); return state; }
    },
    CivicationCareerRoleResolver: { resolveCareerRoleScope: a => a?.role_key || "fagarbeider" },
    CivicationWorkdayRuntime: {
      getWorkdayDayIndex: () => workday,
      hasActiveJob: () => true, isWorkdayCompletedToday: () => true
    },
    CivicationSceneCatalog: {
      registerSourceAdapter(name, adapter) { adapters.set(name, adapter); return true; },
      getSourceAdapter(name) { return adapters.get(name); }
    }
  };
  window.window = window;
  const context = vm.createContext({
    window, document: { readyState: "complete", addEventListener() {} },
    localStorage: {
      getItem: key => backing.get(key) ?? null,
      setItem(key, value) { backing.set(key, String(value)); }
    },
    Event: class Event { constructor(type) { this.type = type; } },
    console, setTimeout, clearTimeout,
    fetch: async url => ({
      ok: data.has(url), json: async () => data.get(url)
    })
  });
  for (const [filename, text] of sourceText) vm.runInContext(text, context, { filename });
  const engine = new Engine();
  async function scene(streamId, phase = "evening") {
    const scenes = await window.CivicationNarrativeSceneSource.sourceAdapter.getScenes({
      mode: "slot", phaseId: phase, phase: { id: phase }, active, state,
      candidate_stream_ids: [streamId],
      narrativeState: state.narrative_state_v1 || { flags: [], stream_progress: {}, active_streams: [] },
      used_storylet_keys: [], date: "2026-10-14", ordinal: workday
    });
    if (!scenes.length) return null;
    return { ...scenes[0], scene_source_adapter: "narrative", scene_catalog_owner: "CivicationSceneCatalog" };
  }
  async function answer(event, choiceId) {
    pending = event;
    state.mail_day_runtime_v1 = {
      date: "2026-10-14", items: [{ phase: event.phase_tag, status: "pending", event }]
    };
    const result = await engine.answer(event.id, choiceId);
    pending = null;
    return result;
  }
  return { window, state, backing, active, scene, answer,
    day: () => workday, advance: (gap = 1) => { workday += gap; } };
}

async function enter(arcIndex) {
  const h = harness();
  const work = workStreams[arcIndex];
  for (let chapter = 0; chapter < 4; chapter++) {
    const event = await h.scene(work.id, "forenoon");
    assert(event, "Existing work chapter is reachable");
    assert.equal((await h.answer(event, "A")).ok, true);
    h.advance(chapter === 1 ? 2 : 1);
  }
  assert(h.state.narrative_state_v1.flags.includes(editorial.arcs[arcIndex].entry_flag));
  return h;
}

test("Draft scope is explicit; all existing catalog characters and 24 story types are accounted for", () => {
  assert.equal(editorial.status, "authored_not_registered");
  assert.deepEqual(editorial.character_archetypes.map(x => x.npc_id).sort(),
    npcCatalog.npcs.map(x => x.id).sort());
  const social = json("data/Civication/social/characters.json");
  assert.deepEqual(editorial.social_archetypes.map(x => x.character_id).sort(),
    Object.keys(social.characters).sort());
  const crosswalk = json("data/Civication/lifestory/editorial/narrativeCrosswalkV1.json");
  assert.deepEqual(editorial.story_type_coverage.map(x => x.id),
    crosswalk.contemporaryTypes.map(x => x.id));
  for (const [i, arc] of editorial.arcs.entries()) {
    assert(!manifest.streams.some(s => s.id === arc.stream_id || s.path === arc.source_path),
      "Private drafts must not be deployed before the day-rhythm blocker is resolved");
    assert.deepEqual(arc.chapter_scene_ids.flatMap(x => x.scene_ids),
      drafts[i].storylets.map(x => x.id));
    assert.equal(drafts[i].storylets.length, 9);
    assert(drafts[i].storylets.every(s => s.choices.length === 2 &&
      s.choices.every(c => c.effect === 0 && c.feedback && c.npc_response?.line)));
  }
});

for (const [arcIndex, arc] of editorial.arcs.entries()) {
  test(arc.stream_id + ": all 64 six-chapter paths use actual source, answer and narrative-state owners", async () => {
    const visited = new Set();
    for (let mask = 0; mask < 64; mask++) {
      let h = await enter(arcIndex);
      const entryRecord = h.window.CivicationNpcCharacterThreads.getState().characters[arc.npc_id];
      const roleHistory = JSON.parse(JSON.stringify(entryRecord.role_history));
      for (let chapter = 0; chapter < 6; chapter++) {
        assert.equal(await h.scene(arc.stream_id, "forenoon"), null,
          "Private cultural chapters cannot enter the job phase");
        const event = await h.scene(arc.stream_id);
        assert(event, "Missing chapter " + (chapter + 1) + " in route " + mask);
        assert(arc.chapter_scene_ids[chapter].scene_ids.includes(event.narrative_storylet_id));
        visited.add(event.narrative_storylet_id);
        assert.equal(event.channel, "private");
        assert.equal(event.workday_related, false);
        assert.equal(event.employer_id, "");
        const result = await h.answer(event, mask & (1 << chapter) ? "B" : "A");
        assert.equal(result.ok, true);
        assert.equal(result.dailyRuntimeAnswered, true,
          "DailyMailBuilder must persist actual chosen tags and progress");
        const handler = result.choice_director.handler_results.find(r => r.name === "npc_character_story");
        assert.equal(handler.ok, true);
        assert.equal(handler.value.npc_id, arc.npc_id);
        assert.equal(await h.scene(arc.stream_id), null, "Current one-per-workday limit remains intact");
        h.advance();
        if (chapter === 2) {
          h = harness({ state: h.state, backing: h.backing, day: h.day() });
          h.active.role_key = "ekspeditor"; // Private ties survive an employed player changing career.
        }
      }
      assert.equal(await h.scene(arc.stream_id), null, "Finished scenes do not repeat");
      const record = h.window.CivicationNpcCharacterThreads.getState().characters[arc.npc_id];
      assert.equal(record.name, entryRecord.name);
      assert.deepEqual(JSON.parse(JSON.stringify(record.role_history)), roleHistory);
      assert.equal(record.story_event_ids.length, 10); // Four work + six private chapters.
      assert(!Object.hasOwn(record, "salary"));
      assert.deepEqual([...h.backing.keys()], ["hg_civi_npc_character_threads_v1"]);
    }
    assert.deepEqual([...visited].sort(), drafts[arcIndex].storylets.map(s => s.id).sort(),
      "Every authored branch must be reached by a real choice route");
  });
}

test("A flag alone cannot invent a role change, and a rejected choice cannot advance a chapter", async () => {
  const arc = editorial.arcs[0];
  const absent = harness({ state: { narrative_state_v1: { flags: [arc.entry_flag], stream_progress: {} } } });
  assert.equal(await absent.scene(arc.stream_id), null);
  const h = await enter(0);
  const event = await h.scene(arc.stream_id);
  const before = JSON.stringify(h.state.narrative_state_v1);
  const beforeRecord = JSON.stringify(h.window.CivicationNpcCharacterThreads.getState());
  assert.equal((await h.answer(event, "INVALID")).ok, false);
  assert.equal(JSON.stringify(h.state.narrative_state_v1), before);
  assert.equal(JSON.stringify(h.window.CivicationNpcCharacterThreads.getState()), beforeRecord);
  assert.equal((await h.scene(arc.stream_id)).narrative_storylet_id, event.narrative_storylet_id);
});
