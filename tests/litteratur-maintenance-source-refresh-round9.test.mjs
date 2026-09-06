import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound9 } from '../scripts/audit-litteratur-maintenance-source-refresh-round9.mjs';

test('Litteratur maintenance round 9 verifies authorship/intertext sources without unproven URL mutation',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound9();assert.equal(r.status,'passed');assert.equal(r.round,9);assert.equal(r.area_id,'forfatterskap_intertekstualitet');assert.equal(r.sources_checked,14);assert.equal(r.canonical_url_replacements,0);assert.equal(r.direct_live,10);assert.equal(r.restricted_retained,2);assert.equal(r.fail_closed_retained,2);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,9);assert.equal(r.next_gate,'maintenance_and_source_refresh');});
