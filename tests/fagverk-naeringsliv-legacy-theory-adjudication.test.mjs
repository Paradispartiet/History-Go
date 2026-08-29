import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const LEGACY='data/fag/naeringsliv/archive/merke_naeringsliv_full_teori_legacy_20260829.html';
const COMPATIBILITY='data/fag/naeringsliv/merke_naeringsliv (1).html';
const TARGET='fagverk.html?subject=naeringsliv#fagverkIaProgresjon';
function run(){const r=spawnSync(process.execPath,['scripts/audit-fagverk-naeringsliv-legacy-adjudication.mjs'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);return JSON.parse(r.stdout);}

test('Næringsliv-adjudiseringen avgjør 10 kunnskapsseksjoner uten migrering',()=>{
  const r=run();
  assert.equal(r.schema,'history_go_fagverk_naeringsliv_legacy_adjudication_audit_v1');
  assert.equal(r.subject,'naeringsliv');
  assert.equal(r.summary.legacySectionCount,11);
  assert.equal(r.summary.knowledgeSectionCount,10);
  assert.equal(r.summary.adjudicatedKnowledgeCount,10);
  assert.equal(r.summary.migratedSectionCount,0);
  assert.equal(r.summary.canonicalSupersedesCount,10);
  assert.equal(r.summary.retiredProductCopyCount,1);
  assert.equal(r.rows.filter(x=>x.role==='knowledge').every(x=>x.disposition==='canonical_supersedes'&&x.anchorCoverage===1),true);
});

test('alle Næringsliv-kunnskapsseksjoner peker bare til tillatte canonicale eiere',()=>{
  const r=run();
  const allowed=new Set([...r.inputs.manifestOwnerFiles,...r.inputs.registryChapterOwnerFiles]);
  assert.equal(r.inputs.registryChapterOwnerFiles.length,12);
  assert.equal(r.summary.allowedKnowledgeOwnerFileCount,allowed.size);
  assert.ok(r.summary.canonicalOwnerFileCount>=8);
  for(const row of r.rows.filter(x=>x.role==='knowledge')){
    assert.ok(row.ownerFiles.length>0,`${row.id} mangler eier`);
    assert.deepEqual(row.migrationRefs,[]);
    for(const f of row.ownerFiles){assert.ok(allowed.has(f),`${row.id} peker utenfor owner-sett: ${f}`);assert.ok(fs.existsSync(f),`${f} mangler`);}
  }
});

test('profesjonalitet og globalisering adjudiseres til eksisterende canonicalt fagverk',()=>{
  const r=run();
  const normative=r.rows.find(x=>x.id==='normativ');
  const temporal=r.rows.find(x=>x.id==='temporal');
  assert.match(normative.rationale,/Profesjoner og kompetanse/i);
  assert.match(normative.rationale,/yrkesmessig skjønn/i);
  assert.match(temporal.rationale,/Internasjonal økonomi/i);
  assert.match(temporal.rationale,/globale verdikjeder/i);
  assert.deepEqual(normative.migrationRefs,[]);
  assert.deepEqual(temporal.migrationRefs,[]);
});

test('bidrag er gammel produkttekst uten kunstig kunnskapseier',()=>{
  const r=run();
  const product=r.rows.find(x=>x.id==='bidrag');
  assert.equal(product.role,'legacy_product_copy');
  assert.equal(product.disposition,'retire_legacy_product_copy');
  assert.deepEqual(product.ownerFiles,[]);
  assert.match(product.rationale,/produkttekst/i);
});

test('Næringsliv-adjudiseringen låser permanent route-retirement',()=>{
  const r=run();
  assert.equal(r.summary.anchorAuditRedirectReady,false);
  assert.equal(r.summary.redirectReady,true);
  assert.equal(r.summary.redirectTarget,TARGET);
  assert.equal(r.summary.portalRoute,TARGET);
  assert.equal(r.summary.portalRedirected,true);
  assert.equal(r.summary.legacyBadgeSourcePreserved,true);
  assert.equal(r.summary.compatibilityRedirectPresent,true);
  assert.equal(r.inputs.legacyBadgePage,LEGACY);
  assert.equal(r.inputs.compatibilityBadgePage,COMPATIBILITY);
});
