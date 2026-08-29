import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT=process.cwd();
const ADJ='data/fag/naeringsliv/legacy_theory_adjudication_v1.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const PORTAL='data/fagverk/fagverk_portal.json';
const LEGACY='data/fag/naeringsliv/merke_naeringsliv (1).html';
const TARGET='fagverk.html?subject=naeringsliv#fagverkIaProgresjon';
const KNOWLEDGE='canonical_supersedes';
const PRODUCT='retire_legacy_product_copy';
const abs=f=>path.join(ROOT,f);
const exists=f=>fs.existsSync(abs(f));
const read=f=>fs.readFileSync(abs(f),'utf8');
const json=f=>JSON.parse(read(f));
const text=v=>String(v??'').trim();

function anchorAudit(){
  const r=spawnSync(process.execPath,['scripts/audit-fagverk-naeringsliv-legacy-theory.mjs'],{cwd:ROOT,encoding:'utf8'});
  if(r.status!==0) throw new Error(r.stderr||r.stdout);
  return JSON.parse(r.stdout);
}
for(const f of [ADJ,REGISTRY,PORTAL,LEGACY]) if(!exists(f)) throw new Error(`Mangler ${f}`);
const anchor=anchorAudit();
const adj=json(ADJ);
const registry=json(REGISTRY);
const portal=json(PORTAL);
if(adj.schema!=='history_go_fagverk_legacy_theory_adjudication_v1'||adj.subject_id!=='naeringsliv') throw new Error('Ugyldig Næringsliv-adjudisering.');
if(adj.policy?.canonical_content_wins!==true||adj.policy?.copy_legacy_prose!==false||adj.policy?.redirect_target!==TARGET||adj.policy?.redirect_only_after_gate!==true) throw new Error('Ugyldig Næringsliv-adjudiseringspolicy.');
if(anchor.summary?.knowledgeSectionCount!==10||anchor.summary?.anchorCompleteCount!==10||anchor.summary?.manualReviewCount!==0||anchor.summary?.redirectReady!==false) throw new Error('Næringsliv anchor-audit er ikke 10/10 fail-closed.');
const reg=registry.subjects?.naeringsliv;
const chapterRoots=(reg?.chapters||[]).map(c=>text(c.file)).filter(Boolean);
if(chapterRoots.length!==12) throw new Error(`Forventet 12 Næringsliv-kapittelrøtter, fant ${chapterRoots.length}.`);
const allowed=new Set([...(anchor.canonical?.manifestSeedFiles||[]),...chapterRoots]);
const decisions=new Map((adj.sections||[]).map(row=>[text(row.id),row]));
const expected=anchor.rows.map(r=>r.id);
if(expected.some(id=>!decisions.has(id))||[...decisions.keys()].some(id=>!expected.includes(id))) throw new Error('Næringsliv-adjudiseringen matcher ikke legacy-seksjonene.');
const rows=anchor.rows.map(a=>{
  const d=decisions.get(a.id);
  const owners=(d.owner_files||[]).map(text).filter(Boolean);
  const migrations=(d.migration_refs||[]).map(text).filter(Boolean);
  if(!text(d.rationale)) throw new Error(`${a.id} mangler rationale.`);
  if(migrations.length) throw new Error(`${a.id} skal ikke hevde migrering; #5491 fant 0 gap.`);
  if(a.role==='knowledge'){
    if(d.disposition!==KNOWLEDGE||a.anchorCoverage!==1||!owners.length) throw new Error(`${a.id} er ikke korrekt canonical_supersedes.`);
    for(const f of owners){ if(!exists(f)) throw new Error(`${a.id} peker til manglende ${f}`); if(!allowed.has(f)) throw new Error(`${a.id} peker utenfor canonical Næringsliv-eierskap: ${f}`); }
  } else {
    if(d.disposition!==PRODUCT||owners.length) throw new Error('bidrag skal pensjoneres som produkttekst uten kunnskapseier.');
  }
  return {id:a.id,role:a.role,anchorCoverage:a.anchorCoverage,disposition:d.disposition,ownerFiles:owners,migrationRefs:migrations,rationale:d.rationale,adjudicated:true};
});
const knowledge=rows.filter(r=>r.role==='knowledge');
const product=rows.filter(r=>r.role==='legacy_product_copy');
const p=portal.categories?.find(x=>x.id==='naeringsliv');
if(!p) throw new Error('Næringsliv mangler i portal.');
const redirectReady=knowledge.length===10&&knowledge.every(r=>r.adjudicated&&r.anchorCoverage===1&&r.disposition===KNOWLEDGE&&r.ownerFiles.length>0)&&product.length===1&&product[0].disposition===PRODUCT;
const report={schema:'history_go_fagverk_naeringsliv_legacy_adjudication_audit_v1',subject:'naeringsliv',inputs:{anchorAuditSchema:anchor.schema,adjudicationFile:ADJ,legacyBadgePage:LEGACY,manifestOwnerFiles:anchor.canonical.manifestSeedFiles,registryChapterOwnerFiles:chapterRoots},summary:{legacySectionCount:rows.length,knowledgeSectionCount:knowledge.length,adjudicatedKnowledgeCount:knowledge.length,allowedKnowledgeOwnerFileCount:allowed.size,canonicalOwnerFileCount:new Set(knowledge.flatMap(r=>r.ownerFiles)).size,migratedSectionCount:0,canonicalSupersedesCount:knowledge.filter(r=>r.disposition===KNOWLEDGE).length,retiredProductCopyCount:product.filter(r=>r.disposition===PRODUCT).length,anchorAuditRedirectReady:anchor.summary.redirectReady,redirectReady,redirectTarget:TARGET,portalRoute:p.badgePage,portalRedirected:p.badgePage===TARGET,legacyBadgeSourcePreserved:exists(LEGACY)},rows};
if(!report.summary.redirectReady||report.summary.canonicalSupersedesCount!==10||report.summary.retiredProductCopyCount!==1) throw new Error('Næringsliv adjudication er ikke redirect-klar.');
if(report.summary.portalRedirected) throw new Error('Adjudiserings-PR-en skal ikke redirecte Næringsliv.');
process.stdout.write(`${JSON.stringify(report,null,2)}\n`);
