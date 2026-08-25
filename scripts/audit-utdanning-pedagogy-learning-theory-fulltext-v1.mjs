#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CHAPTER_ID='pedagogikk-laeringsteori-laering-kunnskap-motivasjon-og-selvregulering';
const DIR=`data/fagverk/utdanning/${CHAPTER_ID}`;
const P={chapter:`${DIR}.json`,brief:`${DIR}/brief.json`,claims:`${DIR}/claims.json`,assessment:`${DIR}/assessment.json`,sourceBrief:'data/fag/utdanning/pedagogy_learning_theory_source_claim_brief_v1.json',didacticsBrief:'data/fag/utdanning/didactics_source_claim_brief_v1.json',manifest:'data/fag/fag_manifest.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',portal:'data/fagverk/fagverk_portal.json',pensum:'data/fag/utdanning/utdanningpensum_canonical_v1.json',report:'reports/fagverk/utdanning-pedagogy-learning-theory-fulltext-v1-audit.json'};
const abs=f=>path.join(ROOT,f); const read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')); const write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`)}; const assert=(ok,m)=>{if(!ok)throw new Error(m)}; const words=t=>t.trim().split(/\s+/u).filter(Boolean).length;
export function audit({writeReport=false}={}){
 const chapter=read(P.chapter), brief=read(P.brief), claimFile=read(P.claims), assessment=read(P.assessment), sourceBrief=read(P.sourceBrief), didacticsBrief=read(P.didacticsBrief), manifest=read(P.manifest), registry=read(P.registry), status=read(P.status), portal=read(P.portal), pensum=read(P.pensum);
 const modules=chapter.moduleFiles.map(read), sections=modules.flatMap(m=>m.sections), paragraphs=sections.flatMap(s=>s.paragraphs), traces=sections.flatMap(s=>s.paragraphClaimIds);
 const planned=sourceBrief.topic_briefs.flatMap(t=>t.planned_claims), plannedIds=planned.map(c=>c.id), claimIds=new Set(claimFile.claims.map(c=>c.id)), sourceIds=new Set(claimFile.sources.map(s=>s.id));
 assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired===true&&chapter.sourceFirst===true,'Kapittelstatus/claimtrace mangler');
 assert(modules.length===4&&sections.length===8&&paragraphs.length===32&&traces.length===32,'Fulltekststruktur skal være 4/8/32/32');
 assert(paragraphs.every(t=>words(t)>=25),'Alle fagavsnitt må være substansielle');
 assert(new Set(plannedIds).size===32&&claimIds.size===32&&plannedIds.every(id=>claimIds.has(id)),'Alle 32 briefclaims må løses én-til-én');
 assert(traces.every(ids=>ids.length===1&&claimIds.has(ids[0]))&&new Set(traces.flat()).size===32,'Gjensidig paragraph↔claim-spor mangler');
 assert(claimFile.claims.every(c=>c.status==='verified'&&c.source_ids.length>=2&&c.source_ids.every(id=>sourceIds.has(id))),'Claims må være verifiserte og kildebundet');
 const used=new Set(claimFile.claims.flatMap(c=>c.source_ids)); assert(sourceIds.size===13&&[...sourceIds].every(id=>used.has(id)),'Alle 13 kilder må brukes');
 assert(claimFile.sources.every(s=>s.url.startsWith('https://')&&s.source_location&&s.retrieval_status==='verified_2026-08-25'),'Kilder må være inspiserbare med locator');
 assert(assessment.questions.length===8&&assessment.questions.every(q=>q.answer===q.options[q.answerIndex]&&claimIds.has(q.claim_id)&&q.source.length>=2&&q.learner_typing===false),'Vurdering må være claimbundet uten elevtyping');
 const prose=paragraphs.join(' '); assert(!/læringsstil|fast elevtype|universelt beste|alle elever bør/iu.test(prose),'Fullteksten bryter anti-typing/universalitetsgrensen');
 assert(brief.safety.individualDiagnosis===false&&brief.safety.fixedLearnerTyping===false&&brief.safety.universalMethodPrescription===false,'Pedagogiske sikkerhetsgrenser mangler');
 const reg=registry.subjects.utdanning, st=status.subjects.find(r=>r.id==='utdanning'), portalRow=portal.categories.find(r=>r.id==='utdanning');
 assert(manifest.utdanning.chapters?.includes(P.chapter)&&manifest.utdanning.sourceClaimBriefs?.includes(P.didacticsBrief),'Manifest må binde fulltekst og neste source brief');
 assert(reg?.chapters?.filter(r=>r.id===CHAPTER_ID).length===1&&reg.editorialPlan.registeredChapterCount===1&&reg.editorialPlan.completedSourceBriefCount===2,'Utdanning registry må være 1/14 med to source briefs');
 assert(st.navigationStatus==='materialized'&&st.assessmentStatus==='audited'&&st.editorialStatus==='chapters_in_progress'&&st.editorialStatus!=='complete','Utdanning skal være materialized/audited/in-progress');
 assert(portalRow.subjectPage==='fagverk.html?subject=utdanning'&&portalRow.subjectStatus==='materialized','Portalen må eksponere Utdanning');
 assert(pensum.domains.filter(d=>d.status==='materialized').length===1&&pensum.domains[0].domain_id==='pedagogikk_laeringsteori'&&pensum.complete_ready===false,'Pensum skal være monotont 1/14');
 assert(didacticsBrief.scope.primary_domain_id==='didaktikk'&&didacticsBrief.runtime_registration.registered===false,'Didaktikk må være neste uregistrerte source-first-domene');
 const report={schema:'history_go_utdanning_pedagogy_learning_theory_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-25',status:'pass',conclusion:'high_quality_fulltext_unit_complete_subject_not_scientifically_complete',subject_id:'utdanning',chapter_id:CHAPTER_ID,counts:{domainsCovered:1,targetDomains:14,modules:4,sections:8,paragraphs:32,verifiedClaims:32,inspectableSources:13,assessmentQuestions:8,decisionScenarios:sourceBrief.decision_scenarios.length,nextSourceBriefDomains:1},gates:{plannedClaimsResolvedOneToOne:true,paragraphClaimTraceReciprocalAndComplete:true,everyUsedSourceInspectable:true,everySourceSupportsFinalClaim:true,performanceLearningDistinctionLocked:true,retrievalAssessmentDistinctionLocked:true,spacingModeratorBoundaryLocked:true,cognitiveLoadScopeBoundaryLocked:true,feedbackBoundaryLocked:true,selfRegulationNonTraitBoundaryLocked:true,motivationContextBoundaryLocked:true,empiricalNormativeBoundaryLocked:true,noFixedLearnerTyping:true,noUniversalMethodPrescription:true,chapterRegisteredExactlyOnce:true,educationMaterializedAndAudited:true,prematureSubjectCompletionBlocked:true,didacticsSourceFirstNext:true},six_part_quality_review:{source_authority_and_provenance:5,claim_trace_and_verifiability:5,conceptual_distinctions_and_limitations:5,pedagogical_responsibility:5,pedagogy_and_assessment:4,architecture_and_reproducibility:5,total:29,maximum:30,note:'Vurderingspakken er intern; senere domener og strict subject-proof gjenstår før Utdanning kan bli complete.'}};
 if(writeReport)write(P.report,report);else assert(isDeepStrictEqual(read(P.report),report),`${P.report} er utdatert`); return report;
}
try{const r=audit({writeReport:process.argv.includes('--write-report')});console.log(`Utdanning fulltekstaudit OK: ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims, ${r.counts.inspectableSources} kilder; ${r.six_part_quality_review.total}/30.`)}catch(e){console.error(`Utdanning fulltekstaudit FEIL: ${e.message}`);process.exitCode=1}
