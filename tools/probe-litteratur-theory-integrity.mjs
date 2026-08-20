#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='data/fag/litteratur/litteraturvitenskap_canonical_v1';
const COVERAGE=`${BASE}/coverage_contract_v1.json`;
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const unique=xs=>[...new Set(xs.filter(Boolean))];
const ALT=/\b(alternativ|rivaliser|konkurrer|motles|motmodell|kontrast|annen forklaring|andre forklaringer|sammenlign|vs\.?|spenning|uenig|motstrid)\b/iu;
const LIMIT=/\b(inferensgrense|kildegrense|begrens|kan ikke|ikke alene|ikke automatisk|usikker|usikkerhet|forbehold|avgrens|rekkevidde|krever .*kilde|uten .*data|ikke dokumenter)\b/iu;
const THEORY=/\b(teori|teoretisk|modell|perspektiv|kritikk|analyse|hermeneut|formalisme|struktural|semiot|narratolog|resepsjon|diskurs|dekonstruksjon|psykoanal|fenomenolog|marxis|feminis|queer|postkolon|dekolon|okokrit|kognitiv|empirisk|intertekst|paratekst)\b/iu;
const ACADEMIC=/(university|universitet|cambridge|oxford|routledge|wiley|blackwell|springer|palgrave|harvard|yale|columbia|johns hopkins|uchicago|press|museum|archive|arkiv|library|bibliotek|institute|institutt|foundation|forskn)/iu;
const PERSON_CONTRIB=/\b([A-ZÆØÅ][\p{L}.'’-]{2,})(?:s|’s|')\s+(begrep|teori|modell|metode|analyse|lesning|bidrag|skille|diskursanalyse|supplementanalyse|segmentering|narratologi|poetikk|kritikk)\b/u;

function refs(value,out=[]){
  if(Array.isArray(value)){for(const item of value)refs(item,out);return out;}
  if(!value||typeof value!=='object')return out;
  for(const [k,v] of Object.entries(value)){
    if(['paragraphClaimIds','keyPointClaimIds','claimIds'].includes(k)&&Array.isArray(v))out.push(...v.flat(Infinity).map(text).filter(Boolean));
    else refs(v,out);
  }
  return out;
}

function loadArea(area){
  const chapterPath=`${BASE}/foundation_texts/${area.id}.json`;
  const chapter=json(chapterPath);
  const modules=(chapter.moduleFiles||[]).map(p=>json(p));
  const sections=modules.flatMap(m=>m.sections||[]);
  const paragraphs=sections.flatMap(s=>(s.paragraphs||[]).map((p,i)=>({sectionId:s.id,index:i,text:text(p),claimIds:(s.paragraphClaimIds?.[i]||[]).map(text)})));
  const claims=json(chapter.claimsFile);
  const claimById=new Map((claims.claims||[]).map(c=>[c.id,c]));
  const sourceById=new Map((claims.sources||[]).map(s=>[s.id,s]));
  const usedIds=new Set(paragraphs.flatMap(p=>p.claimIds));
  const verifiedClaims=(claims.claims||[]).filter(c=>c.status==='verified'&&usedIds.has(c.id)&&(c.source_ids||[]).length>0);
  const usedSourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
  const academicSources=(claims.sources||[]).filter(s=>usedSourceIds.has(s.id)&&/^https:\/\//.test(text(s.url))&&ACADEMIC.test([s.publisher,s.label,s.type,s.source_location].map(text).join(' ')));
  const personBindings=[];
  for(const c of verifiedClaims){
    const m=text(c.claim).match(PERSON_CONTRIB);
    if(!m)continue;
    const bound=(c.source_ids||[]).map(id=>sourceById.get(id)).filter(Boolean).filter(s=>text(s.label)&&text(s.source_location));
    if(bound.length)personBindings.push({claimId:c.id,personToken:m[1],contribution:m[2],sources:bound.map(s=>({id:s.id,label:s.label,publisher:s.publisher}))});
  }
  for(const p of paragraphs){
    const m=p.text.match(PERSON_CONTRIB);
    if(!m)continue;
    for(const id of p.claimIds){
      const c=claimById.get(id); if(!c||c.status!=='verified')continue;
      const bound=(c.source_ids||[]).map(sid=>sourceById.get(sid)).filter(Boolean).filter(s=>text(s.label)&&text(s.source_location));
      if(bound.length)personBindings.push({claimId:id,personToken:m[1],contribution:m[2],sectionId:p.sectionId,sources:bound.map(s=>({id:s.id,label:s.label,publisher:s.publisher}))});
    }
  }
  let fulfillment=null;
  if(area.full_field_contract){
    const contract=json(`${BASE}/${area.full_field_contract}`);
    fulfillment=json(`${BASE}/${contract.fulfillmentSchema.requiredFile}`);
  }
  const theoryEvidencePointers=fulfillment?.topicEvidence?.flatMap(row=>Object.values(row.theoryEvidence||{}))||[];
  const theoryParagraphs=paragraphs.filter(p=>THEORY.test(p.text));
  const altParagraphs=paragraphs.filter(p=>ALT.test(norm(p.text)));
  const limitParagraphs=paragraphs.filter(p=>LIMIT.test(norm(p.text)));
  const directPersonBindings=unique(personBindings.map(x=>`${x.personToken}|${x.contribution}|${x.claimId}`));
  const commonPass=verifiedClaims.length>=4&&academicSources.length>=2&&altParagraphs.length>=2&&limitParagraphs.length>=2&&theoryParagraphs.length>=2;
  let diagnosticStatus='possible_content_or_other_proof_gap';
  if(commonPass&&directPersonBindings.length>=2)diagnosticStatus='direct_strict_candidate';
  else if(commonPass)diagnosticStatus='attribution_reconciliation_needed';
  return {
    areaId:area.id,
    areaStatus:area.status,
    fullFieldContract:Boolean(area.full_field_contract),
    moduleCount:modules.length,
    sectionCount:sections.length,
    paragraphCount:paragraphs.length,
    verifiedProseBoundClaims:verifiedClaims.length,
    academicUsedSources:academicSources.length,
    theoryEvidencePointers:theoryEvidencePointers.length,
    theoryBearingParagraphs:theoryParagraphs.length,
    alternativeOrRivalParagraphs:altParagraphs.length,
    limitationOrInferenceParagraphs:limitParagraphs.length,
    directPersonContributionBindings:directPersonBindings.length,
    personBindingExamples:personBindings.slice(0,4),
    diagnosticStatus
  };
}

export function probeLitteraturTheoryIntegrity(){
  auditLitteraturScientificPackage();
  const coverage=json(COVERAGE);
  const areas=(coverage.coverage_areas||[]).map(loadArea);
  const counts=status=>areas.filter(a=>a.diagnosticStatus===status).length;
  return {
    schema:'history_go_litteratur_theory_integrity_probe_v1',
    status:'diagnostic_read_only',
    subject_id:'litteratur',
    rules:{contentRewriteForbidden:true,completionStatusReadOnly:true,missingProofIsNotContentGap:true},
    summary:{
      canonicalMajorFields:areas.length,
      expandedFullFieldAreas:areas.filter(a=>a.fullFieldContract).length,
      chapterOverviewAreas:areas.filter(a=>!a.fullFieldContract).length,
      directStrictCandidates:counts('direct_strict_candidate'),
      attributionReconciliationNeeded:counts('attribution_reconciliation_needed'),
      possibleContentOrOtherProofGaps:counts('possible_content_or_other_proof_gap')
    },
    areas
  };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(probeLitteraturTheoryIntegrity(),null,2));}
  catch(e){console.error(`Litteratur theory integrity probe FEIL: ${e.stack||e.message}`);process.exitCode=1;}
}
