const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("js/psychologyRoom.js", "utf8");
const KEY = "hg_psychology_workbench_v1";
const records = new Map();
const writes = [];
let failRead = false;
let failWrite = false;

const storage = {
  getItem(key) {
    if (failRead && key === KEY) throw new Error("read denied");
    return records.has(key) ? records.get(key) : null;
  },
  setItem(key, value) {
    if (failWrite && key === KEY) throw new Error("QuotaExceededError");
    writes.push(key);
    records.set(key, String(value));
  },
  removeItem(key) { records.delete(key); }
};
const context = {
  console, localStorage: storage, Date, Set, Map, JSON,
  CustomEvent: class {}, dispatchEvent() {},
  fetch() { throw new Error("No fetch in private storage tests"); },
  AHARepository: new Proxy({}, { get() { throw new Error("No AHA storage access"); } }),
  EchoNet: new Proxy({}, { get() { throw new Error("No EchoNet access"); } }),
  showToast() {}
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "psychologyRoom.js" });
const room = context.PsychologyRoom;

assert.equal(room.saveWorkbench({ situation: "   " }).reason, "situation_required");
assert.equal(records.has(KEY), false);

const original = Array.from({ length: 30 }, (_, i) => ({
  id: "old-" + i, created_at: "2026-01-01T00:00:00.000Z",
  situation: "Tidligere refleksjon " + i, thoughts: "Behold dette"
}));
records.set(KEY, JSON.stringify(original));
const saved = room.saveWorkbench({ situation: "Refleksjon nummer 31" });
assert.equal(saved.saved, true);
assert.equal(room.getWorkbenchEntries().length, 31);
assert.equal(room.getWorkbenchEntries()[0].id, "old-0");
assert.equal(room.getWorkbenchEntries()[30].situation, "Refleksjon nummer 31");

const following = room.saveWorkbench({ situation: "Refleksjon nummer 32" });
assert.equal(following.saved, true);
assert.equal(room.getWorkbenchEntries().length, 32);
assert.notEqual(saved.entry.id, following.entry.id, "IDs must be unique for back-to-back saves");
assert.equal(room.getWorkbenchEntries()[0].thoughts, "Behold dette");
assert.ok(writes.every(key => key === KEY), "no AHA, screening or server storage writes");

const followUp = room.saveWorkbenchFollowUp("old-0", {
  tried: "En liten øvelse", outcome: "Fungerte fint"
});
assert.equal(followUp.saved, true);
assert.equal(room.getWorkbenchEntries().length, 32);
assert.equal(room.getWorkbenchEntries()[0].follow_ups.length, 1);

failWrite = true;
const beforeQuota = records.get(KEY);
const blocked = room.saveWorkbench({ situation: "Må ikke melde lagret" });
assert.equal(blocked.saved, false);
assert.equal(blocked.reason, "storage_failed");
const blockedFollowUp = room.saveWorkbenchFollowUp("old-0", {
  tried: "Nytt", outcome: "Skal ikke lagres"
});
assert.equal(blockedFollowUp.saved, false);
assert.equal(blockedFollowUp.reason, "storage_failed");
assert.equal(records.get(KEY), beforeQuota, "quota failures must not destroy the prior archive");
failWrite = false;

records.set(KEY, "{invalid json");
const beforeCorruption = records.get(KEY);
const broken = room.saveWorkbench({ situation: "Må ikke overskrive korrupt arkiv" });
assert.equal(broken.saved, false);
assert.equal(records.get(KEY), beforeCorruption, "invalid JSON must never be overwritten");
assert.equal(room.saveWorkbenchFollowUp("old-0", {
  tried: "a", outcome: "b"
}).saved, false);
assert.equal(records.get(KEY), beforeCorruption);

records.set(KEY, JSON.stringify({ not: "an array" }));
assert.equal(room.saveWorkbench({ situation: "Må avvises" }).reason, "invalid_stored_data");
assert.equal(JSON.parse(records.get(KEY)).not, "an array");
records.delete(KEY);
failRead = true;
assert.equal(room.saveWorkbench({ situation: "Lagring ikke tilgjengelig" }).saved, false);
assert.equal(records.has(KEY), false, "unreadable storage must not be reset");
failRead = false;

console.log("Psychology workbench archive: 32+ notes, no silent truncation, unique IDs and storage-failure safeguards passed");
