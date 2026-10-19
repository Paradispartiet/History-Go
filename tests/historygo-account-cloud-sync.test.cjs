const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("js/aha.js", "utf8");

function setup({ user = "account-one", local = {}, remote = null, readError = null } = {}) {
  // A real authenticated supabase-js browser has a project-scoped session key.
  const map = new Map(Object.entries({
    "sb-wshmybqyksrwkawqleiz-auth-token": '{"access_token":"fake"}',
    ...local
  }));
  const storage = {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: key => map.delete(key)
  };
  const db = { remote, uploads: [], readError };
  const client = {
    auth: { getSession: async () => ({ data: { session: { user: { id: user } } }, error: null }) },
    from(table) {
      let filters = {};
      const chain = {
        select() { return this; },
        eq(key, value) { filters[key] = value; return this; },
        async maybeSingle() {
          if (table === "aha_profiles") return { data: { id: user, display_name: "Kontonavn" }, error: null };
          assert.equal(table, "aha_imports");
          assert.equal(filters.profile_id, user);
          assert.equal(filters.id, "historygo_latest_" + user);
          return { data: db.remote, error: db.readError };
        },
        upsert(record) {
          db.uploads.push(record);
          db.remote = record;
          return { select() { return { single: async () => ({ data: record, error: null }) }; } };
        }
      };
      return chain;
    }
  };
  const window = {
    supabase: { createClient: () => client },
    DEBUG: false, dispatchEvent() {}, addEventListener() {}
  };
  const context = { window, document: {
    readyState: "loading", addEventListener() {}, getElementById() { return null; }
  }, localStorage: storage, console,
    CustomEvent: class { constructor() {} }, Event: class { constructor() {} },
    setInterval() {}, clearTimeout() {}, setTimeout() {}, URL, Date
  };
  vm.runInNewContext(source, context, { filename: "aha.js" });
  return { api: window.HistoryGoAHAAuth, storage, db, window };
}
test("History Go readback restores visits, quiz and merits on a fresh browser", async () => {
  const { api, storage } = setup({ remote: {
    payload: { profile_id: "account-one", visited_places: { oslo: true },
      quiz_progress: { q1: { completed: true } },
      merits_by_category: { historie: { m1: true } } },
    created_at: "2026-10-19T12:00:00Z"
  } });
  const detail = await api.refresh();
  assert.equal(detail.readback.ok, true);
  assert.equal(JSON.parse(storage.getItem("visited_places")).oslo, true);
  assert.equal(JSON.parse(storage.getItem("quiz_progress")).q1.completed, true);
  assert.equal(JSON.parse(storage.getItem("merits_by_category")).historie.m1, true);
});
test("History Go preserves current local visits when older cloud backup is loaded", async () => {
  const { api, storage } = setup({
    local: { visited_places: '{"bergen":true}' },
    remote: { payload: { visited_places: { oslo: true }, people_collected: { "p1": true } } }
  });
  await api.refresh();
  assert.deepEqual(JSON.parse(storage.getItem("visited_places")), { oslo: true, bergen: true });
  assert.equal(JSON.parse(storage.getItem("people_collected")).p1, true);
});
test("History Go does not upload unverified readback", async () => {
  const { api, db } = setup({
    local: { visited_places: '{"oslo":true}' },
    readError: { message: "service unavailable" }
  });
  await api.refresh();
  const result = await api.syncHistoryGoPayload({ visited_places: { oslo: true } });
  assert.equal(result.reason, "readback_not_verified");
  assert.equal(db.uploads.length, 0);
});
test("History Go never uploads an empty game", async () => {
  const { api, db } = setup();
  await api.refresh();
  const result = await api.syncHistoryGoPayload({});
  assert.equal(result.reason, "empty_save");
  assert.equal(db.uploads.length, 0);
});
test("History Go account switch blocks old account's local progress", async () => {
  const { api, db, storage } = setup({
    user: "account-two",
    local: { historygo_cloud_owner_v1: "account-one", visited_places: '{"oslo":true}' }
  });
  const state = await api.refresh();
  assert.equal(state.readback.reason, "different_local_account");
  const result = await api.syncHistoryGoPayload({ visited_places: { oslo: true } });
  assert.equal(result.reason, "readback_not_verified");
  assert.equal(storage.getItem("visited_places"), '{"oslo":true}');
  assert.equal(db.uploads.length, 0);
});

test("signed-out browsers boot without fetching Supabase SDK", async () => {
  const { api, storage } = setup();
  storage.removeItem("sb-wshmybqyksrwkawqleiz-auth-token");
  const state = await api.refresh();
  assert.equal(state.signed_in, false);
});
