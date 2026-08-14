import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const gate = readJson("reports/place-production/torggata-phase24-one-place-gate-audit-v1.json");
const phase21 = readJson("reports/place-production/torggata-phase21-ui-qa-audit-v1.json");
const phase22 = readJson("reports/place-production/torggata-phase22-content-qa-audit-v1.json");
const phase23 = readJson("reports/place-production/torggata-phase23-ci-gates-audit-v1.json");

test("Torggata phase 24 is a strict one-place final PR", () => {
  assert.equal(gate.status, "APPROVED_MERGED_DEPLOYED");
  assert.deepEqual(gate.scope.places, ["torggata"]);
  assert.equal(gate.scope.active_phase, 24);
  assert.deepEqual(gate.scope.necessary_safeguard_changes, []);
  assert.deepEqual(gate.scope.dependent_content_changes, []);
  assert.equal(gate.scope.next_place_included, false);
  assert.deepEqual(gate.expected_changed_files, [
    ".github/workflows/data-checks.yml",
    "reports/place-production/torggata-phase24-one-place-gate-audit-v1.json",
    "reports/place-production/torggata-workcard-current.md",
    "tests/torggata-phase24-one-place-gate.test.mjs"
  ]);
});

test("all manual and repository prerequisites are approved before final merge", () => {
  assert.equal(phase21.status, "APPROVED_PRODUCTION_VERIFIED");
  assert.equal(phase21.production_followup.browser_result_pending, false);
  assert.equal(phase22.status, "APPROVED");
  assert.equal(phase23.status, "APPROVED");
  assert.equal(gate.prerequisites.manual_same_content_ui_qa, true);
  assert.equal(gate.prerequisites.production_place_id, "torggata");
  assert.equal(gate.prerequisites.production_no_webgl_route, true);
  assert.match(gate.prerequisites.production_round_contract, /people · objects · brands · structures/);
  assert.equal(gate.merge_requirements.length, 8);
});

test("final merge, deployment and 4+1 production evidence are locked", () => {
  assert.equal(gate.completion_evidence.pr, 4962);
  assert.equal(gate.completion_evidence.final_head_sha, "ce1f60231db52e2472fe334cded8eda140ae429a");
  assert.equal(gate.completion_evidence.merge_commit, "44a9ecf6f11a797194c34573180278bc52e4770d");
  assert.equal(gate.completion_evidence.main_verified, true);
  assert.equal(gate.completion_evidence.pages_run_id, 31794520090);
  assert.equal(gate.completion_evidence.pages_status, "SUCCESS");
  assert.equal(gate.completion_evidence.production_round_count, 4);
  assert.deepEqual(gate.completion_evidence.production_rounds, ["people", "objects", "brands", "structures"]);
  assert.equal(gate.completion_evidence.badge_separate, true);
});

test("the mandatory six-part quality assessment passes the completion threshold", () => {
  const assessment = gate.quality_assessment;
  assert.equal(assessment.dimensions.length, 6);
  assert.equal(assessment.total, 29);
  assert.equal(assessment.required_total, 27);
  assert.ok(assessment.dimensions.every((dimension) => dimension.score >= 4));
  assert.deepEqual(assessment.critical_findings, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
  assert.equal(assessment.gate, "PASSED_HIGH_QUALITY");
  assert.match(assessment.automatic_checks_limit, /does not by itself prove editorial or visual quality/);
});

test("global checklist mirrors the canonical four-plus-separate-Badge contract", () => {
  const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
  const contract = fs.readFileSync("data/places/README_place_rounds.md", "utf8");

  assert.match(contract, /nøyaktig fire innholdsrundinger i et 2 × 2-felt/);
  assert.match(contract, /Badges teller ikke som en av de fire rundingene/);
  assert.match(checklist, /MÅL FOR INNHOLDSRUNDINGER: 4 \+ separat fast Badge/);
  assert.match(checklist, /nøyaktig fire innholdsrundinger vises i et 2 × 2-felt/);
  assert.doesNotMatch(checklist, /tre innholdsrundinger|3 innholdsrundinger|tre-rundersrad|legacy 4-\/6-/i);
});
