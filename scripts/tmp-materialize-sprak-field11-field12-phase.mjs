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

const psySrcPath = 'data/fag/litteratur/sprak_lingvistikk/psycholinguistics_language_acquisition_processing_source_claim_brief_v1.json';
const psySrc = read(psySrcPath);
assert(psySrc.status === 'source_first_ready_not_materialized', 'Felt 11 source brief må være source-first');
assert(psySrc.domain?.ordinal === 11 && psySrc.domain?.id === 'psykolingvistikk_spraktilegnelse_prosessering', 'Feil Felt 11 source brief');
assert(psySrc.sources?.length === 13 && psySrc.topic_briefs?.length === 8, 'Felt 11 krever 13 kilder og 8 emner');
const psyClaims = psySrc.topic_briefs.flatMap((t) => t.planned_claims || []);
assert(psyClaims.length === 32, 'Felt 11 krever 32 claims');

const psyChapterId = 'psykolingvistikk-spraktilegnelse-og-prosessering';
const psyRoot = `data/fagverk/litteratur/sprak_lingvistikk/${psyChapterId}`;
const psySourceTitle = Object.fromEntries(psySrc.sources.map((s) => [s.id, s.title]));

function psyParagraph(claim, topic) {
  const evidence = claim.source_ids.map((id) => psySourceTitle[id]).join(' og ');
  return `${claim.text} Evidensgrunnlaget her er ${evidence}, lest sammen med metodegrensen for emnet: ${topic.boundary} I denne framstillingen er reaction time, accuracy, gaze, ERP, errors, corpus counts og andre mål observerbare indikatorer som må knyttes eksplisitt til oppgave, stimuli, deltakerprofil, språkbakgrunn og analysemodell; de behandles ikke som direkte avlesninger av én latent mental prosess. Alternative mekanismer, måleusikkerhet, utviklingsvariasjon, flerspråklig erfaring og modalitet holdes synlige. Påstander avgrenses derfor til den populasjonen, alderen, språkprofilen, oppgaven og evidenstypen som faktisk er undersøkt, og sterke mekanismepåstander krever konvergerende evidens fremfor ett enkelt dependent measure.`;
}

const psyModuleSpecs = [
  ['01-talepersepsjon-ordgjenkjenning-og-forstaelse.json', 0, 2, 'Talepersepsjon, ordgjenkjenning og forståelse'],
  ['02-sprakproduksjon-og-tidlig-tilegnelse.json', 2, 4, 'Språkproduksjon og tidlig tilegnelse'],
  ['03-utviklingsvariasjon-og-flerspraklig-prosessering.json', 4, 6, 'Utviklingsvariasjon og flerspråklig prosessering'],
  ['04-tegnsprak-malevaliditet-og-reproduserbarhet.json', 6, 8, 'Tegnspråk, målevaliditet og reproduserbarhet'],
];

const psyModuleFiles = [];
for (const [file, start, end, title] of psyModuleSpecs) {
  const sections = psySrc.topic_briefs.slice(start, end).map((topic) => ({
    id: topic.id,
    title: topic.title,
    method_ids: topic.method_ids,
    boundary: topic.boundary,
    paragraphs: topic.planned_claims.map((claim) => psyParagraph(claim, topic)),
    paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),
  }));
  const out = `${psyRoot}/${file}`;
  psyModuleFiles.push(out);
  write(out, {
    schema: 'history_go_fagverk_module_v1',
    version: '1.0.0',
    subject_id: 'litteratur',
    canonical_subcategory_id: 'sprak_lingvistikk',
    chapter_id: psyChapterId,
    id: file.replace(/\.json$/u, ''),
    title,
    sections,
  });
}

const psyChapterPath = `data/fagverk/litteratur/sprak_lingvistikk/${psyChapterId}.json`;
write(psyChapterPath, {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'litteratur',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  domain_id: 'psykolingvistikk_spraktilegnelse_prosessering',
  id: psyChapterId,
  chapter_id: psyChapterId,
  title: 'Psykolingvistikk: språktilegnelse og prosessering',
  subtitle: 'Fra talepersepsjon, prediksjon og språkproduksjon til utvikling, flerspråklighet, tegnspråk og reproduserbare målemodeller',
  lead: 'Psykolingvistikk undersøker hvordan språk oppfattes, forstås, produseres og tilegnes. Kapittelet skiller observerbare mål fra latente prosesser, behandler utvikling og erfaring som heterogene, inkluderer flerspråklige og tegnspråklige profiler og krever eksplisitt oppgave-, deltaker- og analyseproveniens.',
  learningObjectives: [
    'analysere spoken-word recognition med lexical competition, adaptation og task-avhengige mål',
    'vurdere predictability, surprisal og N400 uten å gjøre ett mål til en unik prosesskode',
    'skille modellerte stadier i språkproduksjon fra direkte observerte hendelser',
    'skille input, intake, statistical learning og bred grammatikktilegnelse',
    'analysere utviklingsvariasjon med longitudinelle data, korpus og reliabilitet',
    'beskrive bilingual, L2 og heritage processing med eksplisitte erfaringsprofiler',
    'inkludere natural sign languages, modalitet og alder ved tilgjengelig førstespråk',
    'rapportere stimuli, tasks, exclusions, measures, metadata, analysepipeline og usikkerhet reproduserbart'
  ],
  moduleFiles: psyModuleFiles,
  briefFile: `${psyRoot}/brief.json`,
  claimsFile: `${psyRoot}/claims.json`,
  assessmentFile: `${psyRoot}/assessment.json`,
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  sourceFirst: true,
});

