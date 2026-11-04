import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));

test("Tøyen trafo Brands contain two distinct real actors with place-specific evidence", () => {
  const actors = read("data/brands/actors_by_place.json");
  const rows = actors.toyen_trafo;
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map(x => x.id), ["oslo_teatersenter", "unge_kunstneres_samfund"]);
  assert.equal(new Set(rows.map(x => x.id)).size, 2);
  for (const row of rows) {
    assert.equal(row.entity_type, "actor");
    assert.equal(row.state, "catalog");
    assert.equal(row.verification, "verified");
    assert.ok(row.actor_role.length > 80);
    assert.ok(row.source_urls.length >= 2);
    assert.ok(row.source_urls.every(url => url.startsWith("https://")));
    assert.ok(!row.name.toLowerCase().includes("tøyen trafo"));
  }
  assert.match(rows[0].actor_role, /siden åpningen i 1975/);
  assert.match(rows[1].actor_role, /initiativrolle, ikke et fast leieforhold/);
});

test("Tøyen trafo Place-open displays the correct Brands without changing other collections", () => {
  const payload = read("data/runtime/place-open/toyen_trafo.json");
  const actors = read("data/brands/actors_by_place.json").toyen_trafo;
  assert.deepEqual(payload.brands.map(row => row.id), actors.map(row => row.id));
  assert.deepEqual(payload.people.map(row => row.id), ["thorvald_astrup","kari_rolfsen"]);
  assert.equal(payload.stories.length, 1);
  assert.equal(payload.leksikon.length, 1);
  assert.equal(payload.lesespor.length, 4);
  assert.equal(payload.language.entries.length, 6);
});
