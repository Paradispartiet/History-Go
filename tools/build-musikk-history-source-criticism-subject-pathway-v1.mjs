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
  emne: 'em_musikk_vit_kildekritikk_musikkhistorie',
  target: 'subject_musikk_kildekritikk_musikkhistorie',
  domain: 'historisk_musikkvitenskap_historiografi',
  claim: 'claim_musikk_history_grieg_2151f_provenance_derivative_chain',
  object: 'obj_grieg_bridal_procession_2151f_chasing_web_derivative',
  mattes: 'prod_src_mattes_grieg_historical_recordings_2020',
  marston: 'prod_src_marston_grieg_legendary_piano_52054_2',
  chasing: 'prod_src_chasing_butterfly_grieg_1903_restoration_2010',
  method: 'arkiv_diskografisk_metode',
  objectUrl: 'https://www.chasingthebutterfly.no/?page_id=207',
  evidenceFile: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/kildekritikk_musikkhistorie.json'
});

const newSources = [
  {
    id: HISTORY.mattes,
    type: 'peer_reviewed_article_production_extension',
    title: 'What Else Can Grieg’s Historical Recordings Tell Us? Performance Practice as Musical Poetry',
    publisher_or_author: 'Arnulf Christian Mattes',
    date_or_version: 'Studia Musicologica Norvegica 46(1), 25–40 (2020); DOI 10.18261/issn.1504-2960-2020-01-04',
    url: 'https://www.idunn.no/doi/10.18261/issn.1504-2960-2020-01-04',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: HISTORY.marston,
    type: 'discographic_restoration_documentation_production_extension',
    title: 'Legendary Piano Recordings: The Complete Grieg, Saint-Saëns, Pugno, and Diémer',
    publisher_or_author: 'Ward Marston / Marston Records',
    date_or_version: 'Marston Records 52054-2 (2008), catalog and restoration documentation',
    url: 'https://www.marstonrecords.com/products/legendary-piano',
    status: 'reviewed_label_documentation'
  },
  {
    id: HISTORY.chasing,
    type: 'research_project_documentation_production_extension',
    title: 'The Grieg 1903 Recordings / Ambiguity and Multi-layeredness',
    publisher_or_author: 'Sigurd Slåttebrekk og Tony Harrison',
    date_or_version: 'Chasing the Butterfly project documentation and web audio, ©2010',
    url: 'https://www.chasingthebutterfly.no/?page_id=2',
    status: 'reviewed_project_fulltext'
  },
  {
    id: HISTORY.object,
    type: 'direct_research_object_audio',
    title: 'Grieg, Norwegian Bridal Procession Op. 19 No. 2 — 1903 matrix 2151F identity with Chasing the Butterfly web-access derivative',
    publisher_or_author: 'Edvard Grieg / Chasing the Butterfly',
    date_or_version: 'G&T Paris 2 May 1903, matrix 2151F, catalog 35517; later web derivative Brudefølget1.mp3; exact source-copy-to-web-file chain not documented',
    url: HISTORY.objectUrl,
    status: 'direct_object_verified',
    object_type: 'lydopptak',
    use_mode: 'external_link_and_metadata_only',
    license: 'Chasing the Butterfly website/audio reuse license not granted; site states ©2010 Sigurd Slåttebrekk and Tony Harrison',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

const appendUnique = (values, value) => [...list(values).filter((item) => clean(item) !== value), value];
pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_7x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: appendUnique(pkg.production_context?.released_evidence_files, HISTORY.evidenceFile),
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: appendUnique(pkg.production_context?.question_ready_claim_ids, HISTORY.claim),
  direct_object_ids: appendUnique(pkg.production_context?.direct_object_ids, HISTORY.object),
  released_emne_ids: appendUnique(pkg.production_context?.released_emne_ids, HISTORY.emne),
  blocked_canonical_topic_count: 41,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  HISTORY.evidenceFile
];
const sourceRef = (sourceId, locator, claimBasis) => ({ source_id: sourceId, locator, claim_basis: claimBasis });
const objectRef = (locator, claimBasis) => ({
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
      id: 'quiz_musikk_kildekritikk_pathway_q1',
      quiz_id: 'musikk_kildekritikk_pathway_q1',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilken identitet er kildekritisk kontrollert for Griegs Brudefølget drar forbi?',
      options: [
        'En udokumentert privat innspilling fra Kristiania i 1904',
        'G&T, Paris 2. mai 1903, matrix 2151F og katalog 35517',
        'En Marston-studioinnspilling fra 2008 med ny pianist'
      ],
      answer: 'G&T, Paris 2. mai 1903, matrix 2151F og katalog 35517',
      answerIndex: 1,
      knowledge: 'Mattes og Marston gjør det mulig å kontrollere den historiske opptakssiden som Gramophone and Typewriter Limited, Paris 2. mai 1903, matrix 2151F og katalog 35517.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['proveniens', 'matrixnummer', 'diskografisk identitet'],
      concept_ids: [],
      terms: ['proveniens', 'matrixnummer', 'diskografisk identitet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_observe',
      evidence_type: 'historical_identity_observation',
      knowledge_payload: {
        summary: 'Den historiske siden kan identifiseres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.',
        explanation: 'Marston dokumenterer dato, matrix og katalognummer for akkurat Bridal Procession-siden, mens Mattes forklarer hvorfor matrixnummer er et sentralt identitetsledd når mastere og senere kopier må skilles fra hverandre.',
        why_it_matters: 'Kildekritikk begynner med å vite hvilket historisk objekt man faktisk har spor etter før senere lydversjoner tolkes.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(HISTORY.marston, 'Marston 52054-2 :: CD 1 track 4 :: Paris 2 May 1903 :: matrix 2151F :: catalog 35517 :: 3:00', 'Den historiske siden kan identifiseres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.'),
        sourceRef(HISTORY.mattes, 'Mattes 2020 :: section I after Table 1 :: provenance and matrix identity', 'Den historiske siden kan identifiseres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.')
      ],
      source_origin: 'external',
      claim_basis: 'Den historiske siden kan identifiseres som G&T Paris 2. mai 1903, matrix 2151F og katalog 35517.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_pathway_q2',
      quiz_id: 'musikk_kildekritikk_pathway_q2',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor er matrix 2151F viktig, men ikke nok til å rekonstruere den umedierte lyden fra 1903?',
      options: [
        'Fordi matrixnummer bare viser hvilken komponist som eide pianoet',
        'Fordi matrixnummer automatisk dokumenterer nøyaktig original pitch og frekvensrespons',
        'Fordi matrixnummer sporer opptakssidens identitet, mens opptaksteknikk, medium, avspilling og senere transfer fortsatt medierer lyden'
      ],
      answer: 'Fordi matrixnummer sporer opptakssidens identitet, mens opptaksteknikk, medium, avspilling og senere transfer fortsatt medierer lyden',
      answerIndex: 2,
      knowledge: 'Matrixnummeret binder kopier til den historiske opptakssidens identitet, men dokumenterer ikke alene hvordan den akustiske studiohendelsen lød før opptaksapparat, medium og senere avspillings- og transferledd påvirket signalet.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['kildeidentitet', 'mediering', 'lydproveniens'],
      concept_ids: [],
      terms: ['kildeidentitet', 'mediering', 'lydproveniens'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_explain',
      evidence_type: 'source_criticism_explanation',
      knowledge_payload: {
        summary: 'Matrix 2151F kontrollerer opptakssidens identitet, men ikke en umediert rekonstruksjon av den akustiske lyden i Paris-studioet.',
        explanation: 'Mattes bruker matrixnummer som proveniensspor, mens Chasing the Butterfly dokumenterer begrensninger ved akustisk opptak, skjærehastighet, frekvensfangst og senere restaurering. Identitet og lydfidelitet er derfor to ulike spørsmål.',
        why_it_matters: 'Trinnet hindrer at sikker identifikasjon av en historisk kilde blir forvekslet med sikkerhet om alt kilden representerer.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(HISTORY.mattes, 'Mattes 2020 :: section I :: matrix identity and source-provenance limitations', 'Matrix 2151F kontrollerer opptakssidens identitet, men ikke en umediert rekonstruksjon av den akustiske lyden i Paris-studioet.'),
        sourceRef(HISTORY.chasing, 'The Grieg 1903 Recordings :: cutting-lathe instability, horn/frequency limits and restoration discussion', 'Matrix 2151F kontrollerer opptakssidens identitet, men ikke en umediert rekonstruksjon av den akustiske lyden i Paris-studioet.')
      ],
      source_origin: 'external',
      claim_basis: 'Matrix 2151F kontrollerer opptakssidens identitet, men ikke en umediert rekonstruksjon av den akustiske lyden i Paris-studioet.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_pathway_q3',
      quiz_id: 'musikk_kildekritikk_pathway_q3',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hvilken evidenskjede beskriver best den frigitte Grieg-kilden?',
      options: [
        '1903-opptakshendelse og matrixidentitet → overlevende kopier → senere transfer/restaureringer → Chasing-webderivat med ufullstendig kildekopi-til-fil-kjede',
        'Chasing-webfilen er den originale 1903-masteren og gjør alle mellomledd irrelevante',
        'Marston-katalogen alene beviser både Griegs intensjon og den eksakte studiolyden'
      ],
      answer: '1903-opptakshendelse og matrixidentitet → overlevende kopier → senere transfer/restaureringer → Chasing-webderivat med ufullstendig kildekopi-til-fil-kjede',
      answerIndex: 0,
      knowledge: 'Den frigitte kilden må leses som en kjede av historisk opptaksidentitet, overlevende kopier, senere transfer- og restaureringsvalg og til slutt et webderivat der den eksakte fysiske kildekopien og komplette filkjeden ikke er dokumentert.',
      difficulty: 4,
      question_type: 'comparison',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['evidenskjede', 'restaureringslag', 'versjonskontroll'],
      concept_ids: [],
      terms: ['evidenskjede', 'restaureringslag', 'versjonskontroll'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_evaluate_evidence',
      evidence_type: 'source_trace_plus_direct_object',
      knowledge_payload: {
        summary: 'Den kontrollerte kjeden går fra 1903-identitet via overlevende kopier og senere restaureringslag til et webderivat med ufullstendig kildekopi-til-fil-proveniens.',
        explanation: 'Mattes og Marston kontrollerer den historiske siden og dokumenterer senere utgivelseslag, mens Chasing the Butterfly gjør et Bridal Procession-eksempel direkte inspeksjonsbart og samtidig beskriver restaureringsvalg. Den siste webfilens eksakte fysiske kildekopi er ikke dokumentert.',
        why_it_matters: 'Trinnet trener chain-of-custody-tenkning: hvert representasjonsledd må identifiseres før egenskaper i en senere versjon brukes historisk.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(HISTORY.mattes, 'Mattes 2020 :: sections I–III :: provenance, reissue and transmission discussion', 'Den kontrollerte kjeden går fra 1903-identitet via overlevende kopier og senere restaureringslag til et webderivat med ufullstendig kildekopi-til-fil-proveniens.'),
        sourceRef(HISTORY.marston, 'Marston 52054-2 :: track identity plus audio-conservation and pitch-stabilization credits', 'Den kontrollerte kjeden går fra 1903-identitet via overlevende kopier og senere restaureringslag til et webderivat med ufullstendig kildekopi-til-fil-proveniens.'),
        sourceRef(HISTORY.chasing, 'Chasing the Butterfly :: The Grieg 1903 Recordings and Ambiguity and Multi-layeredness', 'Den kontrollerte kjeden går fra 1903-identitet via overlevende kopier og senere restaureringslag til et webderivat med ufullstendig kildekopi-til-fil-proveniens.'),
        objectRef('Ambiguity and Multi-layeredness :: embedded file label Brudefølget1.mp3', 'Den kontrollerte kjeden går fra 1903-identitet via overlevende kopier og senere restaureringslag til et webderivat med ufullstendig kildekopi-til-fil-proveniens.')
      ],
      source_origin: 'external',
      claim_basis: 'Den kontrollerte kjeden går fra 1903-identitet via overlevende kopier og senere restaureringslag til et webderivat med ufullstendig kildekopi-til-fil-proveniens.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_pathway_q4',
      quiz_id: 'musikk_kildekritikk_pathway_q4',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn den frigitte kildekritiske evidensen tillater?',
      options: [
        'At 2151F/35517 identifiserer den historiske opptakssiden',
        'At Brudefølget1.mp3 kan behandles som en nøytral, umediert digital kopi av studiolyden i 1903 og brukes til å fastslå eksakt original pitch',
        'At senere restaureringer må skilles fra den historiske opptakshendelsen'
      ],
      answer: 'At Brudefølget1.mp3 kan behandles som en nøytral, umediert digital kopi av studiolyden i 1903 og brukes til å fastslå eksakt original pitch',
      answerIndex: 1,
      knowledge: 'Den manglende fysiske kildekopi- og transferkjeden bak webutdraget, sammen med dokumenterte restaureringsvalg og akustisk opptaksteknikk, blokkerer påstanden om at webfilen er en nøytral kopi av umediert 1903-lyd eller kan fastslå eksakt original pitch.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['slutningsgrense', 'representasjon', 'original lydhendelse'],
      concept_ids: [],
      terms: ['slutningsgrense', 'representasjon', 'original lydhendelse'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_diagnose_failure',
      evidence_type: 'scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Webderivatet kan ikke uten dokumentert transferkjede behandles som en nøytral kopi av umediert 1903-lyd eller brukes alene til å fastslå eksakt original pitch.',
        explanation: 'Evidensfila gjør den manglende source-copy-to-web-file-kjeden til en eksplisitt grense. I tillegg dokumenterer kildene pitchstabilisering, equalization, noise treatment og tekniske begrensninger i den akustiske opptaksprosessen.',
        why_it_matters: 'Trinnet viser hvorfor historisk kildekritikk må skille mellom objektidentitet, representasjon og de egenskapene en senere digital versjon faktisk kan bære.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(HISTORY.mattes, 'Mattes 2020 :: sections I–III :: reissue/transmission limitations', 'Webderivatet kan ikke uten dokumentert transferkjede behandles som en nøytral kopi av umediert 1903-lyd eller brukes alene til å fastslå eksakt original pitch.'),
        sourceRef(HISTORY.chasing, 'Chasing the Butterfly :: pitch stabilization, equalization, noise treatment and Bridal Procession web example', 'Webderivatet kan ikke uten dokumentert transferkjede behandles som en nøytral kopi av umediert 1903-lyd eller brukes alene til å fastslå eksakt original pitch.'),
        objectRef('Brudefølget1.mp3 :: exact physical source copy/checksum/complete transfer lineage not documented', 'Webderivatet kan ikke uten dokumentert transferkjede behandles som en nøytral kopi av umediert 1903-lyd eller brukes alene til å fastslå eksakt original pitch.')
      ],
      source_origin: 'external',
      claim_basis: 'Webderivatet kan ikke uten dokumentert transferkjede behandles som en nøytral kopi av umediert 1903-lyd eller brukes alene til å fastslå eksakt original pitch.',
      guidance_basis: guidance,
      claim_id: HISTORY.claim
    },
    {
      id: 'quiz_musikk_kildekritikk_pathway_q5',
      quiz_id: 'musikk_kildekritikk_pathway_q5',
      categoryId: 'musikk',
      targetId: HISTORY.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go bruke Chasing the Butterfly-lyden når nettstedet oppgir ©2010 og ingen gjenbrukslisens er identifisert?',
      options: [
        'Kopiere og rehoste webfilen fordi selve Grieg-opptaket er historisk',
        'Embedde lydfilen og anta at historisk alder opphever rettigheter til restaureringen og webderivatet',
        'Vise ekstern prosjektlenke og proveniensmetadata uten å kopiere, ekstrahere, rehoste, modifisere eller embedde lydderivatet'
      ],
      answer: 'Vise ekstern prosjektlenke og proveniensmetadata uten å kopiere, ekstrahere, rehoste, modifisere eller embedde lydderivatet',
      answerIndex: 2,
      knowledge: 'Chasing the Butterfly oppgir ©2010 for nettstedets innhold, og evidenslaget identifiserer ingen gjenbrukslisens for Bridal Procession-utdraget. History Go må derfor behandle lydobjektet som external-link-and-metadata-only.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: HISTORY.emne,
      method_id: HISTORY.method,
      direct_object_id: HISTORY.object,
      core_concepts: ['rettigheter', 'ekstern lenke', 'gjenbruk'],
      concept_ids: [],
      terms: ['rettigheter', 'ekstern lenke', 'gjenbruk'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_kildekritikk_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Chasing-lyden må forbli external-link-and-metadata-only fordi nettstedet oppgir ©2010 og ingen gjenbrukslisens for webderivatet er identifisert.',
        explanation: 'Den historiske opptakshendelsens alder avgjør ikke automatisk rettighetene til en senere transfer, restaurering eller webpublisering. Evidensporten tillater derfor bare ekstern lenke, identitets- og proveniensmetadata og kildekritiske grenser.',
        why_it_matters: 'Trinnet gjør rettighetsstatus til en dokumentert del av kildeproveniensen i stedet for å anta fri bruk ut fra opptakets alder.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(HISTORY.chasing, 'Chasing the Butterfly site footer and Ambiguity and Multi-layeredness Bridal Procession example', 'Chasing-lyden må forbli external-link-and-metadata-only fordi nettstedet oppgir ©2010 og ingen gjenbrukslisens for webderivatet er identifisert.'),
        objectRef('Direct-object rights :: external_link_and_metadata_only; redistribution/modification/embedding false', 'Chasing-lyden må forbli external-link-and-metadata-only fordi nettstedet oppgir ©2010 og ingen gjenbrukslisens for webderivatet er identifisert.')
      ],
      source_origin: 'external',
      claim_basis: 'Chasing-lyden må forbli external-link-and-metadata-only fordi nettstedet oppgir ©2010 og ingen gjenbrukslisens for webderivatet er identifisert.',
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
    console.log('Kildekritikk i musikkhistorien-pathway skrevet som sett 7.');
  } else {
    console.error('Kildekritikk-pathway er utdatert. Kjør node tools/build-musikk-history-source-criticism-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Kildekritikk i musikkhistorien sett 7 OK.');
}
