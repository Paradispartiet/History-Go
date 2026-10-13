#!/usr/bin/env node
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const stein = JSON.parse(read("data/Civication/narratives/work/naeringsliv/stein_role_change.json"));
const roleIndex = JSON.parse(read("data/Civication/roleWorlds/index.json"));
const catalog = JSON.parse(read("data/Civication/npcs/naeringsliv.json"));
const chapter = stein.storylets[2];
const storeKey = "hg_civi_npc_character_threads_v1";
const progressKey = stein.id + "::" + chapter.id;
const scripts = [
  "js/Civication/systems/civicationActorRoleContract.js",
  "js/Civication/systems/civicationNPCs.js",
  "js/Civication/systems/civicationDailyMailBuilder.js",
  "js/Civication/systems/civicationSceneInteraction.js",
  "js/Civication/systems/day/dayChoiceDirector.js",
  "js/Civication/systems/day/dayNpcCharacterThreads.js"
];

function harness() {
  const writes = new Map();
  const state = { narrative_state_v1: {
    active_streams: [stein.id],
    flags: ["stein_role_stage1", "stein_role_stage2"],
    stream_progress: {}, choice_history: []
  }};
  let pending = null;
  let accepted = true;
  let workday = 3;
  const resolved = [];
  const localStorage = {
    getItem(key) { return writes.get(key) ?? null; },
    setItem(key, value) { writes.set(key, String(value)); }
  };
  function Engine() {}
  Engine.prototype.getPendingEvent = () => pending ? { status: "pending", event: pending } : null;
  Engine.prototype.getInbox = () => pending ? [{ status: "pending", event: pending }] : [];
  Engine.prototype.onAppOpen = async () => ({ ok: true });
  Engine.prototype.answer = async function(eventId, choiceId) {
    assert.equal(eventId, pending?.id);
    assert.equal(state.mail_day_runtime_v1.items[0].status, "answered",
      "Daily middleware must stage the answered row before the inner answer");
    assert.equal(state.mail_day_runtime_v1.items[0].choice_id, choiceId);
    return accepted ? { ok: true, feedback: "ok" } : { ok: false, reason: "rejected_by_engine" };
  };
  const win = {
    DEBUG: false,
    CivicationEventEngine: Engine,
    CivicationState: {
      getState: () => state,
      setState(next) { Object.assign(state, next || {}); },
      getActivePosition: () => ({ career_id: "naeringsliv", role_key: "fagarbeider" })
    },
    CivicationWorkdayRuntime: {
      getWorkdayDayIndex: () => workday,
      hasActiveJob: () => true
    },
    CivicationMailEngine: {
      markResolved(...args) { resolved.push(args); return { ok: true }; }
    },
    addEventListener() {},
    dispatchEvent() { return true; }
  };
  win.window = win;
  const context = vm.createContext({
    window: win, document: { readyState: "complete", addEventListener() {} },
    localStorage, console, setTimeout, clearTimeout,
    Event: class Event { constructor(type) { this.type = type; } },
    fetch: async (url) => {
      if (url === "data/Civication/npcs/naeringsliv.json") return { ok: true, json: async () => catalog };
      if (url === "data/Civication/roleWorlds/index.json") return { ok: true, json: async () => roleIndex };
      throw new Error("Unexpected fetch " + url);
    }
  });
  for (const filename of scripts) vm.runInContext(read(filename), context, { filename });
  const engine = new Engine();
  function deliver() {
    pending = {
      id: "stein-confirmed-daily-3", source_type: "narrative_stream",
      scene_source_adapter: "narrative",
      interaction_mode: "decision", mail_class: "daily_workday",
      phase_tag: "workday", mail_type: "story", subject: chapter.subject,
      narrative_stream_id: stein.id, narrative_storylet_id: chapter.id,
      npc_story: chapter.npc_story,
      choices: chapter.choices,
      narrative_effects: {
        adds_flags: chapter.adds_flags, opens_streams: [], risk_links: []
      },
      daily_mail_meta: { phase: "workday", slot: "narrative" }
    };
    state.mail_day_runtime_v1 = {
      version: 1, date: "2026-10-13",
      role_scope: "fagarbeider", current_index: 0,
      delivered_ids: [pending.id], answered_ids: [],
      items: [{ status: "delivered", phase: "workday", slot: "narrative", event: pending }]
    };
    return pending;
  }
  return {
    engine, win, state, writes, resolved, deliver,
    reject() { accepted = false; },
    accept() { accepted = true; },
    setWorkday(day) { workday = day; }
  };
}

test("Daily answer success persists one canonical NPC role event and chapter progress", async () => {
  const h = harness();
  const event = h.deliver();
  const response = await h.engine.answer(event.id, "A");
  assert.equal(response.ok, true);
  assert.equal(response.dailyRuntimeAnswered, true);
  assert.equal(h.resolved.length, 1);
  assert.equal(h.state.mail_day_runtime_v1.items[0].status, "answered");
  const progress = h.state.narrative_state_v1.stream_progress[progressKey];
  assert.equal(progress.answered, true);
  assert.equal(progress.answered_workday_day, 3);
  assert(h.state.narrative_state_v1.flags.includes("stein_role_stage3"));
  const stored = h.win.CivicationNpcCharacterThreads.getState().characters.stein_peer_mellomleder;
  assert.equal(stored.role_history.length, 1);
  assert.equal(stored.role_history[0].event_id, "stein_role_story:confirmed_appointment");
  assert.equal(stored.role_ref.role_scope, "avdelingsleder");
  assert.equal(stored.beats.length, 1);
  assert.equal(stored.trust_score, 1);
  assert.deepEqual([...h.writes.keys()], [storeKey]);
});

test("Daily answer rejection restores narrative progress without touching NPC save", async () => {
  const h = harness();
  const event = h.deliver();
  const snapshot = JSON.stringify(h.state.narrative_state_v1);
  h.reject();
  const response = await h.engine.answer(event.id, "B");
  assert.equal(response.ok, false);
  assert.equal(response.reason, "rejected_by_engine");
  assert.equal(JSON.stringify(h.state.narrative_state_v1), snapshot);
  assert.equal(h.state.mail_day_runtime_v1.items[0].status, "delivered");
  assert.deepEqual(h.state.mail_day_runtime_v1.answered_ids, []);
  assert.equal(h.resolved.length, 0);
  assert.equal(h.writes.size, 0);
});
