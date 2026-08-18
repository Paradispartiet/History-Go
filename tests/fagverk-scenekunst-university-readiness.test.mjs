import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenekunstUniversityReadiness } from '../scripts/audit-fagverk-scenekunst-university-readiness.mjs';

test('Scenekunst breadth reconciliation preserves foundation and closes inventory gaps without claiming completion', () => {
  const report = auditScenekunstUniversityReadiness({ writeReport: false, checkReport: true });
  assert.equal(report.status, 'breadth_inventory_reconciled_chapter_production_pending');
  assert.deepEqual(report.foundationBaseline, { domains: 4, emners: 8, methods: 9, mappings: 8, registeredChapters: 0 });
  assert.deepEqual(report.canonicalInventory, { domains: 4, emners: 20, methods: 14, mappings: 20, progressionModules: 5, registeredChapters: 0 });
  assert.equal(report.coverageFamilies, 12);
  assert.equal(report.unresolvedBreadthGaps, 0);
  assert.equal(report.preservedFoundationEmners, 8);
  assert.equal(report.reconciledEmners, 12);
  assert.equal(report.reconciledMethods, 5);
  assert.equal(report.completeReady, false);
});
