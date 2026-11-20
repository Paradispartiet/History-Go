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

// v3 stores only user-chosen graph coordinates, never the underlying note text.
const startPosition = room.getInnerMapPositions()[0];
assert.equal(startPosition.id, "entry-1");
assert.equal(startPosition.x, 0.15);
assert.equal(room.setInnerMapPosition("missing", 0.4, 0.4).reason, "invalid_position");
assert.equal(room.setInnerMapPosition("entry-1", NaN, 0.4).reason, "invalid_position");
assert.equal(room.setInnerMapPosition("entry-1", "0.4", 0.4).reason, "invalid_position");
assert.equal(room.setInnerMapPosition("entry-1", 0.4, 0.45).ok, true);
assert.deepEqual(JSON.parse(store.get(MAP)).layout["entry-1"], { x: 0.4, y: 0.45 });
assert.equal(JSON.parse(store.get(MAP)).version, 4);
assert.equal(store.get(MAP).includes(note.situation), false);
assert.equal(room.setInnerMapPosition("entry-1", 1, -1).ok, true);
assert.deepEqual(JSON.parse(store.get(MAP)).layout["entry-1"], { x: 0.89, y: 0.1 },
  "out-of-range pointer positions must be clamped inside the canvas");
assert.ok(writes.every(({ key }) => key === MAP), "moving notes must never write elsewhere");

// Voluntary thematic grouping reuses selected IDs; group names never imply a diagnosis.
assert.deepEqual(Array.from(room.getInnerMapGroups()), []);
assert.deepEqual(Object.keys(room.getInnerMapAssignments()), []);
assert.equal(room.createInnerMapGroup("").reason, "invalid_label");
assert.equal(room.createInnerMapGroup("x".repeat(41)).reason, "invalid_label");
assert.equal(room.createInnerMapGroup("Arbeid").ok, true);
assert.equal(room.createInnerMapGroup("arbeid").reason, "duplicate_group");
assert.equal(room.createInnerMapGroup("Fritid").ok, true);
assert.deepEqual(Array.from(room.getInnerMapGroups(), group => [group.id, group.label]),
  [["group-1", "Arbeid"], ["group-2", "Fritid"]]);
assert.equal(room.setInnerMapGroup("entry-1", "missing").reason, "invalid_group");
assert.equal(room.setInnerMapGroup("entry-2", "group-2").reason, "invalid_group",
  "note must be selected before any group assignment");
assert.equal(room.setInnerMapGroup("entry-1", "group-1").ok, true);
assert.equal(room.getInnerMapAssignments()["entry-1"], "group-1");
assert.equal(room.setInnerMapPosition("entry-1", 0.4, 0.46).ok, true);
assert.equal(room.getInnerMapAssignments()["entry-1"], "group-1",
  "moving a node must not drop its group");
assert.ok(!store.get(MAP).includes(note.situation) && !store.get(MAP).includes(note.thoughts),
  "groups and layout must not copy workbench content");
assert.ok(writes.every(({ key }) => key === MAP), "groups never touch AHA or other storage");
assert.equal(room.deleteInnerMapGroup("missing").reason, "unknown_group");
assert.equal(room.deleteInnerMapGroup("group-1").ok, true);
assert.equal(room.getInnerMapAssignments()["entry-1"], undefined,
  "deleting a group clears its assignment without deleting the note");
assert.equal(room.getInnerMapIds().length, 1);

// Connections are explicitly created; no relationships appear automatically.
assert.deepEqual(Array.from(room.getInnerMapLinks()), []);
assert.equal(room.connectInnerMapEntries("entry-1", "entry-2", "similar").reason,
  "invalid_selection", "both source notes must be selected");
assert.equal(room.toggleInnerMap("entry-2").ok, true);
assert.equal(room.connectInnerMapEntries("entry-1", "entry-1", "similar").reason,
  "invalid_selection", "self-links are forbidden");
assert.equal(room.connectInnerMapEntries("entry-1", "entry-2", "unknown").reason,
  "invalid_relation", "relationship names come from fixed choices");
