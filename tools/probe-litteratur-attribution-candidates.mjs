#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='data/fag/litteratur/litteraturvitenskap_canonical_v1';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const SCHOLARLY=/(university|universitet|cambridge|oxford|routledge|wiley|blackwell|springer|palgrave|harvard|yale|columbia|johns hopkins|uchicago|cornell|ohio state|press|museum|archive|arkiv|library|bibliotek|institute|institutt|foundation|forskn|association for the study of literature and environment)/iu;
const PERSON_ACTION=/\b([A-ZÆØÅ][\p{L}.'’-]{2,})\s+(skiller|definerer|beskriver|utvikler|lanserer|argumenterer|kaller|forbinder|modellerer|analyserer|foreslår|viser|formulerer|teoretiserer|leser|kritiserer|problematiserer|framhever|fremhever)\b/u;
const PERSON_POSSESSIVE=/\b([A-ZÆØÅ][\p{L}.'’-]{2,})(?:s|’s|')\s+(begrep|teori|modell|metode|analyse|lesning|bidrag|skille|diskursanalyse|supplementanalyse|segmentering|narratologi|poetikk|kritikk)\b/u;
const STOP=new Set('dette denne disse der deres gjennom mellom over under etter foran innen uten ikke bare også slik fordi derfor eller mens hvor som hva hvem hvilken hvilke når med fra til for ved av om en et ei den det de sin sitt sine har hadde blir ble være er var kan kunne skal skulle må bør gjør gjorde viser analyse analyser teori teorien modell modellen begrep begrepet tekst teksten litteratur litteraturvitenskap'.split(/\s+/));

function tokens(value){
  return new Set(norm(value).split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>=5&&!STOP.has(t)));
}
function overlap(a,b){let n=0;for(const x of a)if(b.has(x))n++;return n;}
function isScholarly(s){return /^https:\/\//.test(text(s?.url))&&SCHOLARLY.test([s?.publisher,s?.label,s?.type,s?.source_location].map(text).join(' '));}
function personMention(paragraph){
  const m=text(paragraph).match(PERSON_POSSESSIVE)||text(paragraph).match(PERSON_ACTION);
  if(!m)return null;
  return {person:m[1],signal:m[2],kind:PERSON_POSSESSIVE.test(text(paragraph))?'possessive':'action'};
}

function loadArea(area){
  const chapter=json(`${BASE}/foundation_texts/${area.id}.json`);
  const modules=(chapter.moduleFiles||[]).map(p=>json(p));
  const paragraphs=modules.flatMap(m=>(m.sections||[]).flatMap(s=>(s.paragraphs||[]).map((p,i)=>({sectionId:s.id,paragraphIndex:i,text:text(p),claimIds:(s.paragraphClaimIds?.[i]||[]).map(text)}))));
  const claims=json(chapter.claimsFile);
  const claimById=new Map((claims.claims||[]).map(c=>[c.id,c]));
  const sourceById=new Map((claims.sources||[]).map(s=>[s.id,s]));
  const candidates=[];
  for(const p of paragraphs){
    const mention=personMention(p.text); if(!mention)continue;
    const pTokens=tokens(p.text);
    for(const claimId of p.claimIds){
      const claim=claimById.get(claimId); if(!claim||claim.status!=='verified')continue;
      const sources=(claim.source_ids||[]).map(id=>sourceById.get(id)).filter(isScholarly);
      if(!sources.length)continue;
      const ranked=sources.map(s=>({source:s,score:overlap(pTokens,tokens(`${s.label} ${s.source_location}`))})).sort((a,b)=>b.score-a.score||String(a.source.id).localeCompare(String(b.source.id)));
      const top=ranked[0], second=ranked[1];
      if(!top||top.score<2)continue;
      if(second&&top.score===second.score)continue;
      candidates.push({
        person:mention.person,
        signal:mention.signal,
        signalKind:mention.kind,
        sectionId:p.sectionId,
        paragraphIndex:p.paragraphIndex,
        claimId,
        sourceId:top.source.id,
        workOrSource:top.source.label,
        publisher:top.source.publisher,
        sourceLocation:top.source.source_location,
        lexicalOverlap:top.score,
        runnerUpOverlap:second?.score??null
      });
    }
  }
  const unique=[]; const seen=new Set();
  for(const c of candidates){const k=`${c.person}|${c.claimId}|${c.sourceId}`;if(!seen.has(k)){seen.add(k);unique.push(c);}}
  return {areaId:area.id,candidateCount:unique.length,candidates:unique.slice(0,12)};
}

export function probeLitteraturAttributionCandidates(){
  const coverage=json(`${BASE}/coverage_contract_v1.json`);
  const areas=(coverage.coverage_areas||[]).map(loadArea);
  return {
    schema:'history_go_litteratur_attribution_candidate_probe_v1',
    status:'diagnostic_read_only_not_proof',
    rules:{materializeOnlyAfterReview:true,contentRewriteForbidden:true,completionStatusReadOnly:true},
    summary:{
      canonicalMajorFields:areas.length,
      fieldsWithAtLeastOneCandidate:areas.filter(a=>a.candidateCount>=1).length,
      fieldsWithAtLeastTwoCandidates:areas.filter(a=>a.candidateCount>=2).length,
      fieldsWithNoCandidates:areas.filter(a=>a.candidateCount===0).length
    },
    areas
  };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(probeLitteraturAttributionCandidates(),null,2));}
  catch(e){console.error(`Litteratur attribution candidate probe FEIL: ${e.stack||e.message}`);process.exitCode=1;}
}
