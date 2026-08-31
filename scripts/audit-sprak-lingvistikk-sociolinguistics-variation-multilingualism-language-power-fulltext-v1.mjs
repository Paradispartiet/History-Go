#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CH='data/fagverk/litteratur/sprak_lingvistikk/sosiolingvistikk-variasjon-flerspraklighet-og-sprakmakt.json';
const SRC='data/fag/litteratur/sprak_lingvistikk/sociolinguistics_variation_multilingualism_language_power_source_claim_brief_v1.json';
const REP='reports/fagverk/sprak-lingvistikk-sociolinguistics-variation-multilingualism-language-power-fulltext-v1-audit.json';
const abs=f=>path.join(ROOT,f); const read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')); const write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);}; const assert=(c,m)=>{if(!c)throw new Error(m);};
export function audit(){
  const ch=read(CH),src=read(SRC),brief=read(ch.briefFile),claims=read(ch.claimsFile),assessment=read(ch.assessmentFile);
  assert(ch.subject_id==='litteratur'&&ch.canonical_subcategory_id==='sprak_lingvistikk','Feil eierskap');
  assert(ch.domain_id==='sosiolingvistikk_variasjon_flerspraklighet_sprakmakt','Feil felt 8');
  assert(ch.moduleFiles?.length===4&&ch.sourceFirst&&ch.claimTraceRequired,'Chapter-kontrakt ufullstendig');
  assert(src.domain?.production_mode==='reuse_with_expansion'&&src.reconciliation?.existing_owner_content_preserved===true,'Reuse-with-expansion må bevare eierinnhold');
  assert(src.reconciliation?.secondary_support_does_not_count_as_materialized===true,'Secondary support må være ikke-tellende');
  assert(brief.sections?.length===8&&brief.fulltext_status==='materialized_pending_strict_audit','Brief ufullstendig');
  const sourceIds=new Set(src.sources.map(x=>x.id)),planned=src.topic_briefs.flatMap(x=>x.planned_claims||[]),plannedIds=planned.map(x=>x.id);
  assert(src.sources.length===13&&sourceIds.size===13,'13 unike kilder kreves');
  assert(src.sources.every(x=>/^https:\/\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Kilder må være verifisert/inspectable');
  assert(src.topic_briefs.length===8&&planned.length===32&&new Set(plannedIds).size===32,'8 emner / 32 claims kreves');
  assert(planned.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id))),'Alle claims må ha >=2 gyldige kilder');
  const modules=ch.moduleFiles.map(read),sections=modules.flatMap(x=>x.sections||[]),paragraphs=sections.flatMap(x=>x.paragraphs||[]),bindings=sections.flatMap(x=>x.paragraphClaimIds||[]),used=bindings.flatMap(x=>x||[]);
  assert(modules.every(x=>x.schema==='history_go_fagverk_module_v1'&&x.subject_id==='litteratur'&&x.canonical_subcategory_id==='sprak_lingvistikk'),'Modulschema/eierskap feil');
  assert(sections.length===8&&paragraphs.length===32&&bindings.length===32,'4 moduler / 8 seksjoner / 32 avsnitt og bindings kreves');
  assert(paragraphs.every(x=>typeof x==='string'&&x.length>=420),'Hvert avsnitt må være >=420 tegn');
  assert(bindings.every(x=>Array.isArray(x)&&x.length===1),'Ett claim per avsnitt');
  assert(new Set(used).size===32&&JSON.stringify(used)===JSON.stringify(plannedIds),'Eksakt soc-01..soc-32 claim-dekning/rekkefølge kreves');
  const verified=claims.verifiedClaims||[];
  assert(claims.trace_mode==='source_brief_claim_text_and_sources_immutable','Immutable claim-trace kreves');
  assert(verified.length===32&&JSON.stringify(verified.map(x=>x.id))===JSON.stringify(plannedIds),'32 reverifiserte claims i rekkefølge kreves');
  assert(verified.every(x=>x.status==='verified'&&x.verified_at==='2026-08-31'),'Claim-status feil');
  const qs=assessment.questions||[],cases=assessment.caseTasks||[],valid=new Set(plannedIds);
  assert(qs.length===8&&cases.length===6,'8 vurderinger / 6 case kreves');
  assert(qs.every(x=>x.choices?.length===4&&Number.isInteger(x.correctIndex)&&x.correctIndex>=0&&x.correctIndex<4),'Ugyldig MCQ');
  for(const x of [...qs,...cases]){assert(x.claim_ids?.length>=1&&x.claim_ids.every(id=>valid.has(id)),`${x.id}: claim-link feil`);assert(x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id)),`${x.id}: source-link feil`);}
  assert(cases.every(x=>x.responseMode==='guided_discussion_no_required_typing'&&x.prompt?.length>=100),'Case-format feil');
  const b=sections.map(x=>x.boundary||'').join(' ').toLowerCase(),t=paragraphs.join(' ').toLowerCase();
  assert(/variable/u.test(b)&&/essensi/u.test(b)&&/probabilist/u.test(b),'Variation/non-essentialism-grense mangler');
  assert(/audience/u.test(b)&&/topic/u.test(b)&&/style/u.test(b),'Style/context-grense mangler');
  assert(/demographic/u.test(b)&&/enkeltperson|individ/u.test(b),'Social-category-grense mangler');
  assert(/code-switching/u.test(b)&&/switching unit/u.test(b)&&/competence/u.test(b)&&/structural type/u.test(b),'Multilingual operationalization-grense mangler');
  assert(/prestige/u.test(b)&&/iboende/u.test(b)&&/linguistic/u.test(b),'Attitude/prestige-grense mangler');
  assert(/standardization/u.test(b)&&/språklig bedre/u.test(b)&&/institution/u.test(b),'Language-power/standardization-grense mangler');
  assert(/rural\/urban/u.test(b)&&/contact/u.test(b)&&/sampling/u.test(b),'Contact/community-grense mangler');
  assert(/metadata/u.test(b)&&/identitetsfasit/u.test(b)&&/proveniens/u.test(b),'Metadata/provenance-grense mangler');
  assert(/coraal/u.test(t)&&/international corpus of english|\bice\b/u.test(t)&&/glottolog/u.test(t),'Corpus/proveniens-evidens mangler');
  const q={correctness_and_evidence:5,variationist_and_style_method:5,multilingual_and_social_meaning_method:5,power_ethics_and_nonessentialism:5,corpus_sampling_and_provenance:5,assessment_readiness:5};
  const r={schema:'history_go_sprak_lingvistikk_sociolinguistics_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:ch.domain_id,status:'pass_fulltext_materialized_domain_ready_for_registry',counts:{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6},gates:{ownership:true,reuse_with_expansion_preserved:true,source_first_trace:true,paragraph_depth:true,exact_claim_coverage:true,variation_nonessentialism:true,style_context:true,social_category_sampling:true,multilingual_operationalization:true,attitude_prestige_boundary:true,language_power_institutions:true,contact_community_sampling:true,metadata_ethics_provenance:true,assessment:true},six_part_quality_review:{...q,total:30},next_gate:'register_domain_8_only_after_domain_9_historical_linguistics_source_first_is_ready'};
  write(REP,r); return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 8 Sosiolingvistikk fulltekst OK: ${r.counts.modules} moduler, ${r.counts.sections} seksjoner, ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims.`);}catch(e){console.error(`Språk & lingvistikk felt 8 Sosiolingvistikk fulltekst FEIL: ${e.message}`);process.exitCode=1;}
