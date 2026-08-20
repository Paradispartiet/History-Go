#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditByComplete } from '../scripts/audit-fagverk-by-complete.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FAGKART='data/fag/by/fagkart_by.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const BRIDGE='data/fag/by/theory_integrity_bindings_by_v1.json';
const REPORT='reports/fagverk/by-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p), json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8')), text=v=>String(v??'').trim();
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const STOP=new Set(['og','eller','som','for','med','til','fra','av','i','på','om','en','et','den','det','de','der','hvordan','hva','hvor','mellom','mot','ved','kan','skal','blir','bruk','brukes','byen','by','urban','urbane','analyse','lesning','perspektiv','modell','teori','tilnærming']);
const LIMIT=/\b(ikke|aldri|begrens|begrensning|avheng|forutset|usikker|varier|kan ikke|uten å|må skille|skille mellom|sier ikke|beviser ikke|automatisk|universell|konflikt|trade.?off)\b/giu;
const ALT=/\b(alternativ|sammenlign|sammenligne|kontrast|på den ene|på den andre|versus|vs\.?|både|samtidig|ulike|forskjellig|rival|konflikt|spenning)\b/giu;
const AUTH=/(academic|research|official|national|municipal|law|regulation|statistic|audit|government|authority|register|guidance|strategy|policy|report|archive|museum|institute|institutional|directorate|dataset|plan)/iu;
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const tokens=v=>[...new Set(norm(v).split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>=4&&!STOP.has(t)))];
const unique=(xs,key)=>{const s=new Set();return xs.filter(x=>{const k=key(x);if(!k||s.has(k))return false;s.add(k);return true;});};
const matches=(re,values)=>values.reduce((n,v)=>{re.lastIndex=0;return n+(text(v).match(re)?.length||0);},0);

function loadCorpus(chapters){
  const sections=[],claims=[],sources=[];
  for(const record of chapters){
    const chapter=json(record.file), cr=json(chapter.claimsFile);
    claims.push(...(cr.claims||[]).map(x=>({...x,chapterId:chapter.id})));
    sources.push(...(cr.sources||[]).map(x=>({...x,chapterId:chapter.id})));
    for(const modulePath of chapter.moduleFiles||[]){
      const module=json(modulePath);
      for(const section of module.sections||[]){
        sections.push({chapterId:chapter.id,modulePath,sectionId:section.id,prose:[section.title,...(section.paragraphs||[]),...(section.keyPoints||[])].map(text).filter(Boolean).join('\n'),claimIds:[...new Set((section.paragraphClaimIds||[]).flat().concat((section.keyPointClaimIds||[]).flat()).map(text).filter(Boolean))]});
      }
    }
  }
  return {sections,claims,sources};
}

function candidate(hook,section,verifiedIds){
  const hookTokens=tokens([hook.title,...(hook.canon?.thinkers||[]).flatMap(t=>[t.why,...(t.works||[])])].join(' '));
  const st=new Set(tokens(section.prose));
  const overlap=hookTokens.filter(t=>st.has(t));
  const verifiedClaims=section.claimIds.filter(id=>verifiedIds.has(id));
  return {sectionId:section.sectionId,overlap,verifiedClaims,substantive:overlap.length>=2&&verifiedClaims.length>0};
}

function validateBridge(binding,domain,hooks,sections,verifiedIds){
  const hook=hooks.find(h=>h.id===binding.hook_id);
  assert(hook,`Bridge peker til ukjent hook ${binding.hook_id}`);
  assert(domain.id===binding.domain_id,`Bridge domain mismatch ${binding.domain_id}`);
  const rows=[];
  for(const spec of binding.sections||[]){
    const section=sections.find(s=>s.sectionId===spec.section_id);
    assert(section,`Bridge peker til ukjent prosaseksjon ${spec.section_id}`);
    const n=norm(section.prose);
    const missing=(spec.required_terms||[]).filter(term=>!n.includes(norm(term)));
    assert(missing.length===0,`Bridge ${spec.section_id} mangler required terms: ${missing.join(', ')}`);
    const verified=section.claimIds.filter(id=>verifiedIds.has(id));
    assert(verified.length>=(spec.minimum_verified_claims||1),`Bridge ${spec.section_id} mangler claim-binding`);
    rows.push({sectionId:spec.section_id,verifiedClaimIds:verified,requiredTerms:spec.required_terms});
  }
  assert(new Set(rows.map(r=>r.sectionId)).size>=2,`Bridge ${binding.domain_id} må bevise minst to separate prosaseksjoner`);
  return rows;
}

