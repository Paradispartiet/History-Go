import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildFilmTvLocationProductionPlaceEthicsFulltextV1, buildClaimSourceIdsByClaim } from '../scripts/materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs';
import { auditFilmTvLocationProductionPlaceEthicsFulltextV1 } from '../scripts/audit-film-tv-location-production-place-ethics-fulltext-v1.mjs';
import { isFilmTvUnitThirteenOrLaterGate } from '../scripts/brief-film-tv-location-production-place-ethics-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number); const b = String(minimum).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  return true;
};

test('trettende planenhet er fulltekstregistrert med variabelt omfang og komplett claimspor', () => {
  const report = auditFilmTvLocationProductionPlaceEthicsFulltextV1();
  assert.deepEqual({
    emne_count: report.summary.emne_count, module_count: report.summary.module_count, section_count: report.summary.section_count,
    paragraph_count: report.summary.paragraph_count, verified_claim_count: report.summary.verified_claim_count,
    used_source_count: report.summary.used_source_count, case_count: report.summary.case_count, self_check_count: report.summary.self_check_count
  }, { emne_count: 8, module_count: 4, section_count: 8, paragraph_count: 39, verified_claim_count: 39, used_source_count: 26, case_count: 24, self_check_count: 12 });
  assert.ok(report.summary.method_count >= 8);
  assert.ok(report.summary.minimum_paragraph_word_count >= 150);
  assert.ok(report.summary.maximum_repeated_sentence_count <= 3);
  assert.deepEqual(report.module_paragraph_counts, [10, 9, 10, 10]);
  assert.equal(Object.values(report.gates).every(Boolean), true);
});

test('alle 39 sluttclaims har claimspesifikk evidens og bruker alle 26 briefkilder', () => {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  const expected = buildClaimSourceIdsByClaim(built.topicBriefs);
  const claims = built.claimsDoc.claims;
  const usedSources = new Set(claims.flatMap((claim) => claim.source_ids));
  assert.equal(claims.length, 39);
  assert.equal(new Set(claims.map((claim) => claim.id)).size, 39);
  assert.deepEqual(new Set(Object.keys(expected)), new Set(claims.map((claim) => claim.id)));
  assert.equal(claims.every((claim) => claim.status === 'verified' && claim.plan_resolution === 'verified_as_planned'), true);
  assert.equal(claims.every((claim) => claim.source_ids.length >= 2), true);
  assert.equal(claims.every((claim) => assert.deepEqual(claim.source_ids, expected[claim.id]) === undefined), true);
  assert.equal(built.sources.every((source) => usedSources.has(source.id)), true);
});

test('åtte emneeide seksjoner er substansielle, forskningsforankrede og metodisk eksplisitte', () => {
  const chapter = read('data/fagverk/film_tv/location-produksjon-og-stedsetikk.json');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claimIds = sections.flatMap((section) => section.paragraphClaimIds || []);
  assert.equal(sections.length, 8);
  assert.equal(new Set(sections.map((section) => section.emne_ids[0])).size, 8);
  assert.equal(paragraphs.length, 39);
  assert.equal(new Set(paragraphs).size, 39);
  assert.equal(paragraphs.every((paragraph) => paragraph.length >= 900 && wordCount(paragraph) >= 150), true);
  assert.equal(claimIds.length, 39);
  assert.equal(new Set(claimIds).size, 39);
  assert.equal(sections.every((section) => section.documentedCaseIds.length >= 3), true);
  assert.equal(sections.every((section) => section.theoryResearchers.length >= 2), true);
  assert.equal(sections.every((section) => section.methodLimits.length >= 2), true);
  assert.equal(sections.every((section) => section.documentedDisagreement.length >= 120), true);
  assert.equal(sections.every((section) => section.keyPoints.length === 2 && section.keyPointClaimIds.length === 2), true);
  assert.equal(modules.every((module) => module.selfCheck.length === 3), true);
});

test('samtykke-, urfolks-, miljø-, virtuelt rom- og turismegrensene er permanente', () => {
  const report = auditFilmTvLocationProductionPlaceEthicsFulltextV1();
  for (const gate of [
    'represented_shooting_base_and_local_effect_separated',
    'permission_consent_consultation_and_protocol_separated',
    'indigenous_collective_rights_and_source_control_explicit',
    'carbon_and_site_ecology_separated',
    'permit_compliance_outcome_separated',
    'physical_change_restoration_and_no_harm_separated',
    'physical_virtual_and_fictional_spaces_separated',
    'tourism_measurement_and_causal_effect_separated',
    'archive_unit_fourteen_boundary_explicit'
  ]) assert.equal(report.gates[gate], true, gate);
});

test('seksdelt kvalitetsvurdering består med 29 av 30 uten blokkere', () => {
  const assessment = auditFilmTvLocationProductionPlaceEthicsFulltextV1().quality_assessment;
  assert.deepEqual(Object.keys(assessment.dimensions), ['correctness_and_evidence', 'coverage_and_completion', 'editorial_quality', 'technical_integrity', 'safety_and_responsibility', 'maintainability_and_reproducibility']);
  assert.deepEqual(Object.values(assessment.dimensions).map((dimension) => dimension.score), [5, 5, 4, 5, 5, 5]);
  assert.equal(assessment.total_score, 29);
  assert.equal(assessment.conclusion, 'high_quality_verified_full_chapter');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
  assert.equal(Object.values(assessment.dimensions).every((dimension) => dimension.evidence_gate_ids.length > 0 && dimension.evidence.length > 60), true);
});

test('kapittelregistrering avanserer monotont og source briefen forblir historisk input', () => {
  const { registry, status, sourceBrief, chapter } = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);
  assert.equal(versionAtLeast(registry.version, '2.99.0'), true);
  assert.equal(versionAtLeast(status.version, '1.92.0'), true);
  assert.equal(registered.file, 'data/fagverk/film_tv/location-produksjon-og-stedsetikk.json');
  assert.equal(registered.claimsFile, 'data/fagverk/film_tv/location-produksjon-og-stedsetikk/claims.json');
  assert.equal(registered.briefFile, 'data/fagverk/film_tv/location-produksjon-og-stedsetikk/brief.json');
  assert.equal(isFilmTvUnitThirteenOrLaterGate(film.nextGate), true);
  assert.equal(sourceBrief.status, 'location_production_place_ethics_source_brief_complete_full_chapter_production');
  assert.equal(sourceBrief.runtime_registration.registered, false);
  assert.equal(sourceBrief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.deepEqual(sourceBrief.production_requirements.current_claim_plan_counts_by_emne, [5, 5, 4, 5, 5, 5, 5, 5]);
});

test('materializer og audit er deterministiske og inneholder ingen SCM-synk', () => {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  assert.deepEqual(built.chapter, read('data/fagverk/film_tv/location-produksjon-og-stedsetikk.json'));
  assert.deepEqual(built.chapterBrief, read('data/fagverk/film_tv/location-produksjon-og-stedsetikk/brief.json'));
  assert.deepEqual(built.claimsDoc, read('data/fagverk/film_tv/location-produksjon-og-stedsetikk/claims.json'));
  assert.deepEqual(built.registry, read('data/fagverk/fagverk_registry.json'));
  assert.deepEqual(built.status, read('data/fagverk/subject_status.json'));
  built.modules.forEach((module, index) => assert.deepEqual(module, read(built.chapter.moduleFiles[index])));
  for (const relative of ['../scripts/materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs', '../scripts/audit-film-tv-location-production-place-ethics-fulltext-v1.mjs']) {
    const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/u);
  }
});
