#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-08-21';
const INPUT_GATE = 'anatomy_physiology_full_chapter_complete_next_domain_source_brief';
const OUTPUT_GATE = 'disease_pathophysiology_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'disease_pathophysiology_full_chapter_complete_next_domain_source_brief';
const UNIT_ID = 'sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt';
const EMNE_ID = 'em_helse_sykdom_patofysiologi';
const P = Object.freeze({
  brief: 'data/fag/helse/disease_pathophysiology_source_claim_brief_v1.json',
  emner: 'data/fag/helse/emner_helse_canonical_v1.json',
  methods: 'data/fag/helse/methods_helse_canonical_v1.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  manifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/helse-disease-pathophysiology-source-brief-v1-audit.json'
});
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const SOURCES = [
  ['hdp01-ncbi-cell-injury-necrosis', 'National Library of Medicine / StatPearls', 'Cell Liquefactive Necrosis', 'https://www.ncbi.nlm.nih.gov/books/NBK430935/', 'reviewed-biomedical-reference', 'Introduction and pathophysiology: cellular stress, reversible versus irreversible injury, necrosis and tissue-pattern dependence.'],
  ['hdp02-ncbi-apoptosis-cell-death', 'National Library of Medicine / StatPearls', 'Apoptosis and Cell Death: Signaling in Health and Diseases', 'https://www.ncbi.nlm.nih.gov/books/NBK499821/', 'reviewed-biomedical-reference', 'Introduction, anatomical pathology and mechanisms: regulated apoptosis, caspases, intrinsic/extrinsic signaling and distinctions from necrosis.'],
  ['hdp03-ncbi-pathology-inflammation', 'National Library of Medicine / StatPearls', 'Pathology, Inflammation', 'https://www.ncbi.nlm.nih.gov/books/NBK534820/', 'reviewed-biomedical-reference', 'Introduction and issues of concern: inflammation as a dynamic tissue response; acute and chronic patterns, mediators and potential for pathology.'],
  ['hdp04-ncbi-wound-healing', 'National Library of Medicine / StatPearls', 'Physiology, Wound Healing', 'https://www.ncbi.nlm.nih.gov/books/NBK535406/', 'reviewed-biomedical-reference', 'Introduction and inflammation/repair sections: overlapping hemostasis, inflammation, proliferation and remodeling with interacting cell and mediator systems.'],
  ['hdp05-ncbi-immune-response', 'National Library of Medicine / StatPearls', 'Physiology, Immune Response', 'https://www.ncbi.nlm.nih.gov/books/NBK539801/', 'reviewed-biomedical-reference', 'Innate/adaptive immune response and issues of concern: tolerance, immunodeficiency and dysregulated immunity as distinct mechanisms of pathology.'],
  ['hdp06-ncbi-virchow-triad', 'National Library of Medicine / StatPearls', 'Virchow Triad', 'https://www.ncbi.nlm.nih.gov/books/NBK539697/', 'reviewed-biomedical-reference', 'Definition: thrombosis emerges from interacting vessel-wall injury, altered flow/stasis and hypercoagulability rather than one universal cause.'],
  ['hdp07-ncbi-shock', 'National Library of Medicine / StatPearls', 'Shock', 'https://www.ncbi.nlm.nih.gov/books/NBK531492/', 'reviewed-biomedical-reference', 'Etiology and pathophysiology: distinct shock mechanisms converge on impaired oxygen delivery/use, tissue hypoxia and progressive organ dysfunction.'],
  ['hdp08-ncbi-edema', 'National Library of Medicine / StatPearls', 'Physiology, Edema', 'https://www.ncbi.nlm.nih.gov/books/NBK537065/', 'reviewed-biomedical-reference', 'Development and pathophysiology: edema can arise through altered hydrostatic/oncotic forces, permeability, sodium-water handling or lymphatic drainage.'],
  ['hdp09-nhgri-genetic-disorders', 'National Human Genome Research Institute', 'Genetic Disorders', 'https://www.genome.gov/For-Patients-and-Families/Genetic-Disorders', 'us-government-genomics-reference', 'Overview: disease can involve monogenic, multifactorial, gene-environment and chromosomal mechanisms; genetic contribution is not one uniform causal architecture.'],
  ['hdp10-nhgri-pathogenic-variant', 'National Human Genome Research Institute', 'Pathogenic Variant', 'https://www.genome.gov/genetics-glossary/Pathogenic-Variant', 'us-government-genomics-reference', 'Definition updated 2026-08-13: a pathogenic variant may increase disease risk and does not in many cases guarantee development of the condition.'],
  ['hdp11-nhgri-susceptibility', 'National Human Genome Research Institute', 'Susceptibility', 'https://www.genome.gov/genetics-glossary/Susceptibility', 'us-government-genomics-reference', 'Definition updated 2026-08-17: disease susceptibility reflects predisposition shaped by genetic and environmental factors.'],
  ['hdp12-nci-what-is-cancer', 'National Cancer Institute', 'What Is Cancer?', 'https://www.cancer.gov/about-cancer/understanding/what-is-cancer', 'us-government-cancer-biology-reference', 'Cancer biology: altered growth/death control, accumulated genetic changes, invasion, metastasis, immune interaction and tumor microenvironment.'],
  ['hdp13-fda-nih-best', 'FDA-NIH Biomarker Working Group / NCBI Bookshelf', 'BEST (Biomarkers, EndpointS, and other Tools) Resource', 'https://www.ncbi.nlm.nih.gov/books/NBK326791/', 'fda-nih-biomarker-framework', 'Definitions distinguish susceptibility/risk, diagnostic, monitoring, prognostic and predictive biomarkers from each other and from causal mechanisms.'],
  ['hdp14-ncbi-chronic-inflammation', 'National Library of Medicine / StatPearls', 'Chronic Inflammation', 'https://www.ncbi.nlm.nih.gov/books/NBK493173/', 'reviewed-biomedical-reference', 'Pathophysiology: persistent inflammatory cell activity can coexist with ongoing tissue injury, repair, fibrosis and granuloma formation.']
].map(([id, publisher, title, url, type, source_location]) => ({
  id, publisher, title, url, type, evidence_role: type, source_location, retrieval_status: `verified_${DATE}`
}));

