import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound2 } from '../scripts/audit-litteratur-maintenance-source-refresh-round2.mjs';

test('Litteratur maintenance round 2 refreshes poetikk sources without widening scope', () => {
  const r = auditLitteraturMaintenanceSourceRefreshRound2();
  assert.equal(r.status, 'passed');
  assert.equal(r.round, 2);
  assert.equal(r.area_id, 'poetikk_estetikk_litteraritet');
  assert.equal(r.sources_checked, 12);
  assert.equal(r.authoritative_replacements, 5);
  assert.equal(r.retained_without_guessing, 2);
  assert.equal(r.pathway_sources, 384);
  assert.equal(r.canonical_areas, 28);
  assert.equal(r.assessed_articles, 168);
  assert.equal(r.maintained_areas_total, 2);
  assert.equal(r.next_gate, 'maintenance_and_source_refresh');
});
