import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const audit = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase23-ci-gates-audit-v1.json", "utf8"));
const phase21 = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase21-ui-qa-audit-v1.json", "utf8"));
const phase22 = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase22-content-qa-audit-v1.json", "utf8"));

test("Torggata phase 23 records every relevant repository gate", () => {
  assert.equal(audit.status, "APPROVED");
  assert.equal(audit.validated_content_head, "91fae7e22f944fb80388cd4eb3613e5e7dbcdd70");
  assert.equal(audit.gates.length, 10);
  assert.ok(audit.gates.every((gate) => ["SUCCESS", "CARRIED_FORWARD", "NOT_APPLICABLE"].includes(gate.status)));
});

test("all gates that own the final content/runtime state are exact green runs", () => {
  const required = ["data_checks_places", "fagverk_place_learning", "typescript_guard", "place_rounds_governance", "pages_deployment_no_map_routing"];
  for (const id of required) {
    const gate = audit.gates.find((entry) => entry.id === id);
    assert.equal(gate?.status, "SUCCESS", id);
    assert.ok(Number.isInteger(gate?.run_id) && gate.run_id > 0, id);
    assert.match(gate?.head_sha || "", /^[0-9a-f]{40}$/, id);
  }
  assert.equal(audit.gates.find((entry) => entry.id === "data_checks_places")?.run_id, 31793951339);
  assert.equal(audit.gates.find((entry) => entry.id === "place_rounds_governance")?.run_id, 31792843884);
  assert.equal(audit.gates.find((entry) => entry.id === "pages_deployment_no_map_routing")?.run_id, 31793488096);
});

test("manual content and UI QA remain separate approved gates", () => {
  assert.equal(audit.manual_qa_separate, true);
  assert.equal(phase21.status, "APPROVED_PRODUCTION_REQA");
  assert.equal(phase21.production_followup.browser_result_pending, false);
  assert.equal(phase22.status, "APPROVED_REQA");
});