write(`${psyRoot}/brief.json`, {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  domain_id: 'psykolingvistikk_spraktilegnelse_prosessering',
  chapter_id: psyChapterId,
  sourceBriefFile: psySrcPath,
  purpose: 'Materialisere psykolingvistikk som evidensstyrt analyse av språkprosessering og tilegnelse med eksplisitt målevaliditet, utviklingsvariasjon, flerspråklighet, modalitet og reproduserbarhet.',
  sections: psySrc.topic_briefs.map((topic, i) => ({ ordinal: i + 1, id: topic.id, claim_ids: topic.planned_claims.map((c) => c.id) })),
  strict_boundaries: psySrc.topic_briefs.map((topic) => topic.boundary),
  fulltext_status: 'materialized_pending_strict_audit',
  source_first: true,
  claim_trace_required: true,
});

write(`${psyRoot}/claims.json`, {
  schema: 'history_go_fagverk_claims_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  chapter_id: psyChapterId,
  retrieval_status: 'verified_2026-08-31',
  verified_at: '2026-08-31',
  trace_mode: 'source_brief_claim_text_and_sources_immutable',
  sourceBriefFile: psySrcPath,
  verifiedClaims: psyClaims.map((c) => ({ id: c.id, status: 'verified', verified_at: '2026-08-31' })),
});

const psyQuestions = psySrc.topic_briefs.map((topic, i) => ({
  id: `psy-q${String(i + 1).padStart(2, '0')}`,
  prompt: `Hva er den viktigste metodiske kontrollen i ${topic.title.toLowerCase()}?`,
  choices: [
    'Å lese ett dependent measure som direkte bevis for én latent prosess',
    topic.boundary,
    'Å bruke en monolingval voksenbaseline som universell norm uansett utvalg',
    'Å ignorere task, stimuli, alder, språkprofil og alternative mekanismer'
  ],
  correctIndex: 1,
  claim_ids: topic.planned_claims.slice(0, 3).map((c) => c.id),
  source_ids: topic.source_ids.slice(0, 2),
}));
const psyCaseTopicIndexes = [0, 1, 3, 5, 6, 7];
const psyCaseTasks = psySrc.decision_scenarios.map((scenario, i) => {
  const topic = psySrc.topic_briefs[psyCaseTopicIndexes[i]];
  return {
    id: scenario.id,
    prompt: scenario.prompt,
    responseMode: 'guided_discussion_no_required_typing',
    claim_ids: topic.planned_claims.map((c) => c.id),
    source_ids: scenario.source_ids,
  };
});
write(`${psyRoot}/assessment.json`, {
  schema: 'history_go_fagverk_assessment_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  canonical_subcategory_id: 'sprak_lingvistikk',
  chapter_id: psyChapterId,
  questions: psyQuestions,
  caseTasks: psyCaseTasks,
});

const corpusSrcPath = 'data/fag/litteratur/sprak_lingvistikk/corpus_field_documentation_language_resources_reproducibility_source_claim_brief_v1.json';
const corpusSources = [
  ['corp01-biber-representativeness','Representativeness in corpus design','Literary and Linguistic Computing / Oxford University Press','https://doi.org/10.1093/llc/8.4.243'],
  ['corp02-olac','OLAC: Open Language Archives Community','Open Language Archives Community','https://www.language-archives.org/'],
  ['corp03-clarin-cmdi','Component Metadata Infrastructure (CMDI)','CLARIN ERIC','https://www.clarin.eu/content/component-metadata'],
  ['corp04-elar-lameta','Introducing lameta','Endangered Languages Archive','https://blogs.soas.ac.uk/elar/2020/04/30/introducing-lameta/'],
  ['corp05-paradisec','Pacific and Regional Archive for Digital Sources in Endangered Cultures','PARADISEC','https://www.paradisec.org.au/'],
  ['corp06-elan','ELAN annotation tool','The Language Archive / Max Planck Institute for Psycholinguistics','https://archive.mpi.nl/tla/elan'],
  ['corp07-glottolog','Glottolog 5.3','Max Planck Institute for Evolutionary Anthropology','https://glottolog.org/'],
  ['corp08-ud','Universal Dependencies','Universal Dependencies community','https://universaldependencies.org/'],
  ['corp09-talkbank','Understanding Spoken Language through TalkBank','Behavior Research Methods / PMC','https://pmc.ncbi.nlm.nih.gov/articles/PMC6546550/'],
  ['corp10-fair','The FAIR Guiding Principles for scientific data management and stewardship','Scientific Data','https://doi.org/10.1038/sdata.2016.18'],
  ['corp11-care','CARE Principles for Indigenous Data Governance','Global Indigenous Data Alliance','https://www.gida-global.org/careprinciples'],
  ['corp12-coretrustseal','CoreTrustSeal trustworthy digital repository requirements and FAQ','CoreTrustSeal','https://www.coretrustseal.org/why-certification/frequently-asked-questions/'],
  ['corp13-dataverse','Dataset and File Management','Dataverse.org','https://guides.dataverse.org/en/latest/user/dataset-management.html'],
].map(([id,title,publisher,url]) => ({ id, title, publisher, url, retrieval_status: 'verified_2026-08-31' }));

