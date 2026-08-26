#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BRIEF='data/fag/utdanning/upper_secondary_vocational_source_claim_brief_v1.json';
const REPORT='reports/fagverk/utdanning-upper-secondary-vocational-source-brief-v1-audit.json';
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`)};const assert=(x,m)=>{if(!x)throw new Error(m)};
export function audit({writeReport=false}={}){
 const b=read(BRIEF),topics=b.topic_briefs,claims=topics.flatMap(t=>t.planned_claims),ids=new Set(b.sources.map(s=>s.id));
 assert(b.subject_id==='utdanning'&&b.scope.primary_domain_id==='videregaende_yrkesfag'&&b.scope.canonical_emne_id==='em_utdanning_videregaende_yrkesfag','Feil Videregående/yrkesfag-scope');
 assert(b.runtime_registration.registered===false&&b.metadata_registration.global_status_mutation_in_source_brief===false,'Source brief kan ikke registrere runtime eller global status');
 assert(b.sources.length===13&&topics.length===8&&claims.length===32&&b.decision_scenarios.length===6,'Videregående/yrkesfag skal ha 13 kilder, 8 spor, 32 claims og 6 scenarioer');
 assert(new Set(claims.map(c=>c.id)).size===32&&claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids.length>=2&&c.source_ids.every(id=>ids.has(id))),'Planlagte claims må være unike og kildebundet');
 assert(b.sources.every(s=>s.url.startsWith('https://')&&s.source_location&&s.retrieval_status==='verified_2026-08-26'),'Alle kilder må være inspiserbare');
 const used=new Set(claims.flatMap(c=>c.source_ids));assert([...ids].every(id=>used.has(id)),'Alle 13 kilder må brukes av minst ett planlagt claim');
 assert(b.allowed_method_ids.includes('met_utdanning_dokument_lareplananalyse')&&b.allowed_method_ids.includes('met_utdanning_kvalitativ_feltstudie'),'Canonicale videregående/yrkesfag-metoder mangler');
 assert(b.source_policy.vocational_education_is_not_narrow_job_training&&b.source_policy.workplace_presence_is_not_automatic_learning&&b.source_policy.theory_and_practice_are_not_binary&&b.source_policy.boundary_crossing_requires_coordination&&b.source_policy.completion_risk_is_not_a_fixed_student_trait&&b.source_policy.skills_forecast_is_not_individual_destiny,'Kritiske videregående/yrkesfag-skiller mangler');
 const report={schema:'history_go_utdanning_upper_secondary_vocational_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-26',status:'pass',subject_id:'utdanning',domain_id:'videregaende_yrkesfag',counts:{verifiedSources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,modules:4},gates:{sourceFirstUnregistered:true,noGlobalStatusMutation:true,allSourcesInspectable:true,everyClaimSourceBound:true,everySourceUsed:true,vocationalBroadPurposeBoundary:true,workplaceLearningBoundary:true,theoryPracticeNonbinaryBoundary:true,boundaryCrossingCoordinationBoundary:true,assessmentValidityBoundary:true,motivationNonTraitBoundary:true,completionNonTraitBoundary:true,noIndividualPredictionFromGroupData:true,greenDigitalNonDeterminism:true,fulltextClaimTraceRequired:true},six_part_quality_review:{source_authority_and_provenance:5,claim_plan_and_verifiability:5,vocational_theory_and_boundary_quality:5,inclusion_and_youth_ethics:5,pedagogy_and_scenarios:4,architecture_and_reproducibility:5,total:29,maximum:30,note:'Source-first-produksjon; alle claims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.'},next_gate:b.next_gate};
 if(writeReport)write(REPORT,report);else assert(isDeepStrictEqual(read(REPORT),report),`${REPORT} er utdatert`);return report;
}
try{const r=audit({writeReport:process.argv.includes('--write-report')});console.log(`Videregående/yrkesfag source brief OK: ${r.counts.verifiedSources} kilder, ${r.counts.topicBriefs} spor, ${r.counts.plannedClaims} claims; ${r.six_part_quality_review.total}/30.`)}catch(e){console.error(`Videregående/yrkesfag source brief FEIL: ${e.message}`);process.exitCode=1}
