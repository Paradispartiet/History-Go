import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const A = (v) => Array.isArray(v) ? v : [];
const unique = (v) => [...new Set(v)];
const sorted = (v) => unique(v).sort((a,b)=>String(a).localeCompare(String(b),'nb'));

const claimsFile = readJson('data/fag/historie/claims_historie_canonical_v1.json');
const sourcesFile = readJson('data/fag/historie/sources_historie_canonical_v1.json');
const placeEvidenceFile = readJson('data/fag/historie/place_evidence_historie_v1.json');
const theoryEvidenceFile = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const sourceById = new Map(A(sourcesFile.sources).map(s=>[s.source_id,s]));
const linksByClaim = new Map();
for (const link of A(placeEvidenceFile.evidence_links)) {
  const list = linksByClaim.get(link.claim_id) || [];
  list.push(link); linksByClaim.set(link.claim_id,list);
}
const existingBundles = new Set(A(theoryEvidenceFile.entries).map(e=>sorted(e.claim_ids).join('|')));

const targets = [
  { theory_id:'theory_his_embetsverk_byrakrati', emne:'em_his_embetsstat_forvaltning', keywords:['embets','byråkrat','forvaltning','administrasjon','departement','statsråd','rådhus','regjering','kontor','saksbehandling'] },
  { theory_id:'theory_his_beslutningskjede_kompetanse', emne:'em_his_beslutningskjeder_kompetanse_ansvar', keywords:['beslutning','vedtak','kompetanse','mandat','ansvar','storting','regjering','bystyre','kommisjon','iverksett'] },
  { theory_id:'theory_his_statlig_kapasitet_ressurser', emne:'em_his_statlig_kapasitet_skatt_infrastruktur', keywords:['kapasitet','ressurs','skatt','budsjett','infrastruktur','personell','logistikk','stat','jernbane','militær','skole'] },
  { theory_id:'theory_his_rettigheter_borgerskap_forvaltning', emne:'em_his_rettigheter_borgerskap_forvaltning', keywords:['rettighet','statsborger','medborger','stemmerett','språk','jord','adgang','forvaltning','borgerskap','rett'] },
  { theory_id:'theory_his_lov_domstol_rettsstat', emne:'em_his_rett_politi_fengsel', keywords:['lov','domstol','dom','rettsstat','jurisdiksjon','prosedyre','bevis','høyesterett','rett','klage'] },
  { theory_id:'theory_his_politi_fengsel_straff', emne:'em_his_politi_straff_institusjonshverdag', keywords:['politi','fengsel','straff','arrest','fange','innsatt','møllergata','botsfengsel','akershus','soning'] },
  { theory_id:'theory_his_register_overvakning_disiplin', emne:'em_his_kontroll_overvakning', keywords:['overvåk','register','kartotek','mappe','lund','politi','kontroll','statistikk','observasjon','disiplin'] },
  { theory_id:'theory_his_krise_unntak_kontinuitet', emne:'em_his_styring_krise_kontinuitet', keywords:['krise','unntak','okkupasjon','krig','1940','kontinuitet','beredskap','eksil','regjering','fullmakt','motstand'] }
];

function text(c){return [c.claim_id,c.statement,c.claim_type,...A(c.emne_ids),...A(c.scope?.case_ids),...A(c.scope?.place_ids)].join(' ').toLowerCase();}
function score(c,t){const x=text(c);let s=A(c.emne_ids).includes(t.emne)?20:0;for(const k of t.keywords){if(x.includes(k))s+=3;if(String(c.statement||'').toLowerCase().includes(k))s+=2;}return s;}
function eligible(c){
  if(!c.uncertainty?.level||!String(c.uncertainty?.note||'').trim()||!A(c.alternative_interpretations).length)return false;
  const links=A(linksByClaim.get(c.claim_id)); if(!links.length||links.some(l=>!['validated_case','validated_pilot'].includes(l.validation_status)))return false;
  for(const sid of A(c.source_ids)){const s=sourceById.get(sid);if(!s||A(s.limitations).length<2||!s.provenance?.repository_source)return false;}
  return true;
}
function temporal(cs){return sorted(cs.flatMap(c=>[c.scope?.temporal?.from,c.scope?.temporal?.to].filter(v=>v!=null).map(String)));}
function summary(cs,t){
  const sources=sorted(cs.flatMap(c=>A(c.source_ids))),cases=sorted(cs.flatMap(c=>A(c.scope?.case_ids))),places=sorted(cs.flatMap(c=>A(c.scope?.place_ids))),types=sorted(cs.map(c=>c.claim_type).filter(Boolean)),anchors=temporal(cs),ids=cs.map(c=>c.claim_id);
  return {qualifies:cs.length>=3&&sources.length>=2&&cases.length>=2&&places.length>=2&&types.length>=2&&anchors.length>=2&&!existingBundles.has(sorted(ids).join('|')),score:cs.reduce((n,c)=>n+score(c,t),0),claim_ids:ids,sources,cases,places,claim_types:types,temporal_anchors:anchors};
}
function combos(items,size,start=0,prefix=[],out=[]){if(prefix.length===size){out.push(prefix);return out;}for(let i=start;i<=items.length-(size-prefix.length);i++)combos(items,size,i+1,[...prefix,items[i]],out);return out;}

test('midlertidig Makt/stat claim-audit',()=>{
  const eligibleClaims=A(claimsFile.claims).filter(eligible); const report=[];
  for(const target of targets){
    const ranked=eligibleClaims.map(claim=>({claim,score:score(claim,target)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.claim.claim_id.localeCompare(b.claim.claim_id)).slice(0,22);
    const bundles=[3,4].flatMap(n=>combos(ranked.map(x=>x.claim),n)).map(cs=>summary(cs,target)).filter(b=>b.qualifies).sort((a,b)=>b.score-a.score||a.claim_ids.join('|').localeCompare(b.claim_ids.join('|'))).slice(0,12);
    report.push({theory_id:target.theory_id,top_claims:ranked.slice(0,14).map(({claim,score})=>({claim_id:claim.claim_id,score,statement:claim.statement,claim_type:claim.claim_type,cases:claim.scope?.case_ids,places:claim.scope?.place_ids,sources:claim.source_ids,emne_ids:claim.emne_ids})),top_contract_valid_bundles:bundles});
  }
  console.log('POWER_STATE_AUDIT_JSON_START'); console.log(JSON.stringify(report,null,2)); console.log('POWER_STATE_AUDIT_JSON_END');
  assert.equal(report.length,8);
});
