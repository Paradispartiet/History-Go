import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ADJ='data/fag/TV_og_Film/legacy_theory_adjudication_v1.json';
const RAW='scripts/audit-fagverk-film-tv-legacy-theory.mjs';
const PORTAL='data/fagverk/fagverk_portal.json';
const LEGACY='data/fag/TV_og_Film/merke_film_tv.html';
const ORIGINAL='7715e611f048fb0e73184d06329c76c450578d74';
const TARGET='fagverk.html?subject=film_tv#fagverkIaProgresjon';
const IDS=['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag'];
const KNOWLEDGE=IDS.slice(0,10);
const OWNERS=new Set([
  'data/fagverk/film_tv/arkiv-bevaring-tilgang-og-autentisitet.json',
  'data/fagverk/film_tv/audiovisuell-form-og-sansing.json',
  'data/fagverk/film_tv/dokumentar-evidens-og-etikk.json',
  'data/fagverk/film_tv/filmhistorie-bevegelser-og-historiografi.json',
  'data/fagverk/film_tv/fjernsyn-plattformer-og-deltakerhistorier.json',
  'data/fagverk/film_tv/fortelling-synsvinkel-og-sjanger.json',
  'data/fagverk/film_tv/industri-regulering-og-distribusjon.json',
  'data/fagverk/film_tv/kinoer-visningssteder-og-publikum.json',
  'data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne.json',
  'data/fagverk/film_tv/location-produksjon-og-stedsetikk.json',
  'data/fagverk/film_tv/produksjon-studio-og-filmarbeid.json',
  'data/fagverk/film_tv/representasjon-posisjon-og-motbilder.json',
  'data/fagverk/film_tv/resepsjon-deltakelse-og-publikumsmetoder.json',
  'data/fagverk/film_tv/serialitet-format-og-adaptasjon.json',
  'data/fagverk/film_tv/skapende-arbeid-teknologi-og-ansvar.json',
  'data/fagverk/film_tv/skjermoffentlighet-fellesskap-og-samfunn.json',
  'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon.json'
]);
const abs=p=>path.join(ROOT,p);const readJson=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
function rawAudit(){const r=spawnSync(process.execPath,[abs(RAW)],{cwd:ROOT,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||r.stdout||'Film TV raw audit failed');return JSON.parse(r.stdout)}

export function auditFilmTvLegacyAdjudication(){
  for(const f of [ADJ,PORTAL,LEGACY])assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const raw=rawAudit();assert(raw.subject==='film_tv','Raw audit subject mismatch');assert(raw.summary?.knowledgeSectionCount===10,'Raw audit skal ha 10 kunnskapsseksjoner');assert(raw.summary?.anchorCompleteCount===10,'Film & TV må ha 10/10 raw ankerdekning');assert(raw.summary?.manualReviewCount===0,'Film & TV har uavklarte raw gap');assert(raw.summary?.redirectReady===false,'Raw audit får ikke autorisere redirect');assert(raw.legacy?.sourcePreserved===true,'Film & TV legacy-kilden er ikke bevart');assert(raw.legacy?.originalBlobSha===ORIGINAL&&raw.legacy?.activeBlobSha===ORIGINAL,'Film & TV legacy blob mismatch');assert(raw.navigation?.legacyRouteActive===true&&raw.navigation?.routeRetired===false,'Adjudication-fasen skal fortsatt bruke aktiv legacy-rute');
  const tech=raw.canonical?.semanticOwnerEvidence?.technicianBlindSpot;assert(tech?.productionTeamEmne&&tech?.invisibleProductionAlias&&tech?.responsibilityEvidence,'Tekniker-blindsonen mangler eksplisitt semantic owner evidence');
  const adj=readJson(ADJ);assert(adj.schema==='history_go_fagverk_film_tv_legacy_adjudication_v1','Uventet adjudication schema');assert(adj.subject==='film_tv','Adjudication subject mismatch');assert(adj.legacyBadgePage===LEGACY,'Legacy badge path mismatch');assert(adj.originalBlobSha===ORIGINAL,'Adjudication original blob mismatch');assert(adj.redirectTarget===TARGET,'Redirect target mismatch');assert(JSON.stringify(adj.sections?.map(x=>x.id))===JSON.stringify(IDS),'Adjudication matcher ikke legacy-seksjonsrekkefølgen');
  const rawById=new Map(raw.rows.map(x=>[x.id,x]));
  for(const row of adj.sections){const rr=rawById.get(row.id);assert(rr,`Mangler raw row ${row.id}`);assert(row.role===rr.role,`${row.id}: role mismatch`);assert(typeof row.rationale==='string'&&row.rationale.trim().length>=100,`${row.id}: rationale er for svak`);assert(Array.isArray(row.ownerFiles)&&Array.isArray(row.migrationRefs),`${row.id}: owner/migration arrays mangler`);assert(row.migrationRefs.length===0,`${row.id}: råauditen beviste 0 gap, migrationRefs er ikke tillatt`);for(const owner of row.ownerFiles){assert(OWNERS.has(owner),`${row.id}: ikke-tillatt eier ${owner}`);assert(fs.existsSync(abs(owner)),`${row.id}: eier finnes ikke ${owner}`)}if(row.role==='knowledge'){assert(rr.anchorCoverage===1,`${row.id}: raw coverage er ikke 1`);assert(row.ownerFiles.length>0,`${row.id}: mangler canonical eier`);assert(row.disposition==='canonical_supersedes',`${row.id}: skal være canonical_supersedes`)}else if(row.id==='bidrag'){assert(row.disposition==='retire_legacy_product_copy','bidrag har feil disposition');assert(row.ownerFiles.length===0,'bidrag skal ikke få kunstig teori-eier')}else throw new Error(`Uventet produktseksjon ${row.id}`)}
  const knowledge=adj.sections.filter(x=>KNOWLEDGE.includes(x.id));assert(knowledge.length===10&&knowledge.every(x=>x.disposition==='canonical_supersedes'),'Alle 10 Film & TV-kunnskapsseksjoner skal være canonical_supersedes');assert(adj.sections.filter(x=>x.disposition==='migrated_to_canonical').length===0,'Film & TV skal ha 0 migrated_to_canonical');
  const portal=readJson(PORTAL).categories?.find(x=>x.id==='film_tv');assert(portal?.badgePage===LEGACY,'Adjudication-fasen skal ikke endre Film & TV-ruten');const ownerFiles=[...new Set(adj.sections.flatMap(x=>x.ownerFiles))].sort();
  return{schema:'history_go_fagverk_film_tv_legacy_adjudication_audit_v1',subject:'film_tv',summary:{legacySectionCount:11,knowledgeSectionCount:10,canonicalSupersedesCount:10,migratedSectionCount:0,retiredProductCopyCount:1,canonicalOwnerFileCount:ownerFiles.length,rawAuditRedirectReady:raw.summary.redirectReady,redirectReady:true,redirectTarget:TARGET,portalRoute:portal.badgePage,portalRedirected:false,legacySourcePreserved:raw.legacy.sourcePreserved},rows:adj.sections.map(x=>({...x,anchorCoverage:rawById.get(x.id)?.anchorCoverage??null,adjudicated:true}))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.stdout.write(`${JSON.stringify(auditFilmTvLegacyAdjudication(),null,2)}\n`)}catch(e){process.stderr.write(`Film & TV legacy adjudication FEIL: ${e.message}\n`);process.exitCode=1}}
