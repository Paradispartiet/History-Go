import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiComplete } from '../scripts/audit-fagverk-psykologi-complete.mjs';
import {
  PSYKOLOGI_MAINTENANCE_GATE,
  PSYKOLOGI_UNIVERSITY_GATE,
  psykologiPostBaselineStateIsConsistent
} from '../scripts/psykologi-subject-state.mjs';

test('Psykologi bevarer canonical 6/58-baseline i endelig complete-status', () => {
  const { report } = auditPsykologiComplete();
  assert.equal(report.status, 'psykologi_canonical_baseline_audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
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

test('alle baseline-auditer kan godta både universitetsarbeid og endelig maintenance-status', () => {
  assert.equal(psykologiPostBaselineStateIsConsistent(
    { editorialStatus: 'expanded_and_audited', nextGate: PSYKOLOGI_UNIVERSITY_GATE },
    { editorialPlan: { nextGate: PSYKOLOGI_UNIVERSITY_GATE } }
  ), true);
  assert.equal(psykologiPostBaselineStateIsConsistent(
    { editorialStatus: 'complete', nextGate: PSYKOLOGI_MAINTENANCE_GATE },
    { editorialPlan: { nextGate: PSYKOLOGI_MAINTENANCE_GATE } }
  ), true);
  assert.equal(psykologiPostBaselineStateIsConsistent(
    { editorialStatus: 'complete', nextGate: PSYKOLOGI_UNIVERSITY_GATE },
    { editorialPlan: { nextGate: PSYKOLOGI_UNIVERSITY_GATE } }
  ), false);
});
