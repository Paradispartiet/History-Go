import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditVitenskapPilot } from '../scripts/audit-fagverk-vitenskap-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Vitenskap er materialisert og auditert som structure-ready pilot', () => {
  const { report } = auditVitenskapPilot();
  assert.equal(report.subject.id, 'vitenskap');
  assert.equal(report.subject.schemaFamily, 'standard_canonical');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'structure_ready');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.deepEqual(report.emneStatusCounts, { active: 89, core: 4 });
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 93,
    methodCount: 84,
    mappingCount: 93,
    hookCount: 60,
    registeredChapterCount: 0,
    technologyDomainCount: 12,
    technologyEmneCount: 48,
    technologyMethodCount: 35,
    technologyMappingCount: 48,
    technologyHookCount: 36,
    technologyProgressionModuleCount: 12
  });
});

test('alle 93 Vitenskap-emner er integrert uten kunstige fagområder', () => {
  const { report, model } = auditVitenskapPilot();
  assert.equal(Object.values(report.domainEmneCounts).reduce((sum, count) => sum + count, 0), 93);
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'));
  assert.ok(model.emners.every((emne) => emne.methodIds.length >= 2));
  assert.equal(report.gates.allVitenskapEmnersIntegrated, true);
  assert.equal(report.gates.explicitMappingAndGeneratorCountsSynchronized, true);
  assert.equal(report.gates.noSyntheticVitenskapDomains, true);
  assert.equal(report.gates.vitenskapPlaceFallbackCorrect, true);
});

test('Teknologi forblir nested spesialisering uten toppnivårute eller eget merke', () => {
  const { report, technology } = auditVitenskapPilot();
  assert.deepEqual(report.specialization, {
    id: 'teknologi',
    canonicalParentSubject: 'vitenskap',
    badgeId: 'vitenskap',
    schemaFamily: 'technology_scientific_v2_4',
    adapter: 'technology',
    topLevelRoute: '',
    scientificStatus: 'canonical_scientific_subject'
  });
  assert.ok(technology.domains.every((domain) => domain.sourceKind === 'fagkart_category'));
  assert.equal(report.gates.technologyRemainsNestedSpecialization, true);
  assert.equal(report.gates.technologyHasNoTopLevelRouteOrBadge, true);
});

test('Vitenskap-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/vitenskap/merke_vitenskap (2).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=vitenskap/);
  assert.match(html, /Åpne Vitenskap-faget/);
  assert.doesNotMatch(html, /fagverk\.html\?subject=teknologi/);
});
