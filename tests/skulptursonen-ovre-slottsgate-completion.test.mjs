import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const placeFile = "data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01/skulptursonen_ovre_slottsgate.json";
const place = read(placeFile);

test("Skulptursonen keeps the verified linear-area identity and coordinates", () => {
  assert.equal(place.id, "skulptursonen_ovre_slottsgate");
  assert.equal(place.lat, 59.9112353280587);
  assert.equal(place.lon, 10.740582917313654);
  assert.equal(place.locatorType, "linear_area");
  assert.equal(place.anchors.length, 2);
  assert.match(place.popupDesc, /2019–2024/);
  assert.match(place.popupDesc, /ikke som en påstand om dagens installasjon/i);
});

test("Skulptursonen exposes exactly four curated collection families", () => {
  const production = read("data/places/production/skulptursonen_ovre_slottsgate.json");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.deepEqual(production.collections, {
    people: ["vibeke_tandberg"],
    objects: ["skulptursonen_planskisse_2019"],
    brands: ["norsk_billedhoggerforening"],
    productions: ["skulptursonen_hestebarrikade_2023", "skulptursonen_du_ma_ikke_sove_2023", "skulptursonen_what_money_can_buy_2023"]
  });
});

test("the signature plan object and three historical works are explicit", () => {
  assert.equal(place.objects.length, 1);
  assert.equal(place.objects[0].type, "planskisse");
  assert.deepEqual(place.productions.map((item) => item.year), [2023, 2023, 2023]);
  assert.deepEqual(place.productions.map((item) => item.artist), ["Vibeke Tandberg", "Ingrid Solvik", "Yamile Calderon"]);
});

test("People and Brand manifests bind the documented external actors", () => {
  const people = read("data/people/manifest.json");
  const brands = read("data/brands/brands_by_place.json");
  assert.deepEqual(people.priorityFilesByPlace.skulptursonen_ovre_slottsgate, ["people/kunst/oslo/skulptursonen_ovre_slottsgate/vibeke_tandberg.json"]);
  assert.deepEqual(brands.skulptursonen_ovre_slottsgate, ["norsk_billedhoggerforening"]);
});

test("language, Story, reading tracks and Fagverk are complete", () => {
  assert.equal(read("data/leksikon/sprak/places/europe/norway/oslo/skulptursonen_ovre_slottsgate.json").entries.length, 6);
  assert.equal(read("data/stories/stories_skulptursonen_ovre_slottsgate.json").length, 1);
  assert.equal(place.reading_track_ids.length, 4);
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.article.length, 3);
});

test("quiz is normal 4x7 with fourteen direct opening facts", () => {
  const quiz = read("data/quiz/kunst/skulptursonen_ovre_slottsgate_sets.json");
  assert.equal(quiz.sets.length, 4);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.ok(questions.slice(0, 14).every((question) => question.question_type === "fact"));
  assert.ok(questions.every((question) => question.knowledge_link_status === "linked"));
});

test("final theory question is bound to the Kunst contract", () => {
  const quiz = read("data/quiz/kunst/skulptursonen_ovre_slottsgate_sets.json");
  const final = quiz.sets.at(-1).questions.at(-1);
  assert.equal(final.topic_hook_id, "institusjonell_legitimering");
  assert.equal(final.method_id, "met_kunst_institusjonsanalyse");
  assert.equal(final.thinker_id, "boris_groys");
  assert.equal(final.theory_ref.work, "Art Power");
});
