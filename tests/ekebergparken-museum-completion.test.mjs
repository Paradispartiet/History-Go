import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const place = read("data/places/historie/oslo/places_historie/ekebergparken_museum.json");
const runtime = read("data/runtime/place-open/ekebergparken_museum.json");
const quiz = read("data/quiz/historie/ekebergparken_museum_sets.json");
const history = read("data/places/historie-production/ekebergparken_museum.json");
const audit = read("reports/place-production/ekebergparken-museum-phase1-24-gate-audit-v1.json");

test("museum identity and collision boundary are exact", () => {
  assert.equal(place.name, "Ekebergparken Museum");
  assert.equal(place.lat, 59.89854101481173);
  assert.equal(place.lon, 10.75966997323581);
  assert.deepEqual(place.emne_ids, ["em_his_museum_samling_kanon", "em_his_spor_materialitet"]);
  assert.match(place.popupDesc, /ikke identisk med hele skulpturparken/);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.place_card_profile.category_collection_label, "Historiske hendelser");
});

test("all four collections use local, specific preview assets", () => {
  assert.deepEqual(place.related_people_ids, ["christian_ringnes"]);
  assert.deepEqual(place.objects.map(item => item.id), ["arkeologiske_funn_fra_ekeberg"]);
  assert.deepEqual(place.productions.map(item => item.id), ["lunds_hus_apnet_for_publikum_2013"]);
  assert.deepEqual(runtime.brands.map(item => item.id), ["ekebergparken_institusjon"]);
  for (const file of [place.image, place.cardImage, place.frontImage, runtime.people[0].image, place.objects[0].image, place.productions[0].image, runtime.brands[0].logo]) {
    assert.equal(exists(file), true, file);
  }
  assert.equal(runtime.people[0].imageMeta.license, "CC BY-SA 3.0");
  assert.equal(runtime.brands[0].imageMeta.noEndorsement, true);
});

test("runtime, story and History case are complete", () => {
  assert.equal(runtime.language.entries.length, 4);
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.stories[0].quality_profile, "episode_v1");
  assert.equal(history.status, "ready");
  assert.ok(Object.values(history.gates).every(gate => gate.status === "PASS"));
  assert.match(history.caseRealizations[0].sourceComparison.contradictionsOrSilences, /begrensning/);
});

test("quiz follows normal 4x7 progression", () => {
  assert.equal(quiz.categoryId, "historie");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 28);
  assert.ok(questions.every(question => question.source_origin === "external"));
});

test("quality gate has six passing dimensions and no blockers", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
