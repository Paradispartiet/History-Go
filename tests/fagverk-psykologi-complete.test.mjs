import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiComplete } from '../scripts/audit-fagverk-psykologi-complete.mjs';

test('Psykologi bevarer en sterk canonical 6/58-baseline uten å hevde endelig complete', () => {
  const { report } = auditPsykologiComplete();
  assert.equal(report.status, 'psykologi_canonical_baseline_expanded_and_audited');
  assert.equal(report.subject.editorialStatus, 'expanded_and_audited');
  assert.equal(report.subject.nextGate, 'university_matrix_topic_articles_concept_registry_and_methods');
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
  assert.match(report.interpretation, /ikke.*58 selvstendige emneartikler/i);
});
