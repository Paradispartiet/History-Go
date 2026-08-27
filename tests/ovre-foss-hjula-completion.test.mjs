import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { evaluateOvreFossArtifacts, loadOvreFossArtifacts } from "../scripts/audit-ovre-foss-hjula-completion.mjs";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const place = read("data/places/naeringsliv/oslo/places_naeringsliv/ovre_foss.json");
const production = read("data/places/production/ovre_foss.json");
const business = read("data/places/naeringsliv-production/ovre_foss.json");
const runtime = read("data/runtime/place-open/ovre_foss.json");
const quiz = read("data/quiz/naeringsliv/ovre_foss_sets.json");
const brief = read("data/quiz/production_briefs/naeringsliv/ovre_foss.json");
const context = read("data/quiz/production_context/naeringsliv/ovre_foss.json");
const stories = read("data/stories/stories_ovre_foss.json");
const peopleClaims = read("data/people/claims/naeringsliv/oslo/ovre_foss/halvor_schou.claims.json");
const leksikon = read("data/leksikon/places/oslo/naeringsliv/leksikon_ovre_foss.json");
const audit = read("reports/place-production/ovre-foss-hjula-phase1-24-gate-audit-v1.json");

const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  throw new Error(`Unsupported WebP chunk ${chunk} in ${file}`);
};

test("canonical identity and historical coordinate anchor are preserved", () => {
  assert.equal(place.id, "ovre_foss");
  assert.equal(place.lat, 59.931317);
  assert.equal(place.lon, 10.756994);
  assert.equal(place.sourceObjectId, "kulturminnesok:164747");
  assert.equal(place.coordStatus, "verified_historical_source");
  assert.equal(audit.null_measurement.coordinate_changed, false);
  assert.match(place.popupDesc, /Hjulafossen/);
  assert.match(place.popupDesc, /ikke.*eksakt punkt/);
});

test("three selected collections have real image-ready members and brands are N/A", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "structures"]);
  assert.match(place.place_card_profile.excluded_collections.brands, /ikke/);
  assert.ok(runtime.people.some(person => person.id === "halvor_schou"));
  assert.deepEqual(place.objects.map(item => item.id), ["fra_hjula_veveri_maleri"]);
  assert.deepEqual(place.structures.map(item => item.id), ["hjula_veveribygning"]);
  for (const file of [runtime.people.find(person => person.id === "halvor_schou").image, place.objects[0].image, place.structures[0].image]) assert.equal(exists(file), true, file);
});

test("front, place, historical, object, structure and person assets are local and documented", () => {
  for (const file of [place.frontImage, place.image, place.cardImage, place.for_na.beforeImage, place.objects[0].image, place.structures[0].image, "bilder/kort/people/halvor_schou.webp"]) assert.equal(exists(file), true, file);
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
  assert.deepEqual(webpDimensions(place.image), { width: 1200, height: 675 });
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.imageMeta.license, "CC BY-SA 4.0");
  assert.equal(place.objects[0].imageMeta.license, "Public domain");
  assert.equal(place.structures[0].imageMeta.license, "CC BY-SA 4.0");
});

test("People v1 reuses Halvor Schou without moving the primary anchor", () => {
  const person = runtime.people.find(item => item.id === "halvor_schou");
  assert.equal(person.placeId, "glads_molle");
  assert.deepEqual(person.places, ["glads_molle", "voienfossen", "ovre_foss"]);
  assert.equal(person.profileStatus, "ready_people_v1");
  assert.equal(peopleClaims.completion.claims_verified, "10/10");
  assert.equal(peopleClaims.completion.current_status, "ready_people_v1");
});

test("description and Næringsliv packets satisfy their contracts", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/ovre_foss.json", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(business.status, "ready");
  assert.equal(business.economicIdentity.anchorType, "factory");
  assert.equal(business.quizOpening.firstTwoSetsQuestionCount, 14);
  assert.ok(Object.values(business.gates).every(gate => gate.status === "PASS"));
});

test("normal quiz has 4x7 progression and fourteen-question opening", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "normal_4x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 28);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(21).every(question => question.question_type === "analysis" && question.method_id));
  assert.equal(brief.claims.length, 28);
  assert.match(brief.existing_quiz_audit.active_before.finding, /Fem eldre sett/);
});

test("place-open includes chronology, language, story and readings", () => {
  assert.equal(runtime.leksikon.length, 1);
  assert.equal(runtime.leksikon[0].chronology.length, 14);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.language.dialect_status, "not_applicable_place_level");
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.deepEqual(stories[0].related_people, ["halvor_schou"]);
});

test("knowledge article contains complete scholarly contract with resolved bindings", () => {
  const article = leksikon.scholarly_article;
  assert.ok(article.definition.length >= 100);
  assert.ok(article.historical_or_systemic_background.length >= 2);
  assert.deepEqual(article.theories_researchers_and_findings.map(item => item.researcher), ["Adam Smith", "Alfred Marshall"]);
  assert.ok(article.methods_and_limitations.length >= 3);
  assert.ok(article.methods_and_limitations.every(item => item.application.length >= 80 && item.limitations.length >= 80));
  assert.ok(article.boundaries_and_disagreements.length >= 2);
  assert.ok(article.documented_cases_or_teaching_scenarios.length >= 2);
  assert.ok(article.documented_cases_or_teaching_scenarios.every(item => item.kind === "documented_case"));
  assert.ok(article.key_questions.length >= 4);
  assert.ok(leksikon.wikiText.length >= 9);
});

test("completion status fails closed when article coverage regresses", () => {
  const artifacts = loadOvreFossArtifacts(root);
  const current = evaluateOvreFossArtifacts(artifacts, { root });
  assert.equal(current.status, "high_quality");
  assert.deepEqual(current.failed_checks, []);
  assert.equal(current.quality_score.editorial_quality.score, 4);
  assert.equal(current.quality_score.total, 29);
  const regressed = structuredClone(artifacts);
  regressed.leksikon.scholarly_article.documented_cases_or_teaching_scenarios = [];
  const failed = evaluateOvreFossArtifacts(regressed, { root });
  assert.equal(failed.status, "blocked");
  assert.ok(failed.failed_checks.includes("editorial_quality.two_documented_cases_are_declared"));
});

test("source conflicts and final quality gate are explicit and blocker-free", () => {
  assert.deepEqual(audit.source_conflicts.map(item => item.status), ["rejected", "rejected", "resolved"]);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
  assert.equal(audit.validation.status, "high_quality");
  assert.deepEqual(audit.validation.failed_checks, []);
});
