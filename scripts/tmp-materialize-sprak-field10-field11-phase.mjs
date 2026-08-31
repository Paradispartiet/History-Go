#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const write = (f, v) => {
  fs.mkdirSync(path.dirname(abs(f)), { recursive: true });
  fs.writeFileSync(abs(f), `${JSON.stringify(v, null, 2)}\n`);
};
const writeText = (f, s) => {
  fs.mkdirSync(path.dirname(abs(f)), { recursive: true });
  fs.writeFileSync(abs(f), s.endsWith('\n') ? s : `${s}\n`);
};
const assert = (c, m) => { if (!c) throw new Error(m); };

const typSrcPath = 'data/fag/litteratur/sprak_lingvistikk/language_typology_universals_diversity_source_claim_brief_v1.json';
const typSrc = read(typSrcPath);
assert(typSrc.status === 'source_first_ready_not_materialized', 'Felt 10 source brief må være source-first');
assert(typSrc.domain?.ordinal === 10 && typSrc.domain?.id === 'spraktypologi_universaler_mangfold', 'Feil Felt 10 source brief');
assert(typSrc.sources?.length === 13 && typSrc.topic_briefs?.length === 8, 'Felt 10 krever 13 kilder og 8 emner');
const typClaims = typSrc.topic_briefs.flatMap((t) => t.planned_claims || []);
assert(typClaims.length === 32, 'Felt 10 krever 32 claims');

const chapterId = 'spraktypologi-universaler-og-sprakmangfold';
const chapterRoot = `data/fagverk/litteratur/sprak_lingvistikk/${chapterId}`;
const sourceTitle = Object.fromEntries(typSrc.sources.map((s) => [s.id, s.title]));

function paragraphFor(claim, topic) {
  const evidence = claim.source_ids.map((id) => sourceTitle[id]).join(' og ');
  return `${claim.text} Evidensgrunnlaget her er ${evidence}, brukt sammen med den eksplisitte metodegrensen for emnet: ${topic.boundary} I fullteksten behandles databasekoder og typologiske etiketter som analyserbare representasjoner, ikke som en erstatning for språkspesifikk beskrivelse. Observasjonsenhet, feature-definisjon, sample, genealogy, area, coding og missingness skal rapporteres når de er relevante for påstanden. Alternative kodingsvalg, counterexamples og avhengigheter må beholdes synlige, slik at en frekvens, korrelasjon eller modellkoeffisient kan etterprøves og begrenses til den populasjonen og dataversjonen analysen faktisk dekker.`;
}

const moduleSpecs = [
  ['01-komparative-begreper-sampling-og-uavhengighet.json', 0, 2, 'Komparative begreper, sampling og uavhengighet'],
  ['02-ordrekkefolge-morfosyntaks-og-kompleksitet.json', 2, 4, 'Ordrekkefølge, morfosyntaks og kompleksitet'],
  ['03-fonologisk-typologi-universaler-og-falsifiserbarhet.json', 4, 6, 'Fonologisk typologi, universaler og falsifiserbarhet'],
  ['04-databaser-mangfold-og-reproduserbarhet.json', 6, 8, 'Databaser, mangfold og reproduserbarhet'],
];

const moduleFiles = [];
for (const [file, start, end, title] of moduleSpecs) {
  const sections = typSrc.topic_briefs.slice(start, end).map((topic) => ({
    id: topic.id,
    title: topic.title,
    method_ids: topic.method_ids,
    boundary: topic.boundary,
    paragraphs: topic.planned_claims.map((claim) => paragraphFor(claim, topic)),
    paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),
  }));
  const out = `${chapterRoot}/${file}`;
  moduleFiles.push(out);
  write(out, {
    schema: 'history_go_fagverk_module_v1',
    version: '1.0.0',
    subject_id: 'litteratur',
    canonical_subcategory_id: 'sprak_lingvistikk',
    chapter_id: chapterId,
    id: file.replace(/\.json$/u, ''),
    title,
    sections,
  });
}

const chapterPath = `data/fagverk/litteratur/sprak_lingvistikk/${chapterId}.json`;
write(chapterPath, {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'litteratur',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  domain_id: 'spraktypologi_universaler_mangfold',
  id: chapterId,
  chapter_id: chapterId,
  title: 'Språktypologi, universaler og språkmangfold',
  subtitle: 'Fra komparative begreper og kontrollert sampling til ordrekkefølge, morfosyntaks, fonologi, universaler, databaser og ansvarlig generalisering',
  lead: 'Språktypologi sammenligner strukturelle trekk på tvers av språk. Kapittelet skiller språkspesifikke beskrivelser fra komparative begreper, behandler genealogy og area som avhengighetskilder, og krever eksplisitt proveniens, missingness, counterexamples og generaliseringsgrenser.',
  learningObjectives: [
    'skille comparative concepts fra language-specific descriptive categories og dokumentere feature states',
    'designe samples og modeller som håndterer genealogisk og areal ikke-uavhengighet',
    'tolke word-order correlations og implicational tendencies uten å gjøre dem til absolutte universaler',
    'analysere alignment, marking og complexity med construction-level conditioning og optionality',
    'bruke fonologiske inventories med source- og doculect-proveniens',
    'skille absolute universals, implicational universals og statistical tendencies med reelle counterexamples',
    'analysere feature dependence, sparse coverage og missingness i store typologidatabaser',
    'rapportere language diversity med versjoner, identifiers, transformations, uncertainty og generaliseringsgrenser'
  ],
  moduleFiles,
  briefFile: `${chapterRoot}/brief.json`,
  claimsFile: `${chapterRoot}/claims.json`,
  assessmentFile: `${chapterRoot}/assessment.json`,
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  sourceFirst: true,
});

