import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/oslo_posthus.json";
const personFile = "data/people/naeringsliv/oslo/oslo_posthus/rudolf_emanuel_jacobsen.json";
const claimsFile = "data/people/claims/naeringsliv/oslo/oslo_posthus/rudolf_emanuel_jacobsen.claims.json";
const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_oslo_posthus.json";
const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/oslo_posthus.json";

const place = read(placeFile);
const [rudolf] = read(personFile);
const claims = read(claimsFile);
const peopleManifest = read("data/people/manifest.json");
const leksikonManifest = read("data/leksikon/manifest.json");
const languageManifest = read("data/leksikon/sprak/manifest.json");
const story = read("data/stories/stories_oslo_posthus.json");
const runtime = read("data/runtime/place-open/oslo_posthus.json");

test("Oslo Posthus is a complete building production at the verified Hovedpostkontoret address", () => {
  assert.equal(place.id, "oslo_posthus");
  assert.equal(place.address.street, "Dronningens gate");
  assert.equal(place.address.number, "15");
  assert.equal(place.lat, 59.91038965689687);
  assert.equal(place.lon, 10.746007652609869);
  assert.equal(place.production_status, "complete");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.placeScope, "building");
  assert.equal(place.image, "bilder/places/oslo_posthus.webp");
  assert.equal(place.cardImage, "bilder/kort/places/oslo_posthus.webp");
  assert.equal(place.frontImage, "bilder/places/oslo_posthus_front_portrait.webp");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "structures"]);
  assert.ok(place.related_people_ids.includes("rudolf_emanuel_jacobsen"));
  assert.equal(place.structures[0].id, "oslo_posthus_hovedpostkontoret");
  assert.equal(place.for_na.beforeImage, "bilder/places/oslo_posthus_1924.webp");
  assert.equal(place.for_na.nowImage, "bilder/places/oslo_posthus.webp");
});

test("Rudolf Emanuel Jacobsen is a direct, claim-bound Oslo Posthus profile", () => {
  assert.equal(rudolf.id, "rudolf_emanuel_jacobsen");
  assert.equal(rudolf.placeId, "oslo_posthus");
  assert.equal(rudolf.source_place_id, "oslo_posthus");
  assert.deepEqual(rudolf.places, ["oslo_posthus"]);
  assert.equal(rudolf.profileStatus, "ready_people_v1");
  assert.equal(rudolf.birth_date, "1879-10-27");
  assert.equal(rudolf.death_date, "1937-06-18");
  assert.equal(rudolf.image, "bilder/kort/people/rudolf_emanuel_jacobsen.webp");
  assert.ok(peopleManifest.files.includes(personFile.replace(/^data\//, "")));

  const architect = claims.claims.find((claim) => claim.id === "posthouse_architect");
  assert.ok(architect);
  assert.equal(architect.status, "verified");
  assert.equal(architect.evidence_level, "direct");
  assert.equal(architect.source_url, "https://oslobyleksikon.no/side/Hovedpostkontoret");
  assert.deepEqual(claims.field_claim_map["places[oslo_posthus]"], ["posthouse_architect"]);
  assert.equal(claims.completion.claims_verified, "7/7");
  assert.equal(claims.completion.current_status, "ready_people_v1");
  assert.ok(claims.claims.every((claim) => claim.status === "verified" && claim.evidence_level === "direct"));
});

test("Oslo Posthus learning surfaces and place-open runtime are materialized", () => {
  assert.ok(leksikonManifest.files.includes(leksikonFile));
  assert.equal(languageManifest.place_files.oslo_posthus, languageFile);
  assert.equal(story.length, 1);
  assert.equal(story[0].quality_profile, "episode_v1");
  assert.ok(story[0].related_people.includes("rudolf_emanuel_jacobsen"));

  const runtimePeople = runtime.people.map((person) => person.id);
  assert.ok(runtimePeople.includes("rudolf_emanuel_jacobsen"));
  assert.ok(runtimePeople.includes("christian_schweigaard_post_og_administrasjon"));
  assert.ok(runtime.leksikon.length > 0);
  assert.equal(runtime.language.place_id, "oslo_posthus");
  assert.ok(runtime.language.entries.some((entry) => entry.term === "postterminal"));
});

test("Oslo Posthus materialization leaves no temporary workflow behind", () => {
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/_oslo-posthus-materialize-once.yml")), false);
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/_oslo-posthus-ci-closure-once.yml")), false);
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/_oslo-posthus-scenario-people-regen-once.yml")), false);
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/_oslo-posthus-epoke-baseline-once.yml")), false);
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/_oslo-posthus-postmerge-fagverk-release-once.yml")), false);
});
