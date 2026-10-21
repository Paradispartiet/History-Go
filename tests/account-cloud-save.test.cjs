const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("js/Civication/core/CivicationCloudSave.js", "utf8");

function makeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    get length() { return data.size; }, key(i) { return [...data.keys()][i] ?? null; },
    getItem(k) { return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { data.set(k, String(v)); }, removeItem(k) { data.delete(k); }
  };
}
async function runtime({ uid = "account-one", initial = {}, db = { record: null, writes: [] } } = {}) {
  const localStorage = makeStorage(initial);
  const supabase = {
    from(name) {
      assert.equal(name, "aha_imports");
      return {
        select() { return this; },
        eq(key, value) {
          if (key === "profile_id") assert.equal(value, uid);
          if (key === "id") assert.equal(value, "civication_latest_" + uid);
          return this;
        },
        async maybeSingle() { return { data: db.record, error: null }; },
        async upsert(record) { db.record = record; db.writes.push(record); return { error: null }; }
      };
    }
  };
  const element = { textContent: "", title: "" };
  const window = {
    localStorage,
    document: { getElementById: () => element, addEventListener() {} },
    dispatchEvent() {}, setInterval() {},
    HistoryGoAHAAuth: {
      getSession: async () => ({ user: { id: uid } }),
      getClient: async () => supabase
    }
  };
  const context = { window, CustomEvent: class { constructor() {} }, console,
    clearTimeout() {}, setTimeout() {}, Date };
  vm.runInNewContext(source, context, { filename: "CivicationCloudSave.js" });
  await window.CivicationCloudSave.ready;
  return { save: window.CivicationCloudSave, localStorage, element, db };
}
test("new account uploads existing local Life Story and career data", async () => {
  const db = { record: null, writes: [] };
  const game = await runtime({ db, initial: {
    civication_lifestory_v1: '{"dag":7,"rolle":"renholder"}',
    hg_civi_state_v1: '{"cash":12}'
  }});
  await game.save.flush();
  assert.equal(db.writes.length, 1);
  assert.equal(db.record.payload.state.civication_lifestory_v1, '{"dag":7,"rolle":"renholder"}');
  assert.equal(db.record.profile_id, "account-one");
});
test("empty new browser restores saved account state without upload", async () => {
  const db = { record: null, writes: [] };
  const origin = await runtime({ db, initial: { civication_lifestory_v1: '{"dag":6}' } });
  await origin.save.flush();
  const restored = await runtime({ db });
  assert.equal(restored.localStorage.getItem("civication_lifestory_v1"), '{"dag":6}');
  await restored.save.flush();
  assert.equal(db.writes.length, 1);
});
test("divergent local save cannot overwrite cloud copy", async () => {
  const db = { record: { payload: { state: { civication_lifestory_v1: '{"dag":11}' } }, created_at: "2026-10-19T12:00:00Z" }, writes: [] };
  const game = await runtime({ db, initial: { civication_lifestory_v1: '{"dag":4}' } });
  assert.match(game.element.textContent, /ulike/);
  assert.equal(game.localStorage.getItem("civication_lifestory_v1"), '{"dag":4}');
  await game.save.flush();
  assert.equal(db.writes.length, 0);
  assert.equal(db.record.payload.state.civication_lifestory_v1, '{"dag":11}');
});
test("empty uninitialized game does not overwrite backups", async () => {
  const db = { record: null, writes: [] };
  const game = await runtime({ db });
  await game.save.flush();
  assert.equal(db.writes.length, 0);
});
test("account switch preserves previous user local data and blocks uploads", async () => {
  const db = { record: null, writes: [] };
  const game = await runtime({ db, uid: "account-two", initial: {
    civication_cloud_owner_v1: "account-one",
    civication_lifestory_v1: '{"dag":9}'
  }});
  assert.match(game.element.textContent, /annen konto/);
  await game.save.flush();
  assert.equal(db.writes.length, 0);
});
test("simultaneous account update triggers non-destructive conflict", async () => {
  const db = { record: null, writes: [] };
  const game = await runtime({ db, initial: { civication_lifestory_v1: '{"dag":2}' } });
  db.record = { payload: { state: { civication_lifestory_v1: '{"dag":10}' } } };
  await game.save.flush();
  assert.equal(db.writes.length, 0);
  assert.match(game.element.textContent, /annen enhet/);
});

