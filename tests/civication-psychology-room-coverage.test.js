// Psykoteori: canonical, read-only coverage integrity test.
// Source/editorial verification is a separate evidence-backed human review gate.
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const repo = path.resolve(__dirname, "..");
const result = execFileSync(process.execPath, [
  path.join(repo, "scripts", "audit-psychology-theory-coverage.mjs"), "--check"
], { cwd: repo, encoding: "utf8", timeout: 30000 });

assert.match(result, /Psykoteori structural audit PASS: 58\/58 canonical emner/);
assert.match(result, /source-verified/);
assert.match(result, /NOT scholarly quality/);

const fs = require("node:fs");
const load = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), "utf8"));
const catalog = load("data/psychology/psychology_theories.json");
const coverage = load("data/psychology/psychology_theory_coverage_v1.json");
const byEmne = new Map(coverage.coverage_entries.map((entry) => [entry.emne_id, entry]));
const partiallyReviewed = catalog.theories.filter((theory) => theory.source_review_state === "partial_historical_method_review");
const expectedPartials = [
  "psykoanalyse", "behaviorisme", "kognitiv_psykologi",
  "humanistisk_psykologi", "femfaktormodellen", "heuristikker",
  "stressvurdering", "tilknytning", "sosial_laring",
  "sosial_identitet", "konformitet", "resiliens",
  "kognitiv_terapi", "biopsykososial_modell"
];
assert.deepEqual(partiallyReviewed.map((theory) => theory.id), expectedPartials,
  "batches 01–04 must be accounted for as PARTIAL reviews, not scholarly approval");
for (const theory of partiallyReviewed) {
  assert.ok(expectedPartials.includes(theory.id));
  const entry = byEmne.get(theory.emne_id);
  assert.ok(entry?.theory_ids.includes(theory.id), "source review must bind canonical emne");
  assert.equal(entry.source_review_status, "not_reviewed", "partial review must not mark full theory verified");
  assert.equal(entry.editorial_review_status, "not_reviewed");
  assert.ok(theory.reference_links.length >= 2);
  const register = load("data/fagverk/psykologi/" + theory.chapter_id + "/claims.json");
  const claims = new Map(register.claims.map((claim) => [claim.id, claim]));
  const sourceIds = new Set(register.sources.map((source) => source.id));
  for (const reference of theory.reference_links) {
    assert.match(reference.url, /^https:\/\/[^\s"'<>]+$/, "reference must have a safe inspectable URL");
    assert.ok(reference.title && reference.supports.length > 30, "reference needs an explanatory scope");
    for (const claimId of reference.canonical_claim_ids) {
      assert.ok(claims.has(claimId), "unknown canonical claim " + claimId);
    }
    for (const sourceId of reference.canonical_source_ids) {
      assert.ok(sourceIds.has(sourceId), "unknown canonical source " + sourceId);
      assert.ok(reference.canonical_claim_ids.some((id) => claims.get(id)?.source_ids.includes(sourceId)),
        "canonical source must actually support one referenced claim: " + sourceId);
    }
  }
}
assert.equal(catalog.theories.filter((theory) => !theory.reference_links).length, 0);
assert.equal(coverage.coverage_entries.filter((entry) => entry.partial_reference_review).length, 14);
assert.equal(coverage.coverage_entries.filter((entry) => entry.source_review_status === "verified").length, 0,
  "partial evidence must not be silently promoted to full verification");

console.log("civication-psychology-room-coverage.test.js passed");
