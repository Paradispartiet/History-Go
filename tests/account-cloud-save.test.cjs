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