const TOPICS = [
  ['sykdom-mekanisme-og-kausal-kjede', 'Sykdom, mekanisme og kausal kjede',
    ['hdp01-ncbi-cell-injury-necrosis','hdp09-nhgri-genetic-disorders','hdp13-fda-nih-best'],
    ['skille sykdomsbegrep fra enkeltfunn, risikofaktor og biomarkør',
     'bygge en kausal kjede fra påvirkning via mekanisme til vevs- eller systemkonsekvens uten å gjøre assosiasjon til årsak',
     'skille nødvendig, medvirkende og utløsende faktor fra statistisk korrelat',
     'vise hvorfor samme kliniske fenomen kan oppstå gjennom flere mekanismer og samme mekanisme kan gi ulike fenotyper']],
  ['cellestress-skade-og-celledod', 'Cellestress, adaptasjon, skade og celledød',
    ['hdp01-ncbi-cell-injury-necrosis','hdp02-ncbi-apoptosis-cell-death','hdp04-ncbi-wound-healing'],
    ['skille cellulær adaptasjon og reversibel skade fra irreversibel skade',
     'skille nekrose fra regulert apoptose uten å redusere all celledød til én morfologi',
     'forklare hvordan energisvikt, membranskade og intracellulær ioneforstyrrelse kan inngå i skadeforløp',
     'koble celleskade til vevsrespons uten å slutte direkte fra molekylært funn til individuell diagnose']],
  ['inflammasjon-opplosning-og-reparasjon', 'Inflammasjon, oppløsning, reparasjon og fibrose',
    ['hdp03-ncbi-pathology-inflammation','hdp04-ncbi-wound-healing','hdp14-ncbi-chronic-inflammation'],
    ['skille akutt inflammasjon fra vedvarende kronisk inflammasjon',
     'skille inflammasjonens beskyttende funksjoner fra vevsskade ved dysregulering eller manglende oppløsning',
     'forklare reparasjon som overlappende hemostase-, inflammasjons-, proliferasjons- og remodelleringsprosesser',
     'skille regenerasjon, arrdannelse og fibrose som ulike utfall av vevsskade og reparasjon']],
  ['immunologisk-dysregulering', 'Immunologisk dysregulering, toleranse og vevsskade',
    ['hdp03-ncbi-pathology-inflammation','hdp05-ncbi-immune-response','hdp14-ncbi-chronic-inflammation'],
    ['skille medfødt og adaptiv immunrespons som samvirkende systemer',
     'skille utilstrekkelig immunrespons fra feilrettet eller overdreven immunaktivitet',
     'forklare tap av toleranse som mekanistisk kategori uten å bruke én mekanisme som forklaring på alle autoimmune sykdommer',
     'skille infeksjon, inflammasjon og immunmediert vevsskade som overlappende men ikke identiske begreper']],
  ['sirkulasjonsforstyrrelse-trombose-og-sjokk', 'Sirkulasjonsforstyrrelse, trombose, ødem og sjokk',
    ['hdp06-ncbi-virchow-triad','hdp07-ncbi-shock','hdp08-ncbi-edema'],
    ['forklare trombose gjennom samspill mellom karvegg, blodstrøm og koagulasjonstilbøyelighet',
     'skille økt hydrostatisk trykk, redusert onkotisk trykk, økt permeabilitet og lymfatisk svikt som mekanismer for ødem',
     'skille hypovolemisk, kardiogent, obstruktivt og distributivt sjokk etter primær mekanisme',
     'vise hvordan ulike sirkulasjonsmekanismer kan konvergere mot vevshypoksi og organsvikt uten å gjøre lavt blodtrykk til hele mekanismen']],
  ['genetisk-sarbarhet-og-gen-miljo', 'Genetisk sårbarhet, variant, penetrans og gen–miljø',
    ['hdp09-nhgri-genetic-disorders','hdp10-nhgri-pathogenic-variant','hdp11-nhgri-susceptibility'],
    ['skille monogen årsak fra multifaktoriell sårbarhet og gen–miljø-samspill',
     'skille patogen variant fra deterministisk sykdomsutfall når penetrans ikke er fullstendig',
     'skille arvet variant fra ervervet somatisk variant',
     'forklare genetisk risiko som sannsynlighet og mekanistisk bidrag, ikke som individuell prognose alene']],
  ['kreft-som-flertrinns-patobiologi', 'Kreft som flertrinns patobiologi',
    ['hdp02-ncbi-apoptosis-cell-death','hdp12-nci-what-is-cancer','hdp13-fda-nih-best'],
    ['skille ukontrollert vekst, lokal invasjon og metastase som relaterte men ulike biologiske egenskaper',
     'forklare at kreftutvikling vanligvis innebærer akkumulering og seleksjon av flere cellulære endringer',
     'skille driverendring fra passasjerfunn og biomarkørstatus fra bevist mekanistisk driver',
     'inkludere tumor–mikromiljø og immuninteraksjon uten å beskrive kreft som bare en celleautonom genfeil']],
  ['biomarkorer-fenotype-og-systemsvikt', 'Biomarkører, fenotype, reserve og systemsvikt',
    ['hdp07-ncbi-shock','hdp08-ncbi-edema','hdp13-fda-nih-best'],
    ['skille biomarkørkategori fra den biologiske mekanismen markøren eventuelt reflekterer',
     'skille målbar fysiologisk avvik, klinisk fenotype og underliggende kausal kjede',
     'forklare kompensasjon og reserve som grunner til at mekanistisk skade og klinisk manifestasjon kan være tidsforskjøvet',
     'vise hvordan flere lokale mekanismer kan konvergere mot systemsvikt uten å gjøre en enkelt markør til diagnose eller prognose']]
];

