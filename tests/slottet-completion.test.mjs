import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";
import { validatePolitikkPlaceReport } from "../scripts/audit-politikk-place-production.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/politikk/oslo/slottet/slottet.json");
const production = read("data/places/production/slottet.json");
const politics = read("data/places/politikk-production/slottet.json");
const quiz = read("data/quiz/politikk/slottet_sets.json");
const brief = read("data/quiz/production_briefs/politikk/slottet.json");
const runtime = read("data/runtime/place-open/slottet.json");
const audit = read("reports/place-production/slottet-phase1-24-gate-audit-v1.json");
const actors = read("data/brands/actors_by_place.json").slottet;

test("Slottet preserves its verified coordinate and has four canonical collections", () => {
  assert.equal(place.lat, 59.917063045432855);
  assert.equal(place.lon, 10.727724636631736);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.place_card_profile.category_collection_label, "Seremonier og statsakter");
  assert.deepEqual(place.objects.map(item => item.id), ["slottet_karl_johan_statuen"]);
  assert.deepEqual(place.productions.map(item => item.id), ["slottet_innvielsen_1849"]);
  assert.equal(runtime.people.some(item => item.id === "hans_ditlev_franciscus_linstow"), true);
  assert.equal(runtime.brands.some(item => item.id === "det_norske_kongehus"), true);
});

test("collection imagery is local, source-labelled and visually reviewed", () => {
  const brand = actors.find(item => item.id === "det_norske_kongehus");
  const person = runtime.people.find(item => item.id === "hans_ditlev_franciscus_linstow");
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.before_image, place.for_na.now_image, person.image, brand.image, ...place.objects.map(item => item.image), ...place.productions.map(item => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(person.imageMeta.license, "CC0 1.0");
  assert.match(place.objects[0].imageMeta.note, /faktiske rytterstatuen/);
  assert.match(brand.imageMeta.note, /ingen godkjenning/);
  assert.match(place.productions[0].imageMeta.note, /ikke et bilde av seremonien/);
  assert.match(place.for_na.image_pair_review, /^PASS/);
  assert.equal(place.images.find(item => item.src === place.for_na.before_image).imageMeta.license, "Public domain");
  assert.equal(place.images.find(item => item.src === place.for_na.now_image).imageMeta.license, "CC BY 2.0");
});

test("description and Politics packets pass with constitutional boundaries explicit", () => {
  const packetResult = validatePacket({ packet: production, place, packetFile: "data/places/production/slottet.json", now: new Date("2026-08-29T18:00:00Z") });
  assert.deepEqual(packetResult.issues, []);
  const canonicalEmneIds = new Set(Object.keys(read("data/fag/politikk/politikk_runtime_manifest.json").chapterByEmne || {}));
  const politicsIssues = validatePolitikkPlaceReport({ report: politics, place, canonicalEmneIds, root, now: new Date("2026-08-29T18:00:00Z") });
  assert.deepEqual(politicsIssues, []);
  assert.ok(Object.values(politics.gates).every(gate => gate.status === "PASS"));
  assert.match(place.popupDesc, /Kongen i statsråd/);
  assert.match(place.popupDesc, /kan ikke alene bevise politisk legitimitet/);
  assert.match(place.popupDesc, /28\. august 2026/);
  assert.match(place.popupDesc, /Haakon VIII/);
  assert.ok(politics.currentVerification.sourceIds.includes("source_royal_succession"));
  assert.ok(politics.currentVerification.sourceIds.includes("source_government_succession"));
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
  assert.equal(questions[55].thinker_id, "max_weber");
  assert.ok(questions.every(question => question.source_origin === "external"));
});

test("runtime modules, dated news and six-dimension quality gate are complete", () => {
  assert.equal(runtime.language.entries.length, 6);
  assert.equal(runtime.leksikon.length, 5);
  assert.equal(runtime.leksikon.filter(item => item.type === "news_note").length, 1);
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(runtime.stories.length, 4);
  assert.equal(place.module_audit.for_na.status, "produced");
  assert.equal(place.module_audit.news.status, "produced");
  const news = read("data/leksikon/places/oslo/politikk/leksikon_slottet_news.json");
  assert.equal(news[0].date, "2026-08-28");
  assert.equal(news[0].sources.length, 2);
  const chronology = read("data/leksikon/places/oslo/politikk/leksikon_slottet.json")[0].chronology;
  assert.equal(chronology.length, 11);
  assert.deepEqual(chronology.at(-1).sources, [
    "https://www.kongehuset.no/nyheter/meddelelse-i-ekstraordinaert-statsrad",
    "https://www.regjeringen.no/no/aktuelt/offisielt-fra-statsrad-28.-august-2026/id3171470/"
  ]);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score >= 4));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
