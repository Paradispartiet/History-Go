import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const id = "peststotten_krist_kirkegard";
const placeFile = "data/places/historie/oslo/places_historie_added_batch_01/peststotten_krist_kirkegard.json";
const place = read(placeFile);
const packet = read(`data/places/production/${id}.json`);
const history = read(`data/places/historie-production/${id}.json`);
const quiz = read(`data/quiz/historie/${id}_sets.json`);
const stories = read(`data/stories/stories_${id}.json`);
const language = read(`data/leksikon/sprak/places/europe/norway/oslo/${id}.json`);
const leksikon = read(`data/leksikon/places/oslo/historie/leksikon_${id}.json`);
const people = read("data/people/historie/oslo/people_historie_oslo.json");
const workcard = read("reports/place-production/peststotten-krist-kirkegard-workcard-current.json");
const audit = read("reports/place-production/peststotten-krist-kirkegard-phase1-24-gate-audit-v1.json");

test("Peststøtten beholder verifisert monumentpunkt og kildeavgrenset identitet", () => {
  assert.equal(place.id, id);
  assert.equal(place.category, "historie");
  assert.equal(place.year, 1654);
  assert.equal(place.lat, 59.917469);
  assert.equal(place.lon, 10.746586);
  assert.equal(place.r, 70);
  assert.equal(place.coordStatus, "verified");
  assert.equal(place.coordType, "monument_point");
  assert.match(place.popupDesc, /uten at Munch selv er gravlagt på Krist kirkegård/i);
  assert.ok(packet.identity.excludes.some(value => /eksakt samlet dødstall/i.test(value)));
  const result = validatePacket({ packet, place, packetFile: `data/places/production/${id}.json`, now: new Date("2026-09-10T12:00:00Z") });
  assert.deepEqual(result.issues, []);
});

test("standardprofilen har nøyaktig People, Objects, Structures og Historiske hendelser", () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "structures", "historical_events"]);
  assert.equal(place.place_card_profile.category_collection_label, "Historiske hendelser");
  assert.equal(place.place_card_profile.collection_ids.includes("productions"), false);
  assert.equal(place.place_card_profile.collection_ids.includes("related"), false);
  assert.deepEqual(place.related_people_ids, ["edvard_munch"]);
  assert.equal(place.objects.length, 1);
  assert.ok(place.objects.every(item => item.physicalObject && item.placeSpecific && item.collectable));
  assert.equal(place.structures.length, 1);
  assert.equal(place.historical_events.length, 3);
  assert.equal(Object.hasOwn(place, "productions"), false);
  const munch = people.find(person => person.id === "edvard_munch");
  assert.ok(munch);
  assert.ok(munch.place_ids.includes(id));
});

test("alle samlingspreviews finnes lokalt og frontbildet er fysisk stående", async () => {
  const files = [
    place.image, place.cardImage, place.frontImage,
    ...place.objects.map(item => item.image),
    ...place.structures.map(item => item.image),
    ...place.historical_events.map(item => item.image),
    "bilder/kort/people/edvard_munch.jpg"
  ];
  for (const file of files) assert.equal(exists(file), true, file);
  const { default: sharp } = await import("sharp");
  const meta = await sharp(path.join(root, place.frontImage)).metadata();
  assert.ok(meta.height > meta.width, "frontImage must be physically portrait");
  assert.ok(place.historical_events.every(item => /Fotoet/i.test(item.imageMeta.note)), "later documentary event images must be explicit");
});

test("Fagverk v2, kronologi, Story, språk og Lesespor er stedseide og kildebårne", () => {
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level, "standard");
  assert.equal(place.fagverk.status, "curated");
  assert.equal(place.fagverk.lenses.length, 4);
  assert.equal(place.fagverk.guiding_questions.length, 4);
  assert.ok(place.fagverk.article.length >= 5);
  assert.ok(place.fagverk.source_urls.length >= 4);
  assert.ok(place.fagverk.chapter_ids.length >= 1);
  assert.equal(leksikon.entry.chronology.length, 9);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].place_id, id);
  assert.equal(language.entries.length, 6);
  const reading = read("data/lesespor/oslo/lesespor_oslo_historie.json");
  assert.equal(reading.items.filter(item => item.place_ids?.includes(id)).length, 4);
  assert.equal(place.module_audit.for_na.status, "source_bounded_holdback");
});

test("Historie-quizen er normal 4x7 med ren åpning og sen metode og teori", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.categoryId, "historie");
  assert.equal(quiz.size_class, "normal_4x7");
  assert.equal(quiz.sets.length, 4);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map(question => question.id)).size, 28);
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type) && !question.method_id && !question.topic_hook_id));
  assert.ok(questions.slice(21).some(question => question.method_id === "met_sporlesning"));
  assert.ok(questions.slice(21).some(question => question.method_id === "met_kildekritikk"));
  const theory = questions.find(question => question.topic_hook_id === "his_tidslag_samtidighet");
  assert.ok(theory);
  assert.equal(theory.thinker_id, "fernand_braudel");
  assert.equal(quiz.production_context.theory_start_phase, "final");
  assert.equal(quiz.production_context.method_start_phase, "final");
});

test("v4.2-pakken holder dødstall usikkert og Historie A-H er lukket", () => {
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.roundsReadiness.exactCollectionCount, 4);
  assert.equal(packet.quizReadiness.totalQuestions, 28);
  assert.ok(packet.source_conflicts.some(item => item.status === "qualified" && /dødstall/i.test(item.claim)));
  assert.equal(history.status, "ready");
  assert.ok(Object.values(history.gates).every(gate => gate.status === "PASS"));
  assert.equal(history.chronologyStories.status, "PASS");
  assert.match(history.caseRealizations[0].sourceComparison.contradictionsOrSilences, /ikke ett sikkert samlet dødstall/i);
});

test("30/30-gaten, workcard og permanent regresjonsregister er lukket", () => {
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.history_gates, "A-H PASS");
  assert.equal(workcard.quality_gate, "30/30");
  assert.equal(workcard.rule_preflight.status, "PASS");
  assert.deepEqual(workcard.rule_preflight.contract_snapshot.candidate_collections, ["people", "objects", "structures", "historical_events"]);
  assert.equal(workcard.rule_preflight.contract_snapshot.category_expression, "historical_events");
  const registry = read(".github/ci/place-regression-registry-v1.json");
  const entry = registry.places.find(item => item.id === id);
  assert.ok(entry);
  assert.deepEqual(entry.tests, ["tests/peststotten-krist-kirkegard-completion.test.mjs"]);
});

test("place-open runtime bærer ferdig Peststøtten uten falsk Munch-gravlegging", () => {
  const runtime = read(`data/runtime/place-open/${id}.json`);
  assert.equal(runtime.place.id, id);
  assert.ok(runtime.people.some(person => person.id === "edvard_munch"));
  assert.ok(runtime.leksikon.length >= 1);
  assert.ok(runtime.stories.length >= 1);
  assert.doesNotMatch(JSON.stringify(runtime.stories), /Edvard Munch.*gravlagt.*Krist kirkegård/i);
});