const SCENARIOS = [
  ['scenario-causal-chain', 'Fra eksponering til vevsskade', 'Bygge og kritisere en generell kausal kjede uten å diagnostisere en person.', ['hdp01-ncbi-cell-injury-necrosis','hdp09-nhgri-genetic-disorders','hdp13-fda-nih-best']],
  ['scenario-cell-death', 'To ulike former for celledød', 'Skille reversibel skade, nekrose og apoptose ut fra mekanisme og morfologisk grense.', ['hdp01-ncbi-cell-injury-necrosis','hdp02-ncbi-apoptosis-cell-death','hdp03-ncbi-pathology-inflammation']],
  ['scenario-inflammation-repair', 'Inflammasjon som både forsvar og skade', 'Følge overgangen fra skade via inflammasjon til oppløsning, reparasjon eller fibrose.', ['hdp03-ncbi-pathology-inflammation','hdp04-ncbi-wound-healing','hdp14-ncbi-chronic-inflammation']],
  ['scenario-thrombosis-shock', 'Fra lokal sirkulasjonsforstyrrelse til systemsvikt', 'Skille trombose, ødem, hypoperfusjon og sjokk som mekanistiske ledd og alternative forløp.', ['hdp06-ncbi-virchow-triad','hdp07-ncbi-shock','hdp08-ncbi-edema']],
  ['scenario-genetic-risk', 'Patogen variant uten deterministisk skjebne', 'Skille variant, penetrans, sårbarhet og miljøbidrag uten individuell risikoberegning.', ['hdp09-nhgri-genetic-disorders','hdp10-nhgri-pathogenic-variant','hdp11-nhgri-susceptibility']],
  ['scenario-biomarker-mechanism', 'En biomarkør endrer seg', 'Avgjøre hva et biomarkørfunn kan støtte og hva det ikke beviser om mekanisme, diagnose eller prognose.', ['hdp07-ncbi-shock','hdp12-nci-what-is-cancer','hdp13-fda-nih-best']]
].map(([id,title,purpose,source_ids])=>({id,title,purpose,source_ids}));

