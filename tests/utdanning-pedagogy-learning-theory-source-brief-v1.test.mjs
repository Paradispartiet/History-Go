import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditUtdanningPedagogyLearningTheorySourceBriefV1 } from '../scripts/brief-utdanning-pedagogy-learning-theory-sources-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('pedagogikk/læringsteori-briefen er source-first og Utdanning forblir 0/14', () => {
  const { brief, report, gates } = auditUtdanningPedagogyLearningTheorySourceBriefV1();
  const pensum = read('data/fag/utdanning/utdanningpensum_canonical_v1.json');
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'utdanning');
  assert.equal(brief.scope.primary_domain_id, 'pedagogikk_laeringsteori');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.metadata_registration.deferred_until_fulltext, true);
  assert.equal(pensum.domains.length, 14);
  assert.equal(pensum.domains.filter((row) => row.status === 'materialized').length, 0);
  assert.deepEqual([status.navigationStatus, status.assessmentStatus, status.editorialStatus], ['planned', 'pending', 'not_started']);
  assert.ok(Object.values(gates).every(Boolean));
  assert.equal(report.summary.registered_chapter_count_delta, 0);
  assert.equal(report.next_gate, 'materialize_pedagogikk_laeringsteori_fulltext_with_reciprocal_claim_trace');
});

test('briefen har høy evidensbredde og overdriver ingen planlagte claims', () => {
  const { brief, report, claims, sources, topics, scenarios } = auditUtdanningPedagogyLearningTheorySourceBriefV1();
  assert.deepEqual([sources.length, topics.length, scenarios.length, claims.length], [13, 8, 6, 32]);
  assert.equal(new Set(claims.map((row) => row.id)).size, 32);
  assert.ok(sources.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-25'));
  assert.ok(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2));
  assert.equal(brief.source_policy.performance_is_not_learning, true);
  assert.equal(brief.source_policy.retrieval_practice_is_not_high_stakes_testing, true);
  assert.equal(brief.source_policy.feedback_is_not_inherently_positive, true);
  assert.equal(brief.source_policy.empirical_effect_is_not_normative_educational_aim, true);
  assert.equal(report.quality_assessment.total, 29);
});

test('begge canonicale metoder brukes uten å oppfinne nye metode-id-er', () => {
  const { brief, topics } = auditUtdanningPedagogyLearningTheorySourceBriefV1();
  const allowed = new Set(brief.allowed_method_ids);
  const used = new Set(topics.flatMap((row) => row.method_ids));
  assert.deepEqual([...allowed].sort(), ['met_utdanning_litteratursyntese', 'met_utdanning_teori_sammenligning'].sort());
  assert.ok(topics.every((row) => row.method_ids.every((id) => allowed.has(id))));
  assert.deepEqual([...used].sort(), [...allowed].sort());
});

test('fulltekstplanen dekker hvert tema nøyaktig én gang', () => {
  const { brief, topics } = auditUtdanningPedagogyLearningTheorySourceBriefV1();
  const planned = brief.fulltext_structure.flatMap((row) => row.topic_ids);
  assert.equal(brief.fulltext_structure.length, 4);
  assert.equal(planned.length, 8);
  assert.equal(new Set(planned).size, 8);
  assert.deepEqual([...planned].sort(), topics.map((row) => row.id).sort());
});
