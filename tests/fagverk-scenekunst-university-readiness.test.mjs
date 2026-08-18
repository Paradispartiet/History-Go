import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenekunstUniversityReadiness } from '../scripts/audit-fagverk-scenekunst-university-readiness.mjs';

test('Scenekunst university readiness locks real breadth gaps before chapter completion', () => {
  const report = auditScenekunstUniversityReadiness({ writeReport: false, checkReport: true });
  assert.equal(report.status, 'blocked_for_completion_until_breadth_reconciliation');
  assert.equal(report.baseline.domains, 4);
  assert.equal(report.baseline.emners, 8);
  assert.equal(report.baseline.methods, 9);
  assert.equal(report.baseline.registeredChapters, 0);
  assert.ok(report.coverageFamilies >= 10);
  assert.ok(report.blockingGaps >= 7);
  assert.ok(report.candidateReconciliationTopics >= 10);
  assert.equal(report.completeReady, false);
});
