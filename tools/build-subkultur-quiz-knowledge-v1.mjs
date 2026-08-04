#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const PATHS = Object.freeze({
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  theoryObjects: 'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
  evidenceLinks: 'data/fag/subkultur/evidence_links_subkultur_canonical_v1.json',
  legacy: 'data/quiz/quiz_subkultur.json',
  fromBy: 'data/quiz/quiz_subkultur_from_by.json',
  pathway: 'data/quiz/subkultur/subkultur_subject_pathways_v1.json',
  legacyAudit: 'data/quiz/subkultur/subkultur_legacy_quiz_audit_v1.json',
  fagManifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  chapterManifest: 'data/fagverk/subkultur/manifest.json',
  quizManifest: 'data/quiz/manifest.json',
  knowledgeManifest: 'data/knowledge/knowledge_manifest.json'
});

const STAGES = Object.freeze([
  ['observe', 'observation'],
  ['explain', 'concept'],
  ['evaluate_evidence', 'source_criticism'],
  ['diagnose_failure', 'diagnosis'],
  ['decide_and_justify', 'application']
]);

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const text = (value) => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value : [];
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const normalize = (value) => text(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const slug = (value, max = 48) => normalize(value).replace(/\s+/g, '_').slice(0, max).replace(/^_+|_+$/g, '');
const digest = (value, length = 10) => createHash('sha256').update(text(value), 'utf8').digest('hex').slice(0, length);
const stableId = (prefix, subject, value) => `${prefix}_${slug(subject, 24)}_${slug(value, prefix === 'ku' ? 24 : 36) || 'item'}_${digest(`${subject}\0${normalize(value)}`)}`;
const unique = (values) => [...new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]).map(text).filter(Boolean))];
function splitClaims(value) {
  const source = text(value).replace(/\s+/g, ' ');
  if (!source) return [];
  const protectedText = source
    .replace(/\b(bl|ca|dvs|dr|f\.eks|mfl|mr|nr|osv|prof|st)\./gi, (match) => match.replace('.', '∯'))
    .replace(/(\d)\.(\d)/g, '$1∯$2');
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/)
    .map((part) => part.replaceAll('∯', '.').trim())
    .filter((part) => part.length >= 12 && !part.endsWith('?'));
}

const changed = [];
function expected(relative, value) {
  const next = jsonText(value);
  let current = '';
  try { current = fs.readFileSync(path.join(ROOT, relative), 'utf8'); } catch {}
  if (current === next) return;
  changed.push(relative);
  if (WRITE) {
    fs.mkdirSync(path.dirname(path.join(ROOT, relative)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, relative), next, 'utf8');
  }
}

const fagkart = readJson(PATHS.fagkart);
const emner = readJson(PATHS.emner);
const methods = list(readJson(PATHS.methods).methods);
const theories = readJson(PATHS.theoryObjects);
const claims = readJson(PATHS.claims).claims;
const sources = readJson(PATHS.sources).sources;
const evidenceLinks = readJson(PATHS.evidenceLinks).links;
const legacy = readJson(PATHS.legacy);
const fromBy = readJson(PATHS.fromBy);

const byTheory = new Map(theories.map((item) => [item.theory_id, item]));
const theoryByEmne = new Map(theories.flatMap((item) => list(item.emne_ids).map((id) => [id, item])));
const claimById = new Map(claims.map((item) => [item.claim_id, item]));
const sourceById = new Map(sources.map((item) => [item.source_id, item]));
const methodIds = new Set(methods.map((item) => item.method_id));

function sourceForQuestion(sourceId, claim) {
  const source = sourceById.get(sourceId);
  if (!source) throw new Error(`Ukjent kilde ${sourceId}`);
  const link = evidenceLinks.find((item) => item.claim_id === claim.claim_id && item.source_id === sourceId);
  return {
    source_id: source.source_id,
    source_type: source.source_type,
    title: source.title,
    publisher_or_author: list(source.creators).join(', ') || source.publisher,
    date_or_version: String(source.year ?? ''),
    locator: source.contribution,
    url: source.url,
    claim_basis: link?.support_note || 'Kilden støtter den avgrensede teori- eller grensepåstanden.',
    inference_boundary: link?.inference_boundary || 'Kilden etablerer ikke lokale casefakta.'
  };
}

