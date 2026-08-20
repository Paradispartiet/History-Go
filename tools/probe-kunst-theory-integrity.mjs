#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditKunstComplete } from '../scripts/audit-fagverk-kunst-complete.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FAGKART='data/fag/kunst/fagkart_kunst_canonical_v4_5.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const STOP=new Set(['og','eller','som','for','med','til','fra','av','i','på','om','en','et','den','det','de','der','hvordan','hva','hvor','mellom','mot','ved','kan','skal','blir','bruk','brukes','kunst','kunsten','kunstner','analyse','lesning','perspektiv','modell','teori','tilnærming','verk','sted']);
const LIMIT=/\b(ikke|aldri|begrens|begrensning|avheng|forutset|usikker|varier|kan ikke|uten å|må skille|skille mellom|sier ikke|beviser ikke|automatisk|universell|konflikt|trade.?off|tilstrekkelig|nødvendig)\b/giu;
const ALT=/\b(alternativ|sammenlign|sammenligne|kontrast|på den ene|på den andre|versus|vs\.?|både|samtidig|ulike|forskjellig|rival|konflikt|spenning|derimot)\b/giu;
const AUTH=/(academic|research|official|museum|gallery|institution|institutional|archive|university|college|directorate|government|municipal|national|law|policy|strategy|report|catalog|catalogue|collection|education|foundation|institute|journal|press)/iu;
const tokens=v=>[...new Set(norm(v).split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>=4&&!STOP.has(t)))];
const unique=(xs,key)=>{const s=new Set();return xs.filter(x=>{const k=key(x);if(!k||s.has(k))return false;s.add(k);return true;});};
const matches=(re,values)=>values.reduce((n,v)=>{re.lastIndex=0;return n+(text(v).match(re)?.length||0);},0);

function collectClaimRefs(value,result=[]){
  if(Array.isArray(value)){for(const item of value)collectClaimRefs(item,result);return result;}
  if(!value||typeof value!=='object')return result;
  for(const [key,item] of Object.entries(value)){
    if(['claimIds','paragraphClaimIds','keyPointClaimIds'].includes(key)&&Array.isArray(item))result.push(...item.flat(Infinity));
    else collectClaimRefs(item,result);
  }
  return result;
}

function loadCorpus(chapterRecords){
  const sections=[],claims=[],sources=[];
  for(const record of chapterRecords){
    const chapter=json(record.file);
    const claimRegister=json(chapter.claimsFile);
    claims.push(...(claimRegister.claims||[]).map(row=>({...row,chapterId:chapter.id})));
    sources.push(...(claimRegister.sources||[]).map(row=>({...row,chapterId:chapter.id})));
    for(const modulePath of chapter.moduleFiles||[]){
      const module=json(modulePath);
      for(const section of module.sections||[]){
        sections.push({
          chapterId:chapter.id,
          modulePath,
          sectionId:section.id,
          prose:[section.title,...(section.paragraphs||[]),...(section.keyPoints||[])].map(text).filter(Boolean).join('\n'),
          claimIds:[...new Set(collectClaimRefs(section).map(text).filter(Boolean))]
        });
      }
    }
  }
  return {sections,claims,sources};
}

function proseCandidates(hook,sections,verifiedIds){
  const theoryTokens=tokens([
    hook.title,
    ...(hook.canon?.thinkers||[]).flatMap(t=>[t.name,t.why,...(t.works||[])])
  ].join(' '));
  return sections.map(section=>{
    const proseTokens=new Set(tokens(section.prose));
    const overlap=theoryTokens.filter(token=>proseTokens.has(token));
    const verifiedClaims=section.claimIds.filter(id=>verifiedIds.has(id));
    return {sectionId:section.sectionId,tokenOverlap:overlap.length,verifiedClaimCount:verifiedClaims.length,substantive:overlap.length>=2&&verifiedClaims.length>0};
  }).filter(row=>row.substantive);
}

