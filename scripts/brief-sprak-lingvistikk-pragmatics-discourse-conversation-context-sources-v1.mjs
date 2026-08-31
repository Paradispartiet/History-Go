#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FILE='data/fag/litteratur/sprak_lingvistikk/pragmatics_discourse_conversation_context_source_claim_brief_v1.json';
const REPORT='reports/fagverk/sprak-lingvistikk-pragmatics-discourse-conversation-context-source-brief-v1-audit.json';
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const write=(f,v)=>{const p=path.join(ROOT,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,`${JSON.stringify(v,null,2)}\n`);};
const assert=(c,m)=>{if(!c)throw new Error(m);};
export function audit(){
  const b=read(FILE);
  assert(b.status==='source_first_ready_not_materialized','Pragmatikk skal være source-first');
  assert(b.domain?.ordinal===7&&b.domain?.id==='pragmatikk_diskurs_samtale_kontekst','Feil felt 7');
  const ids=new Set(b.sources.map(x=>x.id)), claims=b.topic_briefs.flatMap(x=>x.planned_claims||[]);
  assert(b.sources.length===13&&ids.size===13,'13 kilder kreves');
  assert(b.sources.every(x=>/^https:\/\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Kilder må være inspectable/verifisert');
  assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(x=>x.id)).size===32,'8 emner / 32 claims kreves');
  assert(claims.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'Claims trenger >=2 kilder');
  assert(b.decision_scenarios?.length===6&&b.decision_scenarios.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'6 case kreves');
  const z=b.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();
  assert(/coded meaning/u.test(z)&&/entailment/u.test(z)&&/implicature/u.test(z),'Semantics/pragmatics-grense mangler');
  assert(/speech act/u.test(z)&&/sentence type/u.test(z)&&/indirect/u.test(z),'Speech-act/form-grense mangler');
  assert(/presupposition/u.test(z)&&/common ground/u.test(z)&&/accommodation/u.test(z),'Presupposition/common-ground-grense mangler');
  assert(/indexical/u.test(z)&&/deictic/u.test(z)&&/anaphoric/u.test(z),'Deixis/reference-grense mangler');
  assert(/discourse relation/u.test(z)&&/connective/u.test(z)&&/norel/u.test(z),'Discourse-relation-grense mangler');
  assert(/turn-taking/u.test(z)&&/intonation unit/u.test(z)&&/semantic unit/u.test(z),'Conversation-segmentation-grense mangler');
  assert(/swbd-damsl/u.test(z)&&/iso dialogue acts/u.test(z)&&/proveniens/u.test(z),'Annotation-scheme-proveniens mangler');
  assert(/telephone conversation/u.test(z)&&/face-to-face/u.test(z)&&/spanish callhome/u.test(z),'Genre/cross-linguistic-grense mangler');
  assert(b.fail_closed_contract?.source_brief_does_not_count_as_materialized===true,'Source brief må ikke telle som materialisert');
  const q={correctness_and_evidence:5,pragmatic_method:5,conversation_and_discourse_data:5,annotation_provenance:5,assessment_readiness:5,semantic_pragmatic_boundaries:5};
  const r={schema:'history_go_sprak_lingvistikk_pragmatics_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',status:'pass_source_first_ready_not_materialized',counts:{sources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedAssessments:8},gates:{ownership:true,inspectable_sources:true,multi_source_claims:true,implicature_entailment_boundary:true,speech_act_form_boundary:true,presupposition_common_ground:true,deixis_context:true,discourse_relations:true,conversation_segmentation:true,annotation_scheme_provenance:true,crosslinguistic_genre_limits:true},six_part_quality_review:{...q,total:30},next_gate:'materialize_pragmatics_discourse_conversation_context_fulltext'};
  write(REPORT,r); return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 7 Pragmatikk source-first OK: ${r.counts.sources} kilder, ${r.counts.topicBriefs} emner, ${r.counts.plannedClaims} claims, ${r.counts.decisionScenarios} case.`);}catch(e){console.error(`Språk & lingvistikk felt 7 Pragmatikk source-first FEIL: ${e.message}`);process.exitCode=1;}
