import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ADJ='data/fag/vitenskap/legacy_theory_adjudication_v1.json';
const RAW='scripts/audit-fagverk-vitenskap-legacy-theory.mjs';
const PORTAL='data/fagverk/fagverk_portal.json';
const LEGACY='data/fag/vitenskap/merke_vitenskap (2).html';
const ORIGINAL='519bb6541d2e25606f714e5a1d22d2bfa06b3a2c';
const TARGET='fagverk.html?subject=vitenskap#fagverkIaProgresjon';
const IDS=['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag','emner-vitenskap'];
const KNOWLEDGE=IDS.slice(0,10);
const OWNERS=new Set([
  'data/fag/vitenskap/vitenskappensum_canonical_v4_6.json',
  'data/fag/vitenskap/methods_vitenskap_canonical_v4_6.json',
  'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos.json',
  'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap.json',
  'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell.json',
  'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse.json'
]);
const abs=p=>path.join(ROOT,p);const readJson=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
function rawAudit(){const r=spawnSync(process.execPath,[abs(RAW)],{cwd:ROOT,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||r.stdout||'Vitenskap raw audit failed');return JSON.parse(r.stdout)}

export function auditVitenskapLegacyAdjudication(){
  for(const f of [ADJ,PORTAL,LEGACY])assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const raw=rawAudit();
  assert(raw.subject==='vitenskap','Raw audit subject mismatch');
  assert(raw.summary?.knowledgeSectionCount===10,'Raw audit skal ha 10 kunnskapsseksjoner');
  assert(raw.summary?.anchorCompleteCount===10,'Vitenskap må ha 10/10 raw ankerdekning');
  assert(raw.summary?.manualReviewCount===0,'Vitenskap har uavklarte raw gap');
  assert(raw.summary?.redirectReady===false,'Raw audit får ikke autorisere redirect');
  assert(raw.legacy?.sourcePreserved===true,'Vitenskap legacy-kilden er ikke bevart');
  assert(raw.legacy?.originalBlobSha===ORIGINAL&&raw.legacy?.activeBlobSha===ORIGINAL,'Vitenskap legacy blob mismatch');
  assert(raw.navigation?.legacyRouteActive===true&&raw.navigation?.routeRetired===false,'Adjudication-fasen skal fortsatt bruke aktiv legacy-rute');
  assert(raw.canonical?.strictEmners===117&&raw.canonical?.strictClaims===178&&raw.canonical?.strictSources===103,'Vitenskap strict-integrity baseline mismatch');

  const adj=readJson(ADJ);
  assert(adj.schema==='history_go_fagverk_vitenskap_legacy_adjudication_v1','Uventet adjudication schema');
  assert(adj.subject==='vitenskap','Adjudication subject mismatch');
  assert(adj.legacyBadgePage===LEGACY,'Legacy badge path mismatch');
  assert(adj.redirectTarget===TARGET,'Redirect target mismatch');
  assert(JSON.stringify(adj.sections?.map(x=>x.id))===JSON.stringify(IDS),'Adjudication matcher ikke legacy-seksjonsrekkefølgen');
  const rawById=new Map(raw.rows.map(x=>[x.id,x]));
  for(const row of adj.sections){
    const rr=rawById.get(row.id);assert(rr,`Mangler raw row ${row.id}`);assert(row.role===rr.role,`${row.id}: role mismatch`);
    assert(typeof row.rationale==='string'&&row.rationale.trim().length>=100,`${row.id}: rationale er for svak`);
    assert(Array.isArray(row.ownerFiles)&&Array.isArray(row.migrationRefs),`${row.id}: owner/migration arrays mangler`);
    assert(row.migrationRefs.length===0,`${row.id}: råauditen beviste 0 gap, migrationRefs er ikke tillatt`);
    for(const owner of row.ownerFiles){assert(OWNERS.has(owner),`${row.id}: ikke-tillatt eier ${owner}`);assert(fs.existsSync(abs(owner)),`${row.id}: eier finnes ikke ${owner}`)}
    if(row.role==='knowledge'){
      assert(rr.anchorCoverage===1,`${row.id}: raw coverage er ikke 1`);assert(row.ownerFiles.length>0,`${row.id}: mangler canonical eier`);assert(row.disposition==='canonical_supersedes',`${row.id}: skal være canonical_supersedes`);
    }else if(row.id==='bidrag'){
      assert(row.disposition==='retire_legacy_product_copy','bidrag har feil disposition');assert(row.ownerFiles.length===0,'bidrag skal ikke få kunstig teori-eier');
    }else if(row.id==='emner-vitenskap'){
      assert(row.disposition==='retire_legacy_dynamic_product_ui','emner-vitenskap har feil disposition');assert(row.ownerFiles.length===0,'emner-vitenskap skal ikke få kunstig teori-eier');
    }else throw new Error(`Uventet produktseksjon ${row.id}`);
  }
  const knowledge=adj.sections.filter(x=>KNOWLEDGE.includes(x.id));
  assert(knowledge.length===10&&knowledge.every(x=>x.disposition==='canonical_supersedes'),'Alle 10 Vitenskap-kunnskapsseksjoner skal være canonical_supersedes');
  assert(adj.sections.filter(x=>x.disposition==='migrated_to_canonical').length===0,'Vitenskap skal ha 0 migrated_to_canonical');
  const portal=readJson(PORTAL).categories?.find(x=>x.id==='vitenskap');assert(portal?.badgePage===LEGACY,'Adjudication-fasen skal ikke endre Vitenskap-ruten');
  const ownerFiles=[...new Set(adj.sections.flatMap(x=>x.ownerFiles))].sort();
  return{schema:'history_go_fagverk_vitenskap_legacy_adjudication_audit_v1',subject:'vitenskap',summary:{legacySectionCount:12,knowledgeSectionCount:10,canonicalSupersedesCount:10,migratedSectionCount:0,retiredProductCopyCount:1,retiredDynamicProductUiCount:1,canonicalOwnerFileCount:ownerFiles.length,rawAuditRedirectReady:raw.summary.redirectReady,redirectReady:true,redirectTarget:TARGET,portalRoute:portal.badgePage,portalRedirected:false,legacySourcePreserved:raw.legacy.sourcePreserved},rows:adj.sections.map(x=>({...x,anchorCoverage:rawById.get(x.id)?.anchorCoverage??null,adjudicated:true}))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.stdout.write(`${JSON.stringify(auditVitenskapLegacyAdjudication(),null,2)}\n`)}catch(e){process.stderr.write(`Vitenskap legacy adjudication FEIL: ${e.message}\n`);process.exitCode=1}}