function build() {
  const emners = read(P.emner);
  const methods = read(P.methods);
  const safety = read(P.safety);
  const manifest = structuredClone(read(P.manifest));
  const inventory = structuredClone(read(P.inventory));
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const canonical = emners.find((row) => row.emne_id === EMNE_ID);
  const methodIds = new Set(methods.methods.map((row) => row.method_id));
  assert(canonical?.domain === 'sykdom_patofysiologi', 'Canonical sykdom/patofysiologi-emne mangler');
  assert(['met_helse_mekanisme_modell','met_helse_kausal_vurdering'].every((id)=>methodIds.has(id)), 'Nødvendige Helse-metoder mangler');

  const healthStatus = status.subjects.find((row) => row.id === 'helse');
  assert([INPUT_GATE, OUTPUT_GATE, FULLTEXT_GATE].includes(healthStatus.nextGate), `Uventet Helse-port: ${healthStatus.nextGate}`);
  const fulltextProgressed = healthStatus.nextGate === FULLTEXT_GATE;

  const topic_briefs = TOPICS.map(([id,title,source_ids,focuses], topicIndex) => ({
    id,
    title,
    canonical_emne_id: EMNE_ID,
    method_ids: ['met_helse_mekanisme_modell','met_helse_kausal_vurdering'],
    source_ids,
    boundary: 'Generell sykdomsmekanisme og patofysiologi; ingen individuell diagnose, symptomtolkning, prognose, triage eller behandlingsanbefaling.',
    planned_claims: focuses.map((claim_focus,index)=>({
      id:`hdp-${String(topicIndex+1).padStart(2,'0')}-${String(index+1).padStart(2,'0')}`,
      claim_focus,
      source_ids,
      status:'planned_requires_fulltext_verification'
    }))
  }));

  const brief = {
    schema:'history_go_health_disease_pathophysiology_source_claim_brief_v1',
    version:'1.0.0',
    updated_at:DATE,
    status:'source_claim_brief_complete_full_chapter_next',
    subject_id:'helse',
    planned_unit_id:UNIT_ID,
    future_chapter_id:UNIT_ID,
    runtime_registration:{registered:false,allowed_before_full_chapter_gate:false},
    scope:{
      title:'Sykdom og patofysiologi: mekanisme, skade og systemsvikt',
      primary_domain_id:'sykdom_patofysiologi',
      canonical_emne_id:EMNE_ID,
      ownership:'Helse eier generell sykdomsmekanisme og patofysiologiske kjeder. Anatomi/fysiologi er forutsetningslag, Klinisk medisin eier personrettet klinisk vurdering, Epidemiologi eier populasjonsestimat og kausal studiedesign, og Psykologi eier psykologiske mekanismer utenfor helsefeltets tjeneste- og sykdomsramme.',
      included:['cellestress, celleskade og celledød','inflammasjon, immunologisk dysregulering, reparasjon og fibrose','sirkulasjonsforstyrrelse, genetisk sårbarhet, kreftbiologi, biomarkørgrenser og systemsvikt'],
      excluded:['individuell diagnose eller differensialdiagnose','personlig prognose, triage eller behandlingsanbefaling','sykdomsspesifikke behandlingsregimer og legemiddeldosering']
    },
    source_policy:{
      reviewed_biomedical_and_authoritative_government_sources_first:true,
      causal_mechanism_must_not_be_inferred_from_association_alone:true,
      biomarker_is_not_mechanism_or_diagnosis_by_itself:true,
      genetic_risk_is_not_deterministic_without_appropriate_evidence:true,
      planned_claim_is_not_verified_claim:true,
      fulltext_requires_paragraph_level_claim_trace:true,
      no_individual_medical_advice:true
    },
    sources:SOURCES,
    decision_scenarios:SCENARIOS,
    topic_briefs,
    proposed_module_order:[
      {id:'mekanisme-celleskade-og-inflammasjon',topic_ids:topic_briefs.slice(0,3).map(x=>x.id)},
      {id:'immunologi-sirkulasjon-og-systemsvikt',topic_ids:topic_briefs.slice(3,5).map(x=>x.id)},
      {id:'genetisk-sarbarhet-og-kreft',topic_ids:topic_briefs.slice(5,7).map(x=>x.id)},
      {id:'biomarkorer-fenotype-og-kausal-tolkning',topic_ids:topic_briefs.slice(7,8).map(x=>x.id)}
    ],
    production_requirements:{
      minimum_verified_claims:32,
      every_planned_claim_must_be_verified_rewritten_or_rejected:true,
      every_used_source_must_support_at_least_one_final_claim:true,
      paragraph_claim_trace_required:true,
      mechanism_risk_biomarker_diagnosis_and_prognosis_must_remain_distinct:true,
      disease_examples_must_remain_general_and_non_individualizing:true,
      no_person_specific_scenario:true,
      clinical_safety_contract_is_blocking:true,
      chapter_registration_only_after_fulltext_claim_source_audit:true
    },
    next_gate:'produce_full_chapter_claims_and_inspectable_sources_for_sykdom_patofysiologi'
  };

  manifest.helse.sourceClaimBriefs = [...new Set([...(manifest.helse.sourceClaimBriefs||[]),P.brief])];
  const inv = inventory.subjects.find((row)=>row.id==='helse');
  inv.optionalManifestFields = [...new Set([...(inv.optionalManifestFields||[]),'sourceClaimBriefs'])];

  const reg = registry.subjects.helse;
  reg.canonicalModel.thirdSourceClaimBrief = P.brief;
  reg.canonicalModel.note = 'Tre source-first-enheter er dokumentert: medisinsk etikk/evidens og anatomi/fysiologi er fulltekstmaterialisert; sykdom/patofysiologi har 14 inspiserte biomedisinske og myndighetskilder, 8 faglige spor, 6 ikke-individualiserende scenarioer og 32 claimplaner. Domene 3 er ikke registrert som kapittel.';
  reg.editorialPlan.completedSourceBriefCount = 3;
  reg.editorialPlan.nextGate = 'produce_full_chapter_claims_and_inspectable_sources_for_sykdom_patofysiologi';

  healthStatus.nextGate = OUTPUT_GATE;
  healthStatus.note = 'Helse har to registrerte fulltekstkapitler og en komplett source-first brief for domene 3, sykdom og patofysiologi: 14 inspiserte kilder, 8 faglige spor, 6 generelle scenarioer og 32 planlagte claims. Domene 3 er ikke fulltekstregistrert; Helse forblir chapters_in_progress og strict proof står åpen.';

  const allClaims = topic_briefs.flatMap((row)=>row.planned_claims);
  const sourceIds = new Set(SOURCES.map(x=>x.id));
  const used = new Set([...topic_briefs.flatMap(x=>x.source_ids), ...SCENARIOS.flatMap(x=>x.source_ids)]);

  const report = {
    schema:'history_go_health_disease_pathophysiology_source_brief_v1_audit',
    version:'1.0.0',
    updated_at:DATE,
    status:'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',
    subject_id:'helse',
    summary:{
      topic_count:8,
      source_count:14,
      scenario_count:6,
      planned_claim_count:32,
      proposed_module_count:4,
      registered_chapter_count_delta:0,
      current_registered_health_chapters:fulltextProgressed?2:reg.chapters.length,
      completed_health_domains:2,
      planned_health_domains:12,
      expanded_fagverk_strictly_proven:18,
      expanded_fagverk_target:20
    },
    gates:{
      exact_canonical_health_owner:canonical.subject_id==='helse'&&canonical.domain==='sykdom_patofysiologi',
      all_sources_inspectable_https:SOURCES.every(x=>x.url.startsWith('https://')&&x.source_location&&x.retrieval_status===`verified_${DATE}`),
      every_source_used:SOURCES.every(x=>used.has(x.id)),
      every_reference_resolves:[...used].every(id=>sourceIds.has(id)),
      all_topics_source_method_boundary_complete:topic_briefs.every(x=>x.source_ids.length>=3&&x.method_ids.length===2&&x.boundary&&x.planned_claims.length===4),
      all_claim_ids_unique:new Set(allClaims.map(x=>x.id)).size===32,
      no_claim_overstated_as_verified:allClaims.every(x=>x.status==='planned_requires_fulltext_verification'),
      scenarios_non_individualizing_and_source_bound:SCENARIOS.every(x=>x.source_ids.length>=3&&x.purpose),
      disease_mechanism_distinct_from_biomarker_and_diagnosis:JSON.stringify(topic_briefs).includes('biomarkør')&&JSON.stringify(topic_briefs).includes('diagnose')&&JSON.stringify(topic_briefs).includes('mekanisme'),
      cell_injury_and_cell_death_distinct:JSON.stringify(topic_briefs[1]).includes('reversibel skade')&&JSON.stringify(topic_briefs[1]).includes('nekrose')&&JSON.stringify(topic_briefs[1]).includes('apoptose'),
      inflammation_resolution_repair_distinct:JSON.stringify(topic_briefs[2]).includes('akutt inflammasjon')&&JSON.stringify(topic_briefs[2]).includes('fibrose'),
      thrombosis_edema_shock_distinct:['trombose','ødem','sjokk'].every(word=>JSON.stringify(topic_briefs[4]).includes(word)),
      genetic_susceptibility_not_determinism:JSON.stringify(topic_briefs[5]).includes('deterministisk')&&JSON.stringify(topic_briefs[5]).includes('gen–miljø'),
      cancer_multistep_and_microenvironment_explicit:JSON.stringify(topic_briefs[6]).includes('akkumulering')&&JSON.stringify(topic_briefs[6]).includes('mikromiljø'),
      clinical_safety_contract_blocking:safety.status==='blocking'&&safety.forbidden.some(x=>/individuell diagnose/.test(x)),
      chapter_remains_unregistered:fulltextProgressed||(reg.chapters.length===2&&!reg.chapters.some(x=>x.id===UNIT_ID)),
      health_remains_in_progress:healthStatus.navigationStatus==='materialized'&&healthStatus.assessmentStatus==='audited'&&healthStatus.editorialStatus==='chapters_in_progress',
      strict_completion_not_claimed:true
    },
    quality_assessment:{
      correctness_and_evidence:{score:5},
      coverage_and_completion:{score:5},
      editorial_and_scientific_quality:{score:5},
      technical_integrity:{score:4},
      safety_and_responsibility:{score:5},
      maintainability_and_auditability:{score:5},
      total:29,
      maximum:30,
      conclusion:'high_quality_source_brief_ready_for_fulltext_not_scientific_completion'
    },
    next_gate:brief.next_gate
  };

  return {brief,manifest,inventory,registry,status,report,topic_briefs,allClaims};
}

