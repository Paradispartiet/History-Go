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

const TIMBRE = Object.freeze({
  emne: 'em_musikk_vit_klang_tekstur_instrumentasjon',
  target: 'subject_musikk_klang_tekstur_instrumentasjon',
  claim: 'claim_musikk_timbre_gonzalez_prati_tinysol_dynamics_classification_2023',
  object: 'obj_tinysol_v6_flute_c4_pp_ff',
  article: 'prod_src_gonzalez_prati_timbral_variations_2023',
  provenance: 'prod_src_tinysol_v6_zenodo_documentation_2020',
  method: 'klang_spektralanalyse'
});

const newSources = [
  {
    id: TIMBRE.article,
    type: 'peer_reviewed_article_production_extension',
    title: 'Comparative Study of Musical Timbral Variations: Crescendo and Vibrato Using FFT-Acoustic Descriptor',
    publisher_or_author: 'Yubiry Gonzalez og Ronaldo C. Prati',
    date_or_version: 'Eng 4(3), 2468–2482 (2023); DOI 10.3390/eng4030140',
    url: 'https://www.mdpi.com/2673-4117/4/3/140',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: TIMBRE.provenance,
    type: 'dataset_documentation_production_extension',
    title: 'TinySOL: an audio dataset of isolated musical notes, version 6.0',
    publisher_or_author: 'Carmine-Emanuele Cella, Daniele Ghisi, Vincent Lostanlen, Fabien Lévy, Joshua Fineberg og Yan Maresz',
    date_or_version: 'Zenodo v6.0 (2020); DOI 10.5281/zenodo.3685367',
    url: 'https://zenodo.org/records/3685367',
    status: 'reviewed_repository_documentation'
  },
  {
    id: TIMBRE.object,
    type: 'direct_research_object_audio',
    title: 'TinySOL v6 — matched flute C4 ordinario samples at pp and ff',
    publisher_or_author: 'TinySOL / IRCAM',
    date_or_version: 'v6.0; TinySOL.tar.gz; DOI 10.5281/zenodo.3685367; MD5 36030a7fe389da86c3419e5ee48e3b7f',
    url: 'https://zenodo.org/records/3685367',
    status: 'direct_object_verified',
    object_type: 'lydopptak',
    use_mode: 'external_link_and_metadata_only',
    license: 'CC BY 4.0',
    commercial_compatibility_with_history_go: 'resolved_compatible_with_attribution'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_5x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: [
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json'
  ],
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: [
    'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    'claim_musikk_melody_boss_alpha_salience_development',
    'claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63',
    'claim_musikk_form_huguet_op10_3_a4_close_84_106',
    TIMBRE.claim
  ],
  direct_object_ids: [
    'obj_sioros_2014_zenodo_1221315',
    'obj_beethoven_op10_1_dcml_v2_5_05_1',
    'obj_beethoven_tempest_op31_2_dcml_v2_5_17_1',
    'obj_beethoven_op10_3_dcml_v2_5_07_4',
    TIMBRE.object
  ],
  released_emne_ids: [
    'em_musikk_vit_rytme_meter_groove_timing',
    'em_musikk_vit_melodi_motiv_frasering',
    'em_musikk_vit_harmoni_tonalitet_modalitet',
    'em_musikk_vit_form_prosess_improvisasjon',
    TIMBRE.emne
  ],
  blocked_canonical_topic_count: 43,
  rights_mode: 'external_link_and_metadata_only'
};

const timbreSet = {
  set_id: 'pathway_musikk_klang_tekstur_instrumentasjon',
  title: 'Klang, tekstur og instrumentasjon',
  level: 5,
  order: 5,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: TIMBRE.target,
  area_id: 'musikalsk_analyse_lyd_struktur',
  emne_id: TIMBRE.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [TIMBRE.object],
  question_ready_claim_ids: [TIMBRE.claim],
  questions: [
    {
      id: 'quiz_musikk_klang_tekstur_pathway_q1',
      quiz_id: 'musikk_klang_tekstur_pathway_q1',
      categoryId: 'musikk',
      targetId: TIMBRE.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilke dynamikkklasser inngår i Gonzalez og Pratis TinySOL-klassifikasjon?',
      options: ['pp, mf og ff', 'Bare pp og ff', 'p, mp og f'],
      answer: 'pp, mf og ff',
      answerIndex: 0,
      knowledge: 'I TinySOL-klassifikasjonen behandles pianissimo, mezzo-forte og fortissimo som separate dynamikkklasser.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: TIMBRE.emne,
      method_id: TIMBRE.method,
      direct_object_id: TIMBRE.object,
      core_concepts: ['dynamikk', 'klassifikasjon', 'TinySOL'],
      concept_ids: [],
      terms: ['dynamikk', 'klassifikasjon', 'TinySOL'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_klang_tekstur_observe',
      evidence_type: 'computational_measurement',
      knowledge_payload: {
        summary: 'I TinySOL-klassifikasjonen behandles pianissimo, mezzo-forte og fortissimo som separate dynamikkklasser.',
        explanation: 'Gonzalez og Prati bruker TinySOL via mirdata og lar blant annet dynamikk være en klassifikasjonsvariabel sammen med instrument, pitch og instrumentfamilie.',
        why_it_matters: 'Trinnet avklarer hva modellen faktisk klassifiserer før resultatene tolkes som klangforskning.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: TIMBRE.article, locator: 'Section 4, TinySOL via mirdata; dynamics pp/mf/ff', claim_basis: 'I TinySOL-klassifikasjonen behandles pianissimo, mezzo-forte og fortissimo som separate dynamikkklasser.' },
        { source_id: TIMBRE.object, locator: 'TinySOL v6 metadata; matched flute C4 pp/ff inspection anchors', use_mode: 'external_link_and_metadata_only', claim_basis: 'I TinySOL-klassifikasjonen behandles pianissimo, mezzo-forte og fortissimo som separate dynamikkklasser.' }
      ],
      source_origin: 'external',
      claim_basis: 'I TinySOL-klassifikasjonen behandles pianissimo, mezzo-forte og fortissimo som separate dynamikkklasser.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json'
      ],
      claim_id: TIMBRE.claim
    },
    {
      id: 'quiz_musikk_klang_tekstur_pathway_q2',
      quiz_id: 'musikk_klang_tekstur_pathway_q2',
      categoryId: 'musikk',
      targetId: TIMBRE.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hva rapporterer Gonzalez og Prati om dynamikkklassifikasjon ved 99 prosent signifikansnivå?',
      options: ['Librosa-trekkene er alltid bedre enn FFT-Acoustic', 'FFT-Acoustic-koeffisientene er bedre for dynamikkklassifikasjon enn de sammenlignede Librosa-trekkene', 'Ingen av feature-settene skiller dynamikk'],
      answer: 'FFT-Acoustic-koeffisientene er bedre for dynamikkklassifikasjon enn de sammenlignede Librosa-trekkene',
      answerIndex: 1,
      knowledge: 'Ved 99 prosent signifikansnivå rapporterer studien at FFT-Acoustic-koeffisientene er bedre for klassifikasjon etter dynamikk enn de sammenlignede Librosa-trekkene.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: TIMBRE.emne,
      method_id: TIMBRE.method,
      direct_object_id: TIMBRE.object,
      core_concepts: ['FFT-Acoustic', 'feature-sammenligning', 'dynamikkklassifikasjon'],
      concept_ids: [],
      terms: ['FFT-Acoustic', 'feature-sammenligning', 'dynamikkklassifikasjon'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_klang_tekstur_explain',
      evidence_type: 'computational_measurement',
      knowledge_payload: {
        summary: 'Ved 99 prosent signifikansnivå rapporterer studien at FFT-Acoustic-koeffisientene er bedre for klassifikasjon etter dynamikk enn de sammenlignede Librosa-trekkene.',
        explanation: 'Resultatet gjelder det rapporterte TinySOL-/Random-Forest-oppsettet og er en sammenligning mellom to feature-representasjoner, ikke en generell rangering av alle klangmodeller.',
        why_it_matters: 'Trinnet trener presis lesning av et beregningsresultat med eksplisitt sammenligningsgrunnlag.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: TIMBRE.article, locator: 'Section 4 / Table 1 discussion; 99% significance', claim_basis: 'Ved 99 prosent signifikansnivå rapporterer studien at FFT-Acoustic-koeffisientene er bedre for klassifikasjon etter dynamikk enn de sammenlignede Librosa-trekkene.' }
      ],
      source_origin: 'external',
      claim_basis: 'Ved 99 prosent signifikansnivå rapporterer studien at FFT-Acoustic-koeffisientene er bedre for klassifikasjon etter dynamikk enn de sammenlignede Librosa-trekkene.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json'
      ],
      claim_id: TIMBRE.claim
    },
    {
      id: 'quiz_musikk_klang_tekstur_pathway_q3',
      quiz_id: 'musikk_klang_tekstur_pathway_q3',
      categoryId: 'musikk',
      targetId: TIMBRE.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede er korrekt for TinySOL-resultatet?',
      options: ['To fløytefiler alene replikerer Random-Forest-resultatet', 'Zenodo-lisensen alene dokumenterer klassifikasjonsytelsen', 'Gonzalez og Prati støtter aggregate klassifikasjonsclaimet, TinySOL-dokumentasjonen låser datasettet og de to C4-filene er inspeksjonsankre'],
      answer: 'Gonzalez og Prati støtter aggregate klassifikasjonsclaimet, TinySOL-dokumentasjonen låser datasettet og de to C4-filene er inspeksjonsankre',
      answerIndex: 2,
      knowledge: 'Artikkelen støtter klassifikasjonsresultatet, TinySOL-dokumentasjonen verifiserer datasettidentitet og rights, og C4 pp/ff-filene gjør et matched utsnitt inspeksjonsbart uten å være en replikasjon.',
      difficulty: 3,
      question_type: 'comparison',
      emne_id: TIMBRE.emne,
      method_id: TIMBRE.method,
      direct_object_id: TIMBRE.object,
      core_concepts: ['evidenskjede', 'datasettproveniens', 'replikasjon'],
      concept_ids: [],
      terms: ['evidenskjede', 'datasettproveniens', 'replikasjon'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_klang_tekstur_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Artikkelen støtter klassifikasjonsresultatet, TinySOL-dokumentasjonen verifiserer datasettidentitet og rights, og C4 pp/ff-filene gjør et matched utsnitt inspeksjonsbart uten å være en replikasjon.',
        explanation: 'Aggregate performance kommer fra den publiserte klassifikasjonen. Repositorydokumentasjonen etablerer versjon, format, checksums og lisens, mens de to samplefilene bare gjør underliggende lyddata konkrete og etterprøvbare.',
        why_it_matters: 'Trinnet skiller beregningsresultat, datasettproveniens og direkte forskningsobjekt fra hverandre.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: TIMBRE.article, locator: 'Section 4, Random Forest classification and Table 1 discussion', claim_basis: 'Artikkelen støtter klassifikasjonsresultatet, TinySOL-dokumentasjonen verifiserer datasettidentitet og rights, og C4 pp/ff-filene gjør et matched utsnitt inspeksjonsbart uten å være en replikasjon.' },
        { source_id: TIMBRE.provenance, locator: 'Zenodo v6: Description, Data Files, Conditions of Use, checksums', claim_basis: 'Artikkelen støtter klassifikasjonsresultatet, TinySOL-dokumentasjonen verifiserer datasettidentitet og rights, og C4 pp/ff-filene gjør et matched utsnitt inspeksjonsbart uten å være en replikasjon.' },
        { source_id: TIMBRE.object, locator: 'Fl-ord-C4-pp-N-N.wav and Fl-ord-C4-ff-N-N.wav, 0.000–2.000 s', use_mode: 'external_link_and_metadata_only', claim_basis: 'Artikkelen støtter klassifikasjonsresultatet, TinySOL-dokumentasjonen verifiserer datasettidentitet og rights, og C4 pp/ff-filene gjør et matched utsnitt inspeksjonsbart uten å være en replikasjon.' }
      ],
      source_origin: 'external',
      claim_basis: 'Artikkelen støtter klassifikasjonsresultatet, TinySOL-dokumentasjonen verifiserer datasettidentitet og rights, og C4 pp/ff-filene gjør et matched utsnitt inspeksjonsbart uten å være en replikasjon.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json'
      ],
      claim_id: TIMBRE.claim
    },
    {
      id: 'quiz_musikk_klang_tekstur_pathway_q4',
      quiz_id: 'musikk_klang_tekstur_pathway_q4',
      categoryId: 'musikk',
      targetId: TIMBRE.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn evidensen tillater?',
      options: ['At resultatet er avhengig av TinySOL, feature-definisjoner og klassifikasjonsoppsett', 'At statistisk klassifiserbarhet beviser at pp, mf og ff er universelle naturgitte klangkategorier og at FFT-Acoustic alltid er best', 'At History Go ikke har gjennomført en uavhengig rerun av klassifikatoren'],
      answer: 'At statistisk klassifiserbarhet beviser at pp, mf og ff er universelle naturgitte klangkategorier og at FFT-Acoustic alltid er best',
      answerIndex: 1,
      knowledge: 'TinySOL-resultatet er datasett- og parameteravhengig. Det beviser verken en universell klangtaksonomi eller at FFT-Acoustic er best utenfor det rapporterte oppsettet.',
      difficulty: 4,
      question_type: 'analysis',
      emne_id: TIMBRE.emne,
      method_id: TIMBRE.method,
      direct_object_id: TIMBRE.object,
      core_concepts: ['modellavhengighet', 'datasettavhengighet', 'klangtaksonomi'],
      concept_ids: [],
      terms: ['modellavhengighet', 'datasettavhengighet', 'klangtaksonomi'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_klang_tekstur_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'TinySOL-resultatet er datasett- og parameteravhengig. Det beviser verken en universell klangtaksonomi eller at FFT-Acoustic er best utenfor det rapporterte oppsettet.',
        explanation: 'Klassifikasjonsytelse må leses sammen med datasett, label-definisjoner, features, modell og statistisk test. Canonical computational-measurement-kontrakt forbyr å gjøre modellkategorier til naturgitte sannheter.',
        why_it_matters: 'Trinnet trener korrekt inferensgrense mellom beregningsresultat og musikalsk ontologi.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: TIMBRE.article, locator: 'Sections 2 and 4; Table 1 discussion and conclusions', claim_basis: 'TinySOL-resultatet er datasett- og parameteravhengig. Det beviser verken en universell klangtaksonomi eller at FFT-Acoustic er best utenfor det rapporterte oppsettet.' }
      ],
      source_origin: 'external',
      claim_basis: 'TinySOL-resultatet er datasett- og parameteravhengig. Det beviser verken en universell klangtaksonomi eller at FFT-Acoustic er best utenfor det rapporterte oppsettet.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json'
      ],
      claim_id: TIMBRE.claim
    },
    {
      id: 'quiz_musikk_klang_tekstur_pathway_q5',
      quiz_id: 'musikk_klang_tekstur_pathway_q5',
      categoryId: 'musikk',
      targetId: TIMBRE.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hva er riktig om TinySOL-rettighetene og denne History Go-produksjonen?',
      options: ['TinySOL er CC BY 4.0 og kan gjenbrukes med attribusjon, men denne piloten velger foreløpig bare ekstern lenke og metadata', 'TinySOL er non-commercial og kan derfor aldri brukes kommersielt', 'Beethovens public-domain-status bestemmer TinySOL-lisensen'],
      answer: 'TinySOL er CC BY 4.0 og kan gjenbrukes med attribusjon, men denne piloten velger foreløpig bare ekstern lenke og metadata',
      answerIndex: 0,
      knowledge: 'TinySOL v6 er CC BY 4.0 og er kompatibel med kommersiell gjenbruk ved korrekt attribusjon. History Go velger likevel external-link-and-metadata-only i denne evidensproduksjonen.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: TIMBRE.emne,
      method_id: TIMBRE.method,
      direct_object_id: TIMBRE.object,
      core_concepts: ['CC BY 4.0', 'attribusjon', 'leveransemodus'],
      concept_ids: [],
      terms: ['CC BY 4.0', 'attribusjon', 'leveransemodus'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_klang_tekstur_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'TinySOL v6 er CC BY 4.0 og er kompatibel med kommersiell gjenbruk ved korrekt attribusjon. History Go velger likevel external-link-and-metadata-only i denne evidensproduksjonen.',
        explanation: 'Lisensens tillatelser og prosjektets aktuelle leveransevalg er to forskjellige ting. Evidence v1 holder lydobjektet eksternt selv om en senere audio-delivery kan vurdere innbygging med korrekt attribusjon.',
        why_it_matters: 'Trinnet trener eksplisitt skille mellom rettighetsstatus og produktets konservative bruksvalg.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: TIMBRE.provenance, locator: 'TinySOL v6 Zenodo: Conditions of Use; CC BY 4.0', claim_basis: 'TinySOL v6 er CC BY 4.0 og er kompatibel med kommersiell gjenbruk ved korrekt attribusjon. History Go velger likevel external-link-and-metadata-only i denne evidensproduksjonen.' },
        { source_id: TIMBRE.object, locator: 'TinySOL v6 DOI 10.5281/zenodo.3685367; pilot use_mode external_link_and_metadata_only', use_mode: 'external_link_and_metadata_only', claim_basis: 'TinySOL v6 er CC BY 4.0 og er kompatibel med kommersiell gjenbruk ved korrekt attribusjon. History Go velger likevel external-link-and-metadata-only i denne evidensproduksjonen.' }
      ],
      source_origin: 'external',
      claim_basis: 'TinySOL v6 er CC BY 4.0 og er kompatibel med kommersiell gjenbruk ved korrekt attribusjon. History Go velger likevel external-link-and-metadata-only i denne evidensproduksjonen.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/klang_tekstur_instrumentasjon.json'
      ]
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== TIMBRE.emne);
pkg.sets.push(timbreSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Klang/tekstur/instrumentasjon-pathway skrevet som sett 5.');
  } else {
    console.error('Klang-pathway er utdatert. Kjør node tools/build-musikk-timbre-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Klang-pathway sett 5 OK.');
}
