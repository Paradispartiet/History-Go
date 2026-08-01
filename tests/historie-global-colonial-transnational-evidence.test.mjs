import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const claims = readJson('data/fag/historie/claims_historie_canonical_v1.json').claims;
const registry = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json').entries;
const dossier = readJson('data/fag/historie/source_dossiers/global_colonial_transnational_v1.json');
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
