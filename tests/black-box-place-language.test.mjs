import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

test("Black Box har kildebundet Språkleksikon på sted og i runtime", () => {
  const manifest = load("data/leksikon/sprak/manifest.json");
  const path = "data/leksikon/sprak/places/europe/norway/oslo/black_box_teater.json";
  assert.equal(manifest.place_files.black_box_teater, path);
  const source = load(path);
  const runtime = load("data/runtime/place-open/black_box_teater.json");
  assert.equal(source.place_id, "black_box_teater");
  assert.ok(source.entries.length >= 6);
  assert.deepEqual(runtime.language, source);
  assert.ok(source.entries.some(entry => entry.term === "Månedens forestilling"));
  assert.ok(source.entries.every(entry => entry.layer === "language" && entry.linked_to.id === source.place_id));
  assert.ok(source.entries.every(entry => entry.sources?.every(s => /^https:\/\//.test(s.url))));
  assert.ok(!source.entries.some(entry => entry.layer === "dialect"));
});
