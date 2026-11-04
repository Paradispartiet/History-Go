import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const langPath = "data/leksikon/sprak/places/europe/norway/oslo/toyen_trafo.json";
const manifest = read("data/leksikon/sprak/manifest.json");
const language = read(langPath);

test("Tøyen trafo has canonical, manifest-linked place language", () => {
  assert.equal(manifest.place_files.toyen_trafo, langPath);
  assert.equal(language.place_id, "toyen_trafo");
  assert.equal(language.subject_id, "naeringsliv");
  assert.equal(language.entries.length, 6);
  assert.equal(new Set(language.entries.map(row => row.id)).size, 6);
  assert.ok(language.emne_ids.includes("em_naering_teknologi_infrastruktur"));
});

test("Every Tøyen trafo language entry has a precise term, true place link and HTTPS sources", () => {
  const types = new Set(["stedsnavn", "fagord"]);
  for (const row of language.entries) {
    assert.ok(types.has(row.type), row.id);
    assert.equal(row.layer, "language", row.id);
    assert.equal(row.linked_to?.kind, "place", row.id);
    assert.equal(row.linked_to?.id, "toyen_trafo", row.id);
    assert.equal(row.subject_id, "naeringsliv", row.id);
    assert.ok(row.meaning.length >= 40, row.id);
    assert.ok(row.context.length >= 40, row.id);
    assert.ok(row.sources.length >= 1, row.id);
    assert.ok(row.sources.every(source => source.url.startsWith("https://") && source.label.length > 8), row.id);
    assert.notEqual(row.status, "uncertain", row.id);
  }
  assert.equal(language.dialect_status, "not_applicable_place_level");
  assert.ok(language.entries.every(row => row.layer !== "dialect"), "No invented place-level dialect");
  const historic = language.entries.filter(row => row.status === "historical").map(row => row.term);
  assert.deepEqual(historic, ["Tøyen transformatorstasjon", "Tøyen kulturhus"]);
});

test("Place-open exposes a usable six-entry Språkleksikon owned by Tøyen trafo", () => {
  const payload = read("data/runtime/place-open/toyen_trafo.json");
  assert.equal(payload.place.id, "toyen_trafo");
  assert.equal(payload.language?.place_id, "toyen_trafo");
  assert.equal(payload.language?.entries?.length, 6);
  assert.deepEqual(payload.language.entries.map(row => row.id), language.entries.map(row => row.id));
});
