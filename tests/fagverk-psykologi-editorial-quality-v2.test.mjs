import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditPsykologiEditorialQualityV2 } from '../scripts/audit-fagverk-psykologi-editorial-quality-v2.mjs';

test('Psykologi består den eksplisitte seksdelte kvalitetsvurderingen', () => {
  const { report } = auditPsykologiEditorialQualityV2({ checkReport: false });
  assert.equal(report.status, 'psykologi_editorial_quality_v2_high');
  assert.equal(report.highQuality, true);
  assert.equal(report.qualityAssessment.conclusion, 'high_quality');
  assert.ok(Object.values(report.qualityAssessment.scores).every((score) => score >= 4));
  assert.equal(report.qualityAssessment.total, 30);
  assert.deepEqual(report.qualityAssessment.criticalFlags, []);
  assert.deepEqual(report.evidence.activationPolicy, {
    externalPeerReviewRequired: false,
    repositoryQualityAndSafetyGatesRequired: true,
    runtimeIntegrationStateAudited: true
  });
  assert.equal(report.gates.ahaRuntimeIntegrationStateAudited, true);
  assert.equal('noAhaRuntimeActivation' in report.gates, false);
});

test('malgenerering, kunstige modellnavn og falske dokumenterte case er blokkert', () => {
  const { report } = auditPsykologiEditorialQualityV2({ checkReport: false });
  assert.equal(report.scope.curatedArticleCount, 46);
  assert.equal(report.gates.curatedClaimChainsExact, true);
  assert.equal(report.gates.everyArticleSectionDirectlyClaimAndSourceBound, true);
  assert.equal(report.gates.realModelsReplaceArtificialLabels, true);
  assert.equal(report.gates.hypotheticalCasesDeclaredHonestly, true);
  assert.equal(report.gates.allSubstitutedEditorialFieldsNormalized, true);
  assert.equal(report.gates.normalizedTenWordLocalFrameReuseBelowAbsoluteThreshold, true);
  assert.deepEqual(report.evidence.normalizedTenWordFrameSimilarity.violations, []);
  assert.equal(report.evidence.normalizedTenWordFrameSimilarity.curatedArticlesWithDeclaredNormalizationInputs, 46);
  assert.ok(report.evidence.normalizedTenWordFrameSimilarity.maximumLocalSharedFrameCount <= report.evidence.normalizedTenWordFrameSimilarity.localSharedFrameThreshold);
  assert.equal(report.qualityAssessment.scores.correctness_and_evidence, report.evidence.qualityDimensionEvidence.correctness_and_evidence.derived_score);
});

test('alle begreper og anvendte felt er håndredigert og claimsporet', () => {
  const { report } = auditPsykologiEditorialQualityV2({ checkReport: false });
  assert.equal(report.scope.handEditedConceptCount, 136);
  assert.equal(report.scope.appliedFieldCount, 6);
  assert.equal(report.gates.all136ConceptDefinitionsHandEdited, true);
  assert.equal(report.gates.everyConceptClaimAndSourceBound, true);
  assert.equal(report.gates.allSixAppliedFieldsSpecificallyReviewed, true);
});

test('begrepsmodeller kommer bare fra begrepets egne claims', () => {
  const document = JSON.parse(fs.readFileSync(new URL('../data/fag/psykologi/begreper_psykologi_canonical_v1.json', import.meta.url), 'utf8'));
  const concepts = new Map(document.concepts.map((concept) => [concept.canonical_term, concept]));
  for (const concept of document.concepts) {
    assert.deepEqual(concept.models_or_researchers, [...new Set(concept.model_evidence.map((row) => row.name))]);
    assert.ok(concept.model_evidence.every((row) => concept.claim_ids.includes(row.claim_id) && row.source_ids.every((sourceId) => concept.source_ids.includes(sourceId))));
  }
  assert.ok(!concepts.get('hukommelse').models_or_researchers.some((name) => /Gross|framing/i.test(name)));
  assert.ok(!concepts.get('psykoanalyse').models_or_researchers.some((name) => /Watson|Skinner/i.test(name)));
  assert.deepEqual(concepts.get('tillit').claim_ids, ['tkr-07']);
  assert.deepEqual(concepts.get('tillit').models_or_researchers, []);
  assert.match(concepts.get('tillit').definition, /registeret gir ikke en generell teori om tillit/);
  assert.deepEqual(concepts.get('hverdagsliv').claim_ids, ['phi-01', 'phi-25']);
  assert.match(concepts.get('hverdagsliv').definition, /har det i hverdagen.*community-baserte tjenester/s);
});
