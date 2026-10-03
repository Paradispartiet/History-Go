import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// RED sync trigger: completion contract remains intentionally unmet before Phase 2 implementation.
const readJson = path => JSON.parse(fs.readFileSync(path, "utf8"));
const exists = path => fs.existsSync(path);
const readOptionalJson = path => exists(path) ? readJson(path) : null;

const placePath = "data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json";
const peoplePath = "data/people/media/oslo/people_media_oslo.json";
const brandsMasterPath = "data/brands/brands_master.json";
const brandsByPlacePath = "data/brands/brands_by_place.json";
const quizPath = "data/quiz/media/klassekampen_redaksjon_sets.json";
const quizCardManifestPath = "data/quizcards/media/manifest.json";
const quizCardPath = "data/quizcards/media/klassekampen_redaksjon.json";
const workcardPath = "reports/place-production/klassekampen-workcard-current.json";

const place = readJson(placePath);
const peopleDoc = readJson(peoplePath);
const people = Array.isArray(peopleDoc) ? peopleDoc : peopleDoc.people || [];
const brandsMasterDoc = readJson(brandsMasterPath);
const brands = Array.isArray(brandsMasterDoc) ? brandsMasterDoc : brandsMasterDoc.brands || [];
const brandsByPlace = readJson(brandsByPlacePath);
const quiz = readOptionalJson(quizPath);
const quizCardManifest = readOptionalJson(quizCardManifestPath);
const quizCard = readOptionalJson(quizCardPath);
const workcard = readJson(workcardPath);

function localAsset(path, label) {
  assert.equal(typeof path, "string", `${label} must have a local asset path`);
  assert.ok(path.length > 0, `${label} asset path must not be empty`);
  assert.ok(!/^https?:\/\//.test(path), `${label} must use a local asset`);
  assert.ok(exists(path), `${label} asset must exist: ${path}`);
}

test("Klassekampen uses the exact Media Phase-2 collection profile", () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.deepEqual(place.place_card_profile?.collection_ids, ["people", "objects", "brands", "productions"]);
});

test("Mari Skurdal is the canonical People member with a loadable reviewed preview", () => {
  const mari = people.find(person => person.id === "mari_skurdal");
  assert.ok(mari, "mari_skurdal must remain canonical");
  assert.ok([mari.placeId, ...(mari.places || [])].includes("klassekampen_redaksjon"));
  localAsset(mari.cardImage || mari.image, "mari_skurdal");
  assert.ok(mari.imageMeta?.source, "mari_skurdal needs image provenance");
});

test("the 7 February 1969 first issue is the single physical signature Object", () => {
  assert.equal(place.objects?.length, 1);
  const object = place.objects[0];
  assert.equal(object.id, "klassekampen_forste_utgave_1969");
  assert.equal(object.physicalObject, true);
  assert.equal(object.placeSpecific, true);
  localAsset(object.cardImage || object.image, object.id);
  assert.ok(object.imageMeta?.sourcePage || object.imageMeta?.source, "Object needs source provenance");
});

test("Klassekampen is one canonical Brand with a verified local mark", () => {
  const brand = brands.find(entry => entry.id === "klassekampen");
  assert.ok(brand, "klassekampen must exist in brands_master");
  assert.equal(brand.brand_type || brand.type, "media_brand");
  assert.deepEqual(brandsByPlace.klassekampen_redaksjon, ["klassekampen"]);
  localAsset(brand.cardImage || brand.image || brand.logo, "klassekampen brand");
  assert.ok(brand.imageMeta?.sourcePage || brand.logoMeta?.sourcePage || brand.assetMeta?.sourcePage, "Brand needs logo provenance");
});

test("the four documented publications are distinct canonical Production members", () => {
  const expected = [
    "klassekampen_avis",
    "klassekampen_bokmagasinet",
    "klassekampen_musikkmagasinet",
    "klassekampen_eavis"
  ];
  assert.deepEqual(place.productions?.map(item => item.id), expected);
  const previews = [];
  for (const production of place.productions) {
    const preview = production.cardImage || production.image;
    localAsset(preview, production.id);
    previews.push(preview);
    assert.ok(production.imageMeta?.source || production.imageMeta?.creator, `${production.id} needs preview provenance`);
  }
  assert.equal(new Set(previews).size, expected.length, "each Production needs an independent preview asset");
  assert.notEqual(place.objects[0].cardImage || place.objects[0].image, previews[0], "Object preview cannot double as a Production preview");
});

test("the place has a standing portrait front image with provenance", () => {
  localAsset(place.image, "Klassekampen place image");
  localAsset(place.frontImage, "Klassekampen frontImage");
  assert.equal(place.frontImageMeta?.orientation, "portrait");
  assert.ok(place.frontImageMeta?.sourcePage || place.frontImageMeta?.source, "frontImage needs provenance");
});

test("the canonical Media quiz is normal profile 4x7", () => {
  assert.ok(quiz, `missing ${quizPath}`);
  assert.equal(quiz.targetId, "klassekampen_redaksjon");
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7]);
  assert.equal(quiz.sets.flatMap(set => set.questions).length, 28);
});

test("QuizCard resolves through the shared manifest architecture", () => {
  assert.ok(quizCardManifest, `missing ${quizCardManifestPath}`);
  assert.ok(quizCard, `missing ${quizCardPath}`);
  assert.equal(quizCardManifest.categoryId, "media");
  assert.ok(quizCardManifest.collections.includes("klassekampen_redaksjon.json"));
  assert.equal(quizCard.targetId, "klassekampen_redaksjon");
  assert.equal(quizCard.categoryId, "media");
  assert.ok(Array.isArray(quizCard.questions) && quizCard.questions.length > 0);
});

test("the workcard is closed only after all Phase-2 gates pass", () => {
  assert.equal(workcard.status, "PASS");
  assert.equal(workcard.phase_2_status || workcard.phase2_status, "complete");
  assert.equal(workcard.blockers?.length, 0);
  const score = Number(workcard.quality_score?.total ?? workcard.qualityScore?.total ?? workcard.quality_score ?? workcard.qualityScore);
  assert.ok(Number.isFinite(score) && score >= 27, `quality score must be at least 27/30, got ${score}`);
});
