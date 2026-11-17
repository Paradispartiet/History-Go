const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("js/psychologyRoom.js", "utf8");
const css = fs.readFileSync("css/psychologyRoom.css", "utf8");
const WORKBENCH = "hg_psychology_workbench_v1";
const MAP = "hg_psychology_inner_map_v1";
const store = new Map();
const writes = [];
const storage = {
  getItem(key) { return store.has(key) ? store.get(key) : null; },
  setItem(key, value) { writes.push({ key, value }); store.set(key, String(value)); },
  removeItem(key) { store.delete(key); }
};
const environment = {
  console,
  localStorage: storage,
  Date,
  JSON,
  Set,
  Map,
  CustomEvent: class {},
  dispatchEvent() {},
  fetch() { throw new Error("Psychology map must not fetch"); },
  EchoNet: new Proxy({}, { get() { throw new Error("No EchoNet reads"); } }),
  AHAIngest: new Proxy({}, { get() { throw new Error("No AHA reads"); } }),
  AHARepository: new Proxy({}, { get() { throw new Error("No database reads"); } }),
  showToast() {},
};
environment.window = environment;
vm.createContext(environment);
vm.runInContext(source, environment, { filename: "js/psychologyRoom.js" });
const room = environment.PsychologyRoom;

const sample = (id, extra = {}) => ({
  id, created_at: "2026-11-17T09:00:00.000Z",
  situation: "En fabrikkert hendelse " + id,
  thoughts: "Jeg forestilte meg en blå papirfugl.",
  feelings: "Nysgjerrig",
  body: "Slapp i skuldrene",
  actions: "Jeg skrev ned en tanke.",
  next_step: "Se på papirfuglen igjen.",
  ...extra
});

const note = sample("entry-1", {
  situation: "<img src=x onerror=alert(1)> syntetisk test",
  follow_ups: [{ id: "follow-1", tried: "Skrev noe", outcome: "Skrev mer" }]
});
store.set(WORKBENCH, JSON.stringify([note, sample("entry-2")]));
assert.deepEqual(Array.from(room.getInnerMapIds()), [], "nothing enters the map by default");
assert.equal(store.has(MAP), false, "reading map must not write or migrate private material");
assert.equal(room.toggleInnerMap("unknown").reason, "unknown_entry");
assert.equal(store.has(MAP), false, "unknown references must not write");

const first = room.toggleInnerMap("entry-1");
assert.equal(first.ok, true);
assert.equal(first.selected, true);
assert.deepEqual(Array.from(room.getInnerMapIds()), ["entry-1"]);
const json = store.get(MAP);
assert.deepEqual(JSON.parse(json).selected_ids, ["entry-1"]);
assert.equal(json.includes(note.situation), false, "map state must not duplicate note text");
assert.equal(json.includes(note.thoughts), false, "map state must not duplicate interpretations");
assert.equal(json.includes("follow-1"), false, "map state must not duplicate follow-up content");
assert.ok(writes.every(({key}) => key === MAP), "map selection must never write any other storage key");

const model = room.getInnerMapModel();
assert.equal(model.length, 1);
assert.equal(model[0].follow_up_count, 1);
assert.deepEqual(Array.from(model[0].fields, x => x.key), [
  "situation", "thoughts", "feelings", "body", "actions", "next_step"
]);
assert.equal(model[0].fields[0].text, note.situation,
  "existing text is read only when building a view, never recopied");
assert.equal(model[0].fields[1].label, "Tanke / tolkning");
assert.ok(source.includes("escapeHtml(field.text)"), "all user-authored map field text must be HTML-escaped");
assert.ok(source.includes("escapeHtml(entry.situation.slice(0, 110))"),
  "picker previews must escape user-authored text");
assert.ok(css.includes("psychology-room-inner-chain"), "responsive diagram styles must exist");
assert.ok(source.includes("localStorage.removeItem(STORAGE_KEYS.innerMap)"),
  "deleting all private reflections must also clear the map selection key");
assert.ok(source.includes("GitHub Pages deler nettleserlagring"),
  "users must be warned about the shared GitHub Pages storage origin");

assert.equal(room.toggleInnerMap("entry-1").selected, false);
assert.deepEqual(Array.from(room.getInnerMapIds()), []);
assert.equal(room.toggleInnerMap("entry-2").selected, true);
assert.equal(room.getInnerMapModel()[0].id, "entry-2");

// Deleted private notes cannot appear as orphaned map entries.
store.set(WORKBENCH, JSON.stringify([note]));
assert.deepEqual(Array.from(room.getInnerMapIds()), []);
assert.equal(room.getInnerMapModel().length, 0);

// Corrupt or hostile state is ignored without reading arbitrary record keys.
store.set(MAP, JSON.stringify({ selected_ids: ["missing", {}, null, "entry-1", "entry-1"] }));
assert.deepEqual(Array.from(room.getInnerMapIds()), ["entry-1"]);

// Maximum 16 explicit selections prevents unbounded rendering.
store.set(MAP, JSON.stringify({ selected_ids: [] }));
store.set(WORKBENCH, JSON.stringify(Array.from({ length: 17 }, (_, i) => sample("id-" + i))));
for (let i = 0; i < 16; i++) assert.equal(room.toggleInnerMap("id-" + i).ok, true);
assert.equal(room.toggleInnerMap("id-16").reason, "map_limit");
assert.equal(room.getInnerMapIds().length, 16);

// No silent success when local storage is unavailable.
storage.setItem = () => { throw new Error("quota exceeded"); };
assert.equal(room.toggleInnerMap("id-1").reason, "storage_failed");
assert.equal(room.getInnerMapIds().length, 16);

console.log("Psychology 2.0 inner map: 16-ID opt-in, local-only, safe missing entries: passed");
