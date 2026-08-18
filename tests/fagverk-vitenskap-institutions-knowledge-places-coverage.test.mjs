import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapInstitutionsKnowledgePlacesCoverage } from '../scripts/audit-fagverk-vitenskap-institutions-knowledge-places-coverage.mjs';

test('Vitenskap institutions batch gir eksplisitt fulltekstdekning til 14 canonicale emner', () => {
  const report = auditVitenskapInstitutionsKnowledgePlacesCoverage();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.domainId, 'institusjoner_laboratorier_kunnskapssteder');
  assert.equal(report.summary.canonicalBatchEmneCount, 14);
  assert.equal(report.summary.coverageTreatmentCount, 14);
  assert.equal(report.summary.sectionCount, 7);
  assert.equal(report.summary.paragraphCount, 21);
  assert.equal(report.gates.canonicalPrimaryMappingResolved, true);
  assert.equal(report.gates.everyEmneHasExplicitTreatment, true);
  assert.equal(report.gates.substantiveParagraphCoverage, true);
  assert.equal(report.gates.methodLimitsTaught, true);
});

test('Vitenskap institutions batch krever claimsporet evidens, grenser og inspeksjonskilder', () => {
  const report = auditVitenskapInstitutionsKnowledgePlacesCoverage();
  assert.equal(report.summary.newSourceCount, 9);
  assert.equal(report.summary.newClaimCount, 14);
  assert.equal(report.gates.paragraphClaimsResolve, true);
  assert.equal(report.gates.newSourcesInspectable, true);
  assert.equal(report.gates.institutionalAuthorityNotTruthShortcut, true);
  assert.equal(report.gates.clinicalDesignNotUniversalHierarchy, true);
  assert.equal(report.gates.preservationNotStorageShortcut, true);
  assert.equal(report.gates.knowledgeGeographyNotProximityShortcut, true);
});

test('Vitenskap institutions batch reduserer holistic blocker 68 til 54 uten completion eller Teknologi-flip', () => {
  const report = auditVitenskapInstitutionsKnowledgePlacesCoverage();
  assert.equal(report.summary.holisticOwnedBeforeBatch, 49);
  assert.equal(report.summary.holisticOwnedAfterBatch, 63);
  assert.equal(report.summary.holisticUncoveredBeforeBatch, 68);
  assert.equal(report.summary.holisticUncoveredAfterBatch, 54);
  assert.equal(report.gates.holisticCoverageReducedByExactly14, true);
  assert.equal(report.gates.technologyRemainsNested, true);
  assert.equal(report.gates.subjectCompletionStillBlocked, true);
  assert.equal(report.gates.historicalUnit1ExtendedMonotonically, true);
  assert.equal(report.gates.rootAndRegistryOwnershipMatch, true);
});
