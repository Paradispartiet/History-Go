import test from 'node:test';
import assert from 'node:assert/strict';
import { applySourceLedLengthPolicy, LENGTH_POLICY_REVISION } from '../scripts/validate-place-description-production-v4_2_policy.mjs';

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
