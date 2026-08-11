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
  assert.ok(['chapter_production', 'remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration', 'maintenance_source_refresh_and_place_case_expansion'].includes(report.subject.nextGate));
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 120,
    methodCount: 107,
    mappingCount: 120,
    hookCount: 60,
    registeredChapterCount: report.summary.registeredChapterCount,
    explicitMappingRowCount: 120
  });
  assert.deepEqual(report.canonicalDomainOrder, [
    'kinoer_visningssteder_publikum',
    'produksjon_studio_arbeid',
    'locations_byrom_motiv',
    'sjanger_format_fortelling',
    'institusjoner_makt_offentlighet',
    'minne_stjerner_kulturarv'
  ]);
  assert.equal(model.domains.length, 6);
  assert.equal(model.emners.length, 120);
  assert.equal(model.methods.length, 107);
  assert.ok(report.summary.registeredChapterCount >= 0 && report.summary.registeredChapterCount <= 6);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
