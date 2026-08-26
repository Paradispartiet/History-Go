import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const audit = readJson("reports/place-production/torggata-phase22-content-qa-audit-v1.json");
const phase21 = readJson("reports/place-production/torggata-phase21-ui-qa-audit-v1.json");
const production = readJson("data/places/production/torggata.json");
const place = readJson("data/places/by/oslo/places/torggata.json");
const stories = readJson("data/stories/stories_torggata.json");
const quiz = readJson("reports/place-production/torggata-phase10-quiz-audit-v1.json");
const people = readJson("reports/place-production/torggata-phase12-people-links-audit-v1.json");
const brands = readJson("reports/place-production/torggata-phase13-brands-audit-v1.json");
const images = readJson("reports/place-production/torggata-phase19-images-audit-v1.json");

test("Torggata phase 22 covers every content-QA checklist item", () => {
  assert.equal(audit.status, "APPROVED_REQA");
  assert.equal(audit.checklist.length, 11);
  assert.ok(audit.checklist.every((item) => ["PASS", "N_A"].includes(item.status)));
  assert.equal(audit.checklist.find((item) => item.id === "nature_ownership")?.status, "N_A");
});

test("description claims, chronology and story remain inspectably supported", () => {
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.claims.length, 18);
  assert.ok(production.claims.every((claim) => claim.status === "verified" && /^https:\/\//.test(claim.sourceUrl)));
  assert.equal(production.sentenceCoverage.desc.length, 3);
  assert.equal(production.sentenceCoverage.popupDesc.length, 31);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, "episode_v1");
  assert.equal(stories[0].type, "conflict");
  assert.equal(stories[0].sources.length, 3);
  assert.ok(stories[0].sources.every((source) => /^https:\/\//.test(source.url)));
  assert.equal(stories[0].score.total, 20);
  assert.deepEqual(stories[0].related_places, []);
  assert.deepEqual(stories[0].next_scenes, []);
});

test("quiz, people, brands and images retain reviewed populations and holdbacks", () => {
  assert.equal(quiz.result, "PASS");
  assert.equal(quiz.profile.total_questions, 35);
  assert.equal(quiz.source_basis.source_count, 12);
  assert.equal(quiz.source_basis.all_reviewed, true);
  assert.equal(people.canonical_people.expected, 21);
  assert.equal(people.canonical_people.inspectable_sources, 21);
  assert.equal(people.image_review.visible_image_ready, 7);
  assert.equal(people.image_review.held_back_pending_image, 14);
  assert.equal(brands.counts.total, 13);
  assert.equal(brands.counts.logoOrWordmarkAssets, 13);
  assert.equal(brands.checks.noGeneratedOrReconstructedLogos, true);
  assert.deepEqual(Object.keys(images.rounds), ["people", "objects", "brands", "structures"]);
  assert.equal(images.rounds.structures.visible, 2);
  assert.equal(images.rounds.structures.preview_mode, "canonical_icon_and_count");
  assert.deepEqual(place.round_profile.content_round_ids, ["people", "images", "brands", "related"]);
  assert.equal(images.generated_or_reconstructed_assets, 0);
});

test("historical production evidence is retained and final re-QA is approved", () => {
  assert.equal(place.category, "by");
  assert.equal(phase21.status, "APPROVED_PRODUCTION_REQA");
  assert.equal(phase21.production_followup.observed_round_count, 4);
  assert.deepEqual(phase21.production_followup.observed_visible_rounds, ["people", "objects", "brands", "structures"]);
  assert.equal(phase21.production_followup.observed_badge_separate, true);
  assert.equal(audit.production_ui_evidence.round_count, 4);
  assert.equal(audit.production_ui_evidence.badge_separate, true);
  assert.deepEqual(place.round_profile.content_round_ids, ["people", "images", "brands", "related"]);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "objects"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "structures"), false);
  assert.equal(phase21.final_reqa_2026_08_25.status, "PASS");
  assert.equal(audit.final_reqa_2026_08_25.status, "PASS");
});
