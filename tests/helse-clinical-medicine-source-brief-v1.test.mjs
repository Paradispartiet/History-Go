import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthClinicalMedicineSourceBriefV1 } from '../scripts/brief-helse-clinical-medicine-sources-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('klinisk-medisin-briefen er source-first og Helse forblir 3/12', () => {
  const { brief, report, gates } = auditHealthClinicalMedicineSourceBriefV1();
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  const release = read('data/fagverk/fagverk_release.json').subjects.helse;
  assert.equal(brief.scope.primary_domain_id, 'klinisk_medisin');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.metadata_registration.deferred_until_fulltext, true);
  assert.equal(registry.chapters.length, 3);
  assert.equal(registry.chapters.some((row) => row.id === brief.future_chapter_id), false);
  assert.deepEqual([status.navigationStatus, status.assessmentStatus, status.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  assert.equal(registry.editorialPlan.targetDomainCount, 12);
  assert.equal(registry.editorialPlan.registeredChapterCount, 3);
  assert.equal(release.chapter_count, 3);
  assert.ok(Object.values(gates).every(Boolean));
  assert.equal(report.summary.expanded_fagverk_strictly_proven, 18);
});

test('briefen låser testytelse, sannsynlighet, referanseintervall, behandlingseffekt og klinisk sikkerhet', () => {
  const { brief, report, claims, sources, topics, scenarios } = auditHealthClinicalMedicineSourceBriefV1();
  assert.deepEqual([sources.length, topics.length, scenarios.length, claims.length], [14, 8, 6, 32]);
  assert.equal(new Set(claims.map((row) => row.id)).size, 32);
  assert.ok(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 3));
  assert.equal(brief.source_policy.test_result_is_not_diagnosis, true);
  assert.equal(brief.source_policy.predictive_value_depends_on_pretest_probability_and_population, true);
  assert.equal(brief.source_policy.reference_interval_is_not_disease_boundary, true);
  assert.equal(brief.source_policy.relative_effect_is_not_absolute_benefit, true);
  assert.equal(brief.production_requirements.clinical_safety_contract_is_blocking, true);
  assert.equal(report.quality_assessment.total, 29);
});

test('begge canonicale klinisk-medisin-metoder brukes uten å oppfinne nye metoder', () => {
  const { brief, topics } = auditHealthClinicalMedicineSourceBriefV1();
  const allowed = new Set(brief.allowed_method_ids);
  const used = new Set(topics.flatMap((row) => row.method_ids));
  assert.deepEqual([...allowed].sort(), ['met_helse_diagnostisk_testvurdering', 'met_helse_klinisk_studievurdering'].sort());
  assert.ok(topics.every((row) => row.method_ids.every((id) => allowed.has(id))));
  assert.deepEqual([...used].sort(), [...allowed].sort());
});