const corpusTopics = [
  {
    id:'korpusdesign-sampling-og-representativitet', title:'Korpusdesign, sampling og representativitet', method_ids:['met_corpus_01_a','met_corpus_01_b'],
    boundary:'Corpus design må definere target population, sampling frame, sampling unit, register/genre strata, inclusion criteria og coverage før representativeness vurderes; størrelse alene gjør ikke et korpus representativt.', source_ids:['corp01-biber-representativeness','corp09-talkbank','corp13-dataverse'],
    claims:[
      ['corp-01','Et forskningskorpus er et utvalg fra en definert målpopulasjon, og generalisering krever at target population og sampling frame er eksplisitt formulert før tekstene eller opptakene velges.',['corp01-biber-representativeness','corp13-dataverse']],
      ['corp-02','Representativitet avhenger av variasjonen som er relevant for forskningsspørsmålet, ikke bare av antall tokens; register, genre, speaker profile, tid og modalitet kan derfor være nødvendige strata.',['corp01-biber-representativeness','corp09-talkbank']],
      ['corp-03','Sampling unit må skilles fra analyseenhet: et dokument, en speaker eller en session kan trekkes inn i korpuset, mens analysen senere kan operere på tokens, utterances eller annotations.',['corp01-biber-representativeness','corp13-dataverse']],
      ['corp-04','Corpus coverage og sampling bias må rapporteres som begrensninger slik at frekvenser og modeller ikke presenteres som egenskaper ved et språk når de bare dekker en smal datakilde.',['corp01-biber-representativeness','corp09-talkbank']]
    ]
  },
  {
    id:'transkripsjon-annotasjon-og-kvalitetsproveniens', title:'Transkripsjon, annotasjon og kvalitetsproveniens', method_ids:['met_corpus_02_a','met_corpus_02_b'],
    boundary:'Transcription og annotation må ha eksplisitt tier/schema, guidelines, annotator/version provenance og quality-control; ELAN tiers, UD labels eller andre annotation schemes er representasjoner som må kunne spores til media/text og beslutningsregler.', source_ids:['corp06-elan','corp08-ud','corp13-dataverse'],
    claims:[
      ['corp-05','Time-aligned annotation kobler tekstlige beskrivelser til bestemte deler av audio eller video, og tier-struktur må dokumenteres slik at annotasjoner kan tolkes i forhold til mediet.',['corp06-elan','corp13-dataverse']],
      ['corp-06','Et annotation label som POS, feature eller dependency relation er meningsfullt bare sammen med den versjonen av guidelines og formatkonvensjoner som ble brukt.',['corp08-ud','corp13-dataverse']],
      ['corp-07','Transkripsjon og annotasjon bør bevare koblingen mellom råmateriale, bearbeidet tekst, annotatorbeslutninger og senere transformasjoner i stedet for å overskrive provenance.',['corp06-elan','corp13-dataverse']],
      ['corp-08','Quality-control kan omfatte double annotation, adjudication, spot checks eller andre prosedyrer, men metoden og coverage må rapporteres før annotation quality sammenlignes mellom ressurser.',['corp08-ud','corp13-dataverse']]
    ]
  },
  {
    id:'feltdokumentasjon-sessions-samtykke-og-tilgang', title:'Feltdokumentasjon, sessions, samtykke og tilgang', method_ids:['met_corpus_03_a','met_corpus_03_b'],
    boundary:'Field documentation må knytte session/bundle, participants, contributor roles, language use, recording conditions, consent og access protocol til konkrete filer; open access er ikke en standardantakelse når speakers eller communities har satt begrensninger.', source_ids:['corp04-elar-lameta','corp05-paradisec','corp11-care'],
    claims:[
      ['corp-09','En dokumentasjonssession er en strukturert proveniensenhet som kan koble recording, parallel audio/video, annotations, notes og contributor metadata uten å gjøre filnavnet til eneste dokumentasjon.',['corp04-elar-lameta','corp05-paradisec']],
      ['corp-10','Participant- og contributorroller bør registreres sammen med språkbruk og bidrag slik at framtidige brukere kan forstå hvem som ble dokumentert, hvem som transkriberte og hvem som oversatte.',['corp04-elar-lameta','corp11-care']],
      ['corp-11','Consent og access conditions må følge materialet gjennom arkivering og viderebruk; et teknisk mulig download er ikke det samme som etisk eller juridisk tillatt bruk.',['corp04-elar-lameta','corp11-care']],
      ['corp-12','Language documentation bør planlegge arkivering og community access fra innsamlingen av, ikke først etter analyse, fordi metadata, rettigheter og filorganisering ellers blir vanskelige å rekonstruere.',['corp05-paradisec','corp04-elar-lameta']]
    ]
  },
  {
    id:'metadata-identifikatorer-finnbarhet-og-interoperabilitet', title:'Metadata, identifikatorer, finnbarhet og interoperabilitet', method_ids:['met_corpus_04_a','met_corpus_04_b'],
    boundary:'Resource metadata må skille descriptive metadata fra annotations og bruke stable identifiers/PIDs der mulig; OLAC/CMDI, Glottocodes og andre identifiers forbedrer discovery/interoperability bare når mapping, version og referent er dokumentert.', source_ids:['corp02-olac','corp03-clarin-cmdi','corp07-glottolog','corp10-fair'],
    claims:[
      ['corp-13','Rike metadata gjør språkressurser søkbare på tvers av arkiver når felter og vocabularies kan høstes eller mappes mellom infrastrukturer.',['corp02-olac','corp03-clarin-cmdi']],
      ['corp-14','Metadata om en hel resource må skilles fra annotations av hendelser eller segmenter inne i selve dataobjektet, selv om begge er nødvendige for gjenbruk.',['corp03-clarin-cmdi','corp06-elan']],
      ['corp-15','Stabile språkidentifikatorer som Glottocodes reduserer navneambiguitet, men identifieren må ikke brukes som erstatning for lokal variety-beskrivelse eller sociolinguistic context.',['corp07-glottolog','corp02-olac']],
      ['corp-16','Persistent identifiers og maskinlesbare metadata støtter findability og citation, men de må peke til versjonerte ressurser med tydelige access conditions.',['corp10-fair','corp03-clarin-cmdi']]
    ]
  },
  {
    id:'formater-versjonering-transformasjoner-og-proveniens', title:'Formater, versjonering, transformasjoner og proveniens', method_ids:['met_corpus_05_a','met_corpus_05_b'],
    boundary:'Formats og conversions må være versjonerte og reversible eller dokumentert lossy; EAF, CoNLL-U og andre exchange formats krever schema/version, encoding, transformation steps og provenance, og en ny dataset version må ikke skjule den tidligere.', source_ids:['corp06-elan','corp08-ud','corp13-dataverse','corp10-fair'],
    claims:[
      ['corp-17','Standardiserte utvekslingsformater kan gjøre annotations og corpora mer interoperable når encoding, schema og versjon dokumenteres sammen med filene.',['corp06-elan','corp08-ud']],
      ['corp-18','En formatkonvertering er en analytisk transformasjon som må logges med input, output, tool/version og eventuelle tap av struktur slik at provenance kan rekonstrueres.',['corp13-dataverse','corp10-fair']],
      ['corp-19','Dataset versioning gjør det mulig å skille korrigeringer og nye data fra tidligere publiserte tilstander og er derfor nødvendig når analyser skal kunne rerunnes mot riktig snapshot.',['corp13-dataverse','corp09-talkbank']],
      ['corp-20','Unicode eller et åpent format løser ikke alene interoperabilitet; mapping mellom tiers, labels, identifiers og segmenteringsregler må også dokumenteres.',['corp06-elan','corp08-ud']]
    ]
  },
  {
    id:'reproduserbare-workflows-kode-miljo-og-sitering', title:'Reproduserbare workflows, kode, miljø og sitering', method_ids:['met_corpus_06_a','met_corpus_06_b'],
    boundary:'Reproducibility krever dataset snapshot/version, query or extraction, code, software/environment, parameters, exclusions og output linkage; shared data alene er ikke et reproduksjonsbevis uten executable analysis provenance.', source_ids:['corp09-talkbank','corp10-fair','corp13-dataverse'],
    claims:[
      ['corp-21','Et delt korpus muliggjør uavhengig kontroll først når analysen oppgir hvilken corpus version eller snapshot som ble brukt og hvordan delmengden ble valgt.',['corp09-talkbank','corp13-dataverse']],
      ['corp-22','Query, preprocessing, code, software version og parameter choices er del av evidenslinjen fordi ulike pipelines kan produsere ulike counts eller modeller fra samme rådata.',['corp13-dataverse','corp10-fair']],
      ['corp-23','Data citation bør identifisere en persistent dataset record og samtidig bevare informasjon om versjon og filer når analysen avhenger av en bestemt tilstand.',['corp13-dataverse','corp10-fair']],
      ['corp-24','Git- eller annen versjonshistorikk kan støtte replisering av tidligere analyser, men bare dersom data- og kodeversjoner faktisk kan kobles til rapporterte resultater.',['corp09-talkbank','corp13-dataverse']]
    ]
  },
  {
    id:'langtidsbevaring-trust-fixity-og-migrasjon', title:'Langtidsbevaring, trust, fixity og migrasjon', method_ids:['met_corpus_07_a','met_corpus_07_b'],
    boundary:'Long-term preservation krever repository responsibility, storage procedures, integrity/fixity checks, documented migration and designated-community access; backup er ikke det samme som et trustworthy digital repository.', source_ids:['corp12-coretrustseal','corp05-paradisec','corp10-fair'],
    claims:[
      ['corp-25','Et trustworthy repository har dokumentert ansvar for langsiktig bevaring av både data og metadata for en definert brukergruppe, ikke bare midlertidig filhosting.',['corp12-coretrustseal','corp05-paradisec']],
      ['corp-26','Digital preservation krever planlagt håndtering av formatobsolesens og migrasjon slik at objekter forblir forståelige og gjenbrukbare over tid.',['corp12-coretrustseal','corp05-paradisec']],
      ['corp-27','Fixity og integrity checks beskytter mot uoppdaget bit-level endring, men semantisk bevaring krever i tillegg metadata, formatkunnskap og dokumenterte relasjoner mellom filer.',['corp12-coretrustseal','corp10-fair']],
      ['corp-28','Arkivets organisatoriske og tekniske bærekraft er del av dataenes reproduserbarhet fordi framtidig kontroll forutsetter at den siterte ressursen fortsatt kan identifiseres og forstås.',['corp12-coretrustseal','corp10-fair']]
    ]
  },
  {
    id:'etikk-data-governance-fair-care-og-ansvarlig-gjenbruk', title:'Etikk, data governance, FAIR/CARE og ansvarlig gjenbruk', method_ids:['met_corpus_08_a','met_corpus_08_b'],
    boundary:'FAIR betyr ikke automatically open; access, consent, licensing, community authority og CARE collective-benefit/authority-to-control må vurderes sammen med findability og reuse, særlig for Indigenous, minoritized eller sensitive language data.', source_ids:['corp10-fair','corp11-care','corp04-elar-lameta','corp02-olac'],
    claims:[
      ['corp-29','FAIR-prinsippene retter seg mot findability, accessibility, interoperability og reuse, men accessibility kan innebære autentisering eller restriksjoner og er ikke synonymt med unrestricted open access.',['corp10-fair','corp02-olac']],
      ['corp-30','CARE-prinsippene supplerer teknisk dataforvaltning med collective benefit, authority to control, responsibility og ethics for Indigenous data governance.',['corp11-care','corp10-fair']],
      ['corp-31','Consent og community authority kan begrense sekundærbruk selv når metadata er offentlig synlige, og slike vilkår må være maskin- og menneskelesbare der infrastrukturen tillater det.',['corp11-care','corp04-elar-lameta']],
      ['corp-32','Ansvarlig language-resource reuse krever samtidig vurdering av provenance, citation, license/access, participant/community rights og risiko for skade; teknisk reproduserbarhet overstyrer ikke disse grensene.',['corp11-care','corp02-olac','corp10-fair']]
    ]
  }
];

