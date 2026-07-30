import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const A = (v) => Array.isArray(v) ? v : [];
const sorted = (v) => [...new Set(v)].sort((a,b)=>String(a).localeCompare(String(b),'nb'));

const claimsFile = readJson('data/fag/historie/claims_historie_canonical_v1.json');
const sourcesFile = readJson('data/fag/historie/sources_historie_canonical_v1.json');
const placeEvidenceFile = readJson('data/fag/historie/place_evidence_historie_v1.json');
const theoryEvidenceFile = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const sourceById = new Map(A(sourcesFile.sources).map(s=>[s.source_id,s]));
const linksByClaim = new Map();
for (const link of A(placeEvidenceFile.evidence_links)) {
  const xs = linksByClaim.get(link.claim_id) || []; xs.push(link); linksByClaim.set(link.claim_id,xs);
}
const existingBundles = new Set(A(theoryEvidenceFile.entries).map(e=>sorted(e.claim_ids).join('|')));

const targets = [
  {theory_id:'theory_his_miljo_klima_klima_og_historisk_endring',emne:'em_his_miljo_klima_klima_og_historisk_endring',keywords:['klima','temperatur','meteorolog','frost','vær','nedbør','homogen','måleserie','ekstremvær']},
  {theory_id:'theory_his_miljo_klima_energi_og_energiregimer',emne:'em_his_miljo_klima_energi_og_energiregimer',keywords:['energi','vannkraft','kraft','fosse','mølle','sagbruk','elektr','kull','olje','drivstoff','produksjon']},
  {theory_id:'theory_his_miljo_klima_skog_vann_og_naturressurser',emne:'em_his_miljo_klima_skog_vann_og_naturressurser',keywords:['skog','vann','elv','akerselva','naturressurs','fiske','fisk','tømmer','jord','ressurs','fosse']},
  {theory_id:'theory_his_miljo_klima_forurensning_og_urban_miljohistorie',emne:'em_his_miljo_klima_forurensning_og_urban_miljohistorie',keywords:['forurens','miljøpark','akerselva','industri','utslipp','avfall','kloakk','urban','helse','rehabiliter']},
  {theory_id:'theory_his_miljo_klima_dyr_og_menneske_natur_relasjoner',emne:'em_his_miljo_klima_dyr_og_menneske_natur_relasjoner',keywords:['dyr','rein','reindrift','fisk','fiske','hest','husdyr','jakt','fangst','natur','menneske']},
  {theory_id:'theory_his_miljo_klima_naturforvaltning_og_miljobevegelse',emne:'em_his_miljo_klima_naturforvaltning_og_miljobevegelse',keywords:['naturforvalt','miljøbeveg','miljøpark','vern','akerselva','alta','hardangervidda','naturvern','petisjon','demonstrasjon']},
  {theory_id:'theory_his_miljo_klima_antropocen_langsom_vold_og_miljorettferdighet',emne:'em_his_miljo_klima_antropocen_langsom_vold_og_miljorettferdighet',keywords:['antropocen','langsom vold','miljørettferd','forurens','risiko','helse','ulik','urfolk','ressurs','industri','skade']},
  {theory_id:'theory_his_miljo_klima_urban_natur_helse_og_miljoulikhet',emne:'em_his_miljo_klima_urban_natur_helse_og_miljoulikhet',keywords:['urban natur','miljøulik','helse','arbeidsmiljø','forurens','akerselva','miljøpark','risiko','bolig','klasse','ulik']},
  {theory_id:'theory_his_miljo_klima_miljorettferdighet_langsom_vold_og_framtidsansvar',emne:'em_his_miljo_klima_miljorettferdighet_langsom_vold_og_framtidsansvar',keywords:['miljørettferd','langsom vold','framtidsansvar','forurens','skade','risiko','ulik','klima','minne','ansvar','urfolk']}
];

function text(c){return [c.claim_id,c.statement,c.claim_type,...A(c.emne_ids),...A(c.scope?.case_ids),...A(c.scope?.place_ids)].join(' ').toLowerCase();}
function relevance(c,t){const x=text(c);let s=A(c.emne_ids).includes(t.emne)?30:0;for(const k of t.keywords){if(x.includes(k))s+=3;if(String(c.statement||'').toLowerCase().includes(k))s+=2;}return s;}
function eligible(c){
  if(!c.uncertainty?.level||!String(c.uncertainty?.note||'').trim()||!A(c.alternative_interpretations).length)return false;
  const links=A(linksByClaim.get(c.claim_id)); if(!links.length||links.some(l=>!['validated_case','validated_pilot'].includes(l.validation_status)))return false;
  for(const sid of A(c.source_ids)){const s=sourceById.get(sid);if(!s||A(s.limitations).length<2||!s.provenance?.repository_source)return false;}
  return true;
}
function anchors(cs){return sorted(cs.flatMap(c=>[c.scope?.temporal?.from,c.scope?.temporal?.to].filter(v=>v!=null).map(String)));}
function summarize(cs,t){const sources=sorted(cs.flatMap(c=>A(c.source_ids))),cases=sorted(cs.flatMap(c=>A(c.scope?.case_ids))),places=sorted(cs.flatMap(c=>A(c.scope?.place_ids))),types=sorted(cs.map(c=>c.claim_type).filter(Boolean)),times=anchors(cs),ids=cs.map(c=>c.claim_id);return {qualifies:cs.length>=3&&sources.length>=2&&cases.length>=2&&places.length>=2&&types.length>=2&&times.length>=2&&!existingBundles.has(sorted(ids).join('|')),score:cs.reduce((n,c)=>n+relevance(c,t),0),claim_ids:ids,sources,cases,places,claim_types:types,temporal_anchors:times};}
function combos(items,n,start=0,prefix=[],out=[]){if(prefix.length===n){out.push(prefix);return out;}for(let i=start;i<=items.length-(n-prefix.length);i++)combos(items,n,i+1,[...prefix,items[i]],out);return out;}

test('midlertidig miljø/klima claim-audit',()=>{
  const eligibleClaims=A(claimsFile.claims).filter(eligible); const report=[];
  for(const target of targets){
    const ranked=eligibleClaims.map(claim=>({claim,score:relevance(claim,target)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.claim.claim_id.localeCompare(b.claim.claim_id)).slice(0,22);
    const bundles=[3,4].flatMap(n=>combos(ranked.map(x=>x.claim),n)).map(cs=>summarize(cs,target)).filter(b=>b.qualifies).sort((a,b)=>b.score-a.score||a.claim_ids.join('|').localeCompare(b.claim_ids.join('|'))).slice(0,12);
    report.push({theory_id:target.theory_id,direct_tagged_claims:ranked.filter(x=>A(x.claim.emne_ids).includes(target.emne)).length,top_claims:ranked.slice(0,14).map(({claim,score})=>({claim_id:claim.claim_id,score,statement:claim.statement,claim_type:claim.claim_type,cases:claim.scope?.case_ids,places:claim.scope?.place_ids,sources:claim.source_ids,emne_ids:claim.emne_ids})),top_contract_valid_bundles:bundles});
  }
  console.log('ENVIRONMENT_AUDIT_JSON_START'); console.log(JSON.stringify(report,null,2)); console.log('ENVIRONMENT_AUDIT_JSON_END');
  assert.equal(report.length,9);
});
