import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHistorySubject } from '../scripts/audit-fagverk-historie.mjs';

test('Historie er materialisert og har startet redaksjonell kapittelproduksjon', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.subject.id, 'historie');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.deepEqual(report.summary, {
    domainCount: 23,
    emneCount: 230,
    methodCount: 105,
    mappingCount: 230,
    hookCount: 230,
    chapterCount: 1,
    chapterDomainCount: 1,
    remainingChapterDomains: 22,
    placeCount: 0
  });
});

test('første Historie-kapittel oppfyller kapittelporten', () => {
  const { report } = auditHistorySubject();
  assert.deepEqual(report.chapters, [{
    id: 'historisk_tid_periodisering',
    domainId: 'his_tid_periodisering',
    sectionCount: 9,
    workedExampleCount: 2,
    misconceptionCount: 5,
    taskCount: 4,
    selfCheckCount: 7,
    sourceCount: 6
  }]);
  assert.equal(report.gates.registeredChaptersValidated, true);
  assert.equal(report.gates.historyPlaceFallbackResolved, true);
});

test('kapittelproduksjon skjuler ikke ufullstendig universell evidensdekning', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.universalCoverage.status, 'INCOMPLETE');
  assert.equal(report.universalCoverage.coveredCells, 58);
  assert.equal(report.universalCoverage.totalCells, 58);
  assert.equal(report.universalCoverage.productionGaps, 1);
  assert.equal(report.universalCoverage.theoryEvidenceQualifying, 51);
  assert.equal(report.universalCoverage.theoryEvidenceTotal, 230);
  assert.equal(report.gates.honestCompletionBoundary, true);
});
