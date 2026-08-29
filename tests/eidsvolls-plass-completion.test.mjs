import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";
import { validatePolitikkPlaceReport } from "../scripts/audit-politikk-place-production.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/politikk/oslo/places_politikk/eidsvolls_plass.json");
const production = read("data/places/production/eidsvolls_plass.json");
const politics = read("data/places/politikk-production/eidsvolls_plass.json");
const quiz = read("data/quiz/politikk/eidsvolls_plass_sets.json");
const brief = read("data/quiz/production_briefs/politikk/eidsvolls_plass.json");
const runtime = read("data/runtime/place-open/eidsvolls_plass.json");
const audit = read("reports/place-production/eidsvolls-plass-phase1-24-gate-audit-v1.json");
const actors = read("data/brands/actors_by_place.json").eidsvolls_plass;

test("Eidsvolls plass preserves geometry and has four canonical collections", () => {
  assert.equal(place.lat, 59.91333813065615);
  assert.equal(place.lon, 10.738953660589342);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.place_card_profile.category_collection_label, "Hendelser og vedtak");
  assert.deepEqual(place.objects.map(item => item.id), ["eidsvolls_plass_wergelandmonumentet"]);
  assert.deepEqual(place.productions.map(item => item.id), ["eidsvolls_plass_fosen_markering_2023"]);
  assert.equal(runtime.people.some(item => item.id === "brynjulf_bergslien"), true);
  assert.equal(runtime.brands.some(item => item.id === "stortinget_nasjonalforsamling"), true);
});

test("collection and before/now imagery is local, licensed and reviewed", () => {
  const actor = actors.find(item => item.id === "stortinget_nasjonalforsamling");
  const person = runtime.people.find(item => item.id === "brynjulf_bergslien");
  const files = [place.image, place.cardImage, place.frontImage, person.image, actor.image, ...place.objects.map(item => item.image), ...place.productions.map(item => item.image), place.for_na.beforeImage, place.for_na.nowImage];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.objects[0].imageMeta.license, "CC BY-SA 3.0");
  assert.match(place.productions[0].imageMeta.note, /ikke alene/);
  assert.match(place.for_na.change, /ståsted.*ulike/);
  assert.equal(audit.manual_image_review.status, "PASS");
});

test("description and Politics packets pass with arena and power boundaries explicit", () => {
  const packetResult = validatePacket({ packet: production, place, packetFile: "data/places/production/eidsvolls_plass.json", now: new Date("2026-08-29T20:00:00Z") });
  assert.deepEqual(packetResult.issues, []);
  const canonicalEmneIds = new Set(Object.keys(read("data/fag/politikk/politikk_runtime_manifest.json").chapterByEmne || {}));
  const politicsIssues = validatePolitikkPlaceReport({ report: politics, place, canonicalEmneIds, root, now: new Date("2026-08-29T20:00:00Z") });
  assert.deepEqual(politicsIssues, []);
  assert.ok(Object.values(politics.gates).every(gate => gate.status === "PASS"));
  assert.match(place.popupDesc, /ikke stortingsbygningen/);
  assert.match(place.popupDesc, /ikke det samme som at Stortinget støtter/);
  assert.match(place.popupDesc, /ikke alene vise hvem som representerer opinionen/);
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
  assert.equal(questions[55].thinker_id, "jurgen_habermas");
  assert.ok(questions.every(question => question.source_origin === "external"));
});

test("runtime modules and six-dimension quality gate are complete", () => {
  assert.equal(runtime.language.entries.length, 6);
  assert.equal(runtime.leksikon.length, 4);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(runtime.stories.length, 4);
  assert.equal(runtime.leksikon[0].chronology.length, 10);
  assert.equal(place.module_audit.for_na.status, "produced_with_viewpoint_caveat");
  assert.equal(place.module_audit.news.status, "produced");
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