test("legacy test-role override is not restored and is pruned from the next cloud save", async () => {
  const db = { record: { payload: { state: {
    civication_lifestory_role_v1: "arealplanlegger",
    civication_lifestory_v1: '{"dag":9,"rolle":"renholder"}'
  } }, created_at: "2026-10-20T12:00:00Z" }, writes: [] };
  const game = await runtime({ db });
  assert.equal(game.localStorage.getItem("civication_lifestory_role_v1"), null,
    "a retired debug override must never be rehydrated from the account");
  assert.equal(game.localStorage.getItem("civication_lifestory_v1"),
    '{"dag":9,"rolle":"renholder"}', "actual job and progress remain intact");
  assert.equal(game.save.snapshot().civication_lifestory_role_v1, undefined);
  await game.save.flush();
  assert.equal(db.writes.length, 1, "safe cleanup happens after reading the original backup");
  assert.equal(db.record.payload.state.civication_lifestory_role_v1, undefined);
  assert.equal(db.record.payload.state.civication_lifestory_v1,
    '{"dag":9,"rolle":"renholder"}');
  const secondDevice = await runtime({ db });
  assert.equal(secondDevice.localStorage.getItem("civication_lifestory_role_v1"), null);
  assert.equal(secondDevice.localStorage.getItem("civication_lifestory_v1"),
    '{"dag":9,"rolle":"renholder"}');
});

test("a local-only obsolete role override cannot become a cloud save", async () => {
  const db = { record: null, writes: [] };
  const game = await runtime({ db, initial: {
    civication_lifestory_role_v1: "arealplanlegger"
  } });
  assert.equal(game.save.snapshot().civication_lifestory_role_v1, undefined);
  await game.save.flush();
  assert.equal(db.writes.length, 0, "do not upload retired test settings as progress");
});

test("obsolete local override does not conflict with valid restored cloud role", async () => {
  const db = { record: { payload: { state: {
    civication_lifestory_v1: '{"dag":6,"rolle":"renholder"}'
  } }, created_at: "2026-10-20T12:00:00Z" }, writes: [] };
  const game = await runtime({ db, initial: {
    civication_lifestory_role_v1: "arealplanlegger"
  } });
  assert.equal(game.localStorage.getItem("civication_lifestory_v1"),
    '{"dag":6,"rolle":"renholder"}');
  assert.doesNotMatch(game.element.textContent, /ulike/);
  await game.save.flush();
  assert.equal(db.writes.length, 0, "no unwarranted backup rewrite");
});


test("job history survives a cloud backup and an empty new device", async () => {
  const db = { record: null, writes: [] };
  const history = JSON.stringify([
    { career_id: "handel", started_day_index: 1, ended_day_index: 3 },
    { career_id: "service", started_day_index: 4 }
  ]);
  const original = await runtime({ db, initial: {
    hg_job_history_v1: history,
    hg_active_position_v1: '{"career_id":"service"}',
    hg_pc_wallet_v1: '{"balance":131}',
    hg_job_history_debug_v1: '{"dev":true}'
  } });
  assert.equal(original.save.snapshot().hg_job_history_v1, history);
  assert.equal(original.save.snapshot().hg_job_history_debug_v1, undefined,
    "only the canonical job history key is included");
  await original.save.flush();
  assert.equal(db.writes.length, 1);
  assert.equal(db.record.payload.state.hg_job_history_v1, history);

  const restored = await runtime({ db });
  assert.equal(restored.localStorage.getItem("hg_job_history_v1"), history);
  assert.equal(restored.localStorage.getItem("hg_active_position_v1"),
    '{"career_id":"service"}');
  assert.equal(restored.localStorage.getItem("hg_pc_wallet_v1"), '{"balance":131}');
  await restored.save.flush();
  assert.equal(db.writes.length, 1, "restoring an unchanged snapshot must not rewrite the cloud copy");
});

test("divergent job histories retain both copies and block cloud overwrite", async () => {
  const cloudHistory = '[{"career_id":"handel","started_day_index":1}]';
  const localHistory = '[{"career_id":"service","started_day_index":2}]';
  const db = {
    record: { payload: { state: { hg_job_history_v1: cloudHistory } },
      created_at: "2026-10-21T09:00:00Z" },
    writes: []
  };
  const game = await runtime({ db, initial: { hg_job_history_v1: localHistory } });
  assert.match(game.element.textContent, /ulike/);
  assert.equal(game.localStorage.getItem("hg_job_history_v1"), localHistory);
  assert.equal(db.record.payload.state.hg_job_history_v1, cloudHistory);
  await game.save.flush();
  assert.equal(db.writes.length, 0, "conflicting histories cannot be silently overwritten");
});

test("an existing cloud backup without job history accepts added local history", async () => {
  const history = '[{"career_id":"service","started_day_index":4}]';
  const db = {
    record: { payload: { state: { civication_lifestory_v1: '{"dag":7}' } },
      created_at: "2026-10-20T12:00:00Z" },
    writes: []
  };
  const game = await runtime({ db, initial: { hg_job_history_v1: history } });
  assert.equal(game.localStorage.getItem("civication_lifestory_v1"), '{"dag":7}');
  assert.doesNotMatch(game.element.textContent, /ulike/);
  await game.save.flush();
  assert.equal(db.writes.length, 1);
  assert.equal(db.record.payload.state.hg_job_history_v1, history);
  assert.equal(db.record.payload.state.civication_lifestory_v1, '{"dag":7}');
});

