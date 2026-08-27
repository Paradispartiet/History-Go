import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const claims = readJson('data/fag/historie/claims_historie_canonical_v1.json').claims;
const registry = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json').entries;
const dossier = readJson('data/fag/historie/source_dossiers/global_colonial_transnational_v1.json');
const historyEvidenceWorkflow = fs.readFileSync('.github/workflows/history-theory-evidence.yml', 'utf8');
const mainIntegrityWorkflow = fs.readFileSync('.github/workflows/main-integrity.yml', 'utf8');
const claimById = new Map(claims.map((claim) => [claim.claim_id, claim]));

const targetTheoryIds = new Set(theories
  .filter((theory) => theory.explanatory_scope.includes('his_global_kolonial_transnasjonal'))
  .map((theory) => theory.theory_id));

test('global, colonial and transnational History qualifies the complete ten-object domain', () => {
  assert.equal(targetTheoryIds.size, 10);
  const entries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  assert.equal(entries.length, 10);
  assert.deepEqual(new Set(dossier.scope.qualified_theory_ids), targetTheoryIds);
});

test('dossier case scope exactly matches the final ten evidence bundles', () => {
  const targetEntries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  const finalCaseIds = new Set(targetEntries.flatMap((entry) => entry.case_ids));
  assert.deepEqual(new Set(dossier.scope.case_ids), finalCaseIds);
  assert.ok(dossier.scope.case_ids.includes('case_his_folkets_hus'));
  assert.ok(dossier.scope.case_ids.includes('case_his_hjula_vaeveri'));
  assert.ok(dossier.scope.case_ids.includes('case_his_universitetet_i_oslo'));
  assert.ok(!dossier.scope.case_ids.includes('case_his_eidsvolls_plass'));
  assert.ok(!dossier.scope.case_ids.includes('case_his_blitz'));
  assert.ok(!dossier.scope.case_ids.includes('case_his_norsk_folkemuseum_sami_collections_repatriation'));
});

test('each global-domain theory uses at least two cases linked to its own emne', () => {
  const theoryById = new Map(theories.map((theory) => [theory.theory_id, theory]));
  for (const theoryId of targetTheoryIds) {
    const theory = theoryById.get(theoryId);
    const entry = registry.find((candidate) => candidate.theory_id === theoryId);
    const targetEmneId = `em_${theory.source_hook_id}`;
    const topicCases = new Set(entry.claim_ids
      .map((claimId) => claimById.get(claimId))
      .filter((claim) => claim?.emne_ids.includes(targetEmneId))
      .flatMap((claim) => claim.scope.case_ids));
    assert.ok(topicCases.size >= 2, `${theoryId} has only ${topicCases.size} topic-specific cases`);
    assert.ok(entry.claim_ids.length >= 3, `${theoryId} has fewer than three claims`);
  }
});

test('decolonization uses a political transition case rather than trade or museum repatriation', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_global_kolonial_avkolonisering_og_utviklingspolitikk');
  const targetEmneId = 'em_his_global_kolonial_avkolonisering_og_utviklingspolitikk';
  const baastedeClaim = claimById.get('claim_his_norsk_folkemuseum_baastede_transfer_1600_items');
  assert.ok(entry.claim_ids.includes('claim_his_oslo_radhus_mandela_deklerk_democratic_transition_1993'));
  assert.ok(entry.case_ids.includes('case_his_oslo_radhus'));
  assert.ok(entry.case_ids.includes('case_his_stortinget'));
  assert.ok(!entry.claim_ids.includes('claim_his_fredensborg_danish_norwegian_triangle_trade_1767_1768'));
  assert.ok(!entry.claim_ids.includes('claim_his_norsk_folkemuseum_baastede_transfer_1600_items'));
  assert.ok(!baastedeClaim.emne_ids.includes(targetEmneId));
  assert.match(entry.rationale, /demokratisk Sør-Afrika/);
});

test('the value-chain theory uses an independent production and labour case', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_global_kolonial_slaveri_ravarer_og_globale_verdikjeder');
  const targetEmneId = 'em_his_global_kolonial_slaveri_ravarer_og_globale_verdikjeder';
  const mosqueClaim = claimById.get('claim_his_central_jam_e_mosque_member_finance_transnational_materials_1991_2024');
  const hjulaClaim = claimById.get('claim_his_hjula_transnational_textile_value_chain_1849_1918');

  assert.ok(entry.claim_ids.includes(hjulaClaim.claim_id));
  assert.ok(entry.case_ids.includes('case_his_hjula_vaeveri'));
  assert.ok(!entry.claim_ids.includes(mosqueClaim.claim_id));
  assert.ok(!mosqueClaim.emne_ids.includes(targetEmneId));
  assert.ok(hjulaClaim.emne_ids.includes(targetEmneId));
  assert.match(hjulaClaim.statement, /lavtlønte kvinner/);
  assert.match(hjulaClaim.statement, /svenske kunder/);
  assert.match(hjulaClaim.statement, /bomull og ull/);
  assert.match(entry.rationale, /engelske maskiner/);
});