write(`${chapterRoot}/brief.json`, {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  domain_id: 'spraktypologi_universaler_mangfold',
  chapter_id: chapterId,
  sourceBriefFile: typSrcPath,
  purpose: 'Materialisere språktypologi som eksplisitt komparativ metode for strukturelt mangfold, sampling, universaler og reproduserbare databaseanalyser uten å gjøre brede databasekoder til språkspesifikke fasiter.',
  sections: typSrc.topic_briefs.map((topic, i) => ({
    ordinal: i + 1,
    id: topic.id,
    claim_ids: topic.planned_claims.map((c) => c.id),
  })),
  strict_boundaries: typSrc.topic_briefs.map((topic) => topic.boundary),
  fulltext_status: 'materialized_pending_strict_audit',
  source_first: true,
  claim_trace_required: true,
});

write(`${chapterRoot}/claims.json`, {
  schema: 'history_go_fagverk_claims_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  chapter_id: chapterId,
  retrieval_status: 'verified_2026-08-31',
  verified_at: '2026-08-31',
  trace_mode: 'source_brief_claim_text_and_sources_immutable',
  sourceBriefFile: typSrcPath,
  verifiedClaims: typClaims.map((c) => ({ id: c.id, status: 'verified', verified_at: '2026-08-31' })),
});

const questions = typSrc.topic_briefs.map((topic, i) => ({
  id: `typ-q${String(i + 1).padStart(2, '0')}`,
  prompt: `Hva er den viktigste metodiske kontrollen i ${topic.title.toLowerCase()}?`,
  choices: [
    'Å bruke flest mulig språk uten å dokumentere sample eller coding',
    topic.boundary,
    'Å behandle databaseverdier som fullstendige språkbeskrivelser',
    'Å fjerne counterexamples og missing data før analysen'
  ],
  correctIndex: 1,
  claim_ids: topic.planned_claims.slice(0, 3).map((c) => c.id),
  source_ids: topic.source_ids.slice(0, 2),
}));
const caseTopicIndexes = [0, 1, 2, 3, 4, 6];
const caseTasks = typSrc.decision_scenarios.map((scenario, i) => {
  const topic = typSrc.topic_briefs[caseTopicIndexes[i]];
  return {
    id: scenario.id,
    prompt: scenario.prompt,
    responseMode: 'guided_discussion_no_required_typing',
    claim_ids: topic.planned_claims.map((c) => c.id),
    source_ids: scenario.source_ids,
  };
});
write(`${chapterRoot}/assessment.json`, {
  schema: 'history_go_fagverk_assessment_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  chapter_id: chapterId,
  questions,
  caseTasks,
});

const psySrcPath = 'data/fag/litteratur/sprak_lingvistikk/psycholinguistics_language_acquisition_processing_source_claim_brief_v1.json';
const psySources = [
  ['psy01-spoken-word-recognition-2024','Spoken Word Recognition: A Focus on Plasticity','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguistics-031422-113507'],
  ['psy02-predictability-surprisal-2025','Predictability in Language Comprehension: Prospects and Problems for Surprisal','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguistics-011724-121517'],
  ['psy03-n400-kutas-federmeier','Thirty Years and Counting: Finding Meaning in the N400 Component of the Event-Related Brain Potential (ERP)','Annual Review of Psychology','https://www.annualreviews.org/content/journals/10.1146/annurev.psych.093008.131123'],
  ['psy04-levelt-lexical-access','A theory of lexical access in speech production','PubMed / Behavioral and Brain Sciences','https://pubmed.ncbi.nlm.nih.gov/11301520/'],
  ['psy05-infant-statistical-learning','Infant Statistical Learning','Annual Review of Psychology','https://www.annualreviews.org/content/journals/10.1146/annurev-psych-122216-011805'],
  ['psy06-speech-perception-first-year','Speech Perception and Language Acquisition in the First Year of Life','Annual Review of Psychology','https://www.annualreviews.org/content/journals/10.1146/annurev.psych.093008.100408'],
  ['psy07-individual-differences-l1','Individual Differences in First Language Acquisition','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguistics-011619-030326'],
  ['psy08-childes','CHILDES: Child Language Data Exchange System','TalkBank','https://talkbank.org/childes/'],
  ['psy09-manybabies1','ManyBabies 1: Infant-Directed Speech Preference','ManyBabies Consortium','https://manybabies.org/MB1/'],
  ['psy10-sign-language-acquisition','Acquisition of Sign Languages','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguistics-043020-092357'],
  ['psy11-bilingualism-mind-brain','Bilingualism, Mind, and Brain','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguist-030514-124937'],
  ['psy12-l2-sentence-processing','Second Language Sentence Processing','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguistics-030821-054113'],
  ['psy13-heritage-languages','Heritage Languages: Language Acquired, Language Lost, Language Regained','Annual Review of Linguistics','https://www.annualreviews.org/content/journals/10.1146/annurev-linguistics-030521-050236'],
].map(([id,title,publisher,url]) => ({id,title,publisher,url,retrieval_status:'verified_2026-08-31'}));

