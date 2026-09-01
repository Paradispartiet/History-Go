import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-fulltext-v1.mjs';
test('Juss Felt 1 fulltekst har 4/8/32, 32 immutable claims og strict juridisk metode',()=>{const r=audit();assert.equal(r.status,'pass_fulltext_materialized_domain_ready_for_registry');assert.deepEqual(r.counts,{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6});assert.equal(r.six_part_quality_review.total,30);});
