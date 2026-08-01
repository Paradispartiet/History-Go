import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const registryFile = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const dossier = readJson('data/fag/historie/source_dossiers/cold_war_postwar_v1.json');
const claims = new Map(readJson('data/fag/historie/claims_historie_canonical_v1.json').claims.map((claim) => [claim.claim_id, claim]));

const targetTheoryIds = new Set(theories
  .filter((theory) => theory.explanatory_scope.includes('his_kald_krig_etterkrig'))
  .map((theory) => theory.theory_id));
const entries = registryFile.entries.filter((entry) => targetTheoryIds.has(entry.theory_id));

test('Cold War and postwar completes the ten-object domain and universal registry', () => {
  assert.equal(targetTheoryIds.size, 10);
  assert.equal(entries.length, 10);
  assert.ok(entries.every((entry) => entry.status === 'evidence_ready'));
  assert.equal(registryFile.entries.length, 230);
  assert.equal(registryFile.completion.qualifying_entries, 230);
  assert.equal(registryFile.completion.universal_status, 'COMPLETE');
});

test('each final-domain theory uses a distinct multi-case evidence bundle', () => {
  assert.equal(new Set(entries.map((entry) => [...entry.claim_ids].sort().join('|'))).size, 10);
  assert.ok(entries.every((entry) => entry.claim_ids.length >= 3));
  assert.ok(entries.every((entry) => entry.case_ids.length >= 2));
  assert.ok(entries.every((entry) => entry.place_ids.length >= 2));
  assert.ok(entries.every((entry) => entry.source_ids.length >= 2));
});

test('global conflicts stay distinct from Oslo decision, protest and ceremony anchors', () => {
  const splitEurope = entries.find((entry) => entry.theory_id === 'theory_his_delt_europa_ostblokk_1989');
  assert.ok(splitEurope.claim_ids.includes('claim_his_uio_walesa_solidarity_human_rights_1983'));
  assert.ok(splitEurope.claim_ids.includes('claim_his_oslo_radhus_gorbachev_east_west_change_1990_1991'));
  assert.match(claims.get('claim_his_oslo_radhus_gorbachev_east_west_change_1990_1991').statement, /ikke at murens fall.*én årsak/);

  const proxy = entries.find((entry) => entry.theory_id === 'theory_his_stedfortrederkriger_globale_konflikter');
  assert.ok(proxy.claim_ids.includes('claim_his_eidsvolls_plass_vietnam_demonstration_1968'));
  assert.ok(proxy.claim_ids.includes('claim_his_uio_vietnam_ceasefire_prize_contestation_1973'));
});

test('atom evidence separates state capacity, public petition and expert mobilization', () => {
  const entry = entries.find((candidate) => candidate.theory_id === 'theory_his_atomvapen_avskrekking_opprustning');
  assert.deepEqual(new Set(entry.claim_ids), new Set([
    'claim_his_ffi_created_1946_postwar_modernization',
    'claim_his_storting_nuclear_free_nordic_zone_petition_1982',
    'claim_his_uio_ippnw_nuclear_war_awareness_1985',
  ]));
});

test('rural modernization preserves the local-museum and national-synthesis boundary', () => {
  const rural = entries.find((entry) => entry.theory_id === 'theory_his_bonder_fiskere_bygdesamfunn_modernisering');
  assert.ok(rural.case_ids.includes('case_his_gamle_hvam_museum'));
  assert.match(claims.get('claim_his_gamle_hvam_primary_sector_mechanization_1945_1970').statement, /ikke som direkte bevis/);
  assert.match(claims.get('claim_his_gamle_hvam_exhibition_old_to_modern_agriculture').statement, /kuraterte fortellingen/);
});

test('dossier scope exactly matches the qualified final-domain theories and cases', () => {
  assert.deepEqual(new Set(dossier.scope.qualified_theory_ids), targetTheoryIds);
  assert.deepEqual(new Set(dossier.scope.case_ids), new Set(entries.flatMap((entry) => entry.case_ids)));
});

test('History CI permanently runs the final-domain validator and regressions', () => {
  const workflow = fs.readFileSync('.github/workflows/history-theory-evidence.yml', 'utf8');
  for (const file of [
    'tools/validate-historie-kald-krig-etterkrig.mjs',
    'tests/historie-cold-war-postwar-evidence.test.mjs',
    'data/fag/historie/source_dossiers/cold_war_postwar_v1.json',
  ]) assert.ok(workflow.includes(file), `History CI does not include ${file}`);
});
