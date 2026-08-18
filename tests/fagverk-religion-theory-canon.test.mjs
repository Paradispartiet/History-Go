import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionTheoryCanon } from '../scripts/audit-fagverk-religion-theory-canon.mjs';

test('Religion theory canon dekker 12 områder og 72 canonicale emner',()=>{const r=auditReligionTheoryCanon();assert.equal(r.status,'strong_theory_canon');assert.equal(r.areaCount,12);assert.equal(r.canonicalTopicCount,72);assert.equal(r.coveredTopicCount,72);assert.equal(r.theoryObjectCount,12);});
test('Religion theory canon har bred forsker- og verkprovenance',()=>{const r=auditReligionTheoryCanon();assert.ok(r.uniquePeopleCount>=35);assert.ok(r.uniqueWorkCount>=35);});
