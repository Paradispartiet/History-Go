import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CLAIM_SOURCE_IDS,
  buildFilmTvReceptionParticipationAudienceMethodsFulltextV1
} from '../scripts/materialize-film-tv-reception-participation-audience-methods-fulltext-v1.mjs';
import {
  auditFilmTvReceptionParticipationAudienceMethodsFulltextV1
} from '../scripts/audit-film-tv-reception-participation-audience-methods-fulltext-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;
const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  }
  return true;
};

test('ellevte planenhet er fulltekstregistrert med variabelt omfang og komplett claimspor', () => {
  const report = auditFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  assert.deepEqual(report.summary, {
    emne_count: 12,
    module_count: 4,
    section_count: 12,
    paragraph_count: 54,
    verified_claim_count: 54,
    used_source_count: 36,
    case_count: 32,
    method_count: report.summary.method_count,
    self_check_count: report.summary.self_check_count,
    minimum_paragraph_word_count: report.summary.minimum_paragraph_word_count
  });
  assert.deepEqual(report.module_paragraph_counts, [17, 14, 13, 10]);
  assert.ok(report.summary.method_count > 0);
  assert.ok(report.summary.self_check_count >= 12);
  assert.ok(report.summary.minimum_paragraph_word_count >= 65);
  assert.equal(Object.values(report.gates).every(Boolean), true);
});

test('alle 54 sluttclaims har eksakt claimspesifikk evidens og bruker alle 36 briefkilder', () => {
  const { claimsDoc, sources, topicBriefs } =
    buildFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  const topicByClaim = new Map();
  for (const topic of topicBriefs) {
    for (const claim of topic.planned_claims) topicByClaim.set(claim.id, topic);
  }
  const usedSources = new Set(claimsDoc.claims.flatMap((claim) => claim.source_ids));

  assert.equal(claimsDoc.claims.length, 54);
  assert.equal(new Set(claimsDoc.claims.map((claim) => claim.id)).size, 54);
  assert.deepEqual(new Set(Object.keys(CLAIM_SOURCE_IDS)), new Set(claimsDoc.claims.map((claim) => claim.id)));
  assert.equal(claimsDoc.claims.every((claim) => claim.status === 'verified'), true);
  assert.equal(claimsDoc.claims.every((claim) => claim.plan_resolution === 'verified_as_planned'), true);
  assert.equal(claimsDoc.claims.every((claim) => claim.source_ids.length > 0), true);
  assert.equal(claimsDoc.claims.every((claim) =>
    claim.source_ids.every((sourceId) => topicByClaim.get(claim.id).source_ids.includes(sourceId))
  ), true);
  assert.equal(claimsDoc.claims.some((claim) =>
    claim.source_ids.length < topicByClaim.get(claim.id).source_ids.length
  ), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
});

test('alle emneeide seksjoner er substansielle, forskningsforankrede og metodisk eksplisitte', () => {
  const chapter = read('data/fagverk/film_tv/resepsjon-deltakelse-og-publikumsmetoder.json');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claimIds = sections.flatMap((section) => section.paragraphClaimIds || []).flat();

  assert.equal(sections.length, 12);
  assert.equal(new Set(sections.map((section) => section.emne_ids[0])).size, 12);
  assert.equal(paragraphs.length, 54);
  assert.equal(new Set(paragraphs).size, 54);
  assert.equal(paragraphs.every((paragraph) => paragraph.length >= 500 && wordCount(paragraph) >= 65), true);
  assert.equal(claimIds.length, 54);
  assert.equal(new Set(claimIds).size, 54);
  assert.equal(sections.every((section) => section.documentedCaseIds.length >= 2), true);
  assert.equal(sections.every((section) => section.theoryResearchers.length >= 2), true);
  assert.equal(sections.every((section) => section.methodLimits.length >= 2), true);
  assert.equal(sections.every((section) => section.documentedDisagreement.length >= 80), true);
  assert.equal(sections.every((section) => section.keyPoints.length >= 2), true);
  assert.equal(sections.every((section) => section.keyPointClaimIds.length === section.keyPoints.length), true);
  assert.equal(sections.every((section) => section.keyPointClaimIds.every((ids) => Array.isArray(ids) && ids.length > 0)), true);
  assert.equal(modules.every((module) => (module.selfCheck || []).length >= 3), true);
});

test('publikums-, identitets-, tilgjengelighets- og forskningsetikkgrenser er permanente', () => {
  const report = auditFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  for (const gate of [
    'actual_reception_is_separated_from_textual_possibility',
    'audience_units_and_respondent_roles_are_separate',
    'expectation_and_repeat_constructs_are_separate',
    'participation_identity_and_cult_boundaries_are_explicit',
    'criticism_archive_and_accessibility_boundaries_are_explicit',
    'identification_affect_and_experimental_scope_are_explicit',
    'children_and_digital_research_ethics_are_explicit',
    'mixed_methods_and_triangulation_report_disagreement'
  ]) {
    assert.equal(report.gates[gate], true, gate);
  }
});

test('seksdelt kvalitetsvurdering består med 29 av 30 og uten blokkere', () => {
  const report = auditFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  const assessment = report.quality_assessment;
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
  assert.equal(Object.values(assessment.dimensions).every((dimension) =>
    dimension.evidence_gate_ids.length > 0 && dimension.evidence.length > 60
  ), true);
});

test('kapittelregistrering avanserer monotont og source briefen forblir uendret historisk input', () => {
  const { registry, status, sourceBrief, chapter } =
    buildFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);

  assert.equal(versionAtLeast(registry.version, '2.95.0'), true);
  assert.equal(versionAtLeast(status.version, '1.88.0'), true);
  assert.ok(registry.updatedAt >= '2026-08-14');
  assert.ok(status.updatedAt >= '2026-08-14');
  assert.equal(registered.file, 'data/fagverk/film_tv/resepsjon-deltakelse-og-publikumsmetoder.json');
  assert.equal(registered.claimsFile, 'data/fagverk/film_tv/resepsjon-deltakelse-og-publikumsmetoder/claims.json');
  assert.equal(registered.briefFile, 'data/fagverk/film_tv/resepsjon-deltakelse-og-publikumsmetoder/brief.json');
  assert.equal([
    'reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief',
    'screen_places_identity_circulation_source_brief_complete_full_chapter_production',
    'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief',
    'location_production_place_ethics_source_brief_complete_full_chapter_production',
    'location_production_place_ethics_full_chapter_complete_next_unit_source_brief',
    'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production',
    'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief',
    'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit'
  ].includes(film.nextGate), true);
  assert.equal(sourceBrief.status, 'source_claim_brief_complete_full_chapter_production');
  assert.equal(sourceBrief.runtime_registration.registered, false);
  assert.equal(sourceBrief.runtime_registration.allowed_before_full_chapter_gate, false);
});

test('materializer og audit inneholder ingen SCM-synk eller GitHub-push', () => {
  for (const relative of [
    '../scripts/materialize-film-tv-reception-participation-audience-methods-fulltext-v1.mjs',
    '../scripts/audit-film-tv-reception-participation-audience-methods-fulltext-v1.mjs'
  ]) {
    const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
  }
});
