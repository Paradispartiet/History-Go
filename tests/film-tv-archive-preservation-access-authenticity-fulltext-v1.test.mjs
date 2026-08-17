import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildFilmTvArchivePreservationAccessAuthenticityFulltextV1, buildClaimSourceIdsByClaim } from '../scripts/materialize-film-tv-archive-preservation-access-authenticity-fulltext-v1.mjs';
import { auditFilmTvArchivePreservationAccessAuthenticityFulltextV1 } from '../scripts/audit-film-tv-archive-preservation-access-authenticity-fulltext-v1.mjs';
import { isFilmTvUnitFourteenOrLaterGate } from '../scripts/brief-film-tv-archive-preservation-access-authenticity-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  return true;
};

test('fjortende planenhet er fulltekstregistrert med 11 emner og komplett claimspor', () => {
  const report = auditFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  assert.deepEqual({
    emne_count: report.summary.emne_count,
    module_count: report.summary.module_count,
    section_count: report.summary.section_count,
    paragraph_count: report.summary.paragraph_count,
    verified_claim_count: report.summary.verified_claim_count,
    used_source_count: report.summary.used_source_count,
    case_count: report.summary.case_count,
    self_check_count: report.summary.self_check_count
  }, {
    emne_count: 11,
    module_count: 4,
    section_count: 11,
    paragraph_count: 53,
    verified_claim_count: 53,
    used_source_count: 30,
    case_count: 26,
    self_check_count: 12
  });
  assert.ok(report.summary.method_count >= 8);
  assert.ok(report.summary.minimum_paragraph_word_count >= 190);
  assert.ok(report.summary.maximum_repeated_sentence_count <= 3);
  assert.deepEqual(report.module_paragraph_counts, [15, 15, 14, 9]);
  assert.equal(Object.values(report.gates).every(Boolean), true);
});

test('alle 53 sluttclaims har claimspesifikk evidens og bruker alle 30 briefkilder', () => {
  const built = buildFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  const expected = buildClaimSourceIdsByClaim(built.topicBriefs);
  const claims = built.claimsDoc.claims;
  const usedSources = new Set(claims.flatMap((claim) => claim.source_ids));
  assert.equal(claims.length, 53);
  assert.equal(new Set(claims.map((claim) => claim.id)).size, 53);
  assert.deepEqual(new Set(Object.keys(expected)), new Set(claims.map((claim) => claim.id)));
  assert.equal(claims.every((claim) => claim.status === 'verified' && claim.plan_resolution === 'verified_as_planned'), true);
  assert.equal(claims.every((claim) => claim.source_ids.length >= 2), true);
  for (const claim of claims) assert.deepEqual(claim.source_ids, expected[claim.id]);
  assert.equal(built.sources.every((source) => usedSources.has(source.id)), true);
});

test('elleve emneeide seksjoner er substansielle, forskningsforankrede og metodisk eksplisitte', () => {
  const chapter = read('data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet.json');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claimIds = sections.flatMap((section) => section.paragraphClaimIds || []);
  assert.equal(sections.length, 11);
  assert.equal(new Set(sections.map((section) => section.emne_ids[0])).size, 11);
  assert.equal(paragraphs.length, 53);
  assert.equal(new Set(paragraphs).size, 53);
  assert.equal(paragraphs.every((paragraph) => paragraph.length >= 1200 && wordCount(paragraph) >= 190), true);
  assert.equal(claimIds.length, 53);
  assert.equal(new Set(claimIds).size, 53);
  assert.equal(sections.every((section) => section.documentedCaseIds.length >= 3), true);
  assert.equal(new Set(sections.flatMap((section) => section.documentedCaseIds)).size, 26);
  assert.equal(sections.every((section) => section.theoryResearchers.length >= 2), true);
  assert.equal(sections.every((section) => section.methodLimits.length >= 2), true);
  assert.equal(sections.every((section) => section.documentedDisagreement.length >= 150), true);
  assert.equal(sections.every((section) => section.evidenceQuestion.length >= 80), true);
  assert.equal(sections.every((section) => section.keyPoints.length === 2 && section.keyPointClaimIds.length === 2), true);
  assert.equal(modules.every((module) => module.selfCheck.length === 3), true);
});

