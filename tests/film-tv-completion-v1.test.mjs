import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvCompletionV1 } from '../scripts/audit-film-tv-completion-v1.mjs';

test('Film & TV completion audit locks exact canonical coverage and evidence trace', () => {
  const report = auditFilmTvCompletionV1();
  assert.equal(report.subject_id, 'film_tv');
  assert.equal(report.status, 'complete_ready_verified');
  assert.equal(report.canonical.domain_count, 10);
  assert.equal(report.canonical.emne_count, 192);
  assert.equal(report.materialized.chapter_count, 17);
  assert.equal(report.materialized.planned_unit_count, 15);
  assert.equal(report.materialized.reaudited_legacy_chapter_count, 2);
  assert.equal(report.coverage.covered_emne_count, 192);
  assert.deepEqual(report.coverage.missing_emne_ids, []);
  assert.deepEqual(report.coverage.duplicate_owned_emne_ids, []);
  assert.deepEqual(report.coverage.missing_required_method_ids, []);
  assert.ok(report.materialized.module_count >= 45);
  assert.ok(report.materialized.section_count >= 100);
  assert.ok(report.materialized.paragraph_count >= 300);
  assert.ok(report.materialized.claim_count >= report.materialized.paragraph_count);
  assert.ok(report.materialized.source_registration_count >= 200);
  assert.ok(report.materialized.work_case_count >= 40);
  assert.ok(report.canonical.required_method_count > 0);
  assert.ok(report.materialized.used_method_count >= report.canonical.required_method_count);
  assert.ok(Object.values(report.quality_gates).every(Boolean));
  assert.equal(report.chapter_summaries.length, 17);
});
