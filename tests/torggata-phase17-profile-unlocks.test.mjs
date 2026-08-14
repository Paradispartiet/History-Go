import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const quiz = JSON.parse(fs.readFileSync("data/quiz/by/torggata_sets.json", "utf8"));
const profile = fs.readFileSync("js/profile.js", "utf8");
const mini = fs.readFileSync("js/ui/mini-profile.js", "utf8");
const collection = fs.readFileSync("js/profile-place-collection.js", "utf8");
const registry = fs.readFileSync("js/historyGoGameRegistry.js", "utf8");
const unlocks = fs.readFileSync("js/hg_unlocks.js", "utf8");
const reader = fs.readFileSync("js/progress/profileProgressReader.js", "utf8");

test("profile and miniProfile read the canonical visited and quiz sources", () => {
  assert.match(profile, /readProgressIdSet\("visited_places"\)/);
  assert.match(profile, /getCompletedQuizUnitCount/);
  assert.match(profile, /addEventListener\("updateProfile"/);
  assert.match(mini, /getVisitedPlaceCount/);
  assert.match(mini, /getCompletedQuizUnitCount/);
  assert.match(mini, /quiz_progress/);
  assert.match(mini, /HGLearningLog/);
});

test("profile collection keeps physical visit and quiz collection as a union", () => {
  assert.match(collection, /VISITED_KEY = "visited_places"/);
  assert.match(collection, /COLLECTED_KEY = "places_collected"/);
  assert.ok(collection.includes("new Set([...getVisitedPlaceIds(), ...getQuizCollectedPlaceIds()])"));
  assert.match(collection, /return "Besøkt"/);
  assert.match(collection, /return "Quiz"/);
  assert.match(registry, /js\/profile-place-collection\.js/);
});

test("place unlock uses its owner and requests profile refresh", () => {
  assert.match(unlocks, /PLACE_COLLECTION_KEY = "places_collected"/);
  assert.match(unlocks, /dispatchEvent\(new Event\("updateProfile"\)\)/);
  assert.match(unlocks, /detail\?\.kind !== "place"/);
  assert.match(unlocks, /recordCollectedPlace\(detail\.id, "quiz"\)/);
  assert.match(reader, /getPlaceProgressSummary/);
});

test("Torggata does not claim unsupported person, object or level rewards", () => {
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.equal(questions.length, 35);
  assert.ok(questions.every((question) => question.placeId === "torggata"));
  assert.ok(questions.every((question) => question.targetId === "torggata"));
  assert.ok(questions.every((question) => question.question_scope === "place"));
  for (const key of ["people_unlock", "object_unlock", "reward", "bronze", "silver", "gold", "profile_progress"]) {
    assert.equal(Object.hasOwn(place, key), false, "unexpected unsupported reward field: " + key);
  }
});
