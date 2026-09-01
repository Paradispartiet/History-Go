import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/brief-juss-rettsvitenskap-constitutional-law-separation-powers-constitutional-review-sources-v1.mjs';
test('Juss Felt 2 Statsrett source-first er 13/8/32/8/6 og ikke materialisert',()=>{const r=audit();assert.equal(r.status,'pass_source_first_ready_not_materialized');assert.deepEqual(r.counts,{sources:13,topics:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6});assert.equal(r.gates.no_materialization,true);});
