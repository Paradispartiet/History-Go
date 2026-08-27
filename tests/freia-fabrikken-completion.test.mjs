import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const place = read("data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json");
const production = read("data/places/production/freia_fabrikken.json");
const business = read("data/places/naeringsliv-production/freia_fabrikken.json");
const runtime = read("data/runtime/place-open/freia_fabrikken.json");
const quiz = read("data/quiz/naeringsliv/freia_fabrikken_sets.json");
const brief = read("data/quiz/production_briefs/naeringsliv/freia_fabrikken.json");
const context = read("data/quiz/production_context/naeringsliv/freia_fabrikken.json");
const stories = read("data/stories/stories_freia_fabrikken.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");
const peopleClaims = read("data/people/claims/naeringsliv/oslo/freia_fabrikken/johan_thrane_holst_freia.claims.json");
const audit = read("reports/place-production/freia-fabrikken-phase1-24-gate-audit-v1.json");

const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  throw new Error(`Unsupported WebP chunk ${chunk} in ${file}`);
};

test("Freia-fabrikken is one canonical factory place with an official address anchor", () => {
  assert.equal(place.id, "freia_fabrikken");
  assert.equal(place.category, "naeringsliv");
  assert.equal(place.locatorType, "building");
  assert.equal(place.sourceProvider, "official_address");
  assert.equal(place.sourceObjectId, "geonorge-adresser-v1:0301:13479:1");
  assert.deepEqual(place.address, { street: "Johan Throne Holsts plass", number: "1", postcode: "0566", city: "Oslo", country: "NO" });
  assert.equal(place.coordStatus, "verified");
  assert.ok(!place.related_place_ids.includes("freiaparken"));
  assert.ok(!place.related_place_ids.includes("freiasalen"));
});

test("all four Næringsliv collections have real image-ready members", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(runtime.people.map(person => person.id).sort(), ["edvard_munch", "johan_thrane_holst_freia", "ole_sverre"].sort());
  assert.deepEqual(place.objects.map(item => item.id), ["freiafrisen_dans_pa_stranden"]);
  assert.deepEqual(place.structures.map(item => item.id), ["freiasalen", "freiaparken"]);
  assert.deepEqual(brandsByPlace.freia_fabrikken, ["freia"]);
  const freia = brands.filter(brand => brand.id === "freia");
  assert.equal(freia.length, 1, "the existing Freia Brand must be reused, not duplicated");
  assert.equal(freia[0].logo, "bilder/kort/brands/freia_wordmark.webp");
  assert.equal(freia[0].imageMeta.assetKind, "authentic_wordmark");
  assert.equal(freia[0].imageMeta.generated, false);
  assert.equal(freia[0].imageMeta.reconstructed, false);
  assert.equal(freia[0].imageMeta.noEndorsement, true);
  for (const file of [runtime.people.find(person => person.id === "johan_thrane_holst_freia").image, place.objects[0].image, place.structures[0].image, freia[0].logo]) {
    assert.equal(exists(file), true, file);
  }
});

test("front, place, object, structure, person and wordmark assets are local and documented", () => {
  for (const file of [place.frontImage, place.image, place.cardImage, place.objects[0].image, place.structures[0].image, "bilder/kort/people/johan_thrane_holst_freia.webp", "bilder/kort/brands/freia_wordmark.webp"]) {
    assert.equal(exists(file), true, file);
  }
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
  assert.ok(webpDimensions(place.frontImage).height > webpDimensions(place.frontImage).width);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.generationMethod, "openai_imagegen");
  assert.match(place.frontImageMeta.representationScope, /ikke.*historisk fotografi/i);
  assert.equal(place.imageMeta.license, "Public domain");
  assert.equal(place.objects[0].imageMeta.license, "Public domain");
  assert.equal(place.structures[0].imageMeta.license, "Public domain");
});

test("description, People claims and Næringsliv production packets are complete", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/freia_fabrikken.json", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(peopleClaims.completion.current_status, "ready_people_v1");
  assert.equal(peopleClaims.completion.claims_verified, "9/9");
  assert.equal(business.status, "ready");
  assert.equal(business.economicIdentity.anchorType, "factory");
  assert.equal(business.quizOpening.status, "PASS");
  assert.equal(business.quizOpening.firstTwoSetsQuestionCount, 14);
  assert.ok(Object.values(business.gates).every(gate => gate.status === "PASS"));
});

test("narrow quiz has 3x7 progression, 14 normal questions and final analysis", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "narrow_3x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 21);
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type) && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(14).every(question => question.question_type === "analysis"));
  assert.equal(questions.slice(14).filter(question => question.method_id).length, 4);
  assert.ok(questions.slice(14).some(question => question.thinker_id === "max_weber"));
  assert.ok(questions.slice(14).some(question => question.thinker_id === "adam_smith"));
  assert.equal(brief.claims.length, 21);
});

test("popup systems are materialized without war-history content", () => {
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.lesespor.length, 3);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.deepEqual(stories[0].related_people, ["johan_thrane_holst_freia", "edvard_munch", "ole_sverre"]);
  const visibleContent = JSON.stringify({ desc: place.desc, popupDesc: place.popupDesc, story: stories, leksikon: runtime.leksikon, quiz });
  assert.doesNotMatch(visibleContent, /krig|okkupasjon|deportasjon/i);
});

test("source conflict and final quality gate are explicit and blocker-free", () => {
  assert.deepEqual(audit.source_conflicts.map(item => item.status), ["rejected"]);
  assert.match(audit.source_conflicts[0].reason, /1892/);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
