import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound6 } from '../scripts/audit-litteratur-maintenance-source-refresh-round6.mjs';

test('Litteratur maintenance round 6 refreshes drama sources without widening scope',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound6();assert.equal(r.status,'passed');assert.equal(r.round,6);assert.equal(r.area_id,'drama_teatertekst_framforing');assert.equal(r.sources_checked,18);assert.equal(r.authoritative_replacements,5);assert.equal(r.direct_live,6);assert.equal(r.redirect_retained,2);assert.equal(r.fail_closed_retained,5);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,6);assert.equal(r.next_gate,'maintenance_and_source_refresh');});
