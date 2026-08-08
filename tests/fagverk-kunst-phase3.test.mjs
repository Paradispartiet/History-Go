import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditKunstPhase3 } from '../scripts/audit-fagverk-kunst-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Kunst er individuelt materialisert og auditert som første Fase 3-fag', () => {
  const { report } = auditKunstPhase3();
  assert.deepEqual(report.subject, {
    id: 'kunst',
    title: 'Kunst & kultur',
    schemaFamily: 'standard_canonical',
    adapter: 'standard',
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'structure_ready',
    nextGate: 'chapter_production',
    subjectPage: 'fagverk.html?subject=kunst',
    badgePage: 'data/fag/kunst/merke_kunst (2).html'
  });
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 21,
    methodCount: 21,
    mappingCount: 21,
    hookCount: 60,
    registeredChapterCount: 0,
    explicitMappingRowCount: 21
  });
  assert.deepEqual(report.emneStatusCounts, { active: 21 });
});

test('alle Kunst-emner er integrert uten kunstige fagområder', () => {
  const { report, model } = auditKunstPhase3();
  assert.equal(Object.values(report.domainEmneCounts).reduce((sum, count) => sum + count, 0), 21);
  assert.deepEqual(report.domainEmneCounts, {
    felt_institusjon: 4,
    produksjon_praksis: 5,
    estetisk_sprak_form: 4,
    makt_legitimitet: 3,
    publikum_offentlighet: 3,
    tid_transformasjon: 2
  });
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'));
  assert.ok(model.emners.every((emne) => emne.methodIds.length >= 1));
  assert.equal(report.gates.noSyntheticKunstDomains, true);
  assert.equal(report.gates.explicitMappingAndGeneratorCountsSynchronized, true);
});

test('materialitet, teknikk og håndverk bruker eksisterende Kunst-område og hooks', () => {
  const { report, model } = auditKunstPhase3();
  const emne = model.emnersById.get('em_kunst_materialitet_teknikk_handverk');
  assert.equal(emne.domainId, 'produksjon_praksis');
  assert.deepEqual([...emne.methodIds], [
    'met_kunst_materialitetsanalyse',
    'met_kunst_praksis_og_prosessanalyse',
    'met_kunst_atelier_og_arbeidsanalyse',
    'met_kunst_formanalyse'
  ]);
  assert.equal(report.gates.handverkEmneIntegratedInExistingDomainAndHooks, true);
});

test('Kunst-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/kunst/merke_kunst (2).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=kunst/);
  assert.match(html, /Åpne Kunst-faget/);
});
