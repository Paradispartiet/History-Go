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

const HARMONY = Object.freeze({
  emne: 'em_musikk_vit_harmoni_tonalitet_modalitet',
  target: 'subject_musikk_harmoni_tonalitet_modalitet',
  claim: 'claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63',
  object: 'obj_beethoven_tempest_op31_2_dcml_v2_5_17_1',
  caplin: 'prod_src_caplin_tempest_exposition_2010',
  provenance: 'prod_src_hentschel_annotated_piano_corpus_2024',
  method: 'notasjons_kildeanalyse'
});

const newSources = [
  {
    id: HARMONY.caplin,
    type: 'peer_reviewed_article_production_extension',
    title: 'Beethoven’s “Tempest” Exposition: A Response to Janet Schmalfeldt',
    publisher_or_author: 'William E. Caplin',
    date_or_version: 'Music Theory Online 16(2), 2010',
    url: 'https://mtosmt.org/classic/mto.10.16.2/mto.10.16.2.caplin.php',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: HARMONY.provenance,
    type: 'peer_reviewed_data_report_production_extension',
    title: 'An Annotated Corpus of Tonal Piano Music from the Long 19th Century',
    publisher_or_author: 'Johannes Hentschel, Yannis Rammos, Fabian C. Moss, Markus Neuwirth og Martin Rohrmeier',
    date_or_version: 'Empirical Musicology Review 18(1), 84–95 (2024), DOI 10.18061/emr.v18i1.8903',
    url: 'https://phaidra.bruckneruni.at/o:3910',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: HARMONY.object,
    type: 'direct_research_object_score',
    title: 'Beethoven, Piano Sonata No. 17 in D minor, Op. 31 No. 2 (“Tempest”), movement 1 — DCML v2.5 score 17-1',
    publisher_or_author: 'DCMLab',
    date_or_version: 'v2.5; MS3/17-1.mscx + harmonies/17-1.harmonies.tsv; Zenodo DOI 10.5281/zenodo.15292707; archive MD5 a842f4e47ac9859d8cf91ebee91b02d6',
    url: 'https://github.com/DCMLab/beethoven_piano_sonatas/blob/v2.5/MS3/17-1.mscx',
    status: 'direct_object_verified',
    object_type: 'notert_kilde',
    use_mode: 'external_link_and_metadata_only',
    license: 'CC BY-NC-SA 4.0',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_3x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: [
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json'
  ],
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: [
    'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    'claim_musikk_melody_boss_alpha_salience_development',
    HARMONY.claim
  ],
  direct_object_ids: [
    'obj_sioros_2014_zenodo_1221315',
    'obj_beethoven_op10_1_dcml_v2_5_05_1',
    HARMONY.object
  ],
  released_emne_ids: [
    'em_musikk_vit_rytme_meter_groove_timing',
    'em_musikk_vit_melodi_motiv_frasering',
    HARMONY.emne
  ],
  blocked_canonical_topic_count: 45,
  rights_mode: 'external_link_and_metadata_only'
};

const harmonySet = {
  set_id: 'pathway_musikk_harmoni_tonalitet_modalitet',
  title: 'Harmoni, tonalitet og modalitet',
  level: 5,
  order: 3,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: HARMONY.target,
  area_id: 'musikalsk_analyse_lyd_struktur',
  emne_id: HARMONY.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [HARMONY.object],
  question_ready_claim_ids: [HARMONY.claim],
  questions: [
    {
      id: 'quiz_musikk_harmoni_tonalitet_pathway_q1',
      quiz_id: 'musikk_harmoni_tonalitet_pathway_q1',
      categoryId: 'musikk',
      targetId: HARMONY.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hva lokaliserer Caplin ved takt 41 i første sats av Beethovens «Tempest»-sonate?',
      options: ['En fullkommen autentisk kadens i hovedtonearten', 'En halvslutning i den nye tonearten A-moll', 'En modulasjonsfri tonikaforlengelse i D-moll'],
      answer: 'En halvslutning i den nye tonearten A-moll',
      answerIndex: 1,
      knowledge: 'Caplin lokaliserer en halvslutning i den nye tonearten A-moll ved takt 41 før en lang dominantregion.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: HARMONY.emne,
      method_id: HARMONY.method,
      direct_object_id: HARMONY.object,
      core_concepts: ['halvslutning', 'tonalt sentrum', 'taktlokator'],
      concept_ids: [],
      terms: ['halvslutning', 'tonalt sentrum', 'taktlokator'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_harmoni_tonalitet_observe',
      evidence_type: 'score_or_representation_claim',
      knowledge_payload: {
        summary: 'Caplin lokaliserer en halvslutning i den nye tonearten A-moll ved takt 41 før en lang dominantregion.',
        explanation: 'Caplins formfunksjonelle analyse bruker takt 41 som et presist tonalt og formalt anker. DCML v2.5 gir et versjonert notert objekt der samme takt kan lokaliseres, men DCML brukes ikke som uavhengig bevis for Caplins funksjonskategori.',
        why_it_matters: 'Trinnet trener presis harmonisk lokalisering før større funksjonelle slutninger trekkes.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: HARMONY.caplin, locator: 'para. [12], m. 41', claim_basis: 'Caplin lokaliserer en halvslutning i den nye tonearten A-moll ved takt 41 før en lang dominantregion.' },
        { source_id: HARMONY.object, locator: 'MS3/17-1.mscx + harmonies/17-1.harmonies.tsv, m. 41', use_mode: 'external_link_and_metadata_only', claim_basis: 'Caplin lokaliserer en halvslutning i den nye tonearten A-moll ved takt 41 før en lang dominantregion.' }
      ],
      source_origin: 'external',
      claim_basis: 'Caplin lokaliserer en halvslutning i den nye tonearten A-moll ved takt 41 før en lang dominantregion.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json'
      ],
      claim_id: HARMONY.claim
    },
    {
      id: 'quiz_musikk_harmoni_tonalitet_pathway_q2',
      quiz_id: 'musikk_harmoni_tonalitet_pathway_q2',
      categoryId: 'musikk',
      targetId: HARMONY.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvilket forløp beskriver best Caplins analyse fra takt 41 til takt 63?',
      options: ['Halvslutning ved 41, umiddelbar tonika ved 42 og ingen ny kadens før 75', 'PAC ved 41, subdominantpedal til 54 og halvslutning ved 63', 'Halvslutning ved 41, dominantpedal gjennom 54, tonikaområde fra 55 og kadensdominant som leder til PAC ved 63'],
      answer: 'Halvslutning ved 41, dominantpedal gjennom 54, tonikaområde fra 55 og kadensdominant som leder til PAC ved 63',
      answerIndex: 2,
      knowledge: 'Caplin beskriver en halvslutning ved takt 41, dominantpedal gjennom 54 og et nytt tonalt forløp fra takt 55 som ender i PAC ved takt 63.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: HARMONY.emne,
      method_id: HARMONY.method,
      direct_object_id: HARMONY.object,
      core_concepts: ['dominantpedal', 'tonikaforløp', 'autentisk kadens'],
      concept_ids: [],
      terms: ['dominantpedal', 'tonikaforløp', 'autentisk kadens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_harmoni_tonalitet_explain',
      evidence_type: 'score_or_representation_claim',
      knowledge_payload: {
        summary: 'Caplin beskriver en halvslutning ved takt 41, dominantpedal gjennom 54 og et nytt tonalt forløp fra takt 55 som ender i PAC ved takt 63.',
        explanation: 'Etter halvslutningen følger hos Caplin en lang dominantregion. Ved takt 55 kommer tonika i første omvending, deretter naboneapolitanske harmonier og IV ved takt 62 før kadensdominanten leder til PAC ved takt 63.',
        why_it_matters: 'Trinnet viser hvordan en harmonisk analyse må dokumentere både lokatorer og funksjonell sammenheng over flere takter.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: HARMONY.caplin, locator: 'para. [12], mm. 41–63', claim_basis: 'Caplin beskriver en halvslutning ved takt 41, dominantpedal gjennom 54 og et nytt tonalt forløp fra takt 55 som ender i PAC ved takt 63.' },
        { source_id: HARMONY.object, locator: 'MS3/17-1.mscx + harmonies/17-1.harmonies.tsv, mm. 41–63', use_mode: 'external_link_and_metadata_only', claim_basis: 'Caplin beskriver en halvslutning ved takt 41, dominantpedal gjennom 54 og et nytt tonalt forløp fra takt 55 som ender i PAC ved takt 63.' }
      ],
      source_origin: 'external',
      claim_basis: 'Caplin beskriver en halvslutning ved takt 41, dominantpedal gjennom 54 og et nytt tonalt forløp fra takt 55 som ender i PAC ved takt 63.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json'
      ],
      claim_id: HARMONY.claim
    },
    {
      id: 'quiz_musikk_harmoni_tonalitet_pathway_q3',
      quiz_id: 'musikk_harmoni_tonalitet_pathway_q3',
      categoryId: 'musikk',
      targetId: HARMONY.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede gjør Caplins harmoniske påstand mest etterprøvbar uten å blande kilderollene?',
      options: ['Caplins fulltekstanalyse med taktangivelser, et versjonert DCML-objekt for samme sats og Hentschel mfl. for korpusproveniens', 'Bare DCMLs harmoniannotasjoner, fordi de automatisk beviser Caplins funksjonsanalyse', 'Bare sonatens tittel og en generell definisjon av dominant'],
      answer: 'Caplins fulltekstanalyse med taktangivelser, et versjonert DCML-objekt for samme sats og Hentschel mfl. for korpusproveniens',
      answerIndex: 0,
      knowledge: 'Caplin støtter selve analyseclaimet, DCML gir det versjonerte noterte objektet, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.',
      difficulty: 3,
      question_type: 'comparison',
      emne_id: HARMONY.emne,
      method_id: HARMONY.method,
      direct_object_id: HARMONY.object,
      core_concepts: ['evidenskjede', 'analytisk representasjon', 'proveniens'],
      concept_ids: [],
      terms: ['evidenskjede', 'analytisk representasjon', 'proveniens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_harmoni_tonalitet_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Caplin støtter selve analyseclaimet, DCML gir det versjonerte noterte objektet, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.',
        explanation: 'Kildene fyller tre ulike roller. Caplin er analysegrunnlaget, DCML er det inspeksjonsbare forskningsobjektet, og Hentschel mfl. dokumenterer hvordan korpuset er etablert og revidert; ingen av de to siste behandles som automatisk validering av Caplins funksjonskategorier.',
        why_it_matters: 'Trinnet trener kildehierarki og hindrer at analyse, objekt og proveniens smeltes sammen til én falsk beviskjede.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: HARMONY.caplin, locator: 'paras. [12]–[14], mm. 41–63', claim_basis: 'Caplin støtter selve analyseclaimet, DCML gir det versjonerte noterte objektet, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.' },
        { source_id: HARMONY.provenance, locator: 'pp. 84–87, Scores / Annotations / Dataset / Formats and features', claim_basis: 'Caplin støtter selve analyseclaimet, DCML gir det versjonerte noterte objektet, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.' },
        { source_id: HARMONY.object, locator: 'DCML v2.5, MS3/17-1.mscx + harmonies/17-1.harmonies.tsv, mm. 41–63', use_mode: 'external_link_and_metadata_only', claim_basis: 'Caplin støtter selve analyseclaimet, DCML gir det versjonerte noterte objektet, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.' }
      ],
      source_origin: 'external',
      claim_basis: 'Caplin støtter selve analyseclaimet, DCML gir det versjonerte noterte objektet, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json'
      ],
      claim_id: HARMONY.claim
    },
    {
      id: 'quiz_musikk_harmoni_tonalitet_pathway_q4',
      quiz_id: 'musikk_harmoni_tonalitet_pathway_q4',
      categoryId: 'musikk',
      targetId: HARMONY.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken konklusjon går lenger enn evidensen tillater?',
      options: ['At Caplins funksjonsanalyse bruker eksplisitte taktangivelser og en bestemt analytisk modell', 'At Caplin og DCML sammen beviser den eneste sanne harmoniske strukturen og Beethovens bevisste funksjonsplan', 'At DCML kan brukes som et separat, versjonert objekt uten å være uavhengig validering av Caplin'],
      answer: 'At Caplin og DCML sammen beviser den eneste sanne harmoniske strukturen og Beethovens bevisste funksjonsplan',
      answerIndex: 1,
      knowledge: 'Caplins analyse er modellavhengig, og DCML er en separat analytisk representasjon; kombinasjonen dokumenterer verken én eneste sann struktur eller Beethovens bevisste funksjonsintensjon.',
      difficulty: 4,
      question_type: 'analysis',
      emne_id: HARMONY.emne,
      method_id: HARMONY.method,
      direct_object_id: HARMONY.object,
      core_concepts: ['modellavhengighet', 'analytisk representasjon', 'intensjon'],
      concept_ids: [],
      terms: ['modellavhengighet', 'analytisk representasjon', 'intensjon'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_harmoni_tonalitet_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Caplins analyse er modellavhengig, og DCML er en separat analytisk representasjon; kombinasjonen dokumenterer verken én eneste sann struktur eller Beethovens bevisste funksjonsintensjon.',
        explanation: 'Caplin argumenterer eksplisitt innen en formfunksjonell ramme og diskuterer alternative lesninger. DCML inneholder egne ekspertannotasjoner, men evidenslaget forbyr å bruke dem som uavhengig bevis for Caplin eller å lese komponistintensjon direkte ut av analytiske modeller.',
        why_it_matters: 'Trinnet trener skillet mellom etterprøvbar analyse, konkurrerende representasjoner og historisk intensjon.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: HARMONY.caplin, locator: 'paras. [12]–[14], [20]–[25]', claim_basis: 'Caplins analyse er modellavhengig, og DCML er en separat analytisk representasjon; kombinasjonen dokumenterer verken én eneste sann struktur eller Beethovens bevisste funksjonsintensjon.' },
        { source_id: HARMONY.provenance, locator: 'pp. 85–87, Annotations / Dataset / Formats and features', claim_basis: 'Caplins analyse er modellavhengig, og DCML er en separat analytisk representasjon; kombinasjonen dokumenterer verken én eneste sann struktur eller Beethovens bevisste funksjonsintensjon.' }
      ],
      source_origin: 'external',
      claim_basis: 'Caplins analyse er modellavhengig, og DCML er en separat analytisk representasjon; kombinasjonen dokumenterer verken én eneste sann struktur eller Beethovens bevisste funksjonsintensjon.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json'
      ],
      claim_id: HARMONY.claim
    },
    {
      id: 'quiz_musikk_harmoni_tonalitet_pathway_q5',
      quiz_id: 'musikk_harmoni_tonalitet_pathway_q5',
      categoryId: 'musikk',
      targetId: HARMONY.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke DCML-score- og harmonidataene når kommersiell lisenskompatibilitet ikke er avklart?',
      options: ['Kopiere score- og TSV-filene inn i appen fordi Beethoven er public domain', 'Endre annotasjonene og redistribuere en egen versjon uten ny rettighetsvurdering', 'Vise identitet, versjon, takt-/objektlokatorer og ekstern lenke uten å kopiere, rendre eller modifisere filene'],
      answer: 'Vise identitet, versjon, takt-/objektlokatorer og ekstern lenke uten å kopiere, rendre eller modifisere filene',
      answerIndex: 2,
      knowledge: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Score- og harmonidataene brukes derfor bare som ekstern lenke og metadata med lokatorer.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: HARMONY.emne,
      method_id: HARMONY.method,
      direct_object_id: HARMONY.object,
      core_concepts: ['notekilde', 'lisenskompatibilitet', 'gjenbruk'],
      concept_ids: [],
      terms: ['notekilde', 'lisenskompatibilitet', 'gjenbruk'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_harmoni_tonalitet_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Score- og harmonidataene brukes derfor bare som ekstern lenke og metadata med lokatorer.',
        explanation: 'Beethovens verk er gammelt, men den digitale DCML-utgaven og annotasjonsdatasettet har en egen lisens. Evidensporten krever derfor external-link-and-metadata-only inntil History Go har en separat avklaring av kommersiell kompatibilitet.',
        why_it_matters: 'Trinnet trener at rettigheter til forskningsobjektet er en eksplisitt del av publiserings- og evidenskjeden.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: HARMONY.object, locator: 'DCML Beethoven v2.5 README license; MS3/17-1.mscx; harmonies/17-1.harmonies.tsv; Zenodo DOI 10.5281/zenodo.15292707', use_mode: 'external_link_and_metadata_only', claim_basis: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Score- og harmonidataene brukes derfor bare som ekstern lenke og metadata med lokatorer.' }
      ],
      source_origin: 'external',
      claim_basis: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Score- og harmonidataene brukes derfor bare som ekstern lenke og metadata med lokatorer.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json'
      ]
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== HARMONY.emne);
pkg.sets.push(harmonySet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Harmoni/tonalitet/modalitet-pathway skrevet som sett 3.');
  } else {
    console.error('Harmoni-pathway er utdatert. Kjør node tools/build-musikk-harmony-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Harmoni-pathway sett 3 OK.');
}
