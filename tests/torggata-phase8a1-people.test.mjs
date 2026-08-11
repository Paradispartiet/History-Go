import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const rows = data => Array.isArray(data) ? data : (Array.isArray(data?.people) ? data.people : (data?.id ? [data] : []));
const manifest = readJson("data/people/manifest.json");
const occurrences = new Map();
for (const rel of manifest.files) {
  for (const person of rows(readJson(path.join("data", rel)))) {
    if (!person?.id) continue;
    const list = occurrences.get(person.id) || [];
    list.push({ person, rel });
    occurrences.set(person.id, list);
  }
}

const expected = [
  "thorvald_meyer",
  "henrik_bull",
  "christian_morgenstierne",
  "arne_eide",
  "thoger_binneballe",
  "harald_olsen",
  "alma_fahlstrom",
  "johan_fahlstrom",
];
const created = new Set(["thoger_binneballe", "harald_olsen", "alma_fahlstrom", "johan_fahlstrom"]);

test("Torggata 8A1 exposes exactly one active canonical record for each expected person", () => {
  for (const id of expected) {
    const hits = occurrences.get(id) || [];
    assert.equal(hits.length, 1, `${id} must have exactly one manifest-loaded canonical record`);
    assert.ok(hits[0].person.places?.includes("torggata"), `${id} must link to torggata`);
  }
});

test("new Torggata people are ready People v1 profiles with claims", () => {
  for (const id of created) {
    const { person } = occurrences.get(id)[0];
    assert.equal(person.placeId, "torggata");
    assert.equal(person.profileStandard, "people_profile_v1.0");
    assert.equal(person.profileStatus, "ready_people_v1");
    assert.ok(person.claimsFile);
    assert.ok(fs.existsSync(path.join(ROOT, person.claimsFile)));
    assert.ok(person.source_urls?.every(url => /^https:\/\//.test(url)));
  }
});

test("existing profiles keep their primary anchor", () => {
  for (const id of ["thorvald_meyer", "henrik_bull", "christian_morgenstierne", "arne_eide"]) {
    assert.notEqual(occurrences.get(id)[0].person.placeId, "torggata", `${id} primary anchor must be preserved`);
  }
  assert.equal(occurrences.get("christian_morgenstierne")[0].person.placeId, "folketeateret");
  assert.equal(occurrences.get("arne_eide")[0].person.placeId, "folketeateret");
});

test("the runtime place collector includes direct person place references", () => {
  const source = fs.readFileSync(path.join(ROOT, "js/ui/popup-utils.js"), "utf8");
  assert.match(source, /personPlaceIds\(person\)\.includes\(pid\)/);
  const torggata = expected.filter(id => occurrences.get(id)[0].person.places?.includes("torggata"));
  assert.deepEqual(torggata, expected);
});
