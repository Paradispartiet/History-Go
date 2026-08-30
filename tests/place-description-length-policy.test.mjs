import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCanonicalPlaceOnboardingScopePolicy,
  applySourceLedLengthPolicy,
  LENGTH_POLICY_REVISION,
  PR_SCOPE_POLICY_REVISION
} from '../scripts/validate-place-description-production-v4_2_policy.mjs';

test('word-count-only findings are guidance, not blocking errors', () => {
  const report = applySourceLedLengthPolicy({
    packetCount: 2,
    readyPacketCount: 1,
    errorCount: 4,
    issues: [
      { code: 'desc_outside_normal_range', message: 'desc er kort' },
      { code: 'popup_below_minimum', message: 'popup er kort' },
      { code: 'popup_above_maximum', message: 'popup er lang' },
      { code: 'sentence_without_claim', message: 'mangler claim' }
    ]
  });

  assert.equal(report.policyRevision, LENGTH_POLICY_REVISION);
  assert.equal(report.lengthPolicy.wordCountIsValidationGate, false);
  assert.equal(report.lengthPolicy.removedWordCountIssueCount, 3);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['sentence_without_claim']);
});

test('source, claim and structure findings remain blocking', () => {
  const report = applySourceLedLengthPolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 3,
    issues: [
      { code: 'stale_popup_hash' },
      { code: 'too_few_quiz_questions' },
      { code: 'popup_too_few_paragraphs' }
    ]
  });

  assert.equal(report.errorCount, 3);
  assert.deepEqual(report.issues.map((issue) => issue.code), [
    'stale_popup_hash',
    'too_few_quiz_questions',
    'popup_too_few_paragraphs'
  ]);
});

test('canonical Place onboarding may carry its required generated index', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 2,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' },
      { code: 'sentence_without_claim', message: 'mangler claim' }
    ]
  }, [
    { status: 'A', file: 'data/places/bergen.json' },
    { status: 'M', file: 'data/places/manifest.json' },
    { status: 'M', file: 'data/places/places_index.json' }
  ]);

  assert.equal(report.prScopePolicy.revision, PR_SCOPE_POLICY_REVISION);
  assert.equal(report.prScopePolicy.canonicalPlaceOnboarding, true);
  assert.deepEqual(report.prScopePolicy.addedPlaceFiles, ['data/places/bergen.json']);
  assert.equal(report.prScopePolicy.removedGeneratedIndexIssueCount, 1);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['sentence_without_claim']);
});

test('canonical Place onboarding may carry ID-matched coordinate evidence and deterministic reports', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 3,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' },
      { code: 'mixed_description_and_coordinate_scope', message: 'koordinater' },
      { code: 'sentence_without_claim', message: 'mangler claim' }
    ]
  }, [
    { status: 'A', file: 'data/places/historie/oslo/akershus_slott.json' },
    { status: 'M', file: 'data/places/manifest.json' },
    { status: 'M', file: 'data/places/places_index.json' },
    { status: 'A', file: 'data/coordinate-evidence/oslo/historie/akershus_slott.json' },
    { status: 'M', file: 'data/coordinate-evidence/manifest.json' },
    { status: 'M', file: 'reports/coordinate-evidence-audit.md' },
    { status: 'M', file: 'reports/place-coordinate-intake-gate.md' },
    { status: 'M', file: 'reports/place-coordinate-quality-gate.md' }
  ]);

  assert.equal(report.prScopePolicy.canonicalPlaceOnboarding, true);
  assert.equal(report.prScopePolicy.canonicalOnboardingCoordinates, true);
  assert.deepEqual(report.prScopePolicy.addedCoordinateEvidenceFiles, [
    'data/coordinate-evidence/oslo/historie/akershus_slott.json'
  ]);
  assert.equal(report.prScopePolicy.removedGeneratedIndexIssueCount, 1);
  assert.equal(report.prScopePolicy.removedCoordinateScopeIssueCount, 1);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['sentence_without_claim']);
});

