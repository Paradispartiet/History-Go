import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const place = read("data/places/naeringsliv/oslo/places_naeringsliv/alunverket.json");
const production = read("data/places/production/alunverket.json");
const business = read("data/places/naeringsliv-production/alunverket.json");
const runtime = read("data/runtime/place-open/alunverket.json");
const quiz = read("data/quiz/naeringsliv/alunverket_sets.json");
const brief = read("data/quiz/production_briefs/naeringsliv/alunverket.json");
const context = read("data/quiz/production_context/naeringsliv/alunverket.json");
const stories = read("data/stories/stories_alunverket.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");
const peopleClaims = read("data/people/claims/naeringsliv/oslo/alunverket/peter_collett_alunverket.claims.json");
const audit = read("reports/place-production/alunverket-phase1-24-gate-audit-v1.json");

const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  throw new Error(`Unsupported WebP chunk ${chunk} in ${file}`);
};

test("Alunverket is a new historical-site Place with an explicit anchor", () => {
  assert.equal(place.id, "alunverket");
  assert.equal(place.category, "naeringsliv");
  assert.equal(place.year, 1737);
  assert.equal(place.lat, 59.90183);
  assert.equal(place.lon, 10.76741);
  assert.equal(place.sourceObjectId, "osm-node:12732634365");
  assert.equal(place.coordStatus, "verified_historical_source");
  assert.equal(place.coordRole, "historical_anchor");
  assert.equal(audit.null_measurement.existing_place, false);
  assert.match(production.identity.represents, /1737–1815/);
});

test("all four Næringsliv collections have documented local images", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.ok(runtime.people.some(person => person.id === "peter_collett_alunverket"));
  assert.deepEqual(place.objects.map(item => item.id), ["edy_alunverket_akvatint"]);
  assert.deepEqual(place.structures.map(item => item.id), ["alunverket_fabrikkbygning_ca_1900"]);
  assert.deepEqual(brandsByPlace.alunverket, ["alunverket_company"]);
  const brand = brands.find(item => item.id === "alunverket_company");
  assert.equal(brand.logo, "bilder/kort/brands/alunverket_ordmerke_1800.webp");
  assert.equal(brand.imageMeta.assetKind, "historical_wordmark");
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.reconstructed, false);
  assert.equal(brand.imageMeta.noEndorsement, true);
  for (const file of [runtime.people.find(person => person.id === "peter_collett_alunverket").image, place.objects[0].image, place.structures[0].image, brand.logo]) {
    assert.equal(exists(file), true, file);
  }
});

test("place, before-now, person, object, structure and wordmark assets are valid", () => {
  const files = [place.frontImage, place.image, place.cardImage, place.for_na.beforeImage, place.for_na.nowImage, place.objects[0].image, place.structures[0].image, "bilder/kort/people/peter_collett_alunverket.webp", "bilder/kort/brands/alunverket_ordmerke_1800.webp"];
  for (const file of files) assert.equal(exists(file), true, file);
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
  assert.deepEqual(webpDimensions(place.for_na.beforeImage), { width: 1200, height: 675 });
  assert.deepEqual(webpDimensions("bilder/kort/brands/alunverket_ordmerke_1800.webp"), { width: 900, height: 520 });
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.imageMeta.license, "CC BY-SA 3.0");
  assert.equal(place.objects[0].imageMeta.license, "Public domain");
  assert.equal(place.structures[0].imageMeta.license, "CC0 1.0");
  assert.match(place.for_na.change, /ikke tatt fra identisk standpunkt/);
});

test("description, People claims and Næringsliv packets are complete", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/alunverket.json", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(peopleClaims.completion.current_status, "ready_people_v1");
  assert.equal(peopleClaims.completion.claims_verified, "6/6");
  assert.equal(business.status, "ready");
  assert.equal(business.economicIdentity.anchorType, "production_site");
  assert.equal(business.quizOpening.status, "PASS");
  assert.equal(business.quizOpening.firstTwoSetsQuestionCount, 14);
  assert.ok(Object.values(business.gates).every(gate => gate.status === "PASS"));
});

test("normal quiz has 4x7 progression and a fourteen-question factual opening", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "normal_4x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(21).every(question => question.question_type === "analysis" && question.method_id));
  assert.equal(brief.claims.length, 28);
  assert.equal(brief.existing_quiz_audit.active_before.question_count, 0);
  assert.match(questions[18].knowledge, /44 gjelder.*138 gjelder/);
});

test("popup systems include chronology, language, story and readings", () => {
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.leksikon[0].chronology.length, 12);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 5);
  assert.equal(runtime.language.dialect_status, "not_applicable_place_level");
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.match(stories[0].story, /Mary Wollstonecraft/);
});

test("source conflicts and final quality gate are explicit and blocker-free", () => {
  assert.deepEqual(audit.source_conflicts.map(item => item.status), ["resolved", "held_back", "rejected"]);
  assert.match(audit.source_conflicts[1].reason, /rekordpåstanden/i);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
