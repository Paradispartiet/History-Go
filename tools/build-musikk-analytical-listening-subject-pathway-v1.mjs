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

const ANALYTICAL = Object.freeze({
  emne: 'em_musikk_vit_analytisk_lytting_beskrivelse',
  target: 'subject_musikk_analytisk_lytting_beskrivelse',
  claim: 'claim_musikk_analytical_listening_rebonds_drag_solutions_timecoded_2023',
  object: 'obj_rebonds_b_authors_illustrative_video_oseu0xr6bss',
  article: 'prod_src_labrada_chaib_braga_xenakis_performance_solutions_2023',
  method: 'kritisk_lytteanalyse',
  objectUrl: 'https://www.youtube.com/watch?v=OsEU0xr6bSs'
});

const newSources = [
  {
    id: ANALYTICAL.article,
    type: 'peer_reviewed_article_production_extension',
    title: 'Tornando possível o impossível: ideias e soluções performativas em algumas obras percussivas de Iannis Xenakis',
    publisher_or_author: 'Leonardo Labrada, Fernando Chaib og Charles Augusto Braga Leandro',
    date_or_version: 'Per Musi 42 (2022), e224227; publisert 2023-07-19; DOI 10.35699/2317-6377.2022.42072',
    url: 'https://periodicos.ufmg.br/index.php/permusi/article/view/42072',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: ANALYTICAL.object,
    type: 'direct_research_object_audio',
    title: 'Rebonds B — author-recorded illustrative performance examples cited in Labrada, Chaib & Braga Leandro',
    publisher_or_author: 'Labrada, Chaib & Braga Leandro / YouTube',
    date_or_version: 'article-cited YouTube ID OsEU0xr6bSs; exact recording date and source-file master not stated',
    url: ANALYTICAL.objectUrl,
    status: 'direct_object_verified',
    object_type: 'lydopptak',
    use_mode: 'external_link_and_metadata_only',
    license: 'separate hosted-media reuse rights not independently established',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_6x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: [
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/analytisk_lytting_beskrivelse.json'
  ],
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: [
    'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    'claim_musikk_melody_boss_alpha_salience_development',
    'claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63',
    'claim_musikk_form_huguet_op10_3_a4_close_84_106',
    'claim_musikk_timbre_gonzalez_prati_tinysol_dynamics_classification_2023',
    ANALYTICAL.claim
  ],
  direct_object_ids: [
    'obj_sioros_2014_zenodo_1221315',
    'obj_beethoven_op10_1_dcml_v2_5_05_1',
    'obj_beethoven_tempest_op31_2_dcml_v2_5_17_1',
    'obj_beethoven_op10_3_dcml_v2_5_07_4',
    'obj_tinysol_v6_flute_c4_pp_ff',
    ANALYTICAL.object
  ],
  released_emne_ids: [
    'em_musikk_vit_rytme_meter_groove_timing',
    'em_musikk_vit_melodi_motiv_frasering',
    'em_musikk_vit_harmoni_tonalitet_modalitet',
    'em_musikk_vit_form_prosess_improvisasjon',
    'em_musikk_vit_klang_tekstur_instrumentasjon',
    ANALYTICAL.emne
  ],
  blocked_canonical_topic_count: 42,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
  'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/analytisk_lytting_beskrivelse.json'
];
const articleSource = (locator, claimBasis) => ({
  source_id: ANALYTICAL.article,
  locator,
  claim_basis: claimBasis
});
const objectSource = (locator, claimBasis) => ({
  source_id: ANALYTICAL.object,
  locator,
  use_mode: 'external_link_and_metadata_only',
  url: ANALYTICAL.objectUrl,
  claim_basis: claimBasis
});

const analyticalSet = {
  set_id: 'pathway_musikk_analytisk_lytting_beskrivelse',
  title: 'Analytisk lytting og presis beskrivelse',
  level: 6,
  order: 6,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: ANALYTICAL.target,
  area_id: 'musikalsk_analyse_lyd_struktur',
  emne_id: ANALYTICAL.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [ANALYTICAL.object],
  question_ready_claim_ids: [ANALYTICAL.claim],
  questions: [
    {
      id: 'quiz_musikk_analytisk_lytting_pathway_q1',
      quiz_id: 'musikk_analytisk_lytting_pathway_q1',
      categoryId: 'musikk',
      targetId: ANALYTICAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilke tre artikkelstyrte tidskoder er frigitt for det direkte Rebonds B-objektet?',
      options: ['00:31, 01:00 og 01:29', '00:15, 00:45 og 02:00', 'Bare 01:29'],
      answer: '00:31, 01:00 og 01:29',
      answerIndex: 0,
      knowledge: 'Per Musi-artikkelen peker til samme Rebonds B-video ved 00:31, 01:00 og 01:29, slik at konkrete framføringsløsninger kan lokaliseres og sammenlignes før de fortolkes.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: ANALYTICAL.emne,
      method_id: ANALYTICAL.method,
      direct_object_id: ANALYTICAL.object,
      core_concepts: ['tidskodet evidens', 'auditiv segmentering', 'direkte forskningsobjekt'],
      concept_ids: [],
      terms: ['tidskodet evidens', 'auditiv segmentering', 'direkte forskningsobjekt'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_analytisk_lytting_observe',
      evidence_type: 'sonic_observation',
      knowledge_payload: {
        summary: 'Artikkelen låser de frigitte Rebonds B-eksemplene til 00:31, 01:00 og 01:29 i samme YouTube-objekt.',
        explanation: 'Tidskodene fungerer som direkte objektlokatorer: de gjør det mulig å gå fra en verbal påstand til et bestemt hørbart sted uten å gjøre den hørbare observasjonen til en full fortolkning.',
        why_it_matters: 'Trinnet trener presis lokalisering av auditiv evidens før analytiske funksjoner eller intensjoner tilskrives.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        articleSource('Section 2.1, Figure 3 note 8; Figure 4 note 10; Figure 5 note 11', 'Artikkelen låser de frigitte Rebonds B-eksemplene til 00:31, 01:00 og 01:29 i samme YouTube-objekt.'),
        objectSource('YouTube OsEU0xr6bSs :: 00:31, 01:00, 01:29', 'Artikkelen låser de frigitte Rebonds B-eksemplene til 00:31, 01:00 og 01:29 i samme YouTube-objekt.')
      ],
      source_origin: 'external',
      claim_basis: 'Artikkelen låser de frigitte Rebonds B-eksemplene til 00:31, 01:00 og 01:29 i samme YouTube-objekt.',
      guidance_basis: guidance,
      claim_id: ANALYTICAL.claim
    },
    {
      id: 'quiz_musikk_analytisk_lytting_pathway_q2',
      quiz_id: 'musikk_analytisk_lytting_pathway_q2',
      categoryId: 'musikk',
      targetId: ANALYTICAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hva gjør 01:29-eksemplet spesielt egnet til analytisk lytting?',
      options: ['Det dokumenterer Xenakis sin uttalte intensjon', 'Det lar lytteren sammenligne tidligere baquette-/drag-løsninger langsomt og raskt rundt mm. 61–64', 'Det måler automatisk tempo og spektrum'],
      answer: 'Det lar lytteren sammenligne tidligere baquette-/drag-løsninger langsomt og raskt rundt mm. 61–64',
      answerIndex: 1,
      knowledge: 'Ved 01:29 instruerer artikkelen en direkte langsom/rask sammenligning av tidligere beskrevne framføringsløsninger rundt den teknisk krevende passasjen i mm. 61–64.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: ANALYTICAL.emne,
      method_id: ANALYTICAL.method,
      direct_object_id: ANALYTICAL.object,
      core_concepts: ['gjentatt lytting', 'framføringsløsning', 'hørbar sammenligning'],
      concept_ids: [],
      terms: ['gjentatt lytting', 'framføringsløsning', 'hørbar sammenligning'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_analytisk_lytting_explain',
      evidence_type: 'sonic_observation',
      knowledge_payload: {
        summary: 'Ved 01:29 sammenlignes tidligere beskrevne baquette-/drag-løsninger langsomt og raskt rundt mm. 61–64.',
        explanation: 'Den langsomme og raske demonstrasjonen gjør en konkret framføringsforskjell hørbar under kontrollert lokalisering. Det støtter presis beskrivelse av løsninger, men ikke en slutning om komponistintensjon eller normativ korrekthet.',
        why_it_matters: 'Trinnet viser hvordan gjentatt lytting kan isolere en hørbar forskjell før en større strukturell eller estetisk tolkning bygges.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        articleSource('Section 2.1, Figure 5 note 11; mm. 61–64; YouTube t=89', 'Ved 01:29 sammenlignes tidligere beskrevne baquette-/drag-løsninger langsomt og raskt rundt mm. 61–64.'),
        objectSource('YouTube OsEU0xr6bSs :: 01:29', 'Ved 01:29 sammenlignes tidligere beskrevne baquette-/drag-løsninger langsomt og raskt rundt mm. 61–64.')
      ],
      source_origin: 'external',
      claim_basis: 'Ved 01:29 sammenlignes tidligere beskrevne baquette-/drag-løsninger langsomt og raskt rundt mm. 61–64.',
      guidance_basis: guidance,
      claim_id: ANALYTICAL.claim
    },
    {
      id: 'quiz_musikk_analytisk_lytting_pathway_q3',
      quiz_id: 'musikk_analytisk_lytting_pathway_q3',
      categoryId: 'musikk',
      targetId: ANALYTICAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede er korrekt for den frigitte analytiske lytteobservasjonen?',
      options: ['YouTube-videoen alene dokumenterer hvordan Rebonds alltid skal framføres', 'Artikkelens CC BY-lisens gjør automatisk den separat hostede videoen fri for all gjenbruk', 'Artikkelen navngir framføringsløsningene og tidskodene, mens det eksterne medieobjektet gjør de konkrete hørbare eksemplene inspeksjonsbare'],
      answer: 'Artikkelen navngir framføringsløsningene og tidskodene, mens det eksterne medieobjektet gjør de konkrete hørbare eksemplene inspeksjonsbare',
      answerIndex: 2,
      knowledge: 'Forskningsartikkelen binder bestemte framføringsløsninger til presise tidskoder; det eksterne Rebonds B-objektet gjør disse hørbare stedene kontrollerbare uten å utvide claimet til all framføringspraksis.',
      difficulty: 3,
      question_type: 'comparison',
      emne_id: ANALYTICAL.emne,
      method_id: ANALYTICAL.method,
      direct_object_id: ANALYTICAL.object,
      core_concepts: ['evidenskjede', 'artikkellokator', 'objektlokator'],
      concept_ids: [],
      terms: ['evidenskjede', 'artikkellokator', 'objektlokator'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_analytisk_lytting_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Artikkelen binder konkrete framføringsløsninger til tidskodene, og det eksterne medieobjektet gjør de samme hørbare stedene inspeksjonsbare.',
        explanation: 'Artikkellokatoren støtter hva forfatterne beskriver og hvorfor tidskoden brukes. Objektlokatoren peker til selve hørbare eksemplet. Ingen av delene alene gjør ett eksempel representativt for verket eller for framføringspraksis generelt.',
        why_it_matters: 'Trinnet skiller kilden som begrunner claimet fra forskningsobjektet som gjør den konkrete hørbare observasjonen etterprøvbar.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        articleSource('Section 2.1, Figures 3–5 and notes 8–11', 'Artikkelen binder konkrete framføringsløsninger til tidskodene, og det eksterne medieobjektet gjør de samme hørbare stedene inspeksjonsbare.'),
        objectSource('YouTube OsEU0xr6bSs :: 00:31, 01:00, 01:29', 'Artikkelen binder konkrete framføringsløsninger til tidskodene, og det eksterne medieobjektet gjør de samme hørbare stedene inspeksjonsbare.')
      ],
      source_origin: 'external',
      claim_basis: 'Artikkelen binder konkrete framføringsløsninger til tidskodene, og det eksterne medieobjektet gjør de samme hørbare stedene inspeksjonsbare.',
      guidance_basis: guidance,
      claim_id: ANALYTICAL.claim
    },
    {
      id: 'quiz_musikk_analytisk_lytting_pathway_q4',
      quiz_id: 'musikk_analytisk_lytting_pathway_q4',
      categoryId: 'musikk',
      targetId: ANALYTICAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn den frigitte evidensen tillater?',
      options: ['At artikkelen bruker illustrerende, tidskodede eksempler på konkrete framføringsløsninger', 'At tidskodene beviser Xenakis sin intensjon, én korrekt Rebonds-utførelse og én universell segmentering', 'At objektet må holdes til de avgrensede eksemplene som faktisk er dokumentert'],
      answer: 'At tidskodene beviser Xenakis sin intensjon, én korrekt Rebonds-utførelse og én universell segmentering',
      answerIndex: 1,
      knowledge: 'Forfatternes videoer er eksplisitt illustrative og ikke normative. Tidskodene støtter konkrete hørbare sammenligninger, men ikke Xenakis-intensjon, én riktig utførelse eller universell segmentering.',
      difficulty: 4,
      question_type: 'analysis',
      emne_id: ANALYTICAL.emne,
      method_id: ANALYTICAL.method,
      direct_object_id: ANALYTICAL.object,
      core_concepts: ['observasjon kontra tolkning', 'intensjon', 'normativitet'],
      concept_ids: [],
      terms: ['observasjon kontra tolkning', 'intensjon', 'normativitet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_analytisk_lytting_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'De tidskodede eksemplene dokumenterer konkrete hørbare løsninger, men ikke Xenakis-intensjon, én riktig utførelse eller universell segmentering.',
        explanation: 'Artikkelen avgrenser selv videoene som illustrative og ikke-normerende. Derfor må History Go holde observasjon av et bestemt eksempel atskilt fra historisk intensjon, normativ framføringspraksis og påstander om hvordan alle lyttere segmenterer materialet.',
        why_it_matters: 'Trinnet trener den sentrale inferensgrensen i analytisk lytting: presis observasjon er nødvendig, men er ikke det samme som full fortolkning.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        articleSource('Introduction pp. 3–4; videos recorded by authors, exclusively illustrative and non-normative', 'De tidskodede eksemplene dokumenterer konkrete hørbare løsninger, men ikke Xenakis-intensjon, én riktig utførelse eller universell segmentering.')
      ],
      source_origin: 'external',
      claim_basis: 'De tidskodede eksemplene dokumenterer konkrete hørbare løsninger, men ikke Xenakis-intensjon, én riktig utførelse eller universell segmentering.',
      guidance_basis: guidance,
      claim_id: ANALYTICAL.claim
    },
    {
      id: 'quiz_musikk_analytisk_lytting_pathway_q5',
      quiz_id: 'musikk_analytisk_lytting_pathway_q5',
      categoryId: 'musikk',
      targetId: ANALYTICAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke det artikkelbundne YouTube-objektet når separat media-lisens ikke er løst?',
      options: ['Kopiere lydsporet fordi artikkelen er CC BY 4.0', 'Embedde videoen og anta at artikkellisensen også gjelder mediefilen', 'Vise ekstern lenke, stabil video-ID, artikkelproveniens og tidskoder uten å kopiere, ekstrahere, rehoste, modifisere eller embedde mediet'],
      answer: 'Vise ekstern lenke, stabil video-ID, artikkelproveniens og tidskoder uten å kopiere, ekstrahere, rehoste, modifisere eller embedde mediet',
      answerIndex: 2,
      knowledge: 'Artikkelen er CC BY 4.0, men den separat YouTube-hostede mediefilens gjenbruksrettigheter er ikke avklart. Objektet forblir derfor external-link-and-metadata-only.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: ANALYTICAL.emne,
      method_id: ANALYTICAL.method,
      direct_object_id: ANALYTICAL.object,
      core_concepts: ['rettigheter', 'leveransemodus', 'medieproveniens'],
      concept_ids: [],
      terms: ['rettigheter', 'leveransemodus', 'medieproveniens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_analytisk_lytting_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'YouTube-objektets separate gjenbruksrettigheter er ikke løst, så History Go bruker bare ekstern lenke, video-ID, proveniens og tidskoder.',
        explanation: 'CC BY 4.0 gjelder den publiserte Per Musi-artikkelen. Evidenslaget behandler det separat hostede mediet som et eget rights-objekt og tillater derfor ikke kopiering, ekstraksjon, rehosting, modifikasjon eller embedding uten en ny rettighetsavklaring.',
        why_it_matters: 'Trinnet gjør rettighetsporten til en del av den dokumenterte evidenskjeden i stedet for å anta at artikkel- og medielisens er identiske.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        objectSource('YouTube OsEU0xr6bSs; evidence rights mode external_link_and_metadata_only', 'YouTube-objektets separate gjenbruksrettigheter er ikke løst, så History Go bruker bare ekstern lenke, video-ID, proveniens og tidskoder.')
      ],
      source_origin: 'external',
      claim_basis: 'YouTube-objektets separate gjenbruksrettigheter er ikke løst, så History Go bruker bare ekstern lenke, video-ID, proveniens og tidskoder.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== ANALYTICAL.emne);
pkg.sets.push(analyticalSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Analytisk lytting/beskrivelse-pathway skrevet som sett 6.');
  } else {
    console.error('Analytisk lyttepathway er utdatert. Kjør node tools/build-musikk-analytical-listening-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Analytisk lyttepathway sett 6 OK.');
}
