import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenekunstCompletion } from '../scripts/audit-fagverk-scenekunst-completion.mjs';

test('Scenekunst holistic completion låser 4/20/14 og full claim trace',()=>{const r=auditScenekunstCompletion();assert.deepEqual(r.summary.chapterCount,4);assert.equal(r.summary.canonicalEmneCount,20);assert.equal(r.summary.usedMethodCount,14);assert.equal(r.summary.sectionCount,20);assert.equal(r.summary.paragraphCount,60);assert.equal(r.summary.claimCount,60);assert.equal(r.gates.paragraphClaimTraceComplete,true);});
test('Scenekunst completion låser fagkartets 5/6/4/5-eierskap',()=>{const r=auditScenekunstCompletion();assert.deepEqual(r.domainOwnership,{institusjon_repertoar:5,verk_utover_form:6,dans_hybrid_humor:4,publikum_offentlighet:5});assert.equal(r.gates.noDuplicateOwnership,true);});
test('Scenekunst completion krever kilder, begrensninger, etikk og redaksjonell egenart',()=>{const r=auditScenekunstCompletion();for(const key of ['allSourcesInspectable','noDuplicateOrGenericTemplates','neighborBoundariesPreserved','archiveStatisticsReceptionLimitsExplicit','ethicsRepresentationAccessibilitySubstantive','qualityReviewGreen'])assert.equal(r.gates[key],true);assert.ok(r.summary.qualityScore>=27);});
