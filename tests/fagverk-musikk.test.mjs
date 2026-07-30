import test from 'node:test';
import assert from 'node:assert/strict';
import { auditRepository } from '../scripts/audit-fagverk-musikk.mjs';

test('Musikk materialiseres fra aktiv vitenskapelig pakke, ikke legacy v4.5', () => {
  const result = auditRepository({ checkReport: false });
  const { report, generalRow } = result;
  assert.equal(report.subject.id, 'musikk');
  assert.equal(report.subject.title, 'Musikkvitenskap');
  assert.equal(report.subject.scientificAuthority, 'this_package');
  assert.equal(report.summary.domainCount, 8);
  assert.equal(report.summary.emneCount, 48);
  assert.equal(report.summary.methodCount, 18);
  assert.equal(report.summary.questionBlueprintCount, 48);
  assert.equal(report.summary.sourceDossierTopicCount, 48);
  assert.equal(report.summary.verifiedScholarlySourceRecordCount, 156);
  assert.equal(report.summary.chapterCount, 0);
  assert.equal(generalRow.adapter, 'standard');
  assert.equal(generalRow.domainCount, 8);
  assert.equal(generalRow.emneCount, 48);
  assert.equal(generalRow.methodCount, 18);
  assert.equal(generalRow.editorialStatus, 'structure_ready');
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Musikk beholder Scenekunst som separat toppfag og legacy kun som kompatibilitet', () => {
  const { report } = auditRepository({ checkReport: false });
  assert.equal(report.authorityBoundary.scientificAuthority, 'this_package');
  assert.equal(report.authorityBoundary.legacyModuleRole, 'legacy_source_inventory_not_active_scientific_authority');
  assert.equal(report.authorityBoundary.scenekunstSeparateTopLevelSubject, true);
  assert.equal(report.authorityBoundary.performanceStudyInScope, true);
  assert.equal(report.gates.bibliographicBasisNotPromotedToFulltextEvidence, true);
});
