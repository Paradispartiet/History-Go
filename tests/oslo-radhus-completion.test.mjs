import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";
import { validatePolitikkPlaceReport } from "../scripts/audit-politikk-place-production.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/politikk/oslo/places_politikk/oslo_radhus.json");
const production = read("data/places/production/oslo_radhus.json");
const politics = read("data/places/politikk-production/oslo_radhus.json");
const quiz = read("data/quiz/politikk/oslo_radhus_sets.json");
const brief = read("data/quiz/production_briefs/politikk/oslo_radhus.json");
const runtime = read("data/runtime/place-open/oslo_radhus.json");
const audit = read("reports/place-production/oslo-radhus-phase1-24-gate-audit-v1.json");
const actors = read("data/brands/actors_by_place.json").oslo_radhus;

test("Oslo rådhus preserves its verified coordinate and has four canonical collections", () => {
  assert.equal(place.lat, 59.91174989125625);
  assert.equal(place.lon, 10.733452414128745);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.place_card_profile.category_collection_label, "Hendelser og vedtak");
  assert.deepEqual(place.objects.map(item => item.id), ["oslo_radhus_klokkespill"]);
  assert.deepEqual(place.productions.map(item => item.id), ["nobels_fredsprisseremoni_2009"]);
  assert.equal(runtime.people.some(item => item.id === "magnus_poulsson"), true);
  assert.equal(runtime.brands.some(item => item.id === "oslo_bystyre"), true);
});

test("collection imagery is local, source-labelled and visually reviewed", () => {
  const brand = actors.find(item => item.id === "oslo_bystyre");
  const person = runtime.people.find(item => item.id === "magnus_poulsson");
  const files = [place.image, place.cardImage, place.frontImage, person.image, brand.image, ...place.objects.map(item => item.image), ...place.productions.map(item => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(person.imageMeta.license, "Public domain");
  assert.match(place.objects[0].imageMeta.note, /ikke alle klokkene er synlige/);
  assert.match(brand.imageMeta.note, /ingen godkjenning/);
  assert.equal(place.productions[0].imageMeta.date, "2009-12-10");
});

test("description and Politikk packets pass with institutional boundaries explicit", () => {
  const packetResult = validatePacket({ packet: production, place, packetFile: "data/places/production/oslo_radhus.json", now: new Date("2026-08-28T12:00:00Z") });
  assert.deepEqual(packetResult.issues, []);
  const canonicalEmneIds = new Set(Object.keys(read("data/fag/politikk/politikk_runtime_manifest.json").chapterByEmne || {}));
  const politicsIssues = validatePolitikkPlaceReport({ report: politics, place, canonicalEmneIds, root, now: new Date("2026-08-28T12:00:00Z") });
  assert.deepEqual(politicsIssues, []);
  assert.ok(Object.values(politics.gates).every(gate => gate.status === "PASS"));
  assert.match(place.popupDesc, /Nobelkomité velger prisvinneren/);
  assert.match(place.popupDesc, /ikke at alle rom og prosesser er tilgjengelige/);
});

test("major quiz has 8x7 progression, balanced claims and delayed theory", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.production_context.profile, "major_8x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 56);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 56);
  assert.deepEqual([...new Set(questions.map(question => question.answerIndex))].sort(), [0, 1, 2]);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.deepEqual(brief.claims.reduce((counts, claim) => ({ ...counts, [claim.family]: (counts[claim.family] || 0) + 1 }), {}), { fact: 28, context: 14, concept_theory: 14 });
  assert.ok(questions.slice(49).every(question => question.method_id));
  assert.equal(questions.filter(question => question.thinker_id).length, 1);
  assert.equal(questions[55].thinker_id, "robert_dahl");
  assert.ok(questions.every(question => question.source_origin === "external"));
});

test("runtime modules and six-dimension quality gate are complete", () => {
  assert.equal(runtime.language.entries.length, 6);
  assert.equal(runtime.leksikon.length, 4);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(runtime.stories.length, 3);
  assert.equal(place.module_audit.for_na.status, "held_back");
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
