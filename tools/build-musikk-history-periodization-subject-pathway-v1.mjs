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

const PERIODIZATION = Object.freeze({
  emne: 'em_musikk_vit_periodisering_anakronisme',
  target: 'subject_musikk_periodisering_anakronisme',
  domain: 'historisk_musikkvitenskap_historiografi',
  claim: 'claim_musikk_history_periodization_ottoman_turkish_models_source_dependency',
  object: 'obj_firat_periodization_ottoman_turkish_2019_article',
  firat: 'prod_src_firat_periodization_ottoman_turkish_2019',
  berker: 'prod_src_berker_turk_musikisinde_donemler_1985',
  uslu: 'prod_src_uslu_new_periodization_turkish_music_2015',
  method: 'historiografisk_analyse',
  objectUrl: 'https://dergipark.org.tr/tr/pub/yillik/article/666278',
  evidenceFile: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/periodisering_stil_epoke_anakronisme.json'
});

const newSources = [
  {
    id: PERIODIZATION.firat,
    type: 'peer_reviewed_article_production_extension',
    title: 'Dönemlendirme Çalışmaları ve Osmanlı-Türk Müziği Tarihyazımı: Bir Bilanço Denemesi',
    publisher_or_author: 'Hasan Baran Fırat / YILLIK: Annual of Istanbul Studies',
    date_or_version: '2019; 1(1), 145–164; DOI 10.53979/yillik.2019.8',
    url: PERIODIZATION.objectUrl,
    status: 'reviewed_open_access_fulltext'
  },
  {
    id: PERIODIZATION.berker,
    type: 'peer_reviewed_article_production_extension',
    title: 'Türk Musikisinde Dönemler',
    publisher_or_author: 'Ercümend Berker / Erdem',
    date_or_version: '1985; 1(1), 147–168; DOI 10.32704/erdem.1985.1.147',
    url: 'https://dergipark.org.tr/tr/pub/erdem/issue/44594/553290',
    status: 'reviewed_open_access_fulltext'
  },
  {
    id: PERIODIZATION.uslu,
    type: 'peer_reviewed_article_production_extension',
    title: 'Türk Müziği Tarihinde Yeni Bir Dönemlendirme Önerisi',
    publisher_or_author: 'Recep Uslu / Medeniyet Sanat',
    date_or_version: '2015; 1(2), 91–109',
    url: 'https://dergipark.org.tr/tr/pub/medeniyetsanat/issue/24956/263424',
    status: 'reviewed_open_access_fulltext'
  },
  {
    id: PERIODIZATION.object,
    type: 'direct_research_object_scholarly_publication',
    title: 'Fırat 2019: Periodization and Ottoman-Turkish Music Historiography',
    publisher_or_author: 'Hasan Baran Fırat / YILLIK: Annual of Istanbul Studies',
    date_or_version: '2019; 1(1), 145–164; DOI 10.53979/yillik.2019.8',
    url: PERIODIZATION.objectUrl,
    status: 'direct_object_verified',
    object_type: 'fagpublikasjon',
    use_mode: 'external_link_and_metadata_only',
    license: 'Open-access publication; no separate History Go redistribution license asserted',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

const appendUnique = (values, value) => [...list(values).filter((item) => clean(item) !== value), value];
pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_10x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: appendUnique(pkg.production_context?.released_evidence_files, PERIODIZATION.evidenceFile),
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: appendUnique(pkg.production_context?.question_ready_claim_ids, PERIODIZATION.claim),
  direct_object_ids: appendUnique(pkg.production_context?.direct_object_ids, PERIODIZATION.object),
  released_emne_ids: appendUnique(pkg.production_context?.released_emne_ids, PERIODIZATION.emne),
  blocked_canonical_topic_count: 38,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  PERIODIZATION.evidenceFile
];
const sourceRef = (sourceId, locator, claimBasis) => ({ source_id: sourceId, locator, claim_basis: claimBasis });
const objectRef = (locator, claimBasis) => ({
  source_id: PERIODIZATION.object,
  locator,
  use_mode: 'external_link_and_metadata_only',
  url: PERIODIZATION.objectUrl,
  claim_basis: claimBasis
});

const periodizationSet = {
  set_id: 'pathway_musikk_periodisering_anakronisme',
  title: 'Periodisering og anakronisme',
  level: 10,
  order: 10,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: PERIODIZATION.target,
  area_id: PERIODIZATION.domain,
  emne_id: PERIODIZATION.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [PERIODIZATION.object],
  question_ready_claim_ids: [PERIODIZATION.claim],
  questions: [
    {
      id: 'quiz_musikk_periodisering_pathway_q1',
      quiz_id: 'musikk_periodisering_pathway_q1',
      categoryId: 'musikk',
      targetId: PERIODIZATION.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hva kjennetegner Berkers periodisering i det frigitte korpuset?',
      options: [
        'Den organiserer historien gjennom komponistgrenser og etiketter som klassisk, neoklassisk, romantisk og reform',
        'Den avviser alle navngitte komponister og bruker bare arkeologiske dateringer',
        'Den deler historien utelukkende etter plateformat og strømmetjenester'
      ],
      answer: 'Den organiserer historien gjennom komponistgrenser og etiketter som klassisk, neoklassisk, romantisk og reform',
      answerIndex: 0,
      knowledge: 'Berker 1985 bruker en sekvens av navngitte perioder og komponistgrenser. Modellen gjør bestemte komponister, stilbetegnelser og moderniseringsbrudd særlig synlige.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: PERIODIZATION.emne,
      method_id: PERIODIZATION.method,
      direct_object_id: PERIODIZATION.object,
      core_concepts: ['periodisering', 'komponistgrense', 'historiografisk modell'],
      concept_ids: [],
      terms: ['periodisering', 'komponistgrense', 'historiografisk modell'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_periodisering_observe',
      evidence_type: 'periodization_model_observation',
      knowledge_payload: {
        summary: 'Berkers modell periodiserer gjennom komponistgrenser og stil-/epokeetiketter.',
        explanation: 'Den forberedende, klassiske, neoklassiske, romantiske og reformorienterte sekvensen er et konkret historiografisk valg, ikke en nøytral kalender.',
        why_it_matters: 'Før modeller sammenlignes må kriteriene og grensene i hver modell identifiseres presist.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(PERIODIZATION.berker, 'Berker 1985 :: period headings and composer boundaries', 'Berkers modell bruker navngitte perioder og komponistgrenser.'),
        objectRef('Fırat 2019 pp. 155–156 :: Table 2', 'Fırat gjengir og kontekstualiserer Berkers periodisering som direct-object-evidens.')
      ],
      source_origin: 'external',
      claim_basis: 'Berker organiserer den undersøkte historien gjennom komponistgrenser og navngitte stil-/epokefaser.',
      guidance_basis: guidance,
      claim_id: PERIODIZATION.claim
    },
    {
      id: 'quiz_musikk_periodisering_pathway_q2',
      quiz_id: 'musikk_periodisering_pathway_q2',
      categoryId: 'musikk',
      targetId: PERIODIZATION.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor er Uslus kronologi en reell alternativ periodisering, ikke bare nye navn på Berkers faser?',
      options: [
        'Fordi Uslu beholder alle Berkers grenser uendret og oversetter bare etikettene',
        'Fordi Uslu bruker de samme komponistene, men sorterer dem alfabetisk',
        'Fordi Uslu skifter organiserende kriterium til kilderegimer og historiografiske faser som arkeologisk, paleografisk, systematikere, klassisk og popularisering'
      ],
      answer: 'Fordi Uslu skifter organiserende kriterium til kilderegimer og historiografiske faser som arkeologisk, paleografisk, systematikere, klassisk og popularisering',
      answerIndex: 2,
      knowledge: 'Uslu 2015 endrer både kriterium og hvilke kilder som kan bære historien. Arkeologiske, paleografiske og systematiske kilderegimer gjør andre tidsrom, praksiser og aktører synlige enn en komponist- og stilbasert sekvens.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: PERIODIZATION.emne,
      method_id: PERIODIZATION.method,
      direct_object_id: PERIODIZATION.object,
      core_concepts: ['alternativ kronologi', 'kilderegime', 'samtidighet'],
      concept_ids: [],
      terms: ['alternativ kronologi', 'kilderegime', 'samtidighet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_periodisering_explain',
      evidence_type: 'periodization_criteria_explanation',
      knowledge_payload: {
        summary: 'Uslu endrer periodiseringens organiserende kriterium fra komponist-/stilgrenser til skiftende kilderegimer.',
        explanation: 'Når kriteriet endres, endres også historiens startpunkt, overgangspunkter og hvilke typer evidens og praksiser som får plass.',
        why_it_matters: 'To modeller er analytisk forskjellige når de produserer ulike historiske kart, ikke bare ulike etiketter.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(PERIODIZATION.uslu, 'Uslu 2015 pp. 98–107 :: Archaeological, Paleographic, Systematists, Classical and Popularization sequence', 'Uslu organiserer historien gjennom andre kilderegimer og overgangskriterier.'),
        sourceRef(PERIODIZATION.firat, 'Fırat 2019 :: comparison of periodization criteria', 'Fırats sammenligning viser at kriterievalg endrer hva periodene fremhever.')
      ],
      source_origin: 'external',
      claim_basis: 'Uslu tilbyr en alternativ kronologi fordi kilderegime, startpunkt og overgangskriterier avviker fra Berkers modell.',
      guidance_basis: guidance,
      claim_id: PERIODIZATION.claim
    },
    {
      id: 'quiz_musikk_periodisering_pathway_q3',
      quiz_id: 'musikk_periodisering_pathway_q3',
      categoryId: 'musikk',
      targetId: PERIODIZATION.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hva viser utvidelsen av Kevserî-korpuset om periodiseringsgrenser?',
      options: [
        'At alle tidligere stilobservasjoner automatisk blir ugyldige når én ny kilde finnes',
        'At slutninger bygget på et lite publisert utvalg kan måtte revurderes når et større notekorpus blir tilgjengelig',
        'At perioder kan fastsettes uten å oppgi hvilke kilder eller repertoarer analysen bygger på'
      ],
      answer: 'At slutninger bygget på et lite publisert utvalg kan måtte revurderes når et større notekorpus blir tilgjengelig',
      answerIndex: 1,
      knowledge: 'Fırat dokumenterer at enkelte 1700-tallsslutninger hos Feldman og Wright bygde på få publiserte Kevserî-peşrever. Et større notekorpus krevde revisjon av noen konklusjoner, men ikke total forkastelse av all stilhistorie.',
      difficulty: 4,
      question_type: 'evidence',
      emne_id: PERIODIZATION.emne,
      method_id: PERIODIZATION.method,
      direct_object_id: PERIODIZATION.object,
      core_concepts: ['korpus', 'kildeseleksjon', 'revisjon'],
      concept_ids: [],
      terms: ['korpus', 'kildeseleksjon', 'revisjon'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_periodisering_evaluate_evidence',
      evidence_type: 'source_corpus_evaluation',
      knowledge_payload: {
        summary: 'Kevserî-eksemplet viser at periodiseringsgrenser er følsomme for hvilke kilder som er tilgjengelige og valgt.',
        explanation: 'Når et lite publisert utvalg erstattes av et større korpus, kan trekk som virket typiske eller tidsavgrensede måtte vurderes på nytt.',
        why_it_matters: 'En robust periodisering må oppgi korpus, eksklusjoner og alternative forklaringer, ikke bare periodens navn.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(PERIODIZATION.firat, 'Fırat 2019 pp. 157–158 :: Kevserî source-base critique and corpus expansion', 'Et større Kevserî-korpus krevde revisjon av enkelte slutninger basert på få publiserte stykker.'),
        objectRef('Fırat 2019 pp. 157–158 :: source-expansion locator', 'Direct object dokumenterer sammenhengen mellom kildeutvalg og periodiseringsslutning.')
      ],
      source_origin: 'external',
      claim_basis: 'Kevserî-korpusets utvidelse dokumenterer at enkelte periodiseringsslutninger var avhengige av et begrenset kildeutvalg.',
      guidance_basis: guidance,
      claim_id: PERIODIZATION.claim
    },
    {
      id: 'quiz_musikk_periodisering_pathway_q4',
      quiz_id: 'musikk_periodisering_pathway_q4',
      categoryId: 'musikk',
      targetId: PERIODIZATION.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken konklusjon går lenger enn det frigitte periodiseringskorpuset tillater?',
      options: [
        'Berkers modell er den objektivt riktige kronologien for alle osmanske og tyrkiske regioner, sjangre, grupper og muntlige praksiser',
        'Berkers, Uslus og Feldmans modeller bruker ulike kriterier og gjør derfor forskjellige historiske trekk synlige',
        'Kevserî-eksemplet viser at et begrenset kildeutvalg kan påvirke hvor sikre overgangspunktene er'
      ],
      answer: 'Berkers modell er den objektivt riktige kronologien for alle osmanske og tyrkiske regioner, sjangre, grupper og muntlige praksiser',
      answerIndex: 0,
      knowledge: 'Korpuset er avgrenset og modellene har ulik geografisk, repertoarmessig og kildemessig rekkevidde. Institusjonell utbredelse eller pedagogisk bruk gjør ikke én modell universelt empirisk gyldig.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: PERIODIZATION.emne,
      method_id: PERIODIZATION.method,
      direct_object_id: PERIODIZATION.object,
      core_concepts: ['anakronisme', 'overgeneralisering', 'omfang'],
      concept_ids: [],
      terms: ['anakronisme', 'overgeneralisering', 'omfang'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_periodisering_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Det frigitte korpuset kan ikke gjøre én periodisering universelt riktig for alle regioner, praksiser og kildetradisjoner.',
        explanation: 'Berkers utbredelse dokumenterer bruk, ikke naturgitt gyldighet. Uslu og Feldman har dessuten andre omfang og kriterier, og Kevserî-eksemplet viser kildeavhengighet.',
        why_it_matters: 'Periodisering blir anakronistisk når en senere eller lokalt avgrenset modell projiseres som universell tidsorden.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(PERIODIZATION.firat, 'Fırat 2019 pp. 155–158 :: model comparison, institutional use and source critique', 'Fırat dokumenterer modellforskjeller og kildeavhengighet, ikke en universelt riktig kronologi.'),
        sourceRef(PERIODIZATION.uslu, 'Uslu 2015 :: alternative source-regime chronology and scope', 'Uslus alternative modell synliggjør at periodiseringskriterier og omfang kan organiseres annerledes.')
      ],
      source_origin: 'external',
      claim_basis: 'Korpuset støtter sammenligning av kildeavhengige modeller, men ikke universalisering av én kronologi.',
      guidance_basis: guidance,
      claim_id: PERIODIZATION.claim
    },
    {
      id: 'quiz_musikk_periodisering_pathway_q5',
      quiz_id: 'musikk_periodisering_pathway_q5',
      categoryId: 'musikk',
      targetId: PERIODIZATION.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go levere Fırat-artikkelen når direct object er låst til external_link_and_metadata_only?',
      options: [
        'Kopiere artikkel-PDF-en, tabellene og figurene inn i appen uten separat lisens',
        'Oversette og republisere hele artikkelen som egen History Go-tekst uten å vise original identitet',
        'Vise ekstern lenke, bibliografisk identitet, DOI og lokatorer, og bruke bare parafraserte funn i spørsmålene'
      ],
      answer: 'Vise ekstern lenke, bibliografisk identitet, DOI og lokatorer, og bruke bare parafraserte funn i spørsmålene',
      answerIndex: 2,
      knowledge: 'Direct object leveres som ekstern lenke og metadata. History Go kan bruke kontrollerte, parafraserte funn og presise lokatorer, men republiserer ikke PDF, tabeller eller figurer.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: PERIODIZATION.emne,
      method_id: PERIODIZATION.method,
      direct_object_id: PERIODIZATION.object,
      core_concepts: ['rettigheter', 'fagpublikasjon', 'metadata'],
      concept_ids: [],
      terms: ['rettigheter', 'fagpublikasjon', 'metadata'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_periodisering_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Fırat-artikkelen leveres som ekstern lenke og metadata, mens spørsmålene bruker parafraserte funn med presise lokatorer.',
        explanation: 'Åpen tilgang er ikke det samme som en avklart History Go-redistribusjonslisens. Object-gaten holder derfor selve artikkelen utenfor appen.',
        why_it_matters: 'Rights-gaten skiller evidensbruk fra republisering og gjør leveringsmåten eksplisitt.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        objectRef('Fırat 2019 direct-object rights :: external_link_and_metadata_only', 'Artikkelen leveres med ekstern lenke, identitet, DOI og lokatorer, ikke som rehostet fulltekst.')
      ],
      source_origin: 'external',
      claim_basis: 'Direct object må leveres som external_link_and_metadata_only; History Go bruker bare metadata, lokatorer og parafraserte funn.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== PERIODIZATION.emne);
pkg.sets.push(periodizationSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Periodisering og anakronisme-pathway skrevet som sett 10.');
  } else {
    console.error('Periodisering/pathway er utdatert. Kjør node tools/build-musikk-history-periodization-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Periodisering og anakronisme sett 10 OK.');
}