test("NPC social memory survives cloud backup and an empty new device", async () => {
  const db = { record: null, writes: [] };
  const relationships = JSON.stringify({
    npc_sara: {
      friendId: "npc_sara", relationshipLevel: 3, trust: 2,
      socialHistory: [{ messageId: "encounter-7", responseId: "reply", phase: "leisure" }]
    }
  });
  const responses = JSON.stringify({
    "encounter-7": {
      messageId: "encounter-7", responseId: "reply", status: "replied", friendId: "npc_sara"
    }
  });
  const conversations = JSON.stringify({
    conv_npc_sara_leisure_001: {
      conversationId: "conv_npc_sara_leisure_001", friendId: "npc_sara",
      turns: [{ messageId: "encounter-7", responseId: "reply", text: "Hei, Sara." }]
    }
  });
  const first = await runtime({ db, initial: {
    "civi.socialConversations.v1": conversations,
    "civi.socialRelationships.v1": relationships,
    "civi.socialResponses.v1": responses,
    "civi.socialRelationships.debug": '{"dev":true}',
    civication_lifestory_v1: '{"dag":7,"rolle":"arbeidsledig"}',
    hg_pc_wallet_v1: '{"balance":131}'
  } });
  assert.equal(first.save.snapshot()["civi.socialConversations.v1"], conversations);
  assert.equal(first.save.snapshot()["civi.socialRelationships.v1"], relationships);
  assert.equal(first.save.snapshot()["civi.socialResponses.v1"], responses);
  assert.equal(first.save.snapshot()["civi.socialRelationships.debug"], undefined,
    "do not upload unrecognized dotted civi keys");
  await first.save.flush();
  assert.equal(db.writes.length, 1);
  const second = await runtime({ db });
  assert.equal(second.localStorage.getItem("civi.socialConversations.v1"), conversations,
    "an ongoing NPC conversation must survive a fresh device");
  assert.equal(second.localStorage.getItem("civi.socialRelationships.v1"), relationships);
  assert.equal(second.localStorage.getItem("civi.socialResponses.v1"), responses,
    "already answered NPC encounters must not become new unanswered messages");
  assert.equal(second.localStorage.getItem("hg_pc_wallet_v1"), '{"balance":131}');
  assert.equal(second.localStorage.getItem("civication_lifestory_v1"),
    '{"dag":7,"rolle":"arbeidsledig"}');
  await second.save.flush();
  assert.equal(db.writes.length, 1, "read-only restore must not rewrite the backup");
});

test("divergent NPC memories are preserved and block cloud overwrite", async () => {
  const cloudMemory = '{"npc_sara":{"relationshipLevel":3}}';
  const localMemory = '{"npc_sara":{"relationshipLevel":1}}';
  const db = { record: {
    payload: { state: { "civi.socialRelationships.v1": cloudMemory } },
    created_at: "2026-10-21T10:00:00Z"
  }, writes: [] };
  const game = await runtime({ db, initial: { "civi.socialRelationships.v1": localMemory } });
  assert.match(game.element.textContent, /ulike/);
  assert.equal(game.localStorage.getItem("civi.socialRelationships.v1"), localMemory);
  await game.save.flush();
  assert.equal(db.writes.length, 0);
  assert.equal(db.record.payload.state["civi.socialRelationships.v1"], cloudMemory);
});

test("older cloud snapshots accept new local NPC memory without deleting story state", async () => {
  const responses = '{"encounter-7":{"friendId":"npc_sara","responseId":"reply"}}';
  const db = { record: {
    payload: { state: { civication_lifestory_v1: '{"dag":8}' } },
    created_at: "2026-10-20T12:00:00Z"
  }, writes: [] };
  const game = await runtime({ db, initial: { "civi.socialResponses.v1": responses } });
  assert.doesNotMatch(game.element.textContent, /ulike/);
  await game.save.flush();
  assert.equal(db.writes.length, 1);
  assert.equal(db.record.payload.state["civi.socialResponses.v1"], responses);
  assert.equal(db.record.payload.state.civication_lifestory_v1, '{"dag":8}');
});

test("different NPC conversation histories block destructive cloud overwrite", async () => {
  const cloud = '{"conv_npc_sara_leisure_001":{"conversationId":"conv_npc_sara_leisure_001","turns":[{"text":"Svar fra Sara"}]}}';
  const local = '{"conv_npc_sara_leisure_001":{"conversationId":"conv_npc_sara_leisure_001","turns":[]}}';
  const db = { record: {
    payload: { state: { "civi.socialConversations.v1": cloud } },
    created_at: "2026-10-21T10:00:00Z"
  }, writes: [] };
  const game = await runtime({ db, initial: { "civi.socialConversations.v1": local } });
  assert.match(game.element.textContent, /ulike/);
  assert.equal(game.localStorage.getItem("civi.socialConversations.v1"), local);
  await game.save.flush();
  assert.equal(db.writes.length, 0);
  assert.equal(db.record.payload.state["civi.socialConversations.v1"], cloud);
});
