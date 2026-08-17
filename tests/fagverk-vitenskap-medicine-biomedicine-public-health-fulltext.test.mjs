import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapMedicineBiomedicinePublicHealthFulltext } from '../scripts/audit-fagverk-vitenskap-medicine-biomedicine-public-health-fulltext.mjs';

// Unit 5 closes breadth production, but the separate holistic audit still owns subject completion.
test('Vitenskap Unit 5 materialiserer medisin som femte kapittel uten premature completion',()=>{
 const report=auditVitenskapMedicineBiomedicinePublicHealthFulltext();
 assert.equal(report.status,'pass');
 assert.equal(report.chapterId,'vitenskap-medisin-fra-mekanisme-til-folkehelse');
 assert.deepEqual(report.summary,{emneCount:5,methodCount:9,moduleCount:3,sectionCount:9,paragraphCount:27,sourceCount:12,claimCount:20,misconceptionCount:4,workedExampleCount:2,applicationTaskCount:4,selfCheckCount:6,registeredChapterCount:5,remainingEditorialBlockerCount:0});
 assert.equal(report.gates.medicineChapterMaterializedAndRegistered,true);
 assert.equal(report.gates.allBreadthEditorialBlockersResolved,true);
 assert.equal(report.gates.prematureCompleteStillBlocked,true);
 assert.equal(report.gates.finalHolisticAuditRequired,true);
});

test('Vitenskap Unit 5 har reciprocal claim trace og bevart kildeintegritet',()=>{
 const report=auditVitenskapMedicineBiomedicinePublicHealthFulltext();
 assert.equal(report.gates.claimTraceReciprocalAndComplete,true);
 assert.equal(report.gates.sourceClaimIntegrityPreserved,true);
 assert.equal(report.summary.paragraphCount,27);
 assert.equal(report.summary.claimCount,20);
 assert.equal(report.summary.sourceCount,12);
});

test('Vitenskap Unit 5 låser medisinske evidensgrenser uten individuell rådgivning',()=>{
 const report=auditVitenskapMedicineBiomedicinePublicHealthFulltext();
 assert.equal(report.gates.modelTranslationBoundaryLocked,true);
 assert.equal(report.gates.diagnosticEvidenceBoundaryLocked,true);
 assert.equal(report.gates.trialEvidenceBoundaryLocked,true);
 assert.equal(report.gates.treatmentEffectBoundaryLocked,true);
 assert.equal(report.gates.epidemiologyCausalityBoundaryLocked,true);
 assert.equal(report.gates.noIndividualMedicalAdvice,true);
 assert.equal(report.gates.technologyRemainsNested,true);
});
