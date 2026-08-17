import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapUniversityReadiness } from '../scripts/audit-fagverk-vitenskap-university-readiness.mjs';

const EDITORIAL_BLOCKERS = [
  'mathematics_formal_sciences',
  'physics_astronomy',
  'chemistry_material_science',
  'medicine_biomedicine_public_health'
];

test('Vitenskap university readiness viser v4.6-kapittelproduksjon uten å overrapportere complete', () => {
  const { report } = auditVitenskapUniversityReadiness();
  assert.equal(report.subject.id, 'vitenskap');
  assert.equal(report.subject.title, 'Vitenskap & teknologi');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'remaining_chapter_production_across_reconciled_university_breadth');
  assert.equal(report.subject.completeReady, false);
  assert.equal(report.inventory.vitenskap.domain_count, 6);
  assert.equal(report.inventory.vitenskap.emne_count, 117);
  assert.equal(report.inventory.vitenskap.method_count, 84);
  assert.equal(report.inventory.vitenskap.mapping_count, 117);
  assert.equal(report.inventory.vitenskap.hook_count, 64);
  assert.equal(report.inventory.vitenskap.registered_chapter_count, 1);
  assert.equal(report.coverageSummary.familyCount, 12);
  assert.deepEqual(report.coverageSummary.statusCounts, {
    strong: 4,
    inventory_reconciled: 4,
    neighbor_bridge_required: 2,
    nested_strong: 2
  });
  assert.equal(report.coverageSummary.structuralBlockingGapCount, 0);
  assert.equal(report.coverageSummary.editorialBlockerCount, 4);
});

test('realfagsgap er strukturelt reconcilet men forblir eksplisitte redaksjonelle blockers', () => {
  const { report, readiness } = auditVitenskapUniversityReadiness();
  assert.deepEqual(report.structuralBlockingGaps, []);
  assert.deepEqual(report.editorialBlockers, EDITORIAL_BLOCKERS);
  for (const id of report.editorialBlockers) {
    const family = readiness.coverage_families.find((row) => row.id === id);
    assert.equal(family.status, 'inventory_reconciled');
    assert.equal(family.requires_canonical_inventory_change, false);
    assert.ok(family.reconciled_emne_ids.length >= 5);
    assert.ok(family.reconciled_hook_id);
  }
  assert.equal(report.gates.structuralBreadthGapsReconciled, true);
  assert.equal(report.gates.editorialBreadthBlockersExplicit, true);
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
  assert.equal(report.gates.technologyRemainsNested, true);
  assert.equal(report.gates.officialBenchmarksInspectable, true);
});

test('første produksjonsenhet er materialisert og canonicalt registrert', () => {
  const { report } = auditVitenskapUniversityReadiness();
  assert.equal(report.firstProductionUnit.chapterId, 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap');
  assert.equal(report.firstProductionUnit.primaryDomainId, 'institusjoner_laboratorier_kunnskapssteder');
  assert.equal(report.firstProductionUnit.status, 'materialized_and_registered');
  assert.equal(report.firstProductionUnit.emneIds.length, 8);
  assert.deepEqual(report.firstProductionUnit.materializedEvidence, {
    method_count: 5,
    module_count: 3,
    section_count: 9,
    paragraph_count: 27,
    source_count: 10,
    claim_count: 18
  });
  assert.equal(report.registration.registryChapterCount, 1);
  assert.equal(report.registration.releaseChapterStatus, 'materialized');
  assert.equal(report.registration.releaseChapterCount, 1);
  assert.equal(report.registration.releaseMissingFileCount, 0);
  assert.equal(report.gates.firstProductionUnitPreserved, true);
  assert.equal(report.gates.registryAndReleaseAligned, true);
});
