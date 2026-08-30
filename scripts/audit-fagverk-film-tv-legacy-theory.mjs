import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const LEGACY='data/fag/TV_og_Film/merke_film_tv.html';
const ORIGINAL='7715e611f048fb0e73184d06329c76c450578d74';
const PORTAL='data/fagverk/fagverk_portal.json';
const HOLISTIC='reports/fagverk/film-tv-holistic-completion-v1-audit.json';
const TARGET='fagverk.html?subject=film_tv#fagverkIaProgresjon';
const ROOTS=['data/fag/TV_og_Film','data/fagverk/film_tv'];
const EXPECTED=['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag'];
const MIN_CORPUS=400000;
const POLICY={
  felt:[['film'],['tv','fjernsyn'],['kamera'],['klipp'],['lyd'],['fortelling'],['dokumentar'],['kringkasting'],['produksjon']],
  normativ:[['kunstnerisk frihet','kunstnerisk'],['sannhet'],['representasjon'],['bevaring','arkiv'],['tilgang'],['presisjon'],['publikum']],
  doxa:[['industri'],['teknologi'],['estetikk'],['dokumentasjon','dokumentar'],['propaganda'],['minne'],['stjerne'],['arbeid'],['offentlighet'],['kollektiv']],
  metode:[['filmhistor'],['tv-histor','fjernsynshistor'],['bilde'],['klipp'],['produksjon'],['institusjon'],['sjanger'],['format'],['resepsjon','publikum'],['stjerne'],['arkiv'],['distribusjon'],['visning']],
  materiell:[['kamera'],['mikrofon'],['lys'],['kulisse'],['rekvisitt'],['klipp'],['lydstudio','lyd'],['kino'],['filmklubb'],['studio'],['tv-hus','kringkasting'],['manus'],['storyboard'],['plakat'],['trailer'],['arkiv'],['strømm'],['festival']],
  sosial:[['regissør'],['produsent'],['fotograf'],['klipper'],['skuespiller'],['lyd'],['redaksjon'],['produksjonsselskap'],['distributør'],['publikum'],['fan'],['kritiker'],['festival'],['cinematek'],['representasjon'],['sensur'],['finansiering'],['kommersialisering']],
  geografisk:[['innspillingssted','location'],['visningssted','kino'],['produksjonssted','studio'],['institusjon'],['arkiv'],['tv-hus','kringkasting'],['sted'],['byrom']],
  temporal:[['stumfilm'],['lydfilm'],['fjernsyn','tv'],['video'],['strømm'],['kino'],['arkiv'],['digital'],['serie'],['dokumentar']],
  blindsoner:[['tekniker'],['klipper'],['lyd'],['kino'],['filmklubb'],['kvinner','kjønn'],['minoritet','representasjon'],['arbeid'],['tv-histor','fjernsynshistor'],['arkiv'],['dokumentar'],['nyhets'],['kommersielle','kommersialisering'],['politisk']],
  begreper:[['film'],['tv','fjernsyn'],['kamera'],['klipp'],['montasje'],['scene'],['bildeutsnitt','utsnitt'],['lyd'],['manus'],['regi'],['produksjon'],['kino'],['kringkasting'],['serieformat','serialitet'],['publikum'],['arkiv']]
};
const abs=p=>path.join(ROOT,p);const read=p=>fs.readFileSync(abs(p),'utf8');const json=p=>JSON.parse(read(p));const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const norm=v=>String(v??'').toLocaleLowerCase('nb-NO').normalize('NFKC').replace(/[«»“”„\"'’`´]/g,'').replace(/[^a-zæøå0-9]+/gi,' ').replace(/\s+/g,' ').trim();
function blobSha(buffer){return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex')}
function flatten(v,out=[]){if(typeof v==='string')out.push(v);else if(Array.isArray(v))for(const x of v)flatten(x,out);else if(v&&typeof v==='object')for(const x of Object.values(v))flatten(x,out);return out}
function walk(dir,out=[]){for(const name of fs.readdirSync(abs(dir))){const rel=`${dir}/${name}`,st=fs.statSync(abs(rel));if(st.isDirectory())walk(rel,out);else if(name.endsWith('.json'))out.push(rel)}return out}
function strip(v){return v.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function sections(html){const out=[];for(const m of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)){const cls=m[1].match(/class=[\"']([^\"']+)[\"']/i)?.[1]||'';if(!cls.split(/\s+/).includes('merke-blokk'))continue;const id=m[1].match(/id=[\"']([^\"']+)[\"']/i)?.[1]||'';if(id)out.push({id,text:strip(m[2])})}return out}

export function auditFilmTvLegacyTheory(){
  for(const f of [LEGACY,PORTAL,HOLISTIC])assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const buffer=fs.readFileSync(abs(LEGACY)),activeSha=blobSha(buffer);assert(activeSha===ORIGINAL,`Film & TV legacy-blob mismatch: ${activeSha}`);
  const legacySections=sections(buffer.toString('utf8'));assert(JSON.stringify(legacySections.map(x=>x.id))===JSON.stringify(EXPECTED),`Uventet Film & TV legacy-struktur: ${legacySections.map(x=>x.id).join(', ')}`);
  const files=ROOTS.flatMap(r=>walk(r)).filter(f=>f!==LEGACY);const strings=[];for(const f of files){try{flatten(json(f),strings)}catch{}}
  const corpus=norm(strings.join(' '));assert(corpus.length>=MIN_CORPUS,`Film & TV canonical-korpus under truncation-sentinel: ${corpus.length}`);
  const holistic=json(HOLISTIC);assert(holistic.status==='complete','Film & TV holistic completion er ikke complete');assert(holistic.summary?.canonical_domain_count===10,'Film & TV holistic baseline skal ha 10 domener');assert(holistic.summary?.canonical_emne_count===192,'Film & TV holistic baseline skal ha 192 emner');assert(holistic.summary?.required_method_count===119,'Film & TV holistic baseline skal ha 119 metoder');assert(holistic.summary?.registered_chapter_count===17,'Film & TV holistic baseline skal ha 17 kapitler');assert(holistic.summary?.verified_claim_count===663,'Film & TV holistic baseline skal ha 663 claims');assert(holistic.summary?.inspectable_source_registration_count===416,'Film & TV holistic baseline skal ha 416 kilderegistreringer');
  const rows=legacySections.map(s=>{if(s.id==='bidrag')return{id:s.id,role:'legacy_product_copy',anchorCount:0,foundCount:0,anchorCoverage:1,missingAnchors:[],contentStatus:'legacy_product_copy_no_theory_migration_required'};const anchors=POLICY[s.id].map(alts=>({alternatives:alts,found:alts.find(a=>corpus.includes(norm(a)))||null}));const found=anchors.filter(a=>a.found).length;return{id:s.id,role:'knowledge',anchorCount:anchors.length,foundCount:found,anchorCoverage:Number((found/anchors.length).toFixed(3)),anchors,missingAnchors:anchors.filter(a=>!a.found).map(a=>a.alternatives),contentStatus:found===anchors.length?'canonical_anchor_coverage_complete_claim_review_pending':'canonical_anchor_gaps_manual_review_required'}});
  const portal=json(PORTAL).categories?.find(x=>x.id==='film_tv');assert(portal?.badgePage===LEGACY,`Råauditen krever aktiv Film & TV legacy-rute: ${portal?.badgePage}`);
  const knowledge=rows.filter(r=>r.role==='knowledge'),manual=knowledge.filter(r=>r.anchorCoverage<1).map(r=>r.id);
  return{schema:'history_go_fagverk_film_tv_legacy_theory_audit_v1',subject:'film_tv',legacy:{badgePage:LEGACY,originalBlobSha:ORIGINAL,activeBlobSha:activeSha,sourcePreserved:true,sectionCount:rows.length,knowledgeSectionCount:knowledge.length},canonical:{jsonFileCount:files.length,corpusCharacterCount:corpus.length,corpusTruncationFloor:MIN_CORPUS,domainCount:10,emneCount:192,methodCount:119,chapterCount:17,claimCount:663,sourceCount:416},navigation:{badgePage:portal.badgePage,subjectPage:portal.subjectPage,futureTarget:TARGET,legacyRouteActive:true,routeRetired:false},summary:{knowledgeSectionCount:knowledge.length,anchorCompleteCount:knowledge.filter(r=>r.anchorCoverage===1).length,manualReviewCount:manual.length,manualReview:manual,redirectReady:false,redirectBlockReason:'Raw Film & TV coverage never authorizes redirect by itself. Explicit section adjudication and any proven gap migration are required.'},rows};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.stdout.write(`${JSON.stringify(auditFilmTvLegacyTheory(),null,2)}\n`)}catch(e){process.stderr.write(`Film & TV raw legacy audit FEIL: ${e.message}\n`);process.exitCode=1}}
