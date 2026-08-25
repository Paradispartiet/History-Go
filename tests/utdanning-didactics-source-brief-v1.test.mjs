import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-utdanning-didactics-sources-v1.mjs';
test('Didaktikk source-first har 13 verifiserte kilder, 8 spor og 32 planlagte claims',()=>{const r=audit();assert.deepEqual(r.counts,{verifiedSources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,modules:4});assert.ok(Object.values(r.gates).every(Boolean));assert.equal(r.six_part_quality_review.total,29);assert.equal(r.next_gate,'materialize_didaktikk_fulltext_with_reciprocal_claim_trace')});
