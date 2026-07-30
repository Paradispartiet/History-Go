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

const TRANSNATIONAL = Object.freeze({
  emne: 'em_musikk_vit_transnasjonal_sirkulasjon_kolonihistorie',
  target: 'subject_musikk_transnasjonal_sirkulasjon_kolonihistorie',
  domain: 'historisk_musikkvitenskap_historiografi',
  claim: 'claim_musikk_history_transnational_colonial_oran_postcard_circuit',
  object: 'obj_oran_promenade_etang_concert_postcard_1906',
  wilford: 'prod_src_wilford_colonial_algeria_postcards_2022',
  method: 'historisk_kildekritikk',
  objectUrl: 'https://www.cambridge.org/core/journals/twentieth-century-music/article/seeing-music-in-early-twentieth-century-colonial-algeria/70682F4BC3DF1BFB5B6438BFDFABD591',
  evidenceFile: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/transnasjonal_sirkulasjon_kolonihistorie.json'
});

const newSources = [
  {
    id: TRANSNATIONAL.wilford,
    type: 'peer_reviewed_article_production_extension',
    title: "'Seeing' Music in Early Twentieth Century Colonial Algeria",
    publisher_or_author: 'Stephen Wilford / Twentieth-Century Music',
    date_or_version: '2022; 19(1), 65–92; DOI 10.1017/S1478572221000220',
    url: TRANSNATIONAL.objectUrl,
    status: 'reviewed_publisher_fulltext'
  },
  {
    id: TRANSNATIONAL.object,
    type: 'direct_research_object_reception_source',
    title: "Oran, Promenade de l'Etang: Le Concert (postcard sent to France, 1906)",
    publisher_or_author: 'LL-marked postcard / Stephen Wilford personal collection',
    date_or_version: '1906; Figure 6 in Wilford 2022',
    url: TRANSNATIONAL.objectUrl,
    status: 'direct_object_verified',
    object_type: 'kritikk_eller_resepsjonskilde',
    use_mode: 'external_link_and_metadata_only',
    license: 'No separate postcard-image ownership or reuse licence asserted',
    commercial_compatibility_with_history_go: 'not_resolved'
  }
];

const sourceMap = new Map(list(pkg.sources).map((source) => [clean(source.id), source]));
for (const source of newSources) sourceMap.set(source.id, source);
pkg.sources = [...sourceMap.values()];

const appendUnique = (values, value) => [...list(values).filter((item) => clean(item) !== value), value];
pkg.production_context = {
  ...pkg.production_context,
  profile: 'subject_pathway_pilot_12x5',
  fulltext_evidence: 'data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json',
  released_evidence_files: appendUnique(pkg.production_context?.released_evidence_files, TRANSNATIONAL.evidenceFile),
  source_review_status: 'fulltext_and_direct_object_verified',
  question_ready_claim_ids: appendUnique(pkg.production_context?.question_ready_claim_ids, TRANSNATIONAL.claim),
  direct_object_ids: appendUnique(pkg.production_context?.direct_object_ids, TRANSNATIONAL.object),
  released_emne_ids: appendUnique(pkg.production_context?.released_emne_ids, TRANSNATIONAL.emne),
  blocked_canonical_topic_count: 36,
  rights_mode: 'external_link_and_metadata_only'
};

const guidance = [
  'data/fag/musikk/musikkvitenskap_canonical_v1/modules_v2/historisk_musikkvitenskap_historiografi.json',
  TRANSNATIONAL.evidenceFile
];
const sourceRef = (sourceId, locator, claimBasis) => {
  const canonical = sourceMap.get(sourceId);
  if (!canonical) throw new Error(`Ukjent source_id: ${sourceId}`);
  return {
    source_id: sourceId,
    locator,
    claim_basis: claimBasis,
    source_type: canonical.type,
    title: canonical.title,
    publisher_or_author: canonical.publisher_or_author,
    date_or_version: canonical.date_or_version,
    url: canonical.url
  };
};
const objectRef = (locator, claimBasis) => ({
  ...sourceRef(TRANSNATIONAL.object, locator, claimBasis),
  use_mode: 'external_link_and_metadata_only',
});

