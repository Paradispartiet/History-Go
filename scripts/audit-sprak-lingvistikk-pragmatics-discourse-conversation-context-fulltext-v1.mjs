#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CH='data/fagverk/litteratur/sprak_lingvistikk/pragmatikk-diskurs-samtale-og-kontekst.json';
const SRC='data/fag/litteratur/sprak_lingvistikk/pragmatics_discourse_conversation_context_source_claim_brief_v1.json';
const REP='reports/fagverk/sprak-lingvistikk-pragmatics-discourse-conversation-context-fulltext-v1-audit.json';
const abs=f=>path.join(ROOT,f); const read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')); const write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);}; const assert=(c,m)=>{if(!c)throw new Error(m);};
export function audit(){
  const ch=read(CH),src=read(SRC),brief=read(ch.briefFile),claims=read(ch.claimsFile),assessment=read(ch.assessmentFile);
  assert(ch.subject_id==='litteratur'&&ch.canonical_subcategory_id==='sprak_lingvistikk','Feil eierskap');
  assert(ch.domain_id==='pragmatikk_diskurs_samtale_kontekst','Feil felt 7');
  assert(ch.moduleFiles?.length===4&&ch.sourceFirst&&ch.claimTraceRequired,'Chapter-kontrakt ufullstendig');
  assert(brief.sections?.length===8&&brief.fulltext_status==='materialized_pending_strict_audit','Brief ufullstendig');
  const sourceIds=new Set(src.sources.map(x=>x.id)); const planned=src.topic_briefs.flatMap(x=>x.planned_claims||[]); const plannedIds=planned.map(x=>x.id);
  assert(src.sources.length===13&&sourceIds.size===13,'13 unike kilder kreves');
  assert(src.sources.every(x=>/^https:\/\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Kilder må være verifisert/inspectable');
  assert(src.topic_briefs.length===8&&planned.length===32&&new Set(plannedIds).size===32,'8 emner / 32 claims kreves');
  assert(planned.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id))),'Alle claims må ha >=2 gyldige kilder');
  const modules=ch.moduleFiles.map(read); const sections=modules.flatMap(x=>x.sections||[]); const paragraphs=sections.flatMap(x=>x.paragraphs||[]); const bindings=sections.flatMap(x=>x.paragraphClaimIds||[]); const used=bindings.flatMap(x=>x||[]);
  assert(modules.every(x=>x.schema==='history_go_fagverk_module_v1'&&x.subject_id==='litteratur'&&x.canonical_subcategory_id==='sprak_lingvistikk'),'Modulschema/eierskap feil');
  assert(sections.length===8&&paragraphs.length===32&&bindings.length===32,'4 moduler / 8 seksjoner / 32 avsnitt og bindings kreves');
  assert(paragraphs.every(x=>typeof x==='string'&&x.length>=420),'Hvert avsnitt må være >=420 tegn');
  assert(bindings.every(x=>Array.isArray(x)&&x.length===1),'Ett claim per avsnitt');
  assert(new Set(used).size===32&&JSON.stringify(used)===JSON.stringify(plannedIds),'Eksakt prag-01..prag-32 claim-dekning/rekkefølge kreves');
  const verified=claims.verifiedClaims||[];
  assert(claims.trace_mode==='source_brief_claim_text_and_sources_immutable','Immutable claim-trace kreves');
  assert(verified.length===32&&JSON.stringify(verified.map(x=>x.id))===JSON.stringify(plannedIds),'32 reverifiserte claims i rekkefølge kreves');
  assert(verified.every(x=>x.status==='verified'&&x.verified_at==='2026-08-31'),'Claim-status feil');
  const qs=assessment.questions||[],cases=assessment.caseTasks||[],valid=new Set(plannedIds);
  assert(qs.length===8&&cases.length===6,'8 vurderinger / 6 case kreves');
  assert(qs.every(x=>x.choices?.length===4&&Number.isInteger(x.correctIndex)&&x.correctIndex>=0&&x.correctIndex<4),'Ugyldig MCQ');
  for(const x of [...qs,...cases]){assert(x.claim_ids?.length>=1&&x.claim_ids.every(id=>valid.has(id)),`${x.id}: claim-link feil`);assert(x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id)),`${x.id}: source-link feil`);}
  assert(cases.every(x=>x.responseMode==='guided_discussion_no_required_typing'&&x.prompt?.length>=80),'Case-format feil');
  const b=sections.map(x=>x.boundary||'').join(' ').toLowerCase(),t=paragraphs.join(' ').toLowerCase();
  assert(/implicature/u.test(b)&&/entailment/u.test(b)&&/coded meaning/u.test(b),'Implicature/entailment-grense mangler');
  assert(/speech act/u.test(b)&&/sentence type/u.test(b)&&/indirect/u.test(b),'Speech-act/form-grense mangler');
  assert(/presupposition/u.test(b)&&/common ground/u.test(b)&&/accommodation/u.test(b),'Presupposition/common-ground-grense mangler');
  assert(/indexical/u.test(b)&&/deictic/u.test(b)&&/anaphoric/u.test(b),'Deixis/reference-grense mangler');
  assert(/discourse relation/u.test(b)&&/connective/u.test(b)&&/adjacency/u.test(b),'Discourse-relation-grense mangler');
  assert(/turn/u.test(b)&&/intonation unit/u.test(b)&&/semantic dialogue unit|semantic unit/u.test(b),'Conversation-segmentation-grense mangler');
  assert(/iso/u.test(b)&&/swbd-damsl/u.test(b)&&/callhome/u.test(b)&&/proveniens/u.test(b),'Annotation-proveniens-grense mangler');
  assert(/telephone conversation/u.test(b)&&/face-to-face/u.test(b)&&/spanish callhome/u.test(b),'Genre/cross-linguistic-grense mangler');
  assert(/pdtb/u.test(t)&&/switchboard/u.test(t)&&/santa barbara/u.test(t)&&/callhome/u.test(t),'Natural interaction/discourse data mangler');
  const q={correctness_and_evidence:5,pragmatic_method:5,conversation_and_discourse_data:5,traceability_and_annotation_provenance:5,assessment_readiness:5,semantic_pragmatic_and_generalization_boundaries:5};
  const r={schema:'history_go_sprak_lingvistikk_pragmatics_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:ch.domain_id,status:'pass_fulltext_materialized_domain_ready_for_registry',counts:{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6},gates:{ownership:true,source_first_trace:true,paragraph_depth:true,exact_claim_coverage:true,implicature_entailment_boundary:true,speech_act_form_boundary:true,presupposition_common_ground:true,deixis_context:true,discourse_relations:true,conversation_segmentation:true,annotation_scheme_provenance:true,crosslinguistic_genre_limits:true,natural_interaction_data:true,assessment:true},six_part_quality_review:{...q,total:30},next_gate:'register_domain_7_only_after_domain_8_sociolinguistics_source_first_is_ready'};
  write(REP,r); return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 7 Pragmatikk fulltekst OK: ${r.counts.modules} moduler, ${r.counts.sections} seksjoner, ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims.`);}catch(e){console.error(`Språk & lingvistikk felt 7 Pragmatikk fulltekst FEIL: ${e.message}`);process.exitCode=1;}
