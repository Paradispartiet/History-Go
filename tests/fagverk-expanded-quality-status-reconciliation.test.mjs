import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const STATUS = 'data/fagverk/subject_status.json';
const THEORY = 'reports/fagverk/fagverk-theory-integrity-audit.json';
const FINAL = 'reports/fagverk/fagverk-expansion-19-plus-1-final-reconciliation-v1.json';
const RECON = 'reports/fagverk/fagverk-expanded-quality-status-reconciliation-v1.json';

const expectedSubjects = [
  'by', 'historie', 'kunst', 'litteratur', 'media', 'musikk', 'naeringsliv',
  'natur', 'politikk', 'psykologi', 'helse', 'utdanning', 'religion',
  'scenekunst', 'sport', 'subkultur', 'vitenskap', 'filosofi', 'film_tv'
];

test('alle 19 toppfag er reconcilet mot expanded_and_audited kvalitetsstandard', () => {
  const status = readJson(STATUS);
  const recon = readJson(RECON);

  assert.equal(status.version, '2.2.0');
  assert.equal(status.qualityReconciliation.standard, 'expanded_and_audited');
  assert.equal(status.qualityReconciliation.status, 'all_top_level_subjects_reconciled');
  assert.equal(status.subjects.length, 19);
  assert.deepEqual(status.subjects.map((row) => row.id), expectedSubjects);
  assert.ok(status.subjects.every((row) => row.navigationStatus === 'materialized'));
  assert.ok(status.subjects.every((row) => row.assessmentStatus === 'audited'));
  assert.ok(status.subjects.every((row) => row.qualityStatus === 'expanded_and_audited'));
  assert.ok(status.subjects.every((row) => ['complete', 'expanded_and_audited'].includes(row.editorialStatus)));

  assert.equal(recon.schema, 'history_go_fagverk_expanded_quality_status_reconciliation_v1');
  assert.equal(recon.status, 'expanded_quality_reconciled_no_content_gaps');
  assert.equal(recon.summary.top_level_expanded_quality, 19);
  assert.equal(recon.summary.top_level_unreconciled, 0);
});

test('expanded kvalitetsstatus er bundet til strict 20/20-bevis, ikke bare statusmerking', () => {
  const status = readJson(STATUS);
  const theory = readJson(THEORY);
  const final = readJson(FINAL);
  const recon = readJson(RECON);

  assert.equal(theory.status, 'strict_audit_complete');
  assert.equal(theory.scope.topLevelSubjects, 19);
  assert.equal(theory.scope.nestedSpecializations, 1);
  assert.equal(theory.scope.totalAudited, 20);
  assert.equal(theory.summary.strictly_proven, 20);
  assert.equal(theory.summary.substantive_content_gaps_proven, 0);
  assert.deepEqual(theory.proofReconciliationQueue, []);
  assert.deepEqual(theory.expansionProductionQueue, []);
  assert.deepEqual(theory.contentRepairQueue, []);

  assert.equal(final.status, 'strict_completion_reconciled');
  assert.equal(final.completion_gates.all_20_units_strictly_proven, true);
  assert.equal(final.completion_gates.proof_reconciliation_queue_empty, true);
  assert.equal(final.completion_gates.expansion_production_queue_empty, true);
  assert.equal(final.completion_gates.content_repair_queue_empty, true);

  assert.equal(status.qualityReconciliation.strictlyProvenUnits, 20);
  assert.equal(status.qualityReconciliation.substantiveContentGaps, 0);
  assert.equal(recon.summary.strictly_proven_units, 20);
  assert.equal(recon.summary.substantive_content_gaps, 0);
});

test('ingen ny fagtekst produseres uten et bevist substansielt gap', () => {
  const recon = readJson(RECON);
  const status = readJson(STATUS);

  assert.equal(recon.classification_rules.content_production_requires_substantive_gap, true);
  assert.equal(recon.production_decision.new_content_required, false);
  assert.equal(recon.summary.proof_reconciliation_queue, 0);
  assert.equal(recon.summary.expansion_production_queue, 0);
  assert.equal(recon.summary.content_repair_queue, 0);
  assert.deepEqual(status.qualityReconciliation.proofReconciliationQueue, []);
  assert.deepEqual(status.qualityReconciliation.expansionProductionQueue, []);
  assert.deepEqual(status.qualityReconciliation.contentRepairQueue, []);
});

test('Teknologi bevares som nested strict spesialisering under Vitenskap', () => {
  const recon = readJson(RECON);
  assert.deepEqual(recon.nested_specializations, [
    {
      id: 'teknologi',
      parent_subject: 'vitenskap',
      strict_integrity_status: 'strictly_proven',
      new_content_required: false
    }
  ]);
});
