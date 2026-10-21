import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (name) => JSON.parse(fs.readFileSync('data/fag/politikk/' + name, 'utf8'));
const canon = read('advanced_political_science_reading_canon_v1.json');
const evidence = read('advanced_political_science_source_evidence_v1.json');
const bindings = read('advanced_political_science_domain_bindings_v1.json');
const production = read('advanced_political_science_production_registry_v1.json');
const methods = read('methods_politikk_canonical_v4_5.json');
const pensum = read('politikkpensum_canonical_v4_5.json');
test('Statsvitenskap: 8 sentrale verk, ett debattverk, tre utsatte verk', () => {
  assert.equal(canon.works.length, 12);
  assert.equal(canon.works.filter((w) => w.role === 'central').length, 8);
  assert.equal(canon.works.filter((w) => w.role === 'debate').length, 1);
  assert.equal(canon.works.filter((w) => w.role === 'deferred_support').length, 3);
  assert.equal(new Set(canon.works.map((w) => w.id)).size, 12);
  for (const work of canon.works) {
    assert.equal(work.materialization_status, 'not_materialized');
    assert.ok(Array.isArray(work.authors) && Array.isArray(work.editors));
    assert.ok(work.authors.length || work.editors.length);
  }
  assert.equal(canon.works.find((w) => w.id === 'psc-ginsburg-huq-khaitan-2024').authors.length, 0);
  assert.deepEqual(canon.works.find((w) => w.id === 'psc-collier-2026').editors, ['Zachary Elkins']);
});
test('Statsvitenskap: kandidater eies av eksisterende domene/metoder og forblir blokkert', () => {
  const methodIDs = new Set(methods.methods.map((m) => m.method_id));
  const domainIDs = new Set(pensum.domains.map((d) => d.domain_id));
  const candidateIDs = new Set(canon.candidate_units.map((u) => u.id));
  const evidenceIDs = new Set(evidence.source_evidence.map((e) => e.id));
  assert.equal(canon.candidate_units.length, 5);
  assert.equal(candidateIDs.size, 5);
  assert.equal(bindings.bindings.length, 5);
  assert.equal(production.decisions.length, 5);
  for (const candidate of canon.candidate_units) {
    assert.ok(methodIDs.has(candidate.existing_method_id), candidate.id);
    assert.ok(domainIDs.has(candidate.proposed_primary_domain_id), candidate.id);
    assert.ok(evidenceIDs.has(candidate.source_evidence_id), candidate.id);
    assert.ok(['enrich_existing','defer'].includes(candidate.deduplication_result));
    assert.ok(candidate.scope_conditions.length);
    assert.ok(candidate.misuse_guardrail.length > 20);
    assert.equal(candidate.materialization_status, 'source_layer_only');
    assert.equal(candidate.claim_status, 'blocked_pending_fulltext_audit');
  }
  for (const binding of bindings.bindings) {
    assert.ok(candidateIDs.has(binding.candidate_id));
    assert.ok(domainIDs.has(binding.primary_domain_id));
    assert.ok(methodIDs.has(binding.existing_method_id));
    assert.equal(binding.new_domain_created, false);
  }
  for (const item of production.decisions) {
    assert.ok(candidateIDs.has(item.candidate_id));
    assert.equal(item.promotion_allowed, false);
  }
  assert.equal(production.runtime_claims_promoted, 0);
  assert.equal(production.domain_changes, 0);
  assert.equal(production.fulltext_verified_candidates, 0);
});
test('Statsvitenskap: kildebidrag og publiseringsstatus er ærlig avgrenset', () => {
  assert.equal(evidence.source_evidence.length, 5);
  for (const item of evidence.source_evidence) {
    assert.ok(item.locator.includes('Chapter'));
    assert.ok(item.contributors.length);
    assert.match(item.source_url, /^https:\/\/www\.cambridge\.org\/core\/books\//);
    assert.equal(item.fulltext_audited, false);
    assert.equal(item.runtime_claim_eligible, false);
  }
  assert.equal(evidence.source_evidence.filter((x) => x.evidence_level === 'publisher_abstract_only').length, 2);
  assert.equal(production.active_works.length, 9);
  assert.equal(production.deferred_support_works.length, 3);
});
