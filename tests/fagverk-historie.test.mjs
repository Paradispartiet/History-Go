import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHistorySubject } from '../scripts/audit-fagverk-historie.mjs';

test('Historie er individuelt materialisert gjennom standard canonical-adapteren', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.subject.id, 'historie');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'structure_ready');
  assert.deepEqual(report.summary, {
    domainCount: 23,
    emneCount: 230,
    methodCount: 105,
    mappingCount: 230,
    hookCount: 230,
    chapterCount: 0,
    placeCount: 0
  });
});

test('Historie materialiseres uten å skjule ufullstendig universell evidensdekning', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.universalCoverage.status, 'INCOMPLETE');
  assert.equal(report.universalCoverage.coveredCells, 58);
  assert.equal(report.universalCoverage.totalCells, 58);
  assert.equal(report.universalCoverage.productionGaps, 1);
  assert.equal(report.universalCoverage.theoryEvidenceQualifying, 51);
  assert.equal(report.universalCoverage.theoryEvidenceTotal, 230);
  assert.equal(report.gates.honestUniversalCoverageBoundary, true);
});