assert.equal(room.connectInnerMapEntries("entry-1", "entry-2", "similar").ok, true);
assert.deepEqual(Array.from(room.getInnerMapLinks(), x => [x.from, x.to, x.kind]),
  [["entry-1", "entry-2", "similar"]]);
assert.deepEqual(JSON.parse(store.get(MAP)).links,
  [{ from: "entry-1", to: "entry-2", kind: "similar" }]);
assert.ok(!store.get(MAP).includes(note.situation) && !store.get(MAP).includes(note.thoughts),
  "links may include IDs and enums but never note text");
assert.ok(writes.every(({key}) => key === MAP),
  "connections must never write to AHA, backend, or other storage");
assert.equal(room.connectInnerMapEntries("entry-2", "entry-1", "connected").reason,
  "already_connected", "reverse duplicates are rejected");
assert.equal(room.disconnectInnerMapEntries("entry-2", "entry-1").ok, true);
assert.equal(room.getInnerMapLinks().length, 0);
assert.equal(room.disconnectInnerMapEntries("entry-1", "entry-2").reason, "not_found");
assert.equal(room.connectInnerMapEntries("entry-1", "entry-2", "contrast").ok, true);
assert.equal(room.toggleInnerMap("entry-2").selected, false);
assert.equal(room.getInnerMapLinks().length, 0, "removing a mapped note prunes links");
assert.deepEqual(JSON.parse(store.get(MAP)).links, []);
assert.equal(JSON.parse(store.get(MAP)).layout["entry-2"], undefined,
  "removing a map entry must discard its saved position");
assert.equal(room.setInnerMapGroup("entry-2", "group-2").ok, true);
assert.equal(room.getInnerMapAssignments()["entry-2"], "group-2");
assert.equal(room.toggleInnerMap("entry-2").selected, false);
assert.equal(room.getInnerMapAssignments()["entry-2"], undefined,
  "removing a note must also remove its group assignment");



// Malformed state is filtered without side effects or prototype-property abuse.
store.set(MAP, JSON.stringify({
  selected_ids: ["entry-1", "entry-2"],
  links: [
    { from: "entry-1", to: "entry-1", kind: "similar" },
    { from: "entry-1", to: "missing", kind: "similar" },
    { from: "entry-1", to: "entry-2", kind: "__proto__" },
    { from: "entry-1", to: "entry-2", kind: { suspicious: true } },
    { from: "entry-1", to: "entry-2", kind: "explore" },
    { from: "entry-2", to: "entry-1", kind: "similar" }
  ]
}));
const writesBeforeRead = writes.length;
assert.deepEqual(Array.from(room.getInnerMapLinks(), link => link.kind), ["explore"]);
assert.equal(writes.length, writesBeforeRead, "reads do not mutate private storage");
assert.equal(room.disconnectInnerMapEntries("entry-1", "entry-2").ok, true);
assert.equal(room.toggleInnerMap("entry-2").selected, false);

assert.equal(room.toggleInnerMap("entry-1").selected, false);
assert.deepEqual(Array.from(room.getInnerMapIds()), []);
assert.equal(room.toggleInnerMap("entry-2").selected, true);
assert.equal(room.getInnerMapModel()[0].id, "entry-2");

// Deleted private notes cannot appear as orphaned map entries.
store.set(WORKBENCH, JSON.stringify([note]));
assert.deepEqual(Array.from(room.getInnerMapIds()), []);
assert.equal(room.getInnerMapModel().length, 0);

// A chronology is read from existing timestamps and never adds time guesses or writes.
store.set(WORKBENCH, JSON.stringify([
  sample("entry-1", { created_at: "2026-11-18T12:00:00.000Z" }),
  sample("entry-2", { created_at: "2026-11-17T12:00:00.000Z" })
]));
store.set(MAP, JSON.stringify({ selected_ids: ["entry-1", "entry-2"], links: [],
  groups: [{ id: "group-1", label: "<img src=x onerror=alert(1)>" },
    { id: "__proto__", label: "unsafe" }],
  assignments: { "entry-1": "group-1", "entry-2": "missing", missing: "group-1" } }));
