import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => JSON.parse(fs.readFileSync('data/fag/politikk/' + name, 'utf8'));
const canon = read('advanced_political_science_reading_canon_v1.json');
const matrix = read('advanced_political_science_wave2_gap_matrix_v1.json');
const methods = read('methods_politikk_canonical_v4_5.json');
const pensum = read('politikkpensum_canonical_v4_5.json');
const methodIDs = new Set(methods.methods.map(x => x.method_id));
const domainIDs = new Set(pensum.domains.map(x => x.domain_id));
const workById = new Map(canon.works.map(x => [x.id, x]));

test('Statsvitenskap: 9 aktive verk har verifiserbare forlagsoppføringer; 3 støtteverk forblir utsatt', () => {
  const active = canon.works.filter(x => x.role !== 'deferred_support');
  const deferred = canon.works.filter(x => x.role === 'deferred_support');
  assert.equal(active.length, 9);
  assert.equal(deferred.length, 3);
  for (const work of active) {
    assert.equal(work.source_status, 'publisher_verified', work.id);
    assert.match(work.publisher_url, /^https:\/\//, work.id);
    assert.equal(work.materialization_status, 'not_materialized');
  }
  for (const work of deferred) {
    assert.equal(work.source_status, 'pending_publisher_verification');
    assert.equal(work.materialization_status, 'not_materialized');
  }
});

test('Statsvitenskap: 7 nye bokvurderinger dedupliseres mot eksisterende metode- og domene-ID-er', () => {
  assert.equal(matrix.work_audits.length, 7);
  assert.equal(new Set(matrix.work_audits.map(x => x.id)).size, 7);
  assert.equal(new Set(matrix.work_audits.map(x => x.work_id)).size, 7);
  assert.equal(matrix.bibliography_verified, 7);
  for (const item of matrix.work_audits) {
    const work = workById.get(item.work_id);
    assert.ok(work, item.work_id);
    assert.equal(work.role, item.role);
    assert.equal(work.source_status, 'publisher_verified');
    assert.ok(methodIDs.has(item.existing_method_id), item.id);
    assert.ok(domainIDs.has(item.primary_domain_id), item.id);
    assert.match(item.evidence_level, /^publisher_/);
    assert.ok(item.audit_question.length > 35);
    assert.ok(item.possible_enrichment.length > 35);
    assert.ok(item.misuse_guardrail.length > 35);
    assert.ok(item.next_check.length > 35);
    assert.equal(item.decision, 'review_existing_before_any_promotion');
    assert.equal(item.materialization_status, 'source_layer_only');
    assert.equal(item.fulltext_audited, false);
    assert.equal(item.promotion_allowed, false);
  }
});

test('Statsvitenskap: debattverket krever rivalforklaringer; ingen kanonisk eller runtime-promotering', () => {
  assert.equal(matrix.work_audits.filter(x => x.role === 'debate').length, 1);
  const debate = matrix.work_audits.find(x => x.role === 'debate');
  assert.equal(debate.work_id, 'psc-mearsheimer-rosato-2023');
  assert.deepEqual(debate.required_rival_families, [
    'organisasjonsprosess', 'byråkratisk politikk', 'politisk psykologi', 'konstruktivisme'
  ]);
  assert.equal(pensum.domains.length, 13);
  assert.equal(methods.methods.length, 71);
  assert.equal(matrix.fulltext_audited, 0);
  assert.equal(matrix.new_methods_created, 0);
  assert.equal(matrix.new_domains_created, 0);
  assert.equal(matrix.runtime_claims_promoted, 0);
  assert.equal(matrix.assessment_items_promoted, 0);
});
