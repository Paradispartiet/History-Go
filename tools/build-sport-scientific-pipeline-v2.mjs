#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sportDir = "data/fag/sport";
const paths = {
  hooks: `${sportDir}/theory_hooks_sport_canonical_v5.json`,
  units: `${sportDir}/theory_units_sport_canonical_v6.json`,
  claims: `${sportDir}/claims_sport_canonical_v1.json`,
  evidenceManifest: `${sportDir}/sport_scientific_evidence_manifest_v1.json`,
  methodPolicy: `${sportDir}/sport_scientific_method_policy_v1.json`,
  qualityManifest: `${sportDir}/sport_quality_manifest_v5.json`,
  quizProfile: `${sportDir}/supersetQUIZMAL_sport.json`,
  classification: `${sportDir}/hook_scientific_classification_sport_v1.json`,
  questions: `${sportDir}/research_questions_sport_v1.json`,
  protocols: `${sportDir}/review_protocols_sport_v1.json`,
  studies: `${sportDir}/study_registry_sport_v1.json`,
  bias: `${sportDir}/risk_of_bias_sport_v1.json`,
  syntheses: `${sportDir}/evidence_syntheses_sport_v1.json`,
  certainty: `${sportDir}/certainty_assessments_sport_v1.json`,
  pipelineManifest: `${sportDir}/sport_scientific_pipeline_manifest_v2.json`,
  reportJson: "reports/sport-scientific-pipeline-v2-validation.json",
  reportMd: "reports/sport-scientific-pipeline-v2.md"
};

