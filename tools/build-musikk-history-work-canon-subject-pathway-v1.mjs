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

const WORK_CANON = Object.freeze({
  emne: 'em_musikk_vit_verkbegrep_forfatterskap_kanon',
  target: 'subject_musikk_verkbegrep_forfatterskap_kanon',
  domain: 'historisk_musikkvitenskap_historiografi',
  claim: 'claim_musikk_history_work_canon_oxford_degree_exercise_institutional_status',
  object: 'obj_crotch_o_sing_bmus_exercise_1794',
  golding: 'prod_src_golding_oxford_degree_exercises_2025',
  method: 'historiografisk_analyse',
  objectUrl: 'https://archives.bodleian.ox.ac.uk/repositories/2/resources/8207',
  evidenceFile: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/verkbegrep_forfatterskap_kanon.json'
});

const newSources = [
  {
    id: WORK_CANON.golding,
    type: 'peer_reviewed_article_production_extension',
    title: 'Musical Samplers in the Museum of Musical Works: The Nature, Status, and Value of Nineteenth-Century Oxford Degree Exercises',
    publisher_or_author: 'Rosemary Golding / Journal of the Royal Musical Association',
    date_or_version: '2025; 150(1), 187–222; DOI 10.1017/rma.2024.46',
    url: 'https://www.cambridge.org/core/journals/journal-of-the-royal-musical-association/article/musical-samplers-in-the-museum-of-musical-works-the-nature-status-and-value-of-nineteenthcentury-oxford-degree-exercises/C7E70A102542F08880122D060CE00453',
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: WORK_CANON.object,
    type: 'direct_research_object_manuscript_or_print',
    title: 'William Crotch: O Sing unto the Lord (BMus exercise, 1794)',
    publisher_or_author: 'William Crotch / Bodleian Libraries, University of Oxford',
    date_or_version: '1794; MS. Mus. Sch. Ex. d. 37',
    url: WORK_CANON.objectUrl,
    status: 'direct_object_verified',
    object_type: 'manuskript_eller_trykk',
    use_mode: 'external_link_and_metadata_only',
    license: 'No manuscript-image or score redistribution license asserted',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

const appendUnique = (values, value) => [...list(values).filter((item) => clean(item) !== value), value];
pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_11x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: appendUnique(pkg.production_context?.released_evidence_files, WORK_CANON.evidenceFile),
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: appendUnique(pkg.production_context?.question_ready_claim_ids, WORK_CANON.claim),
  direct_object_ids: appendUnique(pkg.production_context?.direct_object_ids, WORK_CANON.object),
  released_emne_ids: appendUnique(pkg.production_context?.released_emne_ids, WORK_CANON.emne),
  blocked_canonical_topic_count: 37,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  WORK_CANON.evidenceFile
];
const sourceRef = (sourceId, locator, claimBasis) => ({ source_id: sourceId, locator, claim_basis: claimBasis });
const objectRef = (locator, claimBasis) => ({
  source_id: WORK_CANON.object,
  locator,
  use_mode: 'external_link_and_metadata_only',
  url: WORK_CANON.objectUrl,
  claim_basis: claimBasis
});

const workCanonSet = {
  set_id: 'pathway_musikk_verkbegrep_forfatterskap_kanon',
  title: 'Verkbegrep, forfatterskap og kanon',
  level: 11,
  order: 11,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: WORK_CANON.target,
  area_id: WORK_CANON.domain,
  emne_id: WORK_CANON.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [WORK_CANON.object],
  question_ready_claim_ids: [WORK_CANON.claim],
  questions: [
    {
      id: 'quiz_musikk_verkbegrep_kanon_pathway_q1',
      quiz_id: 'musikk_verkbegrep_kanon_pathway_q1',
      categoryId: 'musikk',
      targetId: WORK_CANON.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilken objektidentitet er dokumentert for O Sing unto the Lord i det frigitte korpuset?',
      options: [
        'Et manuskript attribuert til William Crotch, datert 1794, innlevert som Oxford BMus-øvelse og katalogisert som MS. Mus. Sch. Ex. d. 37',
        'En anonym trykt konsertutgave fra London uten kjent institusjonell funksjon eller arkivsignatur',
        'Et kommersielt lydopptak fra 1900-tallet med dokumentert plass i framføringskanonen'
      ],
      answer: 'Et manuskript attribuert til William Crotch, datert 1794, innlevert som Oxford BMus-øvelse og katalogisert som MS. Mus. Sch. Ex. d. 37',
      answerIndex: 0,
      knowledge: 'Bodleian-katalogen og Goldings objektstudie identifiserer Crotch, året 1794, Oxford-gradskonteksten og signaturen MS. Mus. Sch. Ex. d. 37. Identiteten er stabil for caset, selv om History Go ikke selv har analysert håndskriften.',
      difficulty: 2,
      question_type: 'observation',
      emne_id: WORK_CANON.emne,
      method_id: WORK_CANON.method,
      direct_object_id: WORK_CANON.object,
      core_concepts: ['objektidentitet', 'gradskomposisjon', 'arkivsignatur'],
      concept_ids: [],
      terms: ['objektidentitet', 'gradskomposisjon', 'arkivsignatur'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_verkbegrep_kanon_observe',
      evidence_type: 'manuscript_identity_observation',
      knowledge_payload: {
        summary: 'Det frigitte objektet er Crotchs Oxford BMus-øvelse fra 1794 med Bodleian-signaturen MS Mus Sch Ex d 37.',
        explanation: 'Katalogposten og Goldings studie knytter sammen komponistattribusjon, datering, institusjonell funksjon og en persistent arkividentitet.',
        why_it_matters: 'Historisering av verkstatus må begynne med kontrollert objektidentitet og proveniens.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(WORK_CANON.golding, 'Golding 2025 pp. 196–198, Table 1 and Figure 1 :: Crotch object identity and BMus context', 'Golding identifiserer manuskriptet, datering, scoring og funksjon som gradskomposisjon.'),
        objectRef('Bodleian resource 8207 :: MS. Mus. Sch. Ex. d. 37 :: title and attributed composer', 'Den offisielle katalogposten forankrer objektets tittel, attribusjon og arkivsignatur.')
      ],
      source_origin: 'external',
      claim_basis: 'Det identifiserte objektet er Crotchs manuskript fra 1794, produsert som Oxford BMus-øvelse og bevart under en kontrollert Bodleian-signatur.',
      guidance_basis: guidance,
      claim_id: WORK_CANON.claim
    },
    {
      id: 'quiz_musikk_verkbegrep_kanon_pathway_q2',
      quiz_id: 'musikk_verkbegrep_kanon_pathway_q2',
      categoryId: 'musikk',
      targetId: WORK_CANON.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor avgjør ikke den stabile Crotch-attribusjonen alene objektets verk- og kanonstatus?',
      options: [
        'Fordi et komponistnavn gjør manuskriptets institusjonelle funksjon historisk irrelevant',
        'Fordi attribusjon bare kan brukes på lydopptak, ikke på manuskripter',
        'Fordi attribusjon identifiserer opphav i dette caset, mens eksamen, arkiv, analyse og framføring autoriserer forskjellige statuser og sirkulasjonsformer'
      ],
      answer: 'Fordi attribusjon identifiserer opphav i dette caset, mens eksamen, arkiv, analyse og framføring autoriserer forskjellige statuser og sirkulasjonsformer',
      answerIndex: 2,
      knowledge: 'Komponistnavnet er viktig for objektidentiteten, men kan ikke erstatte historien om hva objektet ble laget for, hvordan det ble bevart, hvordan det senere analyseres, eller om det faktisk sirkulerte i en framføringskanon.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: WORK_CANON.emne,
      method_id: WORK_CANON.method,
      direct_object_id: WORK_CANON.object,
      core_concepts: ['attribusjon', 'verkstatus', 'institusjonell autorisering'],
      concept_ids: [],
      terms: ['attribusjon', 'verkstatus', 'institusjonell autorisering'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_verkbegrep_kanon_explain',
      evidence_type: 'institutional_status_explanation',
      knowledge_payload: {
        summary: 'Attribusjon identifiserer opphav, men eksamen, arkiv, analyse og framføring produserer ulike statuser for samme objekt.',
        explanation: 'Goldings studie viser gradskomposisjonen som ferdighetsdemonstrasjon og historisk artefakt, samtidig som musikkvitenskapelig lesbarhet ikke automatisk innebærer offentlig framføringskanon.',
        why_it_matters: 'Verk og kanon må historiseres som institusjonelle klassifikasjoner, ikke avledes direkte av komponistnavnet.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(WORK_CANON.golding, 'Golding 2025 pp. 188–190 and 214–222 :: accreditation purpose, work ontology and performing/musicological canons', 'Studien skiller institusjonell øvelse, historisk objekt, analytisk verdi og framføringskanon.'),
        objectRef('Bodleian resource 8207 and Golding 2025 pp. 196–198 :: stable object identity', 'Katalogidentiteten støtter attribusjonen, men avgjør ikke alle objektets historiske statuser.')
      ],
      source_origin: 'external',
      claim_basis: 'Stabil attribusjon løser identiteten i dette caset, men objektets funksjon, sirkulasjon og kanonstatus må dokumenteres gjennom separate institusjonelle spor.',
      guidance_basis: guidance,
      claim_id: WORK_CANON.claim
    },
    {
      id: 'quiz_musikk_verkbegrep_kanon_pathway_q3',
      quiz_id: 'musikk_verkbegrep_kanon_pathway_q3',
      categoryId: 'musikk',
      targetId: WORK_CANON.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hva kan fraværet av dokumentert publisering eller senere framføring brukes til i dette caset?',
      options: [
        'Til å bevise at ingen noen gang framførte objektet og at det derfor mangler estetisk verdi',
        'Til å avgrense den dokumenterte sirkulasjonen, samtidig som udokumentert bruk, estetisk kvalitet og årsak til kanonfravær forblir åpne spørsmål',
        'Til å fastslå at universitetet bevisst ekskluderte objektet fra enhver framtidig kanon'
      ],
      answer: 'Til å avgrense den dokumenterte sirkulasjonen, samtidig som udokumentert bruk, estetisk kvalitet og årsak til kanonfravær forblir åpne spørsmål',
      answerIndex: 1,
      knowledge: 'Golding fant ingen publisering eller senere framføring for det valgte objektet. Dette er avgrenset negativ evidens: det støtter en forsiktig sirkulasjonsbeskrivelse, men ikke total fraværsbevis, estetisk rangering eller en bestemt eksklusjonsårsak.',
      difficulty: 4,
      question_type: 'evidence',
      emne_id: WORK_CANON.emne,
      method_id: WORK_CANON.method,
      direct_object_id: WORK_CANON.object,
      core_concepts: ['negativ evidens', 'sirkulasjon', 'usikkerhet'],
      concept_ids: [],
      terms: ['negativ evidens', 'sirkulasjon', 'usikkerhet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_verkbegrep_kanon_evaluate_evidence',
      evidence_type: 'bounded_negative_evidence_evaluation',
      knowledge_payload: {
        summary: 'Manglende funn av publisering eller senere framføring avgrenser dokumentert sirkulasjon, men beviser ikke lav kvalitet eller absolutt fravær.',
        explanation: 'Den gjennomgåtte studien kan rapportere hva som ikke ble funnet i det undersøkte materialet, men kan ikke utelukke alle udokumenterte brukssituasjoner eller etablere en estetisk årsak.',
        why_it_matters: 'Negativ evidens må uttrykkes med søke- og korpusgrensen intakt.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(WORK_CANON.golding, 'Golding 2025 p. 198 and pp. 220–222 :: no documented publication/later performance and value boundaries', 'Studien dokumenterer begrenset sirkulasjon og skiller dette fra estetisk og musikkvitenskapelig verdi.'),
        objectRef('Bodleian resource 8207 :: catalog identity without publication or performance history', 'Katalogposten identifiserer objektet, men er ikke alene en komplett resepsjons- eller framføringshistorie.')
      ],
      source_origin: 'external',
      claim_basis: 'Det gjennomgåtte korpuset støtter bare en avgrenset påstand om manglende dokumentert publisering og senere framføring, ikke en estetisk eller kausal dom.',
      guidance_basis: guidance,
      claim_id: WORK_CANON.claim
    },
    {
      id: 'quiz_musikk_verkbegrep_kanon_pathway_q4',
      quiz_id: 'musikk_verkbegrep_kanon_pathway_q4',
      categoryId: 'musikk',
      targetId: WORK_CANON.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn det frigitte verk- og kanoncaset tillater?',
      options: [
        'Arkivbevaring og senere musikkvitenskapelig analyse beviser at objektet hadde stor offentlig innflytelse og var del av framføringskanonen',
        'Oxford-eksamen, Bodleian-arkivet og senere analyse gjør forskjellige sider av objektet historisk synlige',
        'Ett Oxford-manuskript kan belyse institusjonelt produsert verkstatus uten å definere en universell teori om alle musikalske verk'
      ],
      answer: 'Arkivbevaring og senere musikkvitenskapelig analyse beviser at objektet hadde stor offentlig innflytelse og var del av framføringskanonen',
      answerIndex: 0,
      knowledge: 'At et manuskript er bevart, katalogisert og analysert gjør det tilgjengelig som historisk og musikkvitenskapelig objekt. Disse sporene dokumenterer ikke i seg selv offentlig resepsjon, framføringssirkulasjon eller universell kanonstatus.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: WORK_CANON.emne,
      method_id: WORK_CANON.method,
      direct_object_id: WORK_CANON.object,
      core_concepts: ['framføringskanon', 'musikkvitenskapelig kanon', 'overgeneralisering'],
      concept_ids: [],
      terms: ['framføringskanon', 'musikkvitenskapelig kanon', 'overgeneralisering'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_verkbegrep_kanon_diagnose_failure',
      evidence_type: 'canon_scope_and_inference_boundary',
      knowledge_payload: {
        summary: 'Arkiv- og analyseverdi kan ikke uten egne resepsjonsspor omdefineres til offentlig innflytelse eller framføringskanon.',
        explanation: 'Golding skiller uttrykkelig den musikkvitenskapelige kanonen fra framføringskanonen, mens casets arkivspor bare dokumenterer bevaring, identitet og senere analytisk interesse.',
        why_it_matters: 'Kanonhistorie krever at ulike institusjonelle opptaks- og sirkulasjonsmekanismer holdes fra hverandre.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(WORK_CANON.golding, 'Golding 2025 pp. 214–222 :: historical value, performing canon and musicological canon', 'Golding skiller arkiv-/analyseverdi fra offentlig framføringskanon.'),
        objectRef('Bodleian resource 8207 :: archival preservation and catalog identity', 'Katalogbevaring gjør objektet inspectable, men dokumenterer ikke offentlig innflytelse.')
      ],
      source_origin: 'external',
      claim_basis: 'Arkivering og analyse etablerer historisk relevans, men kan ikke erstatte manglende evidens for offentlig resepsjon eller framføringskanon.',
      guidance_basis: guidance,
      claim_id: WORK_CANON.claim
    },
    {
      id: 'quiz_musikk_verkbegrep_kanon_pathway_q5',
      quiz_id: 'musikk_verkbegrep_kanon_pathway_q5',
      categoryId: 'musikk',
      targetId: WORK_CANON.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go levere Crotch-manuskriptet når direct object er låst til external_link_and_metadata_only?',
      options: [
        'Laste ned og republisere manuskriptsider og hele partituret uten en avklart redistribusjonslisens',
        'Tegne av partituret og presentere avskriften som et fritt History Go-verk uten kildeidentitet',
        'Vise Bodleians eksterne kataloglenke, signatur og metadata, og bruke bare parafraserte funn med presise lokatorer'
      ],
      answer: 'Vise Bodleians eksterne kataloglenke, signatur og metadata, og bruke bare parafraserte funn med presise lokatorer',
      answerIndex: 2,
      knowledge: 'Manuskriptobjektet leveres som ekstern Bodleian-lenke med signatur og bibliografisk identitet. History Go bruker parafraserte funn og lokatorer, men rehoster ikke manuskriptbilder, partitur eller artikkelfigurer.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: WORK_CANON.emne,
      method_id: WORK_CANON.method,
      direct_object_id: WORK_CANON.object,
      core_concepts: ['rettigheter', 'manuskript', 'metadata'],
      concept_ids: [],
      terms: ['rettigheter', 'manuskript', 'metadata'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_verkbegrep_kanon_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Crotch-manuskriptet leveres som ekstern kataloglenke og metadata, uten redistribusjon av manuskriptbilder eller partitur.',
        explanation: 'Den offisielle Bodleian-posten gir persistent identitet og signatur, men evidensgaten fastsetter ingen History Go-lisens for kopiering, endring eller innbygging av selve manuskriptet.',
        why_it_matters: 'Rights-gaten skiller kildehenvisning og kunnskapsbruk fra republisering av forskningsobjektet.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        objectRef('Bodleian resource 8207 :: rights decision external_link_and_metadata_only', 'Manuskriptet leveres med ekstern lenke, signatur, metadata og lokatorer, ikke som rehostet bilde eller partitur.')
      ],
      source_origin: 'external',
      claim_basis: 'Direct object må leveres som external_link_and_metadata_only; bare katalogmetadata, lokatorer og parafraserte funn inngår i History Go.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== WORK_CANON.emne);
pkg.sets.push(workCanonSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Verkbegrep, forfatterskap og kanon-pathway skrevet som sett 11.');
  } else {
    console.error('Verkbegrep/forfatterskap/kanon-pathway er utdatert. Kjør node tools/build-musikk-history-work-canon-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Verkbegrep, forfatterskap og kanon sett 11 OK.');
}
