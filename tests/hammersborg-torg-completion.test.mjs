import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/places/hammersborg_torg.json");
const production = read("data/places/production/hammersborg_torg.json");
const runtime = read("data/runtime/place-open/hammersborg_torg.json");
const quiz = read("data/quiz/by/hammersborg_torg_sets.json");
const brief = read("data/quiz/production_briefs/by/hammersborg_torg.json");
const context = read("data/quiz/production_context/by/hammersborg_torg.json");
const leksikon = read("data/leksikon/places/oslo/by/leksikon_hammersborg_torg.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/hammersborg_torg.json");
const stories = read("data/stories/stories_hammersborg_torg.json");
const audit = read("reports/place-production/hammersborg-torg-phase1-24-gate-audit-v1.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

const webpDimensions = (file) => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }
  assert.equal(buffer.toString("ascii", 12, 16), "VP8 ");
  return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
};

test("Hammersborg torg has one bounded square identity and exact four By collections", () => {
  assert.equal(place.name, "Hammersborg torg");
  assert.equal(place.category, "by");
  assert.equal(place.lat, 59.9167293);
  assert.equal(place.lon, 10.7484971);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(place.sourceObjectId, "osm-way:661556268");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.equal("productions" in place, false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"), false);
  assert.deepEqual(place.objects.map((item) => item.id), ["hammersborg_torg_vannpost", "hammersborg_torg_pissoir"]);
  assert.deepEqual(place.structures.map((item) => item.id), ["hammersborg_torg_1", "hammersborg_torg_bolign", "hammersborg_torg_hammersborgslottet"]);
  assert.deepEqual(brandsByPlace.hammersborg_torg, ["obos"]);
  assert.deepEqual(runtime.people.map((item) => item.id), ["frode_rinnan", "christian_fredrik_morgenstierne", "peter_hoier_holtermann"]);
  assert.deepEqual(runtime.brands.map((item) => item.id), ["obos"]);
});

test("all collection previews are local, real and rights-reviewed", () => {
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, ...runtime.people.map((item) => item.image), ...place.objects.map((item) => item.image), ...place.structures.map((item) => item.image), ...runtime.brands.map((item) => item.logo)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
  assert.deepEqual(webpDimensions(runtime.brands[0].logo), { width: 900, height: 520 });
  assert.ok(runtime.people.every((person) => person.imageMeta?.license));
  assert.equal(runtime.people.find((person) => person.id === "christian_fredrik_morgenstierne").imageMeta.mediaType, "historical_portrait_painting");
  assert.equal(runtime.people.find((person) => person.id === "peter_hoier_holtermann").imageMeta.mediaType, "artistic_portrait_crop");
  assert.equal(runtime.brands[0].imageMeta.generated, false);
  assert.equal(runtime.brands[0].imageMeta.reconstructed, false);
});

test("description packet and historical claims validate without issues", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/hammersborg_torg.json", now: new Date("2026-09-01T18:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.metadataSnapshot.category, "by");
  assert.match(production.source_conflicts[0].reason, /1961.*1962/);
  assert.match(place.popupDesc, /planlagt tidsangivelse/);
  assert.equal(place.news.temporalStatus, "planned");
  assert.match(place.news.temporalNote, /ikke.*ferdig/i);
});

test("language, chronology, Story and reading tracks are complete", () => {
  assert.equal(language.entries.length, 6);
  assert.equal(leksikon.length, 3);
  assert.equal(leksikon[0].chronology.length, 10);
  assert.equal(runtime.leksikon.length, 3);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].score.total, 16);
});

test("normal quiz has 4x7 progression, direct opening and delayed theory", () => {
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.equal(context.profile, "normal_4x7");
  assert.equal(quiz.categoryId, "by");
  assert.deepEqual(quiz.sets.map((set) => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map((question) => question.claim_id)).size, 28);
  assert.ok(questions.slice(0, 14).every((question) => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(23).every((question) => question.method_id && question.topic_hook_id && question.thinker_id));
  assert.equal(brief.claims.length, 28);
  assert.ok(questions.every((question) => question.source_origin === "external"));
});

test("three People profiles and the six-dimensional quality gate are complete", () => {
  for (const id of ["frode_rinnan", "christian_fredrik_morgenstierne", "peter_hoier_holtermann"]) {
    const claims = read(`data/people/claims/by/oslo/hammersborg_torg/${id}.claims.json`);
    assert.equal(claims.completion.current_status, "ready_people_v1");
    assert.equal(claims.completion.claims_verified, "5/5");
  }
  const dimensions = Object.values(audit.quality_score).filter((value) => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every((dimension) => dimension.score === 5));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
