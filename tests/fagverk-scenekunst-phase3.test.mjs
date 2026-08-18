import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditScenekunstPhase3 } from '../scripts/audit-fagverk-scenekunst-phase3.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('Scenekunst bevarer Phase 3-foundation etter universitetsbredde-reconciliation',()=>{
  const {report}=auditScenekunstPhase3();
  assert.equal(report.subject.id,'scenekunst'); assert.equal(report.subject.schemaFamily,'foundation_v1'); assert.equal(report.subject.editorialStatus,'structure_ready'); assert.equal(report.subject.nextGate,'chapter_production');
  assert.deepEqual(report.summary,{domainCount:4,emneCount:20,methodCount:14,mappingCount:20,hookCount:0,courseModuleCount:5,registeredChapterCount:0});
  assert.equal(report.gates.foundationIdsPreserved,true); assert.equal(report.gates.breadthInventoryReconciled,true); assert.equal(report.gates.chapterClaimsNotOverstated,true);
});

test('fagkartet beholder fire renderer-områder og eier alle 20 emner én gang',()=>{
  const {report,model}=auditScenekunstPhase3();
  assert.deepEqual(report.domainEmneCounts,{institusjon_repertoar:5,verk_utover_form:6,dans_hybrid_humor:4,publikum_offentlighet:5});
  assert.ok(model.domains.every((domain)=>domain.sourceKind==='fagkart_category')); assert.equal(report.summary.hookCount,0);
});

test('alle post-reconciliation-emner har minst tre løste metodekoblinger',()=>{
  const {report,model}=auditScenekunstPhase3(); assert.equal(model.emners.length,20); assert.ok(model.emners.every((emne)=>emne.methodIds.length>=3)); assert.ok(model.emners.every((emne)=>emne.methodIds.every((id)=>model.methodsById.has(id)))); assert.equal(report.gates.allMethodReferencesResolved,true);
});

test('progresjonsmodulene er separate fra renderer-fagområdene',()=>{ const {report}=auditScenekunstPhase3(); assert.equal(report.summary.courseModuleCount,5); assert.equal(report.gates.courseModulesRemainProgressionOnly,true); assert.equal(report.gates.allCourseModulesCoverCanonicalEmners,true); });

test('Scenekunst-merkesiden skiller merket fra fagsiden',()=>{ const html=fs.readFileSync(path.join(root,'data/fag/scenekunst/merke_scenekunst.html'),'utf8'); assert.match(html,/fagverk-forside\.html/); assert.match(html,/fagverk\.html\?subject=scenekunst/); assert.match(html,/Åpne Scenekunst-faget/); });
