import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionTheoryCanon } from '../scripts/audit-fagverk-religion-theory-canon.mjs';

test('Religion theory canon dekker 12 områder og 72 canonicale emner',()=>{const r=auditReligionTheoryCanon();assert.equal(r.status,'strong_theory_canon');assert.equal(r.areaCount,12);assert.equal(r.canonicalTopicCount,72);assert.equal(r.coveredTopicCount,72);assert.equal(r.theoryObjectCount,12);assert.equal(r.canonicalArticleCount,72);});
test('Religion theory canon har bred forsker- og verkprovenance',()=>{const r=auditReligionTheoryCanon();assert.ok(r.uniquePeopleCount>=35);assert.ok(r.uniqueWorkCount>=35);});
test('Religion theory objects har scholarly core og alle kilder er brukt i canonical theory prose',()=>{const r=auditReligionTheoryCanon();assert.ok(r.theorySourceCount>0);assert.equal(r.scholarlyCoreObjectCount,12);assert.ok(r.scholarlyTheorySourceCount>=Math.ceil(r.theorySourceCount/2));assert.equal(r.proseBoundTheorySourceCount,r.theorySourceCount);assert.ok(r.proseTheoryEntryCount>=72);assert.ok(r.proseBoundClaimCount>=72);});