function rotatedOptions(correct, wrong, answerIndex) {
  const options = [...wrong.slice(0, 2)];
  options.splice(answerIndex, 0, correct);
  return { options, answerIndex };
}

function contentFor(stage, emne, theory, claim, domainPeers) {
  const other = domainPeers.filter((item) => item.emne_id !== emne.emne_id);
  const lowerTitle = emne.title.toLocaleLowerCase('nb');
  if (stage === 'observe') return {
    question: `Hva må dokumenteres før «${emne.title}» kan brukes som en Subkultur-analyse?`,
    correct: emne.definition,
    wrong: [
      `At caset har en alternativ estetikk, selv om sosial organisering og praksis ikke er dokumentert.`,
      `At én utenforstående omtaler caset som subkulturelt, uavhengig av miljøets egne handlinger.`
    ],
    knowledge: `${emne.definition} Analysen krever dokumenterte relasjoner, praksiser eller grenser; etikett og estetikk alene er ikke nok.`,
    explanation: `Observasjonstrinnet avgrenser ${lowerTitle} til empiriske tegn som kan kontrolleres, før teori eller kategori tilskrives caset.`
  };
  if (stage === 'explain') return {
    question: `Hvilken mekanisme beskriver «${emne.title}» mest presist?`,
    correct: emne.mechanism,
    wrong: [other[0]?.mechanism || 'Synlighet gjør automatisk et miljø subkulturelt.', other[1]?.mechanism || 'Popularitet opphever alle interne grenser.'],
    knowledge: `${emne.mechanism} Dette er en avgrenset analytisk mekanisme, ikke et lokalt faktum.`,
    explanation: `Mekanismen forklarer hva som må undersøkes i ${lowerTitle}; den kan ikke erstatte dokumentasjon av et konkret miljø.`
  };
  if (stage === 'evaluate_evidence') return {
    question: `Hvilket kildeoppsett gir sterkest grunnlag for å vurdere «${emne.title}»?`,
    correct: 'En faglig hovedkilde og en uavhengig kritikkilde, med eksplisitt slutningsgrense og egne casekilder ved lokal bruk.',
    wrong: [
      'Den canonicale emnefila alene, fordi intern konsistens også dokumenterer virkeligheten.',
      'Ett spektakulært case, generalisert til alle subkulturelle miljøer uten kontrollkilde.'
    ],
    knowledge: `For ${lowerTitle} må hovedkilde og kontrollkilde støtte en avgrenset påstand. Canonicalfilen og et enkelt case kan ikke bevise teoriens universelle gyldighet.`,
    explanation: `Evidenstrinnet skiller teoriunderlag fra caseevidens og krever at alternative forklaringer kan prøves.`
  };
  if (stage === 'diagnose_failure') return {
    question: `Hva er den mest alvorlige analysefeilen ved feil bruk av «${emne.title}»?`,
    correct: list(theory.limitations_and_misuse)[0] || emne.limitation,
    wrong: [
      'At analysen oppgir både hovedkilde og kontrollkilde.',
      'At analysen skiller tydelig mellom teori og lokale casefakta.'
    ],
    knowledge: `${list(theory.limitations_and_misuse)[0] || emne.limitation} Feilen må prøves mot kontrollkilden før begrepet brukes på en case.`,
    explanation: `Diagnosen identifiserer en konkret feilslutning og viser hvorfor ${lowerTitle} må avgrenses før anvendelse.`
  };
  return {
    question: `Når kan «${emne.title}» forsvarlig brukes på et konkret miljø eller sted?`,
    correct: theory.case_application_rule,
    wrong: [
      'Når navnet, sjangeren eller estetikken virker alternativ, uten miljønær kilde eller uavhengig kontroll.',
      'Når én teorikilde passer språklig, selv om caset mangler dokumentert sosial praksis.'
    ],
    knowledge: `For ${lowerTitle}: ${theory.case_application_rule}`,
    explanation: `Beslutningen krever at teori, metode, casekilder og etisk vurdering holdes atskilt og kan etterprøves.`
  };
}

