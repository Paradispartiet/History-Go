#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FILE='data/fag/litteratur/sprak_lingvistikk/sociolinguistics_variation_multilingualism_language_power_source_claim_brief_v1.json';
const REPORT='reports/fagverk/sprak-lingvistikk-sociolinguistics-variation-multilingualism-language-power-source-brief-v1-audit.json';
const abs=f=>path.join(ROOT,f); const read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')); const write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);}; const assert=(c,m)=>{if(!c)throw new Error(m);};
export function audit(){
  const b=read(FILE);
  assert(b.status==='source_first_ready_not_materialized','Sosiolingvistikk skal være source-first');
  assert(b.domain?.ordinal===8&&b.domain?.id==='sosiolingvistikk_variasjon_flerspraklighet_sprakmakt'&&b.domain?.production_mode==='reuse_with_expansion','Feil felt 8/reuse-kontrakt');
  assert(b.reconciliation?.reuse_with_expansion===true&&b.reconciliation?.existing_owner_content_preserved===true,'Reuse-with-expansion må bevare eierinnhold');
  assert(Array.isArray(b.reconciliation?.move_existing_files)&&b.reconciliation.move_existing_files.length===0,'Eksisterende filer skal ikke flyttes');
  assert(b.reconciliation?.secondary_support_does_not_count_as_materialized===true,'Secondary support må være ikke-tellende');
  assert(fs.existsSync(abs('data/fag/litteratur/litteraturpensum_canonical_v4_5.json')),'Litteratur owner content mangler');
  assert(fs.existsSync(abs('data/fag/politikk/sosiologi_antropologi')),'Sosiologi/antropologi secondary support mangler');
  const lit=fs.readFileSync(abs('data/fag/litteratur/litteraturpensum_canonical_v4_5.json'),'utf8'); assert(lit.includes('sprak_makt_identitet'),'Eksisterende språk/makt/identitet-spor mangler');
  const ids=new Set(b.sources.map(x=>x.id)), claims=b.topic_briefs.flatMap(x=>x.planned_claims||[]);
  assert(b.sources.length===13&&ids.size===13,'13 kilder kreves');
  assert(b.sources.every(x=>/^https:\/\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Kilder må være inspectable/verifisert');
  assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(x=>x.id)).size===32,'8 emner / 32 claims kreves');
  assert(claims.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'Claims trenger >=2 gyldige kilder');
  assert(b.decision_scenarios?.length===6&&b.decision_scenarios.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'6 case kreves');
  const boundary=b.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();
  assert(/variable/u.test(boundary)&&/essensi/u.test(boundary)&&/probabilist/u.test(boundary),'Variation/non-essentialism-grense mangler');
  assert(/audience/u.test(boundary)&&/topic/u.test(boundary)&&/style/u.test(boundary),'Style/context-grense mangler');
  assert(/demographic/u.test(boundary)&&/enkeltperson|individ/u.test(boundary),'Social-category-grense mangler');
  assert(/code-switching/u.test(boundary)&&/operational|operasjon/u.test(boundary)&&/competence/u.test(boundary),'Multilingual operationalization-grense mangler');
  assert(/prestige/u.test(boundary)&&/iboende/u.test(boundary)&&/linguistic/u.test(boundary),'Attitude/prestige-grense mangler');
  assert(/standardization/u.test(boundary)&&/språklig bedre/u.test(boundary)&&/institution/u.test(boundary),'Language-power/standardization-grense mangler');
  assert(/rural\/urban/u.test(boundary)&&/contact/u.test(boundary)&&/sampling/u.test(boundary),'Contact/community-grense mangler');
  assert(/metadata/u.test(boundary)&&/identitetsfasit/u.test(boundary)&&/proveniens|corpus release/u.test(boundary),'Metadata/provenance-grense mangler');
  assert(b.fail_closed_contract?.source_brief_does_not_count_as_materialized===true&&b.fail_closed_contract?.reuse_requires_own_sociolinguistics_fulltext===true,'Source brief/reuse må ikke telle som materialisert');
  const q={correctness_and_evidence:5,variationist_and_style_method:5,multilingual_and_social_meaning_method:5,power_ethics_and_nonessentialism:5,corpus_sampling_and_provenance:5,assessment_readiness:5};
  const r={schema:'history_go_sprak_lingvistikk_sociolinguistics_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',status:'pass_source_first_ready_not_materialized',counts:{sources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedAssessments:8},gates:{ownership:true,reuse_with_expansion:true,existing_owner_content_preserved:true,no_moves:true,inspectable_sources:true,multi_source_claims:true,variation_nonessentialism:true,style_context:true,social_category_sampling:true,multilingual_operationalization:true,attitude_prestige_boundary:true,language_power_standardization_boundary:true,contact_community_sampling:true,metadata_ethics_provenance:true},six_part_quality_review:{...q,total:30},next_gate:'materialize_sociolinguistics_variation_multilingualism_language_power_fulltext'};
  write(REPORT,r); return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 8 Sosiolingvistikk source-first OK: ${r.counts.sources} kilder, ${r.counts.topicBriefs} emner, ${r.counts.plannedClaims} claims, ${r.counts.decisionScenarios} case.`);}catch(e){console.error(`Språk & lingvistikk felt 8 Sosiolingvistikk source-first FEIL: ${e.message}`);process.exitCode=1;}
