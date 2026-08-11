import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiComplete } from '../scripts/audit-fagverk-psykologi-complete.mjs';

test('Psykologi er komplett på tvers av alle seks canonicale domener', () => {
  const { report } = auditPsykologiComplete();
  assert.equal(report.status, 'psykologi_complete_and_audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.registeredChapterCount, 6);
  assert.equal(report.summary.chapterCount, 6);
  assert.equal(report.summary.domainCount, 6);
  assert.equal(report.summary.emneCount, 58);
  assert.equal(report.summary.uniqueEmneCount, 58);
  assert.equal(report.summary.canonicalMethodCount, 58);
  assert.equal(Object.keys(report.domainCoverage).length, 6);
  assert.deepEqual(report.chapterIds, [
    'psykisk-helse-institusjoner-og-behandling',
    'fagtradisjoner-teori-og-sinnet',
    'utvikling-oppvekst-og-laring',
    'kognisjon-folelser-og-atferd',
    'sosialpsykologi-normalitet-og-stigma',
    'traume-krise-resiliens-og-omsorg'
  ]);
  assert.ok(report.summary.externalSourceCount >= 90);
  assert.ok(report.summary.paragraphCount >= 150);
  assert.ok(Object.values(report.gates).every(Boolean));
});
