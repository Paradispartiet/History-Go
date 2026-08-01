import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const claims = readJson('data/fag/historie/claims_historie_canonical_v1.json').claims;
const registry = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json').entries;
const claimById = new Map(claims.map((claim) => [claim.claim_id, claim]));

const targetTheoryIds = new Set([
  'theory_his_imperialisme_allianser_krigsutbrudd',
  'theory_his_fronter_total_krig_teknologi',
  'theory_his_global_kolonial_verdenskrig',
  'theory_his_sivilsamfunn_krigsokonomi_hverdagsliv',
  'theory_his_norge_norden_noytralitet_sjofart',
  'theory_his_revolusjon_imperieopplosning_fredsoppgjor',
  'theory_his_demokrati_massepolitikk_sosial_konflikt',
  'theory_his_idehistorie_fascisme_nazisme_kommunisme',
  'theory_his_store_depresjonen_arbeidsloshet_politikk',
  'theory_his_kultur_modernisme_kunst_visuell_politikk',
]);

const deferredTheoryIds = [];

test('WWI/interwar qualifies the complete ten-object domain', () => {
  const entries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  assert.equal(entries.length, 10);
  for (const theoryId of deferredTheoryIds) {
    assert.equal(registry.some((entry) => entry.theory_id === theoryId), false);
  }
});

test('each qualified WWI/interwar theory has at least two cases linked to its own emne', () => {
  const theoryById = new Map(theories.map((theory) => [theory.theory_id, theory]));
  for (const theoryId of targetTheoryIds) {
    const theory = theoryById.get(theoryId);
    const entry = registry.find((candidate) => candidate.theory_id === theoryId);
    assert.ok(theory, `missing frozen theory ${theoryId}`);
    assert.ok(entry, `missing evidence entry ${theoryId}`);
    const targetEmneId = `em_${theory.source_hook_id}`;
    const topicCases = new Set(entry.claim_ids
      .map((claimId) => claimById.get(claimId))
      .filter((claim) => claim?.emne_ids.includes(targetEmneId))
      .flatMap((claim) => claim.scope.case_ids));
    assert.ok(topicCases.size >= 2, `${theoryId} has only ${topicCases.size} topic-specific cases`);
    assert.equal(topicCases.has('case_his_oslo_radhus'), false, `${theoryId} reuses generic Oslo rådhus evidence`);
  }
});

test('collection institutions are represented as anchors rather than event locations', () => {
  const dossier = readJson('data/fag/historie/source_dossiers/first_world_war_interwar_v1.json');
  assert.ok(dossier.production_decisions.some((decision) => decision.includes('lokaliseres ikke til dagens bygg')));
  assert.deepEqual(new Set(dossier.scope.deferred_theory_ids), new Set(deferredTheoryIds));
});

test('dossier case scope exactly matches all ten final evidence bundles', () => {
  const dossier = readJson('data/fag/historie/source_dossiers/first_world_war_interwar_v1.json');
  const finalCaseIds = new Set(registry
    .filter((entry) => targetTheoryIds.has(entry.theory_id))
    .flatMap((entry) => entry.case_ids));
  assert.deepEqual(new Set(dossier.scope.case_ids), finalCaseIds);
});

test('outbreak evidence separates alliances and July-crisis decisions from Norwegian reactions', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_imperialisme_allianser_krigsutbrudd');
  assert.ok(entry.claim_ids.includes('claim_his_uio_noel_baker_arms_alliances_outbreak_1914_1959'));
  assert.ok(entry.claim_ids.includes('claim_his_storting_july_crisis_outbreak_sanitary_mobilization_1914'));
  assert.ok(entry.source_ids.includes('src_his_iwm_world_went_to_war_1914'));
  assert.deepEqual(
    new Set(entry.case_ids),
    new Set(['case_his_norsk_maritimt_museum', 'case_his_stortinget', 'case_his_universitetet_i_oslo']),
  );
});

test('front and total-war evidence combines trenches with distinct home-front chains', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_fronter_total_krig_teknologi');
  assert.ok(entry.claim_ids.includes('claim_his_uio_modern_weapons_trenches_gas_1914_1959'));
  assert.ok(entry.claim_ids.includes('claim_his_hjula_wage_supplement_material_stop_1914_1918'));
  assert.ok(entry.claim_ids.includes('claim_his_storting_july_crisis_outbreak_sanitary_mobilization_1914'));
  assert.ok(entry.case_ids.includes('case_his_universitetet_i_oslo'));
  assert.ok(entry.case_ids.includes('case_his_hjula_vaeveri'));
});

test('global-war evidence names imperial fronts, colonial mobilization and shipping', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_global_kolonial_verdenskrig');
  assert.ok(entry.claim_ids.includes('claim_his_nmm_iwm_global_imperial_fronts_shipping_1914_1918'));
  assert.ok(entry.claim_ids.includes('claim_his_uio_noel_baker_colonial_troops_labour_logistics_1915_1959'));
  assert.ok(entry.source_ids.includes('src_his_iwm_first_world_war_global_total_war'));
  assert.ok(entry.source_ids.includes('src_his_iwm_british_west_indies_regiment_wwi'));
  assert.deepEqual(
    new Set(entry.case_ids),
    new Set(['case_his_hjula_vaeveri', 'case_his_norsk_maritimt_museum', 'case_his_universitetet_i_oslo']),
  );
});

test('History CI runs the WWI/interwar validator and regression suite', () => {
  const workflow = fs.readFileSync('.github/workflows/history-theory-evidence.yml', 'utf8');
  for (const requiredPath of [
    'tools/validate-historie-forste-verdenskrig-mellomkrig.mjs',
    'tests/historie-first-world-war-interwar-evidence.test.mjs',
    'data/fag/historie/source_dossiers/first_world_war_interwar_v1.json',
  ]) {
    assert.ok(workflow.includes(requiredPath), `History CI does not watch or invoke ${requiredPath}`);
  }
});
