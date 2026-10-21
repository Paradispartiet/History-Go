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


test("job history is backed up and restored with Life Story on a fresh device", async () => {
  const db = { record: null, writes: [] };
  const history = JSON.stringify([
    { career_id: "handel", started_day: 1, ended_day: 3 },
    { career_id: "service", started_day: 4 }
  ]);
  const initial = {
    civication_lifestory_v1: '{"dag":8,"rolle":"service"}',
    hg_active_position_v1: '{"career_id":"service"}',
    hg_job_history_v1: history
  };
  const origin = await runtime({ db, initial });
  assert.equal(origin.save.snapshot().hg_job_history_v1, history,
    "canonical job-history key must be included in the backup");
  await origin.save.flush();
  assert.equal(db.writes.length, 1);
  assert.equal(db.record.payload.state.hg_job_history_v1, history);
  const freshDevice = await runtime({ db });
  for (const [key, raw] of Object.entries(initial)) {
    assert.equal(freshDevice.localStorage.getItem(key), raw,
      "fresh device must restore " + key);
  }
  await freshDevice.save.flush();
  assert.equal(db.writes.length, 1, "restoring must not unnecessarily rewrite the backup");
});

test("divergent job history blocks cloud overwrite without destroying either copy", async () => {
  const cloudHistory = '[{"career_id":"handel","started_day":1}]';
  const localHistory = '[{"career_id":"service","started_day":3}]';
  const db = { record: { payload: { state: {
    hg_job_history_v1: cloudHistory
  } }, created_at: "2026-10-21T10:00:00Z" }, writes: [] };
  const game = await runtime({ db, initial: { hg_job_history_v1: localHistory } });
  assert.match(game.element.textContent, /ulike/);
  assert.equal(game.localStorage.getItem("hg_job_history_v1"), localHistory);
  await game.save.flush();
  assert.equal(db.writes.length, 0, "conflicting device must not overwrite cloud history");
  assert.equal(db.record.payload.state.hg_job_history_v1, cloudHistory);
});

test("an existing cloud save without job history can acquire it without losing old progress", async () => {
  const db = { record: { payload: { state: {
    civication_lifestory_v1: '{"dag":5}'
  } }, created_at: "2026-10-20T10:00:00Z" }, writes: [] };
  const history = '[{"career_id":"handel","started_day":2}]';
  const game = await runtime({ db, initial: { hg_job_history_v1: history } });
  assert.equal(game.localStorage.getItem("civication_lifestory_v1"), '{"dag":5}');
  await game.save.flush();
  assert.equal(db.writes.length, 1);
  assert.equal(db.record.payload.state.hg_job_history_v1, history);
  assert.equal(db.record.payload.state.civication_lifestory_v1, '{"dag":5}');
});