const domains = list(fagkart.categories);
if (domains.length !== 8) throw new Error(`Forventet 8 domener, fant ${domains.length}`);
const packageSources = new Map();
const sets = domains.map((domain, domainIndex) => {
  const domainId = domain.id || domain.category_id;
  const domainTitle = domain.title || domain.label;
  const peers = emner.filter((item) => item.domain === domainId);
  if (peers.length !== 10) throw new Error(`${domainId} har ${peers.length} emner, forventet 10`);
  const selected = peers.slice(0, 5);
  const questions = selected.map((emne, questionIndex) => {
    const [stage, questionType] = STAGES[questionIndex];
    const theory = theoryByEmne.get(emne.emne_id);
    if (!theory || theory.status !== 'evidence_ready') throw new Error(`${emne.emne_id} mangler evidence-ready teoriobjekt`);
    const claimId = list(theory.claim_ids)[questionIndex < 2 ? 0 : 1];
    const claim = claimById.get(claimId);
    if (!claim) throw new Error(`${theory.theory_id} mangler claim for ${stage}`);
    const linkedSourceIds = unique(evidenceLinks.filter((item) => item.claim_id === claimId).map((item) => item.source_id));
    if (linkedSourceIds.length < 2) throw new Error(`${claimId} mangler to evidenskilder`);
    const questionSources = linkedSourceIds.map((id) => sourceForQuestion(id, claim));
    questionSources.forEach((item) => packageSources.set(item.source_id, sourceById.get(item.source_id)));
    const content = contentFor(stage, emne, theory, claim, peers);
    const answerIndex = (domainIndex + questionIndex) % 3;
    const { options } = rotatedOptions(content.correct, content.wrong, answerIndex);
    const concepts = unique(list(emne.core_concepts).slice(0, 3));
    const conceptIds = concepts.map((label) => stableId('co', 'subkultur', label));
    const termIds = concepts.map((label) => stableId('term', 'subkultur', label));
    const knowledgeClaims = splitClaims(content.knowledge);
    const knowledgeUnitIds = (knowledgeClaims.length ? knowledgeClaims : [content.knowledge])
      .map((item) => stableId('ku', 'subkultur', item));
    const kuId = knowledgeUnitIds[0];
    const methodId = list(theory.method_ids)[0];
    if (!methodIds.has(methodId)) throw new Error(`${emne.emne_id} peker til ukjent metode ${methodId}`);
    return {
      id: `quiz_sub_${domainId}_${stage}`,
      quiz_id: `subkultur_${domainId}_pathway_q${questionIndex + 1}`,
      categoryId: 'subkultur',
      subject_id: 'subkultur',
      targetId: `subject_subkultur_${domainId}`,
      question_scope: 'subject_area',
      pathway_stage: stage,
      question: content.question,
      options,
      answer: content.correct,
      answerIndex,
      knowledge: content.knowledge,
      explanation: content.explanation,
      difficulty: questionIndex < 2 ? 2 : 3,
      question_type: questionType,
      emne_id: emne.emne_id,
      emne_ids: [emne.emne_id],
      method_id: methodId,
      theory_id: theory.theory_id,
      claim_id: claimId,
      core_concepts: concepts,
      concepts,
      concept_ids: conceptIds,
      terms: concepts,
      term_ids: termIds,
      primary_knowledge_unit_id: kuId,
      knowledge_unit_ids: knowledgeUnitIds,
      learning_objective_id: `lo_sub_${domainId}_${stage}`,
      evidence_type: stage === 'evaluate_evidence' ? 'theory_plus_independent_critique' : 'bounded_scholarly_claim',
      knowledge_payload: {
        summary: content.knowledge,
        explanation: content.explanation,
        why_it_matters: `Spørsmålet trener ${domainTitle.toLocaleLowerCase('nb')} med eksplisitt teori-, metode- og slutningsgrense.`
      },
      feedback_basis: 'source_trace_and_explanation',
      source: questionSources,
      source_origin: 'external',
      claim_basis: claim.statement,
      guidance_basis: [
        PATHS.emner,
        PATHS.theoryObjects,
        PATHS.claims,
        PATHS.evidenceLinks
      ],
      uncertainty: claim.uncertainty,
      case_fact: false,
      knowledge_contract_version: 1,
      knowledge_link_status: 'linked',
      knowledge_link_evidence: { method: 'explicit', confidence: 1 }
    };
  });
  return {
    set_id: `pathway_sub_${domainId}`,
    title: domainTitle,
    level: 5,
    order: domainIndex + 1,
    phase: 'subject_pathway',
    target_kind: 'subject_area',
    targetId: `subject_subkultur_${domainId}`,
    area_id: domainId,
    emne_ids: selected.map((item) => item.emne_id),
    sequence: STAGES.map(([stage]) => stage),
    completion_rule: {
      minimum_correct: 4,
      explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
      source_trace_required_for_mastery: true
    },
    question_ready_claim_ids: questions.map((item) => item.claim_id),
    questions
  };
});

