import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/sofienbergparken.json");
const production = read("data/places/production/sofienbergparken.json");
const runtime = read("data/runtime/place-open/sofienbergparken.json");
const quiz = read("data/quiz/by/sofienbergparken_sets.json");
const brief = read("data/quiz/production_briefs/by/sofienbergparken.json");
const context = read("data/quiz/production_context/by/sofienbergparken.json");
const brands = read("data/brands/brands_by_place.json");
const brandMaster = read("data/brands/brands_master.json");
const people = read("data/people/by/oslo/people_by_oslo.json");
const legacyPeople = read("data/people/litteratur/oslo/people_litteratur_oslo.json");
const placeIndex = read("data/places/places_index.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/sofienbergparken.json");
const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter(item => item.place_ids?.includes("sofienbergparken"));
const stories = read("data/stories/stories_sofienbergparken_subkultur.json");
const audit = read("reports/place-production/sofienbergparken-phase8-24-gate-audit-v1.json");

test("Sofienbergparken keeps verified geometry and exact own-place scope", () => {
  assert.deepEqual([place.lat, place.lon, place.r], [59.9232203, 10.7637958, 220]);
  assert.equal(place.coordSourceId, "osm-way:3235895");
  assert.equal(place.year, 1920);
  assert.match(place.popupDesc, /Sofienberg kirke.*egne objekter eller nabosteder/s);
  assert.match(place.popupDesc, /Pride Park.*26.–29\. juni 2024/s);
  assert.doesNotMatch(place.popupDesc, /Sofienbergprosjektet|poesipark/i);
});

test("the four 2x2 collections are exact, image-ready and separate from Badge and Quiz", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.deepEqual(place.related_people_ids, ["marius_rohne"]);
  assert.deepEqual(place.objects.map(item => item.id), ["sofienbergparken_jodisk_gravlund"]);
  assert.deepEqual(brands.sofienbergparken, ["piknik_i_parken"]);
  assert.deepEqual(place.related_place_ids, ["sofienberg_kirke", "olaf_ryes_plass", "birkelunden", "markveien", "daelenenga_idrettspark"]);
  assert.deepEqual(place.secondaryBadgeIds, ["subkultur"]);
  assert.ok(!place.place_card_profile.collection_ids.includes("badges"));
  assert.ok(!place.place_card_profile.collection_ids.includes("quiz"));

  const person = people.find(row => row.id === "marius_rohne");
  const brand = brandMaster.find(row => row.id === "piknik_i_parken");
  const relatedPreview = placeIndex.find(row => row.id === place.related_place_ids[0]);
  assert.ok(relatedPreview?.cardImage || relatedPreview?.image || relatedPreview?.frontImage);
  for (const asset of [place.frontImage, person.image, place.objects[0].image, brand.logo, relatedPreview.cardImage || relatedPreview.image || relatedPreview.frontImage]) {
    assert.equal(fs.existsSync(path.join(root, asset)), true, asset);
  }
  assert.equal(place.frontImageMeta.orientation, "portrait");
  const [width, height] = place.frontImageMeta.outputDimensions.split("x").map(Number);
  assert.ok(height > width);
  assert.ok(person.imageMeta.sourcePage && place.objects[0].imageMeta.sourcePage && brand.imageMeta.sourcePage);
});

test("unsupported poetry seeds are held back from the hydrated People surface", () => {
  for (const id of ["gro_dahle", "jan_erik_vold", "cecilie_loveid"]) {
    const person = legacyPeople.find(row => row.id === id);
    assert.ok(person.roundHoldbacks.includes("sofienbergparken"), id);
  }
  assert.deepEqual(runtime.people.filter(person => !person.roundHoldbacks?.includes("sofienbergparken")).map(person => person.id), ["marius_rohne"]);
});

test("description, language, readings, Story and Subculture report are production-ready", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/sofienbergparken.json", now: new Date("2026-08-26T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.deepEqual(language.entries.map(entry => entry.term), ["Sofienbergparken", "gravlund", "friområde"]);
  assert.equal(readings.length, 3);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].score.total, 19);
  const subculture = read("data/places/subkultur-production/sofienbergparken.json");
  assert.equal(subculture.presentFunction.status, "historical");
  assert.ok(Object.values(subculture.gates).every(gate => gate.status === "PASS"));
  assert.doesNotMatch(JSON.stringify(subculture), /byantropologene|Sofienbergprosjektet/i);
});

test("rich quiz has 5x7 progression, balanced families and claim parity", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type) && !question.method_id && !question.thinker_id));
  const counts = questions.reduce((out, question) => ({ ...out, [question.question_type]: (out[question.question_type] || 0) + 1 }), {});
  assert.deepEqual(counts, { fact: 21, context: 7, concept: 7 });
  assert.ok(questions.slice(28).every(question => question.method_id && question.topic_hook_id && question.thinker_id));
  const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, question.id);
    assert.equal(question.claim_basis, claim.statement, question.id);
    assert.deepEqual(question.source, claim.source_ids, question.id);
    assert.ok(question.source.every(sourceId => /^https:\/\//.test(quiz.sources[sourceId])), question.id);
  }
});

test("place-open exposes every materialized phase surface", () => {
  assert.deepEqual(runtime.people.filter(person => !person.roundHoldbacks?.includes("sofienbergparken")).map(person => person.id), ["marius_rohne"]);
  assert.deepEqual(runtime.place.objects.map(item => item.id), ["sofienbergparken_jodisk_gravlund"]);
  assert.deepEqual(runtime.brands.map(brand => brand.id), ["piknik_i_parken"]);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.lesespor.length, 3);
});

test("EN, ES and PT carry translated text and the canonical source hash", () => {
  const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
  const hash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
  for (const code of ["en", "es", "pt"]) {
    const translation = read(`data/i18n/content/places/${code}.json`).sofienbergparken;
    assert.equal(translation._sourceHash, hash, code);
    assert.ok(translation.desc.length >= 250 && translation.popupDesc.length >= 1200, code);
    assert.notEqual(translation.popupDesc, place.popupDesc, code);
  }
});

test("the six-part quality gate is explicit and high quality", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
