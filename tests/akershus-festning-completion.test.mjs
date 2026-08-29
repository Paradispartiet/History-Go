import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const placeFile = "data/places/historie/oslo/places_historie/akershus_festning.json";
const place = read(placeFile);
const production = read("data/places/production/akershus_festning.json");
const historyProduction = read("data/places/historie-production/akershus_festning.json");
const quiz = read("data/quiz/historie/akershus_festning_sets.json");
const brief = read("data/quiz/production_briefs/historie/akershus_festning.json");
const runtime = read("data/runtime/place-open/akershus_festning.json");
const audit = read("reports/place-production/akershus-festning-phase1-24-gate-audit-v1.json");
const stories = read("data/stories/stories_akershus_festning.json");
const hannibal = read("data/people/historie/oslo/akershus_festning/hannibal_sehested.json")[0];
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

const collectionImageFiles = [
  hannibal.image,
  place.objects[0].image,
  brands.find(item => item.id === "forsvarsbygg").logo,
  place.productions[0].image
];

test("Akershus festning preserves verified geometry and uses the History major four-collection contract", () => {
  assert.equal(place.id, "akershus_festning");
  assert.equal(place.category, "historie");
  assert.equal(place.lat, 59.906611);
  assert.equal(place.lon, 10.73625);
  assert.equal(place.r, 220);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(place.coordSourceId, "forsvarsbygg:akershus-festning");
  assert.equal(place.production_profile, "major");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.deepEqual(place.objects.map(item => item.id), ["akershus_retterstedet_minnesmerke"]);
  assert.deepEqual(place.productions.map(item => item.id), ["akershus_beleiringen_1716"]);
  assert.deepEqual(brandsByPlace.akershus_festning, ["forsvarsbygg"]);
});

test("place, before-now and four collection previews are local and rights-labelled", async () => {
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, place.for_na.nowImage, ...collectionImageFiles];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  const { default: sharp } = await import("sharp");
  const frontMeta = await sharp(path.join(root, place.frontImage)).metadata();
  assert.ok(frontMeta.height > frontMeta.width, "front image must be physically portrait");
  assert.equal(place.imageMeta.license, "CC BY-SA 4.0");
  assert.match(place.for_na.comparisonNote, /ikke tatt fra identisk kamerastandpunkt/i);
  assert.match(place.objects[0].imageMeta.license, /CC BY-SA 2\.5/);
  const brand = brands.find(item => item.id === "forsvarsbygg");
  assert.ok(brand);
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.reconstructed, false);
  assert.equal(brand.imageMeta.usageContext, "referential_identification");
  assert.equal(brand.imageMeta.noEndorsement, true);
  assert.match(brand.imageMeta.sourceForm, /authentic_site/);
  assert.doesNotMatch(brand.imageMeta.transformation, /rekonstruert logo/i);
});

test("identity, description and History production packets keep castle, museums and microplaces separate", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/akershus_festning.json", now: new Date("2026-08-29T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.match(place.popupDesc, /ikke det samme som Akershus slott, Forsvarsmuseet, Norges Hjemmefrontmuseum/i);
  assert.ok(production.identity.excludes.includes("Akershus slott as a separate building identity"));
  assert.equal(historyProduction.status, "complete");
  assert.ok(Object.values(historyProduction.gates).every(value => value === "PASS"));
});

test("major History quiz is 8x7, fact-first and no longer a By-category quiz", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.categoryId, "historie");
  assert.equal(quiz.size_class, "major_8x7");
  assert.equal(quiz.sets.length, 8);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 56);
  assert.equal(new Set(questions.map(question => question.id)).size, 56);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" || question.question_type === "context"));
  assert.ok(questions.slice(0, 14).every(question => !question.method_id));
  assert.ok(questions.every(question => question.categoryId === "historie" && question.epoke_domain === "historie"));
  assert.ok(questions.every(question => question.knowledge_link_status === "linked"));
  assert.equal(brief.requirements.totalQuestions, 56);
  assert.equal(brief.requirements.openingTheoryQuestions, 0);
});

test("four episode Stories, runtime collections and six-dimension gate close without blockers", () => {
  assert.equal(stories.length, 4);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.place_id === "akershus_festning"));
  assert.ok(runtime.people.some(item => item.id === "hannibal_sehested"));
  assert.ok(runtime.collections || runtime.objects || runtime.place, "place-open runtime must be materialized");
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.manual_image_review.status, "PASS");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});