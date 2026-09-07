import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound10 } from '../scripts/audit-litteratur-maintenance-source-refresh-round10.mjs';

test('Litteratur maintenance round 10 refreshes textual/archive sources without widening scope',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound10();assert.equal(r.status,'passed');assert.equal(r.round,10);assert.equal(r.area_id,'tekstkritikk_bokhistorie_arkiv');assert.equal(r.sources_checked,14);assert.equal(r.authoritative_replacements,2);assert.equal(r.direct_live,10);assert.equal(r.restricted_retained,2);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,10);assert.equal(r.next_gate,'maintenance_and_source_refresh');});
