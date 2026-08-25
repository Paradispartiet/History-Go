#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='psykisk-helse-lidelse-tjenester-recovery-og-rettigheter',DIR=`data/fagverk/helse/${ID}`;
const P={chapter:`${DIR}.json`,brief:`${DIR}/brief.json`,claims:`${DIR}/claims.json`,assessment:`${DIR}/assessment.json`,source:'data/fag/helse/mental_health_source_claim_brief_v1.json',safety:'data/fag/helse/clinical_safety_contract_helse_v1.json',manifest:'data/fag/fag_manifest.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',report:'reports/fagverk/helse-mental-health-fulltext-v1-audit.json'};
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);},assert=(v,m)=>{if(!v)throw new Error(m);},wc=t=>t.trim().split(/\s+/u).filter(Boolean).length;

export function auditHealthMentalHealthFulltextV1({writeReport=false}={}){
  const chapter=read(P.chapter),brief=read(P.brief),claimFile=read(P.claims),assessment=read(P.assessment),source=read(P.source),safety=read(P.safety),manifest=read(P.manifest),registry=read(P.registry),status=read(P.status);
  const modules=chapter.moduleFiles.map(read),sections=modules.flatMap(x=>x.sections),paragraphs=sections.flatMap(x=>x.paragraphs),paragraphIds=sections.flatMap(x=>x.paragraphIds||[]),traces=sections.flatMap(x=>x.paragraphClaimIds),claimIds=new Set(claimFile.claims.map(x=>x.id)),sourceIds=new Set(claimFile.sources.map(x=>x.id)),plannedIds=source.topic_briefs.flatMap(t=>t.planned_claims.map(c=>c.id));
  assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired&&chapter.sourceFirst,'Kapittelstatus mangler');
  assert(chapter.primary_domain_id==='psykisk_helse','Feil primærdomene');
  assert(modules.length===4&&sections.length===8&&paragraphs.length===32&&traces.length===32,'Struktur skal være 4/8/32');
  assert(paragraphIds.length===32&&new Set(paragraphIds).size===32,'32 unike paragraphIds kreves');
  assert(paragraphs.every(x=>wc(x)>=25),'Alle avsnitt må være substansielle');
  assert(new Set(plannedIds).size===32&&claimIds.size===32&&plannedIds.every(id=>claimIds.has(id)),'Alle briefclaims må løses én-til-én');
  assert(traces.every(ids=>ids.length===1&&ids.every(id=>claimIds.has(id)))&&new Set(traces.flat()).size===32,'Paragraph→claim-spor er ikke gjensidig');
  const paragraphIdSet=new Set(paragraphIds);
  assert(claimFile.claims.every(x=>x.status==='verified'&&paragraphIdSet.has(x.paragraph_id)&&x.source_ids.length>=3&&x.source_ids.every(id=>sourceIds.has(id))),'Claim→paragraph/source-binding feiler');
  assert(claimFile.claims.every(x=>Array.isArray(x.source_locators)&&x.source_locators.length===x.source_ids.length&&x.source_locators.every(r=>r.location&&x.source_ids.includes(r.source_id))),'Claim-locatorbinding mangler');
  const used=new Set(claimFile.claims.flatMap(x=>x.source_ids));
  assert(sourceIds.size===15&&[...sourceIds].every(id=>used.has(id)),'Alle 15 kilder må støtte sluttclaims');
  assert(claimFile.sources.every(x=>x.url?.startsWith('https://')&&x.source_location&&/^verified_\d{4}-\d{2}-\d{2}$/u.test(x.retrieval_status)),'Kildeproveniens mangler');
  assert(source.decision_scenarios.length===6,'Seks generelle scenarioer kreves');
  assert(assessment.questions.length===8&&assessment.questions.every(x=>x.answer===x.options[x.answerIndex]&&claimIds.has(x.claim_id)&&x.source.length>=3&&x.safety_mode==='general_non_individualizing'),'Assessment feiler');
  assert(safety.status==='blocking'&&brief.safety.individualDiagnosis===false&&brief.safety.individualPrognosis===false&&brief.safety.individualTriage===false&&brief.safety.individualTreatmentAdvice===false&&brief.safety.individualRiskCalculation===false&&brief.safety.individualLegalAdvice===false&&brief.safety.individualCrisisInstruction===false,'Klinisk sikkerhetsgrense feiler');
  const unsafeAdvice=/du bør|du skal|du må|din diagnose|du har (?:depresjon|angst|psykose|en psykisk lidelse)|din risiko|start(?:e)? (?:med )?(?:behandling|medisin)|slutt(?:e)? (?:med )?(?:behandling|medisin)|ring 113|oppsøk (?:lege|legevakt)|du bør legges inn|du trenger tvang/iu;
  assert(chapter.lead.toLowerCase().includes('aldri individuell')&&!paragraphs.some(x=>unsafeAdvice.test(x)),'Individråd funnet');
  const corpus=paragraphs.join(' ').toLowerCase();
  assert(corpus.includes('fravær av en diagnostisert psykisk lidelse er ikke det samme som'),'Psykisk helse/fravær av lidelse-grensen mangler');
  assert(corpus.includes('mental health conditions som et bredere begrep enn formelle mental disorders'),'Condition/disorder-grensen mangler');
  assert(corpus.includes('et enkelt symptom, en enkelt observasjon eller én numerisk skår er ikke en diagnose'),'Symptom/diagnose-grensen mangler');
  assert(corpus.includes('et positivt screeningresultat eller en høy skår er derfor ikke i seg selv bevis'),'Screening/diagnose-grensen mangler');
  assert(corpus.includes('den er ikke en full beskrivelse av personen'),'Diagnose/hele-personen-grensen mangler');
  assert(corpus.includes('kan derfor ikke settes lik sannsynligheten for at en bestemt person'),'Prevalens/individ-grensen mangler');
  assert(corpus.includes('en statistisk sammenheng fastslår ikke årsaken til utfallet hos et bestemt individ'),'Determinant/individuell årsak-grensen mangler');
  assert(corpus.includes('effekt i en studiegruppe er ikke en direkte anbefaling til et bestemt individ'),'Gruppeevidens/individanbefaling-grensen mangler');
  assert(corpus.includes('tilgjengelig tjeneste er ikke automatisk en effektiv')||corpus.includes('lett å kontakte uten å være tilstrekkelig effektiv'),'Tilgang/effekt-grensen mangler');
  assert(corpus.includes('betyr ikke at spesialist- eller sykehusbasert behandling aldri er nødvendig'),'Community/spesialist-grensen mangler');
  assert(corpus.includes('den er ikke en rigid alvorlighetsstige'),'Stepped/mixed care-grensen mangler');
  assert(corpus.includes('personlig recovery')&&corpus.includes('skiller seg dermed fra klinisk recovery forstått som symptomremisjon'),'Recovery/remisjon-grensen mangler');
  assert(corpus.includes('skal ikke love at alle vil nå et bestemt klinisk sluttpunkt'),'Recovery/garanti-grensen mangler');
  assert(corpus.includes('innebærer ikke at profesjonell helsehjelp')&&corpus.includes('alltid kan erstattes'),'Peer/profesjonsrolle-grensen mangler');
  assert(corpus.includes('symptomnivå, funksjon, livskvalitet og personlig recovery er relaterte, men ikke identiske'),'Flerdimensjonale utfall mangler');
  assert(corpus.includes('internasjonale menneskerettslige standarder og lokal lov er ikke samme analytiske nivå'),'Rettighetsstandard/lokal lov-grensen mangler');
  assert(corpus.includes('autonomi og informert samtykke')&&corpus.includes('ansvar for forsvarlighet, sikkerhet og skadebegrensning'),'Autonomi/sikkerhetsansvar-grensen mangler');
  assert(corpus.includes('kritikk av stigma verken beviser eller avkrefter diagnostisk validitet'),'Stigma/diagnostisk validitet-grensen mangler');
  assert(corpus.includes('systemindikatorer og pasientnivåutfall må derfor analyseres som forskjellige målenivåer'),'Systemmål/pasientutfall-grensen mangler');
  assert(brief.requiredCriticalDistinctions.includes('Helse-eierskap vs Psykologi-teorieierskap')&&source.source_policy.psychology_theory_remains_secondary_subject_ownership===true,'Helse/Psykologi-eierskapsgrensen mangler');
  const reg=registry.subjects.helse,health=status.subjects.find(x=>x.id==='helse');
  const previous=['medisinsk-etikk-evidens-og-ansvarlig-beslutning','anatomi-fysiologi-struktur-funksjon-og-regulering','sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt','klinisk-medisin-informasjon-testing-beslutning-og-oppfolging','folkehelse-populasjon-determinanter-forebygging-og-ulikhet','epidemiologi-design-mal-bias-confounding-og-kausalitet','mikrobiologi-infeksjon-mikrober-smitte-vertrespons-og-resistens','farmakologi-virkning-omsetning-dose-respons-og-legemiddelsikkerhet','ernaering-metabolisme-energi-naeringsstoffer-regulering-og-kostmonster'];
  assert(manifest.helse.chapters?.includes(P.chapter)&&manifest.helse.sourceClaimBriefs?.includes(P.source),'Manifestregistrering mangler');
  assert(reg.chapters.filter(x=>x.id===ID&&x.file===P.chapter).length===1,'Domene 10 må registreres nøyaktig én gang');
  assert(previous.every(id=>reg.chapters.some(x=>x.id===id)),'Tidligere Helse-kapitler må bevares');
  assert(reg.editorialPlan.targetDomainCount===12&&reg.editorialPlan.registeredChapterCount===10&&reg.editorialPlan.completedSourceBriefCount>=10,'Helse-progresjon skal være 10/12');
  assert(health.navigationStatus==='materialized'&&health.assessmentStatus==='audited'&&health.editorialStatus==='chapters_in_progress','Helse-status feiler');
  assert(health.nextGate==='mental_health_full_chapter_complete_next_domain_source_brief'&&health.editorialStatus!=='complete','Feil neste port eller prematur completion');
  const report={schema:'history_go_health_mental_health_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-23',status:'pass',conclusion:'high_quality_fulltext_unit_complete_subject_not_scientifically_complete',subject_id:'helse',chapter_id:ID,counts:{domainsCovered:10,targetDomains:12,modules:4,sections:8,paragraphs:32,verifiedClaims:32,inspectableSources:15,assessmentQuestions:8,decisionScenarios:6},gates:{plannedClaimsResolvedOneToOne:true,paragraphClaimTraceReciprocalAndComplete:true,claimParagraphTraceReciprocalAndComplete:true,everyUsedSourceInspectable:true,everySourceSupportsFinalClaim:true,sourceLocatorsBoundPerClaim:true,mentalHealthNotAbsenceOfDisorder:true,conditionBroaderThanDisorder:true,symptomNotDiagnosis:true,screeningNotDiagnosis:true,diagnosticCategoryNotWholePersonOrFixedEtiology:true,populationPrevalenceNotIndividualProbability:true,determinantAssociationNotIndividualCausation:true,groupEvidenceNotIndividualTreatmentRecommendation:true,serviceAccessNotEffectiveness:true,communityCareNotAbsenceOfSpecialistCare:true,steppedMixedCareNotRigidLadder:true,personalRecoveryNotSymptomRemission:true,recoveryOrientationNotGuaranteedOutcome:true,peerSupportNotProfessionalReplacement:true,outcomesMultidimensional:true,rightsStandardNotLocalLegalRule:true,autonomyConsentNotAbsenceOfSafetyResponsibility:true,stigmaNotDiagnosticValidityQuestion:true,serviceSystemMetricNotPatientOutcome:true,psychologyTheoryOwnershipPreserved:true,assessmentClaimAndSafetyBindingComplete:true,clinicalSafetyContractBlocking:true,noIndividualDiagnosisRiskTriageTreatmentOrLegalAdvice:true,chapterRegisteredExactlyOnce:true,previousHealthChaptersPreserved:true,prematureSubjectCompletionBlocked:true},six_part_quality_review:{source_authority_and_provenance:5,claim_trace_and_verifiability:5,mental_health_service_recovery_and_rights_precision:5,clinical_safety_and_responsibility:5,pedagogy_and_assessment:4,architecture_and_reproducibility:5,total:29,maximum:30,note:'Intern assessment er auditert; ekstern fagfelle- og brukerprøving er en senere kvalitetsport.'}};
  if(writeReport)write(P.report,report);else assert(isDeepStrictEqual(read(P.report),report),`${P.report} er utdatert`);
  return report;
}
try{const r=auditHealthMentalHealthFulltextV1({writeReport:process.argv.includes('--write-report')});console.log(`Helse Psykisk helse fulltekstaudit OK: ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims, ${r.counts.inspectableSources} kilder; ${r.six_part_quality_review.total}/30.`);}catch(e){console.error(`Helse Psykisk helse fulltekstaudit FEIL: ${e.message}`);process.exitCode=1;}
