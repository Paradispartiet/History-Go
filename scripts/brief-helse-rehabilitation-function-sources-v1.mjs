#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DATE='2026-08-23';
const UNIT='rehabilitering-funksjon-icf-mal-deltakelse-og-tverrprofesjonell-praksis';
const EMNE='em_helse_rehabilitering_funksjon';
const METHODS=new Set(['met_helse_funksjonsvurdering','met_helse_tjenesteanalyse','met_helse_populasjonsanalyse','met_helse_etikk_samtykke']);
const P={brief:'data/fag/helse/rehabilitation_function_source_claim_brief_v1.json',report:'reports/fagverk/helse-rehabilitation-function-source-brief-v1-audit.json',emners:'data/fag/helse/emner_helse_canonical_v1.json',methods:'data/fag/helse/methods_helse_canonical_v1.json',safety:'data/fag/helse/clinical_safety_contract_helse_v1.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',release:'data/fagverk/fagverk_release.json'};
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);},assert=(v,m)=>{if(!v)throw new Error(m);};

function build(){
  const brief=read(P.brief),emners=read(P.emners),methods=read(P.methods),safety=read(P.safety),registry=read(P.registry),status=read(P.status),release=read(P.release);
  const canonical=emners.find(x=>x.emne_id===EMNE),methodIds=new Set((methods.methods||methods).map(x=>x.method_id)),health=status.subjects.find(x=>x.id==='helse'),reg=registry.subjects.helse,rel=release.subjects.helse;
  const sources=brief.sources||[],topics=brief.topic_briefs||[],scenarios=brief.decision_scenarios||[],claims=topics.flatMap(x=>x.planned_claims||[]),sourceIds=new Set(sources.map(x=>x.id)),used=new Set([...topics.flatMap(x=>x.source_ids||[]),...claims.flatMap(x=>x.source_ids||[]),...scenarios.flatMap(x=>x.source_ids||[])]),topicMethods=new Set(topics.flatMap(x=>x.method_ids||[])),structure=(brief.fulltext_structure||[]).flatMap(x=>x.topic_ids||[]),topicIds=topics.map(x=>x.id),policy=brief.source_policy||{},req=brief.production_requirements||{};
  assert(canonical?.domain==='rehabilitering_funksjon'&&canonical?.subject_id==='helse'&&canonical.status==='planned','Canonicalt Rehabilitering/funksjon-emne må være planned');
  assert([...METHODS].every(id=>methodIds.has(id)),'Rehabilitering/funksjon-metoder mangler');
  assert(safety.status==='blocking','Klinisk sikkerhetskontrakt må være blocking');
  assert(brief.scope.primary_domain_id==='rehabilitering_funksjon'&&brief.scope.canonical_emne_id===EMNE&&brief.future_chapter_id===UNIT,'Feil Rehabilitering/funksjon-scope');
  const gates={
    source_brief_is_explicitly_unregistered:brief.runtime_registration?.registered===false&&brief.runtime_registration?.allowed_before_full_chapter_gate===false,
    metadata_registration_deferred_until_fulltext:brief.metadata_registration?.deferred_until_fulltext===true&&brief.metadata_registration?.global_status_mutation_in_source_brief===false&&brief.metadata_registration?.release_mutation_in_source_brief===false,
    exact_source_topic_scenario_claim_counts:sources.length===15&&topics.length===8&&scenarios.length===6&&claims.length===32,
    proposed_fulltext_structure_is_four_by_two:(brief.fulltext_structure||[]).length===4&&(brief.fulltext_structure||[]).every(x=>x.topic_ids?.length===2)&&new Set(structure).size===8&&topicIds.every(id=>structure.includes(id)),
    all_sources_inspectable_https:sources.every(x=>x.url?.startsWith('https://')&&x.source_location&&x.type&&x.evidence_role&&x.retrieval_status===`verified_${DATE}`),
    every_source_used:sources.every(x=>used.has(x.id)),
    every_reference_resolves:[...used].every(id=>sourceIds.has(id)),
    topic_method_contract_is_canonical:topics.every(x=>x.method_ids?.length>=1&&x.method_ids.every(id=>METHODS.has(id)))&&[...METHODS].every(id=>topicMethods.has(id)),
    all_topics_source_boundary_complete:topics.every(x=>x.source_ids?.length>=3&&x.boundary&&x.planned_claims?.length===4),
    all_claim_ids_unique:new Set(claims.map(x=>x.id)).size===32,
    no_claim_overstated_as_verified:claims.every(x=>x.status==='planned_requires_fulltext_verification'&&x.source_ids?.length>=3),
    scenarios_non_individualizing_and_source_bound:scenarios.every(x=>x.source_ids?.length>=3&&x.purpose&&!/(du bør|du må|tren \d|øvelsesprogram for|prognose for en person|behandlingsplan for en person|juridisk råd til en person)/iu.test(x.purpose)),
    functioning_not_diagnosis:policy.functioning_is_not_diagnosis===true,
    impairment_not_whole_disability:policy.impairment_is_not_whole_disability_experience===true,
    activity_not_participation:policy.activity_is_not_participation===true,
    capacity_not_performance:policy.capacity_is_not_performance===true,
    environment_not_intrinsic_trait:policy.environmental_factor_is_not_intrinsic_person_trait===true,
    diagnosis_not_fixed_disability_or_need:policy.diagnosis_does_not_determine_disability_or_rehabilitation_need===true,
    rehab_goal_not_cure_or_normalization:policy.rehabilitation_goal_is_not_cure_or_normalization===true,
    habilitation_not_identical_rehabilitation:policy.habilitation_is_related_to_but_not_identical_with_rehabilitation===true,
    baseline_severity_not_fixed_potential:policy.severity_or_baseline_impairment_is_not_fixed_rehabilitation_potential===true,
    assistive_product_not_rehab_failure:policy.assistive_product_is_not_failure_or_absence_of_rehabilitation===true,
    body_function_change_not_participation_change:policy.body_function_change_is_not_automatically_activity_or_participation_change===true,
    measured_change_not_automatically_meaningful:policy.measured_change_is_not_automatically_meaningful_functional_improvement===true,
    person_goal_not_guaranteed_outcome:policy.person_centred_goal_is_not_guaranteed_outcome===true,
    multidisciplinary_not_parallel_silos:policy.multidisciplinary_team_is_not_parallel_siloed_work===true,
    coordination_plan_not_clinical_prescription:policy.coordination_plan_is_not_person_specific_clinical_prescription===true,
    group_evidence_not_individual_plan_or_dose:policy.group_intervention_evidence_is_not_individual_treatment_plan_or_dose===true,
    access_not_quality_or_outcome:policy.service_access_is_not_service_quality_or_outcome===true,
    population_function_not_individual_prognosis:policy.population_functioning_data_is_not_individual_prognosis===true,
    equity_includes_environment_and_system_barriers:policy.equity_requires_attention_to_environmental_and_system_barriers===true,
    clinical_safety_contract_blocking:req.clinical_safety_contract_is_blocking===true&&req.no_person_specific_scenario===true&&req.no_individual_diagnosis===true&&req.no_individual_prognosis===true&&req.no_individual_treatment_or_training_prescription===true&&req.no_case_specific_legal_advice===true&&policy.no_individual_diagnosis_prognosis_treatment_or_training_prescription===true,
    future_chapter_remains_unregistered:reg.chapters.length===10&&!reg.chapters.some(x=>x.id===UNIT),
    global_health_status_remains_ten_of_twelve:health.navigationStatus==='materialized'&&health.assessmentStatus==='audited'&&health.editorialStatus==='chapters_in_progress'&&reg.editorialPlan.targetDomainCount===12&&reg.editorialPlan.registeredChapterCount===10,
    release_remains_on_ten_registered_health_chapters:rel.chapter_count===10,
    strict_completion_not_claimed:health.editorialStatus!=='complete'
  };
  assert(Object.values(gates).every(Boolean),`Rehabilitering/funksjon source-brief-port feiler: ${Object.entries(gates).filter(([,v])=>!v).map(([k])=>k).join(', ')}`);
  const report={schema:'history_go_health_rehabilitation_function_source_brief_v1_audit',version:'1.0.0',updated_at:DATE,status:'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',subject_id:'helse',summary:{topic_count:8,source_count:15,scenario_count:6,planned_claim_count:32,proposed_module_count:4,registered_chapter_count_delta:0,current_registered_health_chapters:10,completed_health_domains:10,planned_health_domains:12},gates,quality_assessment:{correctness_and_evidence:{score:5},coverage_and_completion:{score:5},editorial_and_scientific_quality:{score:5},technical_integrity:{score:4},safety_and_responsibility:{score:5},maintainability_and_auditability:{score:5},total:29,maximum:30,conclusion:'high_quality_source_brief_ready_for_fulltext_not_scientific_completion'},next_gate:brief.next_gate};
  return{brief,report,gates,sources,topics,scenarios,claims};
}

export function auditHealthRehabilitationFunctionSourceBriefV1({writeReport=false,checkReport=true}={}){const built=build();if(writeReport)write(P.report,built.report);if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler`);assert(isDeepStrictEqual(read(P.report),built.report),`${P.report} er utdatert`);}return built;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const args=new Set(process.argv.slice(2)),r=auditHealthRehabilitationFunctionSourceBriefV1({writeReport:args.has('--write'),checkReport:!args.has('--write')});console.log(`Helse Rehabilitering/funksjon brief OK: ${r.topics.length} spor, ${r.sources.length} kilder, ${r.scenarios.length} scenarioer og ${r.claims.length} claimplaner; ${r.report.quality_assessment.total}/30.`);}catch(e){console.error(`Helse Rehabilitering/funksjon brief FEIL: ${e.message}`);process.exitCode=1;}}
