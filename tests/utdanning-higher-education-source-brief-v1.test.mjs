import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-utdanning-higher-education-sources-v1.mjs';
test('Høyere utdanning source-first låser 13 kilder, 8 spor og 32 claims uten studenttyping eller indikatorfatalisme',()=>{const report=audit();assert.deepEqual(report.counts,{verifiedSources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,modules:4});assert.ok(Object.values(report.gates).every(Boolean));assert.equal(report.six_part_quality_review.total,29)});
