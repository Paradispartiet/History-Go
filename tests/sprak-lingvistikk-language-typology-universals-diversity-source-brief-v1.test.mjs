import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sprak-lingvistikk-language-typology-universals-diversity-sources-v1.mjs';

test('Språk & lingvistikk felt 10 Språktypologi er kilde-først og ikke materialisert', () => {
  const r=audit();
  assert.equal(r.status,'pass_source_first_ready_not_materialized');
  assert.deepEqual(r.counts,{sources:13,topics:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6});
  assert.equal(Object.values(r.gates).every(Boolean),true);
  assert.equal(r.next_gate,'language_typology_universals_diversity_fulltext');
});
