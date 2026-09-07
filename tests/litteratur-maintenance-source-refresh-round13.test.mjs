import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound13 } from '../scripts/audit-litteratur-maintenance-source-refresh-round13.mjs';

test('Litteratur source refresh round 13 preserves canonical gender/feminist/queer contracts',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound13();assert.equal(r.status,'passed');assert.equal(r.sources_checked,14);assert.equal(r.authoritative_replacements,2);assert.equal(r.direct_live,7);assert.equal(r.restricted_retained,5);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,13);});
