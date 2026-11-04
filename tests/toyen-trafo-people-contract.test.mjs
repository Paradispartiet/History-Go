import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const entries = [
  ["thorvald_astrup", "data/people/by/oslo/toyen_trafo/thorvald_astrup.json", "data/people/claims/by/oslo/toyen_trafo/thorvald_astrup.claims.json"],
  ["kari_rolfsen", "data/people/kunst/oslo/toyen_trafo/kari_rolfsen.json", "data/people/claims/kunst/oslo/toyen_trafo/kari_rolfsen.claims.json"],
];
test("Tøyen trafo: two unique source-mapped People profiles", () => {
  const manifest=read("data/people/manifest.json");
  const ids = new Set();
  for(const [id,file,claimsFile] of entries){
    assert.ok(manifest.files.includes(file.slice(5)), "canonical profile must be registered");
    const profile=read(file)[0], claims=read(claimsFile);
    assert.equal(profile.id,id);
    assert.equal(profile.placeId,"toyen_trafo");
    assert.deepEqual(profile.places,["toyen_trafo"]);
    assert.equal(profile.profileStatus,"ready_people_v1");
    assert.equal(claims.person_id,id);
    assert.equal(claims.identity.identity_status,"verified");
    assert.equal(claims.completion.current_status,"ready_people_v1");
    assert.ok(claims.claims.length>=5);
    assert.ok(claims.claims.every(c=>c.status==="verified"&&c.source_url.startsWith("https://")));
    assert.ok(claims.field_claim_map["places[toyen_trafo]"].length);
    assert.ok(claims.sentence_claim_map.popupDesc.length>=5);
    assert.ok(!ids.has(id)); ids.add(id);
  }
});
test("Tøyen trafo: generated place-open has People and preserves approved collections",()=>{
  const payload=read("data/runtime/place-open/toyen_trafo.json");
  assert.deepEqual(payload.people.map(p=>p.id),entries.map(row=>row[0]));
  assert.equal(payload.lesespor.length,4);
  assert.equal(payload.leksikon.length,1);
  assert.equal(payload.stories.length,1);
  assert.equal(payload.language.entries.length,6);
  assert.deepEqual(payload.brands,[]);
});
