import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const register = read("reports/place-production/det-norske-teatret/20261013/productions-c10.json");
const workcard = read("reports/place-production/det-norske-teatret-workcard-current.json");
const quizcards = read("data/quizcards/scenekunst/scenekunst_oslo_v1_batch1.json");
const quizManifest = read("data/quizcards/scenekunst/manifest.json");

test("DNT 1989 Prøvesalen belongs to the 1985 building, but image publication stays blocked", () => {
  assert.equal(register.place_id, "det_norske_teatret");
  assert.equal(register.records.length, 8);
  assert.equal(new Set(register.records.map(p => p.id)).size, 8);
  assert.deepEqual(register.count, { total: 8, house_confirmed: 8, stage_unresolved: 0, publication_ready: 0 });
  const performance = register.records.find(p => p.id === "klaar_en_to_1989");
  assert.ok(performance);
  assert.equal(performance.premiere, "1989-11-28");
  assert.equal(performance.scene, "Prøvesalen");
  assert.equal(performance.venue_status, "house_confirmed");
  assert.ok(performance.sources.some(s => s.url.includes("/nb/venue/8948/")));
  assert.ok(performance.sources.some(s => s.url.includes("/klaar-en-to-kjoooor-19891128")));
  for (const p of register.records) {
    assert.equal(p.place_id, "det_norske_teatret");
    assert.equal(p.venue_status, "house_confirmed", p.id);
    assert.ok(p.scene?.trim(), p.id);
    assert.equal(p.media?.member_image, null, p.id);
    assert.equal(p.media?.rights_status, "not_cleared", p.id);
    assert.equal(p.publication_status, "BLOCKED", p.id);
    assert.ok(p.publication_blockers.includes("production_specific_image_not_acquired"), p.id);
    assert.ok(!p.publication_blockers.includes("specific_performance_venue_unresolved"), p.id);
  }
  assert.equal(workcard.status, "in_progress");
  assert.equal(workcard.collections.productions.status, "BLOCKED");
  assert.deepEqual(workcard.placecard_collections_publishable_now, ["objects"]);
  assert.ok(workcard.checkpoints.some(c => c.id === "productions_venue_and_media_c30"));
});

test("DNT QuizCard exists as a ten-question candidate, not accepted PlaceCard completion", () => {
  assert.ok(quizManifest.collections.includes("scenekunst_oslo_v1_batch1.json"));
  const card = quizcards.cards.find(c => c.targetId === "det_norske_teatret");
  assert.ok(card);
  assert.equal(card.categoryId, "scenekunst");
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.ok(card.questions.every(q => q.sourceQuizId && q.source_urls?.length), "source linkage absent");
  assert.match(workcard.content_plan.quizcard, /KANDIDAT PRODUSERT/);
  assert.ok(workcard.checkpoints.some(c => c.id === "quiz_revision" && c.status === "QUIZCARD_CANDIDATE_REGISTERED_AUDIT_PENDING"));
  assert.equal(workcard.manual_reviews.final_ui.status, "PENDING");
});