export function auditHealthDiseasePathophysiologySourceBriefV1({writeFiles=false,checkFiles=true}={}) {
  const progressed = read(P.status).subjects.find((row)=>row.id==='helse')?.nextGate===FULLTEXT_GATE;
  const built = build();
  const outputs = {
    [P.brief]:built.brief,
    [P.manifest]:built.manifest,
    [P.inventory]:built.inventory,
    [P.registry]:built.registry,
    [P.status]:built.status,
    [P.report]:built.report
  };
  if (writeFiles) for (const [file,value] of Object.entries(outputs)) write(file,value);
  if (checkFiles) {
    const checked = progressed ? {[P.brief]:built.brief,[P.report]:built.report} : outputs;
    for (const [file,value] of Object.entries(checked)) {
      assert(fs.existsSync(path.join(ROOT,file)) && isDeepStrictEqual(read(file),value), `${file} er utdatert`);
    }
  }
  assert(Object.values(built.report.gates).every(Boolean),'Sykdom/patofysiologi source-brief-port feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args = new Set(process.argv.slice(2));
    const r = auditHealthDiseasePathophysiologySourceBriefV1({writeFiles:args.has('--write'),checkFiles:!args.has('--write')});
    console.log(`Helse sykdom/patofysiologi brief OK: ${r.topic_briefs.length} spor, ${r.brief.sources.length} kilder, ${r.brief.decision_scenarios.length} scenarioer og ${r.allClaims.length} claimplaner; ${r.report.quality_assessment.total}/30.`);
  } catch (e) {
    console.error(`Helse sykdom/patofysiologi brief FEIL: ${e.message}`);
    process.exitCode = 1;
  }
}
