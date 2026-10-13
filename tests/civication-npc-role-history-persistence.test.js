const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sources = [
  "js/Civication/systems/civicationActorRoleContract.js",
  "js/Civication/systems/civicationNPCs.js",
  "js/Civication/systems/day/dayNpcCharacterThreads.js"
].map(file => fs.readFileSync(path.join(root, file), "utf8"));
const index = JSON.parse(fs.readFileSync(path.join(root, "data/Civication/roleWorlds/index.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/Civication/npcs/naeringsliv.json"), "utf8"));
const STORE_KEY = "hg_civi_npc_character_threads_v1";

function setup(backing = new Map()) {
  const writes = [];
  const storage = {
    getItem(key) { return backing.get(key) || null; },
    setItem(key, value) { backing.set(key, String(value)); writes.push(key); }
  };
  const urlCalls = [];
  const window = { DEBUG: false, dispatchEvent() {} };
  const ctx = vm.createContext({
    window, localStorage: storage,
    Event: class Event { constructor(type) { this.type = type; } },
    document: { readyState: "loading", addEventListener() {} },
    fetch: async url => {
      urlCalls.push(url);
      if (url === "data/Civication/npcs/naeringsliv.json") return { ok: true, json: async () => catalog };
      if (url === "/data/Civication/roleWorlds/index.json") return { ok: true, json: async () => index };
      throw new Error("Unexpected load " + url);
    }
  });
  for (const [i, source] of sources.entries()) vm.runInContext(source, ctx, { filename: "script-" + i });
  return { window, backing, writes, urlCalls, npc: window.CivicationNPCs, threads: window.CivicationNpcCharacterThreads };
}

test("Existing character-thread owner persists NPC role events across reload without new save keys", async () => {
  const backing = new Map();
  const first = setup(backing);
  const initial = await first.npc.resolveActor("inger_avdelingsleder");
  assert.equal(initial.role_ref.role_scope, "avdelingsleder");
  assert.equal(initial.role_history.length, 0);
  assert.equal(backing.size, 0, "Read does not mutate any storage");

  const changed = await first.threads.recordRoleTransition(
    "inger_avdelingsleder",
    { category: "naeringsliv", role_scope: "formann" },
    "story:role_change:001"
  );
  assert.equal(changed.actor_id, "npc:inger_avdelingsleder");
  assert.equal(changed.role_ref.role_scope, "formann");
  assert.equal(changed.role_history.length, 1);
  assert.deepEqual([...backing.keys()], [STORE_KEY]);
  const saved = JSON.parse(backing.get(STORE_KEY)).characters.inger_avdelingsleder;
  assert.equal(saved.name, "Inger Holm");
  assert.equal(saved.actor_id, "npc:inger_avdelingsleder");
  assert.equal(saved.role_ref.role_scope, "formann");
  assert.equal(saved.appearances, 0);
  assert.equal(first.npc.lookup("inger_avdelingsleder").title, "Avdelingsleder", "Original mail title unaffected");

  const second = setup(backing);
  const restored = await second.npc.resolveActor("inger_avdelingsleder");
  assert.equal(restored.role_ref.role_scope, "formann");
  assert.equal(restored.actor_id, initial.actor_id);
  assert.equal(restored.role_history[0].from, "naeringsliv/avdelingsleder");
  assert.equal(restored.role_history[0].to, "naeringsliv/formann");
  assert.equal(second.writes.length, 0, "Restoration is read-only");
});

