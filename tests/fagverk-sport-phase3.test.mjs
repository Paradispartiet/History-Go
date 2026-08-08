import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSportPhase3 } from '../scripts/audit-fagverk-sport-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Sport er individuelt materialisert og auditert som Fase 3-fag', () => {
  const { report } = auditSportPhase3();
  assert.equal(report.subject.id, 'sport');
  assert.equal(report.subject.schemaFamily, 'standard_canonical');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'structure_ready');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.subjectPage, 'fagverk.html?subject=sport');
  assert.equal(report.subject.badgePage, 'data/fag/sport/merke_sport.html');
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 116,
    methodCount: 109,
    mappingCount: 116,
    hookCount: 60,
    registeredChapterCount: 0,
    explicitMappingRowCount: 116
  });
});

test('Sport beholder seks canonicale områder uten syntetiske fagområder', () => {
  const { report, model } = auditSportPhase3();
  assert.deepEqual(report.canonicalDomainOrder, [
    'arenaer_steder_groundhopper',
    'regler_spill_konkurranse',
    'kropp_trening_prestasjon',
    'klubber_lag_frivillighet',
    'supportere_publikum_kultur',
    'inkludering_helse_lek_samfunn'
  ]);
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'));
  assert.equal(Object.values(report.domainEmneCounts).reduce((sum, count) => sum + count, 0), 116);
});

test('alle Sport-emner er dekket i pensum, fagkart og mappingregister', () => {
  const { report, model } = auditSportPhase3();
  assert.equal(model.emners.length, 116);
  assert.equal(report.gates.allCanonicalEmnersInPensum, true);
  assert.equal(report.gates.allCanonicalEmnersInFagkart, true);
  assert.equal(report.gates.allCanonicalEmnersInMappingRegistry, true);
  assert.equal(report.gates.allMethodReferencesResolved, true);
});

test('Sport beholder source-first, Knowledge og Groundhopper-kontraktene', () => {
  const { report } = auditSportPhase3();
  assert.equal(report.gates.generatorCountsSynchronized, true);
  assert.equal(report.gates.knowledgeContractsPreserved, true);
  assert.equal(report.gates.sourceFirstGenerationLocked, true);
  assert.equal(report.gates.groundhopperPlaceLogicPreserved, true);
});

test('Sport-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/sport/merke_sport.html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=sport/);
  assert.match(html, /Åpne Sport-faget/);
});
