import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const LEGACY='data/fag/naeringsliv/merke_naeringsliv (1).html';
const IDS=['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag'];
function run(){ const r=spawnSync(process.execPath,['scripts/audit-fagverk-naeringsliv-legacy-theory.mjs'],{encoding:'utf8'}); assert.equal(r.status,0,r.stderr||r.stdout); return JSON.parse(r.stdout); }

test('Næringsliv legacy-teori måles fail-closed mot manifest- og registry-eid canonicalt fagverk',()=>{
  const r=run();
  assert.equal(r.schema,'history_go_fagverk_naeringsliv_legacy_theory_audit_v1');
  assert.equal(r.subject,'naeringsliv');
  assert.equal(r.legacy.badgePage,LEGACY);
  assert.equal(r.legacy.sectionCount,11);
  assert.equal(r.legacy.knowledgeSectionCount,10);
  assert.deepEqual(r.rows.map(x=>x.id),IDS);
  assert.ok(r.canonical.manifestSeedFiles.length>=4);
  assert.ok(r.canonical.manifestGraphFileCount>=r.canonical.manifestSeedFiles.length);
  assert.equal(r.canonical.registryChapterCount,12);
  assert.ok(r.canonical.registryGraphFileCount>=12);
  assert.ok(r.canonical.corpusCharacterCount>=100000);
  assert.equal(r.summary.knowledgeSectionCount,10);
  assert.equal(r.summary.manualReviewCount,r.summary.manualReview.length);
  assert.equal(r.summary.redirectReady,false);
  assert.match(r.summary.redirectBlockReason,/explicit editorial adjudication/i);
  for(const row of r.rows.filter(x=>x.role==='knowledge')){
    assert.ok(row.anchorCount>0);
    assert.ok(row.foundCount>=0&&row.foundCount<=row.anchorCount);
    assert.ok(row.anchorCoverage>=0&&row.anchorCoverage<=1);
  }
  const product=r.rows.find(x=>x.id==='bidrag');
  assert.equal(product.role,'legacy_product_copy');
  assert.equal(product.anchorCount,0);
  assert.equal(r.navigation.badgePage,LEGACY);
  assert.equal(r.navigation.subjectPage,'fagverk.html?subject=naeringsliv');
  assert.equal(r.navigation.preRedirectLocked,true);
});