export function probeKunstTheoryIntegrity(){
  const complete=auditKunstComplete({checkReport:true}).report;
  const fagkart=json(FAGKART);
  const registry=json(REGISTRY);
  const kunstRegistry=registry.subjects?.kunst;
  if(!kunstRegistry)throw new Error('Kunst mangler i Fagverk registry');
  const fields=[];
  for(const domain of fagkart.categories||[]){
    const chapters=(kunstRegistry.chapters||[]).filter(ch=>ch.primary_domain_id===domain.id);
    const {sections,claims,sources}=loadCorpus(chapters);
    const hooks=domain.topic_hooks||[];
    const emneIds=[...new Set(hooks.flatMap(h=>h.emne_ids||[]))];
    const thinkers=unique(hooks.flatMap(h=>h.canon?.thinkers||[]),t=>text(t.id||t.name));
    const substantiveThinkers=thinkers.filter(t=>text(t.why)&&(t.works||[]).some(w=>text(w)));
    const usedClaimIds=new Set(sections.flatMap(s=>s.claimIds));
    const verifiedClaims=claims.filter(c=>c.status==='verified'&&usedClaimIds.has(c.id)&&(c.source_ids||[]).length>0);
    const verifiedIds=new Set(verifiedClaims.map(c=>c.id));
    const sourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
    const authoritative=sources.filter(s=>sourceIds.has(s.id)&&/^https:\/\//.test(text(s.url))&&AUTH.test([s.source_type,s.type,s.publisher,s.title].map(text).join(' ')));
    const comparisonPairs=hooks.reduce((n,h)=>n+(h.comparison_pairs||[]).length,0);
    const prose=sections.flatMap(s=>s.prose.split('\n'));
    const selected=[];
    let bearingHooks=0;
    for(const hook of hooks){
      const hookThinkers=(hook.canon?.thinkers||[]).filter(t=>text(t.why)&&(t.works||[]).some(w=>text(w)));
      const candidates=proseCandidates(hook,sections,verifiedIds);
      if(hookThinkers.length>=2&&candidates.length){
        bearingHooks++;
        selected.push(...candidates.map(c=>c.sectionId));
      }
    }
    const proseBindings=[...new Set(selected)];
    const checks={
      registeredChapter:chapters.length===1,
      canonicalEmneBinding:emneIds.length>0,
      personWorkBinding:substantiveThinkers.length>=2,
      verifiedClaimBinding:verifiedClaims.length>=4,
      academicallyAppropriateAppliedSources:authoritative.length>=4,
      rivalOrAlternative:comparisonPairs>=1,
      limitationsOrAlternatives:(matches(LIMIT,prose)+matches(ALT,prose))>=2,
      bearingTheoryHook:bearingHooks>=1,
      actualProseBinding:proseBindings.length>=2
    };
    fields.push({
      domainId:domain.id,
      counts:{chapters:chapters.length,hooks:hooks.length,emnes:emneIds.length,substantiveThinkers:substantiveThinkers.length,comparisonPairs,verifiedClaims:verifiedClaims.length,authoritativeAppliedSources:authoritative.length,bearingHooks,proseBindings:proseBindings.length},
      checks,
      strictCandidate:Object.values(checks).every(Boolean),
      selectedProseSections:proseBindings
    });
  }
  return {
    schema:'history_go_kunst_theory_integrity_probe_v1',
    subject_id:'kunst',
    mode:'read_only_diagnostic',
    completionStatusReadOnly:true,
    contentMutation:false,
    completeAudit:{domains:complete.summary.domainCount,chapters:complete.summary.chapterCount,emnes:complete.summary.emneCount,methods:complete.summary.methodCount,hooks:complete.summary.hookCount,claims:complete.summary.claimCount,sources:complete.summary.sourceCount},
    summary:{canonicalMajorFields:fields.length,strictCandidates:fields.filter(f=>f.strictCandidate).length,fieldsNeedingProofReconciliation:fields.filter(f=>!f.strictCandidate).map(f=>f.domainId)},
    fields
  };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(probeKunstTheoryIntegrity(),null,2));}
  catch(error){console.error(`Kunst theory integrity probe FEIL: ${error.message}`);process.exitCode=1;}
}