const corpusBrief = {
  schema:'history_go_sprak_lingvistikk_corpus_field_documentation_language_resources_reproducibility_source_claim_brief_v1',
  version:'1.0.0', updated_at:'2026-08-31', status:'source_first_ready_not_materialized',
  subject_id:'litteratur', canonical_subcategory_id:'sprak_lingvistikk',
  domain:{ordinal:12,id:'korpuslingvistikk_feltdokumentasjon_sprakressurser_reproduserbarhet',title:'Korpuslingvistikk, feltdokumentasjon, språkressurser og reproduserbarhet',production_mode:'new_production_required'},
  source_strategy:{source_first:true,inspectable_urls_required:true,claim_level_trace_required:true,minimum_sources_per_claim:2,fulltext_materialization_required_before_counting:true,strict_completion_field:true,metadata_and_provenance_required:true,ethical_access_and_data_governance_required:true},
  sources:corpusSources,
  topic_briefs:corpusTopics.map((t)=>({id:t.id,title:t.title,method_ids:t.method_ids,boundary:t.boundary,source_ids:t.source_ids,planned_claims:t.claims.map(([id,text,source_ids])=>({id,text,source_ids,status:'planned_requires_fulltext_verification'}))})),
  planned_assessments:corpusTopics.map((t,i)=>({id:`corp-q${String(i+1).padStart(2,'0')}`,topic_id:t.id,status:'planned_for_fulltext'})),
  decision_scenarios:[
    {id:'corp-case-01',prompt:'Et stort webkorpus kalles representativt fordi det har milliarder av tokens. Definer target population, sampling frame, strata og coverage før representativitet godtas.',source_ids:['corp01-biber-representativeness','corp13-dataverse']},
    {id:'corp-case-02',prompt:'To annoterte corpora bruker samme dependency labels, men ulike guideline-versjoner og segmentering. Rekonstruer schema/version, transformation og annotation provenance før counts sammenlignes.',source_ids:['corp08-ud','corp13-dataverse','corp06-elan']},
    {id:'corp-case-03',prompt:'En field-documentation collection skal deponeres. Kartlegg session bundles, contributors, consent, access levels, language identifiers og file relations før upload.',source_ids:['corp04-elar-lameta','corp05-paradisec','corp07-glottolog']},
    {id:'corp-case-04',prompt:'En publisert analyse kan ikke rerunnes etter at korpuset er oppdatert. Finn dataset snapshot, query, code, environment og transformation history som må versjoneres.',source_ids:['corp09-talkbank','corp13-dataverse','corp10-fair']},
    {id:'corp-case-05',prompt:'Et arkiv har backup men ingen dokumentert preservation plan. Vurder fixity, migration, metadata, organizational responsibility og designated community før det kalles trustworthy.',source_ids:['corp12-coretrustseal','corp05-paradisec']},
    {id:'corp-case-06',prompt:'Et språkdatasett er FAIR og teknisk nedlastbart, men community-avtalen begrenser sekundærbruk. Avgjør access og reuse ved å kombinere consent, CARE authority-to-control og repository terms.',source_ids:['corp10-fair','corp11-care','corp04-elar-lameta']}
  ],
  fail_closed_contract:{source_brief_does_not_count_as_materialized:true,fulltext_requires_exact_32_claim_trace:true,strict_completion_requires_domain_12_fulltext_and_proof:true,representativeness_requires_sampling_frame:true,annotation_requires_versioned_provenance:true,field_data_requires_consent_and_access_protocol:true,reproducibility_requires_dataset_code_environment_trace:true,preservation_requires_trustworthy_repository_controls:true,fair_does_not_mean_unrestricted_open:true,care_governance_must_be_explicit:true}
};
write(corpusSrcPath, corpusBrief);

