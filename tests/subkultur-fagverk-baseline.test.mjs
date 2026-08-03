import test from 'node:test';
import assert from 'node:assert/strict';
import { auditRepository, buildReport } from '../scripts/audit-subkultur-fagverk-baseline.mjs';

test('Subkultur-kontrakten låser åtte domener og 80 teoriobjekter uten å forskuttere complete', () => {
  const report = auditRepository();
  assert.equal(report.targets.domain_count, 8);
  assert.equal(report.targets.emne_count, 80);
  assert.equal(report.targets.theory_object_count, 80);
  assert.equal(report.targets.chapter_count, 8);
  assert.equal(report.targets.modules_per_chapter, 3);
  assert.equal(report.targets.sections_per_chapter, 9);
  assert.equal(report.targets.paragraphs_per_chapter, 27);
  assert.equal(report.targets.minimum_claims_per_chapter, 36);
  assert.equal(report.targets.minimum_sources_per_chapter, 20);
  assert.equal(report.targets.minimum_places_per_chapter, 6);
  assert.equal(report.targets.subject_pathway_count, 8);
  assert.equal(report.targets.questions_per_pathway, 5);
  assert.deepEqual(report.status_guard, {
    expected_navigation_status: 'planned',
    expected_assessment_status: 'pending',
    expected_editorial_status: 'not_started',
    completion_status_change_allowed: false
  });
});

test('den levende baselineen registrerer canonical-laget uten å skjule neste produksjonsgap', () => {
  const report = buildReport();
  assert.equal(report.status, 'CANONICAL_LAYER_MATERIALIZED');
  assert.equal(report.current.domains, 8);
  assert.equal(report.current.hooks, 80);
  assert.equal(report.current.emner, 80);
  assert.equal(report.current.mapped_emner, 80);
  assert.deepEqual(report.current.unmapped_emne_ids, []);
  assert.equal(report.current.methods, 43);
  assert.equal(report.current.unique_method_descriptions, 43);
  assert.equal(report.current.generic_definition_count, 0);
  assert.equal(report.current.missing_definition_count, 0);
  assert.equal(report.gaps.theory_objects, 80);
});

test('runtime, teori, kapitler, caseprofil og pathways er eksplisitte produksjonsgap', () => {
  const report = buildReport();
  assert.equal(report.current.fagverk_chapters, 0);
  assert.equal(report.current.runtime_manifest_exists, false);
  assert.equal(report.current.registry_subject_exists, false);
  assert.equal(report.gaps.theory_objects, 80);
  assert.equal(report.gaps.chapters, 8);
  assert.equal(report.gaps.pathways, 8);
  assert.ok(report.current.absent_production_files.length >= 7);
});

test('Places, People og legacyquiz holdes utenfor fullstendighetsbeviset', () => {
  const report = buildReport();
  assert.equal(report.current.subkultur_places, 68);
  assert.equal(report.current.primary_subkultur_places, 56);
  assert.equal(report.current.secondary_subkultur_places, 12);
  assert.equal(report.current.subkultur_people, 66);
  assert.equal(report.current.people_with_subkultur_emne, 0);
  assert.equal(report.current.legacy_quiz.active_legacy_questions, 73);
  assert.equal(report.current.legacy_quiz.active_without_sources, 73);
  assert.equal(report.current.legacy_quiz.active_without_knowledge, 73);
  assert.equal(report.current.legacy_quiz.from_by_with_foreign_emne, 10);
});