const pathway = {
  schema: 'history_go_subject_pathway_package_v1',
  version: 1,
  status: 'canonical',
  package_kind: 'subject_pathway',
  categoryId: 'subkultur',
  subject_id: 'subkultur',
  targetId: 'subject_subkultur',
  title: 'Subkultur – fagområdeforløp',
  sources: [...packageSources.values()].sort((a, b) => a.source_id.localeCompare(b.source_id, 'nb')),
  production_context: {
    profile: 'subject_pathway_8x5',
    standard_version: 'QUIZ_PRODUCTION_CANONICAL_3.2+SUBJECT_PATHWAY_V1',
    source_review_status: 'theory_evidence_ready_and_case_boundary_enforced',
    question_ready_claim_ids: unique(sets.flatMap((set) => set.question_ready_claim_ids)),
    released_emne_ids: unique(sets.flatMap((set) => set.emne_ids)),
    blocked_canonical_topic_count: emner.length - unique(sets.flatMap((set) => set.emne_ids)).length,
    legacy_audit: PATHS.legacyAudit,
    geographic_activation: false,
    geographic_activation_note: 'Universelle fagområdeforløp; lokale stedspåstander krever separate casekilder og produseres ikke fra legacyquiz.',
    case_fact_policy: 'forbidden_without_separate_validated_case_sources'
  },
  sets
};

const legacyRows = legacy.map((question, index) => ({
  question_id: question.id || `legacy_subkultur_${index + 1}`,
  source_file: PATHS.legacy,
  prior_runtime_status: 'active_manifest_entry',
  disposition: 'archived_in_place_reproduction_required',
  reason_codes: ['missing_external_source', 'missing_canonical_emne', 'missing_knowledge_contract'],
  replacement_surface: PATHS.pathway,
  place_id: question.placeId || null
}));
const fromByRows = fromBy.map((question, index) => ({
  question_id: question.id || `legacy_subkultur_from_by_${index + 1}`,
  source_file: PATHS.fromBy,
  prior_runtime_status: 'not_in_manifest',
  disposition: 'archived_in_place_foreign_emne_and_claim_review_required',
  reason_codes: [
    ...(text(question.emne_id).startsWith('em_by_') ? ['foreign_emne_binding'] : []),
    'missing_external_source',
    'person_claim_requires_reproduction'
  ],
  replacement_surface: PATHS.pathway,
  person_id: question.personId || null
}));
const legacyAudit = {
  schema: 'history_go_subkultur_legacy_quiz_audit_v1',
  version: '1.0.0',
  subject_id: 'subkultur',
  status: 'complete',
  policy: 'Legacyspørsmål kan ikke brukes som evidens eller Knowledge før hver påstand er reprodusert fra inspectable eksterne kilder.',
  summary: {
    reviewed: legacyRows.length + fromByRows.length,
    prior_active: legacyRows.length,
    prior_inactive_from_by: fromByRows.length,
    retained_active: 0,
    rewritten_in_place: 0,
    archived_in_place: legacyRows.length + fromByRows.length,
    foreign_emne_bindings_active_after_audit: 0,
    subject_pathways_created: sets.length,
    pathway_questions_created: sets.reduce((sum, set) => sum + set.questions.length, 0)
  },
  records: [...legacyRows, ...fromByRows]
};

expected(PATHS.pathway, pathway);
expected(PATHS.legacyAudit, legacyAudit);

const fagManifest = readJson(PATHS.fagManifest);
fagManifest.subkultur = {
  ...fagManifest.subkultur,
  quizPackageSchema: '../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
  subjectPathwaySchema: '../quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json',
  subjectPathwayPackage: '../quiz/subkultur/subkultur_subject_pathways_v1.json'
};
expected(PATHS.fagManifest, fagManifest);

const inventory = readJson(PATHS.inventory);
const inventoryEntry = list(inventory.subjects).find((item) => item.id === 'subkultur');
if (!inventoryEntry) throw new Error('subject_inventory mangler subkultur');
for (const field of ['quizPackageSchema', 'subjectPathwaySchema', 'subjectPathwayPackage']) {
  if (!list(inventoryEntry.optionalManifestFields).includes(field)) inventoryEntry.optionalManifestFields.push(field);
}
expected(PATHS.inventory, inventory);