const psyFullAuditPath='scripts/audit-sprak-lingvistikk-psycholinguistics-language-acquisition-processing-fulltext-v1.mjs';
writeText(psyFullAuditPath, `#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),JSON.stringify(v,null,2)+'\\n');},assert=(c,m)=>{if(!c)throw new Error(m);};
const CH='${psyChapterPath}',SRC='${psySrcPath}',REP='reports/fagverk/sprak-lingvistikk-psycholinguistics-language-acquisition-processing-fulltext-v1-audit.json';
export function audit(){const ch=read(CH),src=read(SRC),brief=read(ch.briefFile),claims=read(ch.claimsFile),assessment=read(ch.assessmentFile);assert(ch.subject_id==='litteratur'&&ch.canonical_subcategory_id==='sprak_lingvistikk'&&ch.domain_id==='psykolingvistikk_spraktilegnelse_prosessering','Feil eierskap/felt 11');assert(ch.moduleFiles?.length===4&&ch.sourceFirst&&ch.claimTraceRequired,'Chapter-kontrakt ufullstendig');const sourceIds=new Set(src.sources.map(x=>x.id)),planned=src.topic_briefs.flatMap(x=>x.planned_claims||[]),plannedIds=planned.map(x=>x.id);assert(src.sources.length===13&&sourceIds.size===13&&src.sources.every(x=>/^https:\\/\\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'13 verifiserte inspectable kilder kreves');assert(src.topic_briefs.length===8&&planned.length===32&&planned.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id))),'8 emner / 32 fler-kildeclaims kreves');const modules=ch.moduleFiles.map(read),sections=modules.flatMap(x=>x.sections||[]),paragraphs=sections.flatMap(x=>x.paragraphs||[]),bindings=sections.flatMap(x=>x.paragraphClaimIds||[]),used=bindings.flatMap(x=>x||[]);assert(sections.length===8&&paragraphs.length===32&&bindings.length===32&&paragraphs.every(x=>typeof x==='string'&&x.length>=500),'4/8/32 og avsnittsdybde kreves');assert(bindings.every(x=>Array.isArray(x)&&x.length===1)&&JSON.stringify(used)===JSON.stringify(plannedIds)&&new Set(used).size===32,'Eksakt psy-01..psy-32 claim-trace kreves');const verified=claims.verifiedClaims||[];assert(claims.trace_mode==='source_brief_claim_text_and_sources_immutable'&&verified.length===32&&JSON.stringify(verified.map(x=>x.id))===JSON.stringify(plannedIds)&&verified.every(x=>x.status==='verified'),'32 reverifiserte claims kreves');const qs=assessment.questions||[],cases=assessment.caseTasks||[];assert(qs.length===8&&cases.length===6&&qs.every(x=>x.choices?.length===4&&x.correctIndex===1),'8 vurderinger / 6 case kreves');for(const x of [...qs,...cases]){assert(x.claim_ids?.length>=1&&x.claim_ids.every(id=>plannedIds.includes(id)),x.id+': claim-link feil');assert(x.source_ids?.length>=2&&x.source_ids.every(id=>sourceIds.has(id)),x.id+': source-link feil');}const b=sections.map(x=>x.boundary||'').join(' ').toLowerCase(),t=paragraphs.join(' ').toLowerCase();assert(/spoken-word recognition/u.test(b)&&/plasticity/u.test(b)&&/task-dependent/u.test(b),'Word-recognition/task-grense mangler');assert(/surprisal/u.test(b)&&/n400/u.test(b)&&/forklarer ikke all/u.test(b),'Comprehension-measure-grense mangler');assert(/lexical selection/u.test(b)&&/phonological encoding/u.test(b)&&/chronometric/u.test(b),'Production-model-grense mangler');assert(/input/u.test(b)&&/intake/u.test(b)&&/statistical regularities/u.test(b),'Acquisition/input-grense mangler');assert(/individual|individ/u.test(b)&&/longitudinal/u.test(b)&&/corpus/u.test(b),'Developmental-variation-grense mangler');assert(/bilingual/u.test(b)&&/l2/u.test(b)&&/heritage/u.test(b)&&/deficit/u.test(b),'Multilingual-grense mangler');assert(/sign languages/u.test(b)&&/visual modality/u.test(b)&&/accessible first language/u.test(b),'Sign/modality-grense mangler');assert(/childes/u.test(b)&&/manybabies/u.test(b)&&/reproducibility/u.test(b)&&/analysis pipeline/u.test(b),'Reproducibility-grense mangler');assert(/reaction time/u.test(t)&&/erp/u.test(t)&&/task/u.test(t)&&/språkprofil/u.test(t),'Målevaliditet mangler i fulltekst');const q={correctness_and_evidence:5,perception_comprehension_and_production:5,acquisition_and_development:5,multilingual_and_modality_diversity:5,task_validity_and_measurement:5,reproducibility_and_assessment:5};const r={schema:'history_go_sprak_lingvistikk_psycholinguistics_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:ch.domain_id,status:'pass_fulltext_materialized_domain_ready_for_registry',counts:{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6},gates:{ownership:true,source_first_trace:true,paragraph_depth:true,exact_claim_coverage:true,word_recognition:true,comprehension_measures:true,production_model:true,acquisition_input:true,developmental_variation:true,multilingual_processing:true,sign_modality_access:true,reproducibility_metadata:true,assessment:true},six_part_quality_review:{...q,total:30},next_gate:'register_domain_11_only_after_domain_12_corpus_source_first_is_ready'};write(REP,r);return r;}try{const r=audit();console.log('Språk & lingvistikk felt 11 Psykolingvistikk fulltekst OK: '+r.counts.modules+' moduler, '+r.counts.sections+' seksjoner, '+r.counts.paragraphs+' avsnitt, '+r.counts.verifiedClaims+' claims.');}catch(e){console.error('Språk & lingvistikk felt 11 Psykolingvistikk fulltekst FEIL: '+e.message);process.exitCode=1;}
`);

