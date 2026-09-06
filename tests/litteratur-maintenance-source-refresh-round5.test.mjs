import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound5 } from '../scripts/audit-litteratur-maintenance-source-refresh-round5.mjs';

test('Litteratur maintenance round 5 refreshes poetry sources without widening scope',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound5();assert.equal(r.status,'passed');assert.equal(r.round,5);assert.equal(r.area_id,'lyrikk_poetiske_former');assert.equal(r.sources_checked,12);assert.equal(r.authoritative_replacements,4);assert.equal(r.direct_live,3);assert.equal(r.fail_closed_retained,5);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,5);assert.equal(r.next_gate,'maintenance_and_source_refresh');});
