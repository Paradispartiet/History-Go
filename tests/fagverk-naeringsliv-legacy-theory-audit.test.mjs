import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const LEGACY='data/fag/naeringsliv/archive/merke_naeringsliv_full_teori_legacy_20260829.html';
const COMPATIBILITY='data/fag/naeringsliv/merke_naeringsliv (1).html';
const TARGET='fagverk.html?subject=naeringsliv#fagverkIaProgresjon';
const IDS=['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag'];
function run(){ const r=spawnSync(process.execPath,['scripts/audit-fagverk-naeringsliv-legacy-theory.mjs'],{encoding:'utf8'}); assert.equal(r.status,0,r.stderr||r.stdout); return JSON.parse(r.stdout); }

test('Næringsliv legacy-teori har 10/10 canonical dekning fra byte-identisk arkiv',()=>{
  const r=run();
  assert.equal(r.schema,'history_go_fagverk_naeringsliv_legacy_theory_audit_v1');
  assert.equal(r.subject,'naeringsliv');
  assert.equal(r.legacy.badgePage,LEGACY);
  assert.equal(r.legacy.compatibilityPage,COMPATIBILITY);
  assert.equal(r.legacy.sectionCount,11);
  assert.equal(r.legacy.knowledgeSectionCount,10);
  assert.deepEqual(r.rows.map(x=>x.id),IDS);

  assert.ok(r.canonical.manifestSeedFiles.length>=4);
  assert.equal(r.canonical.manifestGraphFileCount,24);
  assert.equal(r.canonical.registryChapterCount,12);
  assert.equal(r.canonical.registryGraphFileCount,103);
  assert.equal(r.canonical.corpusCharacterCount,3339515);

  assert.equal(r.summary.knowledgeSectionCount,10);
  assert.equal(r.summary.anchorCompleteCount,10);
  assert.equal(r.summary.manualReviewCount,0);
  assert.deepEqual(r.summary.manualReview,[]);
  assert.equal(r.summary.redirectReady,false);
  assert.match(r.summary.redirectBlockReason,/explicit Næringsliv legacy adjudication gate/i);

  for(const row of r.rows.filter(x=>x.role==='knowledge')){
    assert.ok(row.anchorCount>0,`${row.id} mangler ankere`);
    assert.equal(row.foundCount,row.anchorCount,`${row.id} mangler canonical dekning`);
    assert.equal(row.anchorCoverage,1,`${row.id} skal ha full canonical dekning`);
    assert.deepEqual(row.missingAnchors,[],`${row.id} skal ikke ha uavklarte kunnskapsgap`);
  }

  const normative=r.rows.find(x=>x.id==='normativ');
  const professionalism=normative.anchors.find(a=>a.alternatives.includes('profesjonalitet'));
  assert.ok(['profesjon','kompetanse','yrkesmessig skjønn'].includes(professionalism.found),`profesjonalitet mangler canonical faglig eier: ${professionalism.found}`);

  const temporal=r.rows.find(x=>x.id==='temporal');
  const globalization=temporal.anchors.find(a=>a.alternatives.includes('offshoring'));
  assert.ok(['global verdikjede','globale verdikjeder','internasjonal økonomi','internasjonal handel'].includes(globalization.found),`offshoring/globalisering mangler canonical faglig eier: ${globalization.found}`);

  const product=r.rows.find(x=>x.id==='bidrag');
  assert.equal(product.role,'legacy_product_copy');
  assert.equal(product.anchorCount,0);
  assert.equal(r.navigation.badgePage,TARGET);
  assert.equal(r.navigation.subjectPage,'fagverk.html?subject=naeringsliv');
  assert.equal(r.navigation.target,TARGET);
  assert.equal(r.navigation.portalRedirected,true);
  assert.equal(r.navigation.compatibilityRedirectPresent,true);
  assert.equal(r.navigation.routeRetired,true);

  const compatibility=fs.readFileSync(COMPATIBILITY,'utf8');
  assert.match(compatibility,/location\.replace/);
  assert.match(compatibility,/subject=naeringsliv#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility,/merke-blokk|<h2>1\. Felt<\/h2>|profesjonalitet|offshoring/i);
});
