import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const FINAL = 'reports/fagverk/fagverk-expansion-19-plus-1-final-reconciliation-v1.json';
const THEORY = 'reports/fagverk/fagverk-theory-integrity-audit.json';
const CATEGORY = 'data/categories/category_contract.json';
const STATUS = 'data/fagverk/subject_status.json';

const expectedSubcategories = [
  'natur/geografi',
  'natur/biologi',
  'natur/geologi_jordvitenskap',
  'litteratur/sprak_lingvistikk',
  'politikk/juss_rettsvitenskap',
  'politikk/sosiologi_antropologi',
  'helse/medisin_helsevitenskap',
  'utdanning/pedagogikk_utdanningsvitenskap',
  'vitenskap/fysikk',
  'vitenskap/kjemi',
  'vitenskap/matematikk',
  'naeringsliv/okonomi'
];

test('19+1 slutt-reconciliation matcher strict theory-integrity 20/20', () => {
  const final = readJson(FINAL);
  const theory = readJson(THEORY);

  assert.equal(final.schema, 'history_go_fagverk_expansion_19_plus_1_final_reconciliation_v1');
  assert.equal(final.status, 'strict_completion_reconciled');
  assert.equal(theory.status, 'strict_audit_complete');
  assert.equal(theory.scope.topLevelSubjects, 19);
  assert.equal(theory.scope.nestedSpecializations, 1);
  assert.equal(theory.scope.totalAudited, 20);
  assert.equal(theory.summary.strictly_proven, 20);
  assert.equal(theory.summary.baseline_only_strict_proof_missing, 0);
  assert.equal(theory.summary.substantive_content_gaps_proven, 0);
  assert.deepEqual(theory.proofReconciliationQueue, []);
  assert.deepEqual(theory.expansionProductionQueue, []);
  assert.deepEqual(theory.contentRepairQueue, []);

  assert.deepEqual(final.scope, {
    top_level_subjects: 19,
    nested_specializations: 1,
    total_audited_units: 20,
    strictly_proven_units: 20,
    canonical_subcategories: 12,
    foundation_materialized_subcategories: 12
  });
  assert.deepEqual(final.queues.proof_reconciliation, []);
  assert.deepEqual(final.queues.expansion_production, []);
  assert.deepEqual(final.queues.content_repair, []);
  assert.deepEqual(final.queues.strict_subcategory_production, []);
});

test('alle 19 toppfag er materialisert og auditerte i canonical status', () => {
  const final = readJson(FINAL);
  const status = readJson(STATUS);

  assert.equal(status.subjects.length, 19);
  assert.ok(status.subjects.every((subject) => subject.navigationStatus === 'materialized'));
  assert.ok(status.subjects.every((subject) => subject.assessmentStatus === 'audited'));
  assert.ok(status.subjects.every((subject) => ['complete', 'expanded_and_audited'].includes(subject.editorialStatus)));
  assert.equal(final.completion_gates.all_19_top_level_subjects_materialized, true);
  assert.equal(final.completion_gates.all_19_top_level_subjects_audited, true);
  assert.equal(final.completion_gates.all_20_units_strictly_proven, true);
});

test('de tolv eksplisitte canonicale underkategoriene er foundation_materialized', () => {
  const final = readJson(FINAL);
  const category = readJson(CATEGORY);
  const actual = Object.entries(category.canonicalSubcategories).flatMap(([owner, rows]) =>
    rows.map((row) => ({ id: `${owner}/${row.id}`, status: row.status }))
  );

  assert.deepEqual(actual.map((row) => row.id), expectedSubcategories);
  assert.ok(actual.every((row) => row.status === 'foundation_materialized'));
  assert.deepEqual(final.canonical_subcategories, expectedSubcategories);
  assert.equal(final.completion_gates.all_12_canonical_subcategories_foundation_materialized, true);
  assert.equal(final.completion_gates.strict_subcategory_queue_empty, true);
  assert.equal(final.next_strict_subject, null);
});

test('Informatikk/data/AI forblir nested under Vitenskap → Teknologi', () => {
  const final = readJson(FINAL);
  const category = readJson(CATEGORY);
  const vitenskapSubcategories = category.canonicalSubcategories.vitenskap.map((row) => row.id);

  assert.deepEqual(vitenskapSubcategories, ['fysikk', 'kjemi', 'matematikk']);
  assert.equal(final.ownership_decisions.technology.canonical_parent_subject, 'vitenskap');
  assert.equal(final.ownership_decisions.technology.top_level_subject, false);
  assert.equal(final.ownership_decisions.technology.relationship, 'nested_specialization');
  assert.equal(final.ownership_decisions.computing_data_ai.canonical_parent_subject, 'vitenskap');
  assert.equal(final.ownership_decisions.computing_data_ai.specialization, 'teknologi');
  assert.equal(final.ownership_decisions.computing_data_ai.relationship, 'nested_strong');
  assert.equal(final.ownership_decisions.computing_data_ai.new_canonical_subcategory_required, false);
});

test('sluttstatus peker bare til vedlikehold, ikke ny strict-produksjon', () => {
  const final = readJson(FINAL);
  assert.equal(final.completion_gates.proof_reconciliation_queue_empty, true);
  assert.equal(final.completion_gates.expansion_production_queue_empty, true);
  assert.equal(final.completion_gates.content_repair_queue_empty, true);
  assert.equal(final.next_work_class, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(final.next_strict_subject, null);
});
