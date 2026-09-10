import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const [halvor] = read("data/people/naeringsliv/oslo/ovre_foss/halvor_schou.json");
const claims = read("data/people/claims/naeringsliv/oslo/ovre_foss/halvor_schou.claims.json");
const schousRuntime = read("data/runtime/place-open/schous_bryggeri.json");

test("Halvor Schou has a direct, evidence-bound Schous Bryggeri profile link", () => {
  assert.equal(halvor.id, "halvor_schou");
  assert.equal(halvor.placeId, "glads_molle");
  assert.equal(halvor.source_place_id, "glads_molle");
  assert.ok(halvor.places.includes("schous_bryggeri"));
  assert.doesNotMatch(JSON.stringify(halvor), /schous_bryggeri_pending_direct_profile_upgrade/);

  const takeover = claims.claims.find((claim) => claim.id === "schous_bryggeri_takeover");
  assert.ok(takeover);
  assert.equal(takeover.status, "verified");
  assert.equal(takeover.evidence_level, "direct");
  assert.equal(takeover.source_url, "https://snl.no/Halvor_Schou");
  assert.deepEqual(claims.field_claim_map["places[schous_bryggeri]"], ["schous_bryggeri_takeover"]);
  assert.equal(claims.completion.claims_verified, "11/11");
  assert.equal(claims.completion.current_status, "ready_people_v1");
});

test("Schous place-open runtime exposes Halvor without displacing the canonical Christian Julius Schou profile", () => {
  const ids = schousRuntime.people.map((person) => person.id);
  assert.ok(ids.includes("halvor_schou"));
  assert.ok(ids.includes("christian_julius_schou"));

  const runtimeHalvor = schousRuntime.people.find((person) => person.id === "halvor_schou");
  assert.ok(runtimeHalvor.places.includes("schous_bryggeri"));
  assert.equal(runtimeHalvor.placeId, "glads_molle");
});