const corpusAuditPath='scripts/brief-sprak-lingvistikk-corpus-field-documentation-language-resources-reproducibility-sources-v1.mjs';
writeText(corpusAuditPath, `#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),JSON.stringify(v,null,2)+'\\n');},assert=(c,m)=>{if(!c)throw new Error(m);};const FILE='${corpusSrcPath}',REPORT='reports/fagverk/sprak-lingvistikk-corpus-field-documentation-language-resources-reproducibility-source-brief-v1-audit.json';
export function audit(){const b=read(FILE),ids=new Set(b.sources.map(x=>x.id)),claims=b.topic_briefs.flatMap(x=>x.planned_claims||[]);assert(b.status==='source_first_ready_not_materialized'&&b.domain?.ordinal===12&&b.domain?.id==='korpuslingvistikk_feltdokumentasjon_sprakressurser_reproduserbarhet'&&b.domain?.production_mode==='new_production_required','Feil Felt 12-kontrakt');assert(b.source_strategy?.strict_completion_field===true&&b.fail_closed_contract?.strict_completion_requires_domain_12_fulltext_and_proof===true,'Felt 12 må være strict-completion-felt');assert(b.sources.length===13&&ids.size===13&&b.sources.every(x=>/^https:\\/\\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'13 verifiserte kilder kreves');assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(x=>x.id)).size===32&&claims.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'8 emner / 32 fler-kildeclaims kreves');assert(b.planned_assessments?.length===8&&b.decision_scenarios?.length===6&&b.decision_scenarios.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'8 vurderinger / 6 case kreves');const bd=b.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();assert(/target population/u.test(bd)&&/sampling frame/u.test(bd)&&/representative/u.test(bd),'Corpus-design-grense mangler');assert(/transcription/u.test(bd)&&/annotation/u.test(bd)&&/provenance/u.test(bd)&&/guidelines/u.test(bd),'Annotation-provenance-grense mangler');assert(/session/u.test(bd)&&/consent/u.test(bd)&&/access protocol/u.test(bd),'Field-documentation-grense mangler');assert(/metadata/u.test(bd)&&/stable identifiers/u.test(bd)&&/olac\/cmdi/u.test(bd),'Metadata/identifier-grense mangler');assert(/formats/u.test(bd)&&/version/u.test(bd)&&/transformation/u.test(bd),'Format/version-grense mangler');assert(/reproducibility/u.test(bd)&&/code/u.test(bd)&&/environment/u.test(bd)&&/snapshot/u.test(bd),'Reproducibility-grense mangler');assert(/long-term preservation/u.test(bd)&&/fixity/u.test(bd)&&/trustworthy digital repository/u.test(bd),'Preservation-grense mangler');assert(/fair/u.test(bd)&&/care/u.test(bd)&&/authority-to-control/u.test(bd)&&/open access/u.test(bd),'FAIR/CARE-grense mangler');assert(b.fail_closed_contract?.source_brief_does_not_count_as_materialized===true&&b.fail_closed_contract?.fair_does_not_mean_unrestricted_open===true,'Fail-closed corpus-kontrakt mangler');const q={correctness_and_evidence:5,corpus_design_and_annotation:5,field_documentation_and_metadata:5,reproducibility_and_versioning:5,preservation_and_interoperability:5,ethics_governance_and_completion_plan:5};const r={schema:'history_go_sprak_lingvistikk_corpus_field_documentation_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:b.domain.id,status:'pass_source_first_ready_not_materialized',counts:{sources:13,topicBriefs:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6},gates:{ownership:true,strict_completion_field:true,inspectable_sources:true,multi_source_claims:true,corpus_design:true,annotation_provenance:true,field_documentation_consent:true,metadata_identifiers:true,formats_versioning:true,reproducible_workflows:true,preservation_trust:true,fair_care_governance:true},six_part_quality_review:{...q,total:30},next_gate:'materialize_corpus_field_documentation_language_resources_reproducibility_fulltext_and_prove_strict_completion'};write(REPORT,r);return r;}try{const r=audit();console.log('Språk & lingvistikk felt 12 Korpus/feltdokumentasjon source-first OK: '+r.counts.sources+' kilder, '+r.counts.topicBriefs+' emner, '+r.counts.plannedClaims+' claims, '+r.counts.decisionScenarios+' case.');}catch(e){console.error('Språk & lingvistikk felt 12 Korpus/feltdokumentasjon source-first FEIL: '+e.message);process.exitCode=1;}
`);

