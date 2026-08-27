import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = path => JSON.parse(fs.readFileSync(path, "utf8"));
const gate = readJson("reports/place-production/torggata-phase24-one-place-gate-audit-v1.json");
const phase21 = readJson("reports/place-production/torggata-phase21-ui-qa-audit-v1.json");
const phase22 = readJson("reports/place-production/torggata-phase22-content-qa-audit-v1.json");
const phase23 = readJson("reports/place-production/torggata-phase23-ci-gates-audit-v1.json");
const backlog = readJson("reports/place-production/torggata-quality-improvement-backlog-v1.json");

const expectedPeople = ["harald_olsen", "alma_fahlstrom", "johan_fahlstrom", "henrik_bull"];

test("Torggata phase 24 is a strict closeout-only one-place gate", () => {
  assert.equal(gate.status, "CLOSED_MERGED_DEPLOYED");
  assert.deepEqual(gate.scope.places, ["torggata"]);
  assert.equal(gate.scope.active_phase, 24);
  assert.deepEqual(gate.scope.content_changes, []);
  assert.equal(gate.scope.closeout_and_regression_maintenance_only, true);
  assert.equal(gate.scope.next_place_included, false);
});

test("manual production and content re-QA approve the exact People target", () => {
  assert.equal(phase21.status, "APPROVED_PRODUCTION_REQA");
  assert.equal(phase22.status, "APPROVED_REQA");
  assert.equal(phase23.status, "APPROVED");
  assert.equal(phase21.final_reqa_2026_08_25.status, "PASS");
  assert.equal(phase21.final_reqa_2026_08_25.people_count, 4);
  assert.deepEqual(phase21.final_reqa_2026_08_25.people_ids, expectedPeople);
  assert.equal(phase21.final_reqa_2026_08_25.false_zero, false);
  assert.equal(phase21.final_reqa_2026_08_25.empty_people_popup, false);
  assert.deepEqual(phase22.final_reqa_2026_08_25.people_ids, expectedPeople);
  assert.deepEqual(gate.prerequisites.people_ids, expectedPeople);
});

test("all reopened findings are closed and the six-part score passes", () => {
  assert.equal(backlog.status, "CLOSED_MERGED_DEPLOYED");
  assert.equal(backlog.findings.length, 5);
  assert.ok(backlog.findings.every(finding => finding.workflow_status.startsWith("RESOLVED_PHASE_")));
  assert.equal(backlog.completion_gate.manual_ui_review_status, "PASS");
  assert.equal(backlog.completion_gate.rescore_status, "PASS");
  assert.equal(backlog.completion_gate.rescore_total, 29);
  assert.deepEqual(backlog.active_phase, { id: "final_closeout", status: "COMPLETED" });
  assert.equal(backlog.sequence.find(item => item.id === "manual_ui_and_content_reqa").status, "RESOLVED");
  assert.equal(backlog.sequence.find(item => item.id === "final_closeout").status, "COMPLETED");

  const assessment = gate.quality_assessment;
  assert.equal(assessment.dimensions.length, 6);
  assert.equal(assessment.total, 29);
  assert.equal(assessment.required_total, 27);
  assert.ok(assessment.dimensions.every(dimension => dimension.score >= 4));
  assert.deepEqual(assessment.critical_findings, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
  assert.equal(assessment.gate, "PASS_COMPLETE");
  assert.deepEqual(gate.final_completion_evidence, {
    closeout_pr: 5337,
    closeout_head_sha: "8d3800771cb9d311376a815c06abdbf1e38f951e",
    merge_commit: "85a4029aba1d0dc9aaadc0fb11d5f7c3378b88bf",
    main_verified: true,
    pages_run_id: 32896361659,
    pages_run_number: 14523,
    pages_status: "SUCCESS",
    pages_verified_at: "2026-08-25T20:39:35Z"
  });
});

test("global checklist keeps the adaptive composition and owner boundaries", () => {
  const workflow = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
  const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md", "utf8");
  const contract = fs.readFileSync("data/places/README_place_rounds.md", "utf8");

  assert.match(workflow, /PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1\.md/);
  assert.match(workflow, /Alle faglige, redaksjonelle, faktuelle og subsystemspesifikke krav i referansen er fortsatt bindende/);
  assert.match(contract, /1–4 ferdige, relevante samlinger/);
  assert.match(contract, /Badges står separat ved tittelen/);
  assert.match(contract, /Bilder \/ `images`/);
  assert.match(workflow, /`place_card_profile\.collection_ids` inneholder \*\*1–4 ferdige, relevante samlinger\*\*/);
  assert.match(workflow, /ingen tomme PlaceCard-kort er tillatt ved closeout/i);
  assert.match(checklist, /delsted som har egen canonical place-oppføring brukes ikke som primært Før\/etter-stedfortreder/i);
  assert.match(checklist, /Nyheter kan ikke godkjennes som tom\/N\/A/);
  assert.match(checklist, /Lesespor kan ikke godkjennes som tom\/N\/A/);
  assert.match(checklist, /Objects og Structures\/Bygg brukes ikke som to separate samlinger/);
});
