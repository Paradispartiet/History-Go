import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const placeFile = "data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/stortorget.json";
const peopleFile = "data/people/by/oslo/stortorget/people_stortorget.json";
const claimsFile = "data/people/claims/by/oslo/stortorget/carl_ludvig_jacobsen.claims.json";
const productionFile = "data/places/production/stortorget.json";
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_stortorget.json";
const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/stortorget.json";
const storyFile = "data/stories/stories_stortorget.json";

const place = read(placeFile);
const [carl] = read(peopleFile);
const claims = read(claimsFile);
const production = read(productionFile);
const runtime = read("data/runtime/place-open/stortorget.json");

test("Stortorget is a complete canonical square without coordinate drift", () => {
  assert.equal(place.id, "stortorget");
  assert.equal(place.lat, 59.9127766);
  assert.equal(place.lon, 10.7451906);
  assert.equal(place.sourceObjectId, "osm-way:179095465");
  assert.equal(place.locatorType, "square");
  assert.equal(place.coordRole, "area_anchor");
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.equal(place.image, "bilder/places/stortorget.webp");
  assert.equal(place.cardImage, "bilder/kort/places/stortorget.webp");
  assert.equal(place.frontImage, "bilder/places/stortorget_front_portrait.webp");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.deepEqual(place.brands, []);
});

test("Stortorget has real People, object and related-place surfaces", () => {
  assert.ok(place.related_people_ids.includes("carl_ludvig_jacobsen"));
  assert.ok(place.civication_store.some((item) => item.id === "stortorget_christian_iv_monument" && item.physicalObject === true));
  assert.deepEqual(place.related_place_ids, ["oslo_domkirke", "christiania_torv", "youngstorget", "kirkeristen_basarene_brannvakten"]);
  assert.equal(carl.id, "carl_ludvig_jacobsen");
  assert.equal(carl.placeId, "stortorget");
  assert.equal(carl.profileStatus, "ready_people_v1");
  assert.equal(carl.image, "bilder/kort/people/carl_ludvig_jacobsen.webp");
  assert.equal(claims.completion.claims_verified, "6/6");
  assert.ok(claims.claims.every((claim) => claim.status === "verified" && claim.evidence_level === "direct"));
});

test("Stortorget learning and before/now surfaces are materialized", () => {
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.completion.currentStatus, "current");
  assert.equal(production.completion.claimsVerified.verified, production.completion.claimsVerified.total);
  assert.equal(production.quizReadiness.questions.length, 8);
  assert.ok(production.quizReadiness.questions.filter((question) => question.normalKnowledgeQuestion === true).length >= 5);
  assert.equal(place.for_na.beforeImage, "bilder/historisk/stortorget/stortorget_marked_1843.webp");
  assert.equal(place.for_na.nowImage, "bilder/places/stortorget.webp");
  assert.ok(fs.existsSync(path.join(root, leksikonFile)));
  assert.ok(fs.existsSync(path.join(root, languageFile)));
  assert.ok(fs.existsSync(path.join(root, storyFile)));
  assert.ok(runtime.people.some((person) => person.id === "carl_ludvig_jacobsen"));
  assert.ok(runtime.leksikon.length > 0);
  assert.equal(runtime.language.place_id, "stortorget");
  assert.ok(runtime.language.entries.some((entry) => entry.term === "Stortorvet"));
});

test("Stortorget alone passes the canonical v4.2 packet validator", () => {
  const result = validatePacket({
    packet: production,
    place,
    packetFile: productionFile,
    now: new Date("2026-09-11T00:00:00Z")
  });
  assert.deepEqual(result.issues, []);
});

test("Stortorget user-facing description contains no internal product instructions", () => {
  assert.equal(/History Go|canonical[- ]?id|må holdes adskilt fra/iu.test(`${place.desc}\n${place.popupDesc}`), false);
  assert.ok(place.popupDesc.trim().split(/\s+/u).length >= 300);
});

test("Stortorget canonical rebuild entrypoint preserves all production stages", () => {
  const runner = fs.readFileSync(path.join(root, "tools/build-stortorget-completion.mjs"), "utf8");
  assert.match(runner, /finalize-stortorget-completion\.mjs/u);
  assert.match(runner, /finalize-stortorget-quiz\.mjs/u);
  assert.match(runner, /finalize-stortorget-v42\.mjs/u);
});

test("Stortorget closure leaves no temporary materialization workflow", () => {
  assert.equal(fs.existsSync(path.join(root, ".github/workflows/_stortorget-materialize-once.yml")), false);
});
