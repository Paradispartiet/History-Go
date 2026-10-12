const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildRoleCatalog, resolveRole, createActor, changeActorRole
} = require("../js/Civication/systems/civicationActorRoleContract.js");

const index = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/Civication/roleWorlds/index.json"), "utf8"));
const catalog = buildRoleCatalog(index);

test("Every canonical Role World is equally available as a player and fictional-NPC role", () => {
  assert.equal(catalog.role_count, index.roles.length);
  assert.equal(catalog.role_count, 244);
  const keys = new Set();
  for (const [i, world] of index.roles.entries()) {
    const key = `${world.category}/${world.role_scope}`;
    assert.ok(!keys.has(key), key);
    keys.add(key);
    const roleRef = { category: world.category, role_scope: world.role_scope };
    const player = createActor(catalog, { actor_id: `player:sample-${i}`, actor_type: "player", role_ref: roleRef });
    const npc = createActor(catalog, { actor_id: `npc:sample-${i}`, actor_type: "fictional_npc", role_ref: roleRef });
    assert.deepEqual(player.role_ref, npc.role_ref);
    assert.equal(player.role_ref.role_world_path, world.path);
    assert.equal(player.control_mode, "local_player");
    assert.equal(npc.control_mode, "simulation");
    assert.equal(player.world_scope, "solo");
    assert.equal(npc.world_scope, "solo");
  }
});

test("Only canonical indexed roles can be assigned; a category alone does not grant a role", () => {
  assert.throws(() => resolveRole(catalog, { category: "musikk" }), /role_scope/);
  assert.throws(() => createActor(catalog, {
    actor_id: "npc:invented", actor_type: "fictional_npc",
    role_ref: { category: "musikk", role_scope: "magisk_rockestjerne" }
  }), /Unknown canonical role/);
  assert.throws(() => buildRoleCatalog({ schema: "wrong", roles: [] }), /canonical/);
});

test("Namespace and person boundaries prevent false role identity and History Go NPC mixing", () => {
  const role_ref = { category: "musikk", role_scope: "musikk_frilansmusiker" };
  assert.throws(() => createActor(catalog, { actor_id: "npc:1", actor_type: "player", role_ref }), /namespace/);
  assert.throws(() => createActor(catalog, { actor_id: "player:1", actor_type: "historical_person", role_ref }), /fictional_npc/);
  assert.throws(() => createActor(catalog, {
    actor_id: "npc:historical", actor_type: "fictional_npc", role_ref,
    canonical_person_id: "bugge_wesseltoft"
  }), /History Go People/);
  assert.throws(() => createActor(catalog, {
    actor_id: "player:1", actor_type: "player", role_ref, remote_player_id: "other-account"
  }), /remote player/);
});

test("A role transition changes the actor's role, never their ID or control type", () => {
  const first = createActor(catalog, {
    actor_id: "npc:arrangor-1", actor_type: "fictional_npc",
    role_ref: { category: "musikk", role_scope: "musikk_frilansmusiker" }
  });
  const next = changeActorRole(catalog, first, { category: "naeringsliv", role_scope: "ekspeditor" }, "job-change-001");
  assert.equal(first.role_ref.role_scope, "musikk_frilansmusiker");
  assert.equal(next.role_ref.role_scope, "ekspeditor");
  assert.equal(next.actor_id, first.actor_id);
  assert.equal(next.control_mode, "simulation");
  assert.equal(next.role_history.length, 1);
  assert.equal(next.role_history[0].from, "musikk/musikk_frilansmusiker");
  assert.equal(next.role_history[0].to, "naeringsliv/ekspeditor");
  assert.throws(() => changeActorRole(catalog, next, first.role_ref, "job-change-001"), /Duplicate role event/);
  assert.throws(() => changeActorRole(catalog, next, next.role_ref, "job-change-002"), /No role transition/);
});

test("Shared roles carry no booking, employment, salary, relationship or remote authority", () => {
  const actor = createActor(catalog, {
    actor_id: "player:local-1", actor_type: "player",
    role_ref: { category: "musikk", role_scope: "musikk_frilansmusiker" }
  });
  for (const key of ["salary", "job_offer", "employment", "permissions", "relationship", "account_id", "network_identity"]) {
    assert.equal(actor[key], undefined);
  }
  assert.ok(Object.isFrozen(actor.role_ref));
  assert.ok(Object.isFrozen(actor.role_history));
  assert.ok(Object.isFrozen(actor));
});