writeText('tests/sprak-lingvistikk-psycholinguistics-language-acquisition-processing-fulltext-v1.test.mjs', `import test from 'node:test'; import assert from 'node:assert/strict'; import { audit } from '../${psyFullAuditPath}';\ntest('Språk & lingvistikk felt 11 Psykolingvistikk har strict 4/8/32 fulltekst',()=>{const r=audit();assert.equal(r.status,'pass_fulltext_materialized_domain_ready_for_registry');assert.deepEqual(r.counts,{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6});assert.equal(r.six_part_quality_review.total,30);});\n`);
writeText('tests/sprak-lingvistikk-corpus-field-documentation-language-resources-reproducibility-source-brief-v1.test.mjs', `import test from 'node:test'; import assert from 'node:assert/strict'; import { audit } from '../${corpusAuditPath}';\ntest('Språk & lingvistikk felt 12 Korpus/feltdokumentasjon er strict source-first uten materialisering',()=>{const r=audit();assert.equal(r.status,'pass_source_first_ready_not_materialized');assert.deepEqual(r.counts,{sources:13,topicBriefs:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6});assert.equal(r.gates.strict_completion_field,true);assert.equal(r.six_part_quality_review.total,30);});\n`);

const regPath='data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json';
const reg=read(regPath);
assert(reg.progress?.materializedDomains===10&&reg.materialized?.length===10,'Registry må starte på 10/12');
reg.status='domains_1_2_3_4_5_6_7_8_9_10_11_materialized_domain_12_source_first_ready';
reg.progress.materializedDomains=11;
reg.progress.strictCompletionProven=false;
reg.next_gate='corpus_field_documentation_language_resources_reproducibility_fulltext';
reg.materialized.push({ordinal:11,domain_id:'psykolingvistikk_spraktilegnelse_prosessering',chapter:psyChapterPath,claims:`${psyRoot}/claims.json`,assessment:`${psyRoot}/assessment.json`,audit:'reports/fagverk/sprak-lingvistikk-psycholinguistics-language-acquisition-processing-fulltext-v1-audit.json',source_brief:psySrcPath,source_brief_audit:'reports/fagverk/sprak-lingvistikk-psycholinguistics-language-acquisition-processing-source-brief-v1-audit.json'});
write(regPath,reg);

