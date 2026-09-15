import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const CONTRACT = new URL('../data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json', import.meta.url);

test('advanced theory canon has an explicit fulltext refresh contract for all 20 works and 60 theory units', () => {
  assert.equal(fs.existsSync(CONTRACT), true, 'advanced theory fulltext refresh contract must exist');
  const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
  assert.equal(contract.schema, 'history_go_sosiologi_antropologi_advanced_theory_fulltext_refresh_v1');
  assert.equal(contract.subject_id, 'politikk');
  assert.equal(contract.canonical_subcategory_id, 'sosiologi_antropologi');
  assert.equal(contract.canon_file, 'data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
  assert.equal(contract.bindings_file, 'data/fag/politikk/sosiologi_antropologi/advanced_theory_domain_bindings_v1.json');
  assert.equal(contract.expected_work_count, 20);
  assert.equal(contract.expected_theory_unit_count, 60);
  assert.equal(contract.policy.existing_domains_only, true);
  assert.equal(contract.policy.preserve_strict_completion, true);
  assert.equal(contract.policy.generator_owned_fulltext_only, true);
  assert.equal(contract.status, 'refresh_contract_ready_materialization_pending');
});
