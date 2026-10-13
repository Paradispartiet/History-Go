#!/usr/bin/env node
// Replays actual DailyMailBuilder queues, not a parallel editorial scheduler.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const npcStories = [
  ["Stein", "stein_role_change_work_stream", "stein_peer_mellomleder"],
  ["Frode", "frode_role_change_work_stream", "frode_formann"],
  ["Inger", "inger_role_change_work_stream", "inger_avdelingsleder"]
];
const storyIds = new Set(npcStories.map(row => row[1]));
const SOURCES = [
  "js/Civication/systems/civicationActorRoleContract.js",
  "js/Civication/systems/civicationNPCs.js",
  "js/Civication/systems/civicationSceneInteraction.js",
  "js/Civication/systems/day/dayChoiceDirector.js",
  "js/Civication/systems/day/dayNpcCharacterThreads.js",
  "js/Civication/systems/civicationNarrativeSceneSource.js",
  "js/Civication/systems/civicationDailyMailBuilder.js"
];

function createHarness({ initialState = {}, backing = new Map(), firstDay = 0, initialRole = "fagarbeider" } = {}) {
  const state = JSON.parse(JSON.stringify(initialState));
  let workday = firstDay;
  let role = initialRole;
  let pending = null;
  const completed = new Set();
  const adapters = new Map();
  const storage = {
    getItem(key) { return backing.get(key) ?? null; },
    setItem(key, value) { backing.set(key, String(value)); }
  };
  function Engine() {}
  Engine.prototype.getPendingEvent = () => pending ? { status: "pending", event: pending } : null;
  Engine.prototype.getInbox = () => pending ? [{ status: "pending", event: pending }] : [];
  Engine.prototype.onAppOpen = async () => ({ ok: true });
  Engine.prototype.answer = async (eventId, choiceId) => ({
    ok: !!pending && eventId === pending.id && pending.choices.some(choice => choice.id === choiceId)
  });

  const active = () => ({ career_id: "naeringsliv", role_key: role, title: role });
  const catalog = {
    registerSourceAdapter(name, adapter) { adapters.set(name, adapter); return true; },
    getSourceAdapter(name) { return adapters.get(name) || null; },
    async getSourceScenes(name, context) {
      const adapter = adapters.get(name);
      const scenes = adapter ? await adapter.getScenes(context) : [];
      return scenes.map(scene => ({
        ...scene, scene_source_adapter: name, scene_catalog_owner: "CivicationSceneCatalog"
      }));
    }
  };
  const win = {
    DEBUG: false,
    CivicationEventEngine: Engine,
    CivicationSceneCatalog: catalog,
    CivicationState: {
      getState() { return state; },
      setState(patch) { Object.assign(state, patch || {}); return state; },
      getActivePosition: active
    },
    CivicationCareerRoleResolver: {
      resolveCareerRoleScope(position) { return position?.role_key || "unknown"; }
    },
    CivicationWorkdayRuntime: {
      getWorkdayDayIndex() { return workday; },
      hasActiveJob() { return true; },
      isWorkdayCompletedToday(date) { return completed.has(date); },
      completeWorkday({ date }) {
        if (completed.has(date)) return false;
        completed.add(date);
        workday += 1;
        return true;
      }
    },
    CivicationMailRuntime: {
      async makeCandidateMailsForActiveRole() {
        return [{ id: "planned_job_" + workday, mail_type: "job", choices: [
          { id: "A", label: "Utfør oppgaven", effect: 0 }
        ] }];
      }
    },
    CivicationMailEngine: {
      markResolved() { return { ok: true }; }
    },
    addEventListener() {},
    dispatchEvent() { return true; }
  };
  win.window = win;
  const context = vm.createContext({
    window: win,
    document: { readyState: "complete", addEventListener() {} },
    localStorage: storage,
    Event: class Event { constructor(type) { this.type = type; } },
    console,
    setTimeout, clearTimeout,
    fetch: async url => {
      // Load real repository JSON, including the full narrative manifest,
      // role mail families and the authentic daily programme.
      const relative = String(url).split("?")[0];
      if (!relative.startsWith("data/") || relative.includes("..")) return { ok: false };
      const filename = path.join(root, relative);
      if (!fs.existsSync(filename)) return { ok: false };
      return { ok: true, json: async () => JSON.parse(read(relative)) };
    }
  });
  for (const filename of SOURCES) vm.runInContext(read(filename), context, { filename });
  const builder = win.CivicationDailyMailBuilder;
  const engine = new Engine();

  async function build(date) {
    const queue = await builder.buildQueue(active(), { date });
    state.mail_day_runtime_v1 = queue;
    return queue;
  }
  async function answer(row) {
    const event = row.event;
    if (event.npc_story?.kind === "npc_role_story_v1") {
      pending = event;
      const result = await engine.answer(event.id, event.choices[0].id);
      pending = null;
      assert.equal(result.ok, true, "Actual ChoiceDirector rejected " + event.narrative_storylet_id);
      assert.equal(result.dailyRuntimeAnswered, true, "Daily answer middleware was bypassed");
    } else {
      await builder.markAnswered(event.id, event.choices?.[0]?.id || "handled");
    }
  }
  async function finishWorkday(date) {
    const queue = await build(date);
    const npc = queue.items.filter(row => storyIds.has(row.event?.narrative_stream_id));
    for (const row of queue.items) {
      if (row.phase === "forenoon" || row.phase === "workday") await answer(row);
    }
    assert.equal(builder.workPhaseRequiredComplete(state.mail_day_runtime_v1), true,
      "Work phase did not complete");
    assert.equal(completed.has(date), true, "Workday counter did not advance");
    const ordered = npc.map(row => ({
      workday: workday - 1, npc_id: row.event.npc_story.npc_id,
      stream_id: row.event.narrative_stream_id, scene_id: row.event.narrative_storylet_id,
      phase: row.phase, slot: row.slot
    }));
    return { date, queued: queue.items.length, ordinary: queue.items.filter(row =>
      row.phase === "forenoon" || row.phase === "workday").length - npc.length,
      npc: ordered };
  }
  return {
    win, state, backing, completed, builder, engine, build, answer, finishWorkday,
    workdayIndex: () => workday,
    setRole(next) { role = next; },
    getRole: () => role,
    snapshot: () => JSON.parse(JSON.stringify(state))
  };
}

