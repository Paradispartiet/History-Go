import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditClaimsSourceDocument,
  auditNaeringslivSourceMaintenance
} from '../scripts/audit-naeringsliv-source-maintenance.mjs';

const TODAY = '2026-08-01T12:00:00Z';

function fixture() {
  return {
    chapterId: 'test-chapter',
    today: TODAY,
    claimsDocument: {
      schema: 'history_go_fagverk_claims_v1',
      subject_id: 'naeringsliv',
      chapter_id: 'test-chapter',
      verified_at: '2026-08-01',
      verification_status: 'verified',
      sources: [{
        id: 'source-1', label: 'Kilde 1', url: 'https://example.com/one', publisher: 'Utgiver', type: 'rapport', source_location: 'Kapittel 1'
      }],
      claims: [{ id: 'claim-1', status: 'verified', source_ids: ['source-1'] }]
    },
    modules: [{ sources: [{ source_id: 'source-1', label: 'Kilde 1', url: 'https://example.com/one', type: 'rapport' }] }]
  };
}

test('Næringsliv har ferske, komplette og konsistente canonicale kilderegistre', () => {
  const report = auditNaeringslivSourceMaintenance({ today: TODAY });
  assert.equal(report.status, 'PASSED');
  assert.equal(report.summary.chapterCount, 12);
  assert.equal(report.summary.claimCount, 422);
  assert.equal(report.summary.sourceCount, 185);
  assert.equal(report.gates.legacySourceCopiesMatchCanonicalMetadata, true);
});

test('kildeporten avviser foreldet verifisering', () => {
  const input = fixture();
  input.claimsDocument.verified_at = '2025-07-31';
  assert.throws(() => auditClaimsSourceDocument(input), /older than 365 days/);
});

test('kildeporten avviser umulige kalenderdatoer', () => {
  const input = fixture();
  input.claimsDocument.verified_at = '2026-02-30';
  assert.throws(() => auditClaimsSourceDocument(input), /not a real calendar date/);
});

test('kildeporten avviser ukjente kildehenvisninger', () => {
  const input = fixture();
  input.claimsDocument.claims[0].source_ids = ['missing-source'];
  assert.throws(() => auditClaimsSourceDocument(input), /unknown source ID missing-source/);
});

test('kildeporten avviser canonicale kilder som ingen claim bruker', () => {
  const input = fixture();
  input.claimsDocument.sources.push({
    id: 'source-2', label: 'Kilde 2', url: 'https://example.com/two', publisher: 'Utgiver', type: 'rapport', source_location: 'Kapittel 2'
  });
  assert.throws(() => auditClaimsSourceDocument(input), /source source-2 is not used by any claim/);
});

test('kildeporten avviser dupliserte kildeadresser', () => {
  const input = fixture();
  input.claimsDocument.sources.push({
    id: 'source-2', label: 'Kilde 2', url: 'https://example.com/one', publisher: 'Utgiver', type: 'rapport', source_location: 'Kapittel 2'
  });
  assert.throws(() => auditClaimsSourceDocument(input), /duplicate source URL/);
});

test('kildeporten avviser drift i eldre modulkopier', () => {
  const input = fixture();
  input.modules[0].sources[0].label = 'Foreldet tittel';
  assert.throws(() => auditClaimsSourceDocument(input), /shadow label differs from canonical source/);
});
