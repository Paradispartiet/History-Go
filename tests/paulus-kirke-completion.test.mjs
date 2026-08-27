import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/historie/oslo/places_historie/paulus_kirke.json");
const production = read("data/places/production/paulus_kirke.json");
const runtime = read("data/runtime/place-open/paulus_kirke.json");
const quiz = read("data/quiz/historie/paulus_kirke_sets.json");
const brief = read("data/quiz/production_briefs/historie/paulus_kirke.json");
const context = read("data/quiz/production_context/historie/paulus_kirke.json");
const audit = read("reports/place-production/paulus-kirke-phase8-24-gate-audit-v1.json");
const stories = read("data/stories/stories_paulus_kirke.json");
const storyTypes = read("data/stories/story_types.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");
const placesIndex = read("data/places/places_index.json");
const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  assert.equal(buffer.toString("ascii", 12, 16), "VP8 ");
  return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
};

test("Paulus kirke has exact, non-filler PlaceCard collections", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.deepEqual(place.related_people_ids, ["henrik_bull"]);
  assert.deepEqual(place.objects.map(item => item.id), ["paulus_kirke_tarn"]);
  assert.deepEqual(brandsByPlace.paulus_kirke, ["paulus_sofienberg_menighet"]);
  const parish = brands.find(brand => brand.id === "paulus_sofienberg_menighet");
  assert.equal(parish.logo, "bilder/kort/brands/den_norske_kirke.webp");
  assert.equal(fs.existsSync(path.join(root, parish.logo)), true);
  const relatedPreview = placesIndex.find(candidate => candidate.id === place.related_place_ids[0]);
  assert.equal(relatedPreview.id, "birkelunden");
  assert.match(relatedPreview.cardImage || relatedPreview.image || "", /^https:\/\/upload\.wikimedia\.org\//);
  assert.equal(parish.imageMeta.reviewStatus, "manually_approved");
  assert.equal(parish.imageMeta.generated, false);
  assert.equal(parish.imageMeta.reconstructed, false);
  assert.match(parish.imageMeta.sourceAsset, /ps-logo\.png$/);
  assert.deepEqual(webpDimensions(parish.logo), { width: 900, height: 520 });
  assert.ok(!place.place_card_profile.collection_ids.includes("badges"));
  assert.ok(!place.place_card_profile.collection_ids.includes("quiz"));
});

test("generated imagery is local and explicitly identified as illustration", () => {
  for (const file of [place.image, place.cardImage, place.frontImage, place.objects[0].image]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file);
  }
  assert.equal(place.imageMeta.generationMethod, "openai_imagegen");
  assert.equal(place.imageMeta.assetType, "editorial_illustration");
  assert.match(place.imageMeta.representationScope, /ikke.*historisk fotografi/i);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.sourceDimensions, "1200x675");
  assert.equal(place.frontImageMeta.outputDimensions, "900x1200");
  assert.deepEqual(place.frontImageMeta.crop, { left: 347, top: 0, width: 506, height: 675 });
  const dimensions = webpDimensions(place.frontImage);
  assert.deepEqual(dimensions, { width: 900, height: 1200 });
  assert.ok(dimensions.height > dimensions.width);
});

test("description production and every materialized content surface are ready", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/paulus_kirke.json", now: new Date("2026-08-26T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(production.roundsReadiness.fagverk, "ready");
  assert.deepEqual(runtime.people.map(person => person.id), ["henrik_bull"]);
  assert.deepEqual(runtime.place.objects.map(item => item.id), ["paulus_kirke_tarn"]);
  assert.deepEqual(runtime.brands.map(brand => brand.id), ["paulus_sofienberg_menighet"]);
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.lesespor.length, 3);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.ok(storyTypes.types.some(type => type.id === stories[0].type));
  assert.deepEqual(stories[0].score, { narrative: 3, historical: 4, source: 4, play_value: 3, originality: 3, total: 17 });
});

test("canonical rich quiz has 5x7 progression and delayed theory", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 35);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.deepEqual(questions.reduce((out, question) => ({ ...out, [question.question_type]: (out[question.question_type] || 0) + 1 }), {}), { fact: 18, context: 10, concept: 7 });
  assert.ok(questions.slice(28).every(question => question.method_id && question.topic_hook_id && question.thinker_id));
  assert.equal(brief.claims.length, 35);
});

test("quality gate is explicit and blocker-free", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
