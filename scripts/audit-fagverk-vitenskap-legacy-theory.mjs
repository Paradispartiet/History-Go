import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const LEGACY='data/fag/vitenskap/merke_vitenskap (2).html';
const ORIGINAL='519bb6541d2e25606f714e5a1d22d2bfa06b3a2c';
const PORTAL='data/fagverk/fagverk_portal.json';
const MANIFEST='data/fag/fag_manifest.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const INTEGRITY='reports/fagverk/vitenskap-theory-integrity-audit.json';
const TARGET='fagverk.html?subject=vitenskap#fagverkIaProgresjon';
const ROOTS=['data/fag/vitenskap/','data/fagverk/vitenskap/'];
const MIN_CORPUS=180000;
const EXPECTED=['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag','emner-vitenskap'];
const POLICY={
  felt:[['måling'],['testing','eksperiment'],['modell'],['instrument'],['teori'],['data'],['kunnskap'],['institusjon'],['teknologi']],
  normativ:[['objektiv'],['reproduserbar','replikasjon'],['standardisering'],['konsistens'],['presisjon'],['fagfelle']],
  doxa:[['måling'],['modell'],['instrument'],['kalibrering'],['antakelse','forutsetning'],['perspektiv','usikkerhet']],
  metode:[['hypotese'],['observasjon'],['eksperiment'],['variabel'],['sensor','måleinstrument'],['kalibrering'],['replikasjon'],['standardisering'],['statist'],['algoritme'],['fagfelle','konsensus']],
  materiell:[['laborator'],['institutt'],['observator'],['instrument'],['sensor'],['datasett'],['protokoll'],['simulering'],['algoritme'],['arkiv']],
  sosial:[['forsker'],['tekniker'],['institusjon'],['standard'],['universitet'],['laborator'],['forskningsråd','finansiering'],['industri'],['tillit'],['samarbeid']],
  geografisk:[['sted'],['laborator'],['universitet'],['observator'],['infrastruktur','bygg'],['kunnskapssted']],
  temporal:[['paradigme'],['revolusjon','brudd'],['målemetode','måling'],['instrument'],['revisjon'],['uenighet','konflikt']],
  blindsoner:[['målebar','måling'],['erfaring'],['institusjonell makt','makt'],['hierarki'],['teknologi'],['marginalisering','utelatelse'],['modell']],
  begreper:[['observasjon'],['evidens','belegg'],['hypotese'],['modell'],['kalibrering'],['replikasjon'],['paradigme'],['standardisering']]
};
const abs=p=>path.join(ROOT,p); const read=p=>fs.readFileSync(abs(p),'utf8'); const json=p=>JSON.parse(read(p));
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const norm=v=>String(v??'').toLocaleLowerCase('nb-NO').normalize('NFKC').replace(/[«»“”„\"'’`´]/g,'').replace(/[^a-zæøå0-9]+/gi,' ').replace(/\s+/g,' ').trim();
function blobSha(buffer){const h=Buffer.from(`blob ${buffer.length}\0`);return crypto.createHash('sha1').update(h).update(buffer).digest('hex')}
function flatten(v,out=[]){if(typeof v==='string')out.push(v);else if(Array.isArray(v))for(const x of v)flatten(x,out);else if(v&&typeof v==='object')for(const x of Object.values(v))flatten(x,out);return out}
function repoPath(candidate){const r=path.relative(ROOT,path.resolve(candidate)).replaceAll('\\','/');return !r||r.startsWith('../')||path.isAbsolute(r)?'':r}
const owned=f=>f.endsWith('.json')&&ROOTS.some(r=>f.startsWith(r));
function resolveRef(from,raw){const v=String(raw??'').trim().replaceAll('\\','/').split(/[?#]/)[0];if(!v.endsWith('.json'))return '';const c=[];if(v.startsWith('data/'))c.push(path.join(ROOT,v));c.push(path.join(ROOT,path.dirname(from),v));if(!v.startsWith('../')){c.push(path.join(ROOT,'data/fag',v));c.push(path.join(ROOT,'data/fagverk',v))}for(const p of c){const f=repoPath(p);if(f&&owned(f)&&fs.existsSync(abs(f)))return f}return ''}
function graph(seed){const q=[...new Set(seed.filter(f=>f&&owned(f)&&fs.existsSync(abs(f))))],seen=new Set(),strings=[];while(q.length){const f=q.shift();if(seen.has(f))continue;seen.add(f);const vals=flatten(json(f));strings.push(...vals);for(const raw of vals){const r=resolveRef(f,raw);if(r&&!seen.has(r))q.push(r)}}return{files:[...seen].sort(),strings}}
function strip(v){return v.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function sections(html){const out=[];for(const m of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)){const cls=m[1].match(/class=[\"']([^\"']+)[\"']/i)?.[1]||'';if(!cls.split(/\s+/).includes('merke-blokk'))continue;const id=m[1].match(/id=[\"']([^\"']+)[\"']/i)?.[1]||'';if(id)out.push({id,text:strip(m[2])})}return out}

export function auditVitenskapLegacyTheory(){
  for(const f of [LEGACY,PORTAL,MANIFEST,REGISTRY,INTEGRITY])assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const buffer=fs.readFileSync(abs(LEGACY)); const activeSha=blobSha(buffer); assert(activeSha===ORIGINAL,`Vitenskap legacy-blob mismatch: ${activeSha}`);
  const legacySections=sections(buffer.toString('utf8'));assert(JSON.stringify(legacySections.map(x=>x.id))===JSON.stringify(EXPECTED),`Uventet legacy-struktur: ${legacySections.map(x=>x.id).join(', ')}`);
  const manifestSubject=json(MANIFEST).vitenskap||{};const manifestSeed=[...new Set(flatten(manifestSubject).map(v=>resolveRef(MANIFEST,v)).filter(Boolean))];assert(manifestSeed.length>=4,`For få manifesteide Vitenskap-filer: ${manifestSeed.length}`);
  const registrySubject=json(REGISTRY).subjects?.vitenskap;assert(registrySubject,'Vitenskap mangler i registry');const chapterCount=registrySubject.chapters?.length||0;assert(chapterCount===5,`Vitenskap skal ha 5 registrerte kapitler, fant ${chapterCount}`);
  const g1=graph(manifestSeed),g2=graph(flatten(registrySubject).map(v=>resolveRef(REGISTRY,v)).filter(Boolean));const corpus=norm([...g1.strings,...flatten(registrySubject),...g2.strings].join(' '));assert(corpus.length>=MIN_CORPUS,`Vitenskap-korpus under truncation-sentinel: ${corpus.length}`);
  const strict=json(INTEGRITY);assert(strict.status==='STRICTLY_PROVEN','Vitenskap strict-integrity er ikke STRICTLY_PROVEN');assert(strict.summary?.universalCanonicalEmnesValidated===117,'Vitenskap strict-integrity dekker ikke 117 emner');assert(strict.summary?.substantiveContentGapsProven===0,'Vitenskap strict-integrity rapporterer innholdsgap');
  const rows=legacySections.map(s=>{if(s.id==='bidrag'||s.id==='emner-vitenskap')return{id:s.id,role:s.id==='bidrag'?'legacy_product_copy':'legacy_dynamic_product_ui',anchorCount:0,foundCount:0,anchorCoverage:1,missingAnchors:[],contentStatus:'product_surface_no_theory_migration_required'};const anchors=POLICY[s.id].map(alts=>({alternatives:alts,found:alts.find(a=>corpus.includes(norm(a)))||null}));const found=anchors.filter(a=>a.found).length;return{id:s.id,role:'knowledge',anchorCount:anchors.length,foundCount:found,anchorCoverage:Number((found/anchors.length).toFixed(3)),anchors,missingAnchors:anchors.filter(a=>!a.found).map(a=>a.alternatives),contentStatus:found===anchors.length?'canonical_anchor_coverage_complete_claim_review_pending':'canonical_anchor_gaps_manual_review_required'}});
  const portal=json(PORTAL).categories?.find(x=>x.id==='vitenskap');assert(portal?.badgePage===LEGACY,`Råauditen krever aktiv Vitenskap legacy-rute: ${portal?.badgePage}`);
  const knowledge=rows.filter(r=>r.role==='knowledge'),manual=knowledge.filter(r=>r.anchorCoverage<1).map(r=>r.id);
  return{schema:'history_go_fagverk_vitenskap_legacy_theory_audit_v1',subject:'vitenskap',legacy:{badgePage:LEGACY,originalBlobSha:ORIGINAL,activeBlobSha:activeSha,sourcePreserved:true,sectionCount:rows.length,knowledgeSectionCount:knowledge.length,productSectionCount:2},canonical:{manifestGraphFileCount:g1.files.length,registryGraphFileCount:g2.files.length,registryChapterCount:chapterCount,corpusCharacterCount:corpus.length,corpusTruncationFloor:MIN_CORPUS,strictMajorFields:strict.summary.canonicalMajorFields,strictEmners:strict.summary.universalCanonicalEmnesValidated,strictClaims:strict.lockedBaseline.claims,strictSources:strict.lockedBaseline.sources},navigation:{badgePage:portal.badgePage,subjectPage:portal.subjectPage,futureTarget:TARGET,legacyRouteActive:true,routeRetired:false},summary:{knowledgeSectionCount:knowledge.length,anchorCompleteCount:knowledge.filter(r=>r.anchorCoverage===1).length,manualReviewCount:manual.length,manualReview,redirectReady:false,redirectBlockReason:'Raw Vitenskap coverage never authorizes redirect by itself. Explicit section adjudication and any proven gap migration are required.'},rows};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.stdout.write(`${JSON.stringify(auditVitenskapLegacyTheory(),null,2)}\n`)}catch(e){process.stderr.write(`Vitenskap raw legacy audit FEIL: ${e.message}\n`);process.exitCode=1}}
