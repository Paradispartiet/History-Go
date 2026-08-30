import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvLegacyTheory } from '../scripts/audit-fagverk-film-tv-legacy-theory.mjs';

test('Film & TV raw audit preserves source and enumerates all legacy sections',()=>{const r=auditFilmTvLegacyTheory();assert.equal(r.subject,'film_tv');assert.equal(r.legacy.sourcePreserved,true);assert.equal(r.legacy.originalBlobSha,'7715e611f048fb0e73184d06329c76c450578d74');assert.equal(r.legacy.activeBlobSha,r.legacy.originalBlobSha);assert.equal(r.legacy.sectionCount,11);assert.equal(r.legacy.knowledgeSectionCount,10);assert.deepEqual(r.rows.map(x=>x.id),['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag']);});

test('Film & TV raw audit locks the current canonical completion baseline',()=>{const r=auditFilmTvLegacyTheory();assert.equal(r.canonical.domainCount,10);assert.equal(r.canonical.emneCount,192);assert.equal(r.canonical.methodCount,119);assert.equal(r.canonical.chapterCount,17);assert.equal(r.canonical.claimCount,663);assert.equal(r.canonical.sourceCount,416);assert.ok(r.canonical.corpusCharacterCount>=r.canonical.corpusTruncationFloor);assert.equal(r.navigation.legacyRouteActive,true);assert.equal(r.navigation.routeRetired,false);assert.equal(r.summary.redirectReady,false);});

test('Film & TV raw audit reports anchor coverage without hiding gaps',()=>{const r=auditFilmTvLegacyTheory();const k=r.rows.filter(x=>x.role==='knowledge');assert.equal(k.length,10);assert.ok(k.every(x=>x.anchorCount>0&&x.foundCount<=x.anchorCount));assert.equal(r.summary.anchorCompleteCount+r.summary.manualReviewCount,10);const product=r.rows.find(x=>x.id==='bidrag');assert.equal(product.role,'legacy_product_copy');});
