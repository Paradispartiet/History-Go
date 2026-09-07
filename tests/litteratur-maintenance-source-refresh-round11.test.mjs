import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound11 } from '../scripts/audit-litteratur-maintenance-source-refresh-round11.mjs';

test('Litteratur source refresh round 11 preserves canonical media contracts',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound11();assert.equal(r.status,'passed');assert.equal(r.sources_checked,19);assert.equal(r.authoritative_replacements,1);assert.equal(r.direct_live,15);assert.equal(r.restricted_retained,3);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,11);});