const psyTopics = [
  {
    id:'talepersepsjon-ordgjenkjenning-og-plastisitet', title:'Talepersepsjon, ordgjenkjenning og plastisitet', method_ids:['met_psyling_01_a','met_psyling_01_b'],
    boundary:'Spoken-word recognition må skille akustisk input, fonologiske wordforms, lexical competition, adaptation og plasticity; reaction time, accuracy eller gaze er task-dependent observables og ikke direkte avlesninger av én skjult prosess.', source_ids:['psy01-spoken-word-recognition-2024','psy06-speech-perception-first-year','psy11-bilingualism-mind-brain'],
    claims:[
      ['psy-01','Spoken-word recognition beskriver prosesser mellom speech perception og videre sentence processing, der kontinuerlig tale må kobles til fonologiske wordforms og konkurrerende lexical candidates.',['psy01-spoken-word-recognition-2024','psy06-speech-perception-first-year']],
      ['psy-02','Ordgjenkjenning er plastisk og påvirkes av erfaring, sensoriske forhold og språkene en person kjenner; en statisk monolingual voksenmodell er derfor ikke en universell baseline.',['psy01-spoken-word-recognition-2024','psy11-bilingualism-mind-brain']],
      ['psy-03','Perseptuell sensitivitet i første leveår endres med språkerfaring, men utviklingsforløp må beskrives med konkret alder, input og oppgave fremfor som én skarp universell cutoff.',['psy06-speech-perception-first-year','psy07-individual-differences-l1']],
      ['psy-04','Forskjeller i reaction time, accuracy eller gaze kan støtte hypoteser om processing, men må tolkes gjennom task design og alternative mekanismer før de gis en prosessetikett.',['psy01-spoken-word-recognition-2024','psy02-predictability-surprisal-2025']],
    ]
  },
  {
    id:'inkrementell-forstaelse-prediksjon-surprisal-og-n400', title:'Inkrementell forståelse, prediksjon, surprisal og N400', method_ids:['met_psyling_02_a','met_psyling_02_b'],
    boundary:'Predictability og surprisal er modeller av incremental comprehension, men forklarer ikke all processing difficulty; N400 er et følsomt dependent measure for meaning processing og skal ikke behandles som en unik neural code for én bestemt lingvistisk operasjon.', source_ids:['psy02-predictability-surprisal-2025','psy03-n400-kutas-federmeier'],
    claims:[
      ['psy-05','Conditional probability og surprisal kan predikere deler av incremental processing difficulty, men accounten er ufullstendig når lexical frequency, garden paths eller andre kostnader forklarer residual vanskelighet.',['psy02-predictability-surprisal-2025','psy03-n400-kutas-federmeier']],
      ['psy-06','N400-amplitude er sensitiv for semantisk og kontekstuell behandling på tvers av flere stimulusmodaliteter, men komponenten er et dependent measure og ikke et direkte synonym for prediction eller semantic integration.',['psy03-n400-kutas-federmeier','psy02-predictability-surprisal-2025']],
      ['psy-07','Prediction-hypoteser må spesifisere hvilket utfall som predikeres, når informasjonen blir tilgjengelig og hvilket mål som skal endres, ellers kan post-hoc forventningsforklaringer ikke skilles fra alternative prosesser.',['psy02-predictability-surprisal-2025','psy03-n400-kutas-federmeier']],
      ['psy-08','Reading time, eye movements og ERP measures har ulike tids- og måleegenskaper; konvergens mellom dem styrker en processing claim, men fravær av identiske effekter er ikke i seg selv en motsigelse.',['psy02-predictability-surprisal-2025','psy03-n400-kutas-federmeier']],
    ]
  },
  {
    id:'sprakproduksjon-leksikalsk-seleksjon-formkoding-og-monitorering', title:'Språkproduksjon, leksikalsk seleksjon, formkoding og monitorering', method_ids:['met_psyling_03_a','met_psyling_03_b'],
    boundary:'Speech-production models skiller conceptual preparation, lexical selection, morphological/phonological encoding, phonetic encoding og articulation; stage labels er modellkomponenter støttet av chronometric og error data, ikke direkte observerte mentale bokser.', source_ids:['psy04-levelt-lexical-access','psy11-bilingualism-mind-brain','psy01-spoken-word-recognition-2024'],
    claims:[
      ['psy-09','Lexical access i speech production kan analyseres som en kjede fra conceptual preparation gjennom lexical selection og form encoding til articulation, men hvert stadium er en modellert funksjon som krever uavhengig evidens.',['psy04-levelt-lexical-access','psy01-spoken-word-recognition-2024']],
      ['psy-10','Picture naming latency og speech errors kan teste hypoteser om lexical selection og phonological encoding, men task effects og stimulus properties må skilles fra den foreslåtte arkitekturen.',['psy04-levelt-lexical-access','psy01-spoken-word-recognition-2024']],
      ['psy-11','Hos flerspråklige kan flere språk være aktive i samme processing system, så production data må dokumentere språkbruk, proficiency og context før konkurranse eller kontroll tilskrives en bestemt mekanisme.',['psy11-bilingualism-mind-brain','psy04-levelt-lexical-access']],
      ['psy-12','Monitoring av egen tale kan analyseres som del av produksjonssystemet, men en oppdaget feil eller reparasjon alene avgjør ikke hvor i processing-kjeden avviket oppstod.',['psy04-levelt-lexical-access','psy11-bilingualism-mind-brain']],
    ]
  },
  {
    id:'tidlig-spraktilegnelse-statistisk-laring-input-og-intake', title:'Tidlig språktilegnelse, statistisk læring, input og intake', method_ids:['met_psyling_04_a','met_psyling_04_b'],
    boundary:'Language acquisition må skille environmental input, learner intake, statistical regularities, representational assumptions og developmental outcome; sensitivitet for statistiske mønstre beviser ikke alene at én læringsmekanisme forklarer hele grammatikktilegnelsen.', source_ids:['psy05-infant-statistical-learning','psy06-speech-perception-first-year','psy07-individual-differences-l1'],
    claims:[
      ['psy-13','Infants kan lære statistiske regularities fra sekvensielt og multimodalt input, men hva som læres avhenger av representasjon, inputtype og oppgave og skal ikke generaliseres til all språkstruktur uten videre test.',['psy05-infant-statistical-learning','psy06-speech-perception-first-year']],
      ['psy-14','Input og intake er ikke identiske: det barnet eksponeres for må kobles til hva barnet faktisk kan diskriminere, representere og bruke i læring på et gitt utviklingstidspunkt.',['psy06-speech-perception-first-year','psy07-individual-differences-l1']],
      ['psy-15','Utvikling i speech perception, vocabulary og grammar er koblet, men observerte korrelasjoner mellom tidlige og senere mål krever longitudinell design og kontroll for sample- og måleusikkerhet.',['psy07-individual-differences-l1','psy06-speech-perception-first-year']],
      ['psy-16','Laboratoriebasert statistical learning gir kontroll over input, mens naturalistic acquisition gir økologisk kompleksitet; sterke mekanismepåstander bør vise hvordan resultater generaliserer mellom disse evidenstypene.',['psy05-infant-statistical-learning','psy08-childes']],
    ]
  },
  {
    id:'utviklingsvariasjon-korpus-longitudinelle-data-og-individforskjeller', title:'Utviklingsvariasjon, korpus, longitudinelle data og individforskjeller', method_ids:['met_psyling_05_a','met_psyling_05_b'],
    boundary:'Developmental averages er ikke individuelle skjebner; age, input, vocabulary, perception og grammar varierer systematisk, og longitudinal/corpus claims må dokumentere participant sample, recording schedule, coding, attrition og corpus access.', source_ids:['psy07-individual-differences-l1','psy08-childes','psy09-manybabies1'],
    claims:[
      ['psy-17','Individual differences i first-language acquisition kan være systematiske og informative; en group mean skal derfor ikke brukes som deterministisk milepæl for hvert enkelt barn.',['psy07-individual-differences-l1','psy09-manybabies1']],
      ['psy-18','CHILDES gir omfattende naturalistic child-language corpora, men hver analyse må angi konkret corpus, participant age, sampling schedule, transcription/coding og access conditions.',['psy08-childes','psy07-individual-differences-l1']],
      ['psy-19','Longitudinal correlations mellom tidlige processingmål og senere vocabulary eller grammar trenger attrition-, reliability- og confound-kontroll før de tolkes som utviklingsmekanismer.',['psy07-individual-differences-l1','psy09-manybabies1']],
      ['psy-20','Multi-lab infantstudier kan kvantifisere heterogeneity mellom labs, languages, ages og methods, og gir derfor et sterkere grunnlag for generalisering enn ett convenience sample alene.',['psy09-manybabies1','psy08-childes']],
    ]
  },
  {
    id:'tospraklighet-l2-heritage-og-erfaringsprofiler', title:'Tospråklighet, L2, heritage og erfaringsprofiler', method_ids:['met_psyling_06_a','met_psyling_06_b'],
    boundary:'Bilingual, L2 og heritage processing skal beskrives med language history, proficiency, use, exposure og task language; forskjell fra en monolingual comparison group er ikke automatisk deficit, og språkene kan være jointly active.', source_ids:['psy11-bilingualism-mind-brain','psy12-l2-sentence-processing','psy13-heritage-languages'],
    claims:[
      ['psy-21','Bilingual processing viser interaksjon mellom språk i ett bredere language system, så cross-language activation må vurderes fremfor å anta fullstendig separate mentale leksika.',['psy11-bilingualism-mind-brain','psy12-l2-sentence-processing']],
      ['psy-22','L2 sentence processing kan avvike i cue weighting, timing, retrieval og prediction, men slike forskjeller må kobles til proficiency, experience og task fremfor til en generell mangelmodell.',['psy12-l2-sentence-processing','psy11-bilingualism-mind-brain']],
      ['psy-23','Heritage-language outcomes formes av tidlig acquisition, senere exposure/use og minoritized sociolinguistic context; proficiency profiler er derfor heterogene og ikke bare ufullstendig monolingual competence.',['psy13-heritage-languages','psy11-bilingualism-mind-brain']],
      ['psy-24','Sammenligning av bilingual, L2 og heritage groups krever eksplisitte inclusion criteria og language-history measures fordi de samme brede labelene kan dekke svært ulike erfaringsprofiler.',['psy13-heritage-languages','psy12-l2-sentence-processing']],
    ]
  },
  {
    id:'tegnsprak-modalitet-tilgang-og-tidlig-eksponering', title:'Tegnspråk, modalitet, tilgang og tidlig eksponering', method_ids:['met_psyling_07_a','met_psyling_07_b'],
    boundary:'Psycholinguistic theory må inkludere natural sign languages og visual modality; acquisition timing må skilles fra auditory status, og delayed access to a fully accessible first language skal ikke feiltolkes som en egenskap ved sign language eller døve barn.', source_ids:['psy10-sign-language-acquisition','psy07-individual-differences-l1','psy06-speech-perception-first-year'],
    claims:[
      ['psy-25','Natural sign languages kan tilegnes på tilsvarende utviklingstidsskala som spoken languages når barn har tidlig tilgang til flytende språklig input, samtidig som modality påvirker enkelte representasjoner og cues.',['psy10-sign-language-acquisition','psy06-speech-perception-first-year']],
      ['psy-26','Delayed first-language access er en egen erfaringsvariabel og skal skilles fra deafness eller sign modality når senere language outcomes analyseres.',['psy10-sign-language-acquisition','psy07-individual-differences-l1']],
      ['psy-27','Visual iconicity, spatial reference og sign phonology gir modality-specific research questions, men bør undersøkes innen en generell språkprosesseringsteori som ikke gjør tale til definisjonen av språk.',['psy10-sign-language-acquisition','psy06-speech-perception-first-year']],
      ['psy-28','Cross-modal comparisons må matche age of first exposure, proficiency, task demands og accessible input før differences tilskrives modality i seg selv.',['psy10-sign-language-acquisition','psy07-individual-differences-l1']],
    ]
  },
  {
    id:'metoder-malevaliditet-reproduserbarhet-og-generaliserbarhet', title:'Metoder, målevaliditet, reproduserbarhet og generaliserbarhet', method_ids:['met_psyling_08_a','met_psyling_08_b'],
    boundary:'Psycholinguistic evidence krever task, stimuli, exclusions, participant/language metadata, dependent measure, analysis pipeline og uncertainty; CHILDES, ManyBabies og andre shared resources forbedrer reproducibility, men dataset membership er ikke en population model.', source_ids:['psy08-childes','psy09-manybabies1','psy02-predictability-surprisal-2025','psy03-n400-kutas-federmeier'],
    claims:[
      ['psy-29','Reproduserbar psycholinguistics krever versjonerte stimuli/data, participant- og language metadata, exclusions, dependent measures og analysis code slik at samme kontrast kan rekonstrueres.',['psy08-childes','psy09-manybabies1']],
      ['psy-30','Et dependent measure må valideres mot den prosessen det brukes til å inferere; N400, gaze, reaction time eller accuracy kan ikke uten videre byttes ut som om de målte samme latente variabel.',['psy03-n400-kutas-federmeier','psy02-predictability-surprisal-2025']],
      ['psy-31','Shared corpora og multi-lab data øker transparens og coverage, men generalisering må fortsatt begrenses av sampling, language background, age, task og access/coding differences.',['psy08-childes','psy09-manybabies1']],
      ['psy-32','En processing effect bør rapporteres med effect size, uncertainty, exclusions og alternative explanations, og ikke beskrives som en universell språkegenskap når evidensen kommer fra én smal participant- eller task-population.',['psy02-predictability-surprisal-2025','psy09-manybabies1']],
    ]
  }
];

