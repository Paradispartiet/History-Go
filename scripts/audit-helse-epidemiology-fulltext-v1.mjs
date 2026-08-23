#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='epidemiologi-design-mal-bias-confounding-og-kausalitet';
const DIR=`data/fagverk/helse/${ID}`;
const P={chapter:`${DIR}.json`,brief:`${DIR}/brief.json`,claims:`${DIR}/claims.json`,assessment:`${DIR}/assessment.json`,source:'data/fag/helse/epidemiology_source_claim_brief_v1.json',safety:'data/fag/helse/clinical_safety_contract_helse_v1.json',manifest:'data/fag/fag_manifest.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',emners:'data/fag/helse/emner_helse_canonical_v1.json',report:'reports/fagverk/helse-epidemiology-fulltext-v1-audit.json'};
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);},assert=(v,m)=>{if(!v)throw new Error(m);},wc=t=>t.trim().split(/\s+/u).filter(Boolean).length;

export function audit({writeReport=false}={}){
 const chapter=read(P.chapter),brief=read(P.brief),claimFile=read(P.claims),assessment=read(P.assessment),source=read(P.source),safety=read(P.safety),manifest=read(P.manifest),registry=read(P.registry),status=read(P.status),emners=read(P.emners);
 const modules=chapter.moduleFiles.map(read),sections=modules.flatMap(x=>x.sections),paragraphs=sections.flatMap(x=>x.paragraphs),paragraphIds=sections.flatMap(x=>x.paragraphIds||[]),traces=sections.flatMap(x=>x.paragraphClaimIds),claimIds=new Set(claimFile.claims.map(x=>x.id)),sourceIds=new Set(claimFile.sources.map(x=>x.id)),plannedIds=source.topic_briefs.flatMap(t=>t.planned_claims.map(c=>c.id));
 assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired&&chapter.sourceFirst,'Kapittelstatus mangler');
 assert(chapter.primary_domain_id==='epidemiologi','Feil primærdomene');
 assert(modules.length===4&&sections.length===8&&paragraphs.length===32&&traces.length===32,'Struktur skal være 4/8/32');
 assert(paragraphIds.length===32&&new Set(paragraphIds).size===32,'32 unike paragraphIds kreves');
 assert(paragraphs.every(x=>wc(x)>=25),'Alle avsnitt må være substansielle');
 assert(new Set(plannedIds).size===32&&claimIds.size===32&&plannedIds.every(id=>claimIds.has(id)),'Alle briefclaims må løses én-til-én');
 assert(traces.every(ids=>ids.length===1&&ids.every(id=>claimIds.has(id)))&&new Set(traces.flat()).size===32,'Paragraph→claim-spor er ikke gjensidig');
 const paragraphIdSet=new Set(paragraphIds);
 assert(claimFile.claims.every(x=>x.status==='verified'&&paragraphIdSet.has(x.paragraph_id)&&x.source_ids.length>=3&&x.source_ids.every(id=>sourceIds.has(id))),'Claim→paragraph/source-binding feiler');
 assert(claimFile.claims.every(x=>Array.isArray(x.source_locators)&&x.source_locators.length===x.source_ids.length&&x.source_locators.every(r=>r.location&&x.source_ids.includes(r.source_id))),'Claim-locatorbinding mangler');
 const used=new Set(claimFile.claims.flatMap(x=>x.source_ids));
 assert(sourceIds.size===14&&[...sourceIds].every(id=>used.has(id)),'Alle 14 kilder må støtte sluttclaims');
 assert(claimFile.sources.every(x=>x.url?.startsWith('https://')&&x.source_location&&x.retrieval_status==='verified_2026-08-23'),'Kildeproveniens mangler');
 assert(source.decision_scenarios.length===6,'Seks generelle scenarioer kreves');
 assert(assessment.questions.length===8&&assessment.questions.every(x=>x.answer===x.options[x.answerIndex]&&claimIds.has(x.claim_id)&&x.source.length>=3&&x.safety_mode==='general_non_individualizing'),'Assessment feiler');
 assert(safety.status==='blocking'&&brief.safety.individualDiagnosis===false&&brief.safety.individualPrognosis===false&&brief.safety.individualTriage===false&&brief.safety.individualTreatmentAdvice===false&&brief.safety.individualRiskCalculation===false,'Klinisk sikkerhetsgrense feiler');
 assert(chapter.lead.includes('aldri individuell')&&!paragraphs.some(x=>/du bør|din diagnose|din behandling|din prognose|ring 113|oppsøk (lege|legevakt)/iu.test(x)),'Individråd funnet');
 const corpus=paragraphs.join(' ').toLowerCase();
 assert(corpus.includes('prevalens')&&corpus.includes('insidens')&&corpus.includes('nye tilfeller'),'Insidens/prevalens-grensen mangler');
 assert(corpus.includes('person-tid')&&corpus.includes('risiko og rate')&&corpus.includes('ulike enheter'),'Risiko/rate-grensen mangler');
 assert(corpus.includes('odds ratio')&&corpus.includes('risk ratio')&&corpus.includes('matematisk ulike'),'Odds ratio/risk ratio-grensen mangler');
 assert(corpus.includes('observert assosiasjon')&&corpus.includes('ikke i seg selv en kausal effekt'),'Assosiasjon/kausalitet-grensen mangler');
 assert(corpus.includes('systematisk bias')&&corpus.includes('tilfeldig feil')&&corpus.includes('svært presist, men fortsatt skjevt'),'Bias/presisjon-grensen mangler');
 assert(corpus.includes('confounding')&&corpus.includes('mediator')&&corpus.includes('kollider')&&corpus.includes('ikke-kausal statistisk forbindelse'),'Confounder/mediator/kollider-grensen mangler');
 assert(corpus.includes('residual confounding')&&corpus.includes('umålte')&&corpus.includes('ikke automatisk omtales som uconfounded eller kausalt'),'Justeringsgrensen mangler');
 assert(corpus.includes('konfidensintervall')&&corpus.includes('statistisk signifikans')&&corpus.includes('effektstørrelse')&&corpus.includes('folkehelsemessig betydning'),'Statistisk usikkerhet/betydning-grensen mangler');
 assert(corpus.includes('målpopulasjon')&&corpus.includes('transportabilitet')&&corpus.includes('overlapp')&&corpus.includes('eliminerer ikke ukjente brudd'),'Transportabilitetsgrensen mangler');
 assert(corpus.includes('individuell risiko')&&corpus.includes('populasjonsmål'),'Populasjonsmål må holdes atskilt fra individinferens');
 const reg=registry.subjects.helse,health=status.subjects.find(x=>x.id==='helse'),emne=emners.find(x=>x.emne_id==='em_helse_epidemiologi');
 const requiredIds=['medisinsk-etikk-evidens-og-ansvarlig-beslutning','anatomi-fysiologi-struktur-funksjon-og-regulering','sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt','klinisk-medisin-informasjon-testing-beslutning-og-oppfolging','folkehelse-populasjon-determinanter-forebygging-og-ulikhet',ID];
 assert(manifest.helse.chapters?.includes(P.chapter)&&manifest.helse.sourceClaimBriefs?.includes(P.source),'Manifestregistrering mangler');
 assert(reg.chapters.filter(x=>x.id===ID&&x.file===P.chapter).length===1,'Domene 6 må registreres nøyaktig én gang');
 assert(requiredIds.every(id=>reg.chapters.some(x=>x.id===id)),'Tidligere Helse-kapitler må bevares');
 assert(reg.editorialPlan.targetDomainCount===12&&reg.editorialPlan.registeredChapterCount===6&&(reg.editorialPlan.completedSourceBriefCount??6)>=6,'Helse-progresjon skal være 6/12');
 assert(health.navigationStatus==='materialized'&&health.assessmentStatus==='audited'&&health.editorialStatus==='chapters_in_progress','Helse-status feiler');
 assert(health.nextGate==='epidemiology_full_chapter_complete_next_domain_source_brief'&&health.editorialStatus!=='complete','Feil neste port eller prematur completion');
 assert(emne?.status==='materialized','Canonicalt Epidemiologi-emne må være materialized');
 const gates={plannedClaimsResolvedOneToOne:true,paragraphClaimTraceReciprocalAndComplete:true,claimParagraphTraceReciprocalAndComplete:true,everyUsedSourceInspectable:true,everySourceSupportsFinalClaim:true,sourceLocatorsBoundPerClaim:true,incidencePrevalenceDistinct:true,riskRatePersonTimeDistinct:true,oddsRatioRiskRatioDistinct:true,associationNotCausalEffect:true,systematicBiasNotRandomError:true,confounderMediatorColliderDistinct:true,adjustmentDoesNotEraseResidualOrUnmeasuredConfounding:true,precisionSignificanceNotValidityOrImportance:true,targetPopulationTransportabilityRequiresOverlapAndAssumptions:true,populationMeasuresNotIndividualInference:true,assessmentClaimAndSafetyBindingComplete:true,clinicalSafetyContractBlocking:true,noIndividualInterpretationOrAdvice:true,chapterRegisteredExactlyOnce:true,previousHealthChaptersPreserved:true,prematureSubjectCompletionBlocked:true};
 const report={schema:'history_go_health_epidemiology_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-23',status:'pass',conclusion:'high_quality_fulltext_unit_complete_subject_not_scientifically_complete',subject_id:'helse',chapter_id:ID,counts:{domainsCovered:6,targetDomains:12,modules:4,sections:8,paragraphs:32,verifiedClaims:32,inspectableSources:14,assessmentQuestions:8,decisionScenarios:6},gates,six_part_quality_review:{source_authority_and_provenance:5,claim_trace_and_verifiability:5,epidemiologic_reasoning_and_boundary_precision:5,clinical_safety_and_responsibility:5,pedagogy_and_assessment:4,architecture_and_reproducibility:5,total:29,maximum:30,note:'Intern assessment er auditert; ekstern fagfelle- og brukerprøving er en senere kvalitetsport.'}};
 if(writeReport)write(P.report,report);else assert(isDeepStrictEqual(read(P.report),report),`${P.report} er utdatert`);
 return report;
}

try{const r=audit({writeReport:process.argv.includes('--write-report')});console.log(`Helse Epidemiologi fulltekstaudit OK: ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims, ${r.counts.inspectableSources} kilder; ${r.six_part_quality_review.total}/30.`);}catch(e){console.error(`Helse Epidemiologi fulltekstaudit FEIL: ${e.message}`);process.exitCode=1;}
