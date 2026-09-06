import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound4 } from '../scripts/audit-litteratur-maintenance-source-refresh-round4.mjs';

test('Litteratur maintenance round 4 refreshes narratology sources without widening scope',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound4();assert.equal(r.status,'passed');assert.equal(r.round,4);assert.equal(r.area_id,'narratologi_prosa');assert.equal(r.sources_checked,12);assert.equal(r.authoritative_replacements,5);assert.equal(r.direct_live,5);assert.equal(r.redirect_retained,2);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,4);assert.equal(r.next_gate,'maintenance_and_source_refresh');});