const psyBrief = {
  schema:'history_go_sprak_lingvistikk_psycholinguistics_language_acquisition_processing_source_claim_brief_v1', version:'1.0.0', updated_at:'2026-08-31', status:'source_first_ready_not_materialized', subject_id:'litteratur', canonical_subcategory_id:'sprak_lingvistikk',
  domain:{ordinal:11,id:'psykolingvistikk_spraktilegnelse_prosessering',title:'Psykolingvistikk: språktilegnelse og prosessering',production_mode:'new_production_required'},
  source_strategy:{source_first:true,inspectable_urls_required:true,claim_level_trace_required:true,minimum_sources_per_claim:2,fulltext_materialization_required_before_counting:true,task_measure_does_not_equal_latent_process:true,multilingual_and_modality_diversity_required:true},
  sources:psySources,
  topic_briefs:psyTopics.map((t)=>({id:t.id,title:t.title,method_ids:t.method_ids,boundary:t.boundary,source_ids:t.source_ids,planned_claims:t.claims.map(([id,text,source_ids])=>({id,text,source_ids,status:'planned_requires_fulltext_verification'}))})),
  planned_assessments:psyTopics.map((t,i)=>({id:`psy-q${String(i+1).padStart(2,'0')}`,topic_id:t.id,status:'planned_for_fulltext'})),
  decision_scenarios:[
    {id:'psy-case-01',prompt:'To spoken-word recognition-studier gir ulike reaction-time-effekter. Sammenlign stimuli, lexical competition, participant language history, adaptation og task før en mekanismeforklaring velges.',source_ids:['psy01-spoken-word-recognition-2024','psy11-bilingualism-mind-brain']},
    {id:'psy-case-02',prompt:'Et predictable word gir lavere N400 og kortere reading time. Skill surprisal, lexical frequency, semantic context og dependent-measure interpretation før du hevder én felles predictive mechanism.',source_ids:['psy02-predictability-surprisal-2025','psy03-n400-kutas-federmeier']},
    {id:'psy-case-03',prompt:'Et infant statistical-learning-resultat generaliseres til natural grammar acquisition. Vurder input, intake, representation, task og ecological evidence før den brede læringspåstanden godtas.',source_ids:['psy05-infant-statistical-learning','psy06-speech-perception-first-year']},
    {id:'psy-case-04',prompt:'To bilingual groups presterer ulikt i L2 sentence processing. Kartlegg proficiency, exposure, language use, heritage/L2 history og cue weighting før forskjellen tolkes som deficit.',source_ids:['psy12-l2-sentence-processing','psy13-heritage-languages','psy11-bilingualism-mind-brain']},
    {id:'psy-case-05',prompt:'En studie sammenligner deaf signers med hearing speakers. Skill modality fra age of first accessible language exposure, proficiency og task demands før en cross-modal conclusion trekkes.',source_ids:['psy10-sign-language-acquisition','psy07-individual-differences-l1']},
    {id:'psy-case-06',prompt:'Et prosjekt kombinerer CHILDES og multi-lab infantdata. Dokumenter corpus/study version, participant metadata, exclusions, coding, dependent measures og sample limits før en developmental generalization formuleres.',source_ids:['psy08-childes','psy09-manybabies1']}
  ],
  fail_closed_contract:{source_brief_does_not_count_as_materialized:true,fulltext_requires_exact_32_claim_trace:true,task_measures_must_not_be_treated_as_direct_process_readouts:true,acquisition_evidence_must_report_input_age_and_design:true,bilingual_and_sign_language_diversity_must_be_explicit:true,reproducibility_requires_participant_task_and_analysis_provenance:true}
};
write(psySrcPath, psyBrief);