const timelineReadCount = writes.length;
assert.deepEqual(Array.from(room.getInnerMapTimeline(), item => item.id), ["entry-2", "entry-1"],
  "timeline shows the user's real dates from oldest to newest");
assert.equal(writes.length, timelineReadCount, "timeline reads must not write");
assert.deepEqual(Array.from(room.getInnerMapGroups(), item => item.id), ["group-1"]);
assert.deepEqual(Object.keys(room.getInnerMapAssignments()), ["entry-1"],
  "invalid group references, prototype-like IDs and missing notes are ignored");
assert.ok(source.includes("escapeHtml(item.label)"), "group names must be escaped");
assert.ok(source.includes("escapeHtml(groupLabel)"), "graph labels must be escaped");
store.set(WORKBENCH, JSON.stringify([note, sample("entry-2")]));

// Corrupt or hostile state is ignored without reading arbitrary record keys.
store.set(MAP, JSON.stringify({ selected_ids: ["missing", {}, null, "entry-1", "entry-1"] }));
assert.deepEqual(Array.from(room.getInnerMapIds()), ["entry-1"]);

// Malformed or stale map positions must be ignored without mutating storage.
store.set(MAP, JSON.stringify({
  selected_ids: ["entry-1"], links: [],
  layout: { "entry-1": { x: "invalid", y: 0.5 }, missing: { x: 0.3, y: 0.4 } }
}));
const beforeInvalidRead = writes.length;
assert.equal(room.getInnerMapPositions()[0].x, 0.15);
assert.equal(writes.length, beforeInvalidRead, "a read must not repair data silently");

// Maximum 16 explicit selections prevents unbounded rendering.
store.set(MAP, JSON.stringify({ selected_ids: [] }));
store.set(WORKBENCH, JSON.stringify(Array.from({ length: 17 }, (_, i) => sample("id-" + i))));
for (let i = 0; i < 16; i++) assert.equal(room.toggleInnerMap("id-" + i).ok, true);
assert.equal(room.toggleInnerMap("id-16").reason, "map_limit");
assert.equal(room.getInnerMapIds().length, 16);

// Six groups maximum, with no inferred grouping or private note copying.
for (let i = 1; i <= 6; i++) {
  assert.equal(room.createInnerMapGroup("Tema " + i).ok, true);
}
assert.equal(room.createInnerMapGroup("Et syvende tema").reason, "group_limit");
assert.equal(room.getInnerMapGroups().length, 6);

// Bound user-defined links independently of the 16-note limit.
for (let i = 0, count = 0; i < 16 && count < 32; i++) {
  for (let j = i + 1; j < 16 && count < 32; j++) {
    assert.equal(room.connectInnerMapEntries("id-" + i, "id-" + j, "connected").ok, true);
    count++;
  }
}
assert.equal(room.getInnerMapLinks().length, 32);
assert.equal(room.connectInnerMapEntries("id-7", "id-15", "connected").reason, "link_limit");


// No silent success when local storage is unavailable.
storage.setItem = () => { throw new Error("quota exceeded"); };
assert.equal(room.toggleInnerMap("id-1").reason, "storage_failed");
assert.equal(room.disconnectInnerMapEntries("id-0", "id-1").reason, "storage_failed");
assert.equal(room.getInnerMapLinks().length, 32, "failed writes leave the map unchanged");
assert.equal(room.getInnerMapIds().length, 16);
assert.equal(room.setInnerMapPosition("id-0", 0.4, 0.4).reason, "storage_failed");
assert.equal(room.setInnerMapGroup("id-0", "group-1").reason, "storage_failed");
assert.equal(room.deleteInnerMapGroup("group-1").reason, "storage_failed");

console.log("Psychology 2.0 inner map: 16-ID opt-in, local-only, safe missing entries: passed");
