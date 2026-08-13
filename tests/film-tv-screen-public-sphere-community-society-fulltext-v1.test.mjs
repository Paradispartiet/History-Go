import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1 } from '../scripts/audit-film-tv-screen-public-sphere-community-society-fulltext-v1.mjs';
import { buildFilmTvScreenPublicSphereCommunitySocietyFulltextV1 } from '../scripts/materialize-film-tv-screen-public-sphere-community-society-fulltext-v1.mjs';

const versionAtLeast = (actual, minimum) => {
  const parts = (version) => version.split('.').map(Number);
  const actualParts = parts(actual);
  const minimumParts = parts(minimum);
  const length = Math.max(actualParts.length, minimumParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (actualParts[index] || 0) - (minimumParts[index] || 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
};

test('åttende planenhet er komplett, claimsporet og registrert', () => {
  const report = auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  assert.deepEqual(report.summary, {
    emne_count: 9,
    module_count: 4,
    section_count: 9,
    paragraph_count: 36,
    verified_claim_count: 36,
    used_source_count: 28,
    case_count: 30,
    related_place_count: 3
  });
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('samfunnseffekt er skilt fra representasjon, mandat og tilsyn', () => {
  const report = auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  assert.equal(report.gates.public_sphere_evidence_layers_are_visible, true);
  assert.equal(report.gates.empirical_effect_case_is_bounded, true);
});

test('alle 36 claimplaner er løst og alle 28 kilder er brukt', () => {
  const report = auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  assert.equal(report.gates.all_planned_claims_resolved, true);
  assert.equal(report.gates.all_twenty_eight_sources_used_by_final_claims, true);
  assert.equal(report.summary.verified_claim_count, 36);
  assert.equal(report.summary.used_source_count, 28);
});

test('identitet, by, klima og religion har eksplisitte sikkerhetsgrenser', () => {
  const report = auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  assert.equal(report.gates.identity_inference_safeguard_visible, true);
  assert.equal(report.gates.city_scope_boundary_visible, true);
  assert.equal(report.gates.climate_scope_boundary_visible, true);
  assert.equal(report.gates.religion_scope_boundary_visible, true);
});

test('kapitlet registreres først etter fulltekstporten og peker videre til enhet 9', () => {
  const report = auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  assert.equal(report.gates.chapter_registered_after_gate, true);
  assert.equal(report.gates.registry_points_to_fulltext_assets, true);
  assert.equal(report.gates.status_advanced_to_next_unit, true);
  assert.equal(report.gates.source_brief_consumed_after_fulltext, true);
  assert.equal(report.next_gate, 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief');
});

test('rekonstruksjon på fersk main senker aldri delt versjon eller dato', () => {
  const { registry, status } = buildFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  assert.equal(versionAtLeast(registry.version, '2.90.0'), true);
  assert.equal(versionAtLeast(status.version, '1.83.0'), true);
  assert.ok(registry.updatedAt >= '2026-08-13');
  assert.ok(status.updatedAt >= '2026-08-13');
});
