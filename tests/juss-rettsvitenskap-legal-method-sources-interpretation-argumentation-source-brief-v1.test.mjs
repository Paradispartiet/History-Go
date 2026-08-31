import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/brief-juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-sources-v1.mjs';
test('Juss felt 1 source-first er strengt kilde- og metodebundet uten materialisering',()=>{const r=audit();assert.equal(r.status,'pass');assert.deepEqual(r.counts,{sources:13,topics:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6,materializedDomains:0,targetDomains:12});assert.equal(r.gates.notMaterialized,true);assert.equal(r.six_part_quality_review.total,29);});
