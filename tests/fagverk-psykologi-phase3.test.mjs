import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPsykologiPhase3 } from '../scripts/audit-fagverk-psykologi-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROGRESS_ROUTE = 'fagverk.html?subject=psykologi#fagverkIaProgresjon';
const LEGACY_ARCHIVE = 'data/fag/psykologi/archive/merke_psykologi_legacy_20260829.html';
const COMPATIBILITY_PAGE = 'data/fag/psykologi/merke_psykologi (1).html';

test('Psykologi beholder canonical Fase 3-struktur gjennom redaksjonell produksjon', () => {
  const { report } = auditPsykologiPhase3();
  assert.equal(report.subject.id, 'psykologi');
  assert.equal(report.subject.title, 'Psykologi');
  assert.equal(report.subject.schemaFamily, 'standard_canonical');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.ok(['structure_ready', 'chapters_in_progress', 'complete', 'expanded_and_audited'].includes(report.subject.editorialStatus));
  assert.equal(report.subject.subjectPage, 'fagverk.html?subject=psykologi');
  assert.equal(report.subject.badgePage, PROGRESS_ROUTE);
  assert.deepEqual(
    {
      domainCount: report.summary.domainCount,
      emneCount: report.summary.emneCount,
      methodCount: report.summary.methodCount,
      mappingCount: report.summary.mappingCount,
      hookCount: report.summary.hookCount,
      explicitMappingRowCount: report.summary.explicitMappingRowCount
    },
    {
      domainCount: 6,
      emneCount: 58,
      methodCount: 58,
      mappingCount: 58,
      hookCount: 60,
      explicitMappingRowCount: 58
    }
  );
  assert.ok(report.summary.registeredChapterCount >= 0 && report.summary.registeredChapterCount <= 6);
  assert.equal(report.gates.editorialProgressConsistent, true);
  assert.equal(report.gates.canonicalStructurePreservedDuringChapterProduction, true);
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

test('Psykologi-merket er integrert i Progresjon mens original merkesidetekst er arkivert', () => {
  const compatibility = fs.readFileSync(path.join(root, COMPATIBILITY_PAGE), 'utf8');
  const archive = fs.readFileSync(path.join(root, LEGACY_ARCHIVE), 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /fagverk\.html\?subject=psykologi#fagverkIaProgresjon/);
  assert.match(compatibility, /fagverk-forside\.html/);
  assert.doesNotMatch(compatibility, /Åpne Psykologi-faget/);
  assert.match(archive, /Åpne Psykologi-faget/);
  assert.match(archive, /knowledge_psykologi\.html/);
});