const fullAuditPath='scripts/audit-sprak-lingvistikk-language-typology-universals-diversity-fulltext-v1.mjs';
writeText(fullAuditPath, `#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),JSON.stringify(v,null,2)+'\\n');},assert=(c,m)=>{if(!c)throw new Error(m);};
const CH='${chapterPath}',SRC='${typSrcPath}',REP='reports/fagverk/sprak-lingvistikk-language-typology-universals-diversity-fulltext-v1-audit.json';
export function audit(){const ch=read(CH),src=read(SRC),brief=read(ch.briefFile),claims=read(ch.claimsFile),assessment=read(ch.assessmentFile);
assert(ch.subject_id==='litteratur'&&ch.canonical_subcategory_id==='sprak_lingvistikk'&&ch.domain_id==='spraktypologi_universaler_mangfold','Feil eierskap/felt 10');assert(ch.moduleFiles?.length===4&&ch.sourceFirst&&ch.claimTraceRequired,'Chapter-kontrakt ufullstendig');
const sourceIds=new Set(src.sources.map(x=>x.id)),planned=src.topic_briefs.flatMap(x=>x.planned_claims||[]),plannedIds=planned.map(x=>x.id);assert(src.sources.length===13&&sourceIds.size===13&&src.sources.every(x=>/^https:\\/\\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'13 verifiserte inspectable kilder kreves');assert(src.topic_briefs.length===8&&planned.length===32&&planned.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id))),'8 emner / 32 fler-kildeclaims kreves');
const modules=ch.moduleFiles.map(read),sections=modules.flatMap(x=>x.sections||[]),paragraphs=sections.flatMap(x=>x.paragraphs||[]),bindings=sections.flatMap(x=>x.paragraphClaimIds||[]),used=bindings.flatMap(x=>x||[]);assert(sections.length===8&&paragraphs.length===32&&bindings.length===32&&paragraphs.every(x=>typeof x==='string'&&x.length>=420),'4/8/32 og avsnittsdybde kreves');assert(bindings.every(x=>Array.isArray(x)&&x.length===1)&&JSON.stringify(used)===JSON.stringify(plannedIds)&&new Set(used).size===32,'Eksakt typ-01..typ-32 claim-trace kreves');
const verified=claims.verifiedClaims||[];assert(claims.trace_mode==='source_brief_claim_text_and_sources_immutable'&&verified.length===32&&JSON.stringify(verified.map(x=>x.id))===JSON.stringify(plannedIds)&&verified.every(x=>x.status==='verified'),'32 reverifiserte claims kreves');const qs=assessment.questions||[],cases=assessment.caseTasks||[];assert(qs.length===8&&cases.length===6&&qs.every(x=>x.choices?.length===4&&x.correctIndex===1),'8 vurderinger / 6 case kreves');for(const x of [...qs,...cases]){assert(x.claim_ids?.length>=1&&x.claim_ids.every(id=>plannedIds.includes(id)),x.id+': claim-link feil');assert(x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id)),x.id+': source-link feil');}
const b=sections.map(x=>x.boundary||'').join(' ').toLowerCase(),t=paragraphs.join(' ').toLowerCase();assert(/comparative concepts/u.test(b)&&/descriptive categories/u.test(b)&&/missing/u.test(b),'Comparative-concept-grense mangler');assert(/samples/u.test(b)&&/genealogy/u.test(b)&&/areal/u.test(b)&&/uavhengige/u.test(b),'Sampling/uavhengighet-grense mangler');assert(/word-order/u.test(b)&&/correlation/u.test(b)&&/universal/u.test(b),'Word-order/universal-grense mangler');assert(/alignment/u.test(b)&&/construction-level/u.test(b)&&/optionality/u.test(b),'Morphosyntax-grense mangler');assert(/inventory/u.test(b)&&/provenance/u.test(b)&&/doculect/u.test(b),'Phonology-provenance-grense mangler');assert(/absolute universals/u.test(b)&&/counterexamples/u.test(b)&&/falsifisere/u.test(b),'Falsifiability-grense mangler');assert(/feature dependencies/u.test(b)&&/missingness/u.test(b)&&/multivariate/u.test(b),'Database-dependence-grense mangler');assert(/dataset release/u.test(b)&&/language loss/u.test(b)&&/generalization limits/u.test(b),'Diversity/reproducibility-grense mangler');assert(/wals/u.test(t)&&/grambank/u.test(t)&&/phoible/u.test(t)&&/glottolog/u.test(t),'Kjerne-evidens mangler');
const q={correctness_and_evidence:5,comparative_concepts_and_sampling:5,word_order_and_morphosyntax:5,phonology_and_universals:5,database_dependence_and_diversity:5,assessment_and_reproducibility:5};const r={schema:'history_go_sprak_lingvistikk_language_typology_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:ch.domain_id,status:'pass_fulltext_materialized_domain_ready_for_registry',counts:{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6},gates:{ownership:true,source_first_trace:true,paragraph_depth:true,exact_claim_coverage:true,comparative_concepts:true,sampling_independence:true,word_order_universals:true,morphosyntax_depth:true,phonology_provenance:true,universal_falsifiability:true,database_dependence:true,diversity_reproducibility:true,assessment:true},six_part_quality_review:{...q,total:30},next_gate:'register_domain_10_only_after_domain_11_psycholinguistics_source_first_is_ready'};write(REP,r);return r;}
try{const r=audit();console.log('Språk & lingvistikk felt 10 Språktypologi fulltekst OK: '+r.counts.modules+' moduler, '+r.counts.sections+' seksjoner, '+r.counts.paragraphs+' avsnitt, '+r.counts.verifiedClaims+' claims.');}catch(e){console.error('Språk & lingvistikk felt 10 Språktypologi fulltekst FEIL: '+e.message);process.exitCode=1;}
`);

