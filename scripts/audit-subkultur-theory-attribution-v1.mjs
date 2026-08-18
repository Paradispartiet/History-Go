#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8')),assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={theories:'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',sources:'data/fag/subkultur/sources_subkultur_canonical_v1.json',attribution:'data/fag/subkultur/theory_attribution_subkultur_canonical_v1.json',pensum:'data/fag/subkultur/subkulturpensum_canonical_v4_5.json'};
export function auditSubkulturTheoryAttribution(){
 const theories=json(P.theories),sourcesDoc=json(P.sources),a=json(P.attribution),pensum=json(P.pensum);const sourceById=new Map(sourcesDoc.sources.map(s=>[s.source_id,s]));const attrBySource=new Map();const people=new Set(),works=new Set(),domains=new Set();
 assert(a.schema==='history_go_subkultur_theory_attribution_v1'&&a.status==='canonical','Ugyldig Subkultur attribution canon');assert(/ikke som løs trivia/.test(a.production_rule),'Attribution canon må blokkere navnetrivia');
 for(const t of a.theorists){assert(t.name&&t.source_ids?.length>=1&&t.works?.length>=1&&t.contribution?.length>=40,`Tynn attribution: ${t.name}`);people.add(t.name);t.works.forEach(w=>works.add(w));for(const sid of t.source_ids){assert(sourceById.has(sid),`Ukjent attribution source ${sid}`);const s=sourceById.get(sid);assert(s.creators?.length>=1&&s.title,`Kilde mangler creator/title ${sid}`);if(!attrBySource.has(sid))attrBySource.set(sid,[]);attrBySource.get(sid).push(t.name);}}
 assert(a.domain_attribution.length===8,'Alle 8 Subkultur-domener må ha attribution');for(const d of a.domain_attribution){domains.add(d.domain_id);assert(d.source_ids?.length>=3&&d.competing_positions?.length>=80,`Domene mangler kildebredde/motposisjon: ${d.domain_id}`);assert(d.source_ids.every(id=>attrBySource.has(id)),`Domene bruker unattributed source: ${d.domain_id}`);}
 const canonicalDomains=new Set(pensum.domains.map(d=>d.domain_id));assert(domains.size===8&&[...canonicalDomains].every(id=>domains.has(id)),'Attribution matcher ikke 8 canonicale domener');assert(theories.length===80,'Subkultur skal ha 80 theory objects');
 const covered=new Set(),unattributed=[];for(const t of theories){assert(t.status==='evidence_ready'&&t.evidence_ready===true,`Theory ikke evidence-ready: ${t.theory_id}`);assert(t.emne_ids?.length===1&&t.source_ids?.length>=3&&t.critique_or_counterposition?.length>=80&&t.limitations_and_misuse?.length>=2,`Theory mangler substans: ${t.theory_id}`);covered.add(t.emne_ids[0]);const attributed=t.source_ids.filter(id=>attrBySource.has(id));if(attributed.length<2)unattributed.push(t.theory_id);}
 assert(unattributed.length===0,`Theory objects mangler minst to forsker-/verkankre: ${unattributed.join(', ')}`);assert(covered.size===80,'Theory attribution skal dekke 80 unike emner');assert(people.size>=20&&works.size>=15,'For liten forsker-/verksbredde');
 return {status:'strong_theory_attribution',theoryCount:theories.length,coveredEmneCount:covered.size,domainCount:domains.size,uniquePeopleCount:people.size,uniqueWorkCount:works.size,attributedSourceCount:attrBySource.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(auditSubkulturTheoryAttribution(),null,2));}catch(e){console.error(`Subkultur theory attribution FEIL: ${e.message}`);process.exitCode=1;}}
