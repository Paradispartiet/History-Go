import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/places/markveien.json");
const production = read("data/places/production/markveien.json");
const runtime = read("data/runtime/place-open/markveien.json");
const quiz = read("data/quiz/by/markveien_sets.json");
const brief = read("data/quiz/production_briefs/by/markveien.json");
const context = read("data/quiz/production_context/by/markveien.json");
const brands = read("data/brands/brands_by_place.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/markveien.json");
const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter(item => item.place_ids?.includes("markveien"));
const stories = read("data/stories/stories_markveien_by.json");
const audit = read("reports/place-production/markveien-phase8-24-gate-audit-v1.json");

test("Markveien has an exact four-collection PlaceCard and complete local graph", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.deepEqual(place.related_people_ids, ["thorvald_meyer"]);
  assert.deepEqual(place.objects.map(item => item.id), ["markveien_57"]);
  assert.deepEqual(brands.markveien, ["froken_dianas_salonger", "robot"]);
  assert.deepEqual(place.related_place_ids, [
    "olaf_ryes_plass", "birkelunden", "sofienbergparken", "sofienberg_kirke",
    "daelenenga_idrettspark", "paulus_kirke", "schous_bryggeri"
  ]);
  assert.ok(!place.place_card_profile.collection_ids.includes("badges"));
  assert.ok(!place.place_card_profile.collection_ids.includes("quiz"));
});

test("current brands replace stale or wrongly located vintage mappings", () => {
  assert.deepEqual(runtime.brands.map(brand => brand.id), ["froken_dianas_salonger", "robot"]);
  for (const stale of ["lucky_eddie", "retro_lykke", "velouria_vintage", "velouria"]) {
    assert.ok(!brands.markveien.includes(stale), stale);
    assert.ok(!runtime.brands.some(brand => brand.id === stale), stale);
  }
});

test("description, object, language, readings and Story are production-ready", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/markveien.json", now: new Date("2026-08-26T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(production.status, "ready_v4_2");
  assert.ok(production.claims.every(claim => claim.status === "verified"));
  assert.equal(fs.existsSync(path.join(root, "bilder/kort/objects/markveien_57.webp")), true);
  assert.deepEqual(language.entries.map(entry => entry.term), ["Markveien", "Seilduksgårdene", "snublestein"]);
  assert.equal(readings.length, 3);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].score.total, 19);
});

test("the existing 42-question bank is reused with canonical progression", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_6x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 42);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 42);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  const family = question => question.question_type === "concept" ? "concept_theory" : ["analysis", "context", "comparison"].includes(question.question_type) ? "context" : "fact";
  const counts = questions.reduce((out, question) => ({ ...out, [family(question)]: (out[family(question)] || 0) + 1 }), {});
  assert.deepEqual(counts, { fact: 25, context: 10, concept_theory: 7 });
  assert.ok(questions.slice(35).every(question => question.method_id && question.topic_hook_id && question.thinker_id));
  const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, question.id);
    assert.equal(question.claim_basis, claim.statement, question.id);
    assert.deepEqual(question.source, claim.source_ids, question.id);
  }
});

test("place-open exposes every materialized phase surface exactly once", () => {
  assert.deepEqual(runtime.people.map(person => person.id), ["thorvald_meyer"]);
  assert.deepEqual(runtime.place.objects.map(item => item.id), ["markveien_57"]);
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.lesespor.length, 3);
});

test("the six-part quality gate is explicit and high quality", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