const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const writeJson = async (relativePath, value) => {
  await mkdir(path.dirname(path.resolve(root, relativePath)), { recursive: true });
  await writeFile(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const unique = (values) => [...new Set(values.filter(Boolean))];
const suffix = (hookId) => hookId.replace(/^hook_sport_/, "");

const trackDefinitions = {
  normative_conceptual: {
    label: "Normativ og begrepsanalytisk forskning",
    question_framework: "problem_premise_objection_reply",
    review_type: "systematic_normative_argument_review",
    eligible_designs: ["primary_philosophical_text", "peer_reviewed_normative_argument", "rule_text", "documented_practice_case"],
    appraisal_tool_ids: ["tool_sport_normative_argument_v1"],
    synthesis_method: "argumentkart, premissammenligning, innvending–svar og praksiskonsekvens",
    certainty_framework: "normative_warrant_profile",
    search_sources: ["PhilPapers", "SPORTDiscus", "Scopus", "relevante regel- og praksiskilder"],
    default_outcomes: ["begrepsklarhet", "argumentstyrke", "normativ konsistens", "praksiskonsekvens"],
    population_or_unit: "argumenter, regler og dokumenterte sportspraksiser"
  },
  historical_historiographic: {
    label: "Historisk og historiografisk forskning",
    question_framework: "historical_question_source_context",
    review_type: "systematic_historical_review",
    eligible_designs: ["archival_primary_source", "contemporary_document", "historical_dataset", "peer_reviewed_historiography", "oral_history"],
    appraisal_tool_ids: ["tool_sport_historical_source_criticism_v1"],
    synthesis_method: "kildekritisk kronologi, kontekstualisering, aktørperspektiv og historiografisk uenighet",
    certainty_framework: "historical_inference_profile",
    search_sources: ["SPORTDiscus", "Historical Abstracts", "Scopus", "relevante arkiver og bibliotekskataloger"],
    default_outcomes: ["kronologi", "institusjonell endring", "aktørfortolkning", "kontinuitet og brudd"],
    population_or_unit: "historiske institusjoner, praksiser, dokumenter og aktører"
  },
  spatial_mixed_methods: {
    label: "Romlig og blandet samfunnsvitenskap",
    question_framework: "SPIDER_plus_spatial",
    review_type: "mixed_methods_spatial_review",
    eligible_designs: ["ethnography", "interview_study", "archival_study", "spatial_analysis", "case_comparison", "natural_experiment"],
    appraisal_tool_ids: ["tool_sport_qualitative_v1", "tool_sport_spatial_inference_v1"],
    synthesis_method: "integrert tematisk, romlig og komparativ syntese",
    certainty_framework: "CERQual_plus_mixed_methods_profile",
    search_sources: ["Scopus", "Web of Science", "SPORTDiscus", "Sociological Abstracts", "geografiske databaser og offentlige planarkiv"],
    default_outcomes: ["tilgang", "stedsidentitet", "fordelingsvirkning", "erfart rom"],
    population_or_unit: "arenaer, steder, brukere, nabolag og institusjoner"
  },
  tactical_performance: {
    label: "Taktisk prestasjons- og kampanalyse",
    question_framework: "PECO_event_and_model",
    review_type: "systematic_performance_analysis_review",
    eligible_designs: ["observational_match_analysis", "tracking_study", "notational_analysis", "model_validation_study", "controlled_task_study"],
    appraisal_tool_ids: ["tool_sport_observational_v1", "tool_sport_model_validation_v1"],
    synthesis_method: "operasjonalisert kampanalyse med heterogenitets- og modellvurdering",
    certainty_framework: "modified_GRADE_performance_profile",
    search_sources: ["SPORTDiscus", "Scopus", "Web of Science", "IEEE Xplore ved tekniske modeller"],
    default_outcomes: ["beslutningsmuligheter", "romkontroll", "sekvensutfall", "modellvaliditet"],
    population_or_unit: "lag, utøvere, spillsituasjoner og konkurranser"
  },
  skill_acquisition: {
    label: "Ferdighetslæring og motorisk kontroll",
    question_framework: "PICO_learning_retention_transfer",
    review_type: "systematic_learning_intervention_review",
    eligible_designs: ["randomized_trial", "controlled_intervention", "longitudinal_learning_study", "representative_task_study"],
    appraisal_tool_ids: ["tool_sport_rob2_v1", "tool_sport_robins_i_v1", "tool_sport_learning_transfer_v1"],
    synthesis_method: "intervensjonssyntese med separat vurdering av prestasjon, retensjon og transfer",
    certainty_framework: "GRADE_with_transfer_directness",
    search_sources: ["SPORTDiscus", "PsycINFO", "Scopus", "Web of Science", "MEDLINE"],
    default_outcomes: ["retensjon", "transfer", "tilpasning", "beslutningskvalitet"],
    population_or_unit: "utøvere med angitt alder, nivå, idrett og ferdighet"
  },
  training_physiology: {
    label: "Treningsfysiologi og intervensjon",
    question_framework: "PICO_training",
    review_type: "systematic_intervention_review",
    eligible_designs: ["randomized_trial", "crossover_trial", "controlled_intervention", "prospective_longitudinal_study"],
    appraisal_tool_ids: ["tool_sport_rob2_v1", "tool_sport_robins_i_v1"],
    synthesis_method: "utfallsspesifikk effekt- og sikkerhetssyntese med dose, tidsrom og populasjon",
    certainty_framework: "GRADE",
    search_sources: ["MEDLINE", "Embase", "SPORTDiscus", "Cochrane CENTRAL", "Scopus"],
    default_outcomes: ["prestasjon", "fysiologisk respons", "uønskede hendelser", "restitusjon"],
    population_or_unit: "utøvere definert etter alder, kjønn, nivå, idrett og helsestatus"
  },
  measurement_properties: {
    label: "Måleegenskaper og instrumentvalidering",
    question_framework: "COSMIN_construct_population_context",
    review_type: "systematic_measurement_property_review",
    eligible_designs: ["reliability_study", "measurement_error_study", "criterion_validity_study", "construct_validity_study", "responsiveness_study", "calibration_study"],
    appraisal_tool_ids: ["tool_sport_cosmin_v1", "tool_sport_model_validation_v1"],
    synthesis_method: "måleegenskap for måleegenskap med separat validitet, reliabilitet, feil og responsivitet",
    certainty_framework: "COSMIN_modified_GRADE",
    search_sources: ["MEDLINE", "Embase", "SPORTDiscus", "Scopus", "IEEE Xplore"],
    default_outcomes: ["reliabilitet", "målefeil", "validitet", "responsivitet", "kalibrering"],
    population_or_unit: "instrumenter, modeller og måleprotokoller i definerte sportskontekster"
  },
  risk_epidemiology: {
    label: "Eksponering, skade og risikoepidemiologi",
    question_framework: "PECO_risk",
    review_type: "systematic_exposure_and_risk_review",
    eligible_designs: ["prospective_cohort", "retrospective_cohort", "case_control", "surveillance_study", "prediction_model_validation"],
    appraisal_tool_ids: ["tool_sport_observational_v1", "tool_sport_prediction_model_v1"],
    synthesis_method: "eksponerings- og risikoanalyse med nevner, tidsvindu, kalibrering og alternativ forklaring",
    certainty_framework: "GRADE_prognostic_or_exposure_profile",
    search_sources: ["MEDLINE", "Embase", "SPORTDiscus", "Scopus", "Web of Science"],
    default_outcomes: ["insidens", "byrde", "risikoestimat", "kalibrering", "uønskede konsekvenser"],
    population_or_unit: "utøvere og eksponeringstid i definerte idretter og nivåer"
  },
  psychology_behaviour: {
    label: "Idrettspsykologi og atferd",
    question_framework: "PICO_or_PECO_psychology",
    review_type: "systematic_psychology_review",
    eligible_designs: ["randomized_trial", "controlled_intervention", "prospective_cohort", "experience_sampling", "validated_cross_sectional_study"],
    appraisal_tool_ids: ["tool_sport_rob2_v1", "tool_sport_robins_i_v1", "tool_sport_cosmin_v1"],
    synthesis_method: "konstrukt- og utfallsspesifikk psykologisk syntese med målekvalitet",
    certainty_framework: "GRADE_plus_measurement_directness",
    search_sources: ["PsycINFO", "MEDLINE", "SPORTDiscus", "Scopus", "Web of Science"],
    default_outcomes: ["motivasjon", "trivsel", "prestasjon", "vedvarende deltakelse", "lagatferd"],
    population_or_unit: "utøvere, trenere og lag i definerte miljøer"
  },
  developmental_pedagogy: {
    label: "Utvikling, pedagogikk og barneidrett",
    question_framework: "PICO_PECO_development",
    review_type: "systematic_development_and_pedagogy_review",
    eligible_designs: ["randomized_trial", "controlled_intervention", "prospective_cohort", "longitudinal_development_study", "mixed_methods_programme_evaluation"],
    appraisal_tool_ids: ["tool_sport_rob2_v1", "tool_sport_robins_i_v1", "tool_sport_qualitative_v1"],
    synthesis_method: "utviklingssensitiv syntese av læring, helse, trivsel, deltakelse og frafall",
    certainty_framework: "GRADE_plus_developmental_directness",
    search_sources: ["ERIC", "PsycINFO", "MEDLINE", "SPORTDiscus", "Scopus"],
    default_outcomes: ["læring", "trivsel", "frafall", "helse", "langsiktig utvikling"],
    population_or_unit: "barn og unge definert etter alder, modning, idrett og nivå"
  },
  safeguarding_policy: {
    label: "Safeguarding, rettigheter og institusjonell sikkerhet",
    question_framework: "policy_mechanism_rights_outcomes",
    review_type: "mixed_evidence_safeguarding_review",
    eligible_designs: ["policy_evaluation", "qualitative_study", "prevalence_study", "case_review", "implementation_study", "rights_analysis"],
    appraisal_tool_ids: ["tool_sport_safeguarding_policy_v1", "tool_sport_qualitative_v1", "tool_sport_observational_v1"],
    synthesis_method: "rettighets-, implementerings- og sikkerhetssyntese med eksplisitt skadegrense",
    certainty_framework: "mixed_evidence_safeguarding_profile",
    search_sources: ["MEDLINE", "PsycINFO", "ERIC", "SPORTDiscus", "Scopus", "offisielle safeguarding- og rettighetskilder"],
    default_outcomes: ["trygghet", "varsling", "respons", "medvirkning", "uønskede hendelser"],
    population_or_unit: "barn, unge, utøvere og organisasjoner med omsorgs- eller maktansvar"
  },
  organisation_economics: {
    label: "Organisasjon, arbeid, økonomi og styring",
    question_framework: "institution_mechanism_comparator_outcome",
    review_type: "systematic_social_science_and_governance_review",
    eligible_designs: ["panel_study", "natural_experiment", "comparative_case_study", "institutional_analysis", "mixed_methods_evaluation", "process_tracing"],
    appraisal_tool_ids: ["tool_sport_observational_v1", "tool_sport_qualitative_v1", "tool_sport_process_tracing_v1"],
    synthesis_method: "kausal og institusjonell syntese med prosessporing og fordelingsanalyse",
    certainty_framework: "causal_process_tracing_profile",
    search_sources: ["Scopus", "Web of Science", "SPORTDiscus", "EconLit", "Sociological Abstracts", "offentlige regnskaps- og styringskilder"],
    default_outcomes: ["beslutningsmakt", "arbeidsvilkår", "økonomisk fordeling", "konkurransebalanse", "styringsresultat"],
    population_or_unit: "klubber, forbund, ligaer, arbeidstakere, eiere og vertssamfunn"
  },
  culture_media: {
    label: "Supporterkultur, medier og identitet",
    question_framework: "SPIDER_culture_media",
    review_type: "qualitative_and_media_evidence_synthesis",
    eligible_designs: ["ethnography", "interview_study", "discourse_analysis", "media_content_analysis", "historical_case_study", "digital_ethnography"],
    appraisal_tool_ids: ["tool_sport_qualitative_v1", "tool_sport_media_analysis_v1"],
    synthesis_method: "tematisk og diskursiv syntese med historisk og plattformspesifikk kontekst",
    certainty_framework: "GRADE_CERQual",
    search_sources: ["Scopus", "Web of Science", "SPORTDiscus", "Communication Source", "Sociological Abstracts"],
    default_outcomes: ["tilhørighet", "identitetsgrense", "ritual", "representasjon", "medieform"],
    population_or_unit: "supportere, medier, plattformer, klubber og lokalsamfunn"
  },
  inequality_access: {
    label: "Ulikhet, representasjon og tilgjengelighet",
    question_framework: "intersectional_population_institution_outcome",
    review_type: "mixed_methods_inequality_review",
    eligible_designs: ["cohort_study", "cross_sectional_study", "qualitative_study", "institutional_audit", "historical_study", "policy_evaluation"],
    appraisal_tool_ids: ["tool_sport_observational_v1", "tool_sport_qualitative_v1", "tool_sport_intersectional_inference_v1"],
    synthesis_method: "interseksjonell kvantitativ og kvalitativ syntese med institusjonell mekanisme",
    certainty_framework: "mixed_methods_equity_profile",
    search_sources: ["Scopus", "Web of Science", "SPORTDiscus", "Sociological Abstracts", "Gender Studies Database"],
    default_outcomes: ["deltakelse", "ressursfordeling", "representasjon", "barrierer", "opplevd inkludering"],
    population_or_unit: "grupper og institusjoner definert etter relevante kryssende posisjoner"
  },
  ethics_regulation_technology: {
    label: "Etikk, regulering og teknologi",
    question_framework: "norm_rule_technology_consequence",
    review_type: "normative_regulatory_and_technology_review",
    eligible_designs: ["normative_argument", "regulatory_text", "implementation_study", "technology_validation_study", "stakeholder_study", "case_analysis"],
    appraisal_tool_ids: ["tool_sport_normative_argument_v1", "tool_sport_regulatory_currency_v1", "tool_sport_model_validation_v1"],
    synthesis_method: "integrert normativ, regulatorisk og teknologisk vurdering med versjonskontroll",
    certainty_framework: "normative_regulatory_evidence_profile",
    search_sources: ["PhilPapers", "SPORTDiscus", "Scopus", "IEEE Xplore", "gjeldende styrings- og regelkilder"],
    default_outcomes: ["rettferdighet", "helserisiko", "autonomi", "personvern", "beslutningslegitimitet"],
    population_or_unit: "regler, teknologier, beslutningssystemer, utøvere og styringsorganer"
  },
  public_health_environment: {
    label: "Folkehelse, inkludering, byrom og miljø",
    question_framework: "PICO_PECO_population_environment",
    review_type: "systematic_population_and_environment_review",
    eligible_designs: ["randomized_trial", "prospective_cohort", "natural_experiment", "policy_evaluation", "life_cycle_assessment", "mixed_methods_study"],
    appraisal_tool_ids: ["tool_sport_rob2_v1", "tool_sport_observational_v1", "tool_sport_environmental_lca_v1", "tool_sport_qualitative_v1"],
    synthesis_method: "befolknings-, fordelings- og miljøsyntese med absolutte effekter og systemgrenser",
    certainty_framework: "GRADE_plus_environmental_profile",
    search_sources: ["MEDLINE", "Embase", "SPORTDiscus", "Scopus", "Web of Science", "TRID ved transport og byrom"],
    default_outcomes: ["fysisk aktivitet", "helse", "deltakelse", "fordeling", "klima- og naturbelastning"],
    population_or_unit: "befolkninger, nabolag, miljøer, anlegg og aktivitetsformer"
  }
};

const trackByHook = {
  hook_sport_lek_spill_sport: "normative_conceptual",
  hook_sport_konstitutive_regler: "normative_conceptual",
  hook_sport_konkurranse_usikkerhet: "normative_conceptual",
  hook_sport_indre_goder_praksis: "normative_conceptual",
  hook_sport_sportivisering_standardisering: "historical_historiographic",
  hook_sport_amatorisme_profesjonalisering: "historical_historiographic",
  hook_sport_rekord_kvantifisering: "historical_historiographic",
  hook_sport_olympisme_nasjonalisme: "historical_historiographic",
  hook_sport_stadion_sosialt_rom: "spatial_mixed_methods",
  hook_sport_groundhopping_stedsidentitet: "spatial_mixed_methods",
  hook_sport_anlegg_byutvikling: "spatial_mixed_methods",
  hook_sport_idrettsminne_kulturarv: "spatial_mixed_methods",
  hook_sport_rom_tid_overtall: "tactical_performance",
  hook_sport_faser_overganger: "tactical_performance",
  hook_sport_press_kompakthet: "tactical_performance",
  hook_sport_spillmodell_beslutning: "tactical_performance",
  hook_sport_persepsjon_handling: "skill_acquisition",
  hook_sport_begrensningsstyrt_laring: "skill_acquisition",
  hook_sport_variabilitet_tilpasning: "skill_acquisition",
  hook_sport_feedback_oppmerksomhet: "skill_acquisition",
  hook_sport_belastning_tilpasning: "training_physiology",
  hook_sport_utholdenhet_energisystemer: "training_physiology",
  hook_sport_styrke_hurtighet_kraft: "training_physiology",
  hook_sport_restitusjon_overtrening: "training_physiology",
  hook_sport_bevegelsesmekanikk: "measurement_properties",
  hook_sport_prestasjonsdata_validitet: "measurement_properties",
  hook_sport_teknologi_tracking: "measurement_properties",
  hook_sport_skade_risiko_epidemiologi: "risk_epidemiology",
  hook_sport_motivasjon_selvbestemmelse: "psychology_behaviour",
  hook_sport_mestring_self_efficacy: "psychology_behaviour",
  hook_sport_stress_arousal_oppmerksomhet: "psychology_behaviour",
  hook_sport_flyt_lagkohesjon_ledelse: "psychology_behaviour",
  hook_sport_deliberate_play_sampling: "developmental_pedagogy",
  hook_sport_tidlig_spesialisering_frafall: "developmental_pedagogy",
  hook_sport_tgfu_sport_education: "developmental_pedagogy",
  hook_sport_safeguarding_barnets_rettigheter: "safeguarding_policy",
  hook_sport_klubb_forbund_frivillighet: "organisation_economics",
  hook_sport_profesjonalisering_arbeid: "organisation_economics",
  hook_sport_konkurransebalanse_finans: "organisation_economics",
  hook_sport_megaevents_governance: "organisation_economics",
  hook_sport_supporter_ritual_fellesskap: "culture_media",
  hook_sport_derby_lokal_identitet: "culture_media",
  hook_sport_medialisering_kommersialisering: "culture_media",
  hook_sport_nasjonalisme_globale_fandoms: "culture_media",
  hook_sport_kjonnede_kropper_ulikhet: "inequality_access",
  hook_sport_rasisering_koloniale_arv: "inequality_access",
  hook_sport_paraidrett_tilgjengelighet: "inequality_access",
  hook_sport_interseksjonalitet_representasjon: "inequality_access",
  hook_sport_fair_play_gamesmanship: "ethics_regulation_technology",
  hook_sport_doping_enhancement: "ethics_regulation_technology",
  hook_sport_dataovervakning_personvern: "ethics_regulation_technology",
  hook_sport_dommerteknologi_rettferdighet: "ethics_regulation_technology",
  hook_sport_fysisk_aktivitet_folkehelse: "public_health_environment",
  hook_sport_sosial_inkludering_tilgang: "public_health_environment",
  hook_sport_natur_klima_baerekraft: "public_health_environment",
  hook_sport_lek_byrom_aktive_liv: "public_health_environment"
};

const riskTools = [
  ["tool_sport_rob2_v1", "Randomiserte intervensjonsresultater", ["randomisering", "avvik fra intervensjon", "manglende resultatdata", "utfallsmåling", "selektiv rapportering"]],
  ["tool_sport_robins_i_v1", "Ikke-randomiserte intervensjonsresultater", ["konfundering", "deltakervalg", "intervensjonsklassifikasjon", "avvik", "manglende data", "utfallsmåling", "rapportering"]],
  ["tool_sport_observational_v1", "Observasjons-, eksponerings- og kohortresultater", ["konfundering", "seleksjon", "eksponeringsmåling", "utfallsmåling", "manglende data", "analysevalg"]],
  ["tool_sport_prediction_model_v1", "Prediksjonsmodeller", ["deltakere", "prediktorer", "utfall", "analyse", "kalibrering", "ekstern validering"]],
  ["tool_sport_cosmin_v1", "Måleinstrumenter og måleegenskaper", ["innholdsvaliditet", "strukturell validitet", "reliabilitet", "målefeil", "kriterievaliditet", "responsivitet"]],
  ["tool_sport_model_validation_v1", "Data- og prestasjonsmodeller", ["målvariabel", "datasett", "inputdefinisjon", "intern validering", "ekstern validering", "kalibrering", "drift"]],
  ["tool_sport_qualitative_v1", "Kvalitative studier", ["forskningsdesign", "utvalg", "dataproduksjon", "refleksivitet", "analyse", "representasjon"]],
  ["tool_sport_historical_source_criticism_v1", "Historiske kilder og slutninger", ["proveniens", "samtidighet", "avhengighet", "tendens", "representativitet", "kontekst"]],
  ["tool_sport_normative_argument_v1", "Normative argumenter", ["premissklarhet", "slutningsgyldighet", "begrepsbruk", "motargument", "praksisrelevans", "skjulte forutsetninger"]],
  ["tool_sport_spatial_inference_v1", "Romlige og geografiske analyser", ["systemgrense", "skala", "geokoding", "seleksjon", "romlig autokorrelasjon", "fordelingsmål"]],
  ["tool_sport_learning_transfer_v1", "Ferdighetslæring", ["representativ oppgave", "sammenligningsbetingelse", "retensjon", "transfer", "målekvalitet", "etterlevelse"]],
  ["tool_sport_safeguarding_policy_v1", "Safeguarding og rettighetsimplementering", ["rettighetsgrunnlag", "implementering", "rapporteringsvei", "uønskede konsekvenser", "barns stemme", "håndheving"]],
  ["tool_sport_process_tracing_v1", "Institusjonell prosessporing", ["mekanisme", "tidsrekkefølge", "alternativ forklaring", "kildetriangulering", "casevalg", "bevisstyrke"]],
  ["tool_sport_media_analysis_v1", "Medie- og diskursanalyse", ["utvalg", "kodingsramme", "plattformkontekst", "interkoderkontroll", "tolkningsgrunnlag", "generaliserbarhet"]],
  ["tool_sport_intersectional_inference_v1", "Interseksjonell analyse", ["kategorioperasjonalisering", "institusjonell mekanisme", "utvalgsstørrelse", "kryssklassifisering", "maktforhold", "representasjon"]],
  ["tool_sport_regulatory_currency_v1", "Gjeldende regelverk", ["jurisdiksjon", "versjon", "virkningsdato", "endringshistorikk", "autorativ kilde", "kontrollfrist"]],
  ["tool_sport_environmental_lca_v1", "Livsløps- og miljøanalyse", ["funksjonell enhet", "systemgrense", "datakvalitet", "allokering", "alternativscenario", "sensitivitetsanalyse"]]
].map(([tool_id, applicability, domains]) => ({
  tool_id,
  version: "1.0",
  applicability,
  domains,
  result_level_required: true,
  independent_reviewers_required: 2,
  adjudication_required_on_disagreement: true,
  status: "canonical_pipeline_tool"
}));

const [hookFile, unitFile, claimFile, evidenceManifest, methodPolicy, qualityManifest, quizProfile] = await Promise.all([
  readJson(paths.hooks), readJson(paths.units), readJson(paths.claims), readJson(paths.evidenceManifest),
  readJson(paths.methodPolicy), readJson(paths.qualityManifest), readJson(paths.quizProfile)
]);

const hooks = hookFile.hooks || [];
const units = unitFile.theory_units || [];
const claims = claimFile.claims || [];
const unitByHook = new Map(units.map((unit) => [unit.hook_id, unit]));
const unknownHooks = hooks.filter((hook) => !trackByHook[hook.hook_id]).map((hook) => hook.hook_id);
const obsoleteMappings = Object.keys(trackByHook).filter((hookId) => !hooks.some((hook) => hook.hook_id === hookId));
if (unknownHooks.length || obsoleteMappings.length) {
  throw new Error(`Ufullstendig hookklassifisering. Mangler: ${unknownHooks.join(", ")}; foreldet: ${obsoleteMappings.join(", ")}`);
}

const classifications = hooks.map((hook) => {
  const track_id = trackByHook[hook.hook_id];
  const track = trackDefinitions[track_id];
  const unit = unitByHook.get(hook.hook_id);
  if (!unit) throw new Error(`Mangler teorienhet for ${hook.hook_id}`);
  return {
    classification_id: `class_sport_${suffix(hook.hook_id)}`,
    hook_id: hook.hook_id,
    theory_unit_id: unit.theory_unit_id,
    area_id: hook.area_id,
    title: hook.title,
    epistemic_track: track_id,
    track_label: track.label,
    question_framework: track.question_framework,
    review_type: track.review_type,
    certainty_framework: track.certainty_framework,
    appraisal_tool_ids: track.appraisal_tool_ids,
    eligible_designs: track.eligible_designs,
    current_claim_ids: unit.evidence_claim_ids || [],
    evidence_readiness: (unit.evidence_claim_ids || []).length ? "legacy_claims_require_pipeline_migration" : "evidence_gap",
    classification_status: "canonical_pipeline_v2",
    publication_status: "blocked_until_completed_synthesis"
  };
});

const researchQuestions = classifications.map((classification) => {
  const hook = hooks.find((item) => item.hook_id === classification.hook_id);
  const unit = unitByHook.get(classification.hook_id);
  const track = trackDefinitions[classification.epistemic_track];
  return {
    research_question_id: `rq_sport_${suffix(classification.hook_id)}_01`,
    classification_id: classification.classification_id,
    hook_id: classification.hook_id,
    theory_unit_id: classification.theory_unit_id,
    area_id: classification.area_id,
    title: hook.title,
    question_text: unit.central_problem,
    question_type: classification.epistemic_track,
    framework: track.question_framework,
    population_or_unit: track.population_or_unit,
    focal_exposure_intervention_or_argument: unit.main_theory,
    comparison_or_alternative: unit.rival_or_alternative,
    outcomes: track.default_outcomes,
    eligible_designs: track.eligible_designs,
    scope_constraints: unit.boundary_conditions || [],
    required_discriminating_evidence: unit.discriminating_evidence || [],
    status: "planned_not_answered",
    protocol_required: true,
    publication_status: "blocked"
  };
});

const protocols = researchQuestions.map((question) => {
  const classification = classifications.find((item) => item.classification_id === question.classification_id);
  const track = trackDefinitions[classification.epistemic_track];
  return {
    protocol_id: `protocol_${question.research_question_id}`,
    research_question_id: question.research_question_id,
    classification_id: classification.classification_id,
    hook_id: question.hook_id,
    review_type: track.review_type,
    version: "1.0",
    status: "planned_not_registered",
    registration: {
      required_before_screening: true,
      registry_or_repository: null,
      registration_id: null,
      registered_at: null
    },
    search_plan: {
      sources: track.search_sources,
      full_search_strings: [],
      search_date: null,
      language_limits: [],
      date_limits: [],
      grey_literature_plan: "Dokumenteres eksplisitt når sporet krever arkiv, regelverk, offentlige data eller praksiskilder.",
      citation_chaining_required: true,
      search_status: "not_run"
    },
    eligibility: {
      eligible_designs: question.eligible_designs,
      population_or_unit: question.population_or_unit,
      focal_condition: question.focal_exposure_intervention_or_argument,
      comparison_or_alternative: question.comparison_or_alternative,
      outcomes: question.outcomes,
      exclusions: ["kilder uten identifiserbar proveniens", "påstander uten relevant metodegrunnlag", "duplikatpublikasjoner uten unik informasjon"]
    },
    screening: {
      independent_reviewers: 2,
      title_abstract_dual_screening: true,
      full_text_dual_screening: true,
      exclusion_reason_required: true,
      adjudication_required: true
    },
    extraction: {
      independent_reviewers: 2,
      critical_fields_dual_extraction: true,
      remaining_fields_verified_by_second_reviewer: true,
      extraction_form_version_required: true
    },
    appraisal_tool_ids: track.appraisal_tool_ids,
    synthesis_plan: {
      method: track.synthesis_method,
      certainty_framework: track.certainty_framework,
      outcome_specific: true,
      conflicting_evidence_required: true,
      null_findings_required: true,
      subgroup_analyses_must_be_prespecified: true,
      meta_analysis_only_when_defensible: true
    },
    amendment_log: [],
    deviations_from_protocol: [],
    publication_status: "blocked_until_protocol_registered_and_review_completed"
  };
});

const syntheses = researchQuestions.map((question) => {
  const classification = classifications.find((item) => item.classification_id === question.classification_id);
  const protocol = protocols.find((item) => item.research_question_id === question.research_question_id);
  return {
    synthesis_id: `synthesis_${question.research_question_id}`,
    research_question_id: question.research_question_id,
    protocol_id: protocol.protocol_id,
    classification_id: classification.classification_id,
    hook_id: question.hook_id,
    epistemic_track: classification.epistemic_track,
    status: "not_started",
    last_search_date: null,
    included_study_ids: [],
    excluded_full_text_records: [],
    result_ids: [],
    risk_of_bias_assessment_ids: [],
    quantitative_summary: null,
    qualitative_or_argument_summary: null,
    conflict_summary: null,
    certainty_assessment_ids: [],
    approved_claim_ids: [],
    conclusion: null,
    update_due: null,
    publication_status: "blocked"
  };
});

for (const claim of claims) {
  claim.pipeline_v2 = {
    status: "provisional_legacy_claim",
    research_question_ids: [],
    synthesis_ids: [],
    certainty_assessment_ids: [],
    publication_ready: false,
    migration_rule: "Claimet må knyttes til registrert protokoll, fullført syntese, resultatspesifikk biasvurdering og godkjent sikkerhetsvurdering før ny eller endret vitenskapelig publisering."
  };
}
claimFile.version = "2.0-transition";
claimFile.updated_at = "2026-07-25";
claimFile.production_rule = "Nye eller endrede forsknings- og helsepåstander må ha full V2-kjede. Eksisterende claims er provisoriske inntil de er migrert gjennom syntese og sikkerhetsvurdering.";

const studyRegistry = {
  version: "1.0",
  subject_id: "sport",
  type: "study_and_result_registry",
  status: "schema_ready_no_studies_materialized",
  updated_at: "2026-07-25",
  required_study_fields: ["study_id", "bibliographic_source_id", "research_question_ids", "study_design", "country", "setting", "population", "sample_size", "exposure_or_intervention", "comparator", "follow_up", "funding", "conflicts_of_interest"],
  required_result_fields: ["result_id", "study_id", "outcome_id", "analysis_population", "effect_measure", "effect_estimate", "uncertainty_interval", "measurement_id", "timepoint", "missing_data_note"],
  invariants: ["Effektestimater lagres som resultatobjekter, ikke som fritekst i claims.", "Alle resultater skal ha utfall, analysepopulasjon, måletidspunkt og usikkerhet.", "Duplikatpublikasjoner kobles til samme study_id."],
  studies: [],
  results: []
};

const riskOfBias = {
  version: "1.0",
  subject_id: "sport",
  type: "risk_of_bias_registry",
  status: "tools_ready_no_assessments_materialized",
  updated_at: "2026-07-25",
  principles: { result_specific: true, independent_reviewers_required: 2, adjudication_required: true, supporting_basis_required: true },
  tools: riskTools,
  assessments: []
};

const certaintyFrameworks = unique(classifications.map((item) => item.certainty_framework)).map((framework_id) => ({
  framework_id,
  status: "canonical_pipeline_framework",
  outcome_or_conclusion_specific: true,
  independent_reviewers_required: 2,
  adjudication_required: true,
  required_domains: framework_id.includes("GRADE")
    ? ["risk_of_bias", "inconsistency", "indirectness", "imprecision", "publication_bias"]
    : ["method_quality", "coherence", "directness", "adequacy", "alternative_explanations"],
  rule: "Sikkerhet kan ikke settes direkte på en enkelt kilde; vurderingen gjelder en definert syntese, konklusjon og utfall."
}));
const certaintyRegistry = {
  version: "1.0",
  subject_id: "sport",
  type: "certainty_assessment_registry",
  status: "frameworks_ready_no_assessments_materialized",
  updated_at: "2026-07-25",
  frameworks: certaintyFrameworks,
  required_assessment_fields: ["certainty_assessment_id", "synthesis_id", "outcome_or_conclusion_id", "framework_id", "domain_judgements", "final_certainty", "reviewers", "adjudication_note"],
  assessments: []
};

const addGate = (gate) => {
  methodPolicy.production_gates ||= [];
  const index = methodPolicy.production_gates.findIndex((item) => item.gate_id === gate.gate_id);
  if (index >= 0) methodPolicy.production_gates[index] = gate;
  else methodPolicy.production_gates.push(gate);
};
for (const gate of [
  { gate_id: "gate_sport_research_question_chain", rule: "Ny eller endret vitenskapelig tekst må peke til research_question_id og klassifisert epistemisk spor.", failure_action: "block" },
  { gate_id: "gate_sport_protocol_preregistration", rule: "Screening og syntese kan ikke starte før en versjonert protokoll er registrert og søkeplanen er låst.", failure_action: "block" },
  { gate_id: "gate_sport_dual_review", rule: "Fulltekstscreening, kritisk dataekstraksjon, biasvurdering og sikkerhetsvurdering krever to uavhengige vurderere og dokumentert avgjørelse ved uenighet.", failure_action: "block" },
  { gate_id: "gate_sport_result_level_bias", rule: "Empiriske resultater kan ikke inngå i en godkjent syntese uten resultatspesifikk biasvurdering med riktig verktøyversjon.", failure_action: "block" },
  { gate_id: "gate_sport_synthesis_before_claim", rule: "En claim kan ikke være publication_ready før den peker til minst én fullført og godkjent synthesis_id.", failure_action: "block" },
  { gate_id: "gate_sport_certainty_before_publication", rule: "En claim kan ikke publiseres eller regenereres vitenskapelig før den peker til en godkjent, utfallsspesifikk certainty_assessment_id.", failure_action: "block" },
  { gate_id: "gate_sport_living_update", rule: "Tidsfølsomme kliniske, regulatoriske, teknologiske og retningslinjebaserte synteser må ha update_due og blokkeres etter utløp.", failure_action: "block" }
]) addGate(gate);
methodPolicy.version = "2.0";
methodPolicy.updated_at = "2026-07-25";
methodPolicy.scope = "Hele kjeden fra forskningsspørsmål og protokoll til studieresultat, biasvurdering, syntese, sikkerhetsvurdering, claim og quizproduksjon i Sport & lek.";
methodPolicy.pipeline_v2 = {
  required_chain: ["hook_id", "theory_unit_id", "research_question_id", "protocol_id", "synthesis_id", "certainty_assessment_id", "claim_id"],
  required_for: "all new or modified scientific content",
  legacy_claim_status: "provisional_legacy_claim",
  publication_ready_requires_all_links: true
};
methodPolicy.required_scientific_metadata = unique([...(methodPolicy.required_scientific_metadata || []), "research_question_id", "synthesis_id", "certainty_assessment_id"]);
methodPolicy.quiz_schema_extension ||= {};
methodPolicy.quiz_schema_extension.scientific_evidence ||= { required_when: "vitenskapelig innhold", fields: {} };
Object.assign(methodPolicy.quiz_schema_extension.scientific_evidence.fields, {
  research_question_id: "string",
  protocol_id: "string",
  synthesis_id: "string",
  certainty_assessment_id: "string",
  claim_id: "string"
});

quizProfile.scientific_pipeline_v2 = {
  version: "2.0",
  manifest: paths.pipelineManifest,
  hook_classification: paths.classification,
  research_questions: paths.questions,
  protocols: paths.protocols,
  studies_and_results: paths.studies,
  risk_of_bias: paths.bias,
  syntheses: paths.syntheses,
  certainty_assessments: paths.certainty,
  validator: "tools/validate-sport-scientific-pipeline-v2.mjs",
  required_for_new_or_modified_scientific_content: true,
  publication_ready_requires_complete_chain: true,
  legacy_claims_are_provisional: true
};
quizProfile.scientific_evidence_metadata ||= {};
quizProfile.scientific_evidence_metadata.required_fields = unique([...(quizProfile.scientific_evidence_metadata.required_fields || []), "research_question_id", "synthesis_id", "certainty_assessment_id"]);
quizProfile.scientific_evidence_metadata.block_when_missing = true;

const pipelineCounts = {
  classified_hooks: classifications.length,
  research_questions: researchQuestions.length,
  planned_protocols: protocols.length,
  registered_protocols: protocols.filter((item) => item.status === "registered").length,
  studies: 0,
  results: 0,
  risk_of_bias_assessments: 0,
  planned_syntheses: syntheses.length,
  completed_syntheses: 0,
  certainty_assessments: 0,
  publication_ready_claims: claims.filter((claim) => claim.pipeline_v2?.publication_ready).length,
  provisional_legacy_claims: claims.length
};
const pipelineManifest = {
  version: "2.0",
  subject_id: "sport",
  type: "scientific_pipeline_manifest",
  status: "infrastructure_and_classification_ready_evidence_materialization_pending",
  updated_at: "2026-07-25",
  files: {
    hook_classification: "hook_scientific_classification_sport_v1.json",
    research_questions: "research_questions_sport_v1.json",
    review_protocols: "review_protocols_sport_v1.json",
    study_registry: "study_registry_sport_v1.json",
    risk_of_bias: "risk_of_bias_sport_v1.json",
    evidence_syntheses: "evidence_syntheses_sport_v1.json",
    certainty_assessments: "certainty_assessments_sport_v1.json",
    claims: "claims_sport_canonical_v1.json",
    method_policy: "sport_scientific_method_policy_v1.json",
    validator: "../../../tools/validate-sport-scientific-pipeline-v2.mjs",
    report: "../../../reports/sport-scientific-pipeline-v2-validation.json"
  },
  counts: pipelineCounts,
  readiness: {
    theory_layer: "validated_v6",
    scientific_classification: "complete",
    protocol_schemas: "complete_but_unregistered",
    study_materialization: "not_started",
    result_level_bias: "not_started",
    syntheses: "planned_not_completed",
    certainty_assessments: "not_started",
    evidence_claim_publication: "blocked"
  },
  invariants: [
    "Alle 56 hooks klassifiseres nøyaktig én gang etter vitenskapelig spørsmålstype.",
    "Hver hook har ett primært forskningsspørsmål, én versjonert protokoll og én planlagt syntese.",
    "Studieresultater lagres separat fra studier og claims.",
    "Bias vurderes per relevant resultat av to uavhengige vurderere.",
    "Sikkerhet vurderes per synteseutfall eller normativ/historisk konklusjon, ikke per enkeltkilde.",
    "Ingen claim er publication_ready uten full kjede og godkjent sikkerhetsvurdering.",
    "Eksisterende claims er provisoriske til de er migrert."
  ]
};

qualityManifest.version = "6.1";
qualityManifest.updated_at = "2026-07-25";
qualityManifest.scientific_pipeline_v2 = {
  manifest: "sport_scientific_pipeline_manifest_v2.json",
  hook_classification: "hook_scientific_classification_sport_v1.json",
  research_questions: "research_questions_sport_v1.json",
  protocols: "review_protocols_sport_v1.json",
  studies: "study_registry_sport_v1.json",
  risk_of_bias: "risk_of_bias_sport_v1.json",
  syntheses: "evidence_syntheses_sport_v1.json",
  certainty: "certainty_assessments_sport_v1.json",
  validator: "../../../tools/validate-sport-scientific-pipeline-v2.mjs",
  counts: pipelineCounts
};
qualityManifest.production_invariants = unique([...(qualityManifest.production_invariants || []), "Ny eller endret vitenskapelig Sport-tekst krever full V2-kjede fra forskningsspørsmål til sikkerhetsvurdering.", "Legacy-claims er provisoriske og kan ikke gi ny publication_ready-status uten syntese."]);

evidenceManifest.version = "2.0";
evidenceManifest.status = "scientific_pipeline_infrastructure_ready_partial_evidence";
evidenceManifest.updated_at = "2026-07-25";
evidenceManifest.files.scientific_pipeline_manifest = "sport_scientific_pipeline_manifest_v2.json";
evidenceManifest.files.hook_classification = "hook_scientific_classification_sport_v1.json";
evidenceManifest.files.research_questions = "research_questions_sport_v1.json";
evidenceManifest.files.review_protocols = "review_protocols_sport_v1.json";
evidenceManifest.files.study_registry = "study_registry_sport_v1.json";
evidenceManifest.files.risk_of_bias = "risk_of_bias_sport_v1.json";
evidenceManifest.files.evidence_syntheses = "evidence_syntheses_sport_v1.json";
evidenceManifest.files.certainty_assessments = "certainty_assessments_sport_v1.json";
evidenceManifest.counts = { ...(evidenceManifest.counts || {}), ...pipelineCounts };
evidenceManifest.coverage_status = {
  ...(evidenceManifest.coverage_status || {}),
  state: "partial_pipeline_v2",
  classified_hooks: classifications.length,
  completed_syntheses: 0,
  publication_ready_claims: 0,
  rule: "Klassifisering og protokollstruktur er komplett, men vitenskapelig dekning krever materialiserte studier, biasvurderinger, synteser og sikkerhetsvurderinger."
};

const classificationFile = {
  version: "1.0",
  subject_id: "sport",
  type: "hook_scientific_classification",
  status: "canonical_pipeline_v2",
  updated_at: "2026-07-25",
  tracks: Object.entries(trackDefinitions).map(([track_id, value]) => ({ track_id, ...value })),
  classifications
};
const questionFile = { version: "1.0", subject_id: "sport", type: "research_question_registry", status: "planned_questions_not_answered", updated_at: "2026-07-25", research_questions: researchQuestions };
const protocolFile = { version: "1.0", subject_id: "sport", type: "review_protocol_registry", status: "protocols_planned_not_registered", updated_at: "2026-07-25", protocols };
const synthesisFile = { version: "1.0", subject_id: "sport", type: "evidence_synthesis_registry", status: "synthesis_shells_planned_not_completed", updated_at: "2026-07-25", syntheses };

const initialReport = {
  status: "generated_pending_independent_validation",
  version: "2.0",
  subject_id: "sport",
  counts: pipelineCounts,
  warnings: ["Ingen studier eller resultater er materialisert.", "Ingen resultatspesifikke biasvurderinger er utført.", "Ingen synteser eller sikkerhetsvurderinger er fullført.", "Alle eksisterende claims er provisoriske legacy-claims."],
  failures: []
};
const reportMd = `# Sport & lek – vitenskapelig pipeline V2\n\n## Status\n\nInfrastrukturen og klassifiseringen er bygget. Evidensmaterialiseringen er **ikke ferdig**.\n\n## Omfang\n\n- ${classifications.length} av ${hooks.length} hooks klassifisert\n- ${researchQuestions.length} forskningsspørsmål\n- ${protocols.length} planlagte protokoller\n- 0 registrerte protokoller\n- 0 materialiserte studier og resultater\n- 0 resultatspesifikke biasvurderinger\n- 0 fullførte synteser\n- 0 sikkerhetsvurderinger\n- 0 publication-ready claims\n- ${claims.length} provisoriske legacy-claims\n\n## Publiseringsregel\n\nNytt eller endret vitenskapelig innhold blokkeres uten full kjede: hook → teorienhet → forskningsspørsmål → registrert protokoll → studieresultat → biasvurdering → syntese → sikkerhetsvurdering → claim.\n`;

await Promise.all([
  writeJson(paths.classification, classificationFile),
  writeJson(paths.questions, questionFile),
  writeJson(paths.protocols, protocolFile),
  writeJson(paths.studies, studyRegistry),
  writeJson(paths.bias, riskOfBias),
  writeJson(paths.syntheses, synthesisFile),
  writeJson(paths.certainty, certaintyRegistry),
  writeJson(paths.pipelineManifest, pipelineManifest),
  writeJson(paths.claims, claimFile),
  writeJson(paths.evidenceManifest, evidenceManifest),
  writeJson(paths.methodPolicy, methodPolicy),
  writeJson(paths.qualityManifest, qualityManifest),
  writeJson(paths.quizProfile, quizProfile),
  writeJson(paths.reportJson, initialReport)
]);
await mkdir(path.dirname(path.resolve(root, paths.reportMd)), { recursive: true });
await writeFile(path.resolve(root, paths.reportMd), reportMd, "utf8");

console.log(JSON.stringify(initialReport, null, 2));
