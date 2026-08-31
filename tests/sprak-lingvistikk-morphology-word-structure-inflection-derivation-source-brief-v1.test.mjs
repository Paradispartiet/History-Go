import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sprak-lingvistikk-morphology-word-structure-inflection-derivation-sources-v1.mjs';
test('Språk & lingvistikk felt 4 Morfologi er source-first klar uten å telle som materialisert',()=>{const r=audit();assert.equal(r.status,'pass_source_first_ready_not_materialized');assert.deepEqual(r.counts,{sources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedAssessments:8});assert.equal(r.six_part_quality_review.total,30);assert.equal(r.next_gate,'materialize_morphology_word_structure_inflection_derivation_fulltext');});
