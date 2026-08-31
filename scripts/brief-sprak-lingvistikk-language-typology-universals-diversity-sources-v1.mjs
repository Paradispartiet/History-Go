#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SRC='data/fag/litteratur/sprak_lingvistikk/language_typology_universals_diversity_source_claim_brief_v1.json';
const REP='reports/fagverk/sprak-lingvistikk-language-typology-universals-diversity-source-brief-v1-audit.json';
const abs=f=>path.join(ROOT,f); const read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')); const write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);}; const assert=(c,m)=>{if(!c)throw new Error(m);};
export function audit(){
  const src=read(SRC),sourceIds=new Set(src.sources.map(x=>x.id)),planned=src.topic_briefs.flatMap(x=>x.planned_claims||[]);
  assert(src.status==='source_first_ready_not_materialized','Felt 10 skal være source-first, ikke materialisert');
  assert(src.subject_id==='litteratur'&&src.canonical_subcategory_id==='sprak_lingvistikk','Feil eierskap');
  assert(src.domain?.ordinal===10&&src.domain?.id==='spraktypologi_universaler_mangfold','Feil felt 10');
  assert(src.domain?.production_mode==='new_production_required','Felt 10 skal være ny produksjon');
  assert(src.sources.length===13&&sourceIds.size===13,'13 unike kilder kreves');
  assert(src.sources.every(x=>/^https:\/\/+/u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Alle kilder må være inspectable og verifisert');
  assert(src.topic_briefs.length===8&&planned.length===32&&new Set(planned.map(x=>x.id)).size===32,'8 emner / 32 claims kreves');
  assert(planned.every(x=>x.status==='planned_requires_fulltext_verification'&&x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id))),'Alle planlagte claims må ha >=2 kilder');
  assert(src.planned_assessments?.length===8&&src.decision_scenarios?.length===6,'8 vurderinger / 6 case kreves');
  assert(src.decision_scenarios.every(x=>x.prompt?.length>=120&&x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id))),'Case må være kildebundet og substansielle');
  const b=src.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();
  assert(/comparative concepts/u.test(b)&&/descriptive categories/u.test(b)&&/missing/u.test(b),'Comparative-concept-grense mangler');
  assert(/genealogy/u.test(b)&&/areal/u.test(b)&&/isolates/u.test(b),'Sampling/independence-grense mangler');
  assert(/word-order/u.test(b)&&/exceptionless universal/u.test(b)&&/correlation/u.test(b),'Word-order/universal-grense mangler');
  assert(/morphosyntactic/u.test(b)&&/construction-level/u.test(b)&&/optionality/u.test(b),'Morphosyntax-grense mangler');
  assert(/phonological inventory/u.test(b)&&/doculect/u.test(b)&&/provenance/u.test(b),'Phonology/provenance-grense mangler');
  assert(/absolute universals/u.test(b)&&/counterexamples/u.test(b)&&/falsif/u.test(b),'Universal/falsifiability-grense mangler');
  assert(/feature dependencies/u.test(b)&&/missingness/u.test(b)&&/multivariate/u.test(b),'Database-dependence-grense mangler');
  assert(/language loss/u.test(b)&&/dataset release/u.test(b)&&/generalization limits/u.test(b),'Diversity/reproducibility-grense mangler');
  const r={schema:'history_go_sprak_lingvistikk_language_typology_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:src.domain.id,status:'pass_source_first_ready_not_materialized',counts:{sources:13,topics:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6},gates:{ownership:true,source_first_only:true,inspectable_sources:true,multi_source_claims:true,comparative_concepts:true,sampling_independence:true,word_order_universals:true,morphosyntax_depth:true,phonology_provenance:true,universal_falsifiability:true,database_dependence:true,diversity_reproducibility:true},next_gate:'language_typology_universals_diversity_fulltext'};
  write(REP,r); return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 10 Språktypologi source-first OK: ${r.counts.sources} kilder, ${r.counts.topics} emner, ${r.counts.plannedClaims} claims.`);}catch(e){console.error(`Språk & lingvistikk felt 10 Språktypologi source-first FEIL: ${e.message}`);process.exitCode=1;}
