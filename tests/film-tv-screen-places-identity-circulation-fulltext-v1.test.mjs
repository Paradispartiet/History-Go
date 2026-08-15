import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildFilmTvScreenPlacesIdentityCirculationFulltextV1,
  buildClaimSourceIdsByClaim
} from '../scripts/materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs';
import {
  auditFilmTvScreenPlacesIdentityCirculationFulltextV1
} from '../scripts/audit-film-tv-screen-places-identity-circulation-fulltext-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  }
  return true;
};

test('tolvte planenhet er fulltekstregistrert med variabelt omfang og komplett claimspor', () => {
  const report = auditFilmTvScreenPlacesIdentityCirculationFulltextV1();
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
    paragraph_count: 52,
    verified_claim_count: 52,
    used_source_count: 36,
    case_count: 33,
    self_check_count: 12
  });
  assert.ok(report.summary.method_count >= 12);
  assert.ok(report.summary.minimum_paragraph_word_count >= 150);
  assert.ok(report.summary.maximum_repeated_sentence_count <= 3);
  assert.deepEqual(report.module_paragraph_counts, [13, 10, 15, 14]);
  assert.equal(Object.values(report.gates).every(Boolean), true);
});

test('alle 52 sluttclaims har claimspesifikk evidens og bruker alle 36 briefkilder', () => {
  const built = buildFilmTvScreenPlacesIdentityCirculationFulltextV1();
  const expected = buildClaimSourceIdsByClaim(built.topicBriefs);
  const claims = built.claimsDoc.claims;
  const usedSources = new Set(claims.flatMap((claim) => claim.source_ids));

  assert.equal(claims.length, 52);
  assert.equal(new Set(claims.map((claim) => claim.id)).size, 52);
  assert.deepEqual(new Set(Object.keys(expected)), new Set(claims.map((claim) => claim.id)));
  assert.equal(claims.every((claim) => claim.status === 'verified'), true);
  assert.equal(claims.every((claim) => claim.plan_resolution === 'verified_as_planned'), true);
  assert.equal(claims.every((claim) => claim.source_ids.length >= 2), true);
  assert.equal(claims.every((claim) => assert.deepEqual(claim.source_ids, expected[claim.id]) === undefined), true);
  assert.equal(built.sources.every((source) => usedSources.has(source.id)), true);
});

test('alle emneeide seksjoner er substansielle, forskningsforankrede og metodisk eksplisitte', () => {
  const chapter = read('data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon.json');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claimIds = sections.flatMap((section) => section.paragraphClaimIds || []).flat();

  assert.equal(sections.length, 11);
  assert.equal(new Set(sections.map((section) => section.emne_ids[0])).size, 11);
  assert.equal(paragraphs.length, 52);
  assert.equal(new Set(paragraphs).size, 52);
  assert.equal(paragraphs.every((paragraph) => paragraph.length >= 900 && wordCount(paragraph) >= 150), true);
  assert.equal(claimIds.length, 52);
  assert.equal(new Set(claimIds).size, 52);
  assert.equal(sections.every((section) => section.documentedCaseIds.length >= 3), true);
  assert.equal(sections.every((section) => section.theoryResearchers.length >= 2), true);
  assert.equal(sections.every((section) => section.methodLimits.length >= 2), true);
  assert.equal(sections.every((section) => section.documentedDisagreement.length >= 120), true);
  assert.equal(sections.every((section) => section.keyPoints.length === 2), true);
  assert.equal(sections.every((section) => section.keyPointClaimIds.length === section.keyPoints.length), true);
  assert.equal(modules.every((module) => (module.selfCheck || []).length === 3), true);
});

test('sted-, kart-, identitets-, urfolks-, myte-, minne- og enhet 13-grenser er permanente', () => {
  const report = auditFilmTvScreenPlacesIdentityCirculationFulltextV1();
  for (const gate of [
    'four_place_and_viewing_layers_separated',
    'maps_routes_and_databases_bounded',
    'interior_building_set_and_lived_home_separated',
    'landscape_atmosphere_environment_and_production_effect_separated',
    'indigenous_source_control_and_arctic_diversity_explicit',
    'mobility_exile_diaspora_and_viewing_layers_separated',
    'identity_representation_and_lived_belonging_separated',
    'iconicity_myth_memory_and_local_effect_separated',
    'archive_provenance_and_memory_effect_bounded',
    'unit_thirteen_boundary_explicit'
  ]) assert.equal(report.gates[gate], true, gate);
});

test('seksdelt kvalitetsvurdering består med 29 av 30 og uten blokkere', () => {
  const assessment = auditFilmTvScreenPlacesIdentityCirculationFulltextV1().quality_assessment;
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

test('kapittelregistrering avanserer monotont og source briefen forblir historisk input', () => {
  const { registry, status, sourceBrief, chapter } = buildFilmTvScreenPlacesIdentityCirculationFulltextV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);

  assert.equal(versionAtLeast(registry.version, '2.97.0'), true);
  assert.equal(versionAtLeast(status.version, '1.90.0'), true);
  assert.equal(registered.file, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon.json');
  assert.equal(registered.claimsFile, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon/claims.json');
  assert.equal(registered.briefFile, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon/brief.json');
  assert.equal(film.nextGate, 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief');
  assert.equal(sourceBrief.status, 'source_claim_brief_complete_full_chapter_production');
  assert.equal(sourceBrief.runtime_registration.registered, false);
  assert.equal(sourceBrief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.deepEqual(sourceBrief.production_requirements.current_claim_plan_counts_by_emne, [5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 4]);
});

test('materializer og audit er deterministiske og inneholder ingen SCM-synk', () => {
  const built = buildFilmTvScreenPlacesIdentityCirculationFulltextV1();
  assert.deepEqual(built.chapter, read('data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon.json'));
  assert.deepEqual(built.chapterBrief, read('data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon/brief.json'));
  assert.deepEqual(built.claimsDoc, read('data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon/claims.json'));
  assert.deepEqual(built.registry, read('data/fagverk/fagverk_registry.json'));
  assert.deepEqual(built.status, read('data/fagverk/subject_status.json'));
  built.modules.forEach((module, index) => assert.deepEqual(module, read(built.chapter.moduleFiles[index])));
  for (const relative of [
    '../scripts/materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs',
    '../scripts/audit-film-tv-screen-places-identity-circulation-fulltext-v1.mjs'
  ]) {
    const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/u);
  }
});
