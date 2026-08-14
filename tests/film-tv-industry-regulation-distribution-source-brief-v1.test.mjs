import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvIndustryRegulationDistributionSourceBriefV1,
  buildFilmTvIndustryRegulationDistributionSourceBriefV1
} from '../scripts/brief-film-tv-industry-regulation-distribution-sources-v1.mjs';

const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  }
  return true;
};

test('tiende planenhet har komplett kilde- og claimbrief uten tidlig kapittelregistrering', () => {
  const { report } = auditFilmTvIndustryRegulationDistributionSourceBriefV1();
  assert.equal(report.summary.emne_count, 12);
  assert.equal(report.summary.proposed_module_count, 4);
  assert.equal(report.summary.source_count, 34);
  assert.equal(report.summary.case_count, 34);
  assert.equal(report.summary.planned_claim_count, 52);
  assert.deepEqual(report.summary.planned_claim_counts_by_emne, [4, 5, 4, 4, 5, 4, 5, 4, 5, 4, 4, 4]);
  assert.equal(report.summary.registered_chapter_count_delta, 0);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('markeds-, makt-, rettighets- og reguleringspåstander har separate evidensgrenser', () => {
  const { report } = auditFilmTvIndustryRegulationDistributionSourceBriefV1();
  for (const gate of [
    'platform_regulation_preserves_procedural_boundaries',
    'audience_measurement_scope_is_explicit',
    'rights_windows_and_availability_are_separate',
    'classification_censorship_and_moderation_are_separate',
    'format_registration_and_law_are_separate',
    'piracy_access_and_motive_are_separate',
    'concrete_reception_remains_next_unit'
  ]) {
    assert.equal(report.gates[gate], true, gate);
  }
});

test('alle kilder, case og claimplaner er konkrete og resolvable', () => {
  const { sources, cases, topicBriefs, plannedClaims } =
    buildFilmTvIndustryRegulationDistributionSourceBriefV1();
  const sourceIds = new Set(sources.map((row) => row.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const usedSources = new Set(topicBriefs.flatMap((row) => row.source_ids));
  const usedCases = new Set(topicBriefs.flatMap((row) => row.case_ids));

  assert.equal(sources.every((row) => usedSources.has(row.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topicBriefs.every((row) => row.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))), true);
  assert.equal(plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'), true);
  assert.equal(new Set(plannedClaims.map((row) => row.id)).size, 52);
});

test('delt runtime-status avanserer monotont mens kapittelet forblir uregistrert', () => {
  const { registry, status } = buildFilmTvIndustryRegulationDistributionSourceBriefV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');

  assert.equal(versionAtLeast(registry.version, '2.92.0'), true);
  assert.equal(versionAtLeast(status.version, '1.85.0'), true);
  assert.ok(registry.updatedAt >= '2026-08-14');
  assert.ok(status.updatedAt >= '2026-08-14');
  assert.equal(
    registry.subjects.film_tv.canonicalModel.tenthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json'
  );
  assert.equal(
    registry.subjects.film_tv.chapters.some((row) => row.id === 'industri-regulering-og-distribusjon'),
    false
  );
  assert.equal(
    film.nextGate,
    'industry_regulation_distribution_source_brief_complete_full_chapter_production'
  );
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-industry-regulation-distribution-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
