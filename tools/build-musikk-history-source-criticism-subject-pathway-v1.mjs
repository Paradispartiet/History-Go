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

const HISTORY = Object.freeze({
  domain: 'historisk_musikkvitenskap_historiografi',
  emne: 'em_musikk_vit_kildekritikk_musikkhistorie',
  target: 'subject_musikk_kildekritikk_musikkhistorie',
  claim: 'claim_musikk_history_grieg_2151f_provenance_derivative_chain',
  object: 'obj_grieg_bridal_procession_2151f_chasing_web_derivative',
  mattes: 'prod_src_mattes_grieg_historical_recordings_2020',
  marston: 'prod_src_marston_grieg_legendary_piano_52054_2',
  chasing: 'prod_src_chasing_butterfly_grieg_1903_restoration_2010',
  method: 'arkiv_diskografisk_metode',
  objectUrl: 'https://www.chasingthebutterfly.no/?page_id=207'
});

const newSources = [
  {
    id: HISTORY.mattes,
    type: 'peer_reviewed_article_production_extension',
    title: 'What Else Can Grieg’s Historical Recordings Tell Us? Performance Practice as Musical Poetry',
    publisher_or_author: 'Arnulf Christian Mattes',
    date_or_version: 'Studia Musicologica Norvegica 46(1), 2020, 25–40; DOI 10.18261/issn.1504-2960-2020-01-04',
    url: 'https://www.idunn.no/doi/10.18261/issn.1504-2960-2020-01-04',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: HISTORY.marston,
    type: 'discographic_restoration_documentation_production_extension',
    title: 'Legendary Piano Recordings: The Complete Grieg, Saint-Saëns, Pugno, and Diémer',
    publisher_or_author: 'Ward Marston / Marston Records',
    date_or_version: 'Marston Records 52054-2, 2008',
    url: 'https://www.marstonrecords.com/products/legendary-piano',
    status: 'reviewed_label_documentation'
  },
  {
    id: HISTORY.chasing,
    type: 'project_restoration_documentation_production_extension',
    title: 'The Grieg 1903 Recordings / Ambiguity and Multi-layeredness',
    publisher_or_author: 'Sigurd Slåttebrekk og Tony Harrison',
    date_or_version: 'Chasing the Butterfly, ©2010',
    url: 'https://www.chasingthebutterfly.no/?page_id=2',
    status: 'reviewed_project_fulltext'
  },
  {
    id: HISTORY.object,
    type: 'direct_research_object_audio',
    title: 'Grieg, Norwegian Bridal Procession Op. 19 No. 2 — 1903 matrix 2151F identity with Chasing the Butterfly web-access derivative',
    publisher_or_author: 'Edvard Grieg / Gramophone and Typewriter Limited / Chasing the Butterfly access derivative',
    date_or_version: 'G&T Paris 2 May 1903, matrix 2151F, catalog 35517; later Chasing the Butterfly web derivative',
    url: HISTORY.objectUrl,
    status: 'direct_object_verified',
    object_type: 'lydopptak',
    use_mode: 'external_link_and_metadata_only',
    license: 'Chasing the Butterfly website/audio reuse license not granted; site states ©2010',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_7x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: [
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/analytisk_lytting_beskrivelse.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/kildekritikk_musikkhistorie.json'
  ],
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: [
    'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    'claim_musikk_melody_boss_alpha_salience_development',
    'claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63',
    'claim_musikk_form_huguet_op10_3_a4_close_84_106',
    'claim_musikk_timbre_gonzalez_prati_tinysol_dynamics_classification_2023',
    'claim_musikk_analytical_listening_rebonds_drag_solutions_timecoded_2023',
    HISTORY.claim
  ],
  direct_object_ids: [
    'obj_sioros_2014_zenodo_1221315',
    'obj_beethoven_op10_1_dcml_v2_5_05_1',
    'obj_beethoven_tempest_op31_2_dcml_v2_5_17_1',
    'obj_beethoven_op10_3_dcml_v2_5_07_4',
    'obj_tinysol_v6_flute_c4_pp_ff',
    'obj_rebonds_b_authors_illustrative_video_oseu0xr6bss',
    HISTORY.object
  ],
  released_emne_ids: [
    'em_musikk_vit_rytme_meter_groove_timing',
    'em_musikk_vit_melodi_motiv_frasering',
    'em_musikk_vit_harmoni_tonalitet_modalitet',
    'em_musikk_vit_form_prosess_improvisasjon',
    'em_musikk_vit_klang_tekstur_instrumentasjon',
    'em_musikk_vit_analytisk_lytting_beskrivelse',
    HISTORY.emne
  ],
  blocked_canonical_topic_count: 41,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/kildekritikk_musikkhistorie.json'
];
const source = (sourceId, locator, claimBasis) => ({ source_id: sourceId, locator, claim_basis: claimBasis });
const objectSource = (locator, claimBasis) => ({
  source_id: HISTORY.object,
  locator,
  use_mode: 'external_link_and_metadata_only',
  url: HISTORY.objectUrl,
  claim_basis: claimBasis
});

const historySet = {
  set_id: 'pathway_musikk_kildekritikk_musikkhistorie',
  title: 'Kildekritikk i musikkhistorien',
  level: 7,
  order: 7,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: HISTORY.target,
  area_id: HISTORY.domain,
  emne_id: HISTORY.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [HISTORY.object],
  question_ready_claim_ids: [HISTORY.claim],
  questions: [
    {
      id: 'quiz_musikk_kildekritikk_historie_pathway_q1',
      quiz_id: 'musikk_kildekritikk_historie_pathway_q1',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilke opplysninger identifiserer den historiske Grieg-siden som denne evidenskjeden gjelder?',
      options: ['Paris 2. mai 1903, matrix 2151F og katalog 35517', 'Kristiania 1907, matrix 35517 og katalog 2151F', 'Bare filnavnet Brudefølget1.mp3'],
      answer: 'Paris 2. mai 1903, matrix 2151F og katalog 35517',
      answerIndex: 0,
      knowledge: 'Marstons diskografi identifiserer Griegs Bridal Procession som en G&T-side fra Paris 2. mai 1903 med matrix 2151F og katalognummer 35517.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['matrixnummer', 'opptaksidentitet', 'diskografisk proveniens'],
      concept_ids: [],
      terms: ['matrixnummer', 'opptaksidentitet', 'diskografisk proveniens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_historie_observe',
      evidence_type: 'historical_claim',
      knowledge_payload: {
        summary: 'Den historiske siden kontrolleres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.',
        explanation: 'Dato, selskap, matrix og katalognummer er identitetsmetadata for den historiske opptakssiden. De er noe annet enn filnavnet til et langt senere webderivat.',
        why_it_matters: 'Kildekritikk starter med å identifisere hvilket historisk objekt senere kopier og representasjoner faktisk hevdes å stamme fra.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        source(HISTORY.marston, 'Marston 52054-2 :: CD 1 track 4 :: Paris 2 May 1903 :: matrix 2151F :: catalog 35517 :: 3:00', 'Den historiske siden kontrolleres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.'),
        source(HISTORY.mattes, 'Mattes 2020 :: section I after Table 1 :: matrix identity across copies', 'Den historiske siden kontrolleres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.')
      ],
      source_origin: 'external',
      claim_basis: 'Den historiske siden kontrolleres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_historie_pathway_q2',
      quiz_id: 'musikk_kildekritikk_historie_pathway_q2',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor kan et moderne webutdrag ikke uten videre behandles som den umedierte lydhendelsen i Paris i 1903?',
      options: ['Fordi matrixnumre bare gjelder noter og aldri lydopptak', 'Fordi opptaket er formidlet gjennom original opptaksteknikk, overlevende kopier, transfer og senere restaureringsvalg før webtilgang', 'Fordi alle historiske innspillinger må ignoreres som kilder'],
      answer: 'Fordi opptaket er formidlet gjennom original opptaksteknikk, overlevende kopier, transfer og senere restaureringsvalg før webtilgang',
      answerIndex: 1,
      knowledge: 'Mattes og Chasing the Butterfly viser at historiske opptak må leses gjennom en mediert kjede av opptaksteknikk, kopier, reissue, pitch-/speed-korreksjon, equalization og andre restaureringsvalg.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['kildekritikk', 'mediering', 'restaureringslag'],
      concept_ids: [],
      terms: ['kildekritikk', 'mediering', 'restaureringslag'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_historie_explain',
      evidence_type: 'historical_claim',
      knowledge_payload: {
        summary: 'Et moderne webutdrag er et senere representasjonslag etter opptaksteknikk, kopiering, transfer og restaurering.',
        explanation: 'Matrixidentiteten kan kontrollere hvilken historisk side vi undersøker, men selve signalet som høres i dag er formet av flere tekniske og redaksjonelle ledd. Derfor må identitet og lydlig transparens holdes fra hverandre.',
        why_it_matters: 'Skillet hindrer at et tilgjengelig digitalt derivat blir behandlet som om det var en nøytral, direkte kopi av studiohendelsen.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        source(HISTORY.mattes, 'Mattes 2020 :: sections I–III :: provenance, transmission and reissue limitations', 'Et moderne webutdrag er et senere representasjonslag etter opptaksteknikk, kopiering, transfer og restaurering.'),
        source(HISTORY.chasing, 'Chasing the Butterfly :: The Grieg 1903 Recordings :: pitch instability, equalization and restoration discussion', 'Et moderne webutdrag er et senere representasjonslag etter opptaksteknikk, kopiering, transfer og restaurering.')
      ],
      source_origin: 'external',
      claim_basis: 'Et moderne webutdrag er et senere representasjonslag etter opptaksteknikk, kopiering, transfer og restaurering.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_historie_pathway_q3',
      quiz_id: 'musikk_kildekritikk_historie_pathway_q3',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede støtter best det frigitte kildekritiske claimet?',
      options: ['Webfilen alene, fordi avspilling gjør proveniens overflødig', 'Bare Mattes-artikkelen, fordi en fagartikkel erstatter objektkontroll', 'Mattes forklarer provenanceproblemet, Marston kontrollerer matrix/date/catalog, og Chasing dokumenterer senere restaurerings-/webtilgangslag'],
      answer: 'Mattes forklarer provenanceproblemet, Marston kontrollerer matrix/date/catalog, og Chasing dokumenterer senere restaurerings-/webtilgangslag',
      answerIndex: 2,
      knowledge: 'Det robuste claimet bruker komplementære kilder: Mattes for metode og kildeproblem, Marston for uavhengig diskografisk identitetskontroll og Chasing for dokumentasjon av senere transfer/restaurering og webtilgang.',
      difficulty: 4,
      question_type: 'comparison',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['evidenskjede', 'uavhengig kontrollspor', 'versjonsidentitet'],
      concept_ids: [],
      terms: ['evidenskjede', 'uavhengig kontrollspor', 'versjonsidentitet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_historie_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Mattes, Marston og Chasing fyller ulike ledd i samme source-critical provenance chain.',
        explanation: 'Mattes begrunner hvorfor opptaket må behandles kildekritisk, Marston gir den uavhengige diskografiske kontrollen av 2151F/35517, og Chasing gjør senere restaureringsvalg og et webderivat inspeksjonsbare. Ingen enkeltkilde dekker hele kjeden alene.',
        why_it_matters: 'Kombinasjonen skiller påstandsgrunnlag, identitetskontroll og moderne representasjon i stedet for å la én kilde bære alle slutningene.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        source(HISTORY.mattes, 'Mattes 2020 :: section I after Table 1 and sections II–III', 'Mattes, Marston og Chasing fyller ulike ledd i samme source-critical provenance chain.'),
        source(HISTORY.marston, 'Marston 52054-2 :: CD 1 track 4 and conservation credits', 'Mattes, Marston og Chasing fyller ulike ledd i samme source-critical provenance chain.'),
        source(HISTORY.chasing, 'Chasing the Butterfly :: The Grieg 1903 Recordings and Ambiguity and Multi-layeredness', 'Mattes, Marston og Chasing fyller ulike ledd i samme source-critical provenance chain.'),
        objectSource('Chasing the Butterfly :: Ambiguity and Multi-layeredness :: embedded file label Brudefølget1.mp3', 'Mattes, Marston og Chasing fyller ulike ledd i samme source-critical provenance chain.')
      ],
      source_origin: 'external',
      claim_basis: 'Mattes, Marston og Chasing fyller ulike ledd i samme source-critical provenance chain.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_historie_pathway_q4',
      quiz_id: 'musikk_kildekritikk_historie_pathway_q4',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn evidenskjeden tillater?',
      options: ['At matrix 2151F identifiserer hvilken historisk opptaksside senere kopier knyttes til', 'At den tilgjengelige webfilen beviser eksakt original studiopitch, en nøytral master-til-fil-kjede og Griegs intensjon', 'At senere restoration må dokumenteres som et eget representasjonslag'],
      answer: 'At den tilgjengelige webfilen beviser eksakt original studiopitch, en nøytral master-til-fil-kjede og Griegs intensjon',
      answerIndex: 1,
      knowledge: 'Evidensen kontrollerer historisk sideidentitet og dokumenterer mediering, men den eksakte fysiske kilden og komplette filkjeden bak webutdraget er ikke kjent, og opptaket dokumenterer ikke Griegs uuttalte intensjon.',
      difficulty: 4,
      question_type: 'analysis',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['inferensgrense', 'original pitch', 'intensjon'],
      concept_ids: [],
      terms: ['inferensgrense', 'original pitch', 'intensjon'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_historie_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Matrixidentitet og moderne tilgang beviser ikke eksakt original studiopitch, en komplett nøytral transferkjede eller Griegs intensjon.',
        explanation: 'De gjennomgåtte kildene dokumenterer både tekniske tap og senere restaureringsvalg. Dessuten er source-copy-to-web-file-linjen ufullstendig. Derfor kan den digitale representasjonen ikke bære sterkere lydlige eller intensjonelle slutninger enn kjeden faktisk dokumenterer.',
        why_it_matters: 'Trinnet gjør manglende provenance til en aktiv begrensning i resonnementet, ikke et hull som fylles med antakelser.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        source(HISTORY.mattes, 'Mattes 2020 :: provenance/transmission limitations', 'Matrixidentitet og moderne tilgang beviser ikke eksakt original studiopitch, en komplett nøytral transferkjede eller Griegs intensjon.'),
        source(HISTORY.chasing, 'Chasing the Butterfly :: restoration choices and irreversible recording limits', 'Matrixidentitet og moderne tilgang beviser ikke eksakt original studiopitch, en komplett nøytral transferkjede eller Griegs intensjon.')
      ],
      source_origin: 'external',
      claim_basis: 'Matrixidentitet og moderne tilgang beviser ikke eksakt original studiopitch, en komplett nøytral transferkjede eller Griegs intensjon.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_historie_pathway_q5',
      quiz_id: 'musikk_kildekritikk_historie_pathway_q5',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke Chasing the Butterfly-lyden når nettstedet oppgir ©2010 og ingen gjenbrukslisens er identifisert?',
      options: ['Kopiere weblyden fordi selve 1903-opptaket er gammelt', 'Rehoste en komprimert versjon så lenge matrixnummeret oppgis', 'Vise ekstern prosjektside, identitets-/proveniensmetadata og locator uten å kopiere, ekstrahere, rehoste, modifisere eller embedde lydfilen'],
      answer: 'Vise ekstern prosjektside, identitets-/proveniensmetadata og locator uten å kopiere, ekstrahere, rehoste, modifisere eller embedde lydfilen',
      answerIndex: 2,
      knowledge: 'Det valgte webderivatet har ikke en identifisert gjenbrukslisens for History Go. Derfor er leveransemodus external_link_and_metadata_only selv om den historiske opptakshendelsen er fra 1903.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['rettigheter', 'derivatrettigheter', 'leveransemodus'],
      concept_ids: [],
      terms: ['rettigheter', 'derivatrettigheter', 'leveransemodus'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_historie_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Chasing-webderivatet forblir external_link_and_metadata_only fordi separat gjenbruksrett for lydfilen ikke er etablert.',
        explanation: 'Alderen på den historiske opptakshendelsen avgjør ikke automatisk rettighetene til en moderne transfer, restaurering eller webpublisering. History Go frigir derfor bare ekstern tilgang og metadata for dette derivatet.',
        why_it_matters: 'Rights-gaten følger den konkrete representasjonen som faktisk brukes, ikke bare alderen på det underliggende historiske verket eller opptaket.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        source(HISTORY.chasing, 'Chasing the Butterfly :: site footer ©2010 and Bridal Procession web example', 'Chasing-webderivatet forblir external_link_and_metadata_only fordi separat gjenbruksrett for lydfilen ikke er etablert.'),
        objectSource('Chasing the Butterfly :: Ambiguity and Multi-layeredness :: Brudefølget1.mp3 access derivative', 'Chasing-webderivatet forblir external_link_and_metadata_only fordi separat gjenbruksrett for lydfilen ikke er etablert.')
      ],
      source_origin: 'external',
      claim_basis: 'Chasing-webderivatet forblir external_link_and_metadata_only fordi separat gjenbruksrett for lydfilen ikke er etablert.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== HISTORY.emne);
pkg.sets.push(historySet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Historisk kildekritikk-pathway skrevet som sett 7.');
  } else {
    console.error('Historisk kildekritikk-pathway er utdatert. Kjør node tools/build-musikk-history-source-criticism-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Historisk kildekritikk-pathway sett 7 OK.');
}
