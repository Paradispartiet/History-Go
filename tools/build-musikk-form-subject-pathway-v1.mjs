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

const FORM = Object.freeze({
  emne: 'em_musikk_vit_form_prosess_improvisasjon',
  target: 'subject_musikk_form_prosess_improvisasjon',
  claim: 'claim_musikk_form_huguet_op10_3_a4_close_84_106',
  object: 'obj_beethoven_op10_3_dcml_v2_5_07_4',
  huguet: 'prod_src_huguet_post_recapitulatory_beethoven_2024',
  provenance: 'prod_src_hentschel_annotated_piano_corpus_2024',
  method: 'notasjons_kildeanalyse'
});

const newSources = [
  {
    id: FORM.huguet,
    type: 'peer_reviewed_article_production_extension',
    title: 'Post-Recapitulatory Organization in Beethoven’s Early Sonata-Rondo Finales',
    publisher_or_author: 'Joan Huguet',
    date_or_version: 'Music Theory Online 30(3), 2024; DOI 10.30535/mto.30.3.2',
    url: 'https://mtosmt.org/issues/mto.24.30.3/mto.24.30.3.huguet.html',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: FORM.provenance,
    type: 'peer_reviewed_data_report_production_extension',
    title: 'An Annotated Corpus of Tonal Piano Music from the Long 19th Century',
    publisher_or_author: 'Johannes Hentschel, Yannis Rammos, Fabian C. Moss, Markus Neuwirth og Martin Rohrmeier',
    date_or_version: 'Empirical Musicology Review 18(1), 84–95 (2024), DOI 10.18061/emr.v18i1.8903',
    url: 'https://phaidra.bruckneruni.at/o:3910',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: FORM.object,
    type: 'direct_research_object_score',
    title: 'Beethoven, Piano Sonata No. 7 in D major, Op. 10 No. 3, movement 4 (Rondo) — DCML v2.5 score 07-4',
    publisher_or_author: 'DCMLab',
    date_or_version: 'v2.5; MS3/07-4.mscx; Zenodo DOI 10.5281/zenodo.15292707',
    url: 'https://github.com/DCMLab/beethoven_piano_sonatas/blob/v2.5/MS3/07-4.mscx',
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
  profile: 'subject_pathway_pilot_4x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: [
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/rytme_meter_groove_timing.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/melodi_motiv_frasering.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/harmoni_tonalitet_modalitet.json',
    'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json'
  ],
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: [
    'claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure',
    'claim_musikk_melody_boss_alpha_salience_development',
    'claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63',
    FORM.claim
  ],
  direct_object_ids: [
    'obj_sioros_2014_zenodo_1221315',
    'obj_beethoven_op10_1_dcml_v2_5_05_1',
    'obj_beethoven_tempest_op31_2_dcml_v2_5_17_1',
    FORM.object
  ],
  released_emne_ids: [
    'em_musikk_vit_rytme_meter_groove_timing',
    'em_musikk_vit_melodi_motiv_frasering',
    'em_musikk_vit_harmoni_tonalitet_modalitet',
    FORM.emne
  ],
  blocked_canonical_topic_count: 44,
  rights_mode: 'external_link_and_metadata_only'
};

