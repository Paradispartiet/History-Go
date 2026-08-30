import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/places/universitetsplassen.json");
const production = read("data/places/production/universitetsplassen.json");
const quiz = read("data/quiz/by/universitetsplassen_sets.json");
const runtime = read("data/runtime/place-open/universitetsplassen.json");
const leksikon = read("data/leksikon/places/oslo/by/leksikon_universitetsplassen.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/universitetsplassen.json");
const audit = read("reports/place-production/universitetsplassen-phase1-24-gate-audit-v1.json");

test("Universitetsplassen has exact four By collections and preserved geometry", () => {
  assert.equal(place.lat, 59.9154);
  assert.equal(place.lon, 10.7355);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.objects.map(item => item.id), ["universitetsplassen_schweigaardstatuen", "universitetsplassen_pa_munch_statuen"]);
  assert.equal(place.structures.length, 4);
  assert.deepEqual(runtime.brands.map(item => item.id), ["universitetet_i_oslo"]);
  assert.deepEqual(runtime.people.map(item => item.id), ["christian_heinrich_grosch"]);
});

test("all selected images exist and portrait front is real", () => {
  const person = runtime.people[0];
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, person.image, ...place.objects.map(item => item.image), ...place.structures.map(item => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.outputDimensions, "900x1200");
  assert.ok(place.objects.every(item => item.imageMeta?.license));
  assert.ok(place.structures.every(item => item.imageMeta?.license));
});

test("description packet validates without issues", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/universitetsplassen.json", now: new Date("2026-08-29T21:00:00Z") });
  assert.deepEqual(result.issues, []);
});

test("language, leksikon, stories and readings are complete", () => {
  assert.equal(language.entries.length, 6);
  assert.equal(leksikon.length, 4);
  assert.equal(leksikon[0].chronology.length, 10);
  assert.equal(runtime.leksikon.length, 4);
  assert.equal(runtime.stories.length, 4);
  assert.equal(runtime.lesespor.length, 4);
});

test("major quiz is unique 8x7 with delayed methods", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"]);
  assert.equal(quiz.sets.length, 8);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 56);
  assert.equal(new Set(questions.map(question => question.id)).size, 56);
  assert.equal(new Set(questions.map(question => question.question)).size, 56);
  assert.ok(questions.slice(0, 49).every(question => !question.method_id));
  assert.ok(questions.slice(49).every(question => question.method_id));
  assert.deepEqual([...new Set(questions.map(question => question.answerIndex))].sort(), [0, 1, 2]);
  assert.ok(questions.every(question => question.source_origin === "external"));
});

test("six-dimensional quality gate is 30/30", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score === 5));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
