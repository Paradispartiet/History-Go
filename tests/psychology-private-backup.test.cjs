const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");
const { TextEncoder, TextDecoder } = require("node:util");

const source = fs.readFileSync("js/psychologyPrivateBackup.js", "utf8");
const NOTES = "hg_psychology_workbench_v1";
const MAP = "hg_psychology_inner_map_v1";
const context = {
  crypto: webcrypto, TextEncoder, TextDecoder,
  Uint8Array, Set, Object, JSON, Number,
  btoa(binary) { return Buffer.from(binary, "binary").toString("base64"); },
  atob(encoded) { return Buffer.from(encoded, "base64").toString("binary"); }
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "psychologyPrivateBackup.js" });
const backup = context.HGPsychologyPrivateBackup;

const sample = {
  workbench: [{
    id: "synthetic-note-1", created_at: "2026-11-20T12:00:00.000Z",
    situation: "Privat test: en blå papirfugl",
    thoughts: "Dette skal bare finnes i krypterte bytes",
    feelings: "rolig",
    follow_ups: [{
      id: "follow-1", created_at: "2026-11-20T13:00:00.000Z",
      tried: "Skrev en setning", outcome: "Kun testdata"
    }, {
      id: "follow-legacy", tried: "Eldre notat", outcome: "Mangler tidsstempel"
    }]
  }, {
    id: "synthetic-note-2", created_at: "2026-11-19T12:00:00.000Z",
    situation: "Neste testrefleksjon"
  }],
  inner_map: {
    version: 4,
    selected_ids: ["synthetic-note-1", "synthetic-note-2"],
    links: [{ from: "synthetic-note-1", to: "synthetic-note-2", kind: "similar" }],
    layout: { "synthetic-note-1": { x: 0.4, y: 0.5 } },
    groups: [{ id: "group-1", label: "Test-tema" }],
    assignments: { "synthetic-note-1": "group-1" }
  }
};
function storage(initial = {}) {
  const saved = new Map(Object.entries(initial));
  const keys = [];
  let block = null;
  return {
    saved, keys,
    getItem(key) { keys.push(["get", key]); return saved.has(key) ? saved.get(key) : null; },
    setItem(key, value) {
      keys.push(["set", key]);
      if (block === key) throw Error("QuotaExceededError");
      saved.set(key, String(value));
    },
    removeItem(key) { keys.push(["remove", key]); saved.delete(key); },
    failOn(key) { block = key; }
  };
}
const existing = storage({ [NOTES]: JSON.stringify(sample.workbench),
  [MAP]: JSON.stringify(sample.inner_map) });
const password = "Et sterkt og helt privat testpassord";
async function run() {
  await assert.rejects(backup.exportEncrypted(existing, "kort"), /invalid_password/);
  const exported = await backup.exportEncrypted(existing, password);
  assert.equal(exported.count, 2);
  assert.ok(exported.text.includes(backup.format));
  assert.ok(!exported.text.includes("Privat test: en blå papirfugl"),
    "the encrypted file must contain no plaintext notes");
  assert.ok(!exported.text.includes("Test-tema"), "group names must be encrypted");
  assert.ok(!exported.text.includes(password), "password must not be serialized");
  assert.ok(existing.keys.every(([, key]) => [NOTES, MAP].includes(key)),
    "export must not read or write AHA or other keys");
  assert.ok(!existing.keys.some(([op]) => op === "set"), "export is read-only");
  const second = await backup.exportEncrypted(existing, password);
  assert.notEqual(exported.text, second.text, "a fresh salt and IV are required each time");

  await assert.rejects(backup.decryptBackup(exported.text, "Feil passord med lengde nok"),
    /cannot_decrypt/, "incorrect passphrase must fail GCM authentication");
  const tampered = JSON.parse(exported.text);
  tampered.data = "AAAA" + tampered.data.slice(4);
  await assert.rejects(backup.decryptBackup(JSON.stringify(tampered), password),
    /cannot_decrypt/, "tampered ciphertext must not decrypt");
  await assert.rejects(backup.decryptBackup("{}", password), /invalid_file/);

  const content = await backup.decryptBackup(exported.text, password);
  assert.equal(content.workbench.length, 2);
  assert.equal(content.workbench[0].situation, sample.workbench[0].situation);
  assert.equal(content.workbench[0].follow_ups.length, 2,
    "legacy follow-ups without timestamps must survive the encrypted roundtrip");
  assert.equal(content.workbench[0].follow_ups[1].created_at, undefined);
  assert.equal(content.inner_map.groups[0].label, "Test-tema");
  assert.equal(content.inner_map.links.length, 1);

  await assert.rejects(backup.restoreEncrypted(existing, exported.text, password),
    /archive_not_empty/, "import must never silently overwrite existing notes");
  const restored = storage();
  const result = await backup.restoreEncrypted(restored, exported.text, password);
  assert.equal(result.count, 2);
  assert.equal(JSON.parse(restored.saved.get(NOTES))[0].situation,
    sample.workbench[0].situation);
  assert.equal(JSON.parse(restored.saved.get(MAP)).groups[0].label, "Test-tema");

  // While async WebCrypto decryption is running, another action may save
  // an archive. Both note-only and map-only writes must survive untouched.
  for (const [key, value] of [
    [NOTES, JSON.stringify([{ id: "new-note", situation: "New synthetic note" }])],
    [MAP, JSON.stringify({ version: 4, selected_ids: [] })]
  ]) {
    const changedDuringDecrypt = storage();
    const pending = backup.restoreEncrypted(changedDuringDecrypt, exported.text, password);
    changedDuringDecrypt.setItem(key, value);
    await assert.rejects(pending, /archive_not_empty/);
    assert.equal(changedDuringDecrypt.saved.get(key), value);
    assert.equal(changedDuringDecrypt.saved.size, 1, "restore must not add a second key");
    assert.equal(changedDuringDecrypt.keys.filter(([op]) => op === "set").length, 1,
      "only the intervening write may mutate storage");
  }

  const failedMap = storage();
  failedMap.failOn(MAP);
  await assert.rejects(backup.restoreEncrypted(failedMap, exported.text, password),
    /storage_failed/);
  assert.equal(failedMap.saved.has(NOTES), false,
    "failed second write must roll back the first key");
  assert.equal(failedMap.saved.has(MAP), false);

  const corrupt = storage({ [NOTES]: "{bad", [MAP]: JSON.stringify(sample.inner_map) });
  await assert.rejects(backup.exportEncrypted(corrupt, password), /invalid_stored_data/);
  assert.equal(corrupt.saved.get(NOTES), "{bad");

  const missingKey = storage({ [NOTES]: JSON.stringify(sample.workbench),
    [MAP]: JSON.stringify({ selected_ids: ["missing-note"] }) });
  await assert.rejects(backup.exportEncrypted(missingKey, password), /invalid_backup/,
    "dangling map refs must never be exported as valid backup");
  console.log("Psychology encrypted backup: PBKDF2/AES-GCM, ciphertext privacy, file integrity and restore safeguards passed");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