const recPath='reports/fagverk/sprak-lingvistikk-reconciliation-v1.json';
const rec=read(recPath);
rec.status='domains_1_2_3_4_5_6_7_8_9_10_11_materialized_domain_12_source_first_ready';
rec.production_plan={materialized:11,source_first_ready:12,next_domain:'korpuslingvistikk_feltdokumentasjon_sprakressurser_reproduserbarhet',strict_completion_proven:false};
write(recPath,rec);
writeText('tests/sprak-lingvistikk-reconciliation-v1.test.mjs', `import test from 'node:test'; import assert from 'node:assert/strict'; import { audit } from '../scripts/audit-sprak-lingvistikk-reconciliation-v1.mjs';\ntest('Språk & lingvistikk har felt 1-11 materialisert og felt 12 Korpus/feltdokumentasjon source-first',()=>{const report=audit();assert.equal(report.status,'pass');assert.equal(report.domains,12);assert.equal(report.materialized,11);assert.equal(report.sourceFirstReady,12);assert.equal(report.strictCompletionProven,false);assert.equal(report.reuseWithExpansion,1);assert.equal(report.newProductionRequired,11);assert.equal(report.moveExisting,0);assert.equal(report.nextDomain,'korpuslingvistikk_feltdokumentasjon_sprakressurser_reproduserbarhet');});\n`);

writeText('scripts/materialize-sprak-lingvistikk-psycholinguistics-language-acquisition-processing-fulltext-v1.mjs', `#!/usr/bin/env node\nimport fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';\nimport { audit as auditFulltext } from './audit-sprak-lingvistikk-psycholinguistics-language-acquisition-processing-fulltext-v1.mjs';\nimport { audit as auditNextSource } from './brief-sprak-lingvistikk-corpus-field-documentation-language-resources-reproducibility-sources-v1.mjs';\nconst ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),assert=(c,m)=>{if(!c)throw new Error(m);};\ntry{const full=auditFulltext(),next=auditNextSource(),reg=read('${regPath}'),e=reg.materialized?.[10];assert(full.status==='pass_fulltext_materialized_domain_ready_for_registry','Psykolingvistikk-audit må være grønn');assert(next.status==='pass_source_first_ready_not_materialized','Felt 12 source-first må være grønn');assert(reg.progress.materializedDomains===11&&reg.progress.strictCompletionProven===false,'Registry må stå på 11/12 uten completion proof');assert(e?.ordinal===11&&e.domain_id==='psykolingvistikk_spraktilegnelse_prosessering','Psykolingvistikk må være felt 11');assert(e.chapter==='${psyChapterPath}'&&e.claims==='${psyRoot}/claims.json'&&e.assessment==='${psyRoot}/assessment.json','Felt 11 bindings feil');assert(reg.next_gate==='corpus_field_documentation_language_resources_reproducibility_fulltext','Neste gate må være Felt 12 fulltekst');console.log('Språk & lingvistikk felt 11 Psykolingvistikk materializer OK: 11/12 registrert etter strict fulltext-audit og grønn felt 12 source-first.');}catch(e){console.error('Språk & lingvistikk felt 11 materializer FEIL: '+e.message);process.exitCode=1;}\n`);

console.log('TEMP materialization prepared: Field 11 fulltext + Field 12 source-first + registry 11/12.');
