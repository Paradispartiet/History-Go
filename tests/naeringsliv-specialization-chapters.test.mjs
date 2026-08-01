import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaeringslivSpecializations } from '../scripts/audit-naeringsliv-specialization-chapters.mjs';

test('seks Næringsliv-fordypninger passerer permanent fullkapittelgate', () => {
  const report = auditNaeringslivSpecializations();
  assert.equal(report.totals.chapters, 6);
  assert.equal(report.totals.sections, 54);
  assert.equal(report.totals.paragraphs, 162);
  assert.equal(report.totals.claims, 162);
  assert.equal(report.totals.sources, 54);
  assert.equal(report.gates.subjectCompleteAtTwelveChapters, true);
});
