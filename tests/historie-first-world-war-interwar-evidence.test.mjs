import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const claims = readJson('data/fag/historie/claims_historie_canonical_v1.json').claims;
const registry = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json').entries;
const claimById = new Map(claims.map((claim) => [claim.claim_id, claim]));

const targetTheoryIds = new Set([
  'theory_his_sivilsamfunn_krigsokonomi_hverdagsliv',
  'theory_his_norge_norden_noytralitet_sjofart',
  'theory_his_revolusjon_imperieopplosning_fredsoppgjor',
  'theory_his_demokrati_massepolitikk_sosial_konflikt',
  'theory_his_idehistorie_fascisme_nazisme_kommunisme',
  'theory_his_store_depresjonen_arbeidsloshet_politikk',
  'theory_his_kultur_modernisme_kunst_visuell_politikk',
]);

const deferredTheoryIds = [
  'theory_his_imperialisme_allianser_krigsutbrudd',
  'theory_his_fronter_total_krig_teknologi',
  'theory_his_global_kolonial_verdenskrig',
];

test('WWI/interwar phase 1 qualifies exactly the seven evidence-supported theories', () => {
  const entries = registry.filter((entry) => targetTheoryIds.has(entry.theory_id));
  assert.equal(entries.length, 7);
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
