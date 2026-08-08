import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPsykologiPhase3 } from '../scripts/audit-fagverk-psykologi-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Psykologi er individuelt materialisert og auditert som Fase 3-fag', () => {
  const { report } = auditPsykologiPhase3();
  assert.deepEqual(report.subject, {
    id: 'psykologi',
    title: 'Psykologi',
    schemaFamily: 'standard_canonical',
    adapter: 'standard',
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'structure_ready',
    nextGate: 'chapter_production',
    subjectPage: 'fagverk.html?subject=psykologi',
    badgePage: 'data/fag/psykologi/merke_psykologi (1).html'
  });
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 58,
    methodCount: 58,
    mappingCount: 58,
    hookCount: 60,
    registeredChapterCount: 0,
    explicitMappingRowCount: 58
  });
});

test('alle 58 Psykologi-emner er dekket uten syntetiske fagområder', () => {
  const { report, model } = auditPsykologiPhase3();
  assert.deepEqual(report.canonicalDomainOrder, [
    'psykisk_helse_institusjoner_behandling',
    'fagtradisjoner_teori_sinnet',
    'utvikling_oppvekst_laring',
    'kognisjon_folelser_atferd',
    'sosialpsykologi_normalitet_stigma',
    'traume_krise_resiliens_omsorg'
  ]);
  assert.equal(Object.values(report.domainEmneCounts).reduce((sum, count) => sum + count, 0), 58);
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'));
  assert.equal(report.gates.allCanonicalEmnersInPensum, true);
  assert.equal(report.gates.allCanonicalEmnersInFagkart, true);
  assert.equal(report.gates.allCanonicalEmnersInMappingRegistry, true);
});

test('Psykologi-metoder, mappings og generator er synkronisert', () => {
  const { report, model } = auditPsykologiPhase3();
  assert.equal(model.methods.length, 58);
  assert.equal(model.emners.length, 58);
  assert.ok(model.emners.every((emne) => emne.methodIds.length >= 1));
  assert.equal(report.gates.allMethodReferencesResolved, true);
  assert.equal(report.gates.generatorCountsSynchronized, true);
  assert.equal(report.gates.doNotDiagnosePeopleGuardPresent, true);
});

test('Psykologi-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/psykologi/merke_psykologi (1).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=psykologi/);
  assert.match(html, /Åpne Psykologi-faget/);
});
