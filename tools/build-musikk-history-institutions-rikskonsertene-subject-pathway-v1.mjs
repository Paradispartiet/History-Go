#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'data/quiz/musikk/musikk_subject_pathways_v1.json';
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const clean = (value) => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value : [];
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const absolute = path.join(ROOT, FILE);
const original = fs.readFileSync(absolute, 'utf8');
const pkg = JSON.parse(original);
if (pkg.categoryId !== 'musikk' || pkg.subject_id !== 'musikk') throw new Error('Uventet Musikk pathway-pakke');

const INSTITUTION = Object.freeze({
  emne: 'em_musikk_vit_institusjoner_patronat_offentlighet',
  target: 'subject_musikk_institusjoner_patronat_offentlighet',
  domain: 'historisk_musikkvitenskap_historiografi',
  claim: 'claim_musikk_history_rikskonsertene_public_patronage_2007_2008',
  object: 'obj_rikskonsertene_stmeld21_2007_2008_institutional_financing',
  stmeld: 'prod_src_stmeld21_2007_2008_rikskonsertene',
  result2007: 'prod_src_stprp1_2008_2009_rikskonsertene_resultat_2007',
  langdalen: 'prod_src_langdalen_musikkliv_musikkpolitikk_2008',
  result2011: 'prod_src_prop1s_2012_2013_rikskonsertene_resultat_2011',
  method: 'institusjons_policyanalyse',
  objectUrl: 'https://www.regjeringen.no/no/dokumenter/stmeld-nr-21-2007-2008-/id509182/?ch=2',
  evidenceFile: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/institusjoner_patronat_offentlighet.json'
});