test('the global-war theory documents imperial troop, labour and logistics mobilization', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_global_kolonial_globale_kriger_og_internasjonale_organisasjoner');
  const mobilizationClaim = claimById.get('claim_his_uio_noel_baker_colonial_troops_labour_logistics_1915_1959');
  const organizationClaim = claimById.get('claim_his_uio_noel_baker_wars_league_un_sequence_1914_1959');

  assert.ok(entry.claim_ids.includes(mobilizationClaim.claim_id));
  assert.ok(entry.claim_ids.includes(organizationClaim.claim_id));
  assert.ok(entry.claim_ids.includes('claim_his_hjula_transnational_textile_value_chain_1849_1918'));
  assert.ok(entry.case_ids.includes('case_his_universitetet_i_oslo'));
  assert.ok(entry.source_ids.includes('src_his_iwm_british_west_indies_regiment_wwi'));
  assert.ok(entry.source_ids.includes('src_his_nobel_noel_baker_1959_lecture'));
  assert.match(mobilizationClaim.statement, /kolonitropper/);
  assert.match(mobilizationClaim.statement, /ammunisjonstransport/);
  assert.match(mobilizationClaim.statement, /rasialisert arbeidsdeling/);
  assert.match(entry.rationale, /Ypres og Somme/);
  assert.match(entry.disconfirmation_conditions.join(' '), /dokumenteres uavhengig/);
});

test('transnational-movement evidence uses two topic-specific cases with named cross-border channels', () => {
  const entry = registry.find((candidate) => candidate.theory_id === 'theory_his_global_kolonial_transnasjonale_bevegelser_medier_og_solidaritetsnettverk');
  const targetEmneId = 'em_his_global_kolonial_transnasjonale_bevegelser_medier_og_solidaritetsnettverk';
  const vietnamClaim = claimById.get('claim_his_eidsvolls_plass_vietnam_demonstration_1968');
  const topicCases = new Set(entry.claim_ids
    .map((claimId) => claimById.get(claimId))
    .filter((claim) => claim?.emne_ids.includes(targetEmneId))
    .flatMap((claim) => claim.scope.case_ids));

  assert.ok(entry.claim_ids.includes('claim_his_folkets_hus_nocosa_shipping_boycott_network_1967_1993'));
  assert.ok(entry.claim_ids.includes('claim_his_nobel_institute_nansen_famine_relief_network_1921_1922'));
  assert.ok(entry.claim_ids.includes('claim_his_norsk_folkemuseum_pakistan_kharian_network_flow_1967_1975'));
  assert.ok(!entry.claim_ids.includes('claim_his_oslo_radhus_lutuli_anti_apartheid_network_1961_1967'));
  assert.ok(!entry.claim_ids.includes('claim_his_eidsvolls_plass_vietnam_demonstration_1968'));
  assert.ok(!vietnamClaim.emne_ids.includes(targetEmneId));
  assert.deepEqual(topicCases, new Set(['case_his_folkets_hus', 'case_his_nobel_institute_nansen_postwar_order']));
  assert.match(entry.rationale, /boikott/);
  assert.match(entry.rationale, /Shipping Research Bureau/);
  assert.match(entry.rationale, /48 Røde Kors-/);
  assert.match(entry.rationale, /reiseruter og finansiering/);
  assert.match(entry.disconfirmation_conditions.join(' '), /separate grensekryssende kanaler/);
});

test('collection and decision institutions remain anchors rather than foreign event locations', () => {
  assert.ok(dossier.production_decisions.some((decision) => decision.includes('lokaliseres ikke til dagens bygg')));
  assert.ok(dossier.production_decisions.some((decision) => decision.includes('gjennomføring og virkninger i andre land')));
  assert.ok(dossier.production_decisions.some((decision) => decision.includes('oppbevarings- og dokumentasjonsanker')));
  assert.ok(dossier.production_decisions.some((decision) => decision.includes('Nobelinstituttet brukes som kilde- og institusjonsanker')));
  for (const claimId of [
    'claim_his_fredensborg_danish_norwegian_triangle_trade_1767_1768',
    'claim_his_nb_santali_authored_manuscripts_local_knowledge_agency',
    'claim_his_storting_india_fund_un_india_norway_1952',
  ]) {
    const claim = claimById.get(claimId);
    assert.ok(claim, `missing ${claimId}`);
    assert.deepEqual(claim.scope.geography_ids, ['geo_no_oslo_akershus']);
    assert.ok(claim.uncertainty.note.length > 40);
    assert.ok(claim.alternative_interpretations.length >= 1);
  }
});

test('History CI owns delegated validation on pull requests without duplicating it after merge', () => {
  for (const path of [
    'tools/validate-historie-domain.mjs',
    'data/fag/historie/historiepensum_canonical_v4_5.json',
    'data/fag/historie/emner_historie_canonical_v4_5.json',
    'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
    'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  ]) {
    const pathFilter = `- '${path}'`;
    assert.equal(historyEvidenceWorkflow.split(pathFilter).length - 1, 1, `${path} must be watched once on pull requests`);
  }
  assert.doesNotMatch(historyEvidenceWorkflow, /^  push:/m);
  assert.match(mainIntegrityWorkflow, /node scripts\/audit-ci-workflow-routing\.mjs/);
  assert.match(historyEvidenceWorkflow, /node tools\/validate-historie-global-kolonial-transnasjonal\.mjs/);
  assert.match(historyEvidenceWorkflow, /node --test .*historie-global-colonial-transnational-evidence\.test\.mjs/);
});
