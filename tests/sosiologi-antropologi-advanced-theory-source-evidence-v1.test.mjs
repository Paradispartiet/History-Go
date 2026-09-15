import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

test('advanced theory source evidence remains fail-closed until 60/60 fulltext verification', () => {
  const canon = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
  const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
  const canonicalUnits = canon.works.flatMap((work) => work.theory_units.map((unit) => `${work.id}:${unit.id}`));
  const rows = evidence.evidence_units ?? [];
  const rowKeys = rows.map((row) => `${row.work_id}:${row.theory_unit_id}`);
  const fulltext = rows.filter((row) => row.verification_status === 'fulltext_verified');

  assert.equal(canonicalUnits.length, 60);
  assert.equal(rows.length, 60);
  assert.equal(new Set(rowKeys).size, rows.length);
  assert.deepEqual([...rowKeys].sort(), [...canonicalUnits].sort());
  assert.ok(rows.every((row) => ['mapping_supported', 'fulltext_verified'].includes(row.verification_status)));
  assert.ok(rows.every((row) => row.locator && row.evidence_url?.startsWith('https://') && row.evidence_kind));
  assert.ok(fulltext.every((row) => row.evidence_kind.includes('full') || row.evidence_kind.includes('inspectable_text')));

  assert.equal(evidence.policy.all_60_units_required_before_runtime_release, true);
  assert.equal(evidence.policy.generator_owned_promotion_only, true);
  assert.equal(evidence.policy.bibliographic_registration_is_not_fulltext_verification, true);
  assert.equal(evidence.policy.toc_or_publisher_description_is_mapping_evidence_only, true);
  assert.equal(evidence.policy.fulltext_verified_requires_inspectable_text_and_locator, true);
  assert.equal(evidence.policy.partial_verification_must_not_change_completion_state, true);

  assert.deepEqual(evidence.counts, {
    expected_units: 60,
    mapping_supported: 60,
    fulltext_verified: fulltext.length,
    runtime_releasable: fulltext.length === 60 ? 60 : 0,
  });
  assert.equal(evidence.status, fulltext.length === 60 ? 'source_verification_complete' : 'source_verification_in_progress');
});

test('advanced theory materializer derives a fail-closed release gate from source evidence', async () => {
  const canon = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
  const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
  const { evaluateSourceEvidence } = await import('../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs');
  const gate = evaluateSourceEvidence(canon, evidence);

  assert.deepEqual(gate.counts, {
    mapping_supported: 60,
    fulltext_verified: 14,
    runtime_releasable: 0,
  });
  assert.equal(gate.runtime_release_gate_open, false);
  assert.equal(gate.rowsByUnitKey.size, 60);
});
