import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORITY_CLASSES,
  buildFilmTvSourceAuthorityAudit,
  classifyFilmTvSourceAuthority
} from '../scripts/audit-film-tv-source-authority-quality-v1.mjs';

test('Film & TV source authority quality layer classifies all canonical source registrations', () => {
  const report = buildFilmTvSourceAuthorityAudit();

  assert.equal(report.summary.registered_chapter_count, 17);
  assert.equal(report.summary.source_registration_count, 416);
  assert.equal(report.summary.verified_claim_count, 663);
  assert.equal(report.summary.unknown_source_count, 0);
  assert.equal(report.source_registrations.length, 416);
  assert.ok(report.source_registrations.every((row) => AUTHORITY_CLASSES.includes(row.authority_class)));
  assert.ok(report.source_registrations.every((row) => /^https?:\/\//.test(row.url)));
  assert.ok(report.source_registrations.every((row) => row.source_location?.trim()));
});

test('Film & TV research-dependent claims have academic authority support', () => {
  const report = buildFilmTvSourceAuthorityAudit();

  assert.equal(report.summary.research_claim_gap_count, 0);
  assert.equal(report.summary.empirical_effect_gap_count, 0);
  assert.ok(report.summary.academic_requirement_claim_count > 0);
  assert.ok(report.summary.empirical_effect_requirement_claim_count > 0);
  assert.equal(report.gates.research_claims_have_academic_secondary_evidence, true);
  assert.equal(report.gates.empirical_effect_claims_have_peer_reviewed_evidence, true);
});

test('Film & TV quality layer preserves canonical completion and maintenance terminal gate', () => {
  const report = buildFilmTvSourceAuthorityAudit();

  assert.equal(report.gates.canonical_completion_remains_closed, true);
  assert.equal(report.gates.no_completion_reopen_side_effect, true);
  assert.equal(report.summary.terminal_gate, 'maintenance_source_refresh_and_place_case_expansion');
});

test('authority classifier keeps peer review, law and archival authority distinct', () => {
  assert.equal(classifyFilmTvSourceAuthority({ type: 'peer-reviewed-experimental-research' }), 'peer_reviewed_scholarship');
  assert.equal(classifyFilmTvSourceAuthority({ type: 'eu-directive' }), 'law_regulation');
  assert.equal(classifyFilmTvSourceAuthority({ type: 'national-film-archive-catalogue' }), 'archive_institution');
  assert.equal(classifyFilmTvSourceAuthority({ type: 'professional-survey-methodology-standard' }), 'professional_secondary');
});
