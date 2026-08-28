import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/gamle_radhus/gamle_radhus.json");
const production = read("data/places/production/gamle_radhus.json");
const historyProduction = read("data/places/historie-production/gamle_radhus.json");
const quiz = read("data/quiz/historie/gamle_radhus_sets.json");
const brief = read("data/quiz/production_briefs/historie/gamle_radhus.json");
const runtime = read("data/runtime/place-open/gamle_radhus.json");
const audit = read("reports/place-production/gamle-radhus-phase1-24-gate-audit-v1.json");
const story = read("data/stories/stories_gamle_radhus.json")[0];
const claims = read("data/people/claims/by/oslo/gamle_radhus/lars_backer.claims.json");

test("Gamle rådhus preserves its verified coordinate and has exactly four collections", () => {
  assert.equal(place.name, "Gamle rådhus");
  assert.equal(place.lat, 59.909847408217715);
  assert.equal(place.lon, 10.740149053425348);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "structures", "productions"]);
  assert.deepEqual(place.related_people_ids, ["lars_backer"]);
  assert.deepEqual(place.objects.map(item => item.id), ["gamle_radhus_restaurantinterior_1926"]);
  assert.deepEqual(place.structures.map(item => item.id), ["gamle_radhus_trappegavler"]);
  assert.deepEqual(place.productions.map(item => item.id), ["gamle_radhus_tatt_i_bruk_1641"]);
});

test("all collection and before-after imagery is local and source-labelled", () => {
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, place.for_na.nowImage, runtime.people.find(item => item.id === "lars_backer").image, ...place.objects.map(item => item.image), ...place.structures.map(item => item.image), ...place.productions.map(item => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.equal(place.imageMeta.license, "CC BY-SA 3.0");
  assert.match(place.objects[0].imageMeta.note, /ikke bevis for at alle synlige detaljer stammer fra 1926/);
  assert.match(place.productions[0].imageMeta.note, /ikke åpningen i 1641/);
  assert.equal(claims.completion.claims_verified, "5/5");
});

test("description and History packets pass with identity and date boundaries explicit", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/gamle_radhus.json", now: new Date("2026-08-28T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(historyProduction.status, "ready");
  assert.ok(Object.values(historyProduction.gates).every(gate => gate.status === "PASS"));
  assert.match(place.popupDesc, /opprettet i 1815, holdt til i andre etasje her fra 1821 til 1846/);
  assert.match(place.popupDesc, /rekonstruksjon, ikke urørt inventar fra 1926/);
  assert.match(historyProduction.caseRealizations[0].sourceComparison.contradictionsOrSilences, /1815–1846.*1821–1846/);
});

test("normal quiz has 4x7 progression with delayed methods and theory", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.production_context.profile, "normal_4x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 28);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(21).every(question => question.method_id));
  assert.equal(questions.filter(question => question.thinker_id).length, 1);
  assert.equal(questions[27].thinker_id, "reinhart_koselleck");
  assert.ok(questions.every(question => question.source_origin === "external"));
  assert.equal(brief.claims.length, 28);
});

test("Story and six-dimension quality gate pass without blockers", () => {
  assert.equal(story.quality_profile, "episode_v1");
  assert.deepEqual(story.related_people, []);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
