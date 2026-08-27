import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/gamle_trikkestallen/gamle_trikkestallen.json");
const production = read("data/places/production/gamle_trikkestallen.json");
const historyProduction = read("data/places/historie-production/gamle_trikkestallen.json");
const runtime = read("data/runtime/place-open/gamle_trikkestallen.json");
const quiz = read("data/quiz/by/gamle_trikkestallen_sets.json");
const brief = read("data/quiz/production_briefs/by/gamle_trikkestallen.json");
const context = read("data/quiz/production_context/by/gamle_trikkestallen.json");
const audit = read("reports/place-production/gamle-trikkestallen-phase1-24-gate-audit-v1.json");
const stories = read("data/stories/stories_gamle_trikkestallen.json");
const personClaims = read("data/people/claims/by/oslo/gamle_trikkestallen/per_horn.claims.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }
  assert.equal(buffer.toString("ascii", 12, 16), "VP8 ");
  return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
};

test("Gamle trikkestallen has the canonical By identity and exact four collections", () => {
  assert.equal(place.name, "Gamle trikkestallen på Torshov");
  assert.equal(place.category, "by");
  assert.equal(place.lat, 59.93283549643305);
  assert.equal(place.lon, 10.768161829321377);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.related_people_ids, ["per_horn"]);
  assert.deepEqual(place.objects.map(item => item.id), ["kss_motorvogn_torshov_1899", "gullfisk_192_torshov"]);
  assert.deepEqual(place.structures.map(item => item.id), ["torshov_vognhall_1899"]);
  assert.equal("productions" in place, false);
  assert.deepEqual(brandsByPlace.gamle_trikkestallen, ["egal_teater"]);
  assert.deepEqual(runtime.people.map(item => item.id), ["per_horn"]);
  assert.deepEqual(runtime.place.objects.map(item => item.id), ["kss_motorvogn_torshov_1899", "gullfisk_192_torshov"]);
  assert.deepEqual(runtime.place.structures.map(item => item.id), ["torshov_vognhall_1899"]);
  assert.deepEqual(runtime.brands.map(item => item.id), ["egal_teater"]);
});

test("real local imagery and official logo are rights-reviewed", () => {
  for (const file of [place.image, place.cardImage, place.frontImage, place.for_na.before.image, place.for_na.now.image, ...place.objects.map(item => item.image), ...place.structures.map(item => item.image), runtime.people[0].image, runtime.brands[0].logo]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file);
  }
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
  assert.deepEqual(webpDimensions(runtime.brands[0].logo), { width: 900, height: 520 });
  assert.equal(place.imageMeta.license, "CC BY-SA 4.0");
  assert.deepEqual(webpDimensions(runtime.people[0].image), { width: 900, height: 1200 });
  assert.equal(runtime.people[0].imageMeta.mediaType, "editorial_illustration");
  assert.match(runtime.people[0].imageMeta.disclosure, /ikke fotografi/i);
  assert.match(runtime.people[0].imageMeta.identityReference, /personen til høyre/i);
  const egal = brands.find(brand => brand.id === "egal_teater");
  assert.equal(egal.imageMeta.assetKind, "official_logo");
  assert.equal(egal.imageMeta.generated, false);
  assert.equal(egal.imageMeta.reconstructed, false);
});

test("description, History report and every runtime surface are ready", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/gamle_trikkestallen.json", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(historyProduction.status, "ready");
  assert.ok(Object.values(historyProduction.gates).every(gate => gate.status === "PASS"));
  assert.match(historyProduction.caseRealizations[0].sourceComparison.contradictionsOrSilences, /1977.*1974/);
  assert.match(place.popupDesc, /Pontoppidans gate 7/);
  assert.match(place.popupDesc, /Ung Media/);
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 4);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].score.total, 16);
  assert.deepEqual(stories[0].related_people, ["per_horn"]);
  assert.equal(personClaims.completion.claims_verified, "6/6");
});

test("normal quiz has 4x7 progression, direct opening and delayed theory", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "normal_4x7");
  assert.equal(quiz.categoryId, "by");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 28);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.equal(questions.filter(question => question.method_id).length, 5);
  assert.ok(questions.slice(23).every(question => question.method_id && question.topic_hook_id && question.thinker_id));
  assert.equal(brief.claims.length, 28);
  assert.equal(brief.categoryId, "by");
});

test("quality gate is blocker-free and all six dimensions pass", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
