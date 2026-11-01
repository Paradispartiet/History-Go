import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));

test("Only canonical blaa remains on the active map; separate river section remains", () => {
  const exclusions = load("data/places/place_exclusions.json");
  const index = load("data/places/places_index.json");
  const manifest = load("data/places/manifest.json");
  const venue = load("data/places/musikk/oslo/places_musikk/blaa.json");
  const legacy = load("data/places/subkultur/oslo/places_subkultur/bla.json");
  assert.ok(exclusions.disabledPlaceIds.includes("bla"));
  assert.equal(exclusions.disabledPlaceIds.filter(id => id === "bla").length, 1);
  assert.ok(!exclusions.disabledPlaceIds.includes("blaa"));
  assert.equal(index.filter(place => place.id === "bla").length, 0);
  assert.equal(index.filter(place => place.id === "blaa").length, 1);
  assert.equal(index.filter(place => place.name === "Blå").length, 1);
  assert.equal(index.filter(place => place.id === "elvestrekning_bla_brenneriveien").length, 1);
  assert.equal(venue.id, "blaa");
  assert.equal(legacy.id, "bla"); // legacy source kept for migrations / audit
  assert.deepEqual([venue.lat, venue.lon], [59.920159, 10.752843]);
  assert.deepEqual([legacy.lat, legacy.lon], [venue.lat, venue.lon]);
  assert.equal(venue.address.number, "9C");
  assert.ok(manifest.files.includes("places/subkultur/oslo/places_subkultur/bla.json"));
  assert.ok(!exists("data/runtime/place-open/bla.json"), "Retired duplicate must not have generated runtime payload");
});

test("Historical subculture Story and existing canonical Story both open under blaa", () => {
  const legacyStories = load("data/stories/stories_bla.json");
  const modernStories = load("data/stories/stories_blaa.json");
  const storyManifest = load("data/stories/stories_manifest.json");
  const shard = load("data/runtime/stories-all/part-001.json");
  const runtime = load("data/runtime/place-open/blaa.json");
  assert.equal(legacyStories.length, 1);
  assert.equal(legacyStories[0].id, "st_bla_elvekant_nattmusikk_1998");
  assert.equal(legacyStories[0].place_id, "blaa");
  assert.equal(modernStories[0].place_id, "blaa");
  assert.equal(storyManifest.files.filter(entry => entry.path === "data/stories/stories_bla.json" && entry.entity_id === "blaa").length, 1);
  assert.equal(shard.filter(row => row.id === legacyStories[0].id).length, 1);
  assert.equal(shard.find(row => row.id === legacyStories[0].id).place_id, "blaa");
  assert.deepEqual(runtime.stories.map(s => s.id), [legacyStories[0].id, modernStories[0].id]);
  assert.deepEqual(runtime.stories.map(s => s.place_id), ["blaa", "blaa"]);
});

test("Canonical Blå retains its actual Brand and original People without recreating the duplicate", () => {
  const mapping = load("data/brands/brands_by_place.json");
  const master = load("data/brands/brands_master.json");
  const runtime = load("data/runtime/place-open/blaa.json");
  const brand = master.find(item => item.id === "bla");
  assert.ok(brand);
  assert.ok(!Object.hasOwn(mapping, "bla"));
  assert.deepEqual(mapping.blaa, ["bla"]);
  assert.deepEqual(runtime.brands, [brand]);
  assert.equal(runtime.place.id, "blaa");
  assert.deepEqual(runtime.people.map(p => p.id), ["jan_garbarek", "bugge_wesseltoft"]);
  assert.equal(runtime.place.place_card_profile, undefined); // no fabricated collection
});

test("Blå's original 30 source quiz questions, ten QuizCard questions, images and 27 verified claims remain", () => {
  const venue = load("data/places/musikk/oslo/places_musikk/blaa.json");
  const runtime = load("data/runtime/place-open/blaa.json");
  const production = load("data/places/production/blaa.json");
  const quiz = load("data/quiz/musikk/blaa_sets_merged.json");
  const card = load("data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json").cards.find(item => item.targetId === "blaa");
  const allQuestions = quiz.sets.flatMap(set => set.questions);
  const byId = new Map(allQuestions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 5);
  assert.equal(allQuestions.length, 30);
  assert.equal(byId.size, 30);
  assert.ok(allQuestions.every(q => q.knowledge_link_status === "linked"));
  assert.equal(card.questions.length, 10);
  for (const question of card.questions) {
    const original = byId.get(question.sourceQuestionId);
    assert.ok(original, `Missing source question ${question.sourceQuestionId}`);
    assert.equal(question.question, original.question);
    assert.deepEqual(question.options, original.options);
    assert.equal(question.answer, original.answer);
  }
  assert.equal(production.placeId, "blaa");
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.claims.length, 27);
  for (const key of ["desc", "popupDesc", "lat", "lon", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl"]) {
    assert.deepEqual(runtime.place[key], venue[key], `Mismatch in ${key}`);
  }
  assert.equal(venue.imageLicense, "CC BY-SA 4.0");
});
