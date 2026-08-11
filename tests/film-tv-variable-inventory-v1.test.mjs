import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFilmTvVariableInventoryV1, buildFilmTvVariableInventoryV1 } from '../scripts/audit-film-tv-variable-inventory-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('variabelt Film & TV-inventar er deterministisk og uten målkvoter', () => {
  const { inventory, report } = auditFilmTvVariableInventoryV1();
  assert.deepEqual(buildFilmTvVariableInventoryV1(), inventory);
  assert.equal(inventory.policy.all_relevant_emner_independent_of_number, true);
  assert.equal(inventory.policy.no_target_domain_count, true);
  assert.equal(inventory.policy.no_target_emne_count, true);
  assert.equal(report.gates.fixed_target_counts_absent, true);
  assert.ok(new Set(Object.values(report.integrity_counts_not_quotas.domain_emne_counts)).size > 1);
});

test('alle legacy-ID-er har gyldig aliasdekning og gapemner har evidens og faglig grense', () => {
  const { inventory, report } = auditFilmTvVariableInventoryV1();
  const aliases = inventory.emner.flatMap((row) => row.legacy_aliases);
  const gaps = inventory.emner.filter((row) => row.origin === 'gap_addition');
  const evidenceIds = new Set(inventory.evidence.map((row) => row.id));
  assert.equal(new Set(aliases).size, report.integrity_counts_not_quotas.legacy_emne_count);
  assert.equal(report.gates.every_legacy_emne_has_alias_coverage_and_only_splits_fan_out, true);
  assert.ok(gaps.every((row) => row.definition !== row.boundary));
  assert.ok(inventory.emner.every((row) => row.evidence_refs.every((id) => evidenceIds.has(id))));
  assert.ok(inventory.evidence.some((row) => row.id === 'film-tv-legacy-classification-v1'));
});

test('paraplyemner er eksplisitt integrerende, ikke skjulte duplikater', () => {
  const { inventory } = auditFilmTvVariableInventoryV1();
  const foundations = inventory.emner.filter((row) => row.inventory_role === 'integrative_foundation');
  assert.ok(foundations.some((row) => row.concept_id === 'audiovisuell_form_og_stil'));
  assert.ok(foundations.some((row) => row.concept_id === 'representasjon_identitet_og_makt'));
  assert.ok(inventory.emner.every((row) => ['integrative_foundation', 'independent_problem'].includes(row.inventory_role)));
});

test('historiske materialiserere kan ikke nedgradere completeness-porten', () => {
  for (const file of [
    'scripts/materialize-film-tv-kinoer-visningssteder-publikum-phase4.mjs',
    'scripts/materialize-film-tv-produksjon-studio-filmarbeid-phase4.mjs'
  ]) {
    const source = read(file);
    assert.match(source, /canonical_inventory_migration/);
    assert.match(source, /if \(!refactorGate\)/);
    assert.doesNotMatch(source, /status\.version = '1\.(55|57)\.0'/);
  }
});