test("12 actual workday queues: log NPC distribution, ordinary mail competition, and gaps", async t => {
  const h = createHarness();
  const days = [];
  for (let n = 0; n < 12; n += 1) {
    const date = "2026-10-" + String(n + 1).padStart(2, "0");
    days.push(await h.finishWorkday(date));
  }
  const scenes = days.flatMap(day => day.npc);
  t.diagnostic("NPC_WORKDAY_TIMELINE " + JSON.stringify(days.map((day, i) => ({
    day: i + 1, ordinary_work_mails: day.ordinary, scenes: day.npc.map(x =>
      x.stream_id + "::" + x.scene_id + "@" + x.phase)
  }))));
  t.diagnostic("NPC_DISTRIBUTION " + JSON.stringify({
    total: scenes.length, days_with_multiple_npcs: days.filter(x => x.npc.length > 1).length,
    days_without_npcs: days.filter(x => !x.npc.length).length
  }));
  assert.equal(h.workdayIndex(), 12, "Twelve fully answered workdays must be registered");
  assert.equal(scenes.length, 12, "The full three-actor, four-chapter lifecycle was not reached");
  for (const [name, streamId, npcId] of npcStories) {
    const authored = JSON.parse(read("data/Civication/narratives/work/naeringsliv/" +
      streamId.replace("_work_stream", "").replace("_role_change", "_role_change") + ".json"));
    const delivered = scenes.filter(x => x.stream_id === streamId);
    assert.deepEqual(delivered.map(x => x.scene_id), authored.storylets.map(x => x.id),
      name + " chapters must stay in authored order");
    assert(delivered.every(x => x.npc_id === npcId && ["forenoon", "workday"].includes(x.phase)),
      name + " must stay inside the job day, with its own NPC identity");
    for (let n = 1; n < delivered.length; n += 1) {
      const gap = authored.storylets[n].npc_story.available_after.min_workdays;
      assert(delivered[n].workday - delivered[n - 1].workday >= gap,
        name + " chapter spacing was skipped");
    }
    const record = h.win.CivicationNpcCharacterThreads.getState().characters[npcId];
    assert.equal(record.role_history?.length, 1, name + " role change must be persisted exactly once");
    assert.equal(record.beats?.length, 4, name + " should remember each accepted chapter");
  }
  assert.deepEqual([...h.backing.keys()], ["hg_civi_npc_character_threads_v1"],
    "No parallel NPC persistence store should be created");
});

test("Unfinished workday cannot unlock chapter two or advance the day index", async () => {
  const h = createHarness();
  const first = await h.build("2026-10-01");
  assert(first.items.some(row => row.event?.narrative_storylet_id === "stein_peer_priority"));
  assert.equal(h.workdayIndex(), 0);
  const second = await h.build("2026-10-02");
  for (const [, streamId] of npcStories) {
    const events = second.items.filter(row => row.event?.narrative_stream_id === streamId);
    assert(events.every(row => !row.event?.npc_story?.available_after),
      "The workday gap must not be based on elapsed calendar days");
  }
  assert.equal(h.workdayIndex(), 0);
});

test("NPC role outcomes survive a runtime restart without duplicate role events", async () => {
  const h = createHarness();
  for (let n = 0; n < 6; n += 1) {
    await h.finishWorkday("2026-10-" + String(n + 1).padStart(2, "0"));
  }
  const after = h.win.CivicationNpcCharacterThreads.getState();
  const resumed = createHarness({
    initialState: h.snapshot(), backing: h.backing, firstDay: h.workdayIndex()
  });
  const reloaded = resumed.win.CivicationNpcCharacterThreads.getState();
  for (const [, , npcId] of npcStories) {
    assert.deepEqual(reloaded.characters[npcId]?.role_history,
      after.characters[npcId]?.role_history, "Role history must survive page reload");
  }
  const replay = await resumed.build("2026-10-07");
  assert(!replay.items.some(row => storyIds.has(row.event?.narrative_stream_id)),
    "Completed role stories must not reappear after a restart");
});

test("Player career switch withholds mismatched stories and keeps accepted progress", async () => {
  const h = createHarness();
  await h.finishWorkday("2026-10-01");
  const steinBefore = h.state.narrative_state_v1.stream_progress[
    "stein_role_change_work_stream::stein_peer_priority"
  ];
  assert.equal(steinBefore?.answered, true);
  h.setRole("mellomleder");
  const switched = await h.build("2026-10-02");
  assert(!switched.items.some(row => row.event?.narrative_stream_id === "stein_role_change_work_stream"),
    "A role-ineligible NPC stream must not leak through active_streams");
  assert(switched.items.some(row => row.event?.narrative_stream_id === "frode_role_change_work_stream"),
    "Frode must remain eligible for a middle manager");
  h.setRole("fagarbeider");
  const returned = await h.build("2026-10-02");
  assert(returned.items.some(row => row.event?.narrative_storylet_id === "stein_job_opening"),
    "Returning to the matching role must preserve, not restart, chapter progress");
});
