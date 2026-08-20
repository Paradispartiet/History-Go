#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8')),assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={
 theories:'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',
 sources:'data/fag/subkultur/sources_subkultur_canonical_v1.json',
 attribution:'data/fag/subkultur/theory_attribution_subkultur_canonical_v1.json',
 pensum:'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
 claims:'data/fag/subkultur/claims_subkultur_canonical_v1.json',
 links:'data/fag/subkultur/evidence_links_subkultur_canonical_v1.json',
 emner:'data/fag/subkultur/emner_subkultur_canonical_v4_5.json'
};
const isScholarly=s=>/peer_reviewed|scholarly|academic|ethnographic/i.test(s?.source_type||'');
const isGuidanceSupplement=s=>/guideline|guidance|official_|ethics|policy|standard/i.test(s?.source_type||'');
const nonTrivial=s=>typeof s==='string'&&s.trim().length>=40;
const hasLength=(s,n)=>typeof s==='string'&&s.trim().length>=n;
const norm=s=>(s||'').toLocaleLowerCase('nb-NO').replace(/\s+/g,' ').trim();
export function auditSubkulturTheoryAttribution(){
 const theories=json(P.theories),sourcesDoc=json(P.sources),a=json(P.attribution),pensum=json(P.pensum),claimsDoc=json(P.claims),linksDoc=json(P.links),emner=json(P.emner);
 const sourceById=new Map(sourcesDoc.sources.map(s=>[s.source_id,s])),claimById=new Map(claimsDoc.claims.map(c=>[c.claim_id,c])),emneById=new Map(emner.map(e=>[e.emne_id,e])),attrBySource=new Map(),linksByTheoryClaimSource=new Map();
 const people=new Set(),works=new Set(),domains=new Set();
 assert(a.schema==='history_go_subkultur_theory_attribution_v1'&&a.status==='canonical','Ugyldig Subkultur attribution canon');
 assert(/ikke som løs trivia/.test(a.production_rule),'Attribution canon må blokkere navnetrivia');
 assert(claimsDoc.status==='evidence_ready'&&linksDoc.status==='evidence_ready','Subkultur claim/evidence-link canon må være evidence-ready');
 for(const l of linksDoc.links){assert(l.theory_id&&l.claim_id&&l.source_id,`Ufullstendig evidence-link ${l.evidence_link_id}`);assert(claimById.has(l.claim_id),`Evidence-link peker på ukjent claim ${l.claim_id}`);assert(sourceById.has(l.source_id),`Evidence-link peker på ukjent source ${l.source_id}`);const k=`${l.theory_id}::${l.claim_id}::${l.source_id}`;if(!linksByTheoryClaimSource.has(k))linksByTheoryClaimSource.set(k,[]);linksByTheoryClaimSource.get(k).push(l);}
 for(const t of a.theorists){
  assert(t.name&&t.source_ids?.length>=1&&t.works?.length>=1&&t.contribution?.length>=40,`Tynn attribution: ${t.name}`);people.add(t.name);t.works.forEach(w=>works.add(w));
  for(const sid of t.source_ids){const s=sourceById.get(sid);assert(s,`Ukjent attribution source ${sid}`);assert(s.creators?.length>=1&&s.title,`Kilde mangler creator/title ${sid}`);assert(isScholarly(s),`Navngitt forskerkilde er ikke scholarly: ${t.name}/${sid}/${s.source_type}`);if(!attrBySource.has(sid))attrBySource.set(sid,[]);attrBySource.get(sid).push(t.name);}
 }
 assert(a.domain_attribution.length===8,'Alle 8 Subkultur-domener må ha attribution');
 for(const d of a.domain_attribution){domains.add(d.domain_id);assert(d.source_ids?.length>=3&&d.competing_positions?.length>=80,`Domene mangler kildebredde/motposisjon: ${d.domain_id}`);assert(d.source_ids.every(id=>attrBySource.has(id)),`Domene bruker unattributed source: ${d.domain_id}`);assert(d.source_ids.filter(id=>isScholarly(sourceById.get(id))).length>=3,`Domene mangler scholarly kjerne: ${d.domain_id}`);}
 const canonicalDomains=new Set(pensum.domains.map(d=>d.domain_id));assert(domains.size===8&&[...canonicalDomains].every(id=>domains.has(id)),'Attribution matcher ikke 8 canonicale domener');assert(theories.length===80,'Subkultur skal ha 80 theory objects');assert(emneById.size===80,'Subkultur skal ha 80 canonicale emner');
 const covered=new Set(),unattributed=[];let scholarlyCoreTheoryCount=0,proseBoundTheoryCount=0,claimBoundSourceCount=0,guidanceSupplementCount=0;
 for(const t of theories){
  assert(t.status==='evidence_ready'&&t.evidence_ready===true,`Theory ikke evidence-ready: ${t.theory_id}`);assert(t.emne_ids?.length===1&&t.source_ids?.length>=3&&t.critique_or_counterposition?.length>=80&&t.limitations_and_misuse?.length>=2,`Theory mangler substans: ${t.theory_id}`);
  const emneId=t.emne_ids[0],emne=emneById.get(emneId);covered.add(emneId);assert(emne,`Theory peker på ukjent canonical emne: ${t.theory_id}/${emneId}`);assert(emne.canonical_status==='canonical'&&emne.canonical_file_role==='active'&&emne.status==='active',`Theory peker ikke på aktiv canonical prosa: ${t.theory_id}/${emneId}`);assert(emne.domain===t.domain_id||emne.area_id===t.domain_id,`Theory/emne domain mismatch: ${t.theory_id}/${emneId}`);
  const proseThresholds={definition:60,why_it_matters:35,analytical_question:35,mechanism:35,limitation:25,scope_guard:80};for(const [field,min] of Object.entries(proseThresholds))assert(hasLength(emne[field],min),`Canonical emne mangler substansiell prosa ${field}: ${emneId}`);
  assert(nonTrivial(t.thesis_or_definition)&&nonTrivial(t.mechanism),`Theory mangler definisjon/mekanismeprosa: ${t.theory_id}`);assert(t.thesis_or_definition===emne.definition,`Theory-definition er ikke bundet til canonical emneprosa: ${t.theory_id}`);assert(t.mechanism===emne.mechanism,`Theory-mekanisme er ikke bundet til canonical emneprosa: ${t.theory_id}`);assert(t.limitations_and_misuse.includes(emne.limitation),`Theory-begrensning er ikke bundet til canonical emneprosa: ${t.theory_id}`);
  const sources=t.source_ids.map(id=>{const s=sourceById.get(id);assert(s,`Ukjent theory source ${t.theory_id}/${id}`);assert(s.quality?.tier==='A'&&nonTrivial(s.contribution)&&Array.isArray(s.limitations)&&s.limitations.some(nonTrivial),`Theory source mangler kvalitet/provenance ${t.theory_id}/${id}`);assert(isScholarly(s)||isGuidanceSupplement(s),`Theory source er verken scholarly eller eksplisitt guidance-supplement: ${t.theory_id}/${id}/${s.source_type}`);if(!isScholarly(s))guidanceSupplementCount++;return s;});
  const scholarlyCount=sources.filter(isScholarly).length;assert(scholarlyCount>=2&&scholarlyCount>=Math.ceil(sources.length/2),`Theory mangler scholarly kjerne/flertall: ${t.theory_id} (${scholarlyCount}/${sources.length})`);scholarlyCoreTheoryCount++;
  const attributed=t.source_ids.filter(id=>attrBySource.has(id));if(attributed.length<2)unattributed.push(t.theory_id);
  assert(t.claim_ids?.length>=2,`Theory mangler claim-binding: ${t.theory_id}`);const claims=t.claim_ids.map(id=>{const c=claimById.get(id);assert(c,`Ukjent theory claim ${t.theory_id}/${id}`);assert(c.theory_id===t.theory_id,`Claim/theory mismatch ${id}`);assert(c.domain_id===t.domain_id&&c.emne_ids?.length===1&&c.emne_ids[0]===emneId,`Claim scope mismatch ${id}`);assert(nonTrivial(c.statement)&&c.source_ids?.length>=1,`Tynn theory claim ${id}`);for(const sid of c.source_ids){assert(t.source_ids.includes(sid),`Claim source ligger utenfor theory source-sett: ${t.theory_id}/${id}/${sid}`);const s=sourceById.get(sid);assert(s&&isScholarly(s),`Theory-claim bygger ikke på scholarly source: ${t.theory_id}/${id}/${sid}/${s?.source_type}`);const matches=linksByTheoryClaimSource.get(`${t.theory_id}::${id}::${sid}`)||[];assert(matches.some(l=>['conceptual_support','critical_boundary'].includes(l.support_type)&&nonTrivial(l.inference_boundary)),`Claim source mangler eksakt evidence-link: ${t.theory_id}/${id}/${sid}`);claimBoundSourceCount++;}return c;});
  const definitionClaim=claims.find(c=>c.claim_type==='theory_definition_and_mechanism');const boundaryClaim=claims.find(c=>c.claim_type==='theory_boundary_and_critique');assert(definitionClaim&&boundaryClaim,`Theory mangler definition/boundary claim-paret: ${t.theory_id}`);const definitionText=norm(definitionClaim.statement),boundaryText=norm(boundaryClaim.statement);assert(definitionText.includes(norm(emne.definition))&&definitionText.includes(norm(emne.mechanism)),`Definition/mechanism claim er ikke faktisk bundet til canonical emneprosa: ${t.theory_id}`);assert(boundaryText.includes(norm(emne.limitation)),`Boundary claim er ikke faktisk bundet til canonical begrensningsprosa: ${t.theory_id}`);
  proseBoundTheoryCount++;
 }
 assert(unattributed.length===0,`Theory objects mangler minst to forsker-/verkankre: ${unattributed.join(', ')}`);assert(covered.size===80,'Theory attribution skal dekke 80 unike emner');assert(people.size>=20&&works.size>=15,'For liten forsker-/verksbredde');assert(scholarlyCoreTheoryCount===80&&proseBoundTheoryCount===80,'Subkultur strict theory proof skal dekke 80/80 theory objects');
 return {status:'strong_theory_attribution',theoryCount:theories.length,coveredEmneCount:covered.size,domainCount:domains.size,uniquePeopleCount:people.size,uniqueWorkCount:works.size,attributedSourceCount:attrBySource.size,scholarlyCoreTheoryCount,proseBoundTheoryCount,claimBoundSourceCount,guidanceSupplementCount};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(auditSubkulturTheoryAttribution(),null,2));}catch(e){console.error(`Subkultur theory attribution FEIL: ${e.message}`);process.exitCode=1;}}
