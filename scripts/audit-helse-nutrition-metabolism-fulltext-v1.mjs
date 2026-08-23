#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='ernaering-metabolisme-energi-naeringsstoffer-regulering-og-kostmonster',DIR=`data/fagverk/helse/${ID}`;
const P={chapter:`${DIR}.json`,brief:`${DIR}/brief.json`,claims:`${DIR}/claims.json`,assessment:`${DIR}/assessment.json`,source:'data/fag/helse/nutrition_metabolism_source_claim_brief_v1.json',safety:'data/fag/helse/clinical_safety_contract_helse_v1.json',manifest:'data/fag/fag_manifest.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',report:'reports/fagverk/helse-nutrition-metabolism-fulltext-v1-audit.json'};
const abs=(f)=>path.join(ROOT,f),read=(f)=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);},assert=(v,m)=>{if(!v)throw new Error(m);},wc=(t)=>t.trim().split(/\s+/u).filter(Boolean).length;

export function auditHealthNutritionMetabolismFulltextV1({writeReport=false}={}){
  const chapter=read(P.chapter),brief=read(P.brief),claimFile=read(P.claims),assessment=read(P.assessment),source=read(P.source),safety=read(P.safety),manifest=read(P.manifest),registry=read(P.registry),status=read(P.status);
  const modules=chapter.moduleFiles.map(read),sections=modules.flatMap((x)=>x.sections),paragraphs=sections.flatMap((x)=>x.paragraphs),paragraphIds=sections.flatMap((x)=>x.paragraphIds||[]),traces=sections.flatMap((x)=>x.paragraphClaimIds),claimIds=new Set(claimFile.claims.map((x)=>x.id)),sourceIds=new Set(claimFile.sources.map((x)=>x.id)),plannedIds=source.topic_briefs.flatMap((t)=>t.planned_claims.map((c)=>c.id));
  assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired&&chapter.sourceFirst,'Kapittelstatus mangler');
  assert(chapter.primary_domain_id==='ernaering_metabolisme','Feil primærdomene');
  assert(modules.length===4&&sections.length===8&&paragraphs.length===32&&traces.length===32,'Struktur skal være 4/8/32');
  assert(paragraphIds.length===32&&new Set(paragraphIds).size===32,'32 unike paragraphIds kreves');
  assert(paragraphs.every((x)=>wc(x)>=25),'Alle avsnitt må være substansielle');
  assert(new Set(plannedIds).size===32&&claimIds.size===32&&plannedIds.every((id)=>claimIds.has(id)),'Alle briefclaims må løses én-til-én');
  assert(traces.every((ids)=>ids.length===1&&ids.every((id)=>claimIds.has(id)))&&new Set(traces.flat()).size===32,'Paragraph→claim-spor er ikke gjensidig');
  const paragraphIdSet=new Set(paragraphIds);
  assert(claimFile.claims.every((x)=>x.status==='verified'&&paragraphIdSet.has(x.paragraph_id)&&x.source_ids.length>=3&&x.source_ids.every((id)=>sourceIds.has(id))),'Claim→paragraph/source-binding feiler');
  assert(claimFile.claims.every((x)=>Array.isArray(x.source_locators)&&x.source_locators.length===x.source_ids.length&&x.source_locators.every((r)=>r.location&&x.source_ids.includes(r.source_id))),'Claim-locatorbinding mangler');
  const used=new Set(claimFile.claims.flatMap((x)=>x.source_ids));
  assert(sourceIds.size===15&&[...sourceIds].every((id)=>used.has(id)),'Alle 15 kilder må støtte sluttclaims');
  assert(claimFile.sources.every((x)=>x.url?.startsWith('https://')&&x.source_location&&/^verified_\d{4}-\d{2}-\d{2}$/u.test(x.retrieval_status)),'Kildeproveniens mangler');
  assert(source.decision_scenarios.length===6,'Seks generelle scenarioer kreves');
  assert(assessment.questions.length===8&&assessment.questions.every((x)=>x.answer===x.options[x.answerIndex]&&claimIds.has(x.claim_id)&&x.source.length>=3&&x.safety_mode==='general_non_individualizing'),'Assessment feiler');
  assert(safety.status==='blocking'&&brief.safety.individualDiagnosis===false&&brief.safety.individualPrognosis===false&&brief.safety.individualTriage===false&&brief.safety.individualTreatmentAdvice===false&&brief.safety.individualRiskCalculation===false&&brief.safety.individualDietPrescription===false&&brief.safety.individualSupplementDosing===false,'Klinisk sikkerhetsgrense feiler');
  const unsafeAdvice=/du bør|du skal|du må|ditt kalorimål|kalorimålet ditt|din diett|kostplanen din|din makrofordeling|ta (?:et )?(?:kosttilskudd|tilskudd)|start(?:e)? med (?:kosttilskudd|tilskudd)|slutt(?:e)? med (?:kosttilskudd|tilskudd)|din vitamin(?:dose)?|din mineral(?:dose)?|diagnostisere deg|du har mangel|ring 113|oppsøk (?:lege|legevakt)/iu;
  assert(chapter.lead.toLowerCase().includes('aldri individuell')&&!paragraphs.some((x)=>unsafeAdvice.test(x)),'Individråd funnet');
  const corpus=paragraphs.join(' ').toLowerCase();
  assert(corpus.includes('referanseverdier for energibehov')&&corpus.includes('personlige kalorimål'),'Energibehov/personlig kalorimål-grensen mangler');
  assert(corpus.includes('energibalanse er et dynamisk forhold')&&corpus.includes('enkelt måltid'),'Dynamisk energibalanse/single-meal-grensen mangler');
  assert(corpus.includes('mengde og kvalitet må derfor analyseres hver for seg'),'Karbohydratmengde/kvalitet-grensen mangler');
  assert(corpus.includes('total fettmengde beskriver derfor bare én dimensjon')&&corpus.includes('fettsyresammensetning'),'Totalfett/fettkvalitet-grensen mangler');
  assert(corpus.includes('erstatning med flerumettet fett')&&corpus.includes('raffinerte karbohydratkilder'),'Erstatningsnæringsstoff-grensen mangler');
  assert(corpus.includes('samme gram protein')&&corpus.includes('forskjellig aminosyreprofil'),'Proteinmengde/proteinkvalitet-grensen mangler');
  assert(corpus.includes('samme deklarerte innhold')&&corpus.includes('biotilgjengelighet'),'Næringsinnhold/biotilgjengelighet-grensen mangler');
  assert(corpus.includes('dietary reference values')&&corpus.includes('ikke det samme som gruppens gjennomsnittsbehov'),'DRV/individuell forskrift-grensen mangler');
  assert(corpus.includes('ikke det samme som en individuell mangeldiagnose'),'Mangelsrisiko/diagnose-grensen mangler');
  assert(corpus.includes('assosiasjon er derfor ikke automatisk bevis'),'Kostmønsterassosiasjon/kausalitet-grensen mangler');
  assert(corpus.includes('kan ikke uten videre overføres til et isolert næringsstoff eller kosttilskudd'),'Matmønster/tilskudd-ekvivalens-grensen mangler');
  assert(corpus.includes('medisinsk ernæringsbehandling')||corpus.includes('medisinsk ernæringsterapi'),'Befolkningsretningslinje/klinisk ernæringsbehandling-grensen mangler');
  assert(corpus.includes('homeostase betyr likevel ikke at alle verdier er konstante'),'Homeostase/konstans-grensen mangler');
  assert(corpus.includes('modeller')&&corpus.includes('ikke som øyeblikkelige metabolske brytere'),'Metabolsk modell/bryter-grensen mangler');
  const reg=registry.subjects.helse,health=status.subjects.find((x)=>x.id==='helse');
  const requiredIds=['medisinsk-etikk-evidens-og-ansvarlig-beslutning','anatomi-fysiologi-struktur-funksjon-og-regulering','sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt','klinisk-medisin-informasjon-testing-beslutning-og-oppfolging','folkehelse-populasjon-determinanter-forebygging-og-ulikhet','epidemiologi-design-mal-bias-confounding-og-kausalitet','mikrobiologi-infeksjon-mikrober-smitte-vertrespons-og-resistens','farmakologi-virkning-omsetning-dose-respons-og-legemiddelsikkerhet',ID];
  assert(manifest.helse.chapters?.includes(P.chapter)&&manifest.helse.sourceClaimBriefs?.includes(P.source),'Manifestregistrering mangler');
  assert(reg.chapters.filter((x)=>x.id===ID&&x.file===P.chapter).length===1,'Domene 9 må registreres nøyaktig én gang');
  assert(requiredIds.every((id)=>reg.chapters.some((x)=>x.id===id)),'Tidligere Helse-kapitler må bevares');
  assert(reg.editorialPlan.targetDomainCount===12&&reg.editorialPlan.registeredChapterCount===9&&reg.editorialPlan.completedSourceBriefCount>=9,'Helse-progresjon skal være 9/12');
  assert(health.navigationStatus==='materialized'&&health.assessmentStatus==='audited'&&health.editorialStatus==='chapters_in_progress','Helse-status feiler');
  assert(health.nextGate==='nutrition_metabolism_full_chapter_complete_next_domain_source_brief'&&health.editorialStatus!=='complete','Feil neste port eller prematur completion');
  const report={schema:'history_go_health_nutrition_metabolism_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-23',status:'pass',conclusion:'high_quality_fulltext_unit_complete_subject_not_scientifically_complete',subject_id:'helse',chapter_id:ID,counts:{domainsCovered:9,targetDomains:12,modules:4,sections:8,paragraphs:32,verifiedClaims:32,inspectableSources:15,assessmentQuestions:8,decisionScenarios:6},gates:{plannedClaimsResolvedOneToOne:true,paragraphClaimTraceReciprocalAndComplete:true,claimParagraphTraceReciprocalAndComplete:true,everyUsedSourceInspectable:true,everySourceSupportsFinalClaim:true,sourceLocatorsBoundPerClaim:true,energyRequirementNotPersonalCalorieTarget:true,dynamicEnergyBalanceNotSingleMealArithmetic:true,carbohydrateQuantityNotQuality:true,totalFatNotFatQuality:true,replacementNutrientExplicit:true,proteinQuantityNotProteinQuality:true,nutrientContentNotBioavailability:true,dietaryReferenceValueNotIndividualPrescription:true,deficiencyRiskNotDiagnosis:true,dietaryPatternAssociationNotCausality:true,foodPatternEvidenceNotSupplementEquivalence:true,populationGuidelineNotMedicalNutritionTherapy:true,homeostasisNotConstancy:true,metabolicStateModelNotBinarySwitch:true,assessmentClaimAndSafetyBindingComplete:true,clinicalSafetyContractBlocking:true,noIndividualDietCalorieSupplementOrDiagnosisAdvice:true,chapterRegisteredExactlyOnce:true,previousHealthChaptersPreserved:true,prematureSubjectCompletionBlocked:true},six_part_quality_review:{source_authority_and_provenance:5,claim_trace_and_verifiability:5,nutrition_metabolism_reasoning_and_boundary_precision:5,clinical_safety_and_responsibility:5,pedagogy_and_assessment:4,architecture_and_reproducibility:5,total:29,maximum:30,note:'Intern assessment er auditert; ekstern fagfelle- og brukerprøving er en senere kvalitetsport.'}};
  if(writeReport)write(P.report,report);else assert(isDeepStrictEqual(read(P.report),report),`${P.report} er utdatert`);
  return report;
}

try{const r=auditHealthNutritionMetabolismFulltextV1({writeReport:process.argv.includes('--write-report')});console.log(`Helse ernæring/metabolisme fulltekstaudit OK: ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims, ${r.counts.inspectableSources} kilder; ${r.six_part_quality_review.total}/30.`);}catch(e){console.error(`Helse ernæring/metabolisme fulltekstaudit FEIL: ${e.message}`);process.exitCode=1;}
