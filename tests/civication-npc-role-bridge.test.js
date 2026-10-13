const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const npcSource = fs.readFileSync(path.join(root, "js/Civication/systems/civicationNPCs.js"), "utf8");
const contractSource = fs.readFileSync(path.join(root, "js/Civication/systems/civicationActorRoleContract.js"), "utf8");
const index = JSON.parse(fs.readFileSync(path.join(root, "data/Civication/roleWorlds/index.json"), "utf8"));
const npcs = JSON.parse(fs.readFileSync(path.join(root, "data/Civication/npcs/naeringsliv.json"), "utf8"));

function createHarness(options = {}) {
  const fetched = [];
  const storageChanges = [];
  const document = { readyState: "loading", addEventListener() {} };
  const window = { DEBUG: false };
  const ctx = vm.createContext({
    document,
    window,
    fetch: async url => {
      fetched.push(url);
      if (url === "data/Civication/npcs/naeringsliv.json") return { ok: true, json: async () => npcs };
      if (url === "data/Civication/roleWorlds/index.json") {
        return options.badIndex ? { ok: true, json: async () => ({ schema: "invalid", roles: [] }) } : { ok: true, json: async () => index };
      }
      throw new Error("Unexpected fetch: " + url);
    },
    localStorage: {
      setItem(...args) { storageChanges.push(args); },
      getItem() { return null; }
    }
  });
  vm.runInContext(contractSource, ctx, { filename: "civicationActorRoleContract.js" });
  vm.runInContext(npcSource, ctx, { filename: "civicationNPCs.js" });
  return { api: ctx.window.CivicationNPCs, fetched, storageChanges };
}

test("Explicit role bindings cover only canonically matching NPCs", () => {
  assert.equal(npcs.schema, "civication_npc_catalog_v1");
  const withRole = npcs.npcs.filter(npc => npc.role_ref);
  assert.deepEqual(withRole.map(n => n.id).sort(), [
    "frode_formann", "inger_avdelingsleder", "stein_peer_mellomleder"
  ]);
  for (const npc of withRole) {
    assert.ok(index.roles.some(w => w.category === npc.role_ref.category && w.role_scope === npc.role_ref.role_scope));
  }
  assert.equal(npcs.npcs.length, 10);
});

test("Existing mail sender lookup is unchanged and never preloads role index", async () => {
  const h = createHarness();
  await h.api.load();
  assert.equal(h.api.all().length, 10);
  assert.equal(h.api.lookup("inger_avdelingsleder").name, "Inger Holm");
  assert.equal(h.api.lookup("inger_avdelingsleder").title, "Avdelingsleder");
  assert.equal(h.api.lookup("roger_verneombud").name, "Roger Solem");
  assert.deepEqual(h.fetched, ["data/Civication/npcs/naeringsliv.json"]);
  assert.equal(await h.api.resolveActor("roger_verneombud"), null);
  assert.equal(h.fetched.length, 1, "An unmapped fictional NPC must not fetch the full role catalog");
});

test("Three existing fictional NPCs resolve to stable actor IDs and shared Role Worlds", async () => {
  const h = createHarness();
  const expected = [
    ["inger_avdelingsleder", "avdelingsleder"],
    ["stein_peer_mellomleder", "mellomleder"],
    ["frode_formann", "formann"]
  ];
  for (const [id, scope] of expected) {
    const actor = await h.api.resolveActor(id);
    assert.equal(actor.actor_id, "npc:" + id);
    assert.equal(actor.actor_type, "fictional_npc");
    assert.equal(actor.control_mode, "simulation");
    assert.equal(actor.world_scope, "solo");
    assert.equal(actor.role_ref.category, "naeringsliv");
    assert.equal(actor.role_ref.role_scope, scope);
    assert.equal(actor.role_ref.role_world_path, `data/Civication/roleWorlds/naeringsliv/${scope}.json`);
    assert.equal(actor.role_history.length, 0);
    assert.equal(actor.relationship, undefined);
    assert.equal(actor.salary, undefined);
  }
  assert.equal(h.fetched.filter(f => f.includes("roleWorlds/index.json")).length, 1);
  assert.deepEqual(h.storageChanges, []);
  assert.equal(h.api.lookup("frode_formann").id, "frode_formann");
});

test("Missing or invalid canonical role index fails closed and does not mutate legacy NPCs", async () => {
  const h = createHarness({ badIndex: true });
  const before = h.api.lookup("frode_formann");
  assert.equal(before, null);
  assert.equal(await h.api.resolveActor("frode_formann"), null);
  assert.equal(h.api.lookup("frode_formann").name, "Frode Aas");
  assert.deepEqual(h.storageChanges, []);
});

test("Shell loads actor contract before NPCs for both normal and legacy modes", () => {
  const shell = fs.readFileSync(path.join(root, "js/Civication/civicationShellLoader.js"), "utf8");
  const contract = '"js/Civication/systems/civicationActorRoleContract.js"';
  const npc = '"js/Civication/systems/civicationNPCs.js"';
  const contractAt = [...shell.matchAll(new RegExp(contract.replaceAll(".", "\\."), "g"))].map(m => m.index);
  const npcAt = [...shell.matchAll(new RegExp(npc.replaceAll(".", "\\."), "g"))].map(m => m.index);
  assert.equal(contractAt.length, 2);
  assert.equal(npcAt.length, 2);
  for (let i = 0; i < 2; i += 1) assert.ok(contractAt[i] < npcAt[i]);
});
