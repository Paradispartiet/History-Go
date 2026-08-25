import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditSubkulturRuntimeFinal, buildSubkulturRuntimeFinalReport } from '../scripts/audit-subkultur-runtime-final-v1.mjs';

test('Subkultur-runtime materialiserer hele canonicalkjeden', () => {
  const report = auditSubkulturRuntimeFinal();
  assert.equal(report.status, 'COMPLETE');
  assert.deepEqual(report.failures, []);
  assert.deepEqual(report.summary, {
    domainCount: 8,
    hookCount: 80,
    emneCount: 80,
    methodCount: 43,
    mappingCount: 80,
    theoryObjectCount: 80,
    chapterCount: 8,
    validatedCaseCount: 42,
    rejectedCaseCount: 8,
    pathwayCount: 8,
    assessmentQuestionCount: 40,
    knowledgeUnitCount: 79,
    legacyQuestionAuditCount: 83,
    activeLegacyQuestionCount: 0
  });
});

test('portal, assessment og redaksjonell status er ferdigstilt atomisk', () => {
  const report = buildSubkulturRuntimeFinalReport();
  assert.deepEqual(report.completion, {
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'complete',
    nextGate: 'maintenance_and_source_refresh'
  });
  assert.equal(report.runtime.knowledge_registries, 4);
  assert.equal(report.runtime.chapter_files, 40);
});

test('Subkultur-materialiseringen nedgraderer ikke modne nabofag', () => {
  const status = JSON.parse(fs.readFileSync('data/fagverk/subject_status.json', 'utf8'));
  for (const id of ['historie', 'politikk']) {
    const subject = status.subjects.find((entry) => entry.id === id);
    assert.ok(subject, `subject_status mangler ${id}`);
    assert.equal(subject.navigationStatus, 'materialized');
    assert.equal(subject.assessmentStatus, 'audited');
    assert.ok(
      ['complete', 'expanded_and_audited'].includes(subject.editorialStatus),
      `${id} er blitt redaksjonelt nedgradert av Subkultur-materialiseringen`
    );
    assert.ok(
      /maintenance|source_refresh|case_expansion/.test(subject.nextGate || ''),
      `${id} peker tilbake til produksjon etter Subkultur-materialisering`
    );
  }
});
