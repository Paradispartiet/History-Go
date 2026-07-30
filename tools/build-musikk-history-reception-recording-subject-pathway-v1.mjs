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

const RECEPTION = Object.freeze({
  emne: 'em_musikk_vit_resepsjon_kritikk_opptakshistorie',
  target: 'subject_musikk_resepsjon_kritikk_opptakshistorie',
  domain: 'historisk_musikkvitenskap_historiografi',
  claim: 'claim_musikk_history_grieg_chasing_2010_reception_uptake',
  object: 'obj_grieg_chasing_butterfly_levi_review_2012',
  chasing: 'prod_src_chasing_butterfly_grieg_1903_restoration_2010',
  levi: 'prod_src_levi_bbc_chasing_butterfly_review_2012',
  mto: 'prod_src_leech_wilkinson_mto_grieg_performance_2012',
  mattes: 'prod_src_mattes_grieg_historical_recordings_2020',
  method: 'diskurs_representasjonsanalyse',
  objectUrl: 'https://www.classical-music.com/reviews/instrumental/chasing-butterfly',
  evidenceFile: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/resepsjon_kritikk_opptakshistorie.json'
});

const newSources = [
  {
    id: RECEPTION.mto,
    type: 'peer_reviewed_article_production_extension',
    title: 'Compositions, Scores, Performances, Meanings',
    publisher_or_author: 'Daniel Leech-Wilkinson / Music Theory Online',
    date_or_version: 'Music Theory Online 18(1), 2012; DOI 10.30535/mto.18.1.4',
    url: 'https://mtosmt.org/issues/mto.12.18.1/mto.12.18.1.leech-wilkinson.html',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: RECEPTION.levi,
    type: 'professional_review_production_extension',
    title: 'Chasing the Butterfly',
    publisher_or_author: 'Erik Levi / BBC Music Magazine review hosted by Classical-Music.com',
    date_or_version: '20 January 2012; Simax PSC 1299',
    url: RECEPTION.objectUrl,
    status: 'reviewed_professional_review_fulltext'
  },
  {
    id: RECEPTION.object,
    type: 'direct_research_object_reception_source',
    title: 'Erik Levi review of Chasing the Butterfly, SIMAX PSC 1299',
    publisher_or_author: 'Erik Levi / BBC Music Magazine review hosted by Classical-Music.com',
    date_or_version: '20 January 2012; Simax PSC 1299',
    url: RECEPTION.objectUrl,
    status: 'direct_object_verified',
    object_type: 'kritikk_eller_resepsjonskilde',
    use_mode: 'external_link_and_metadata_only',
    license: 'No History Go reuse license identified for the Classical-Music.com/BBC Music Magazine review text',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

const appendUnique = (values, value) => [...list(values).filter((item) => clean(item) !== value), value];
pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_8x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: appendUnique(pkg.production_context?.released_evidence_files, RECEPTION.evidenceFile),
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: appendUnique(pkg.production_context?.question_ready_claim_ids, RECEPTION.claim),
  direct_object_ids: appendUnique(pkg.production_context?.direct_object_ids, RECEPTION.object),
  released_emne_ids: appendUnique(pkg.production_context?.released_emne_ids, RECEPTION.emne),
  blocked_canonical_topic_count: 40,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  RECEPTION.evidenceFile
];
const sourceRef = (sourceId, locator, claimBasis) => ({ source_id: sourceId, locator, claim_basis: claimBasis });
const objectRef = (locator, claimBasis) => ({
  source_id: RECEPTION.object,
  locator,
  use_mode: 'external_link_and_metadata_only',
  url: RECEPTION.objectUrl,
  claim_basis: claimBasis
});

const receptionSet = {
  set_id: 'pathway_musikk_resepsjon_kritikk_opptakshistorie',
  title: 'Resepsjon, kritikk og opptakshistorie',
  level: 8,
  order: 8,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: RECEPTION.target,
  area_id: RECEPTION.domain,
  emne_id: RECEPTION.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [RECEPTION.object],
  question_ready_claim_ids: [RECEPTION.claim],
  questions: [
    {
      id: 'quiz_musikk_resepsjon_pathway_q1',
      quiz_id: 'musikk_resepsjon_pathway_q1',
      categoryId: 'musikk',
      targetId: RECEPTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilken dokumentert kjede inngår i det frigitte Grieg-resepsjonskorpuset?',
      options: [
        'Bare en anonym publikumsundersøkelse fra 1903 og moderne strømmetall',
        'Chasing-prosjektets framing, Levi-anmeldelsen 2012, Leech-Wilkinson i MTO 2012 og Mattes 2020',
        'Kun Griegs originalpartitur og matrix 2151F uten senere resepsjonsspor'
      ],
      answer: 'Chasing-prosjektets framing, Levi-anmeldelsen 2012, Leech-Wilkinson i MTO 2012 og Mattes 2020',
      answerIndex: 1,
      knowledge: 'Det frigitte korpuset består av produsent-framing, ett datert profesjonelt review, en fagfellevurdert analytisk uptake i 2012 og en senere fagfellevurdert forskningsbruk i 2020.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: RECEPTION.emne,
      method_id: RECEPTION.method,
      direct_object_id: RECEPTION.object,
      core_concepts: ['resepsjonskorpus', 'remediering', 'kildespor'],
      concept_ids: [],
      terms: ['resepsjonskorpus', 'remediering', 'kildespor'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_resepsjon_observe',
      evidence_type: 'reception_corpus_observation',
      knowledge_payload: {
        summary: 'Det frigitte Grieg-korpuset følger en dokumentert kjede fra Chasing-prosjektets egen framing via Levi 2012 og Leech-Wilkinson 2012 til Mattes 2020.',
        explanation: 'Chasing dokumenterer prosjektets mål og problemformulering, Levi gir et datert profesjonelt review av SIMAX PSC 1299, MTO 2012 bruker prosjektet som analytisk evidens, og Mattes 2020 viser senere forskningsbruk av remastrede Grieg-opptak.',
        why_it_matters: 'Resepsjonshistorie må begynne med et avgrenset og identifisert korpus før man kan si noe om endring eller etterliv.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(RECEPTION.chasing, 'Chasing the Butterfly :: What is this? :: WHY and WHAT NEXT', 'Korpuset har en eksplisitt produsent-framing og et uttalt remediation-/forskningsmål.'),
        objectRef('Erik Levi :: 20 January 2012 :: Simax PSC 1299', 'Levi-anmeldelsen er det valgte daterte profesjonelle resepsjonsobjektet.'),
        sourceRef(RECEPTION.mto, 'Music Theory Online 18(1), 2012 :: paragraph [3.8]', 'Leech-Wilkinson bruker Chasing-prosjektet og CD-en som analytisk Grieg-evidens.'),
        sourceRef(RECEPTION.mattes, 'Studia Musicologica Norvegica 46(1), 2020 :: abstract/source framing', 'Mattes dokumenterer senere forskningsbruk av remastrede Grieg-opptak.')
      ],
      source_origin: 'external',
      claim_basis: 'Det frigitte Grieg-korpuset består av fire identifiserte producer-, review- og forskningsspor fra Chasing-prosjektet til Mattes 2020.',
      guidance_basis: guidance,
      claim_id: RECEPTION.claim
    },
    {
      id: 'quiz_musikk_resepsjon_pathway_q2',
      quiz_id: 'musikk_resepsjon_pathway_q2',
      categoryId: 'musikk',
      targetId: RECEPTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor kan kjeden kalles dokumentert uptake uten å bli en påstand om samlet publikumsresepsjon?',
      options: [
        'Fordi én femstjerners anmeldelse statistisk representerer alle lyttere',
        'Fordi produsentenes mål automatisk beviser at prosjektet endret Griegs status',
        'Fordi kildene viser konkret bruk i identifiserte profesjonelle og faglige kanaler, mens korpuset ikke måler hele publikum eller kritikerkorpset'
      ],
      answer: 'Fordi kildene viser konkret bruk i identifiserte profesjonelle og faglige kanaler, mens korpuset ikke måler hele publikum eller kritikerkorpset',
      answerIndex: 2,
      knowledge: 'Levi, MTO og Mattes dokumenterer konkret uptake i avgrensede kanaler, men ingen av kildene er en representativ publikums- eller kritikerundersøkelse. Chasing-prosjektets egen statusbeskrivelse er dessuten produsent-framing.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: RECEPTION.emne,
      method_id: RECEPTION.method,
      direct_object_id: RECEPTION.object,
      core_concepts: ['representativitet', 'uptake', 'korpusavgrensning'],
      concept_ids: [],
      terms: ['representativitet', 'uptake', 'korpusavgrensning'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_resepsjon_explain',
      evidence_type: 'reception_scope_explanation',
      knowledge_payload: {
        summary: 'Kildene dokumenterer uptake i bestemte profesjonelle og akademiske kanaler, men de måler ikke samlet publikum, kritikerkorps eller musikerpopulasjon.',
        explanation: 'Et datert review og to faglige bruksspor er sterke belegg for at materialet faktisk sirkulerte som kritikk- og forskningsobjekt. De er ikke et representativt utvalg, og Chasings egen påstand om lav tidligere status er en prosjektframing, ikke en uavhengig baseline.',
        why_it_matters: 'Skillet hindrer at resepsjonshistorie blir en uberettiget generalisering fra noen få synlige kilder.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(RECEPTION.chasing, 'Chasing the Butterfly :: What is this? :: WHY item 3', 'Produsentenes statusproblem er en selvbeskrivelse, ikke en populasjonsmåling.'),
        objectRef('Erik Levi review :: one dated professional review object', 'Levi er ett profesjonelt resepsjonsspor og kan ikke representere hele publikum.'),
        sourceRef(RECEPTION.mto, 'MTO 2012 :: paragraph [3.8]', 'MTO dokumenterer faglig uptake i en identifisert kanal.')
      ],
      source_origin: 'external',
      claim_basis: 'Korpuset dokumenterer konkret uptake i avgrensede kanaler, men har ingen representativ måling av samlet publikums-, kritiker- eller musikerresepsjon.',
      guidance_basis: guidance,
      claim_id: RECEPTION.claim
    },
    {
      id: 'quiz_musikk_resepsjon_pathway_q3',
      quiz_id: 'musikk_resepsjon_pathway_q3',
      categoryId: 'musikk',
      targetId: RECEPTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken rollefordeling mellom kildene er kildekritisk mest presis?',
      options: [
        'Chasing viser prosjektets egen framing; Levi viser ett profesjonelt review; MTO og Mattes viser faglig uptake på ulike tidspunkter',
        'Levi måler hele publikumsmarkedet; MTO dokumenterer salg; Mattes dokumenterer produsentens opprinnelige intensjon',
        'Alle fire kildene er uavhengige publikumsundersøkelser som kan slås sammen statistisk'
      ],
      answer: 'Chasing viser prosjektets egen framing; Levi viser ett profesjonelt review; MTO og Mattes viser faglig uptake på ulike tidspunkter',
      answerIndex: 0,
      knowledge: 'De fire kildene har ulike evidensroller og må ikke homogeniseres: produsentens egen problemformulering, profesjonell kritikk, samtidlig fagfellevurdert analytisk bruk og senere fagfellevurdert forskningsbruk.',
      difficulty: 4,
      question_type: 'comparison',
      emne_id: RECEPTION.emne,
      method_id: RECEPTION.method,
      direct_object_id: RECEPTION.object,
      core_concepts: ['evidensrolle', 'diskursanalyse', 'triangulering'],
      concept_ids: [],
      terms: ['evidensrolle', 'diskursanalyse', 'triangulering'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_resepsjon_evaluate_evidence',
      evidence_type: 'reception_source_role_comparison',
      knowledge_payload: {
        summary: 'Chasing dokumenterer prosjektets egen framing, Levi ett profesjonelt review, Leech-Wilkinson 2012 fagfellevurdert analytisk uptake og Mattes 2020 senere forskningsbruk.',
        explanation: 'Kildene er komplementære fordi de representerer ulike ledd i remedierings- og resepsjonskjeden. De blir metodisk sterkere når rollene holdes adskilt, ikke når alle behandles som om de målte det samme.',
        why_it_matters: 'Historisk diskursanalyse krever at kildegenre og institusjonell posisjon inngår i vurderingen av hva hvert spor faktisk kan dokumentere.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(RECEPTION.chasing, 'Chasing :: What is this? :: producer framing', 'Chasing dokumenterer prosjektets egen problemformulering og mål.'),
        objectRef('Levi review :: opening restoration-centrepiece discussion', 'Levi dokumenterer ett profesjonelt kritikkspor.'),
        sourceRef(RECEPTION.mto, 'MTO 2012 :: paragraph [3.8] and notes 14–15', 'Leech-Wilkinson dokumenterer fagfellevurdert analytisk uptake.'),
        sourceRef(RECEPTION.mattes, 'Mattes 2020 :: abstract/source-method framing', 'Mattes dokumenterer senere forskningsbruk av remastrede historiske opptak.')
      ],
      source_origin: 'external',
      claim_basis: 'De fire kildene har forskjellige evidensroller i en avgrenset resepsjons- og remedieringskjede og kan trianguleres uten å gjøres til samme datatype.',
      guidance_basis: guidance,
      claim_id: RECEPTION.claim
    },
    {
      id: 'quiz_musikk_resepsjon_pathway_q4',
      quiz_id: 'musikk_resepsjon_pathway_q4',
      categoryId: 'musikk',
      targetId: RECEPTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken konklusjon går lenger enn det frigitte resepsjonskorpuset tillater?',
      options: [
        'At Chasing-materialet ble brukt som analytisk Grieg-evidens i MTO 2012',
        'At én positiv anmeldelse og to forskningsspor beviser at Chasing alene endret Griegs generelle status hos publikum og musikere',
        'At Mattes 2020 viser en senere forskningsbruk av remastrede historiske Grieg-opptak'
      ],
      answer: 'At én positiv anmeldelse og to forskningsspor beviser at Chasing alene endret Griegs generelle status hos publikum og musikere',
      answerIndex: 1,
      knowledge: 'Korpuset viser dokumentert profesjonell og akademisk uptake, men det har verken representativ publikumsdata, systematisk reviewutvalg eller et kausalt design som kan tilskrive Chasing en generell statusendring.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: RECEPTION.emne,
      method_id: RECEPTION.method,
      direct_object_id: RECEPTION.object,
      core_concepts: ['overgeneralisering', 'kausalitet', 'resepsjon'],
      concept_ids: [],
      terms: ['overgeneralisering', 'kausalitet', 'resepsjon'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_resepsjon_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Det er ikke dokumentert at Chasing alene endret Griegs generelle status hos publikum, kritikere eller musikere; kildene viser bare avgrenset profesjonell og faglig uptake.',
        explanation: 'Levi er ett review, MTO og Mattes er faglige bruksspor, og Chasings statusproblem er selvbeskrevet. Uten systematisk korpus, publikumsmål eller kausal sammenligning kan disse sporene ikke bære en generell statusendringspåstand.',
        why_it_matters: 'Dette er den sentrale inferensgrensen mellom dokumentert resepsjonsspor og en totaliserende resepsjonshistorie.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(RECEPTION.chasing, 'Chasing :: WHY item 3 :: self-described reception problem', 'Chasings statusbeskrivelse er produsentens egen framing.'),
        objectRef('Levi review :: one professional critical object', 'Ett review kan ikke representere samlet publikum eller kritikerkorps.'),
        sourceRef(RECEPTION.mto, 'MTO 2012 :: paragraph [3.8]', 'MTO viser faglig bruk, ikke kausal feltendring.'),
        sourceRef(RECEPTION.mattes, 'Mattes 2020 :: later research use', 'Senere forskning viser uptake, ikke at Chasing alene forårsaket den.')
      ],
      source_origin: 'external',
      claim_basis: 'Det finnes dokumentert uptake i noen profesjonelle og akademiske kanaler, men ingen evidens for at Chasing alene forårsaket en generell statusendring.',
      guidance_basis: guidance,
      claim_id: RECEPTION.claim
    },
    {
      id: 'quiz_musikk_resepsjon_pathway_q5',
      quiz_id: 'musikk_resepsjon_pathway_q5',
      categoryId: 'musikk',
      targetId: RECEPTION.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke Levi-anmeldelsen når ingen gjenbrukslisens for review-teksten er identifisert?',
      options: [
        'Kopiere hele review-teksten fordi den brukes som historisk kilde',
        'Embedde artikkelinnholdet og anta at kildehenvisning alene gir gjenbruksrett',
        'Vise ekstern lenke, forfatter-/dato-/release-metadata og paraphraserte funn uten å kopiere, rehoste, modifisere eller embedde teksten'
      ],
      answer: 'Vise ekstern lenke, forfatter-/dato-/release-metadata og paraphraserte funn uten å kopiere, rehoste, modifisere eller embedde teksten',
      answerIndex: 2,
      knowledge: 'Evidensobjektet har uløst gjenbrukslisens og er derfor låst til external-link-and-metadata-only. History Go kan vise kildeidentitet og paraphraserte funn, men ikke republisere review-teksten eller tilknyttet medieinnhold.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: RECEPTION.emne,
      method_id: RECEPTION.method,
      direct_object_id: RECEPTION.object,
      core_concepts: ['rettigheter', 'ekstern lenke', 'kildebruk'],
      concept_ids: [],
      terms: ['rettigheter', 'ekstern lenke', 'kildebruk'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_resepsjon_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Levi-reviewet må forbli external-link-and-metadata-only fordi ingen History Go-kompatibel gjenbrukslisens for teksten er identifisert.',
        explanation: 'Den historiske og forskningsmessige relevansen til en kritikktekst opphever ikke opphavsrett eller nettstedets publiseringsrettigheter. Evidensporten frigir derfor bare ekstern lenke, bibliografisk metadata og paraphraserte kildefunn.',
        why_it_matters: 'Rights-gaten gjør kildebruk til en del av forskningsproveniensen i stedet for en etterfølgende publiseringsdetalj.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        objectRef('Levi review rights :: no History Go reuse license identified; external_link_and_metadata_only', 'Review-teksten kan bare brukes gjennom ekstern lenke, metadata og paraphraserte funn.')
      ],
      source_origin: 'external',
      claim_basis: 'Levi-reviewet har ingen identifisert gjenbrukslisens for History Go og må derfor behandles som external-link-and-metadata-only.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== RECEPTION.emne);
pkg.sets.push(receptionSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Resepsjon, kritikk og opptakshistorie-pathway skrevet som sett 8.');
  } else {
    console.error('Resepsjon/pathway er utdatert. Kjør node tools/build-musikk-history-reception-recording-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Resepsjon, kritikk og opptakshistorie sett 8 OK.');
}
