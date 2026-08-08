import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditScenekunstPhase3 } from '../scripts/audit-fagverk-scenekunst-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Scenekunst er individuelt materialisert og auditert som Fase 3-fag', () => {
  const { report } = auditScenekunstPhase3();
  assert.deepEqual(report.subject, {
    id: 'scenekunst',
    title: 'Scenekunst',
    schemaFamily: 'foundation_v1',
    adapter: 'standard',
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'structure_ready',
    nextGate: 'chapter_production',
    subjectPage: 'fagverk.html?subject=scenekunst',
    badgePage: 'data/fag/scenekunst/merke_scenekunst.html'
  });
  assert.deepEqual(report.summary, {
    domainCount: 4,
    emneCount: 8,
    methodCount: 9,
    mappingCount: 8,
    hookCount: 0,
    courseModuleCount: 3,
    registeredChapterCount: 0
  });
});

test('fagkartet eier fire Scenekunst-områder uten syntetiske hooks', () => {
  const { report, model } = auditScenekunstPhase3();
  assert.deepEqual(report.domainEmneCounts, {
    institusjon_repertoar: 1,
    verk_utover_form: 3,
    dans_hybrid_humor: 3,
    publikum_offentlighet: 1
  });
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'));
  assert.equal(report.gates.fagkartOwnsRendererDomains, true);
  assert.equal(report.summary.hookCount, 0);
});

test('alle åtte Scenekunst-emner har to løste metodekoblinger', () => {
  const { report, model } = auditScenekunstPhase3();
  assert.equal(model.emners.length, 8);
  assert.ok(model.emners.every((emne) => emne.methodIds.length === 2));
  assert.ok(model.emners.every((emne) => emne.methodIds.every((id) => model.methodsById.has(id))));
  assert.equal(report.gates.allMethodReferencesResolved, true);
});

test('pensummodulene er progresjon og ikke parallelle renderer-områder', () => {
  const { report } = auditScenekunstPhase3();
  assert.equal(report.summary.courseModuleCount, 3);
  assert.equal(report.gates.courseModulesRemainProgressionOnly, true);
  assert.equal(report.gates.allCourseModulesCoverCanonicalEmners, true);
});

test('Scenekunst-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/scenekunst/merke_scenekunst.html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=scenekunst/);
  assert.match(html, /Åpne Scenekunst-faget/);
});