test('arkivets sentrale evidensgrenser er permanente', () => {
  const report = auditFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  for (const gate of [
    'preservation_digitization_restoration_reconstruction_access_separated',
    'catalog_metadata_survival_and_access_separated',
    'archive_object_levels_and_provenance_explicit',
    'access_rights_privacy_and_reuse_separated',
    'indigenous_community_control_and_repatriation_explicit',
    'born_digital_fixity_migration_and_authenticity_separated',
    'streaming_availability_and_preservation_separated',
    'production_archive_and_released_work_separated',
    'restoration_version_loss_and_reconstruction_separated',
    'unit_fifteen_boundary_explicit'
  ]) assert.equal(report.gates[gate], true, gate);
});

test('seksdelt kvalitetsvurdering består med 29 av 30 uten blokkere', () => {
  const assessment = auditFilmTvArchivePreservationAccessAuthenticityFulltextV1().quality_assessment;
  assert.deepEqual(Object.keys(assessment.dimensions), [
    'correctness_and_evidence',
    'coverage_and_completion',
    'editorial_quality',
    'technical_integrity',
    'safety_and_responsibility',
    'maintainability_and_reproducibility'
  ]);
  assert.deepEqual(Object.values(assessment.dimensions).map((dimension) => dimension.score), [5, 5, 4, 5, 5, 5]);
  assert.equal(assessment.total_score, 29);
  assert.equal(assessment.conclusion, 'high_quality_verified_full_chapter');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
  assert.equal(Object.values(assessment.dimensions).every((dimension) => dimension.evidence_gate_ids.length > 0 && dimension.evidence.length > 80), true);
});

test('kapittelregistrering avanserer monotont og source briefen forblir historisk input', () => {
  const { registry, status, sourceBrief, chapter } = buildFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);
  assert.equal(versionAtLeast(registry.version, '3.01.0'), true);
  assert.equal(versionAtLeast(status.version, '1.94.0'), true);
  assert.equal(registered.file, 'data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet.json');
  assert.equal(registered.claimsFile, 'data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet/claims.json');
  assert.equal(registered.briefFile, 'data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet/brief.json');
  assert.equal(isFilmTvUnitFourteenOrLaterGate(film.nextGate), true);
  assert.equal([
    'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief',
    'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit',
    'maintenance_source_refresh_and_place_case_expansion'
  ].includes(film.nextGate), true);
  assert.equal(sourceBrief.status, 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production');
  assert.equal(sourceBrief.runtime_registration.registered, false);
  assert.equal(sourceBrief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.deepEqual(sourceBrief.production_requirements.current_claim_plan_counts_by_emne, [5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 4]);
});

test('materializer og audit er deterministiske og inneholder ingen SCM-synk', () => {
  const built = buildFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  assert.deepEqual(built.chapter, read('data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet.json'));
  assert.deepEqual(built.chapterBrief, read('data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet/brief.json'));
  assert.deepEqual(built.claimsDoc, read('data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet/claims.json'));
  assert.deepEqual(built.registry, read('data/fagverk/fagverk_registry.json'));
  assert.deepEqual(built.status, read('data/fagverk/subject_status.json'));
  built.modules.forEach((module, index) => assert.deepEqual(module, read(built.chapter.moduleFiles[index])));
  for (const relative of [
    '../scripts/materialize-film-tv-archive-preservation-access-authenticity-fulltext-v1.mjs',
    '../scripts/audit-film-tv-archive-preservation-access-authenticity-fulltext-v1.mjs'
  ]) {
    const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/u);
  }
});
