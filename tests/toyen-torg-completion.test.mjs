import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = (file) => fs.existsSync(path.join(root, file));
const place = read("data/places/by/oslo/places/toyen_torg.json");
const production = read("data/places/production/toyen_torg.json");
const runtime = read("data/runtime/place-open/toyen_torg.json");
const quiz = read("data/quiz/by/toyen_torg_sets.json");
const brief = read("data/quiz/production_briefs/by/toyen_torg.json");
const context = read("data/quiz/production_context/by/toyen_torg.json");
const leksikon = read("data/leksikon/places/oslo/by/leksikon_toyen_torg.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/toyen_torg.json");
const stories = read("data/stories/stories_toyen_torg.json");
const audit = read("reports/place-production/toyen-torg-phase1-24-gate-audit-v1.json");
const workcard = read("reports/place-production/toyen-torg-workcard-current.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

test("Tøyen torg har én avgrenset torgidentitet og nøyaktig fire By-samlinger", () => {
  assert.equal(place.id, "toyen_torg");
  assert.equal(place.category, "by");
  assert.equal(place.year, 2018);
  assert.equal(place.production_profile, "standard");
  assert.equal(place.production_status, "complete");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.equal("productions" in place, false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"), false);
  assert.deepEqual(place.related_people_ids, ["mari_meen_halsoy"]);
  assert.deepEqual(place.objects.map((item) => item.id), ["toyen_torg_toyenteppene", "toyen_torg_lysmaster"]);
  assert.deepEqual(place.structures.map((item) => item.id), ["toyen_torg_toyensenteret"]);
  assert.deepEqual(brandsByPlace.toyen_torg, ["grindaker"]);
  assert.deepEqual(runtime.people.map((item) => item.id), ["mari_meen_halsoy"]);
  assert.deepEqual(runtime.brands.map((item) => item.id), ["grindaker"]);
});

test("alle samlingspreviews er lokale og den redaksjonelle illustrasjonen er transparent", async () => {
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, ...runtime.people.map((item) => item.image), ...place.objects.map((item) => item.image), ...place.structures.map((item) => item.image), ...runtime.brands.map((item) => item.logo)];
  for (const file of files) assert.equal(exists(file), true, file);
  const { default: sharp } = await import("sharp");
  const front = await sharp(path.join(root, place.frontImage)).metadata();
  assert.deepEqual({ width: front.width, height: front.height }, { width: 900, height: 1200 });
  const portrait = runtime.people[0];
  const portraitMeta = await sharp(path.join(root, portrait.image)).metadata();
  const portraitStats = await sharp(path.join(root, portrait.image)).stats();
  assert.equal(portrait.imageMeta.mediaType, "editorial_illustration");
  assert.equal(portrait.imageMeta.background, "transparent");
  assert.equal(portraitMeta.hasAlpha, true);
  assert.equal(portraitStats.isOpaque, false);
  assert.equal(runtime.brands[0].imageMeta.generated, false);
  assert.equal(runtime.brands[0].imageMeta.reconstructed, false);
});

test("beskrivelsespakken validerer og dokumenterer kildekonflikten", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/toyen_torg.json", now: new Date("2026-09-01T20:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.metadataSnapshot.category, "by");
  assert.match(production.source_conflicts[0].reason, /5200.*5330.*5400/);
  assert.match(place.popupDesc, /ulike arealtall/);
  assert.match(place.for_na.change, /ulike ståsteder/);
});

test("Fagverk, kronologi, Story, språk og Lesespor er komplett", () => {
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level, "full");
  assert.equal(place.fagverk.status, "curated");
  assert.equal(leksikon.length, 3);
  assert.equal(leksikon[0].chronology.length, 5);
  assert.equal(language.entries.length, 6);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].score.total, 20);
  assert.equal(runtime.leksikon.length, 3);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.lesespor.length, 4);
});

test("Historie-quizen er normal 4x7 med ren åpning og sen metode og teori", () => {
  const questions = quiz.sets.flatMap((set) => set.questions);
  const distribution = [0, 1, 2].map((index) => questions.filter((question) => question.answerIndex === index).length);
  assert.equal(quiz.categoryId, "by");
  assert.equal(context.profile, "normal_4x7");
  assert.deepEqual(quiz.sets.map((set) => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map((question) => question.id)).size, 28);
  assert.ok(questions.slice(0, 14).every((question) => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.deepEqual(distribution, [10, 9, 9]);
  assert.equal(quiz.production_context.theory_start_phase, "final");
  assert.equal(quiz.production_context.method_start_phase, "final");
  assert.equal(brief.claims.length, 28);
});

test("People-profilen og den seksdimensjonale kvalitetsgaten er lukket", () => {
  const claims = read("data/people/claims/kunst/oslo/toyen_torg/mari_meen_halsoy.claims.json");
  assert.equal(claims.completion.current_status, "ready_people_v1");
  assert.equal(claims.completion.claims_verified, "6/6");
  const dimensions = Object.values(audit.quality_score).filter((value) => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every((dimension) => dimension.score >= 4));
  assert.equal(audit.quality_score.total, 29);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.rule_preflight.status, "PASS");
});
