import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapUniversityReadiness } from '../scripts/audit-fagverk-vitenskap-university-readiness.mjs';

test('Vitenskap university readiness låser scope uten å overrapportere complete', () => {
  const { report } = auditVitenskapUniversityReadiness();
  assert.equal(report.subject.id, 'vitenskap');
  assert.equal(report.subject.title, 'Vitenskap & teknologi');
  assert.equal(report.subject.editorialStatus, 'structure_ready');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.coverageSummary.familyCount, 12);
  assert.deepEqual(report.coverageSummary.statusCounts, {
    strong: 4,
    gap: 4,
    neighbor_bridge_required: 2,
    nested_strong: 2
  });
  assert.equal(report.coverageSummary.blockingGapCount, 4);
});

test('realfagsgap er eksplisitte og kan ikke forsvinne bak 93-emnetallet', () => {
  const { report, readiness } = auditVitenskapUniversityReadiness();
  assert.deepEqual(report.blockingGaps, [
    'mathematics_formal_sciences',
    'physics_astronomy',
    'chemistry_material_science',
    'medicine_biomedicine_public_health'
  ]);
  for (const id of report.blockingGaps) {
    const family = readiness.coverage_families.find((row) => row.id === id);
    assert.equal(family.status, 'gap');
    assert.equal(family.requires_canonical_inventory_change, true);
    assert.ok(family.candidate_topics.length >= 5);
  }
  assert.equal(report.gates.fixedCompletionQuotaForbidden, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
});

test('Teknologi forblir nested og universitetsbredden bruker inspiserbare benchmarks', () => {
  const { report } = auditVitenskapUniversityReadiness();
  assert.equal(report.inventory.teknologi.top_level_subject, false);
  assert.equal(report.inventory.teknologi.canonical_parent_subject, 'vitenskap');
  assert.equal(report.inventory.teknologi.domain_count, 12);
  assert.equal(report.inventory.teknologi.emne_count, 48);
  assert.equal(report.benchmarks.length, 5);
  assert.ok(report.benchmarks.every((row) => row.url.startsWith('https://')));
  assert.equal(report.gates.nestedTechnologyInventoryLocked, true);
  assert.equal(report.gates.officialBenchmarksInspectable, true);
});

test('første produksjonsenhet er låst til eksisterende canonicale Vitenskap-emner', () => {
  const { report } = auditVitenskapUniversityReadiness();
  assert.equal(report.firstProductionUnit.chapterId, 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap');
  assert.equal(report.firstProductionUnit.primaryDomainId, 'institusjoner_laboratorier_kunnskapssteder');
  assert.equal(report.firstProductionUnit.status, 'ready_for_chapter_brief');
  assert.equal(report.firstProductionUnit.emneIds.length, 8);
  assert.equal(report.gates.firstProductionUnitUsesOnlyCanonicalEmners, true);
});
