#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLitteraturScientificPackage } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='data/fag/litteratur/litteraturvitenskap_canonical_v1';
const COVERAGE=`${BASE}/coverage_contract_v1.json`;
const REPORT='reports/fagverk/litteratur-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const THEORY=/\b(?:teori\p{L}*|modell\p{L}*|perspektiv\p{L}*|kritikk\p{L}*|analyse\p{L}*|hermeneut\p{L}*|formalisme\p{L}*|struktural\p{L}*|semiot\p{L}*|narratolog\p{L}*|resepsjon\p{L}*|diskurs\p{L}*|dekonstruksjon\p{L}*|psykoanal\p{L}*|fenomenolog\p{L}*|marxis\p{L}*|feminis\p{L}*|queer\p{L}*|postkolon\p{L}*|dekolon\p{L}*|okokrit\p{L}*|kognitiv\p{L}*|empirisk\p{L}*|intertekst\p{L}*|paratekst\p{L}*)/iu;
const ALT=/\b(?:alternativ\p{L}*|rivaliser\p{L}*|konkurrer\p{L}*|motles\p{L}*|motmodell\p{L}*|kontrast\p{L}*|annen forklaring|andre forklaringer|sammenlign\p{L}*|vs\.?|spenning\p{L}*|uenig\p{L}*|motstrid\p{L}*)/iu;
const LIMIT=/\b(?:inferensgrense\p{L}*|kildegrense\p{L}*|begrens\p{L}*|kan ikke|ikke alene|ikke automatisk|usikker\p{L}*|forbehold\p{L}*|avgrens\p{L}*|rekkevidde\p{L}*|krever [^.?!]*kilde|uten [^.?!]*data|ikke dokumenter\p{L}*)/iu;
const SCHOLARLY=/(university|universitet|cambridge|oxford|routledge|wiley|blackwell|springer|palgrave|harvard|yale|columbia|johns hopkins|uchicago|cornell|ohio state|mit press|sage|press|museum|archive|arkiv|library|bibliotek|institute|institutt|foundation|forskn|association for the study of literature and environment|oral history association|norsk barnebokinstitutt|columbia law school|intergovernmental panel on climate change|united nations|national archives)/iu;
const ATTRIBUTION=/\b([A-ZÆØÅ][\p{L}.'’-]{2,})(?:s|’s|')\s+(begrep|teori|modell|metode|analyse|lesning|bidrag|skille|diskursanalyse|supplementanalyse|segmentering|narratologi|poetikk|kritikk)\b|\b([A-ZÆØÅ][\p{L}.'’-]{2,})\s+(skiller|definerer|utvikler|lanserer|argumenterer|modellerer|analyserer|foreslår|formulerer|teoretiserer|kritiserer|problematiserer)\b/u;
const FALSE_NAMES=new Set(['Den','Det','Denne','Dette','Disse','Analysen','Teorien','Modellen','Metoden','Teksten','Kritikken','Forskeren','Historikeren','Leseren','Forfatteren','Begrepet','Verket']);

function loadArea(area){
  const chapter=json(`${BASE}/foundation_texts/${area.id}.json`);
  const modules=(chapter.moduleFiles||[]).map(p=>json(p));
  const sections=modules.flatMap(m=>m.sections||[]);
  const paragraphs=sections.flatMap(s=>(s.paragraphs||[]).map((p,i)=>({sectionId:s.id,paragraphIndex:i,text:text(p),claimIds:(s.paragraphClaimIds?.[i]||[]).map(text)})));
  const register=json(chapter.claimsFile);
  const claimById=new Map((register.claims||[]).map(c=>[c.id,c]));
  const sourceById=new Map((register.sources||[]).map(s=>[s.id,s]));
  const usedIds=new Set(paragraphs.flatMap(p=>p.claimIds));
  const verifiedClaims=(register.claims||[]).filter(c=>c.status==='verified'&&usedIds.has(c.id)&&(c.source_ids||[]).length>0);
  const verifiedIds=new Set(verifiedClaims.map(c=>c.id));
  const usedSourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
  const scholarlySources=(register.sources||[]).filter(s=>usedSourceIds.has(s.id)&&/^https:\/\//.test(text(s.url))&&SCHOLARLY.test([s.publisher,s.label,s.type,s.source_location].map(text).join(' ')));
  const scholarlyIds=new Set(scholarlySources.map(s=>s.id));
  const theoryParagraphs=paragraphs.filter(p=>THEORY.test(norm(p.text))&&p.claimIds.some(id=>verifiedIds.has(id)));
  const rivalParagraphs=paragraphs.filter(p=>ALT.test(norm(p.text))&&p.claimIds.some(id=>verifiedIds.has(id)));
  const limitParagraphs=paragraphs.filter(p=>LIMIT.test(norm(p.text))&&p.claimIds.some(id=>verifiedIds.has(id)));
  let theoryEvidencePointers=0;
  if(area.full_field_contract){
    const contract=json(`${BASE}/${area.full_field_contract}`);
    const fulfillment=json(`${BASE}/${contract.fulfillmentSchema.requiredFile}`);
    assert(fulfillment.status==='verified',`${area.id}: full-field fulfillment er ikke verified`);
    theoryEvidencePointers=(fulfillment.topicEvidence||[]).flatMap(row=>Object.values(row.theoryEvidence||{})).length;
    assert(theoryEvidencePointers>=12,`${area.id}: full-field theoryEvidence mangler forventet 2x6 avsnittspeking`);
  }

  const authorityBindings=[];
  for(const p of theoryParagraphs){
    const m=p.text.match(ATTRIBUTION); if(!m)continue;
    const person=m[1]||m[3]; if(!person||FALSE_NAMES.has(person))continue;
    const bound=[];
    for(const claimId of p.claimIds){
      const claim=claimById.get(claimId); if(!claim||claim.status!=='verified')continue;
      for(const sourceId of claim.source_ids||[]){
        if(!scholarlyIds.has(sourceId))continue;
        const source=sourceById.get(sourceId);
        if(source&&text(source.label)&&text(source.source_location))bound.push({claimId,sourceId,workOrSource:source.label});
      }
    }
    assert(bound.length>0,`${area.id}/${p.sectionId}: navngitt fagperson ${person} mangler claim→scholarly source/work-binding`);
    authorityBindings.push({person,sectionId:p.sectionId,paragraphIndex:p.paragraphIndex,boundSources:bound});
  }

  assert(verifiedClaims.length>=4,`${area.id}: mangler minst fire verified prose-bound claims`);
  assert(scholarlySources.length>=2,`${area.id}: mangler minst to faktisk anvendte scholarly/authoritative kilder`);
  assert(theoryParagraphs.length>=2,`${area.id}: mangler faktisk theory/model-bearing prosa`);
  assert(rivalParagraphs.length>=2,`${area.id}: mangler reell rival/alternativ-prosa`);
  assert(limitParagraphs.length>=2,`${area.id}: mangler begrensnings-/inferensprosa`);
  assert(paragraphs.every(p=>p.text.split(/\s+/u).filter(Boolean).length>=10),`${area.id}: kort placeholder-prosa er ikke tillatt i strict gate`);

  return {
    fieldId:area.id,
    fieldStatus:area.status,
    fullFieldContract:Boolean(area.full_field_contract),
    strictlyProven:true,
    verifiedProseBoundClaims:verifiedClaims.length,
    scholarlyUsedSources:scholarlySources.length,
    theoryEvidencePointers,
    theoryBearingParagraphs:theoryParagraphs.length,
    rivalOrAlternativeParagraphs:rivalParagraphs.length,
    limitationOrInferenceParagraphs:limitParagraphs.length,
    explicitNamedAuthorityBindings:authorityBindings.length
  };
}

export function auditLitteraturTheoryIntegrity({writeReport=false,checkReport=true}={}){
  auditLitteraturScientificPackage();
  const coverage=json(COVERAGE);
  assert(coverage.subject_id==='litteratur','Ugyldig Litteratur coverage contract');
  assert(coverage.completion_definition?.required_area_count===28,'Litteratur strict gate forventer 28 canonicale hovedfelt');
  assert(coverage.completion_definition?.required_topic_count===168,'Litteratur strict gate forventer 168 canonicale emner');
  assert((coverage.completion_definition?.requirements_per_topic||[]).some(x=>/alternativ fortolkning.*inferensgrense/iu.test(x)),'Litteratur-kontrakten må kreve alternativ fortolkning og inferensgrense');
  assert((coverage.completion_definition?.forbidden_shortcuts||[]).some(x=>/teorier.*bare listes/iu.test(x)),'Litteratur-kontrakten må forby metadata-only teori');
  const fields=(coverage.coverage_areas||[]).map(loadArea);
  assert(fields.length===28,'Litteratur strict gate må dekke alle 28 canonicale hovedfelt');
  assert(fields.every(f=>f.strictlyProven),'Alle Litteratur-felt må strict-proves');
  const expanded=fields.filter(f=>f.fullFieldContract).length;
  assert(expanded===18,'Litteratur strict gate forventer 18 fulfilled full-field contracts');

  const report={
    schema:'history_go_litteratur_theory_integrity_audit_v1',
    version:'1.0.0',
    subject_id:'litteratur',
    status:'STRICTLY_PROVEN',
    proof_scope:'per_canonical_major_field',
    completion_status_read_only:true,
    content_rewrite_required:false,
    rules:{
      fixed_theorist_quota_forbidden:true,
      named_people_require_claim_bound_work_or_research_contribution:true,
      theory_metadata_without_prose_binding_fails:true,
      contested_fields_require_rival_or_alternative:true,
      academically_appropriate_used_sources_required:true
    },
    summary:{
      canonicalMajorFields:28,
      fieldsStrictlyProven:28,
      expandedFullFieldAreas:18,
      chapterOverviewAreas:10,
      substantiveContentGapsProven:0
    },
    sourceModel:{
      theoryGrounding:'existing theory/model-bearing prose; full-field theoryEvidence pointers where present',
      appliedEvidence:'verified prose-bound claims + actually used scholarly/authoritative sources',
      personWorkRule:'claim-bound source/work contribution required only when prose explicitly invokes a named scholarly authority'
    },
    fields
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditLitteraturTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Litteratur theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
