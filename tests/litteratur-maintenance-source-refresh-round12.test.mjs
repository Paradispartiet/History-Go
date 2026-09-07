import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound12 } from '../scripts/audit-litteratur-maintenance-source-refresh-round12.mjs';

test('Litteratur source refresh round 12 preserves canonical sociology contracts',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound12();assert.equal(r.status,'passed');assert.equal(r.sources_checked,17);assert.equal(r.authoritative_replacements,1);assert.equal(r.direct_live,11);assert.equal(r.restricted_retained,5);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,12);});