test("Role changes preserve the existing NPC reaction, social history and trust score", async () => {
  const h = setup();
  const id = "inger_avdelingsleder";
  h.threads.updateCharacterThreadFromReaction({
    id: "reaction-1", personId: id, personName: "Inger Holm",
    personType: "leder", trustDelta: 2, title: "En reaksjon",
    line: "Hun merket hva du valgte.", subject: "Skift"
  });
  const before = h.threads.getState().characters[id];
  assert.equal(before.trust_score, 2);
  assert.equal(before.appearances, 1);
  assert.equal(before.beats.length, 1);
  assert.equal(before.role_history, undefined);

  await h.threads.recordRoleTransition(
    id, { category: "naeringsliv", role_scope: "formann" }, "story:role_change:002"
  );
  const after = h.threads.getState().characters[id];
  assert.equal(after.trust_score, 2);
  assert.equal(after.appearances, 1);
  assert.equal(after.beats.length, 1);
  assert.equal(after.role, "leder", "Social role label is not overwritten by job role scope");
  assert.equal(after.role_history.length, 1);

  h.threads.updateCharacterThreadFromReaction({
    id: "reaction-2", personId: id, personName: "Inger Holm",
    trustDelta: -1, title: "Et senere møte", line: "Ny reaksjon"
  });
  const following = h.threads.getState().characters[id];
  assert.equal(following.trust_score, 1);
  assert.equal(following.appearances, 2);
  assert.equal(following.beats.length, 2);
  assert.equal(following.role_history.length, 1, "Subsequent reaction preserves role chronology");
});

test("Invalid, duplicate and unbound events fail closed without creating fictitious role history", async () => {
  const h = setup();
  assert.equal(await h.threads.recordRoleTransition(
    "roger_verneombud", { category: "naeringsliv", role_scope: "formann" }, "story:no-role"
  ), null);
  assert.equal(h.backing.size, 0);
  await assert.rejects(
    h.threads.recordRoleTransition("inger_avdelingsleder", { category: "naeringsliv", role_scope: "invented_role" }, "story:bad"),
    /Unknown canonical role/
  );
  await assert.rejects(h.threads.recordRoleTransition("inger_avdelingsleder", {}, ""), /event ID/);
  assert.equal(h.backing.size, 0);
  await h.threads.recordRoleTransition(
    "inger_avdelingsleder", { category: "naeringsliv", role_scope: "formann" }, "story:unique"
  );
  const prior = h.backing.get(STORE_KEY);
  await assert.rejects(
    h.threads.recordRoleTransition("inger_avdelingsleder", { category: "naeringsliv", role_scope: "mellomleder" }, "story:unique"),
    /Duplicate role event/
  );
  assert.equal(h.backing.get(STORE_KEY), prior);
});

test("Concurrent transitions are serialized, and no remote player or History Go identity is introduced", async () => {
  const h = setup();
  const one = h.threads.recordRoleTransition(
    "inger_avdelingsleder", { category: "naeringsliv", role_scope: "formann" }, "scene:first"
  );
  const two = h.threads.recordRoleTransition(
    "inger_avdelingsleder", { category: "naeringsliv", role_scope: "mellomleder" }, "scene:second"
  );
  const [a, b] = await Promise.all([one, two]);
  assert.equal(a.role_ref.role_scope, "formann");
  assert.equal(b.role_ref.role_scope, "mellomleder");
  assert.equal(b.role_history.length, 2);
  const stored = h.threads.getState().characters.inger_avdelingsleder;
  assert.equal(stored.role_history.length, 2);
  assert.equal(stored.role_history[1].from, "naeringsliv/formann");
  for (const field of ["account_id", "remote_player_id", "canonical_person_id", "history_people", "employment", "salary"]) {
    assert.equal(stored[field], undefined);
  }
  assert.deepEqual([...h.backing.keys()], [STORE_KEY]);
});

test("Malformed old role events are never trusted, rewritten or treated as valid actors", async () => {
  const backing = new Map([[STORE_KEY, JSON.stringify({
    characters: {
      inger_avdelingsleder: {
        id: "inger_avdelingsleder", name: "Inger Holm", trust_score: 3,
        role_history: [{ event_id: "fake", from: "naeringsliv/avdelingsleder", to: "naeringsliv/not-a-role" }]
      }
    }, active_ids: []
  })]]);
  const h = setup(backing);
  assert.equal(await h.npc.resolveActor("inger_avdelingsleder"), null);
  assert.equal(h.threads.getState().characters.inger_avdelingsleder.trust_score, 3);
  assert.equal(h.writes.length, 0);
});
