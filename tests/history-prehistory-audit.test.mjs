import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const A=(v)=>Array.isArray(v)?v:[];
const sorted=(v)=>[...new Set(v)].sort((a,b)=>String(a).localeCompare(String(b),'nb'));
const claims=read('data/fag/historie/claims_historie_canonical_v1.json');
const sources=read('data/fag/historie/sources_historie_canonical_v1.json');
const pe=read('data/fag/historie/place_evidence_historie_v1.json');
const te=read('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const sourceById=new Map(A(sources.sources).map(s=>[s.source_id,s]));
const linksByClaim=new Map();for(const l of A(pe.evidence_links)){const xs=linksByClaim.get(l.claim_id)||[];xs.push(l);linksByClaim.set(l.claim_id,xs);}
const existing=new Set(A(te.entries).map(e=>sorted(e.claim_ids).join('|')));

const targets=[
 {theory_id:'theory_his_arkeologisk_datering_kronologi',keywords:['dater','kronologi','stratigraf','lag','c14','radiokarbon','typologi','seriasjon','middelalderbyen','utgrav']},
 {theory_id:'theory_his_menneskelig_utvikling_mobilitet',keywords:['mobilitet','jeger','sanker','migrasjon','bosetning','redskap','paleolit','mesolit','steinalder','genet','fossil']},
 {theory_id:'theory_his_steinalder_teknologi_bosetning',keywords:['steinalder','mesolit','neolit','redskap','flint','stein','bosetning','ildsted','jakt','råstoff']},
 {theory_id:'theory_his_neolitisering_jordbruk_sedentisme',keywords:['neolit','jordbruk','bofast','dyrking','husdyr','gård','sedent','domest','korn','landbruk']},
 {theory_id:'theory_his_bronsealder_utveksling_ritual',keywords:['bronsealder','bronse','bergkunst','ritual','depon','grav','utveksling','metall','hellerist','prestisje']},
 {theory_id:'theory_his_jernalder_gard_handverk_makt',keywords:['jernalder','jern','gård','gravfelt','grav','håndverk','makt','hunnfelt','steinring','skip','høvding']},
 {theory_id:'theory_his_vikingtid_mobilitet_handel_makt',keywords:['viking','skip','tuneskip','gjellestad','handel','mobilitet','gravskip','makt','kristning','slaveri']},
 {theory_id:'theory_his_arkeologisk_landskap_miljo',keywords:['arkeolog','landskap','ressurs','gravfelt','bosetning','miljø','jakt','jordbruk','ferdsel','kulturspor','hunnfelt']},
 {theory_id:'theory_his_bioarkeologi_helse_demografi',keywords:['bioarkeolog','skjelett','bein','dna','isotop','kosthold','helse','sykdom','demografi','paleopat','grav']}
];
function text(c){return [c.claim_id,c.statement,c.claim_type,...A(c.emne_ids),...A(c.scope?.case_ids),...A(c.scope?.place_ids)].join(' ').toLowerCase();}
function score(c,t){const x=text(c);let s=0;for(const k of t.keywords){if(x.includes(k))s+=3;if(String(c.statement||'').toLowerCase().includes(k))s+=2;}if(A(c.emne_ids).some(e=>e.includes('arkeolog')||e.includes('forhistor')||e.includes('viking')||e.includes('middelalder')))s+=5;return s;}
function eligible(c){if(!c.uncertainty?.level||!String(c.uncertainty?.note||'').trim()||!A(c.alternative_interpretations).length)return false;const links=A(linksByClaim.get(c.claim_id));if(!links.length||links.some(l=>!['validated_case','validated_pilot'].includes(l.validation_status)))return false;for(const sid of A(c.source_ids)){const s=sourceById.get(sid);if(!s||A(s.limitations).length<2||!s.provenance?.repository_source)return false;}return true;}
function times(cs){return sorted(cs.flatMap(c=>[c.scope?.temporal?.from,c.scope?.temporal?.to].filter(v=>v!=null).map(String)));}
function summary(cs,t){const source_ids=sorted(cs.flatMap(c=>A(c.source_ids))),case_ids=sorted(cs.flatMap(c=>A(c.scope?.case_ids))),place_ids=sorted(cs.flatMap(c=>A(c.scope?.place_ids))),types=sorted(cs.map(c=>c.claim_type).filter(Boolean)),anchors=times(cs),ids=cs.map(c=>c.claim_id);return{qualifies:cs.length>=3&&source_ids.length>=2&&case_ids.length>=2&&place_ids.length>=2&&types.length>=2&&anchors.length>=2&&!existing.has(sorted(ids).join('|')),score:cs.reduce((n,c)=>n+score(c,t),0),claim_ids:ids,cases:case_ids,sources:source_ids};}
function combos(items,n,start=0,p=[],out=[]){if(p.length===n){out.push(p);return out;}for(let i=start;i<=items.length-(n-p.length);i++)combos(items,n,i+1,[...p,items[i]],out);return out;}

test('midlertidig Forhistorie/arkeologi claim-audit',()=>{const pool=A(claims.claims).filter(eligible);const report=[];for(const t of targets){const ranked=pool.map(claim=>({claim,score:score(claim,t)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.claim.claim_id.localeCompare(b.claim.claim_id)).slice(0,24);const bundles=[3,4].flatMap(n=>combos(ranked.map(x=>x.claim),n)).map(cs=>summary(cs,t)).filter(b=>b.qualifies).sort((a,b)=>b.score-a.score||a.claim_ids.join('|').localeCompare(b.claim_ids.join('|'))).slice(0,4);report.push({theory_id:t.theory_id,top_claims:ranked.slice(0,8).map(({claim,score})=>({claim_id:claim.claim_id,score,statement:claim.statement,cases:claim.scope?.case_ids,sources:claim.source_ids})),top_bundles:bundles});}console.log('PREHISTORY_AUDIT_START');console.log(JSON.stringify(report,null,2));console.log('PREHISTORY_AUDIT_END');assert.equal(report.length,9);});
