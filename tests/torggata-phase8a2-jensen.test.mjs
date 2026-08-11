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
const expected = ["ludvig_christian_jensen", "adelsten_jensen", "peter_marinius_jensen", "karl_a_jensen", "thorvald_jensen"];

test("Torggata 8A2 loads exactly one canonical Jensen record per person", () => {
  for (const id of expected) {
    const hits = occurrences.get(id) || [];
    assert.equal(hits.length, 1, `${id} must have exactly one manifest-loaded canonical record`);
    assert.equal(hits[0].person.placeId, "torggata");
    assert.ok(hits[0].person.places?.includes("torggata"));
    assert.equal(hits[0].person.profileStandard, "people_profile_v1.0");
    assert.equal(hits[0].person.profileStatus, "ready_people_v1");
    assert.ok(fs.existsSync(path.join(ROOT, hits[0].person.claimsFile)));
  }
});

test("Adelsten uses the dedicated source chronology instead of the older shorthand", () => {
  const { person } = occurrences.get("adelsten_jensen")[0];
  assert.match(person.popupDesc, /1866–1918/);
  assert.match(person.popupDesc, /Torggata 2/);
  assert.match(person.popupDesc, /1901/);
  assert.doesNotMatch(person.popupDesc, /1866–1916/);
  assert.ok(person.source_urls.includes("https://oslobyleksikon.no/side/Adelsten_Jensen"));
});

test("Thorvald does not invent a dated partnership year", () => {
  const { person } = occurrences.get("thorvald_jensen")[0];
  assert.equal(Object.hasOwn(person, "year"), false);
  assert.match(person.popupDesc, /kompanjong/);
  assert.match(person.popupDesc, /Torggata 5a/);
});

test("all Jensen profiles have HTTPS source chains and completed claims", () => {
  for (const id of expected) {
    const { person } = occurrences.get(id)[0];
    assert.ok(person.source_urls.length >= 1);
    assert.ok(person.source_urls.every(url => /^https:\/\//.test(url)));
    const claims = readJson(person.claimsFile);
    assert.equal(claims.person_id, id);
    assert.equal(claims.completion.current_status, "ready_people_v1");
    assert.ok(claims.claims.every(item => item.status === "verified"));
  }
});
