import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const gate = readJson("reports/place-production/torggata-phase24-one-place-gate-audit-v1.json");
const phase21 = readJson("reports/place-production/torggata-phase21-ui-qa-audit-v1.json");
const phase22 = readJson("reports/place-production/torggata-phase22-content-qa-audit-v1.json");
const phase23 = readJson("reports/place-production/torggata-phase23-ci-gates-audit-v1.json");
const backlog = readJson("reports/place-production/torggata-quality-improvement-backlog-v1.json");

test("Torggata phase 24 is a strict one-place final PR", () => {
  assert.equal(gate.status, "REOPENED_EDITORIAL_QUALITY");
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

test("manual quality review records the original five findings and the current resolution queue", () => {
  const assessment = gate.quality_assessment;
  assert.equal(assessment.dimensions.length, 6);
  assert.equal(assessment.total, 21);
  assert.equal(assessment.required_total, 27);
  assert.ok(assessment.dimensions.some((dimension) => dimension.score < 4));
  assert.equal(assessment.critical_findings.length, 5);
  assert.equal(assessment.unresolved_blockers.length, 5);
  assert.equal(assessment.gate, "FAILED_REOPENED_FOR_EDITORIAL_IMPROVEMENT");
  assert.match(assessment.automatic_checks_limit, /do not prove/);
  assert.equal(backlog.status, "OPEN_BLOCKING_COMPLETION");
  assert.equal(backlog.findings.length, 5);
  assert.deepEqual(backlog.invariant, {
    content_rounds_total: 4,
    badge_separate: true,
    note: "The 4+1 layout remains. The four content rounds must be substantive, distinct and natural."
  });
  assert.ok(backlog.findings.every((finding) => finding.severity === "BLOCKING"));
  assert.equal(backlog.completion_gate.manual_ui_review_required, true);
  assert.equal(backlog.completion_gate.rescore_required, true);
  assert.deepEqual(backlog.active_phase, {
    id: "manual_ui_and_content_reqa",
    status: "QUEUED_NEXT"
  });
  assert.equal(backlog.sequence.length, 7);
  assert.deepEqual(
    backlog.sequence.map(({ id, status }) => ({ id, status })),
    [
      { id: "before_after_comparability_and_depth", status: "RESOLVED" },
      { id: "news_missing", status: "RESOLVED" },
      { id: "reading_trail_missing", status: "RESOLVED" },
      { id: "more_missing", status: "RESOLVED" },
      { id: "objects_structures_round_overlap", status: "RESOLVED" },
      { id: "manual_ui_and_content_reqa", status: "QUEUED_NEXT" },
      { id: "final_closeout", status: "QUEUED" }
    ]
  );
  const beforeAfter = backlog.findings.find(
    (finding) => finding.id === "before_after_comparability_and_depth"
  );
  assert.equal(beforeAfter.workflow_status, "RESOLVED_PHASE_7D");
  assert.equal(beforeAfter.resolution.rejected_own_place_proxy, "Torggata Bad");
  assert.match(beforeAfter.resolution.pair, /ca|circa/i);
  const news = backlog.findings.find((finding) => finding.id === "news_missing");
  assert.equal(news.workflow_status, "RESOLVED_PHASE_7F");
  assert.equal(news.resolution.items.length, 2);
  const reading = backlog.findings.find((finding) => finding.id === "reading_trail_missing");
  assert.equal(reading.workflow_status, "RESOLVED_PHASE_7G");
  assert.equal(reading.resolution.items.length, 3);
});

test("global checklist mirrors the canonical full four-collection plus separate Badge contract", () => {
  const workflow = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
  const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md", "utf8");
  const contract = fs.readFileSync("data/places/README_place_rounds.md", "utf8");

  assert.match(workflow, /PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1\.md/);
  assert.match(workflow, /Alle faglige, redaksjonelle, faktuelle og subsystemspesifikke krav i referansen er fortsatt bindende/);
  assert.match(contract, /nøyaktig fire samlingsflater ligger i et balansert 2 × 2-felt/);
  assert.match(contract, /Badges teller ikke blant de fire samlingene/);
  assert.match(checklist, /MÅL FOR PLACECARD-SAMLINGER: alltid fire flater i fast kategori-komposisjon \+ separat fast Badge \+ obligatorisk Quiz/);
  assert.match(checklist, /fire samlingsflater vises som et fullt 2 × 2-felt ved `frontImage`/);
  assert.match(checklist, /bilder fra ulike kamerastandpunkter kan brukes som supplerende historiske bilder/);
  assert.match(checklist, /canonical place-register\/manifester er søkt før motivet velges/i);
  assert.match(checklist, /delsted som har egen canonical place-oppføring brukes ikke som primært Før\/etter-stedfortreder/i);
  assert.match(checklist, /2009 → 2017 erstatter ikke automatisk et eldre historisk førbilde/);
  assert.match(checklist, /Nyheter kan ikke godkjennes som tom\/N\/A/);
  assert.match(checklist, /Lesespor kan ikke godkjennes som tom\/N\/A/);
  assert.match(checklist, /betalingslåst er ikke tilstrekkelig N\/A-grunn/);
  assert.match(checklist, /Innhold som tidligere lå i Mer kan ikke skjules bak en restfane/);
  assert.match(checklist, /en enkelt vilkårlig eller taksonomisk konstruert gjenstand er ikke nok/);
  assert.match(checklist, /Objects og Structures\/Bygg brukes ikke som to separate samlinger/);
  assert.match(checklist, /to eller tre sterke samlinger er bedre enn en kunstig fjerde/);
  assert.doesNotMatch(checklist, /tre innholdsrundinger|3 innholdsrundinger|tre-rundersrad|legacy 4-\/6-/i);
});
