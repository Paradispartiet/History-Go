import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturTheoryAttribution } from '../scripts/audit-subkultur-theory-attribution-v1.mjs';

test('Subkultur attribution dekker 80 theory objects og 8 domener',()=>{const r=auditSubkulturTheoryAttribution();assert.equal(r.status,'strong_theory_attribution');assert.equal(r.theoryCount,80);assert.equal(r.coveredEmneCount,80);assert.equal(r.domainCount,8);});
test('Subkultur har reell forsker- og verkbredde',()=>{const r=auditSubkulturTheoryAttribution();assert.ok(r.uniquePeopleCount>=20);assert.ok(r.uniqueWorkCount>=15);assert.ok(r.attributedSourceCount>=15);});
test('Subkultur theory objects har scholarly kjerne og faktisk canonical prosa-binding',()=>{const r=auditSubkulturTheoryAttribution();assert.equal(r.scholarlyCoreTheoryCount,80);assert.equal(r.proseBoundTheoryCount,80);assert.ok(r.claimBoundSourceCount>=240);});
