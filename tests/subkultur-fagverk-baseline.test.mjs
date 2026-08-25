import test from 'node:test';
import assert from 'node:assert/strict';
import { auditRepository, buildReport, readLockedReport } from '../scripts/audit-subkultur-fagverk-baseline.mjs';

test('Subkultur-kontrakten låser åtte domener og 80 teoriobjekter gjennom sluttporten', () => {
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
    expected_navigation_status: 'materialized',
    expected_assessment_status: 'audited',
    expected_editorial_status: 'complete',
    completion_status_change_allowed: true
  });
});

test('historisk baseline forblir låst etter at produksjonen starter', () => {
  const report = readLockedReport();
  assert.equal(report.current.domains, 6);
  assert.equal(report.current.hooks, 60);
  assert.equal(report.current.emner, 72);
  assert.equal(report.current.mapped_emner, 69);
  assert.deepEqual(report.current.unmapped_emne_ids, [
    'em_sub_grunnbegreper',
    'em_sub_musikkscener',
    'em_sub_stil_kropp_symboler'
  ]);
  assert.equal(report.current.methods, 71);
  assert.equal(report.current.unique_method_descriptions, 21);
  assert.equal(report.current.generic_definition_count, 69);
  assert.equal(report.current.missing_definition_count, 3);
});

test('live gaprapport lukker teori-, kapittel-, pathway- og runtimeporten', () => {
  const report = buildReport();
  assert.equal(report.current.fagverk_chapters, 8);
  assert.equal(report.current.theory_objects, 80);
  assert.equal(report.current.evidence_ready_theory_objects, 80);
  assert.equal(report.current.runtime_manifest_exists, true);
  assert.equal(report.current.registry_subject_exists, true);
  assert.equal(report.gaps.theory_objects, 0);
  assert.equal(report.gaps.chapters, 0);
  assert.equal(report.gaps.pathways, 0);
  assert.ok(!report.current.absent_production_files.includes('data/fag/subkultur/subkultur_runtime_manifest.json'));
  assert.ok(!report.current.absent_production_files.includes('data/fag/profiles/subkultur/manifest.json'));
  assert.ok(!report.current.absent_production_files.includes('data/quiz/subkultur/subkultur_subject_pathways_v1.json'));
});

test('Places og People følger dataauditen mens legacyquiz holdes utenfor fullstendighetsbeviset', () => {
  const report = buildReport();
  assert.equal(report.current.subkultur_places, 65);
  assert.equal(report.current.primary_subkultur_places, 54);
  assert.equal(report.current.secondary_subkultur_places, 11);
  assert.equal(report.current.places_with_subkultur_emne, 65);
  assert.equal(report.current.subkultur_people, 45);
  assert.equal(report.current.people_with_subkultur_emne, 45);
  assert.equal(report.current.legacy_quiz.active_legacy_questions, 73);
  assert.equal(report.current.legacy_quiz.active_without_sources, 73);
  assert.equal(report.current.legacy_quiz.active_without_knowledge, 73);
  assert.equal(report.current.legacy_quiz.from_by_with_foreign_emne, 10);
});

test('live audit dokumenterer ferdig materialisering', () => {
  const report = auditRepository();
  assert.equal(report.current.domains, 8);
  assert.equal(report.current.hooks, 80);
  assert.equal(report.current.emner, 80);
  assert.equal(report.current.mapped_emner, 80);
  assert.ok(report.current.methods >= 35 && report.current.methods <= 50);
  assert.equal(report.current.generic_definition_count, 0);
  assert.equal(report.current.missing_definition_count, 0);
  assert.equal(report.current.navigation_status, 'materialized');
  assert.equal(report.current.assessment_status, 'audited');
  assert.equal(report.current.editorial_status, 'complete');
});
