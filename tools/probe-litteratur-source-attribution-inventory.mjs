#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='data/fag/litteratur/litteraturvitenskap_canonical_v1';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const SCHOLARLY=/(university|universitet|cambridge|oxford|routledge|wiley|blackwell|springer|palgrave|harvard|yale|columbia|johns hopkins|uchicago|cornell|ohio state|mit press|sage|press|museum|archive|arkiv|library|bibliotek|institute|institutt|foundation|forskn|association for the study of literature and environment|oral history association|norsk barnebokinstitutt|columbia law school)/iu;
const isScholarly=s=>/^https:\/\//.test(text(s?.url))&&SCHOLARLY.test([s?.publisher,s?.label,s?.type,s?.source_location].map(text).join(' '));

function loadArea(area){
  const chapter=json(`${BASE}/foundation_texts/${area.id}.json`);
  const modules=(chapter.moduleFiles||[]).map(p=>json(p));
  const paragraphs=modules.flatMap(m=>(m.sections||[]).flatMap(s=>(s.paragraphs||[]).map((p,i)=>({sectionId:s.id,paragraphIndex:i,text:text(p),claimIds:(s.paragraphClaimIds?.[i]||[]).map(text)}))));
  const claims=json(chapter.claimsFile);
  const claimById=new Map((claims.claims||[]).map(c=>[c.id,c]));
  const sourceRows=[];
  for(const source of (claims.sources||[]).filter(isScholarly)){
    const usedClaims=(claims.claims||[]).filter(c=>c.status==='verified'&&(c.source_ids||[]).includes(source.id));
    const usedClaimIds=new Set(usedClaims.map(c=>c.id));
    const evidenceParagraphs=paragraphs.filter(p=>p.claimIds.some(id=>usedClaimIds.has(id))).slice(0,8).map(p=>({
      sectionId:p.sectionId,
      paragraphIndex:p.paragraphIndex,
      claimIds:p.claimIds.filter(id=>usedClaimIds.has(id)),
      text:p.text
    }));
    if(!usedClaims.length||!evidenceParagraphs.length)continue;
    sourceRows.push({
      sourceId:source.id,
      label:source.label,
      publisher:source.publisher,
      sourceLocation:source.source_location,
      url:source.url,
      usedClaimIds:[...usedClaimIds],
      evidenceParagraphs
    });
  }
  return {areaId:area.id,areaStatus:area.status,scholarlyUsedSourceCount:sourceRows.length,sources:sourceRows};
}

export function probeLitteraturSourceAttributionInventory(){
  const coverage=json(`${BASE}/coverage_contract_v1.json`);
  const areas=(coverage.coverage_areas||[]).map(loadArea);
  return {
    schema:'history_go_litteratur_source_attribution_inventory_probe_v1',
    status:'diagnostic_read_only_not_proof',
    rules:{contentRewriteForbidden:true,completionStatusReadOnly:true,sourceMustBeUsedByVerifiedProseBoundClaim:true},
    summary:{canonicalMajorFields:areas.length,fieldsWithAtLeastTwoScholarlyUsedSources:areas.filter(a=>a.scholarlyUsedSourceCount>=2).length},
    areas
  };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(probeLitteraturSourceAttributionInventory(),null,2));}
  catch(e){console.error(`Litteratur source attribution inventory FEIL: ${e.stack||e.message}`);process.exitCode=1;}
}
