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

const MELODY = Object.freeze({
  emne: 'em_musikk_vit_melodi_motiv_frasering',
  target: 'subject_musikk_melodi_motiv_frasering',
  claim: 'claim_musikk_melody_boss_alpha_salience_development',
  object: 'obj_beethoven_op10_1_dcml_v2_5_05_1',
  boss: 'prod_src_boss_hidden_repetition_beethoven_1999',
  provenance: 'prod_src_hentschel_annotated_piano_corpus_2024',
  method: 'notasjons_kildeanalyse'
});

const newSources = [
  {
    id: MELODY.boss,
    type: 'peer_reviewed_article_production_extension',
    title: '“Schenkerian-Schoenbergian Analysis” and Hidden Repetition in the Opening Movement of Beethoven’s Piano Sonata Op. 10, No. 1',
    publisher_or_author: 'Jack F. Boss',
    date_or_version: 'Music Theory Online 5(1), 1999',
    url: 'https://www.mtosmt.org/issues/mto.99.5.1/mto.99.5.1.boss.html',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: MELODY.provenance,
    type: 'peer_reviewed_data_report_production_extension',
    title: 'An Annotated Corpus of Tonal Piano Music from the Long 19th Century',
    publisher_or_author: 'Johannes Hentschel, Yannis Rammos, Fabian C. Moss, Markus Neuwirth og Martin Rohrmeier',
    date_or_version: 'Empirical Musicology Review 18(1), 84–95 (2024), DOI 10.18061/emr.v18i1.8903',
    url: 'https://phaidra.bruckneruni.at/o:3910',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: MELODY.object,
    type: 'direct_research_object_score',
    title: 'Beethoven, Piano Sonata No. 5 in C minor, Op. 10 No. 1, movement 1 — DCML v2.5 score 05-1',
    publisher_or_author: 'DCMLab',
    date_or_version: 'v2.5; MS3/05-1.mscx; Zenodo DOI 10.5281/zenodo.15292707; archive MD5 a842f4e47ac9859d8cf91ebee91b02d6',
    url: 'https://github.com/DCMLab/beethoven_piano_sonatas/blob/v2.5/MS3/05-1.mscx',
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
  profile: 'subject_pathway_pilot_2x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: [
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json'
  ],
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: [
    'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    MELODY.claim
  ],
  direct_object_ids: [
    'obj_sioros_2014_zenodo_1221315',
    MELODY.object
  ],
  released_emne_ids: [
    'em_musikk_vit_rytme_meter_groove_timing',
    MELODY.emne
  ],
  blocked_canonical_topic_count: 46,
  rights_mode: 'external_link_and_metadata_only'
};

