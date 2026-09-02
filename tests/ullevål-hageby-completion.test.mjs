import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import sharp from "sharp";
import { validateRepository } from "../scripts/validate-place-description-production-v4_2.mjs";
import { applySourceLedLengthPolicy } from "../scripts/validate-place-description-production-v4_2_policy.mjs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const placeFile = "data/places/by/oslo/places/ullevål_hageby.json";
const placeId = "ullevål_hageby";

test("Ullevål Hageby keeps canonical area identity and completes standard By profile", async () => {
  const place = read(placeFile);
  assert.equal(place.id, placeId);
  assert.equal(place.category, "by");
  assert.equal(place.placeScope, "area");
  assert.equal(place.year, 1915);
  assert.equal(place.lat, 59.9435082);
  assert.equal(place.lon, 10.7337546);
  assert.equal(place.coordSourceId, "osm-node:1125978057");
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.deepEqual(place.underbadge_ids, ["byplanlegging", "bolig_og_bomiljo"]);
  assert.equal(place.fagverk.level, "full");
  assert.equal(place.fagverk.status, "curated");
  const meta = await sharp(place.frontImage).metadata();
  assert.ok(meta.height > meta.width, "frontImage must be a real portrait asset");
});

test("PlaceCard owns four real and image-backed collections without filler", () => {
  const place = read(placeFile);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.equal(place.place_card_profile.category_collection_label, "Bygninger og byrom");
  assert.deepEqual(place.related_people_ids, ["harald_hals"]);
  assert.equal(place.objects.length, 1);
  assert.equal(place.objects[0].id, "ullevål_hageby_damplassen_fontene");
  assert.equal(place.objects[0].physicalObject, true);
  assert.ok(fs.existsSync(place.objects[0].image));
  assert.equal(place.structures.length, 1);
  assert.equal(place.structures[0].id, "ullevål_hageby_damplassen_bebyggelse");
  assert.ok(fs.existsSync(place.structures[0].image));
  const brands = read("data/brands/brands_master.json");
  const brand = brands.find((item) => item.id === "ullevaal_samvirkelag");
  assert.ok(brand);
  assert.equal(brand.verification, "verified_legacy");
  assert.equal(brand.logoMeta.assetKind, "historic_wordmark_crop");
  assert.match(brand.logoMeta.disclosure, /ikke rekonstruert/i);
  assert.ok(fs.existsSync(brand.logo));
  assert.deepEqual(read("data/brands/brands_by_place.json")[placeId], [brand.id]);
  const people = read("data/people/by/oslo/people_by_oslo.json");
  const haraldHals = people.find((item) => item.id === "harald_hals");
  assert.ok(haraldHals);
  assert.equal(haraldHals.imageMeta.source, "wikimedia_commons");
  assert.ok(fs.existsSync(haraldHals.image));
});

test("modern By quiz replaces legacy ownership with 4x7 and protects opening phase", () => {
  const quiz = read("data/quiz/by/ullevål_hageby_sets.json");
  assert.equal(quiz.targetId, placeId);
  assert.equal(quiz.categoryId, "by");
  assert.equal(quiz.sets.length, 4);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.equal(questions.length, 28);
  assert.ok(questions.slice(0, 14).every((question) => !question.method_id && !question.thinker_id && !question.theory_id));
  assert.ok(questions.every((question) => question.source_origin === "external"));
  assert.ok(questions.some((question) => question.method_id === "met_feltobservasjon"));
  assert.ok(questions.some((question) => question.method_id === "met_for_etter"));
  assert.ok(questions.some((question) => question.method_id === "met_aktoranalyse"));
  assert.equal(fs.existsSync("data/quiz/by/ullevål_hageby_sets_merged.json"), false);
  const manifest = read("data/quiz/manifest.json");
  const rows = (manifest.targets || []).filter((entry) => entry.targetId === placeId);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].file, "data/quiz/by/ullevål_hageby_sets.json");
});

test("Story, chronology, language and four Lesespor are place-specific", () => {
  const stories = read("data/stories/stories_ullevål_hageby.json");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].type, "historical_event");
  assert.equal(stories[0].score.total, 16);
  assert.match(stories[0].title, /Mot solen/);
  const leksikon = read("data/leksikon/places/oslo/by/leksikon_ullevål_hageby.json");
  assert.equal(leksikon.length, 1);
  assert.equal(leksikon[0].chronology.length, 10);
  assert.deepEqual(leksikon[0].chronology.map((row) => row.year), [1909, 1913, 1915, 1917, 1918, 1922, 1925, 1927, 1981, 1998]);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/ullevål_hageby.json");
  assert.equal(language.entries.length, 6);
  assert.deepEqual(language.entries.map((entry) => entry.term), ["Ullevål Hageby", "hageby", "Mot solen", "Damplassen", "forhage", "samvirkelag"]);
  const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter((item) => (item.place_ids || []).includes(placeId));
  assert.equal(readings.length, 4);
  assert.ok(readings.every((item) => item.access === "open" && item.rights === "link_only" && item.curation_status === "approved"));
});

test("before-now and source conflicts remain explicit", () => {
  const place = read(placeFile);
  assert.equal(place.for_na.status, "produced_with_location_and_viewpoint_caveat");
  assert.ok(fs.existsSync(place.for_na.beforeImage));
  assert.ok(fs.existsSync(place.for_na.afterImage));
  assert.match(place.for_na.caveat, /ulike ståsteder/i);
  assert.match(place.popupDesc, /ulike oktoberdatoer/i);
  assert.match(place.popupDesc, /forskjellige totaler/i);
  assert.match(place.popupDesc, /ikke en påstand om identiteten til dagens beboere/i);
});

test("production packet and workcard close fail-closed at 30/30", () => {
  const place = read(placeFile);
  const packetFile = `data/places/production/${placeId}.json`;
  const packet = read(packetFile);
  const validation = applySourceLedLengthPolicy(validateRepository({ now: new Date("2026-09-02T12:00:00Z") }));
  const packetIssues = validation.issues.filter((issue) => issue.packetFile === packetFile);
  assert.deepEqual(packetIssues, []);
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.metadataSnapshot.year, 1915);
  assert.deepEqual(packet.metadataSnapshot.coordinates, { lat: 59.9435082, lon: 10.7337546 });
  assert.deepEqual(packet.collections.people, ["harald_hals"]);
  assert.deepEqual(packet.collections.objects, ["ullevål_hageby_damplassen_fontene"]);
  assert.deepEqual(packet.collections.brands, ["ullevaal_samvirkelag"]);
  assert.deepEqual(packet.collections.structures, ["ullevål_hageby_damplassen_bebyggelse"]);
  assert.equal(packet.quizReadiness.totalQuestions, 28);
  assert.equal(packet.quizReadiness.questions.length, 8);
  assert.equal(new Set(packet.quizReadiness.questions.map((row) => row.type)).size >= 4, true);
  assert.ok(packet.source_conflicts.some((row) => /oktoberdato/.test(row.claim)));
  assert.ok(packet.source_conflicts.some((row) => /totalantall/.test(row.claim)));
  const workcard = read("reports/place-production/ullevål-hageby-workcard-current.json");
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.quality_gate, "30/30");
  assert.equal(workcard.production_profile, "standard");
  assert.deepEqual(workcard.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.equal(workcard.rule_preflight.status, "PASS");
  const audit = read("reports/place-production/ullevål-hageby-phase1-24-gate-audit-v1.json");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
