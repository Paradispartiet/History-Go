import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const placeFile = "data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsbrua.json";
const place = read(placeFile);
const production = read("data/places/production/hausmannsbrua.json");
const quiz = read("data/quiz/by/hausmannsbrua_sets.json");
const brief = read("data/quiz/production_briefs/by/hausmannsbrua.json");
const audit = read("reports/place-production/hausmannsbrua-phase1-24-gate-audit-v1.json");
const story = read("data/stories/stories_hausmannsbrua.json")[0];
const people = read("data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

test("Hausmannsbrua preserves verified geometry and has exactly four By collections", () => {
  assert.equal(place.lat, 59.9151848);
  assert.equal(place.lon, 10.7599143);
  assert.equal(place.coordSourceId, "osm-way:377766486");
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(place.coordRole, "line_anchor");
  assert.equal(place.category, "by");
  assert.equal(place.production_profile, "rich");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(audit.collections.required, ["people", "objects", "brands", "structures"]);
  assert.equal(place.objects.length, 1);
  assert.equal(place.structures.length, 1);
  assert.deepEqual(brandsByPlace.hausmannsbrua, ["selskabet_for_oslo_byes_vel"]);
  assert.equal("nature_profile" in place, false);
  assert.equal("civication_store" in place, false);
});

test("single Object is an explicit signature-object exception rather than filler", () => {
  assert.equal(place.object_collection_exception.status, "signature_object_exception");
  assert.equal(place.object_collection_exception.actual, 1);
  assert.match(place.object_collection_exception.justification, /smijernsrekkverket/i);
  assert.equal(place.objects[0].id, "hausmannsbrua_bevart_smijernsrekkverk");
  assert.equal(place.objects[0].physicalObject, true);
  assert.ok(place.objects[0].source_urls.length >= 2);
  assert.equal(place.structures[0].id, "hausmannsbrua_1892");
});

test("all collection members and Place surfaces have local, rights-labelled images", async () => {
  const fredrik = people.find((person) => person.id === "fredrik_ferdinand_hausmann");
  const brand = brands.find((item) => item.id === "selskabet_for_oslo_byes_vel");
  const files = [
    place.image, place.cardImage, place.frontImage, place.quizCardImage,
    place.for_na.beforeImage, place.for_na.nowImage,
    fredrik.image, brand.image, ...place.objects.map((item) => item.image), ...place.structures.map((item) => item.image)
  ];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  const sharpPath = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs")
    : "sharp";
  const { default: sharp } = await import(sharpPath);
  const front = await sharp(path.join(root, place.frontImage)).metadata();
  assert.ok(front.height > front.width);
  assert.ok(place.objects.every((item) => item.imageMeta?.sourcePage?.startsWith("https://")));
  assert.equal(fredrik.imageMeta.license, "Public domain");
  assert.equal(brand.imageMeta.assetKind, "logo");
  assert.equal(brand.imageMeta.noEndorsement, true);
  assert.match(place.for_na.comparisonNote, /ulike.*standpunkt/i);
  assert.equal(audit.manual_image_review.status, "PASS");
});

test("description and People production packets close without identity overreach", () => {
  const result = validatePacket({
    packet: production,
    place,
    packetFile: "data/places/production/hausmannsbrua.json",
    now: new Date("2026-09-11T12:00:00Z")
  });
  assert.deepEqual(result.issues, []);
  const personClaims = read("data/people/claims/historie/oslo/hausmannsbrua/fredrik_ferdinand_hausmann.claims.json");
  assert.equal(personClaims.completion.current_status, "ready_people_v1");
  assert.equal(personClaims.completion.claims_verified, "4/4");
  assert.ok(people.find((person) => person.id === "fredrik_ferdinand_hausmann").places.includes("hausmannsbrua"));
  assert.ok(production.source_conflicts.some((item) => /P\. Schaaning/.test(item.claim) && item.status === "held_back"));
  assert.ok(!place.related_people_ids.includes("peder_schaanning"));
});

test("canonical By quiz is rich 5x7 with normal opening and distributed answers", () => {
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.equal(quiz.categoryId, "by");
  assert.equal(quiz.size_class, "rich_5x7");
  assert.equal(quiz.sets.length, 5);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.equal(new Set(questions.map((question) => question.id)).size, 35);
  assert.ok(questions.slice(0, 14).every((question) => ["fact", "context"].includes(question.question_type)));
  assert.ok(questions.slice(0, 14).every((question) => !question.method_id));
  assert.deepEqual([...new Set(questions.map((question) => question.answerIndex))].sort(), [0, 1, 2]);
  assert.equal(brief.profile_decision.set_count, 5);
  assert.equal(fs.existsSync(path.join(root, "data/quiz/historie/hausmannsbrua_sets.json")), false);
});

test("Story, language, readings, Fagverk and 30/30 quality gate are complete", () => {
  assert.equal(story.quality_profile, "episode_v1");
  assert.equal(story.type, "turning_point");
  assert.equal(story.year, 1986);
  assert.equal(story.score.total, 16);
  const storyManifest = read("data/stories/stories_episode_v1_manifest.json");
  assert.ok(storyManifest.files.includes("data/stories/stories_hausmannsbrua.json"));

  const language = read("data/leksikon/sprak/places/europe/norway/oslo/hausmannsbrua.json");
  assert.equal(language.entries.length, 6);
  assert.ok(language.entries.some((entry) => entry.term === "smijernsrekkverk"));
  const languageManifest = read("data/leksikon/sprak/manifest.json");
  assert.equal(languageManifest.place_files.hausmannsbrua, "data/leksikon/sprak/places/europe/norway/oslo/hausmannsbrua.json");

  const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter((item) => (item.place_ids || []).includes("hausmannsbrua"));
  assert.equal(readings.length, 5);

  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.status, "curated");
  assert.equal(place.fagverk.lenses.length, 5);
  assert.equal(place.fagverk.guiding_questions.length, 6);
  assert.equal(place.fagverk.concepts.length, 12);
  assert.equal(place.fagverk.tracks.length, 3);

  const dimensions = Object.values(audit.quality_score).filter((value) => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every((item) => item.score === 5));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});

test("generated runtime exposes the completed language and reading surfaces", () => {
  const runtime = read("data/runtime/place-open/hausmannsbrua.json");
  assert.ok(runtime.language);
  assert.equal(runtime.language.entries.length, 6);
  assert.equal(runtime.lesespor.length, 5);
  assert.equal(runtime.place.category, "by");
  assert.deepEqual(runtime.place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
});
