import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvLocationProductionPlaceEthicsFulltextV1 } from '../scripts/audit-film-tv-location-production-place-ethics-fulltext-v1.mjs';
import { buildFilmTvLocationProductionPlaceEthicsFulltextV1 } from '../scripts/materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs';

test('Film & TV unit 13 fulltekst dekker canonical kontrakt med claimsporet evidens', () => {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  assert.equal(built.chapter.id, 'location-produksjon-og-stedsetikk');
  assert.equal(built.chapter.emne_ids.length, 8);
  assert.equal(built.modules.length, 4);
  assert.equal(built.sections.length, 8);
  assert.deepEqual(built.moduleParagraphCounts, [10, 9, 10, 10]);
  assert.equal(built.topicBriefs.flatMap((row) => row.planned_claims || []).length, 39);
  assert.equal(built.sources.length, 26);
  assert.equal(built.cases.length, 24);
});

test('Film & TV unit 13 fulltekstaudit låser evidens-, etikk- og kvalitetsportene', () => {
  const report = auditFilmTvLocationProductionPlaceEthicsFulltextV1();
  assert.equal(report.status, 'pass');
  assert.equal(report.summary.canonical_emners, 8);
  assert.equal(report.summary.verified_claims, 39);
  assert.equal(report.summary.inspectable_sources_used, 26);
  assert.equal(report.summary.documented_cases, 24);
  assert.equal(report.summary.quality_score, '29/30');
  assert.equal(report.summary.next_gate, 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief');
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.ok(Object.values(report.qualityAssessment.dimensions).every((row) => row.score >= 4));
  assert.equal(report.qualityAssessment.critical_deviations.length, 0);
});

test('Film & TV unit 13 holder kritiske stedsetiske grenser separate', () => {
  const report = auditFilmTvLocationProductionPlaceEthicsFulltextV1();
  const required = [
    'location_and_represented_place_layers_separated',
    'permission_consent_consultation_protocol_separated',
    'public_space_and_people_rights_bounded',
    'physical_site_change_evidence_bounded',
    'carbon_and_site_ecology_separated',
    'community_power_benefit_burden_and_consent_explicit',
    'indigenous_source_control_and_collective_rights_explicit',
    'virtual_production_tradeoffs_explicit',
    'tourism_attribution_and_local_effect_bounded'
  ];
  for (const gate of required) assert.equal(report.gates[gate], true, `${gate} skal være permanent grønn`);
});