const formSet = {
  set_id: 'pathway_musikk_form_prosess_improvisasjon',
  title: 'Form, prosess og improvisasjon',
  level: 5,
  order: 4,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: FORM.target,
  area_id: 'musikalsk_analyse_lyd_struktur',
  emne_id: FORM.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [FORM.object],
  question_ready_claim_ids: [FORM.claim],
  questions: [
    {
      id: 'quiz_musikk_form_prosess_pathway_q1',
      quiz_id: 'musikk_form_prosess_pathway_q1',
      categoryId: 'musikk',
      targetId: FORM.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvor lokaliserer Huguet det komplette A4-refrengeret i finalen til Beethovens op. 10 nr. 3?',
      options: ['Takt 84–92', 'Takt 58–64', 'Takt 93–113'],
      answer: 'Takt 84–92',
      answerIndex: 0,
      knowledge: 'Huguet lokaliserer et komplett A4-refreng i takt 84–92, avsluttet med en tonika-PAC.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: FORM.emne,
      method_id: FORM.method,
      direct_object_id: FORM.object,
      core_concepts: ['A4-refreng', 'formledd', 'taktlokator'],
      concept_ids: [],
      terms: ['A4-refreng', 'formledd', 'taktlokator'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_form_prosess_observe',
      evidence_type: 'score_or_representation_claim',
      knowledge_payload: {
        summary: 'Huguet lokaliserer et komplett A4-refreng i takt 84–92, avsluttet med en tonika-PAC.',
        explanation: 'Huguets immediate-A4-prototype bruker den komplette og tonalt lukkede refrengenheten som formalt anker før den påfølgende codaen.',
        why_it_matters: 'Trinnet trener presis formsegmentering før større tolkninger av post-rekapitulatorisk funksjon.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: FORM.huguet, locator: 'Example 5 / para. [21], mm. 84–92', claim_basis: 'Huguet lokaliserer et komplett A4-refreng i takt 84–92, avsluttet med en tonika-PAC.' },
        { source_id: FORM.object, locator: 'MS3/07-4.mscx, mm. 84–92', use_mode: 'external_link_and_metadata_only', claim_basis: 'Huguet lokaliserer et komplett A4-refreng i takt 84–92, avsluttet med en tonika-PAC.' }
      ],
      source_origin: 'external',
      claim_basis: 'Huguet lokaliserer et komplett A4-refreng i takt 84–92, avsluttet med en tonika-PAC.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json'
      ],
      claim_id: FORM.claim
    },
    {
      id: 'quiz_musikk_form_prosess_pathway_q2',
      quiz_id: 'musikk_form_prosess_pathway_q2',
      categoryId: 'musikk',
      targetId: FORM.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hva følger etter den tonalt lukkede A4-refrengen ved takt 92 i Huguets analyse?',
      options: ['En ny B-episode som åpner rondoen igjen', 'En A-basert coda som utvikler refrengmaterialet og når en ny I:PAC ved takt 106', 'En komplett reprise av hele eksposisjonen'],
      answer: 'En A-basert coda som utvikler refrengmaterialet og når en ny I:PAC ved takt 106',
      answerIndex: 1,
      knowledge: 'Etter lukningen ved takt 92 beskriver Huguet en A-basert coda som videreutvikler refrengmaterialet og når en ny I:PAC ved takt 106.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: FORM.emne,
      method_id: FORM.method,
      direct_object_id: FORM.object,
      core_concepts: ['coda', 'formprosess', 'kadens'],
      concept_ids: [],
      terms: ['coda', 'formprosess', 'kadens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_form_prosess_explain',
      evidence_type: 'score_or_representation_claim',
      knowledge_payload: {
        summary: 'Etter lukningen ved takt 92 beskriver Huguet en A-basert coda som videreutvikler refrengmaterialet og når en ny I:PAC ved takt 106.',
        explanation: 'Poenget i Huguets prototype er at A-materialets tilbakekomst etter en allerede komplett A4 ikke nødvendigvis åpner formen på nytt; materialet kan ha en post-lukningsfunksjon i codaen.',
        why_it_matters: 'Trinnet viser hvordan repetert materiale må tolkes i forhold til tonal lukning og formfunksjon, ikke bare gjenkjennes tematisk.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: FORM.huguet, locator: 'para. [21], mm. 93–113; I:PAC m. 106', claim_basis: 'Etter lukningen ved takt 92 beskriver Huguet en A-basert coda som videreutvikler refrengmaterialet og når en ny I:PAC ved takt 106.' },
        { source_id: FORM.object, locator: 'MS3/07-4.mscx, mm. 93–113', use_mode: 'external_link_and_metadata_only', claim_basis: 'Etter lukningen ved takt 92 beskriver Huguet en A-basert coda som videreutvikler refrengmaterialet og når en ny I:PAC ved takt 106.' }
      ],
      source_origin: 'external',
      claim_basis: 'Etter lukningen ved takt 92 beskriver Huguet en A-basert coda som videreutvikler refrengmaterialet og når en ny I:PAC ved takt 106.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json'
      ],
      claim_id: FORM.claim
    },
    {
      id: 'quiz_musikk_form_prosess_pathway_q3',
      quiz_id: 'musikk_form_prosess_pathway_q3',
      categoryId: 'musikk',
      targetId: FORM.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede holder analyse, objekt og proveniens riktig atskilt?',
      options: ['DCML-annotasjonene alene, fordi de automatisk fastsetter Huguets formfunksjoner', 'Huguets artikkel for formclaimet, DCML 07-4 som versjonert partitur og Hentschel mfl. for korpusproveniens', 'Bare en generell definisjon av sonata-rondo uten verk- eller taktlokatorer'],
      answer: 'Huguets artikkel for formclaimet, DCML 07-4 som versjonert partitur og Hentschel mfl. for korpusproveniens',
      answerIndex: 1,
      knowledge: 'Huguet støtter formanalysen, DCML 07-4 gir et versjonert notert objekt, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.',
      difficulty: 3,
      question_type: 'comparison',
      emne_id: FORM.emne,
      method_id: FORM.method,
      direct_object_id: FORM.object,
      core_concepts: ['evidenskjede', 'formmodell', 'proveniens'],
      concept_ids: [],
      terms: ['evidenskjede', 'formmodell', 'proveniens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_form_prosess_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Huguet støtter formanalysen, DCML 07-4 gir et versjonert notert objekt, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.',
        explanation: 'De tre kildene har ulike roller. Det er Huguets argument som begrunner formfunksjonen; DCML gjør det konkrete partituret inspeksjonsbart; Hentschel mfl. dokumenterer hvordan korpuset er produsert og revidert.',
        why_it_matters: 'Trinnet hindrer at en digital representasjon eller provenance-kilde feilaktig løftes til analytisk bevis.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: FORM.huguet, locator: 'paras. [20]–[21], Example 5', claim_basis: 'Huguet støtter formanalysen, DCML 07-4 gir et versjonert notert objekt, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.' },
        { source_id: FORM.provenance, locator: 'pp. 84–87, Scores / Annotations / Dataset / Formats and features', claim_basis: 'Huguet støtter formanalysen, DCML 07-4 gir et versjonert notert objekt, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.' },
        { source_id: FORM.object, locator: 'DCML v2.5, MS3/07-4.mscx, mm. 84–113', use_mode: 'external_link_and_metadata_only', claim_basis: 'Huguet støtter formanalysen, DCML 07-4 gir et versjonert notert objekt, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.' }
      ],
      source_origin: 'external',
      claim_basis: 'Huguet støtter formanalysen, DCML 07-4 gir et versjonert notert objekt, og Hentschel mfl. dokumenterer korpusets proveniens og reviewprosess.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json'
      ],
      claim_id: FORM.claim
    },
    {
      id: 'quiz_musikk_form_prosess_pathway_q4',
      quiz_id: 'musikk_form_prosess_pathway_q4',
      categoryId: 'musikk',
      targetId: FORM.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn evidensen tillater?',
      options: ['At Huguets A4- og codaetiketter er del av en eksplisitt formmodell', 'At taktene 84–113 kan lokaliseres i et versjonert partitur', 'At tilbakevendende A-materiale etter takt 92 i seg selv beviser en ny refreng og gjør Huguets alternative funksjonslesning feil'],
      answer: 'At tilbakevendende A-materiale etter takt 92 i seg selv beviser en ny refreng og gjør Huguets alternative funksjonslesning feil',
      answerIndex: 2,
      knowledge: 'Tematisk tilbakekomst alene fastsetter ikke formfunksjon. Huguets analyse bruker tonal lukning og funksjonskriterier for å skille komplett A4 fra den etterfølgende codaen.',
      difficulty: 4,
      question_type: 'analysis',
      emne_id: FORM.emne,
      method_id: FORM.method,
      direct_object_id: FORM.object,
      core_concepts: ['modellavhengighet', 'formfunksjon', 'tematisk tilbakekomst'],
      concept_ids: [],
      terms: ['modellavhengighet', 'formfunksjon', 'tematisk tilbakekomst'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_form_prosess_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Tematisk tilbakekomst alene fastsetter ikke formfunksjon. Huguets analyse bruker tonal lukning og funksjonskriterier for å skille komplett A4 fra den etterfølgende codaen.',
        explanation: 'Et formledd identifiseres ikke bare ved motivlikhet. Huguets poeng er nettopp at en A-basert enhet kan ha after-the-end-funksjon når sonata-rondoformen allerede er tonalt og formalt lukket.',
        why_it_matters: 'Trinnet trener skillet mellom observerbart materiale og modellbasert formfunksjon.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: FORM.huguet, locator: 'para. [21], closure m. 92 and A-based coda thereafter', claim_basis: 'Tematisk tilbakekomst alene fastsetter ikke formfunksjon. Huguets analyse bruker tonal lukning og funksjonskriterier for å skille komplett A4 fra den etterfølgende codaen.' },
        { source_id: FORM.object, locator: 'MS3/07-4.mscx, mm. 84–113', use_mode: 'external_link_and_metadata_only', claim_basis: 'Tematisk tilbakekomst alene fastsetter ikke formfunksjon. Huguets analyse bruker tonal lukning og funksjonskriterier for å skille komplett A4 fra den etterfølgende codaen.' }
      ],
      source_origin: 'external',
      claim_basis: 'Tematisk tilbakekomst alene fastsetter ikke formfunksjon. Huguets analyse bruker tonal lukning og funksjonskriterier for å skille komplett A4 fra den etterfølgende codaen.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json'
      ],
      claim_id: FORM.claim
    },
    {
      id: 'quiz_musikk_form_prosess_pathway_q5',
      quiz_id: 'musikk_form_prosess_pathway_q5',
      categoryId: 'musikk',
      targetId: FORM.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke DCML 07-4 når kommersiell lisenskompatibilitet ikke er avklart?',
      options: ['Lagre identitet, versjon, taktlokatorer og ekstern lenke uten å kopiere, rendre eller modifisere scorefilen', 'Kopiere hele scorefilen fordi Beethoven er public domain', 'Redistribuere en endret score uten ny rettighetsvurdering'],
      answer: 'Lagre identitet, versjon, taktlokatorer og ekstern lenke uten å kopiere, rendre eller modifisere scorefilen',
      answerIndex: 0,
      knowledge: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Objektet brukes derfor bare som ekstern lenke og metadata med taktlokatorer.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: FORM.emne,
      method_id: FORM.method,
      direct_object_id: FORM.object,
      core_concepts: ['notekilde', 'lisenskompatibilitet', 'gjenbruk'],
      concept_ids: [],
      terms: ['notekilde', 'lisenskompatibilitet', 'gjenbruk'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_form_prosess_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Objektet brukes derfor bare som ekstern lenke og metadata med taktlokatorer.',
        explanation: 'Verkets public-domain-status og den digitale forskningsressursens lisens er forskjellige rettighetslag. History Go må derfor holde DCML-objektet eksternt inntil kommersiell kompatibilitet er særskilt løst.',
        why_it_matters: 'Trinnet gjør rights/reuse til en eksplisitt del av forskningsobjektets publiseringskjede.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        { source_id: FORM.object, locator: 'DCML Beethoven v2.5 README license; MS3/07-4.mscx; Zenodo DOI 10.5281/zenodo.15292707', use_mode: 'external_link_and_metadata_only', claim_basis: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Objektet brukes derfor bare som ekstern lenke og metadata med taktlokatorer.' }
      ],
      source_origin: 'external',
      claim_basis: 'DCML v2.5 er CC BY-NC-SA 4.0, og kommersiell kompatibilitet med History Go er ikke avklart. Objektet brukes derfor bare som ekstern lenke og metadata med taktlokatorer.',
      guidance_basis: [
        'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/musikalsk_analyse_lyd_struktur.json',
        'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/form_prosess_improvisasjon.json'
      ]
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== FORM.emne);
pkg.sets.push(formSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Form/prosess/improvisasjon-pathway skrevet som sett 4.');
  } else {
    console.error('Form-pathway er utdatert. Kjør node tools/build-musikk-form-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Form-pathway sett 4 OK.');
}