const quizManifest = readJson(PATHS.quizManifest);
quizManifest.files = list(quizManifest.files).filter((file) => file !== PATHS.legacy);
quizManifest.subjectPackages = list(quizManifest.subjectPackages).filter((item) => item.subjectId !== 'subkultur');
quizManifest.subjectPackages.push({
  subjectId: 'subkultur',
  targetId: 'subject_subkultur',
  packageKind: 'subject_pathway',
  file: PATHS.pathway,
  schema: 'data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json',
  status: 'active'
});
quizManifest.subjectPackages.sort((a, b) => text(a.subjectId).localeCompare(text(b.subjectId), 'nb'));
expected(PATHS.quizManifest, quizManifest);

const knowledgeManifest = readJson(PATHS.knowledgeManifest);
knowledgeManifest.runtime ||= {};
knowledgeManifest.runtime.subjectPathwaySources = {
  ...(knowledgeManifest.runtime.subjectPathwaySources || {}),
  subkultur: '../quiz/subkultur/subkultur_subject_pathways_v1.json'
};
knowledgeManifest.runtime.subjectPathwaySources = Object.fromEntries(
  Object.entries(knowledgeManifest.runtime.subjectPathwaySources).sort(([a], [b]) => a.localeCompare(b, 'nb'))
);
knowledgeManifest.runtime.subjectCanonicalRegistries = {
  ...(knowledgeManifest.runtime.subjectCanonicalRegistries || {}),
  subkultur: {
    knowledge_units: 'subjects/subkultur/knowledge_units.generated.json',
    concepts: 'subjects/subkultur/concepts.generated.json',
    terms: 'subjects/subkultur/terms.generated.json',
    stories: 'subjects/subkultur/stories.generated.json'
  }
};
knowledgeManifest.runtime.subjectCanonicalRegistries = Object.fromEntries(
  Object.entries(knowledgeManifest.runtime.subjectCanonicalRegistries).sort(([a], [b]) => a.localeCompare(b, 'nb'))
);
expected(PATHS.knowledgeManifest, knowledgeManifest);

const status = readJson(PATHS.status);
const statusEntry = list(status.subjects).find((item) => item.id === 'subkultur');
if (!statusEntry) throw new Error('subject_status mangler subkultur');
Object.assign(statusEntry, {
  navigationStatus: 'materialized',
  assessmentStatus: 'audited',
  editorialStatus: 'complete',
  nextGate: 'maintenance_and_source_refresh',
  note: 'Åtte canonicale fagområder og kapitler, 80 emner og teoriobjekter, 42 validerte cases, 8 pathways og 40 kildebelagte vurderingsspørsmål.'
});
expected(PATHS.status, status);

const chapterManifest = readJson(PATHS.chapterManifest);
chapterManifest.status = 'complete_runtime_materialized';
chapterManifest.next_gate = 'maintenance_and_source_refresh';
chapterManifest.assessment = {
  package: PATHS.pathway,
  legacy_audit: PATHS.legacyAudit,
  pathways: sets.length,
  questions: sets.reduce((sum, set) => sum + set.questions.length, 0),
  knowledge_status: 'canonical_linked',
  legacy_active_questions: 0
};
chapterManifest.runtime = {
  manifest: 'data/fag/subkultur/subkultur_runtime_manifest.json',
  registry: 'data/fagverk/fagverk_registry.json',
  portal: 'data/fagverk/fagverk_portal.json',
  navigation_status: 'materialized',
  assessment_status: 'audited',
  editorial_status: 'complete'
};
expected(PATHS.chapterManifest, chapterManifest);

if (CHECK && changed.length) {
  console.error('Subkultur Quiz/Knowledge er utdatert:');
  changed.forEach((file) => console.error(`- ${file}`));
  process.exitCode = 1;
} else {
  console.log(`Subkultur Quiz/Knowledge ${WRITE ? 'skrevet' : 'OK'}: ${sets.length} pathways, ${sets.reduce((sum, set) => sum + set.questions.length, 0)} spørsmål, ${legacyAudit.summary.reviewed} legacyrader; ${changed.length} avvik.`);
}
