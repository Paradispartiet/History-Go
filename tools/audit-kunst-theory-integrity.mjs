#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditKunstComplete } from '../scripts/audit-fagverk-kunst-complete.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FAGKART='data/fag/kunst/fagkart_kunst_canonical_v4_5.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const REPORT='reports/fagverk/kunst-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
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
          sectionId:section.id,
          prose:[section.title,...(section.paragraphs||[]),...(section.keyPoints||[])].map(text).filter(Boolean).join('\n'),
          claimIds:[...new Set(collectClaimRefs(section).map(text).filter(Boolean))]
        });
      }
    }
  }
  return {sections,claims,sources};
}

function substantiveCandidates(hook,sections,verifiedIds){
  const theoryTokens=tokens([hook.title,...(hook.canon?.thinkers||[]).flatMap(t=>[t.name,t.why,...(t.works||[])])].join(' '));
  return sections.filter(section=>{
    const proseTokens=new Set(tokens(section.prose));
    const overlap=theoryTokens.filter(token=>proseTokens.has(token));
    return overlap.length>=2&&section.claimIds.some(id=>verifiedIds.has(id));
  });
}

export function auditKunstTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const complete=auditKunstComplete({checkReport:true}).report;
  const fagkart=json(FAGKART), registry=json(REGISTRY), kunstRegistry=registry.subjects?.kunst;
  assert(kunstRegistry,'Kunst mangler i Fagverk registry');
  assert(fagkart.subject_id==='kunst','Ugyldig Kunst-fagkart');
  assert(fagkart.principles?.source_first===true,'Kunst strict gate krever source-first');
  assert(fagkart.principles?.external_claim_basis_required===true,'Kunst strict gate krever ekstern claim-basis');
  assert(fagkart.principles?.artwork_or_institution_before_theory===true,'Kunst strict gate krever verk/institusjon før teori');
  assert(fagkart.principles?.no_generic_art_theory_questions===true,'Kunst strict gate må blokkere generisk teori-trivia');
  assert(complete.summary.domainCount===6&&complete.summary.chapterCount===6,'Kunst strict gate forventer 6/6 canonicale feltkapitler');
  assert(complete.summary.claimCount===140&&complete.summary.sourceCount===100,'Kunst strict gate forventer låst claim-/kildegrunnlag');

  const coverage=new Map((complete.canonicalDomainCoverage||[]).map(row=>[row.domainId,row]));
  const rows=[];
  for(const domain of fagkart.categories||[]){
    const coverageRow=coverage.get(domain.id);
    assert(coverageRow?.chapterCount===1&&coverageRow?.emneCount>0,`Kunst-felt ${domain.id} mangler canonical field coverage`);
    const chapters=(kunstRegistry.chapters||[]).filter(ch=>ch.primary_domain_id===domain.id);
    assert(chapters.length===1,`Kunst-felt ${domain.id} må ha eksakt ett registrert feltkapittel`);
    const {sections,claims,sources}=loadCorpus(chapters);
    const hooks=domain.topic_hooks||[];
    assert(hooks.length>0,`Kunst-felt ${domain.id} mangler structured theory hooks`);
    assert(hooks.every(h=>h.generator_constraints?.do_not_generate_from_hook_label_only===true),`Kunst-felt ${domain.id} tillater metadata-only teori`);
    const thinkers=unique(hooks.flatMap(h=>h.canon?.thinkers||[]),t=>text(t.id||t.name));
    const substantiveThinkers=thinkers.filter(t=>text(t.why)&&(t.works||[]).some(w=>text(w)));
    assert(substantiveThinkers.length>=2,`Kunst-felt ${domain.id} mangler minst to person→verk/bidrag-bindinger`);
    const usedClaimIds=new Set(sections.flatMap(s=>s.claimIds));
    const verifiedClaims=claims.filter(c=>c.status==='verified'&&usedClaimIds.has(c.id)&&(c.source_ids||[]).length>0);
    assert(verifiedClaims.length>=4,`Kunst-felt ${domain.id} mangler minst fire verified claim/content-bindinger`);
    const verifiedIds=new Set(verifiedClaims.map(c=>c.id));
    const sourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
    const authoritative=sources.filter(s=>sourceIds.has(s.id)&&/^https:\/\//.test(text(s.url))&&AUTH.test([s.source_type,s.type,s.publisher,s.title].map(text).join(' ')));
    assert(authoritative.length>=4,`Kunst-felt ${domain.id} mangler faglig passende anvendt kildegrunnlag`);
    const comparisonPairs=hooks.reduce((n,h)=>n+(h.comparison_pairs||[]).length,0);
    const prose=sections.flatMap(s=>s.prose.split('\n'));
    assert(comparisonPairs>=1,`Kunst-felt ${domain.id} mangler reell comparison/rival-struktur`);
    assert(matches(LIMIT,prose)+matches(ALT,prose)>=2,`Kunst-felt ${domain.id} mangler begrensnings-/alternativbevis i prosa`);
    let bearingHooks=0;
    const selected=[];
    for(const hook of hooks){
      const hookThinkers=(hook.canon?.thinkers||[]).filter(t=>text(t.why)&&(t.works||[]).some(w=>text(w)));
      const candidates=substantiveCandidates(hook,sections,verifiedIds);
      if(hookThinkers.length>=2&&candidates.length){bearingHooks++;selected.push(...candidates.map(c=>c.sectionId));}
    }
    assert(bearingHooks>=1,`Kunst-felt ${domain.id} mangler bearing theory hook med claim-bundet prosa`);
    assert(new Set(selected).size>=2,`Kunst-felt ${domain.id} mangler minst to faktiske prosabindinger`);
    rows.push({domainId:domain.id,strictlyProven:true});
  }
  assert(rows.length===6,'Kunst strict gate må dekke alle seks canonicale hovedfelt');
  const report={
    schema:'history_go_kunst_theory_integrity_audit_v1',
    version:'1.0.0',
    subject_id:'kunst',
    status:'STRICTLY_PROVEN',
    proof_scope:'per_canonical_major_field',
    completion_status_read_only:true,
    content_rewrite_required:false,
    summary:{canonicalMajorFields:6,fieldsStrictlyProven:6,explicitProofBridges:0,substantiveContentGapsProven:0},
    sourceModel:{theoryGrounding:'canonical thinker + substantive contribution + named work',appliedEvidence:'verified prose-bound claims + academically appropriate inspectable source'},
    fields:rows
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditKunstTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Kunst theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