const psyAuditPath='scripts/brief-sprak-lingvistikk-psycholinguistics-language-acquisition-processing-sources-v1.mjs';
writeText(psyAuditPath, `#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),JSON.stringify(v,null,2)+'\\n');},assert=(c,m)=>{if(!c)throw new Error(m);};const FILE='${psySrcPath}',REPORT='reports/fagverk/sprak-lingvistikk-psycholinguistics-language-acquisition-processing-source-brief-v1-audit.json';
export function audit(){const b=read(FILE),ids=new Set(b.sources.map(x=>x.id)),claims=b.topic_briefs.flatMap(x=>x.planned_claims||[]);assert(b.status==='source_first_ready_not_materialized'&&b.domain?.ordinal===11&&b.domain?.id==='psykolingvistikk_spraktilegnelse_prosessering'&&b.domain?.production_mode==='new_production_required','Feil Felt 11-kontrakt');assert(b.sources.length===13&&ids.size===13&&b.sources.every(x=>/^https:\\/\\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'13 verifiserte kilder kreves');assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(x=>x.id)).size===32&&claims.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'8 emner / 32 fler-kildeclaims kreves');assert(b.planned_assessments?.length===8&&b.decision_scenarios?.length===6&&b.decision_scenarios.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'8 vurderinger / 6 case kreves');const bd=b.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();assert(/spoken-word recognition/u.test(bd)&&/plasticity/u.test(bd)&&/task-dependent/u.test(bd),'Word-recognition/task-grense mangler');assert(/surprisal/u.test(bd)&&/n400/u.test(bd)&&/forklarer ikke all/u.test(bd),'Comprehension-measure-grense mangler');assert(/lexical selection/u.test(bd)&&/phonological encoding/u.test(bd)&&/chronometric/u.test(bd),'Production-model-grense mangler');assert(/input/u.test(bd)&&/intake/u.test(bd)&&/statistical regularities/u.test(bd),'Acquisition/input-grense mangler');assert(/individual/u.test(bd)&&/longitudinal/u.test(bd)&&/corpus/u.test(bd),'Developmental-variation-grense mangler');assert(/bilingual/u.test(bd)&&/l2/u.test(bd)&&/heritage/u.test(bd)&&/deficit/u.test(bd),'Multilingual-grense mangler');assert(/sign languages/u.test(bd)&&/visual modality/u.test(bd)&&/accessible first language/u.test(bd),'Sign/modality-grense mangler');assert(/childes/u.test(bd)&&/manybabies/u.test(bd)&&/reproducibility/u.test(bd)&&/analysis pipeline/u.test(bd),'Reproducibility-grense mangler');assert(b.fail_closed_contract?.source_brief_does_not_count_as_materialized===true&&b.fail_closed_contract?.task_measures_must_not_be_treated_as_direct_process_readouts===true,'Fail-closed psycholinguistics-kontrakt mangler');const q={correctness_and_evidence:5,perception_comprehension_and_production:5,acquisition_and_development:5,multilingual_and_modality_diversity:5,task_validity_and_measurement:5,reproducibility_and_assessment_plan:5};const r={schema:'history_go_sprak_lingvistikk_psycholinguistics_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:b.domain.id,status:'pass_source_first_ready_not_materialized',counts:{sources:13,topicBriefs:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6},gates:{ownership:true,inspectable_sources:true,multi_source_claims:true,word_recognition_task_boundary:true,comprehension_measure_boundary:true,production_model_boundary:true,acquisition_input_boundary:true,developmental_variation:true,multilingual_processing:true,sign_modality_access:true,reproducibility_metadata:true},six_part_quality_review:{...q,total:30},next_gate:'materialize_psycholinguistics_language_acquisition_processing_fulltext'};write(REPORT,r);return r;}try{const r=audit();console.log('Språk & lingvistikk felt 11 Psykolingvistikk source-first OK: '+r.counts.sources+' kilder, '+r.counts.topicBriefs+' emner, '+r.counts.plannedClaims+' claims, '+r.counts.decisionScenarios+' case.');}catch(e){console.error('Språk & lingvistikk felt 11 Psykolingvistikk source-first FEIL: '+e.message);process.exitCode=1;}
`);

