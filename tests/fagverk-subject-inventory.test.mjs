import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository, buildBaselineReport } from '../scripts/audit-fagverk-subject-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('inventaret dekker 19 toppfag, Teknologi-spesialiseringen og alle required core-filer', () => {
  const r = auditRepository();
  assert.equal(r.subjectCount, 19);
  assert.equal(r.specializationCount, 1);
  assert.equal(r.coreFileAudit.length, 80);
  assert.equal(r.report.summary.schemaFamilyCount, 4);
});

test('statusregisteret tillater bare dokumentert fremdrift gjennom materialized og audited', () => {
  const s = readJson('data/fagverk/subject_status.json');
  const p = readJson('data/fagverk/fagverk_portal.json');
  const pb = new Map(p.categories.map((i) => [i.id, i]));
  for (const x of s.subjects) {
    const e = pb.get(x.id);
    assert.equal(x.navigationStatus, e.subjectStatus);
    if (x.editorialStatus !== 'not_started') {
      assert.equal(x.navigationStatus, 'materialized');
      assert.equal(x.assessmentStatus, 'audited');
    }
    if (x.navigationStatus === 'planned') {
      assert.equal(x.editorialStatus, 'not_started');
      assert.equal(e.subjectPage, '');
    }
  }
});

test('Auditerte fag har dokumentert og statusriktig fremdrift gjennom den generelle motoren', () => {
  const s = readJson('data/fagverk/subject_status.json');
  const audited = s.subjects.filter((x) => x.assessmentStatus === 'audited');
  assert.deepEqual(audited.map((x) => x.id), [
    'by', 'historie', 'kunst', 'litteratur', 'media', 'musikk', 'naeringsliv', 'natur',
    'politikk', 'psykologi', 'helse', 'religion', 'scenekunst', 'sport', 'subkultur', 'vitenskap',
    'filosofi', 'film_tv'
  ]);
  for (const id of ['utdanning']) {
    const subject = s.subjects.find((x) => x.id === id);
    assert.equal(subject.navigationStatus, 'planned');
    assert.equal(subject.assessmentStatus, 'pending');
    assert.equal(subject.editorialStatus, 'not_started');
  }
  const helse = s.subjects.find((x) => x.id === 'helse');
  assert.deepEqual([helse.navigationStatus, helse.assessmentStatus, helse.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  for (const id of audited.map((x) => x.id)) {
    const subject = s.subjects.find((x) => x.id === id);
    assert.equal(subject.navigationStatus, 'materialized');
    assert.equal(subject.assessmentStatus, 'audited');
  }

  for (const id of ['by', 'kunst', 'litteratur', 'musikk', 'naeringsliv', 'natur', 'subkultur']) {
    assert.equal(s.subjects.find((x) => x.id === id).editorialStatus, 'complete');
  }
  const historie = s.subjects.find((x) => x.id === 'historie');
  assert.equal(historie.editorialStatus, 'complete');
  assert.equal(historie.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  const politikk = s.subjects.find((x) => x.id === 'politikk');
  assert.equal(politikk.editorialStatus, 'expanded_and_audited');
  assert.equal(politikk.nextGate, 'source_refresh_and_case_expansion');
  for (const id of ['litteratur', 'naeringsliv', 'subkultur']) {
    assert.equal(s.subjects.find((x) => x.id === id).nextGate, 'maintenance_and_source_refresh');
  }

  const natur = s.subjects.find((x) => x.id === 'natur');
  assert.equal(natur.nextGate, 'complete');
  const musikk = s.subjects.find((x) => x.id === 'musikk');
  assert.equal(musikk.navigationStatus, 'materialized');
  assert.equal(musikk.assessmentStatus, 'audited');
  assert.equal(musikk.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(s.subjects.find((x) => x.id === 'by').nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(s.subjects.find((x) => x.id === 'kunst').nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  const media = s.subjects.find((x) => x.id === 'media');
  assert.equal(media.editorialStatus, 'complete');
  assert.equal(media.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

  const psykologi = s.subjects.find((x) => x.id === 'psykologi');
  const psykologiChapterCount = readJson('data/fagverk/fagverk_registry.json').subjects.psykologi.chapters.length;
  assert.ok(psykologiChapterCount >= 1 && psykologiChapterCount <= 6);
  if (psykologiChapterCount < 6) {
    assert.equal(psykologi.editorialStatus, 'chapters_in_progress');
    assert.equal(psykologi.nextGate, 'remaining_domain_chapter_production');
  } else {
    assert.equal(psykologi.editorialStatus, 'complete');
    assert.equal(psykologi.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  }

  const religion = s.subjects.find((x) => x.id === 'religion');
  assert.equal(religion.editorialStatus, 'complete');
  assert.equal(religion.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

  const scenekunst = s.subjects.find((x) => x.id === 'scenekunst');
  assert.equal(scenekunst.editorialStatus, 'complete');
  assert.equal(scenekunst.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

  const vitenskap = s.subjects.find((x) => x.id === 'vitenskap');
  const vitenskapReadiness = readJson('data/fag/vitenskap/vitenskap_university_readiness_v1.json');
  const vitenskapBlockers = vitenskapReadiness.breadth_blockers ?? [];
  if (vitenskapReadiness.complete_ready === true) {
    assert.equal(vitenskapBlockers.length, 0);
    assert.equal(vitenskap.editorialStatus, 'complete');
    assert.notEqual(vitenskap.nextGate, 'remaining_chapter_production_across_reconciled_university_breadth');
    assert.notEqual(vitenskap.nextGate, 'final_holistic_university_breadth_completion_audit');
  } else if (vitenskapBlockers.length === 0) {
    assert.equal(vitenskapReadiness.status, 'breadth_chapters_materialized_final_audit_pending');
    assert.equal(vitenskapReadiness.next_gate, 'final_holistic_university_breadth_completion_audit');
    assert.equal(vitenskap.editorialStatus, 'chapters_in_progress');
    assert.equal(vitenskap.nextGate, 'final_holistic_university_breadth_completion_audit');
  } else {
    assert.equal(vitenskap.editorialStatus, 'chapters_in_progress');
    assert.equal(vitenskap.nextGate, 'remaining_chapter_production_across_reconciled_university_breadth');
  }

  // Filosofi is complete only when the explicit major-field coverage contract and
  // article-by-article university review agree. Keep the status gate tied to that
  // canonical contract instead of freezing a historical 13-field snapshot here.
  const filosofi = s.subjects.find((x) => x.id === 'filosofi');
  const filosofiCompletion = readJson('data/fagverk/filosofi/filosofi_completion_v1.json');
  const filosofiCoverage = readJson('data/fagverk/filosofi/filosofi_field_coverage_v1.json');
  const expected = filosofiCoverage.expected_counts;
  assert.equal(filosofiCoverage.status, 'major_university_fields_complete');
  assert.equal(filosofiCompletion.standalone_article_count, expected.articles);
  assert.equal(filosofiCompletion.chapter_count, expected.chapters);
  assert.equal(filosofiCompletion.canonical_concept_count, expected.concepts);
  assert.equal(filosofiCompletion.canonical_method_count, expected.methods);
  assert.equal(filosofi.navigationStatus, 'materialized');
  assert.equal(filosofi.assessmentStatus, 'audited');
  assert.equal(filosofi.editorialStatus, filosofiCompletion.complete_ready ? 'complete' : 'expanded_and_audited');
  assert.equal(
    filosofi.nextGate,
    filosofiCompletion.complete_ready
      ? 'maintenance_source_refresh_and_place_case_expansion'
      : 'university_depth_article_by_article_review'
  );
  assert.equal(
    filosofiCompletion.complete_ready,
    filosofiCompletion.reviewed_article_count === expected.articles && filosofiCoverage.complete_ready
  );

  const filmTv = s.subjects.find((x) => x.id === 'film_tv');
  const filmTvChapterCount = readJson('data/fagverk/fagverk_registry.json').subjects.film_tv.chapters.length;
  assert.ok(filmTvChapterCount >= 1 && filmTvChapterCount <= 17);
  if (filmTv.editorialStatus === 'complete') {
    assert.equal(filmTvChapterCount, 17);
    assert.equal(filmTv.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
    const completion = readJson('reports/fagverk/film-tv-holistic-completion-v1-audit.json');
    assert.equal(completion.status, 'complete');
    assert.equal(completion.summary.canonical_emne_count, 192);
    assert.equal(completion.summary.anchor_chapter_count, 2);
    assert.equal(completion.summary.anchor_emne_count, 38);
    assert.equal(completion.summary.planned_unit_count, 15);
    assert.equal(completion.summary.planned_unit_emne_count, 154);
    assert.equal(completion.summary.registered_chapter_count, 17);
    assert.ok(Object.values(completion.gates).every(Boolean));
  } else {
    assert.equal(filmTv.editorialStatus, 'chapters_in_progress');
    const legacyFilmTvGates = new Set(['remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief']);
    const isFilmTvProductionGate = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit)$/.test(filmTv.nextGate);
    assert.ok(legacyFilmTvGates.has(filmTv.nextGate) || isFilmTvProductionGate);
  }
});

test('baseline report er en deterministisk projeksjon av eide kilder', () => {
  const categories = readJson('data/categories/category_contract.json');
  const manifest = readJson('data/fag/fag_manifest.json');
  const inventory = readJson('data/fagverk/subject_inventory.json');
  const status = readJson('data/fagverk/subject_status.json');
  const committed = readJson('reports/fagverk/subject-baseline.json');
  assert.deepEqual(committed, buildBaselineReport({ categories, manifest, inventory, status }));
});

test('Musikk deklarerer vitenskapelig pakke uten å opprette ny schemafamilie', () => {
  const i = readJson('data/fagverk/subject_inventory.json');
  const m = readJson('data/fag/fag_manifest.json');
  const music = i.subjects.find((x) => x.id === 'musikk');
  assert.equal(music.schemaFamily, 'standard_canonical');
  assert.ok(music.optionalManifestFields.includes('scientificPackage'));
  assert.equal(m.musikk.scientificPackage, 'musikk/scientific_package.json');
});

test('pilotsettet dekker fire schemafamilier uten å gjøre Teknologi til toppfag', () => {
  const i = readJson('data/fagverk/subject_inventory.json');
  const m = readJson('data/fag/fag_manifest.json');
  const pilots = i.subjects.filter((x) => x.pilot);
  assert.deepEqual(pilots.map((x) => x.id).sort(), ['by', 'natur', 'religion', 'vitenskap']);
  const t = i.subjects.find((x) => x.id === 'vitenskap').specializations.find((x) => x.id === 'teknologi');
  assert.equal(t.schemaFamily, 'technology_scientific_v2_4');
  assert.equal(t.pilot, true);
  assert.ok(m.vitenskap.specializations.teknologi);
  assert.equal(m.teknologi, undefined);
  assert.equal(new Set([...pilots.map((x) => x.schemaFamily), t.schemaFamily]).size, 4);
});

test('19+1-utvidelsen låser seks eksplisitte canonicale underkategorier', () => {
  const c = readJson('data/categories/category_contract.json');
  const rows = Object.entries(c.canonicalSubcategories).flatMap(([owner, items]) =>
    items.map((item) => `${owner}/${item.id}`)
  );
  assert.deepEqual(rows, [
    'natur/geografi',
    'litteratur/sprak_lingvistikk',
    'politikk/juss_rettsvitenskap',
    'politikk/sosiologi_antropologi',
    'helse/medisin_helsevitenskap',
    'utdanning/pedagogikk_utdanningsvitenskap'
  ]);
  assert.equal(c.labels.litteratur, 'Språk & litteratur');
});

test('Helse er strict-complete og Utdanning beholder konsistent expansion foundation', () => {
  const manifest = readJson('data/fag/fag_manifest.json');
  const status = readJson('data/fagverk/subject_status.json');
  const registry = readJson('data/fagverk/fagverk_registry.json');
  const reconciliation = readJson('reports/fagverk/fagverk-expansion-19-plus-1-reconciliation-v1.json');
  const registeredHealthChapterCount = registry.subjects.helse.editorialPlan.registeredChapterCount;

  for (const id of ['helse', 'utdanning']) {
    const entry = manifest[id];
    const pensum = readJson(`data/fag/${entry.pensum}`);
    const emner = readJson(`data/fag/${entry.emner}`);
    const fagkart = readJson(`data/fag/${entry.fagkart}`);
    const methods = readJson(`data/fag/${entry.methods}`);
    const quizProfile = readJson(`data/fag/${entry.supersetQuizMal}`);
    const subjectStatus = status.subjects.find((subject) => subject.id === id);

    assert.equal(entry.status, id === 'helse' ? 'active_foundation' : 'expansion_foundation');
    assert.equal(pensum.subject_id, id);
    assert.equal(pensum.status, id === 'helse' ? 'complete' : 'canonical_expansion_foundation');
    assert.equal(pensum.complete_ready, id === 'helse');
    assert.deepEqual(pensum.domain_order, pensum.domains.map((domain) => domain.domain_id));
    assert.deepEqual(emner.map((emne) => emne.domain), pensum.domain_order);
    assert.deepEqual(fagkart.categories.map((category) => category.id), pensum.domain_order);
    assert.ok(emner.every((emne) => emne.subject_id === id));
    assert.equal(emner.filter((emne) => emne.status === 'materialized').length, id === 'helse' ? registeredHealthChapterCount : 0);
    assert.ok(emner.every((emne) => ['planned', 'materialized'].includes(emne.status)));
    const methodIds = new Set(methods.methods.map((method) => method.method_id));
    assert.ok(emner.flatMap((emne) => emne.method_ids).every((methodId) => methodIds.has(methodId)));
    assert.ok(methods.methods.every((method) => ['planned', 'materialized'].includes(method.canonical_status)));
    assert.equal(quizProfile.status, 'canonical_category_profile');
    assert.equal(quizProfile.governance.authority, 'category_content_only');
    assert.equal(subjectStatus.navigationStatus, id === 'helse' ? 'materialized' : 'planned');
    assert.equal(subjectStatus.assessmentStatus, id === 'helse' ? 'audited' : 'pending');
    assert.equal(subjectStatus.editorialStatus, id === 'helse' ? 'complete' : 'not_started');
    if (id === 'helse') {
      assert.equal(subjectStatus.nextGate, 'complete');
      assert.equal(registry.subjects.helse.editorialPlan.strictCompletionProof.status, 'strictly_proven');
      assert.equal(registry.subjects.helse.editorialPlan.strictCompletionProof.canonical_major_fields, 12);
    } else {
      assert.equal(subjectStatus.nextGate, 'first_source_brief_after_repository_reconciliation');
    }
  }

  const safety = readJson(`data/fag/${manifest.helse.safetyContract}`);
  assert.equal(safety.status, 'blocking');
  assert.ok(safety.forbidden.some((rule) => /individuell diagnose/u.test(rule)));
  assert.ok(safety.forbidden.some((rule) => /behandlings-/u.test(rule)));
  assert.equal(reconciliation.status, 'authority_audit_complete_foundation_only');
  assert.equal(reconciliation.audited_main_sha, '2ab7e737d1c5f0109f5e5259c88d7dfd20ccae53');
  assert.equal(reconciliation.expanded_target.strictly_proven_at_foundation, 18);
  assert.deepEqual(reconciliation.expanded_target.expansion_production_queue, ['helse', 'utdanning']);
});
