import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

test('advanced theory source evidence remains fail-closed until 60/60', () => {
  const canon = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
  const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
  const canonicalUnits = canon.works.flatMap((work) => work.theory_units.map((unit) => `${work.id}:${unit.id}`));
  const rows = evidence.verified_units ?? [];
  assert.equal(new Set(rows.map((row) => `${row.work_id}:${row.theory_unit_id}`)).size, rows.length);
  assert.ok(rows.every((row) => canonicalUnits.includes(`${row.work_id}:${row.theory_unit_id}`)));
  assert.ok(rows.every((row) => row.verification_status === 'source_backed' && row.locator && row.evidence_url?.startsWith('https://')));
  assert.equal(evidence.policy.all_60_units_required_before_runtime_release, true);
  assert.equal(evidence.policy.generator_owned_promotion_only, true);
  assert.equal(evidence.status, rows.length === 60 ? 'source_verification_complete' : 'source_verification_in_progress');
});