export function auditByTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const complete=auditByComplete({checkReport:true}).report;
  const fagkart=json(FAGKART), registry=json(REGISTRY), bridge=json(BRIDGE);
  assert(fagkart.subject_id==='by','Ugyldig By-fagkart');
  assert(bridge.schema==='history_go_by_theory_integrity_bindings_v1','Ugyldig By theory bridge');
  assert(bridge.status==='proof_selection_only','By bridge må være proof-selection-only');
  assert(bridge.rules?.content_rewrite_forbidden===true&&bridge.rules?.completion_status_read_only===true,'By bridge må være read-only');
  const domains=fagkart.categories||[];
  assert(domains.length===12,`Strict By gate forventer 12 canonicale hovedfelt, fant ${domains.length}`);
  const reg=registry.subjects?.by; assert(reg,'By mangler i Fagverk registry');
  const bridgeByDomain=new Map((bridge.bindings||[]).map(b=>[b.domain_id,b]));
  const rows=[];
  for(const domain of domains){
    const chapters=(reg.chapters||[]).filter(c=>c.primary_domain_id===domain.id);
    assert(chapters.length>0,`By-felt ${domain.id} mangler registrert kapittel`);
    const {sections,claims,sources}=loadCorpus(chapters), hooks=domain.topic_hooks||[];
    const emnes=new Set(hooks.flatMap(h=>h.emne_ids||[]));
    assert(emnes.size>0,`By-felt ${domain.id} mangler canonical emne-binding`);
    const thinkers=unique(hooks.flatMap(h=>h.canon?.thinkers||[]),t=>text(t.id||t.name));
    const substantiveThinkers=thinkers.filter(t=>text(t.why)&&(t.works||[]).some(w=>text(w)));
    assert(substantiveThinkers.length>=2,`By-felt ${domain.id} mangler minst to person→verk/bidrag-bindinger`);
    const usedClaimIds=new Set(sections.flatMap(s=>s.claimIds));
    const verifiedClaims=claims.filter(c=>c.status==='verified'&&usedClaimIds.has(c.id)&&(c.source_ids||[]).length>0);
    const verifiedIds=new Set(verifiedClaims.map(c=>c.id));
    assert(verifiedClaims.length>=4,`By-felt ${domain.id} mangler fire claim/content-bindinger`);
    const sourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
    const authoritative=sources.filter(s=>sourceIds.has(s.id)&&/^https:\/\//.test(text(s.url))&&AUTH.test([s.source_type,s.type,s.publisher,s.title].map(text).join(' ')));
    assert(authoritative.length>=4,`By-felt ${domain.id} mangler fire faglig passende claim-kilder`);
    const prose=[...sections.flatMap(s=>s.prose.split('\n'))];
    const limitSignals=matches(LIMIT,prose), altSignals=matches(ALT,prose);
    const comparisonPairs=hooks.reduce((n,h)=>n+(h.comparison_pairs||[]).length,0);
    assert(comparisonPairs>=1&&(limitSignals+altSignals)>=2,`By-felt ${domain.id} mangler rival/begrensningsbevis`);
    let bearingHooks=0; const selected=[];
    for(const hook of hooks){
      const hookThinkers=(hook.canon?.thinkers||[]).filter(t=>text(t.why)&&(t.works||[]).some(w=>text(w)));
      const cs=sections.map(s=>candidate(hook,s,verifiedIds)).filter(c=>c.substantive);
      if(hookThinkers.length>=2&&cs.length){bearingHooks++;selected.push(...cs.map(c=>({hookId:hook.id,...c})));}
    }
    assert(bearingHooks>=1,`By-felt ${domain.id} mangler bearing theory/model hook med faktisk prosa`);
    let boundSections=[...new Set(selected.map(x=>x.sectionId))];
    let bridgeRows=[];
    if(boundSections.length<2){
      const binding=bridgeByDomain.get(domain.id);
      assert(binding,`By-felt ${domain.id} har mindre enn to maskinvalgte prosabindinger og mangler eksplisitt bridge`);
      bridgeRows=validateBridge(binding,domain,hooks,sections,verifiedIds);
      boundSections=[...new Set([...boundSections,...bridgeRows.map(r=>r.sectionId)])];
    }
    assert(boundSections.length>=2,`By-felt ${domain.id} mangler minst to faktiske prosabindinger`);
    rows.push({domainId:domain.id,chapterIds:chapters.map(c=>c.id),canonicalEmneCount:emnes.size,hookCount:hooks.length,substantiveThinkerCount:substantiveThinkers.length,comparisonPairCount:comparisonPairs,verifiedClaimCount:verifiedClaims.length,authoritativeClaimSourceCount:authoritative.length,bearingHookCount:bearingHooks,boundProseSectionCount:boundSections.length,bridgeUsed:bridgeRows.length>0,bridgeSections:bridgeRows.map(r=>r.sectionId)});
  }
  assert(rows.length===12,'By strict gate må dekke alle 12 hovedfelt');
  assert(rows.every(r=>r.boundProseSectionCount>=2),'Alle By-felt må ha faktisk prosabinding');
  const report={schema:'history_go_by_theory_integrity_audit_v1',version:'1.0.0',subject_id:'by',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',completion_status_read_only:true,content_rewrite_required:false,summary:{canonicalMajorFields:rows.length,fieldsStrictlyProven:rows.length,fieldsUsingExplicitProofBridge:rows.filter(r=>r.bridgeUsed).length,substantiveContentGapsProven:0},sourceModel:{theoryGrounding:'canonical thinker + substantive contribution + named work',appliedEvidence:'verified prose-bound claims + academically appropriate authoritative source'},fields:rows,completeAuditSummary:complete.summary};
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditByTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(e){console.error(`By theory integrity FEIL: ${e.message}`);process.exitCode=1;}
}
