import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const placeFile = "data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json";
const place = read(placeFile);
const production = read("data/places/production/ankerbrua.json");
const quiz = read("data/quiz/by/ankerbrua_sets.json");
const brief = read("data/quiz/production_briefs/by/ankerbrua.json");
const audit = read("reports/place-production/ankerbrua-phase1-24-gate-audit-v1.json");
const story = read("data/stories/stories_ankerbrua.json")[0];
const people = read("data/people/kunst/oslo/dyre_vaa.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

test("Ankerbrua preserves geometry and has exactly four By collections", () => {
  assert.equal(place.lat, 59.9182571);
  assert.equal(place.lon, 10.7562989);
  assert.equal(place.coordSourceId, "osm-way:381749949");
  assert.equal(place.category, "by");
  assert.equal(place.production_profile, "rich");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(audit.collections.required, ["people", "objects", "brands", "structures"]);
  assert.equal(place.objects.length, 5);
  assert.equal(place.structures.length, 1);
  assert.deepEqual(brandsByPlace.ankerbrua, ["selskabet_for_oslo_byes_vel"]);
  assert.equal("nature_profile" in place, false);
  assert.equal("civication_store" in place, false);
});

test("all collection members have local, rights-labelled images", async () => {
  const dyre = people.find((person) => person.id === "dyre_vaa");
  const brand = brands.find((item) => item.id === "selskabet_for_oslo_byes_vel");
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, dyre.image, brand.image, ...place.objects.map((item) => item.image), ...place.structures.map((item) => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  const sharpPath = path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs");
  const { default: sharp } = await import(sharpPath);
  const front = await sharp(path.join(root, place.frontImage)).metadata();
  assert.ok(front.height > front.width);
  assert.ok(place.objects.every((item) => item.imageMeta?.sourcePage?.startsWith("https://")));
  assert.equal(dyre.imageMeta.license, "CC BY-SA 3.0");
  assert.equal(brand.imageMeta.assetKind, "logo");
  assert.equal(brand.imageMeta.noEndorsement, true);
  assert.match(place.for_na.comparisonNote, /ulike standpunkter/i);
  assert.equal(audit.manual_image_review.status, "PASS");
});

test("description and People production packets are complete", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/ankerbrua.json", now: new Date("2026-08-30T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  const personClaims = read("data/people/claims/kunst/oslo/ankerbrua/dyre_vaa.claims.json");
  assert.equal(personClaims.completion.current_status, "ready_people_v1");
  assert.equal(personClaims.completion.claims_verified, "4/4");
  assert.ok(people.find((person) => person.id === "dyre_vaa").places.includes("ankerbrua"));
  assert.ok(production.source_conflicts.some((item) => /Tyrihans/.test(item.claim) && item.status === "rejected"));
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
  assert.equal(fs.existsSync(path.join(root, "data/quiz/historie/ankerbrua_sets.json")), false);
});

test("episode Story, language and six-dimensional gate close without blockers", () => {
  assert.equal(story.quality_profile, "episode_v1");
  assert.equal(story.type, "turning_point");
  assert.equal(story.score.total, 16);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/ankerbrua.json");
  assert.equal(language.entries.length, 5);
  assert.ok(language.entries.some((entry) => entry.term === "Eventyrbrua"));
  const dimensions = Object.values(audit.quality_score).filter((value) => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every((item) => item.score >= 4));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