test('canonical Place onboarding still blocks coordinate evidence for another Place', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 2,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' },
      { code: 'mixed_description_and_coordinate_scope', message: 'koordinater' }
    ]
  }, [
    { status: 'A', file: 'data/places/historie/oslo/akershus_slott.json' },
    { status: 'M', file: 'data/places/manifest.json' },
    { status: 'M', file: 'data/places/places_index.json' },
    { status: 'A', file: 'data/coordinate-evidence/oslo/historie/bankplassen.json' },
    { status: 'M', file: 'data/coordinate-evidence/manifest.json' }
  ]);

  assert.equal(report.prScopePolicy.canonicalOnboardingCoordinates, false);
  assert.equal(report.prScopePolicy.removedGeneratedIndexIssueCount, 1);
  assert.equal(report.prScopePolicy.removedCoordinateScopeIssueCount, 0);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['mixed_description_and_coordinate_scope']);
});

test('existing Place production still blocks coordinate evidence changes', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 2,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' },
      { code: 'mixed_description_and_coordinate_scope', message: 'koordinater' }
    ]
  }, [
    { status: 'M', file: 'data/places/by/oslo/places/bankplassen.json' },
    { status: 'M', file: 'data/places/production/bankplassen.json' },
    { status: 'M', file: 'data/places/places_index.json' },
    { status: 'M', file: 'data/coordinate-evidence/oslo/by/bankplassen.json' }
  ]);

  assert.equal(report.prScopePolicy.canonicalPlaceProduction, true);
  assert.equal(report.prScopePolicy.canonicalOnboardingCoordinates, false);
  assert.equal(report.prScopePolicy.removedGeneratedIndexIssueCount, 1);
  assert.equal(report.prScopePolicy.removedCoordinateScopeIssueCount, 0);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['mixed_description_and_coordinate_scope']);
});

test('description-only PR still blocks generated index changes', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 1,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' }
    ]
  }, [
    { status: 'M', file: 'data/places/sagene.json' },
    { status: 'M', file: 'data/places/places_index.json' }
  ]);

  assert.equal(report.prScopePolicy, undefined);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['generated_index_in_description_pr']);
});

test('complete existing Place production may carry its synchronized generated index', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 2,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' },
      { code: 'sentence_without_claim', message: 'mangler claim' }
    ]
  }, [
    { status: 'M', file: 'data/places/by/oslo/places/bankplassen.json' },
    { status: 'A', file: 'data/places/production/bankplassen.json' },
    { status: 'M', file: 'data/places/places_index.json' }
  ]);

  assert.equal(report.prScopePolicy.revision, PR_SCOPE_POLICY_REVISION);
  assert.equal(report.prScopePolicy.canonicalPlaceOnboarding, false);
  assert.equal(report.prScopePolicy.canonicalPlaceProduction, true);
  assert.deepEqual(report.prScopePolicy.matchingProductionPlaceIds, ['bankplassen']);
  assert.equal(report.prScopePolicy.removedGeneratedIndexIssueCount, 1);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['sentence_without_claim']);
});

test('unrelated production packet does not bypass description isolation', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 1,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' }
    ]
  }, [
    { status: 'M', file: 'data/places/by/oslo/places/sagene.json' },
    { status: 'M', file: 'data/places/production/bankplassen.json' },
    { status: 'M', file: 'data/places/places_index.json' }
  ]);

  assert.equal(report.prScopePolicy, undefined);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['generated_index_in_description_pr']);
});

test('new Place without manifest synchronization does not get the index exception', () => {
  const report = applyCanonicalPlaceOnboardingScopePolicy({
    packetCount: 1,
    readyPacketCount: 1,
    errorCount: 1,
    issues: [
      { code: 'generated_index_in_description_pr', message: 'indeks' }
    ]
  }, [
    { status: 'A', file: 'data/places/bergen.json' },
    { status: 'M', file: 'data/places/places_index.json' }
  ]);

  assert.equal(report.prScopePolicy, undefined);
  assert.equal(report.errorCount, 1);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['generated_index_in_description_pr']);
});