const transnationalSet = {
  set_id: 'pathway_musikk_transnasjonal_sirkulasjon_kolonihistorie',
  title: 'Transnasjonal sirkulasjon og kolonihistorie',
  level: 12,
  order: 12,
  phase: 'subject_pathway',
  target_kind: 'subject_area',
  targetId: TRANSNATIONAL.target,
  area_id: TRANSNATIONAL.domain,
  emne_id: TRANSNATIONAL.emne,
  sequence: ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
  completion_rule: {
    minimum_correct: 4,
    explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
    source_trace_required_for_mastery: true
  },
  direct_object_ids: [TRANSNATIONAL.object],
  question_ready_claim_ids: [TRANSNATIONAL.claim],
  questions: [
    {
      id: 'quiz_musikk_transnasjonal_kolonihistorie_pathway_q1',
      quiz_id: 'musikk_transnasjonal_kolonihistorie_pathway_q1',
      categoryId: 'musikk',
      targetId: TRANSNATIONAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'observe',
      question: 'Hvilken sirkulasjonsrute er direkte dokumentert for det frigitte Oran-postkortet?',
      options: [
        'Et LL-merket konsertbilde fra Oran ble sendt av Jacques i 1906 til Madame Rigole i Oms i Frankrike',
        'Et lydopptak av algerisk musikk ble sendt anonymt fra Paris til Oran uten dato eller mottaker',
        'Et partitur ble fraktet fra Oms til Oran av en sikkert identifisert fotograf fra Léon et Lévy'
      ],
      answer: 'Et LL-merket konsertbilde fra Oran ble sendt av Jacques i 1906 til Madame Rigole i Oms i Frankrike',
      answerIndex: 0,
      knowledge: "Figur 6 og kortets bakside knytter sammen Oran, Promenade de l'Etang, år 1906, avsendernavnet Jacques og Madame Rigole i Oms. LL-merket er synlig, men fotografens personidentitet er ikke sikkert løst.",
      difficulty: 2,
      question_type: 'observation',
      emne_id: TRANSNATIONAL.emne,
      method_id: TRANSNATIONAL.method,
      direct_object_id: TRANSNATIONAL.object,
      core_concepts: ['objektidentitet', 'postrute', 'representasjonskilde'],
      concept_ids: [],
      terms: ['objektidentitet', 'postrute', 'representasjonskilde'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_transnasjonal_kolonihistorie_observe',
      evidence_type: 'postcard_route_observation',
      knowledge_payload: {
        summary: 'Det frigitte objektet dokumenterer en 1906-rute fra Oran via Jacques til Madame Rigole i Oms.',
        explanation: "Forside, bakside og Wilfords objektanalyse kobler stedet, konsertmotivet, LL-merket, avsenderen, mottakeren og postgangen sammen.",
        why_it_matters: 'Transnasjonal sirkulasjon må forankres i identifiserte ledd, ikke utledes av likhet eller en løs påstand om påvirkning.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(TRANSNATIONAL.wilford, 'Wilford 2022 pp. 78–80, Figure 6 :: Oran concert image, 1906 reverse and Jacques-to-Madame-Rigole route', 'Wilford dokumenterer objektets sted, år, avsender, mottaker og postrute.'),
        objectRef("Wilford 2022 Figure 6 :: Oran, Promenade de l'Etang, LL mark and reverse", 'Det valgte postkortet forankrer den konkrete sendende og mottakende kjeden.')
      ],
      source_origin: 'external',
      claim_basis: 'Det identifiserte postkortet gikk fra kolonialt Oran til en navngitt mottaker i Oms i Frankrike i 1906.',
      guidance_basis: guidance,
      claim_id: TRANSNATIONAL.claim
    },
    {
      id: 'quiz_musikk_transnasjonal_kolonihistorie_pathway_q2',
      quiz_id: 'musikk_transnasjonal_kolonihistorie_pathway_q2',
      categoryId: 'musikk',
      targetId: TRANSNATIONAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'explain',
      question: 'Hvorfor er postkortets bevegelse mer enn en nøytral overføring av et musikkbilde?',
      options: [
        'Fordi all postgang automatisk beviser musikalsk appropriasjon og mottakerens holdning',
        'Fordi fotografering, trykking, salg og post gjorde et situert arrangement til en bærbar kolonial kategori som normaliserte europeisk offentlig musikkliv i Algerie',
        'Fordi kortet gjengir den faktiske lyden og hele repertoaret uten mediering'
      ],
      answer: 'Fordi fotografering, trykking, salg og post gjorde et situert arrangement til en bærbar kolonial kategori som normaliserte europeisk offentlig musikkliv i Algerie',
      answerIndex: 1,
      knowledge: 'Wilford plasserer kortet i en fransk fotografisk, industriell og postal infrastruktur. Mediet gjorde en bestemt kolonial romorden portabel: europeisk orkestermusikk framstod som normal offentlig kultur, mens lokale musikere ofte ble rammet inn annerledes.',
      difficulty: 3,
      question_type: 'concept',
      emne_id: TRANSNATIONAL.emne,
      method_id: TRANSNATIONAL.method,
      direct_object_id: TRANSNATIONAL.object,
      core_concepts: ['mediering', 'kolonial representasjonsmakt', 'kategorioversettelse'],
      concept_ids: [],
      terms: ['mediering', 'kolonial representasjonsmakt', 'kategorioversettelse'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_transnasjonal_kolonihistorie_explain',
      evidence_type: 'colonial_mediation_explanation',
      knowledge_payload: {
        summary: 'Sirkulasjonskjeden oversatte et situert arrangement til en bærbar kolonial representasjon.',
        explanation: 'Fotografisk innramming, industriell reproduksjon, videresalg og postgang bestemte hva franske mottakere kunne se som autentisk musikkliv fra Algerie.',
        why_it_matters: 'Sirkulasjon må analyseres som lokal omforming og asymmetrisk kontroll, ikke som friksjonsfri transport.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(TRANSNATIONAL.wilford, 'Wilford 2022 pp. 65–71 and 80–81 :: postcard medium, French industry and colonial representational power', 'Studien knytter produksjon og sirkulasjon til fransk industri, turisme, post og kolonial framing.'),
        objectRef("Wilford 2022 pp. 78–81, Figure 6 :: Le Concert as portable image of Oran public music", 'Objektet viser hvordan et stedlig arrangement ble gjort til transportabel visuell kategori.')
      ],
      source_origin: 'external',
      claim_basis: 'Det frigitte caset dokumenterer mediert kategorioversettelse gjennom kolonial produksjons-, distribusjons- og representasjonsmakt.',
      guidance_basis: guidance,
      claim_id: TRANSNATIONAL.claim
    },
    {
      id: 'quiz_musikk_transnasjonal_kolonihistorie_pathway_q3',
      quiz_id: 'musikk_transnasjonal_kolonihistorie_pathway_q3',
      categoryId: 'musikk',
      targetId: TRANSNATIONAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'evaluate_evidence',
      question: 'Hva kan LL-merket og kortets bakside støtte uten å overdrive evidensen?',
      options: [
        'De beviser at Léon et Lévy tok fotografiet, trykte akkurat dette eksemplaret og bestemte Madame Rigoles tolkning',
        'De viser at alle koloniale postkort fulgte samme rute og hadde samme betydning',
        'De støtter et LL-merket objekt og en dokumentert 1906-postrute, mens fotografens sikre identitet, hvert produksjonstrinn og mottakerens reaksjon forblir uløst'
      ],
      answer: 'De støtter et LL-merket objekt og en dokumentert 1906-postrute, mens fotografens sikre identitet, hvert produksjonstrinn og mottakerens reaksjon forblir uløst',
      answerIndex: 2,
      knowledge: 'LL-merket er objektdata, og baksiden dokumenterer postgangen. Wilford sier samtidig at fotografen aldri ble formelt identifisert. Den franske produksjons- og videresalgskjeden er en dokumentert kontekst, ikke en full rekonstruksjon av hvert ledd for dette eksemplaret.',
      difficulty: 4,
      question_type: 'evidence',
      emne_id: TRANSNATIONAL.emne,
      method_id: TRANSNATIONAL.method,
      direct_object_id: TRANSNATIONAL.object,
      core_concepts: ['attribusjon', 'produksjonskjede', 'kildegrense'],
      concept_ids: [],
      terms: ['attribusjon', 'produksjonskjede', 'kildegrense'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_transnasjonal_kolonihistorie_evaluate_evidence',
      evidence_type: 'attribution_and_route_evaluation',
      knowledge_payload: {
        summary: 'LL og baksiden dokumenterer merke og rute, men ikke sikker fotografidentitet, komplett produksjon eller mottakereffekt.',
        explanation: 'Kildekritikken beholder forskjellen mellom det som står på objektet, industrikonteksten forskningen dokumenterer, og ledd som bare kunne vært spekulert fram.',
        why_it_matters: 'En full kildekjede kan inneholde eksplisitte hull; den blir ikke sterkere av å fylle dem med sikkerhet kildene ikke gir.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(TRANSNATIONAL.wilford, 'Wilford 2022 pp. 79–81 :: reverse, LL mark, unresolved photographer and printing/resale context', 'Wilford skiller dokumentert objektmerke og postrute fra attribusjons- og produksjonsusikkerhet.'),
        objectRef('Wilford 2022 Figure 6 front/reverse :: LL and Jacques-to-Madame-Rigole evidence', 'Direct object bærer merke- og rutedata, men ikke en komplett produksjons- eller resepsjonsforklaring.')
      ],
      source_origin: 'external',
      claim_basis: 'Objektet og fullteksten støtter en avgrenset rute og industrikontekst, men ikke sikker fotografidentitet eller mottakereffekt.',
      guidance_basis: guidance,
      claim_id: TRANSNATIONAL.claim
    },
    {
      id: 'quiz_musikk_transnasjonal_kolonihistorie_pathway_q4',
      quiz_id: 'musikk_transnasjonal_kolonihistorie_pathway_q4',
      categoryId: 'musikk',
      targetId: TRANSNATIONAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'diagnose_failure',
      question: 'Hvilken slutning går lenger enn det frigitte postkortcaset tillater?',
      options: [
        'Kortet dokumenterer en mediert visuell rute fra Oran til Frankrike med kolonial representasjonsasymmetri',
        'Kortet beviser hvilket repertoar som lød, at musikken var lånt fra Algerie og at bildet representerer hele algeriske musikkliv',
        'Ett postkort kan brukes som et avgrenset objekt når visuell representasjon holdes atskilt fra lyd og total representativitet'
      ],
      answer: 'Kortet beviser hvilket repertoar som lød, at musikken var lånt fra Algerie og at bildet representerer hele algeriske musikkliv',
      answerIndex: 1,
      knowledge: 'Postkortet er en visuell resepsjons- og representasjonskilde. Det inneholder ikke lyd, repertoarliste eller bevis på sonisk lån, og én privat samling kan ikke representere alle muslimske, amazighske, jødiske eller europeiske erfaringer.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: TRANSNATIONAL.emne,
      method_id: TRANSNATIONAL.method,
      direct_object_id: TRANSNATIONAL.object,
      core_concepts: ['visuell representasjon', 'sonisk overtolkning', 'representativitet'],
      concept_ids: [],
      terms: ['visuell representasjon', 'sonisk overtolkning', 'representativitet'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_transnasjonal_kolonihistorie_diagnose_failure',
      evidence_type: 'visual_sonic_and_scope_boundary',
      knowledge_payload: {
        summary: 'Et fotografert musikkmotiv kan ikke alene bevise lyd, repertoar, lån eller total kulturell representativitet.',
        explanation: 'Det frigitte claimet gjelder mediert sirkulasjon og kolonial framing av ett identifisert objekt, ikke en sonisk analyse eller en full historie om Algerie.',
        why_it_matters: 'Likhet og avbildning må aldri erstatte dokumenterte ruter, opphavsspor eller lokale perspektiver.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        sourceRef(TRANSNATIONAL.wilford, 'Wilford 2022 pp. 65–68, 78–81 and 88–90 :: visual source limits and colonial representation', 'Studien analyserer visuell mediering og advarer mot å behandle postkortarkivet som transparent musikkliv.'),
        objectRef('Wilford 2022 Figure 6 :: picture postcard without sound or repertoire list', 'Objektformen avgrenser hva som kan observeres direkte.')
      ],
      source_origin: 'external',
      claim_basis: 'Caset støtter ikke sonisk, opphavs- eller totalrepresentativ overtolkning av postkortbildet.',
      guidance_basis: guidance,
      claim_id: TRANSNATIONAL.claim
    },
    {
      id: 'quiz_musikk_transnasjonal_kolonihistorie_pathway_q5',
      quiz_id: 'musikk_transnasjonal_kolonihistorie_pathway_q5',
      categoryId: 'musikk',
      targetId: TRANSNATIONAL.target,
      question_scope: 'subject_area',
      pathway_stage: 'decide_and_justify',
      question: 'Hvordan skal History Go levere Oran-postkortet når bildegjenbruk ikke er separat avklart?',
      options: [
        'Kopiere, beskjære og embedde begge sider fordi artikkelen omtaler kortet',
        'Vise ekstern artikkellenke, DOI, objektmetadata og lokatorer og bruke parafraserte funn uten å republisere bildet',
        'Tegne om motivet og presentere det uten Wilford, figur- eller rettighetsinformasjon'
      ],
      answer: 'Vise ekstern artikkellenke, DOI, objektmetadata og lokatorer og bruke parafraserte funn uten å republisere bildet',
      answerIndex: 1,
      knowledge: 'Artikkelen er åpen under CC BY 4.0, men det valgte postkortet kommer fra forfatterens personlige samling og denne produksjonen har ikke etablert en separat gjenbrukskjede for bildet. Objektet leveres derfor som ekstern lenke og metadata.',
      difficulty: 5,
      question_type: 'analysis',
      emne_id: TRANSNATIONAL.emne,
      method_id: TRANSNATIONAL.method,
      direct_object_id: TRANSNATIONAL.object,
      core_concepts: ['rettigheter', 'postkort', 'metadata'],
      concept_ids: [],
      terms: ['rettigheter', 'postkort', 'metadata'],
      term_ids: [],
      primary_knowledge_unit_id: '',
      knowledge_unit_ids: [],
      learning_objective_id: 'lo_musikk_transnasjonal_kolonihistorie_decide_and_justify',
      evidence_type: 'rights_and_reuse_metadata',
      knowledge_payload: {
        summary: 'Oran-postkortet leveres som ekstern lenke og metadata uten republisering eller embedding av bildet.',
        explanation: 'Åpen artikkeltilgang løser ikke automatisk den separate eier- og gjenbrukskjeden for et objekt fra en personlig samling.',
        why_it_matters: 'Rights-gaten skiller forskningsbruk og kildehenvisning fra gjenbruk av selve bildet.'
      },
      feedback_basis: 'source_trace_and_explanation',
      source: [
        objectRef('Wilford 2022 Figure 6 rights decision :: external_link_and_metadata_only', 'Postkortet leveres med ekstern lenke, identitet og lokatorer, ikke som rehostet eller bearbeidet bilde.')
      ],
      source_origin: 'external',
      claim_basis: 'Direct object må leveres som external_link_and_metadata_only; bare metadata, lokatorer og parafraserte funn inngår i History Go.',
      guidance_basis: guidance
    }
  ]
};

pkg.sets = list(pkg.sets).filter((set) => set?.emne_id !== TRANSNATIONAL.emne);
pkg.sets.push(transnationalSet);
pkg.sets.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
pkg.sets.forEach((set, index) => { set.order = index + 1; });

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log('Transnasjonal sirkulasjon og kolonihistorie-pathway skrevet som sett 12.');
  } else {
    console.error('Transnasjonal sirkulasjon/kolonihistorie-pathway er utdatert. Kjør node tools/build-musikk-history-transnational-colonial-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log('Transnasjonal sirkulasjon og kolonihistorie sett 12 OK.');
}
