import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const placeFile = "data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/norges_hjemmefrontmuseum.json";
const place = read(placeFile);
const production = read("data/places/production/norges_hjemmefrontmuseum.json");
const history = read("data/places/historie-production/norges_hjemmefrontmuseum.json");
const quiz = read("data/quiz/historie/norges_hjemmefrontmuseum_sets.json");
const brief = read("data/quiz/production_briefs/historie/norges_hjemmefrontmuseum.json");
const audit = read("reports/place-production/norges-hjemmefrontmuseum-phase1-24-gate-audit-v1.json");
const stories = read("data/stories/stories_norges_hjemmefrontmuseum.json");
const people = read("data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json");
const harald = people.find(item => item.id === "harald_v");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

test("Norges Hjemmefrontmuseum preserves exact geometry and owns four standard collections", () => {
  assert.equal(place.lat, 59.90773);
  assert.equal(place.lon, 10.73563);
  assert.equal(place.r, 55);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(place.coordSourceId, "osm-way:111833902");
  assert.equal(place.production_profile, "standard");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.deepEqual(audit.collections.required, ["people", "objects", "brands", "productions"]);
  assert.equal(place.objects.length, 2);
  assert.equal(place.productions.length, 3);
  assert.deepEqual(brandsByPlace.norges_hjemmefrontmuseum, ["forsvarshistorisk_museum"]);
});

test("all place and collection previews are local, authentic and rights-labelled", async () => {
  const brand = brands.find(item => item.id === "forsvarshistorisk_museum");
  assert.ok(brand);
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, harald.image, brand.logo, ...place.objects.map(item => item.image), ...place.productions.map(item => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  const sharpPath = path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs");
  const { default: sharp } = await import(sharpPath);
  const frontMeta = await sharp(path.join(root, place.frontImage)).metadata();
  const personMeta = await sharp(path.join(root, harald.image)).metadata();
  assert.ok(frontMeta.height > frontMeta.width);
  assert.ok(personMeta.height > personMeta.width);
  assert.equal(place.imageMeta.license, "CC BY-SA 4.0");
  assert.match(place.for_na.comparisonNote, /ikke som geometrisk før\/etter-overlay/i);
  assert.ok(place.objects.every(item => item.imageMeta.license === "CC BY-SA 4.0"));
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.reconstructed, false);
  assert.equal(brand.imageMeta.noEndorsement, true);
});

test("identity and production packets keep museum, fortress and represented event sites distinct", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/norges_hjemmefrontmuseum.json", now: new Date("2026-08-30T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.match(place.popupDesc, /skiller museet fra hele festningsanlegget, Akershus slott og Forsvarsmuseet/i);
  assert.match(place.popupDesc, /tilhører ikke automatisk museumsstedet/i);
  assert.match(place.popupDesc, /7\. mai 1970/);
  assert.equal(history.status, "ready");
  assert.ok(Object.values(history.gates).every(gate => gate.status === "PASS"));
});

test("Harald V remains anchored at Slottet and gains one sourced museum-opening relation", () => {
  assert.equal(harald.placeId, "slottet");
  assert.ok(harald.places.includes("slottet"));
  assert.ok(harald.places.includes("norges_hjemmefrontmuseum"));
  assert.match(harald.popupDesc, /7\. mai 1970/);
  assert.match(harald.popupDesc, /28\. august 2026/);
  const claims = read("data/people/claims/politikk/oslo/norges_hjemmefrontmuseum/harald_v.claims.json");
  assert.equal(claims.completion.current_status, "ready_people_v1");
  assert.ok(claims.claims.every(claim => claim.status === "verified"));
});

test("rich History quiz is 5x7, unique and fact-first", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.categoryId, "historie");
  assert.equal(quiz.size_class, "rich_5x7");
  assert.equal(quiz.sets.length, 5);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.equal(new Set(questions.map(question => question.id)).size, 35);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" || question.question_type === "context"));
  assert.ok(questions.slice(0, 14).every(question => !question.method_id));
  assert.ok(questions.every(question => question.knowledge_link_status === "linked"));
  assert.equal(brief.profile_decision.set_count, 5);
  assert.deepEqual(brief.existing_quiz_audit.active_before, { categoryId: null, set_count: 0, question_count: 0 });
});

test("episode Story and six-dimension gate close without blockers", () => {
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.ok(stories[0].score.total >= 15);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.manual_image_review.status, "PASS");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
