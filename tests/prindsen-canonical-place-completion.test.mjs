import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const id = "prinds_christian_augusts_minde";
const oldId = "prindsen_mottakssenter";
const brandId = "prindsen_mottakssenter_tjeneste";
const placeFile = "data/places/historie/oslo/places_historie_added_batch_01/" + id + ".json";

test("Prindsen is one canonical Place and the old service pin is retired", () => {
  const place = read(placeFile);
  const manifest = read("data/places/manifest.json");
  assert.equal(place.id, id);
  assert.equal(place.production_status, "complete");
  assert.equal(Object.hasOwn(place, "cardImage"), false);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people","objects","brands","historical_events"]);
  assert.ok(manifest.files.includes("places/historie/oslo/places_historie_added_batch_01/" + id + ".json"));
  assert.ok(!manifest.files.includes("places/subkultur/oslo/places_subkultur/" + oldId + ".json"));
  assert.equal(fs.existsSync(path.join(root, "data/places/subkultur/oslo/places_subkultur/" + oldId + ".json")), false);
});

test("current Prindsen service survives as a Brand/current-use layer", () => {
  const place = read(placeFile);
  const brands = read("data/brands/brands_master.json");
  const byPlace = read("data/brands/brands_by_place.json");
  const brand = brands.find((item) => item.id === brandId);
  assert.ok(brand);
  assert.equal(brand.name, "Prindsen mottakssenter");
  assert.deepEqual(byPlace[id], [brandId]);
  assert.ok(place.externalLinks.some((link) => link.url.includes("prindsen-mottakssenter")));
  assert.match(place.popupDesc, /Hausmannsgate 11/);
});

test("Prindsen has complete collections and media", () => {
  const place = read(placeFile);
  assert.deepEqual(place.related_people_ids, ["fredrik_ferdinand_hausmann"]);
  assert.equal(place.objects.length, 1);
  assert.equal(place.historical_events.length, 4);
  const files = [
    place.image,
    place.frontImage,
    place.objects[0].image,
    ...place.historical_events.map((event) => event.image),
    "bilder/kort/brands/" + brandId + ".webp",
    "bilder/QuizCards/Prindsen.webp"
  ];
  for (const file of files) {
    const full = path.join(root, file);
    assert.ok(fs.existsSync(full), "missing " + file);
    assert.ok(fs.statSync(full).size > 1000, "empty " + file);
  }
});

test("Prindsen learning, language and quiz layers are complete", () => {
  const place = read(placeFile);
  const quiz = read("data/quiz/historie/" + id + "_sets.json");
  const languageManifest = read("data/leksikon/sprak/manifest.json");
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.status, "curated");
  assert.ok(place.fagverk.lenses.length >= 3);
  assert.ok(place.fagverk.guiding_questions.length >= 4);
  assert.equal(quiz.sets.length, 4);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  assert.equal(quiz.sets.flatMap((set) => set.questions).length, 28);
  assert.equal(languageManifest.place_files[id], "data/leksikon/sprak/places/europe/norway/oslo/" + id + ".json");
  assert.ok(fs.existsSync(path.join(root, "data/places/production/" + id + ".json")));
  assert.ok(fs.existsSync(path.join(root, "data/places/historie-production/" + id + ".json")));
});

test("runtime exposes only the canonical Prindsen place", () => {
  const runtime = read("data/runtime/place-open/" + id + ".json");
  assert.equal(runtime.place.id, id);
  assert.equal(fs.existsSync(path.join(root, "data/runtime/place-open/" + oldId + ".json")), false);
  assert.ok(runtime.brands.some((brand) => brand.id === brandId));
});
