import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/historie/oslo/places_historie_added_batch_01/oslo_hospital.json");
const production = read("data/places/production/oslo_hospital.json");
const historyProduction = read("data/places/historie-production/oslo_hospital.json");
const quiz = read("data/quiz/historie/oslo_hospital_sets.json");
const brief = read("data/quiz/production_briefs/historie/oslo_hospital.json");
const audit = read("reports/place-production/oslo-hospital-phase1-24-gate-audit-v1.json");
const story = read("data/stories/stories_oslo_hospital.json")[0];
const claims = read("data/people/claims/historie/oslo/oslo_hospital/herman_wedel_major.claims.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

test("Oslo Hospital preserves its coordinate anchor and has exactly four collections", () => {
  assert.equal(place.name, "Oslo Hospital");
  assert.equal(place.lat, 59.903189);
  assert.equal(place.lon, 10.767664);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.related_people_ids, ["herman_wedel_major"]);
  assert.deepEqual(place.objects.map(item => item.id), ["oslo_hospital_jordebok_1648"]);
  assert.deepEqual(place.structures.map(item => item.id), ["graasteinsbygningen_oslo_hospital", "gamlebyen_kirke_1796", "oslo_hospital_dollhus_1778"]);
  assert.deepEqual(brandsByPlace.oslo_hospital, ["stiftelsen_oslo_hospital"]);
});

test("all published member imagery is local, reviewable and authentic", () => {
  for (const file of [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, place.for_na.nowImage, ...place.objects.map(item => item.image), ...place.structures.map(item => item.image), "bilder/kort/people/herman_wedel_major.webp", "bilder/kort/brands/stiftelsen_oslo_hospital_wordmark.webp"]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file);
  }
  const brand = brands.find(item => item.id === "stiftelsen_oslo_hospital");
  assert.equal(brand.imageMeta.assetKind, "official_wordmark");
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.reconstructed, false);
  assert.equal(claims.completion.claims_verified, "5/5");
});

test("description and History production packets are blocker-free", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/oslo_hospital.json", now: new Date("2026-08-28T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(historyProduction.status, "ready");
  assert.ok(Object.values(historyProduction.gates).every(gate => gate.status === "PASS"));
  assert.match(place.popupDesc, /1777.*1778/s);
  assert.match(place.popupDesc, /20\. august 2026/);
  assert.match(historyProduction.caseRealizations[0].sourceComparison.contradictionsOrSilences, /1777 og 1778/);
});

test("normal quiz has 4x7 progression and delayed method and theory", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.production_context.profile, "normal_4x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 28);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(21).every(question => question.method_id));
  assert.equal(questions.filter(question => question.thinker_id).length, 1);
  assert.equal(brief.claims.length, 28);
});

test("Story and six-dimension quality gate pass", () => {
  assert.equal(story.quality_profile, "episode_v1");
  assert.deepEqual(story.related_people, ["herman_wedel_major"]);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
