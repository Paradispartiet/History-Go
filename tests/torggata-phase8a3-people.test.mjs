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
  "nanna_broch", "wulff_becker", "martin_heinz_zilsel", "alexander_claes",
  "therese_hurwitz", "jenny_hurwitz", "fredrik_hurwitz", "moritz_glott",
];

test("Torggata 8A3 loads exactly one canonical record per selected person", () => {
  for (const id of expected) {
    const hits = occurrences.get(id) || [];
    assert.equal(hits.length, 1, `${id} must have exactly one manifest-loaded canonical record`);
    const person = hits[0].person;
    assert.equal(hits[0].rel, `people/by/oslo/torggata/${id}.json`);
    assert.equal(person.placeId, "torggata");
    assert.ok(person.places?.includes("torggata"));
    assert.equal(person.profileStandard, "people_profile_v1.0");
    assert.equal(person.profileStatus, "ready_people_v1");
    assert.equal(person.image, "");
    assert.equal(person.cardImage, "");
    assert.ok(fs.existsSync(path.join(ROOT, person.claimsFile)));
  }
});

test("8A3 preserves precise physical anchors instead of generic Torggata association", () => {
  assert.match(occurrences.get("nanna_broch")[0].person.popupDesc, /Torggata 51/);
  assert.match(occurrences.get("wulff_becker")[0].person.popupDesc, /Torggata 17b/);
  assert.match(occurrences.get("martin_heinz_zilsel")[0].person.popupDesc, /Torggata 17b/);
  assert.match(occurrences.get("alexander_claes")[0].person.popupDesc, /Torggata 18/);
  for (const id of ["therese_hurwitz", "jenny_hurwitz", "fredrik_hurwitz"]) {
    assert.match(occurrences.get(id)[0].person.popupDesc, /Torggata 36/);
  }
  assert.match(occurrences.get("moritz_glott")[0].person.popupDesc, /Torggata 33/);
});

test("Wulff stale reuse assumption is replaced by the actual canonical 8A3 record", () => {
  const hits = occurrences.get("wulff_becker") || [];
  assert.equal(hits.length, 1);
  assert.equal(hits[0].rel, "people/by/oslo/torggata/wulff_becker.json");
  const audit = fs.readFileSync(path.join(ROOT, "reports/place-production/torggata-phase8a-people-audit-v1.md"), "utf8");
  assert.match(audit, /stale audit-antakelse/);
  assert.match(audit, /tidligere oppgitte filstien finnes ikke/);
});

test("all 8A3 profiles have verified HTTPS claims and no current-actor wording contract", () => {
  for (const id of expected) {
    const person = occurrences.get(id)[0].person;
    assert.ok(person.source_urls.length >= 1);
    assert.ok(person.source_urls.every(url => /^https:\/\//.test(url)));
    const claims = readJson(person.claimsFile);
    assert.equal(claims.person_id, id);
    assert.equal(claims.completion.current_status, "ready_people_v1");
    assert.ok(claims.claims.every(item => item.status === "verified"));
    assert.ok(claims.claims.every(item => item.temporal_status === "historical"));
  }
});
