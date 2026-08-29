import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/sport/europa/norway/oslo_sport/ekebergsletta.json");
const runtime = read("data/runtime/place-open/ekebergsletta.json");
const quiz = read("data/quiz/sport/ekebergsletta_sets.json");
const brief = read("data/quiz/production_briefs/sport/ekebergsletta.json");
const context = read("data/quiz/production_context/sport/ekebergsletta.json");
const production = read("data/places/production/ekebergsletta.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/ekebergsletta.json");
const leksikon = read("data/leksikon/places/oslo/sport/leksikon_ekebergsletta.json");
const stories = read("data/stories/stories_ekebergsletta.json");
const audit = read("reports/place-production/ekebergsletta-phase1-24-gate-audit-v1.json");

test("preserves the verified Ekebergsletta geometry and explicit place boundary", () => {
  assert.deepEqual([place.lat, place.lon, place.r], [59.89467318346404, 10.77769035476144, 320]);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(place.sourceObjectId, "osm-relation:15951742");
  for (const excluded of ["Ekebergparken", "Ekeberg idrettshall", "helleristningsfeltet"]) {
    assert.match(place.popupDesc, new RegExp(excluded, "i"));
  }
});

test("has the standard four-collection sport profile with local previews", () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "competitions"]);
  assert.equal(place.place_card_profile.category_collection_label, "Kamper og konkurranser");
  assert.equal(runtime.people[0].id, "rolf_hofmo");
  assert.equal(runtime.brands[0].id, "bekkelagets_sportsklub");
  assert.equal(place.objects[0].id, "norway_cup_flaggrekke");
  assert.equal(place.competitions[0].id, "norway_cup");
  for (const file of [place.image, place.cardImage, place.frontImage, place.images[0].src, runtime.people[0].image, place.objects[0].image, runtime.brands[0].logo, place.competitions[0].image]) {
    assert.ok(fs.existsSync(file), `missing ${file}`);
  }
});

test("rich quiz is 5x7, source-led and theory-free in the first two sets", () => {
  assert.equal(quiz.size_class, "rich_5x7");
  assert.equal(quiz.sets.length, 5);
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7, 7]);
  const opening = quiz.sets.slice(0, 2).flatMap(set => set.questions);
  assert.equal(opening.length, 14);
  assert.equal(opening.every(question => question.question_type === "fact"), true);
  assert.equal(opening.some(question => question.theory_ref || question.method_id), false);
  assert.equal(quiz.sets.flatMap(set => set.questions).every(question => question.source.length > 0), true);
  assert.equal(quiz.sets[4].questions.some(question => question.theory_ref), true);
  assert.equal(Object.values(brief.sources).every(source => source.review_status === "reviewed"), true);
  assert.deepEqual(brief.claims.map(claim => claim.order), Array.from({ length: 35 }, (_, index) => index + 1));
  assert.equal(context.profile, "rich_5x7");
  assert.equal(context.profile_decision.profile, "rich");
});

test("language, chronology, stories and Fagverk material are place-specific", () => {
  assert.equal(language.entries.length, 6);
  for (const term of ["Ekebergsletta", "breddeidrett", "dugnad", "turneringslandskap", "Norway Cup"]) {
    assert.ok(language.entries.some(entry => entry.term === term), `missing term ${term}`);
  }
  assert.deepEqual(leksikon.chronology.map(item => item.year), [1946, 1947, 1948, 1959, 1972, 1975, 1976, 2023]);
  assert.equal(stories.length, 2);
  assert.equal(stories.every(story => story.quality_profile === "episode_v1"), true);
  assert.ok(stories.some(story => story.episode.date === "1972"));
});

test("production packet has sentence-complete explicit evidence and a 30/30 gate", () => {
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.claims.length, production.completion.claimsVerified.total);
  assert.equal(production.claims.every(claim => claim.sourceUrl && claim.sourceLocation && claim.status === "verified"), true);
  assert.equal(production.roundsReadiness.exactCollectionCount, 4);
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
  assert.equal(Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value).every(value => value.score >= 4), true);
});
