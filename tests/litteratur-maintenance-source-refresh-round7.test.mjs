import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound7 } from '../scripts/audit-litteratur-maintenance-source-refresh-round7.mjs';

test('Litteratur maintenance round 7 refreshes genre sources without widening scope',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound7();assert.equal(r.status,'passed');assert.equal(r.round,7);assert.equal(r.area_id,'sjanger_modus_form');assert.equal(r.sources_checked,14);assert.equal(r.authoritative_replacements,4);assert.equal(r.direct_live,7);assert.equal(r.redirect_retained,1);assert.equal(r.fail_closed_retained,2);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,7);assert.equal(r.next_gate,'maintenance_and_source_refresh');});
