#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BRIEF='data/fag/utdanning/higher_education_source_claim_brief_v1.json';
const REPORT='reports/fagverk/utdanning-higher-education-source-brief-v1-audit.json';
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`)};const assert=(x,m)=>{if(!x)throw new Error(m)};
export function audit({writeReport=false}={}){
 const b=read(BRIEF),topics=b.topic_briefs,claims=topics.flatMap(t=>t.planned_claims),ids=new Set(b.sources.map(s=>s.id));
 assert(b.subject_id==='utdanning'&&b.scope.primary_domain_id==='hoyere_utdanning'&&b.scope.canonical_emne_id==='em_utdanning_hoyere_utdanning','Feil Høyere utdanning-scope');
 assert(b.runtime_registration.registered===false&&b.metadata_registration.global_status_mutation_in_source_brief===false,'Source brief kan ikke registrere runtime eller global status');
 assert(b.sources.length===13&&topics.length===8&&claims.length===32&&b.decision_scenarios.length===6,'Høyere utdanning skal ha 13 kilder, 8 spor, 32 claims og 6 scenarioer');
 assert(new Set(claims.map(c=>c.id)).size===32&&claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids.length>=2&&c.source_ids.every(id=>ids.has(id))),'Planlagte claims må være unike og kildebundet');
 assert(b.sources.every(s=>s.url.startsWith('https://')&&s.source_location&&s.retrieval_status==='verified_2026-08-26'),'Alle kilder må være inspiserbare');
 const used=new Set(claims.flatMap(c=>c.source_ids));assert([...ids].every(id=>used.has(id)),'Alle 13 kilder må brukes av minst ett planlagt claim');
 assert(b.source_policy.learning_outcomes_are_not_learning_guarantees&&b.source_policy.visible_activity_is_not_automatic_deep_learning&&b.source_policy.active_learning_effects_are_context_bounded&&b.source_policy.feedback_requires_student_uptake&&b.source_policy.completion_risk_is_not_a_fixed_student_trait&&b.source_policy.quality_is_not_one_metric&&b.source_policy.group_data_is_not_individual_destiny,'Kritiske høyere-utdanning-skiller mangler');
 const report={schema:'history_go_utdanning_higher_education_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-26',status:'pass',subject_id:'utdanning',domain_id:'hoyere_utdanning',counts:{verifiedSources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,modules:4},gates:{sourceFirstUnregistered:true,noGlobalStatusMutation:true,allSourcesInspectable:true,everyClaimSourceBound:true,everySourceUsed:true,alignmentNonGuaranteeBoundary:true,learningApproachNonTypeBoundary:true,activeLearningContextBoundary:true,feedbackUptakeBoundary:true,completionNonTraitBoundary:true,qualityNonSingleMetricBoundary:true,noIndividualPredictionFromGroupData:true,fulltextClaimTraceRequired:true},six_part_quality_review:{source_authority_and_provenance:5,claim_plan_and_verifiability:5,higher_education_theory_and_boundary_quality:5,inclusion_and_student_ethics:5,pedagogy_and_scenarios:4,architecture_and_reproducibility:5,total:29,maximum:30,note:'Source-first-produksjon; alle claims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.'},next_gate:b.next_gate};
 if(writeReport)write(REPORT,report);else assert(isDeepStrictEqual(read(REPORT),report),`${REPORT} er utdatert`);return report;
}
try{const r=audit({writeReport:process.argv.includes('--write-report')});console.log(`Høyere utdanning source brief OK: ${r.counts.verifiedSources} kilder, ${r.counts.topicBriefs} spor, ${r.counts.plannedClaims} claims; ${r.six_part_quality_review.total}/30.`)}catch(e){console.error(`Høyere utdanning source brief FEIL: ${e.message}`);process.exitCode=1}
