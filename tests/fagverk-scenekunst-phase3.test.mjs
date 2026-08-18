import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenekunstPhase3 } from '../scripts/audit-fagverk-scenekunst-phase3.mjs';

test('Scenekunst bevarer Phase 3-foundation gjennom completion',()=>{ const {report}=auditScenekunstPhase3(); assert.equal(report.subject.id,'scenekunst'); assert.equal(report.subject.schemaFamily,'foundation_v1'); assert.equal(report.subject.editorialStatus,'complete'); assert.equal(report.summary.domainCount,4); assert.equal(report.summary.emneCount,20); assert.equal(report.summary.methodCount,14); assert.equal(report.summary.registeredChapterCount,4); assert.equal(report.gates.foundationIdsPreserved,true); assert.equal(report.gates.breadthInventoryReconciled,true); });
test('fagkartet beholder canonical 5/6/4/5-eierskap',()=>{ const {report}=auditScenekunstPhase3(); assert.deepEqual(report.domainEmneCounts,{institusjon_repertoar:5,verk_utover_form:6,dans_hybrid_humor:4,publikum_offentlighet:5}); });
