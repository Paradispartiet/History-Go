import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/historie/oslo/places_historie/ekeberg_helleristninger.json");
const runtime = read("data/runtime/place-open/ekeberg_helleristninger.json");
const quiz = read("data/quiz/historie/ekeberg_helleristninger_sets.json");
const brief = read("data/quiz/production_briefs/historie/ekeberg_helleristninger.json");
const history = read("data/places/historie-production/ekeberg_helleristninger.json");
const claims = read("data/places/production/ekeberg_helleristninger.json");
const story = read("data/stories/stories_ekeberg_helleristninger.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/ekeberg_helleristninger.json");
const leksikon = read("data/leksikon/places/oslo/historie/leksikon_ekeberg_helleristninger.json");
const audit = read("reports/place-production/ekeberg-helleristninger-phase1-24-gate-audit-v1.json");

test("preserves official field identity and collision boundary", () => {
  assert.equal(place.id, "ekeberg_helleristninger");
  assert.equal(place.coordSourceId, "kulturminnesok:41907");
  assert.equal(place.coordStatus, "verified_geometry");
  assert.deepEqual([place.lat, place.lon], [59.8975599746796, 10.759838207896665]);
  for (const excluded of ["Ekebergparken", "museumsbygningen Lunds hus", "Ekebergsletta"]) {
    assert.match(place.popupDesc, new RegExp(excluded, "i"));
  }
});

test("has a confirmed focused profile and exactly four complete collections", () => {
  assert.equal(place.production_profile, "focused");
  assert.equal(place.profile_status, "confirmed");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.objects.length, 3);
  assert.equal(place.productions.length, 1);
  assert.equal(runtime.people[0].id, "jan_greve_thaulow_petersen");
  assert.equal(runtime.brands[0].id, "universitetet_i_oslo");
  for (const file of [
    place.frontImage,
    place.objects[0].image,
    place.objects[1].image,
    place.objects[2].image,
    place.productions[0].image,
    runtime.people[0].image,
    runtime.brands[0].logo
  ]) assert.ok(fs.existsSync(file), `missing ${file}`);
});

test("normal quiz is 4x7, source-led and theory-free in its opening", () => {
  assert.equal(quiz.sets.length, 4);
  assert.equal(quiz.sets.flatMap(set => set.questions).length, 28);
  assert.equal(quiz.sets.slice(0, 2).flatMap(set => set.questions).length, 14);
  assert.equal(quiz.sets.slice(0, 2).flatMap(set => set.questions).filter(question => question.theory_ref).length, 0);
  assert.ok(quiz.sets[3].questions.filter(question => question.theory_ref).length >= 1);
  assert.equal(Object.values(brief.sources).every(source => source.review_status === "reviewed"), true);
  assert.ok(brief.held_back_candidates.some(item => /Eksakt tilblivelsesår/.test(item)));
});

test("history and description production gates are complete", () => {
  assert.equal(history.status, "ready");
  assert.deepEqual(Object.keys(history.gates), [..."ABCDEFGH"]);
  assert.equal(Object.values(history.gates).every(gate => gate.status === "PASS"), true);
  assert.equal(history.presentTrace.objectStatus, "original");
  assert.equal(claims.status, "ready_v4_2");
  assert.equal(claims.roundsReadiness.exactCollectionCount, 4);
  assert.equal(claims.source_conflicts[0].topic, "datering");
  assert.equal(claims.completion.claimsVerified.total, claims.completion.claimsVerified.verified);
});

test("language, chronology, story and final quality gate are materialized", () => {
  assert.equal(language.entries.length, 4);
  assert.ok(language.entries.some(entry => entry.term === "veideristning"));
  assert.deepEqual(leksikon.chronology.map(item => item.year), [1915]);
  assert.equal(story.length, 1);
  assert.equal(story[0].quality_profile, "episode_v1");
  assert.equal(story[0].episode.date, "1915-09-12");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
