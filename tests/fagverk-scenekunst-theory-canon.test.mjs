import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenekunstTheoryCanon } from '../scripts/audit-fagverk-scenekunst-theory-canon.mjs';

test('Scenekunst theory canon dekker alle 20 canonicale emner',()=>{const r=auditScenekunstTheoryCanon();assert.equal(r.status,'strong_theory_canon');assert.equal(r.canonicalEmneCount,20);assert.equal(r.coveredEmneCount,20);});
test('Scenekunst theory canon dekker 4/4 canonicale hovedfelt',()=>{const r=auditScenekunstTheoryCanon();assert.equal(r.canonicalFieldCount,4);assert.equal(r.coveredFieldCount,4);});
test('Scenekunst theory canon har reell teoretiker- og verkbredde',()=>{const r=auditScenekunstTheoryCanon();assert.ok(r.theoryObjectCount>=12);assert.ok(r.uniquePeopleCount>=12);assert.ok(r.uniqueWorkCount>=10);});
test('Scenekunst theory objects har scholarly source quality og actual prose binding',()=>{const r=auditScenekunstTheoryCanon();assert.equal(r.scholarlyTheoryObjectCount,r.theoryObjectCount);assert.equal(r.proseBoundTheoryObjectCount,r.theoryObjectCount);assert.ok(r.proseBoundEmneCount>=20);});