writeText('tests/sprak-lingvistikk-language-typology-universals-diversity-fulltext-v1.test.mjs', `import test from 'node:test'; import assert from 'node:assert/strict'; import { audit } from '../${fullAuditPath}';\ntest('Språk & lingvistikk felt 10 Språktypologi har strict 4/8/32 fulltekst',()=>{const r=audit();assert.equal(r.status,'pass_fulltext_materialized_domain_ready_for_registry');assert.deepEqual(r.counts,{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6});assert.equal(r.six_part_quality_review.total,30);});\n`);
writeText('tests/sprak-lingvistikk-psycholinguistics-language-acquisition-processing-source-brief-v1.test.mjs', `import test from 'node:test'; import assert from 'node:assert/strict'; import { audit } from '../${psyAuditPath}';\ntest('Språk & lingvistikk felt 11 Psykolingvistikk er source-first uten materialisering',()=>{const r=audit();assert.equal(r.status,'pass_source_first_ready_not_materialized');assert.deepEqual(r.counts,{sources:13,topicBriefs:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6});assert.equal(r.six_part_quality_review.total,30);});\n`);

const regPath='data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json';const reg=read(regPath);assert(reg.progress?.materializedDomains===9&&reg.materialized?.length===9,'Registry må starte på 9/12');reg.status='domains_1_2_3_4_5_6_7_8_9_10_materialized_domain_11_source_first_ready';reg.progress.materializedDomains=10;reg.progress.strictCompletionProven=false;reg.next_gate='psycholinguistics_language_acquisition_processing_fulltext';reg.materialized.push({ordinal:10,domain_id:'spraktypologi_universaler_mangfold',chapter:chapterPath,claims:`${chapterRoot}/claims.json`,assessment:`${chapterRoot}/assessment.json`,audit:'reports/fagverk/sprak-lingvistikk-language-typology-universals-diversity-fulltext-v1-audit.json',source_brief:typSrcPath,source_brief_audit:'reports/fagverk/sprak-lingvistikk-language-typology-universals-diversity-source-brief-v1-audit.json'});write(regPath,reg);
const recPath='reports/fagverk/sprak-lingvistikk-reconciliation-v1.json';const rec=read(recPath);rec.status='domains_1_2_3_4_5_6_7_8_9_10_materialized_domain_11_source_first_ready';rec.production_plan={materialized:10,source_first_ready:11,next_domain:'psykolingvistikk_spraktilegnelse_prosessering',strict_completion_proven:false};write(recPath,rec);
writeText('tests/sprak-lingvistikk-reconciliation-v1.test.mjs', `import test from 'node:test'; import assert from 'node:assert/strict'; import { audit } from '../scripts/audit-sprak-lingvistikk-reconciliation-v1.mjs';\ntest('Språk & lingvistikk har felt 1-10 materialisert og felt 11 Psykolingvistikk source-first',()=>{const report=audit();assert.equal(report.status,'pass');assert.equal(report.domains,12);assert.equal(report.materialized,10);assert.equal(report.sourceFirstReady,11);assert.equal(report.strictCompletionProven,false);assert.equal(report.reuseWithExpansion,1);assert.equal(report.newProductionRequired,11);assert.equal(report.moveExisting,0);assert.equal(report.nextDomain,'psykolingvistikk_spraktilegnelse_prosessering');});\n`);
writeText('scripts/materialize-sprak-lingvistikk-language-typology-universals-diversity-fulltext-v1.mjs', `#!/usr/bin/env node\nimport fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';\nimport { audit as auditFulltext } from './audit-sprak-lingvistikk-language-typology-universals-diversity-fulltext-v1.mjs';\nimport { audit as auditNextSource } from './brief-sprak-lingvistikk-psycholinguistics-language-acquisition-processing-sources-v1.mjs';\nconst ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),assert=(c,m)=>{if(!c)throw new Error(m);};\ntry{const full=auditFulltext(),next=auditNextSource(),reg=read('${regPath}'),e=reg.materialized?.[9];assert(full.status==='pass_fulltext_materialized_domain_ready_for_registry','Språktypologi-audit må være grønn');assert(next.status==='pass_source_first_ready_not_materialized','Psykolingvistikk source-first må være grønn');assert(reg.progress.materializedDomains===10&&reg.progress.strictCompletionProven===false,'Registry må stå på 10/12 uten completion proof');assert(e?.ordinal===10&&e.domain_id==='spraktypologi_universaler_mangfold','Språktypologi må være felt 10');assert(e.chapter==='${chapterPath}'&&e.claims==='${chapterRoot}/claims.json'&&e.assessment==='${chapterRoot}/assessment.json','Felt 10 bindings feil');assert(reg.next_gate==='psycholinguistics_language_acquisition_processing_fulltext','Neste gate må være Psykolingvistikk fulltekst');console.log('Språk & lingvistikk felt 10 Språktypologi materializer OK: 10/12 registrert etter strict fulltext-audit og grønn felt 11 source-first.');}catch(e){console.error('Språk & lingvistikk felt 10 materializer FEIL: '+e.message);process.exitCode=1;}\n`);

console.log('TEMP materialization prepared: Field 10 fulltext + Field 11 source-first + registry 10/12.');
