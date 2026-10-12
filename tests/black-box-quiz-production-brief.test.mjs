import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

test("Black Box source brief has bounded historical sources, canonical claims and no fake published quiz", () => {
  const brief = json("data/quiz/production_briefs/scenekunst/black_box_teater.json");
  const production = json("data/places/production/black_box_teater.json");
  assert.equal(brief.categoryId, "scenekunst");
  assert.equal(brief.targetId, "black_box_teater");
  assert.equal(brief.status, "reviewed_claim_bank_questions_pending");
  assert.equal(brief.profile_decision.set_count, 4);
  assert.equal(brief.profile_decision.questions_per_set, 7);
  assert.equal(brief.claims.length, 28);
  assert.ok(/Aker Brygge/.test(brief.scope.site_boundary));
  assert.ok(/2004/.test(brief.scope.site_boundary));
  assert.equal(new Set(brief.claims.map(c => c.claim_id)).size, 28);
  assert.equal(new Set(brief.claims.map(c => c.order)).size, 28);
  const canonical = new Map(production.claims.map(c => [c.id, c]));
  for (const c of brief.claims) {
    assert.ok(c.statement.trim().length > 20, c.claim_id);
    assert.ok(c.source_ids.length > 0, c.claim_id);
    for (const id of c.source_ids) assert.match(brief.sources[id]?.url || "", /^https:\/\//, `${c.claim_id} source ${id}`);
    if (c.origin_place_claim_id) {
      const original = canonical.get(c.origin_place_claim_id);
      assert.ok(original, c.origin_place_claim_id);
      assert.equal(c.statement, original.claim, c.claim_id);
      assert.ok(c.source_ids.some(id => brief.sources[id]?.url === original.sourceUrl), c.claim_id);
    }
  }
  assert.equal(brief.claims.filter(c => c.origin_place_claim_id).length, 25);
  assert.ok(brief.claims.some(c => /Hjelp vi får gjester/.test(c.statement) && c.source_ids.includes("teater_manu")));
  assert.ok(brief.claims.find(c => c.origin_place_claim_id === "claim_blackbox_network_1991").review_caution);
  const manifest = json("data/quiz/manifest.json");
  assert.ok(!manifest.sets.some(s => s.targetId === "black_box_teater"));
  const cards = json("data/quizcards/scenekunst/manifest.json");
  assert.ok(!cards.collections.some(f => f.includes("black_box")));
});
