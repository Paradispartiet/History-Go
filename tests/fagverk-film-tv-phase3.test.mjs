import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvPhase3 } from '../scripts/audit-fagverk-film-tv-phase3.mjs';

test('Film & TV er materialisert med canonical dekning og audiovisuelle source-first-porter', () => {
  const { report, model } = auditFilmTvPhase3();
  assert.equal(report.subject.id, 'film_tv');
  assert.equal(report.subject.schemaFamily, 'standard_canonical');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.ok(['structure_ready', 'chapters_in_progress', 'complete'].includes(report.subject.editorialStatus));
  assert.ok(['chapter_production', 'remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'maintenance_source_refresh_and_place_case_expansion'].includes(report.subject.nextGate));
  assert.deepEqual(report.summary, {
    domainCount: 10,
    emneCount: 192,
    methodCount: 119,
    mappingCount: 192,
    hookCount: 192,
    registeredChapterCount: report.summary.registeredChapterCount,
    explicitMappingRowCount: 192
  });
  assert.deepEqual(report.canonicalDomainOrder, [
    'audiovisuell_form_stil_analyse',
    'fortelling_sjanger_serialitet_format',
    'film_tv_historie_historiografi',
    'dokumentar_virkelighetsformer_etikk',
    'samfunn_representasjon_identitet_makt',
    'produksjon_arbeid_teknologi_praksis',
    'industri_institusjoner_politikk_distribusjon',
    'visning_publikum_resepsjon_deltakelse',
    'sted_location_skjermgeografi',
    'arkiv_kulturarv_minne_stjerner'
  ]);
  assert.equal(model.domains.length, 10);
  assert.equal(model.emners.length, 192);
  assert.equal(model.methods.length, 119);
  assert.ok(report.summary.registeredChapterCount >= 0);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
