import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const gate = readJson("reports/place-production/torggata-phase24-one-place-gate-audit-v1.json");
const phase21 = readJson("reports/place-production/torggata-phase21-ui-qa-audit-v1.json");
const phase22 = readJson("reports/place-production/torggata-phase22-content-qa-audit-v1.json");
const phase23 = readJson("reports/place-production/torggata-phase23-ci-gates-audit-v1.json");

test("Torggata phase 24 is a strict one-place final PR", () => {
  assert.equal(gate.status, "READY_FOR_SHA_LOCKED_FINAL_MERGE");
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
