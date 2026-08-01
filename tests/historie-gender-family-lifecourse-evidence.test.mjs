import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const registry = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json').entries;
const dossier = readJson('data/fag/historie/source_dossiers/gender_family_lifecourse_v1.json');

const targetTheoryIds = new Set(theories
  .filter((theory) => theory.explanatory_scope.includes('his_kjonn_familie_livslop'))
  .map((theory) => theory.theory_id));

test('gender, family and life-course qualifies the complete ten-object domain', () => {
  assert.equal(targetTheoryIds.size, 10);
  const entries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  assert.equal(entries.length, 10);
  assert.ok(entries.every((entry) => entry.status === 'evidence_ready'));
});

test('each gender/family theory uses a distinct multi-case evidence bundle', () => {
  const entries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  const bundles = new Set(entries.map((entry) => [...entry.claim_ids].sort().join('|')));
  assert.equal(bundles.size, 10);
  assert.ok(entries.every((entry) => entry.case_ids.length >= 2));
  assert.ok(entries.every((entry) => entry.place_ids.length >= 2));
});

test('sexuality evidence separates place practice, legal repeal and later heritage', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_kjonn_familie_seksualitet_regulering_og_identitet');
  assert.deepEqual(new Set(entry.case_ids), new Set(['case_his_kjaerlighetskarusellen', 'case_his_stortinget']));
  for (const claimId of [
    'claim_his_kjaerlighetskarusellen_hidden_queer_meeting_place_1937_1972',
    'claim_his_storting_repeal_section_213_1972',
    'claim_his_kjaerlighetskarusellen_queer_heritage_2009',
  ]) assert.ok(entry.claim_ids.includes(claimId));
});

test('marital property evidence preserves the 1888 partial-reform boundary', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_kjonn_familie_ekteskap_arv_og_eiendom');
  assert.ok(entry.claim_ids.includes('claim_his_storting_married_women_property_capacity_1888'));
  assert.match(entry.rationale, /myndighet og egen inntekt fra kontroll over felleseiet/);
});

test('dossier scope exactly matches the qualified theory and case sets', () => {
  const entries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  assert.deepEqual(new Set(dossier.scope.qualified_theory_ids), targetTheoryIds);
  assert.deepEqual(new Set(dossier.scope.case_ids), new Set(entries.flatMap((entry) => entry.case_ids)));
});

test('History CI permanently runs gender/family validation and regressions', () => {
  const workflow = fs.readFileSync('.github/workflows/history-theory-evidence.yml', 'utf8');
  for (const path of [
    'tools/validate-historie-kjonn-familie-livslop.mjs',
    'tests/historie-gender-family-lifecourse-evidence.test.mjs',
    'data/fag/historie/source_dossiers/gender_family_lifecourse_v1.json',
  ]) assert.ok(workflow.includes(path), `History CI does not include ${path}`);
});
