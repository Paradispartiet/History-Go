import test from 'node:test';
import assert from 'node:assert/strict';
import {auditHealthCumulativeProgressV1}from'../scripts/audit-helse-cumulative-progress-v1.mjs';
test('Helse bevarer ti komplette source-first-enheter kumulativt',()=>{const r=auditHealthCumulativeProgressV1();assert.equal(r.completedDomains,10);assert.equal(r.targetDomains,12);assert.equal(r.strictCompletionClaimed,false);assert.equal(r.units.length,10);assert.ok(r.units.every(u=>u.modules===4&&u.sections===8&&u.paragraphs===32&&u.claims===32&&u.questions===8));assert.ok(r.units.slice(0,8).every(u=>u.sources===14));assert.equal(r.units[8].sources,15);assert.equal(r.units[9].sources,15);});
