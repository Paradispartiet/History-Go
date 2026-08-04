import test from 'node:test';
import assert from 'node:assert/strict';
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
    knowledgeUnitCount: 44,
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
