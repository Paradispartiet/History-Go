import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const exists = file => fs.existsSync(file);
const id = "hausmania";

test("Hausmania full production contract", () => {
  const place = read("data/places/subkultur/oslo/places_subkultur/hausmania.json");
  assert.equal(place.id, id);
  assert.equal(place.production_status, "complete");
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal("rounds" in place, false, "legacy rounds must not survive revised production");
  assert.equal("cardImage" in place, false, "legacy cardImage must not survive revised production");
  assert.deepEqual(place.place_card_profile?.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.chronology?.length, 5);
  assert.equal(place.objects?.length, 1);
  assert.equal(place.productions?.length, 2);
  assert.equal(place.fagverk?.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk?.status, "curated");
  assert.equal(place.fagverk?.lenses?.length, 4);
  assert.ok(place.fagverk?.concepts?.includes("rett til byen"));
  assert.notEqual(place.image, place.frontImage);
  for (const file of [place.image, place.frontImage, "bilder/QuizCards/Hausmania.webp", place.objects[0].image, ...place.productions.map(item => item.image)]) assert.ok(exists(file), `missing ${file}`);

  const language = read(`data/leksikon/sprak/places/europe/norway/oslo/${id}.json`);
  assert.equal(language.entries.length, 6);
  assert.ok(language.entries.some(item => item.id === "rett_til_byen"));

  const readings = read("data/lesespor/oslo/lesespor_oslo_subkultur.json").items.filter(item => item.place_ids?.includes(id));
  assert.equal(readings.length, 4);

  const stories = read(`data/stories/stories_${id}.json`);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.ok(stories[0].episode?.action);

  const quiz = read(`data/quiz/subkultur/${id}_sets.json`);
  assert.equal(quiz.size_class, "normal_4x7");
  assert.equal(quiz.sets.length, 4);
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7]);
  const all = quiz.sets.flatMap(set => set.questions);
  assert.equal(all.length, 28);
  const lefebvre = all.find(q => q.thinker_id === "henri_lefebvre");
  assert.ok(lefebvre, "Lefebvre-bound final question missing");
  assert.equal(lefebvre.topic_hook_id, "rett_til_byen");
  assert.equal(lefebvre.work, "The Right to the City");
  assert.equal(lefebvre.theory_ref?.thinker_id, "henri_lefebvre");

  const brand = read("data/brands/brands_master.json").find(item => item.id === "podium_oslo");
  assert.ok(brand);
  assert.ok(brand.place_ids.includes(id));
  assert.ok(exists(brand.logo));

  const prod = read("data/places/production/hausmania.json");
  assert.equal(prod.status, "ready_v4_2");
  assert.equal(prod.completion?.qualityGate, "30/30");
  const audit = read("reports/place-production/hausmania-phase1-24-gate-audit-v1.json");
  assert.equal(audit.quality_score?.total, 30);
  assert.equal(audit.quality_score?.unresolved_blockers, 0);
});

test("Hausmania runtime exposes completed owned surfaces", () => {
  const runtime = read(`data/runtime/place-open/${id}.json`);
  assert.equal(runtime.place?.id, id);
  assert.ok(runtime.brands?.some(item => item.id === "podium_oslo"));
  assert.ok(runtime.language, "language surface missing");
  assert.equal(runtime.lesespor?.length, 4);
  assert.ok(runtime.stories?.some(item => item.quality_profile === "episode_v1"));
});

test("authorized green merge rule is explicit and fail-closed", () => {
  const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
  assert.match(checklist, /Det skal ikke innføres et nytt manuelt godkjenningsspørsmål mellom grønn CI og merge\./);
  assert.match(checklist, /ny materiell risiko eller omfangsendring/);
  assert.match(checklist, /Final PR-head skal være grønn før merge\./);
});
