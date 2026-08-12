import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvCanonicalMigrationV1, buildFilmTvCanonicalMigrationV1 } from '../scripts/materialize-film-tv-canonical-migration-v1.mjs';

test('Film & TV-canonen materialiseres deterministisk fra det variable inventaret', () => {
  const audited = auditFilmTvCanonicalMigrationV1();
  const rebuilt = buildFilmTvCanonicalMigrationV1();
  assert.deepEqual(rebuilt.report, audited.report);
  assert.equal(audited.emners.length, 192);
  assert.equal(audited.methods.methods.length, 119);
  assert.equal(audited.mappings.length, 192);
  assert.equal(audited.fagkart.categories.length, 10);
  assert.equal(audited.fagkart.meta.topic_hook_count, 192);
});

test('alle emner har gyldig domene, metode, hook, mapping og evidensspor', () => {
  const result = auditFilmTvCanonicalMigrationV1();
  const domains = new Set(result.inventory.domains.map((row) => row.id));
  const methods = new Set(result.methods.methods.map((row) => row.method_id));
  const hooks = new Set(result.fagkart.categories.flatMap((row) => row.topic_hooks.map((hook) => hook.id)));
  assert.ok(result.emners.every((row) => domains.has(row.domain) && row.method_ids.every((id) => methods.has(id))));
  assert.ok(result.methods.methods.every((row) => row.emne_affinities.length >= 1));
  assert.ok(result.mappings.every((row) => hooks.has(row.primary_hooks[0])));
  assert.ok(result.emners.every((row) => row.evidence_refs.length > 0));
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('legacy-ID-er er aliases og runtime-projeksjonen bruker bare canonicale ID-er', () => {
  const result = auditFilmTvCanonicalMigrationV1();
  const canonical = new Set(result.emners.map((row) => row.emne_id));
  assert.equal(result.aliases.byAlias.size, 120);
  assert.ok([...result.aliases.byAlias.keys()].every((id) => !canonical.has(id)));
  assert.ok(['canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief', 'documentary_evidence_ethics_source_brief_complete_full_chapter_production', 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief', 'representation_position_counterimages_source_brief_complete_full_chapter_production'].includes(result.status.subjects.find((row) => row.id === 'film_tv').nextGate));
  assert.ok(result.registry.subjects.film_tv.chapters.flatMap((row) => row.emne_ids).every((id) => canonical.has(id)));
});
