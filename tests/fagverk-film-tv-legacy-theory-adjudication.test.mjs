import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvLegacyAdjudication } from '../scripts/audit-fagverk-film-tv-legacy-adjudication.mjs';

test('Film & TV adjudication covers all legacy sections with zero invented migrations',()=>{const r=auditFilmTvLegacyAdjudication();assert.equal(r.subject,'film_tv');assert.equal(r.summary.legacySectionCount,11);assert.equal(r.summary.knowledgeSectionCount,10);assert.equal(r.summary.canonicalSupersedesCount,10);assert.equal(r.summary.migratedSectionCount,0);assert.equal(r.summary.retiredProductCopyCount,1);assert.ok(r.rows.filter(x=>x.role==='knowledge').every(x=>x.disposition==='canonical_supersedes'));assert.ok(r.rows.every(x=>x.migrationRefs.length===0));});

test('Film & TV adjudication proves readiness without retiring the route early',()=>{const r=auditFilmTvLegacyAdjudication();assert.equal(r.summary.rawAuditRedirectReady,false);assert.equal(r.summary.redirectReady,true);assert.equal(r.summary.redirectTarget,'fagverk.html?subject=film_tv#fagverkIaProgresjon');assert.equal(r.summary.portalRedirected,false);assert.equal(r.summary.portalRoute,'data/fag/TV_og_Film/merke_film_tv.html');assert.equal(r.summary.legacySourcePreserved,true);});

test('Film & TV knowledge rows have real owners and product copy does not masquerade as theory',()=>{const r=auditFilmTvLegacyAdjudication();for(const row of r.rows.filter(x=>x.role==='knowledge')){assert.equal(row.anchorCoverage,1,row.id);assert.ok(row.ownerFiles.length>0,row.id);assert.ok(row.rationale.length>=100,row.id);}const bidrag=r.rows.find(x=>x.id==='bidrag');assert.equal(bidrag.disposition,'retire_legacy_product_copy');assert.deepEqual(bidrag.ownerFiles,[]);});