const melodySet = {
  set_id: 'pathway_musikk_melodi_motiv_frasering',
  title: 'Melodi, motiv og frasering',
  level: 5,
  order: 2,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: MELODY.target,
  area_id: 'musikalsk_analyse_lyd_struktur',
  emne_id: MELODY.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [MELODY.object],
  question_ready_claim_ids: [MELODY.claim],
  questions: [
    {
      id: 'quiz_musikk_melodi_motiv_pathway_q1',
      quiz_id: 'musikk_melodi_motiv_pathway_q1',
      categoryId: 'musikk',
      targetId: MELODY.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvor lokaliserer Boss alpha-motivet tydelig i sopranens overflate i utviklingsdelen?',
      options: ['Takt 1–9 og 17–24', 'Takt 119–121 og 127–129', 'Takt 200–208 og 250–258'],
      answer: 'Takt 119–121 og 127–129',
      answerIndex: 1,
      knowledge: 'I Boss sin analyse ligger alpha-motivet tydelig i sopranens overflate i takt 119–121 og 127–129 i utviklingsdelen.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: MELODY.emne,
      method_id: MELODY.method,
      direct_object_id: MELODY.object,
      core_concepts: ['motiv', 'saliens', 'taktlokator'],
      concept_ids: [],
      terms: ['motiv', 'saliens', 'taktlokator'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_melodi_motiv_observe',
      evidence_type: 'score_or_representation_claim',
      knowledge_payload: {
        summary: 'I Boss sin analyse ligger alpha-motivet tydelig i sopranens overflate i takt 119–121 og 127–129 i utviklingsdelen.',
        explanation: 'Boss følger alpha fra en mer skjult rolle til tydelige overflateforekomster. Den versjonerte DCML-scorefilen gir det direkte noterte objektet som de samme taktintervallene kan lokaliseres i.',
        why_it_matters: 'Trinnet trener presis motivanalyse med eksplisitt takt- og modellavgrensning.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: MELODY.boss, locator: 'para. [10], mm. 119–121 og 127–129', claim_basis: 'I Boss sin analyse ligger alpha-motivet tydelig i sopranens overflate i takt 119–121 og 127–129 i utviklingsdelen.' },
        { source_id: MELODY.object, locator: 'MS3/05-1.mscx, mm. 119–129', use_mode: 'external_link_and_metadata_only', claim_basis: 'I Boss sin analyse ligger alpha-motivet tydelig i sopranens overflate i takt 119–121 og 127–129 i utviklingsdelen.' }
      ],
      source_origin: 'external',
      claim_basis: 'I Boss sin analyse ligger alpha-motivet tydelig i sopranens overflate i takt 119–121 og 127–129 i utviklingsdelen.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json'
      ],
      claim_id: MELODY.claim
    },
    {
      id: 'quiz_musikk_melodi_motiv_pathway_q2',
      quiz_id: 'musikk_melodi_motiv_pathway_q2',
      categoryId: 'musikk',
      targetId: MELODY.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hva er mest presist med Boss sin analyse av takt 136–141?',
      options: ['Alpha forsvinner helt fra overflaten', 'Bare én isolert alpha-figur finnes i hele passasjen', 'Hver to-taktsenhet inneholder alpha, som i hans modell markerer økt overflatesaliens'],
      answer: 'Hver to-taktsenhet inneholder alpha, som i hans modell markerer økt overflatesaliens',
      answerIndex: 2,
      knowledge: 'I takt 136–141 beskriver Boss alpha i hver to-taktsenhet og tolker dette som et høydepunkt i motivets økte overflatesaliens.',
      difficulty: 2,
      question_type: 'concept',
      emne_id: MELODY.emne,
      method_id: MELODY.method,
      direct_object_id: MELODY.object,
      core_concepts: ['motivisk repetisjon', 'saliens', 'segmentering'],
      concept_ids: [],
      terms: ['motivisk repetisjon', 'saliens', 'segmentering'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_melodi_motiv_explain',
      evidence_type: 'score_or_representation_claim',
      knowledge_payload: {
        summary: 'I takt 136–141 beskriver Boss alpha i hver to-taktsenhet og tolker dette som et høydepunkt i motivets økte overflatesaliens.',
        explanation: 'Poenget er ikke bare at en lik figur finnes flere ganger, men at Boss innen sin eksplisitte analysemodell følger en organisert saliensprosess fram mot en passasje der alpha metter overflaten.',
        why_it_matters: 'Trinnet lærer å skille dokumentert scorelokalisering fra den analytiske modellen som gir lokaliseringen betydning.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: MELODY.boss, locator: 'para. [10], mm. 136–141', claim_basis: 'I takt 136–141 beskriver Boss alpha i hver to-taktsenhet og tolker dette som et høydepunkt i motivets økte overflatesaliens.' },
        { source_id: MELODY.object, locator: 'MS3/05-1.mscx, mm. 136–141', use_mode: 'external_link_and_metadata_only', claim_basis: 'I takt 136–141 beskriver Boss alpha i hver to-taktsenhet og tolker dette som et høydepunkt i motivets økte overflatesaliens.' }
      ],
      source_origin: 'external',
      claim_basis: 'I takt 136–141 beskriver Boss alpha i hver to-taktsenhet og tolker dette som et høydepunkt i motivets økte overflatesaliens.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json'
      ],
      claim_id: MELODY.claim
    },
    {
      id: 'quiz_musikk_melodi_motiv_pathway_q3',
      quiz_id: 'musikk_melodi_motiv_pathway_q3',
      categoryId: 'musikk',
      targetId: MELODY.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede gjør salienspåstanden best etterprøvbar?',
      options: ['Boss sine presise taktreferanser sammen med en versjonert DCML-score og dokumentert korpusproveniens', 'Bare sonatens tittel og opusnummer', 'Bare en generell lærebokdefinisjon av motiv'],
      answer: 'Boss sine presise taktreferanser sammen med en versjonert DCML-score og dokumentert korpusproveniens',
      answerIndex: 0,
      knowledge: 'Påstanden blir etterprøvbar når Boss sine analytiske taktreferanser kobles til den versjonerte DCML-scorefilen og Hentschel mfl. sin dokumentasjon av korpusets proveniens og reviewprosess.',
      difficulty: 3,
      question_type: 'comparison',
      emne_id: MELODY.emne,
      method_id: MELODY.method,
      direct_object_id: MELODY.object,
      core_concepts: ['evidenskjede', 'proveniens', 'versjonert notekilde'],
      concept_ids: [],
      terms: ['evidenskjede', 'proveniens', 'versjonert notekilde'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_melodi_motiv_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Påstanden blir etterprøvbar når Boss sine analytiske taktreferanser kobles til den versjonerte DCML-scorefilen og Hentschel mfl. sin dokumentasjon av korpusets proveniens og reviewprosess.',
        explanation: 'Boss støtter selve motivanalysen. DCML gir et identifisert notert objekt med versjon og mållokatorer. Hentschel mfl. dokumenterer hvordan score- og annotasjonskorpuset er kontrollert og revidert. Kildene har derfor ulike roller i samme sporbare kjede.',
        why_it_matters: 'Trinnet trener kildehierarki: analyse, objekt og proveniens må ikke blandes sammen.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: MELODY.boss, locator: 'paras. [10]–[14], mm. 119–141', claim_basis: 'Påstanden blir etterprøvbar når Boss sine analytiske taktreferanser kobles til den versjonerte DCML-scorefilen og Hentschel mfl. sin dokumentasjon av korpusets proveniens og reviewprosess.' },
        { source_id: MELODY.provenance, locator: 'pp. 84–87, Scores / Annotations / Dataset / Formats and features', claim_basis: 'Påstanden blir etterprøvbar når Boss sine analytiske taktreferanser kobles til den versjonerte DCML-scorefilen og Hentschel mfl. sin dokumentasjon av korpusets proveniens og reviewprosess.' },
        { source_id: MELODY.object, locator: 'MS3/05-1.mscx, mm. 119–141; DCML v2.5', use_mode: 'external_link_and_metadata_only', claim_basis: 'Påstanden blir etterprøvbar når Boss sine analytiske taktreferanser kobles til den versjonerte DCML-scorefilen og Hentschel mfl. sin dokumentasjon av korpusets proveniens og reviewprosess.' }
      ],
      source_origin: 'external',
      claim_basis: 'Påstanden blir etterprøvbar når Boss sine analytiske taktreferanser kobles til den versjonerte DCML-scorefilen og Hentschel mfl. sin dokumentasjon av korpusets proveniens og reviewprosess.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json'
      ],
      claim_id: MELODY.claim
    },
    {
      id: 'quiz_musikk_melodi_motiv_pathway_q4',
      quiz_id: 'musikk_melodi_motiv_pathway_q4',
      categoryId: 'musikk',
      targetId: MELODY.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken konklusjon går lenger enn evidensen tillater?',
      options: ['At Boss sin segmentering er modellavhengig', 'At forekomsten av alpha beviser at Beethoven bevisst planla akkurat Boss sin motivmodell', 'At takt 119–129 og 136–141 kan brukes som eksplisitte scorelokatorer i analysen'],
      answer: 'At forekomsten av alpha beviser at Beethoven bevisst planla akkurat Boss sin motivmodell',
      answerIndex: 1,
      knowledge: 'Boss sin analyse og partituret dokumenterer en analytisk motivprosess, men de beviser ikke Beethovens bevisste intensjon eller at segmenteringen er modelluavhengig.',
      difficulty: 4,
      question_type: 'analysis',
      emne_id: MELODY.emne,
      method_id: MELODY.method,
      direct_object_id: MELODY.object,
      core_concepts: ['modellavhengighet', 'intensjon', 'analytisk slutning'],
      concept_ids: [],
      terms: ['modellavhengighet', 'intensjon', 'analytisk slutning'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_melodi_motiv_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Boss sin analyse og partituret dokumenterer en analytisk motivprosess, men de beviser ikke Beethovens bevisste intensjon eller at segmenteringen er modelluavhengig.',
        explanation: 'Boss gjør sin Schenkerian-Schoenbergian segmentering eksplisitt. Det gjør analysen etterprøvbar som analyse, men åpner ikke for å lese komponistintensjon direkte ut av notebildet eller å framstille alpha/delta som de eneste mulige segmentene.',
        why_it_matters: 'Trinnet trener skillet mellom scoreobservasjon, analytisk modell og historisk intensjon.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: MELODY.boss, locator: 'paras. [5], [13]–[17]', claim_basis: 'Boss sin analyse og partituret dokumenterer en analytisk motivprosess, men de beviser ikke Beethovens bevisste intensjon eller at segmenteringen er modelluavhengig.' }
      ],
      source_origin: 'external',
      claim_basis: 'Boss sin analyse og partituret dokumenterer en analytisk motivprosess, men de beviser ikke Beethovens bevisste intensjon eller at segmenteringen er modelluavhengig.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json'
      ],
      claim_id: MELODY.claim
    },
    {
      id: 'quiz_musikk_melodi_motiv_pathway_q5',
      quiz_id: 'musikk_melodi_motiv_pathway_q5',
      categoryId: 'musikk',
      targetId: MELODY.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke DCML-scorefilen når kommersiell lisenskompatibilitet ikke er avklart?',
      options: ['Kopiere og rendre hele scorefilen i appen fordi verket er gammelt', 'Endre scorefilen og publisere en egen variant uten ny rettighetsvurdering', 'Vise metadata, versjon, mållokatorer og ekstern lenke uten å kopiere, rendre eller endre filen'],
      answer: 'Vise metadata, versjon, mållokatorer og ekstern lenke uten å kopiere, rendre eller endre filen',
      answerIndex: 2,
      knowledge: 'DCML v2.5 er CC BY-NC-SA 4.0, og History Go har ikke avklart kommersiell kompatibilitet. Produksjonen bruker derfor scorefilen bare som ekstern lenke og metadata med mållokatorer.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: MELODY.emne,
      method_id: MELODY.method,
      direct_object_id: MELODY.object,
      core_concepts: ['notekilde', 'lisenskompatibilitet', 'gjenbruk'],
      concept_ids: [],
      terms: ['notekilde', 'lisenskompatibilitet', 'gjenbruk'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_melodi_motiv_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'DCML v2.5 er CC BY-NC-SA 4.0, og History Go har ikke avklart kommersiell kompatibilitet. Produksjonen bruker derfor scorefilen bare som ekstern lenke og metadata med mållokatorer.',
        explanation: 'Et gammelt verk betyr ikke at enhver digital scoreutgave kan kopieres fritt. Her er selve DCML-datasettet lisensiert CC BY-NC-SA 4.0, og produksjonen har eksplisitt valgt external-link-and-metadata-only inntil kompatibiliteten med History Go er avklart.',
        why_it_matters: 'Trinnet trener at forskningsobjektets lisens er en del av evidens- og publiseringskjeden.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: MELODY.object, locator: 'DCML Beethoven v2.5 README license; MS3/05-1.mscx; Zenodo DOI 10.5281/zenodo.15292707', use_mode: 'external_link_and_metadata_only', claim_basis: 'DCML v2.5 er CC BY-NC-SA 4.0, og History Go har ikke avklart kommersiell kompatibilitet. Produksjonen bruker derfor scorefilen bare som ekstern lenke og metadata med mållokatorer.' }
      ],
      source_origin: 'external',
      claim_basis: 'DCML v2.5 er CC BY-NC-SA 4.0, og History Go har ikke avklart kommersiell kompatibilitet. Produksjonen bruker derfor scorefilen bare som ekstern lenke og metadata med mållokatorer.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json'
      ]
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== MELODY.emne);
pkg.sets.push(melodySet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Melodi/motiv/frasering-pathway skrevet som sett 2.');
  } else {
    console.error('Melodi-pathway er utdatert. Kjør node tools/build-musikk-melody-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Melodi-pathway sett 2 OK.');
}
