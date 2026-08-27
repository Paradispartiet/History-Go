import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const place = read("data/places/naeringsliv/oslo/places_naeringsliv/myrens_verksted.json");
const production = read("data/places/production/myrens_verksted.json");
const business = read("data/places/naeringsliv-production/myrens_verksted.json");
const runtime = read("data/runtime/place-open/myrens_verksted.json");
const quiz = read("data/quiz/naeringsliv/myrens_verksted_sets.json");
const brief = read("data/quiz/production_briefs/naeringsliv/myrens_verksted.json");
const context = read("data/quiz/production_context/naeringsliv/myrens_verksted.json");
const stories = read("data/stories/stories_myrens_verksted.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");
const peopleClaims = read("data/people/claims/naeringsliv/oslo/myrens_verksted/jens_jacob_jensen_myrens.claims.json");
const audit = read("reports/place-production/myrens-verksted-phase1-24-gate-audit-v1.json");

const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  throw new Error(`Unsupported WebP chunk ${chunk} in ${file}`);
};

test("Myrens reuses the canonical place and verified geometry anchor", () => {
  assert.equal(place.id, "myrens_verksted");
  assert.equal(place.category, "naeringsliv");
  assert.equal(place.lat, 59.9346455);
  assert.equal(place.lon, 10.7594222);
  assert.equal(place.sourceObjectId, "osm-way:99757039");
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(audit.null_measurement.coordinate_changed, false);
  assert.ok(!place.related_place_ids.includes("myrens_verksted"));
});

test("all four Næringsliv collections have real image-ready members", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.ok(runtime.people.some(person => person.id === "jens_jacob_jensen_myrens"));
  assert.deepEqual(place.objects.map(item => item.id), ["myrens_sirkelkantsag_1914", "myrens_hovlemaskin_1899"]);
  assert.deepEqual(place.structures.map(item => item.id), ["myrens_fabrikkbygning_1961"]);
  assert.deepEqual(brandsByPlace.myrens_verksted, ["myrens_verksted_company"]);
  const brand = brands.filter(item => item.id === "myrens_verksted_company");
  assert.equal(brand.length, 1);
  assert.equal(brand[0].logo, "bilder/kort/brands/myrens_fasademerke.webp");
  assert.equal(brand[0].imageMeta.assetKind, "authentic_brandmark");
  assert.equal(brand[0].imageMeta.generated, false);
  assert.equal(brand[0].imageMeta.reconstructed, false);
  assert.equal(brand[0].imageMeta.noEndorsement, true);
  for (const file of [runtime.people.find(person => person.id === "jens_jacob_jensen_myrens").image, ...place.objects.map(item => item.image), place.structures[0].image, brand[0].logo]) {
    assert.equal(exists(file), true, file);
  }
});

test("front, place, object, structure, person and brandmark assets are local and documented", () => {
  for (const file of [place.frontImage, place.image, place.cardImage, ...place.objects.map(item => item.image), place.structures[0].image, "bilder/kort/people/jens_jacob_jensen_myrens.webp", "bilder/kort/brands/myrens_fasademerke.webp", "bilder/places/myrens_verksted_1953.webp"]) {
    assert.equal(exists(file), true, file);
  }
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
  assert.ok(webpDimensions(place.frontImage).height > webpDimensions(place.frontImage).width);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.source, "wikimedia_commons");
  assert.equal(place.imageMeta.license, "CC BY-SA 4.0");
  assert.ok(place.objects.every(item => item.imageMeta.license === "Public domain"));
  assert.equal(place.structures[0].imageMeta.license, "CC BY-SA 4.0");
});

test("description, People claims and Næringsliv packets are complete", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/myrens_verksted.json", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(peopleClaims.completion.current_status, "ready_people_v1");
  assert.equal(peopleClaims.completion.claims_verified, "6/6");
  assert.equal(business.status, "ready");
  assert.equal(business.economicIdentity.anchorType, "mixed_economic_site");
  assert.equal(business.quizOpening.status, "PASS");
  assert.equal(business.quizOpening.firstTwoSetsQuestionCount, 14);
  assert.ok(Object.values(business.gates).every(gate => gate.status === "PASS"));
});

test("normal quiz has 4x7 progression and preserves the fourteen-question opening", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "normal_4x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type) && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(21).every(question => question.question_type === "analysis" && question.method_id));
  assert.equal(brief.claims.length, 28);
  assert.match(brief.existing_quiz_audit.active_before.finding, /30/);
});

test("popup systems include chronology, language, story and readings", () => {
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.leksikon[0].chronology.length, 13);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.language.dialect_status, "not_applicable_place_level");
  assert.equal(runtime.lesespor.length, 3);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].related_people[0], "jens_jacob_jensen_myrens");
});

test("source conflicts and final quality gate are explicit and blocker-free", () => {
  assert.deepEqual(audit.source_conflicts.map(item => item.status), ["rejected", "qualified"]);
  assert.match(audit.source_conflicts[0].reason, /Jens Jacob og Andreas Jensen/);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