const newSources = [
  {
    id: INSTITUTION.stmeld,
    type: 'official_public_document_production_extension',
    title: 'St.meld. nr. 21 (2007–2008) Samspill. Et løft for rytmisk musikk',
    publisher_or_author: 'Kultur- og kirkedepartementet',
    date_or_version: '2008; section 2.10.5 Rikskonsertene',
    url: INSTITUTION.objectUrl,
    status: 'reviewed_official_public_document_fulltext'
  },
  {
    id: INSTITUTION.result2007,
    type: 'official_public_document_production_extension',
    title: 'St.prp. nr. 1 (2008–2009)',
    publisher_or_author: 'Kultur- og kirkedepartementet',
    date_or_version: '2008; Rapport 2007 – Rikskonsertene',
    url: 'https://www.regjeringen.no/no/dokumenter/stprp-nr-1-2008-2009-/id530038/?ch=2',
    status: 'reviewed_official_public_document_fulltext'
  },
  {
    id: INSTITUTION.langdalen,
    type: 'research_report_production_extension',
    title: 'Musikkliv og musikkpolitikk: en utredning om musikkensemblene i Norge',
    publisher_or_author: 'Jørgen Langdalen / Kulturrådet',
    date_or_version: '2. utgave, 2008; ISBN 978-82-7081-140-3',
    url: 'https://www.kulturdirektoratet.no/publikasjoner/musikkliv-og-musikkpolitikk-2-utg',
    status: 'reviewed_research_report_fulltext'
  },
  {
    id: INSTITUTION.result2011,
    type: 'official_public_document_production_extension',
    title: 'Prop. 1 S (2012–2013)',
    publisher_or_author: 'Kulturdepartementet',
    date_or_version: '2012; Rapport 2011 – Rikskonsertene',
    url: 'https://www.regjeringen.no/no/dokumenter/prop-1-s-20122013/id702466/?ch=2',
    status: 'reviewed_official_public_document_fulltext'
  },
  {
    id: INSTITUTION.object,
    type: 'direct_research_object_institutional_document',
    title: 'St.meld. nr. 21 (2007–2008), section 2.10.5 Rikskonsertene',
    publisher_or_author: 'Kultur- og kirkedepartementet',
    date_or_version: '2007–2008; section 2.10.5',
    url: INSTITUTION.objectUrl,
    status: 'direct_object_verified',
    object_type: 'institusjonsdokument',
    use_mode: 'external_link_and_metadata_only',
    license: 'Official parliamentary preparatory document; direct-object delivery is external link and metadata only',
    commercial_compatibility_with_history_go: 'resolved_public_document_text'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

const appendUnique = (values, value) => [...list(values).filter((item) => clean(item) !== value), value];
pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_9x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: appendUnique(pkg.production_context?.released_evidence_files, INSTITUTION.evidenceFile),
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: appendUnique(pkg.production_context?.question_ready_claim_ids, INSTITUTION.claim),
  direct_object_ids: appendUnique(pkg.production_context?.direct_object_ids, INSTITUTION.object),
  released_emne_ids: appendUnique(pkg.production_context?.released_emne_ids, INSTITUTION.emne),
  blocked_canonical_topic_count: 39,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  INSTITUTION.evidenceFile
];
const sourceRef = (sourceId, locator, claimBasis) => ({ source_id: sourceId, locator, claim_basis: claimBasis });
const objectRef = (locator, claimBasis) => ({
  source_id: INSTITUTION.object,
  locator,
  use_mode: 'external_link_and_metadata_only',
  url: INSTITUTION.objectUrl,
  claim_basis: claimBasis
});

const institutionSet = {
  set_id: 'pathway_musikk_institusjoner_patronat_offentlighet',
  title: 'Institusjoner, patronat og offentlighet',
  level: 9,
  order: 9,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: INSTITUTION.target,
  area_id: INSTITUTION.domain,
  emne_id: INSTITUTION.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [INSTITUTION.object],
  question_ready_claim_ids: [INSTITUTION.claim],
  questions: [
    {
      id: 'quiz_musikk_institusjoner_pathway_q1',
      quiz_id: 'musikk_institusjoner_pathway_q1',
      categoryId: 'musikk',
      targetId: INSTITUTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilken ressurskobling er eksplisitt dokumentert for Rikskonsertene i 2008?',
      options: [
        'Ordningen var finansiert bare av private konsertsponsorer uten statlig bevilgning',
        'Staten bevilget 139,406 mill. kroner, og ordningen hadde i tillegg 19 mill. kroner årlig i sentrale DKS-midler',
        'Skolekonsertene ble drevet uten institusjonell finansiering og uten offentlige avtaler'
      ],
      answer: 'Staten bevilget 139,406 mill. kroner, og ordningen hadde i tillegg 19 mill. kroner årlig i sentrale DKS-midler',
      answerIndex: 1,
      knowledge: 'St.meld. nr. 21 dokumenterer Rikskonsertene som statlig institusjon med 139,406 mill. kroner i 2008-bevilgning og 19 mill. kroner årlig i sentrale DKS-midler siden 2004.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: INSTITUTION.emne,
      method_id: INSTITUTION.method,
      direct_object_id: INSTITUTION.object,
      core_concepts: ['offentlig finansiering', 'institusjon', 'patronat'],
      concept_ids: [],
      terms: ['offentlig finansiering', 'institusjon', 'patronat'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_institusjoner_observe',
      evidence_type: 'institutional_resource_observation',
      knowledge_payload: {
        summary: 'St.meld. nr. 21 dokumenterer et konkret statlig ressursgrunnlag for Rikskonsertene i 2008.',
        explanation: 'Dokumentet identifiserer Rikskonsertene som statlig institusjon og oppgir både driftsbevilgningen og de sentrale DKS-midlene som inngikk i skolekonsertmekanismen.',
        why_it_matters: 'Institusjonshistorie trenger et identifiserbart ressurs- og beslutningsledd før virkninger eller gjennomføring vurderes.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(INSTITUTION.stmeld, 'St.meld. nr. 21 (2007–2008) :: 2.10.5 Rikskonsertene :: NOK 139,406,000 allocation + NOK 19 million DKS funds', 'Rikskonsertene hadde et dokumentert offentlig ressursgrunnlag i 2008.'),
        objectRef('St.meld. nr. 21 (2007–2008) :: section 2.10.5', 'Direct object identifiserer den institusjonelle ressursbeslutningen.')
      ],
      source_origin: 'external',
      claim_basis: 'Rikskonsertene hadde et dokumentert offentlig ressursgrunnlag med statlig bevilgning og DKS-midler i 2008.',
      guidance_basis: guidance,
      claim_id: INSTITUTION.claim
    },
    {
      id: 'quiz_musikk_institusjoner_pathway_q2',
      quiz_id: 'musikk_institusjoner_pathway_q2',
      categoryId: 'musikk',
      targetId: INSTITUTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor er resultatrapporten for 2007 nødvendig i tillegg til budsjett- og mandatdokumentet?',
      options: [
        'Fordi budsjettdokumentet allerede måler opplevelseskvalitet og resultatrapporten bare gjentar målformuleringer',
        'Fordi resultatrapporten kan brukes til å bevise at alle elever hadde identisk tilgang og opplevelse',
        'Fordi ressurser og mandat viser styringsintensjon, mens en separat rapport dokumenterer faktisk konsertproduksjon, musikere og regional gjennomføring'
      ],
      answer: 'Fordi ressurser og mandat viser styringsintensjon, mens en separat rapport dokumenterer faktisk konsertproduksjon, musikere og regional gjennomføring',
      answerIndex: 2,
      knowledge: 'En bevilgning eller et institusjonsmandat er ikke i seg selv bevis på gjennomføring. St.prp. nr. 1 dokumenterer 2007-aktiviteten med 9 100 skolekonserter, om lag 800 turnerende musikere og om lag 60 prosent regional produksjon.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: INSTITUTION.emne,
      method_id: INSTITUTION.method,
      direct_object_id: INSTITUTION.object,
      core_concepts: ['styringsintensjon', 'implementering', 'resultatrapportering'],
      concept_ids: [],
      terms: ['styringsintensjon', 'implementering', 'resultatrapportering'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_institusjoner_explain',
      evidence_type: 'institutional_implementation_explanation',
      knowledge_payload: {
        summary: 'Budsjett og mandat må skilles fra faktisk gjennomføring; 2007-resultatrapporten kontrollerer aktivitetsleddet.',
        explanation: 'St.meldingen etablerer ressurser og rammer. Den separate resultatrapporten viser at ordningen faktisk produserte tusenvis av skolekonserter gjennom et landsomfattende og delvis regionalisert system.',
        why_it_matters: 'Skillet hindrer at politiske mål eller bevilgninger automatisk tolkes som realiserte effekter.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(INSTITUTION.stmeld, 'St.meld. nr. 21 :: 2.10.5 :: financing and remit', 'Budsjettdokumentet viser ressurser og styringsrammer.'),
        sourceRef(INSTITUTION.result2007, 'St.prp. nr. 1 (2008–2009) :: Rapport 2007 :: 9,100 school concerts / about 800 touring musicians / about 60% regional production', 'Resultatrapporten dokumenterer faktisk gjennomføring på aktivitetsnivå.')
      ],
      source_origin: 'external',
      claim_basis: 'En separat resultatrapport er nødvendig for å skille institusjonens ressurser og mål fra dokumentert gjennomføring.',
      guidance_basis: guidance,
      claim_id: INSTITUTION.claim
    },
    {
      id: 'quiz_musikk_institusjoner_pathway_q3',
      quiz_id: 'musikk_institusjoner_pathway_q3',
      categoryId: 'musikk',
      targetId: INSTITUTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede beskriver mest presist det frigitte Rikskonsertene-claimet?',
      options: [
        'Offentlige ressurser og honorarrammer → dokumentert skolekonsertproduksjon og musikeroppdrag → avgrenset arbeidsmarkedsfunn hos Langdalen, med 2011 bare som kontinuitetskontroll',
        'Statsbevilgning → automatisk lik kulturell tilgang → dokumentert varig karrieresuksess for alle norske musikere',
        'Konserttall alene → bevist representativ programmering og identisk opplevelseskvalitet for alle elever'
      ],
      answer: 'Offentlige ressurser og honorarrammer → dokumentert skolekonsertproduksjon og musikeroppdrag → avgrenset arbeidsmarkedsfunn hos Langdalen, med 2011 bare som kontinuitetskontroll',
      answerIndex: 0,
      knowledge: 'Den frigitte kjeden binder offentlige ressurser til institusjonell gjennomføring og et avgrenset arbeids-/formidlingsspor, uten å gjøre aktivitetsdata til kvalitets- eller kausalitetsmål.',
      difficulty: 4,
      question_type: 'comparison',
      emne_id: INSTITUTION.emne,
      method_id: INSTITUTION.method,
      direct_object_id: INSTITUTION.object,
      core_concepts: ['ressurskjede', 'institusjonell implementering', 'arbeidsmarked'],
      concept_ids: [],
      terms: ['ressurskjede', 'institusjonell implementering', 'arbeidsmarked'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_institusjoner_evaluate_evidence',
      evidence_type: 'institutional_policy_chain',
      knowledge_payload: {
        summary: 'Claimet følger ressurser og rammer til dokumentert gjennomføring og et separat, avgrenset arbeidsmarkedsfunn.',
        explanation: 'St.meldingen gir ressurs- og kontraktsleddet, 2007-resultatrapporten gir aktivitetsleddet, Langdalen gir et separat informantbasert arbeidsfunn, og 2011-rapporten brukes bare til kontinuitetskontroll.',
        why_it_matters: 'En institusjonsanalyse blir sterkere når beslutning, gjennomføring og observerte praksisspor holdes analytisk adskilt.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(INSTITUTION.stmeld, 'St.meld. nr. 21 :: allocation, DKS funds and remuneration', 'Ressurs- og kontraktsleddet er eksplisitt dokumentert.'),
        sourceRef(INSTITUTION.result2007, 'St.prp. nr. 1 :: Rapport 2007 activity fields', 'Gjennomføringen er kontrollert i separat offentlig resultatrapport.'),
        sourceRef(INSTITUTION.langdalen, 'Langdalen 2008 :: chapter 2, p. 89', 'Arbeidsmarkedsfunnet er avgrenset til informanter og musikere som fikk oppdrag.'),
        sourceRef(INSTITUTION.result2011, 'Prop. 1 S (2012–2013) :: Rapport 2011', '2011 brukes som kontinuitetskontroll, ikke som enkeltårsak.')
      ],
      source_origin: 'external',
      claim_basis: 'Den dokumenterte kjeden går fra offentlig ressurs og institusjonelle rammer til faktisk gjennomføring og et avgrenset arbeids-/formidlingsspor.',
      guidance_basis: guidance,
      claim_id: INSTITUTION.claim
    },
    {
      id: 'quiz_musikk_institusjoner_pathway_q4',
      quiz_id: 'musikk_institusjoner_pathway_q4',
      categoryId: 'musikk',
      targetId: INSTITUTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken konklusjon går lenger enn det frigitte institusjonsmaterialet tillater?',
      options: [
        'At Rikskonsertene hadde dokumenterte offentlige ressurser og en landsomfattende skolekonsertmekanisme',
        'At konsert- og besøkstallene beviser lik faktisk tilgang og kvalitet for alle, og at ordningen alene skapte varig karrieresuksess for musikere',
        'At Langdalens funn kan brukes som et avgrenset spor om inntektsbetydning for enkelte musikere som fikk oppdrag'
      ],
      answer: 'At konsert- og besøkstallene beviser lik faktisk tilgang og kvalitet for alle, og at ordningen alene skapte varig karrieresuksess for musikere',
      answerIndex: 1,
      knowledge: 'Aktivitetsdata måler produksjon og organisatorisk rekkevidde, ikke lik opplevd tilgang eller kvalitet. Langdalens informantfunn gjelder dessuten musikere med oppdrag og kan ikke gjøres til en populasjons- eller karrierekausalitetspåstand.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: INSTITUTION.emne,
      method_id: INSTITUTION.method,
      direct_object_id: INSTITUTION.object,
      core_concepts: ['effektgrense', 'aktivitetsdata', 'kausalitet'],
      concept_ids: [],
      terms: ['effektgrense', 'aktivitetsdata', 'kausalitet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_institusjoner_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Korpuset kan ikke bære påstander om lik faktisk tilgang, lik kvalitet eller at Rikskonsertene alene skapte langsiktig karrieresuksess.',
        explanation: 'Konsert- og besøkstall er aktivitetsmål. Langdalen er et avgrenset informantspor, og 2011-resultatene er bare en kontinuitetskontroll. Ingen av delene er et representativt kausalt effektdesign.',
        why_it_matters: 'Dette er skillet mellom dokumentert institusjonell implementering og en langt sterkere effektpåstand.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(INSTITUTION.result2007, 'St.prp. nr. 1 :: activity and attendance fields', 'Aktivitetsdata dokumenterer produksjon, ikke lik tilgang eller kvalitet.'),
        sourceRef(INSTITUTION.langdalen, 'Langdalen 2008 :: p. 89 :: informant-based labor trace', 'Arbeidsfunnet gjelder et avgrenset utvalg og kan ikke generaliseres til alle musikere.'),
        sourceRef(INSTITUTION.result2011, 'Prop. 1 S 2012–2013 :: continuity report', 'Senere kontinuitet er ikke bevis på én enkelt årsak.')
      ],
      source_origin: 'external',
      claim_basis: 'Aktivitets- og informantdata støtter den avgrensede institusjonskjeden, men ikke lik tilgang, lik kvalitet eller langsiktig karrierekausalitet.',
      guidance_basis: guidance,
      claim_id: INSTITUTION.claim
    },
    {
      id: 'quiz_musikk_institusjoner_pathway_q5',
      quiz_id: 'musikk_institusjoner_pathway_q5',
      categoryId: 'musikk',
      targetId: INSTITUTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go levere det valgte St.meld.-objektet når object-gaten er låst til external_link_and_metadata_only?',
      options: [
        'Kopiere hele dokumentet og alle innebygde tredjepartsbilder inn i History Go',
        'Endre dokumentteksten og republisere den uten kildeidentitet fordi det er et offentlig dokument',
        'Vise ekstern lenke og dokumentmetadata; offentlige tall og parafraserte funn kan bæres av kildeevidensen uten å rehoste selve direct objectet'
      ],
      answer: 'Vise ekstern lenke og dokumentmetadata; offentlige tall og parafraserte funn kan bæres av kildeevidensen uten å rehoste selve direct objectet',
      answerIndex: 2,
      knowledge: 'Den canonicale object-gaten krever external_link_and_metadata_only fordi objektet er markert ikke-redistribuerbart i History Go. Offentlige fakta kan fortsatt brukes gjennom kildehenvisninger og parafraser.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: INSTITUTION.emne,
      method_id: INSTITUTION.method,
      direct_object_id: INSTITUTION.object,
      core_concepts: ['rettigheter', 'direct object', 'offentlig dokument'],
      concept_ids: [],
      terms: ['rettigheter', 'direct object', 'offentlig dokument'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_institusjoner_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Direct object leveres som ekstern lenke og metadata; History Go rehoster ikke dokumentet eller tredjepartsinnholdet.',
        explanation: 'Object-kontrakten og CI-validatoren skiller selve direct-object-leveransen fra bruk av dokumenterte offentlige fakta i source-evidensen. Dermed kan spørsmål referere til tall og parafraserte funn uten å republisere dokumentet.',
        why_it_matters: 'Rights-gaten gjør leveringsmåten eksplisitt og reproduserbar selv når kilden er et offentlig dokument.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        objectRef('St.meld. nr. 21 direct-object rights :: external_link_and_metadata_only', 'Det valgte institusjonsdokumentet leveres bare som ekstern lenke og metadata.')
      ],
      source_origin: 'external',
      claim_basis: 'Direct object må leveres som external_link_and_metadata_only; dokumenterte offentlige fakta kan brukes via kildeevidens og parafrase.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== INSTITUTION.emne);
pkg.sets.push(institutionSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Institusjoner, patronat og offentlighet-pathway skrevet som sett 9.');
  } else {
    console.error('Institusjons/pathway er utdatert. Kjør node tools/build-musikk-history-institutions-rikskonsertene-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Institusjoner, patronat og offentlighet sett 9 OK.');
}
