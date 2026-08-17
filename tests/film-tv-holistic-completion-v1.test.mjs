import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { auditFilmTvHolisticCompletionV1 } from '../scripts/audit-film-tv-holistic-completion-v1.mjs';

const APPROVED = [
  'verified_as_planned',
  'verified_after_scope_rewrite',
  'verified_after_case_narrowing',
  'verified_after_scope_narrowing'
];

const SHARED_VALIDATIONS = [
  ['subject inventory audit', ['scripts/audit-fagverk-subject-inventory.mjs']],
  ['general engine audit', ['scripts/audit-fagverk-general-engine.mjs']],
  ['Film TV phase3 audit', ['scripts/audit-fagverk-film-tv-phase3.mjs']],
  ['release manifest check', ['scripts/build-fagverk-release-manifest.mjs', '--check']],
  ['subject inventory test', ['--test', 'tests/fagverk-subject-inventory.test.mjs']],
  ['general engine test', ['--test', 'tests/fagverk-general-engine.test.mjs']],
  ['Film TV phase3 test', ['--test', 'tests/fagverk-film-tv-phase3.test.mjs']],
  ['release manifest test', ['--test', 'tests/fagverk-release-manifest.test.mjs']]
];

function workflowEscape(value) {
  return String(value).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

test('Film & TV completion is one reconciled 192-topic / 17-chapter evidence and trace contract', () => {
  const { report, registry, status } = auditFilmTvHolisticCompletionV1();
  assert.equal(report.summary.canonical_domain_count, 10);
  assert.equal(report.summary.canonical_emne_count, 192);
  assert.ok(report.summary.required_method_count > 0);
  assert.equal(report.summary.anchor_chapter_count, 2);
  assert.equal(report.summary.anchor_emne_count, 38);
  assert.equal(report.summary.planned_unit_count, 15);
  assert.equal(report.summary.planned_unit_emne_count, 154);
  assert.equal(report.summary.registered_chapter_count, 17);
  assert.ok(report.summary.module_count > 0);
  assert.ok(report.summary.section_count > 0);
  assert.ok(report.summary.paragraph_count > 0);
  assert.deepEqual(report.approved_plan_resolutions, APPROVED);
  assert.ok(report.observed_plan_resolutions.every((value) => APPROVED.includes(value)));
  assert.deepEqual(report.discrepancies, {
    missing_emne_ids: [],
    extra_emne_ids: [],
    duplicate_emne_ids: [],
    anchor_unit_overlap_ids: [],
    unknown_resolution_claim_ids: [],
    missing_method_ids: []
  });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.ok([...report.anchors, ...report.units].every((chapter) => chapter.brief_matches_chapter_emne_set));
  assert.ok(report.anchors.every((chapter) => chapter.section_topic_trace_mode === 'legacy_optional'));
  assert.ok(report.units.every((chapter) => chapter.section_topic_trace_mode === 'required_exact'));
  assert.ok(report.units.every((chapter) => chapter.sections_match_chapter_emne_set));
  assert.ok([...report.anchors, ...report.units].every((chapter) => chapter.optional_module_topic_declarations_consistent));
  assert.ok([...report.anchors, ...report.units].every((chapter) => chapter.all_paragraphs_claim_traced));
  assert.ok(report.anchors.every((chapter) => chapter.all_claims_verified_with_approved_resolution));
  assert.ok(report.anchors.every((chapter) => chapter.every_claim_uses_registered_source));
  assert.ok(report.anchors.every((chapter) => chapter.all_sources_inspectable));
  assert.ok(report.units.every((unit) => unit.exact_plan_emne_match));
  assert.ok(report.units.every((unit) => unit.all_claims_verified_with_approved_resolution));
  assert.ok(report.units.every((unit) => unit.unknown_resolution_claim_ids.length === 0));
  assert.ok([...report.anchors, ...report.units].every((chapter) => chapter.no_planned_only_claims));
  assert.ok(report.units.every((unit) => unit.every_claim_uses_registered_source));
  assert.ok(report.units.every((unit) => unit.all_sources_inspectable));

  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert.equal(filmStatus.navigationStatus, 'materialized');
  assert.equal(filmStatus.assessmentStatus, 'audited');
  assert.equal(filmStatus.editorialStatus, 'complete');
  assert.equal(filmStatus.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(registry.subjects.film_tv.editorialPlan.derivedChapterCount, 17);
  assert.equal(registry.subjects.film_tv.editorialPlan.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.ok(registry.subjects.film_tv.editorialPlan.completionRequirements.includes('registry_chapter_and_brief_topic_ownership_is_exact'));
  assert.ok(registry.subjects.film_tv.editorialPlan.completionRequirements.includes('all_planned_unit_sections_own_exact_topic_sets'));
  assert.ok(registry.subjects.film_tv.editorialPlan.completionRequirements.includes('all_paragraphs_have_registered_claim_trace'));
  assert.ok(registry.subjects.film_tv.editorialPlan.completionRequirements.includes('claim_and_section_ids_are_globally_unique'));
  assert.ok(registry.subjects.film_tv.editorialPlan.completionRequirements.includes('all_canonical_methods_and_domains_are_covered'));
  assert.ok(registry.subjects.film_tv.editorialPlan.completionRequirements.includes('all_unit_claims_verified_with_approved_resolution'));
});

test('shared deterministic Film & TV contracts remain green after holistic materialization', () => {
  for (const [label, args] of SHARED_VALIDATIONS) {
    const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
    if (result.status === 0) continue;
    const detail = `${result.stdout || ''}${result.stderr || ''}`.trim().slice(-6000);
    if (process.env.GITHUB_ACTIONS) {
      console.error(`::error title=Film TV shared validation failure::${workflowEscape(`${label}: ${detail}`)}`);
    }
    assert.equal(result.status, 0, `${label} failed:\n${detail}`);
  }
});
