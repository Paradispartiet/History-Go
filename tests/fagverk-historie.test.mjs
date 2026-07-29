import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHistorySubject } from '../scripts/audit-fagverk-historie.mjs';

test('Historie er materialisert med fire redaksjonelle kapitler', () => {
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
    chapterCount: 4,
    chapterDomainCount: 4,
    remainingChapterDomains: 19,
    placeCount: 0
  });
});

test('alle Historie-kapitlene oppfyller kapittel- og evidensporten', () => {
  const { report } = auditHistorySubject();
  assert.deepEqual(report.chapters, [
    {
      id: 'historisk_tid_periodisering',
      domainId: 'his_tid_periodisering',
      sectionCount: 9,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 6,
      claimReferenceCount: 4,
      sourceReferenceCount: 4,
      theoryEvidenceReferenceCount: 1
    },
    {
      id: 'kilder_arkiv_spor',
      domainId: 'his_kilder_arkiv_spor',
      sectionCount: 11,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 7,
      claimReferenceCount: 8,
      sourceReferenceCount: 6,
      theoryEvidenceReferenceCount: 5
    },
    {
      id: 'makt_stat_institusjoner',
      domainId: 'his_makt_stat_institusjoner',
      sectionCount: 11,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 7,
      claimReferenceCount: 8,
      sourceReferenceCount: 7,
      theoryEvidenceReferenceCount: 3
    },
    {
      id: 'middelalder_kirke_kongemakt',
      domainId: 'his_middelalder_kirke_kongemakt',
      sectionCount: 11,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 26,
      claimReferenceCount: 40,
      sourceReferenceCount: 26,
      theoryEvidenceReferenceCount: 10,
      tracedParagraphCount: 33,
      productionBriefValidated: true
    }
  ]);
  assert.equal(report.gates.registeredChaptersValidated, true);
  assert.equal(report.gates.chapterEvidenceReferencesResolved, true);
  assert.equal(report.gates.productionBriefAndParagraphTraceValidated, true);
  assert.equal(report.gates.historyPlaceFallbackResolved, true);
});

test('kapittelproduksjon skjuler ikke ufullstendig universell evidensdekning', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.universalCoverage.status, 'INCOMPLETE');
  assert.equal(report.universalCoverage.coveredCells, 58);
  assert.equal(report.universalCoverage.totalCells, 58);
  assert.equal(report.universalCoverage.productionGaps, 1);
  assert.equal(report.universalCoverage.theoryEvidenceQualifying, 59);
  assert.equal(report.universalCoverage.theoryEvidenceTotal, 230);
  assert.equal(report.gates.honestCompletionBoundary, true);
});
