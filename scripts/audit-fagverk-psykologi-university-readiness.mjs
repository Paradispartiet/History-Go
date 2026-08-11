#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditPsykologiBiologicalUniversity } from './audit-fagverk-psykologi-biological-university.mjs';
import { auditPsykologiCognitiveUniversity } from './audit-fagverk-psykologi-cognitive-university.mjs';
import { auditPsykologiPersonalityUniversity } from './audit-fagverk-psykologi-personality-university.mjs';
import { auditPsykologiMethodsStatisticsUniversity } from './audit-fagverk-psykologi-methods-statistics-university.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEXT_GATE = 'university_matrix_topic_articles_concept_registry_and_methods';
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  biologicalPsychology: 'data/fag/psykologi/biologisk_psykologi_university_v1.json',
  cognitivePsychology: 'data/fag/psykologi/kognitiv_psykologi_university_v1.json',
  personalityPsychology: 'data/fag/psykologi/personlighetspsykologi_university_v1.json',
  methodsStatistics: 'data/fag/psykologi/metode_statistikk_psykologi_university_v1.json',
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  emner: 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceRegistry: 'data/fag/psykologi/kilder_psykologi_canonical_v1.json',
  articleDir: 'data/fagverk/psykologi/emneartikler',
  concepts: 'data/fag/psykologi/begreper_psykologi_canonical_v1.json',
  report: 'reports/fagverk/psykologi-university-readiness-audit.json'
});
const REQUIRED_CORE = [
  'biological_psychology','cognitive_psychology','developmental_psychology','social_psychology',
  'personality_psychology','history_science_theory','research_methods_statistics'
];
const REQUIRED_METHOD_TOPICS = [
  'eksperimentelt_design','observasjon','korrelasjon','longitudinelt_design','tverrsnittdesign','kvalitativ_metode',
  'utvalg_og_representativitet','operasjonalisering','reliabilitet','validitet','deskriptiv_statistikk','statistisk_inferens',
  'hypotesetesting','effektstorrelse','konfidensintervall_og_usikkerhet','regresjon','kausalitet_og_konfundering',
  'replikasjon','apen_vitenskap','forskningsetikk'
];
const REQUIRED_BIOLOGICAL_TOPICS = [
  'nerveceller_og_glia','aksjonspotensial_og_synaptisk_kommunikasjon','sentralt_og_perifert_nervesystem',
  'hjernens_systemer_og_nettverk','nevral_utvikling_og_plastisitet','genetikk_arvelighet_og_polygenisitet',
  'gen_miljo_og_epigenetikk','hormoner_og_nevroendokrin_regulering','sanser_og_transduksjon',
  'sovn_og_dognrytmer','homeostase_motivasjon_og_belonning','stress_foleser_og_kroppslig_regulering',
  'psykofarmakologi_og_nevrotransmittersystemer','biologiske_forskningsmetoder','forklaringsnivaer_kausalitet_og_nevroetikk'
];
const REQUIRED_COGNITIVE_TOPICS = [
  'psykofysikk_signaloppdagelse_og_maling','perseptuell_organisering_konstans_og_forventning',
  'selektiv_oppmerksomhet_orientering_og_beredskap','delt_oppmerksomhet_automatikk_og_uoppmerksomhetsblindhet',
  'arbeidsminne_kapasitet_og_oppgavekrav','innkoding_konsolidering_og_gjenhenting',
  'rekonstruktiv_hukommelse_kildekontroll_og_feilminner','laring_spredt_oving_gjenhenting_og_overforing',
  'begreper_kategorier_og_semantisk_kunnskap','sprakforstaelse_produksjon_og_kontekst',
  'sprak_tenkning_og_flerspraklig_erfaring','mentale_bilder_romlig_kognisjon_og_representasjonsformat',
  'eksekutive_funksjoner_kontroll_og_oppgaveurenhet','problemlosning_resonnering_og_ekspertise',
  'heuristikker_bias_og_dualprosessmodeller','beslutning_under_risiko_usikkerhet_og_framing',
  'metakognisjon_kognitive_modeller_og_forskningsmetoder'
];
const REQUIRED_PERSONALITY_TOPICS = [
  'personlighet_trekk_og_individforskjeller','big_five_og_hierarkiske_trekkmodeller',
  'alternative_trekkmodeller_og_hexaco','dynamiske_humanistiske_og_narrative_perspektiver',
  'person_situasjon_og_atferdsvariasjon','rangordensstabilitet_og_gjennomsnittsendring',
  'personlighetsutvikling_i_livslopet','identitet_selv_og_personlighet',
  'biologiske_og_genetiske_perspektiver','sosial_laring_mal_og_karakteristiske_tilpasninger',
  'kultur_kontekst_og_personlighetsuttrykk','krysskulturell_ekvivalens_og_mangfold',
  'selvrapport_informantrapport_og_atferdsdata','reliabilitet_validitet_og_maleinvarians',
  'prediksjon_av_utfall_og_usikkerhet','modellkritikk_etikk_og_typestempling'
];
const REQUIRED_SOURCE_DOCUMENTS = [
  'data/fagverk/psykologi/fagtradisjoner-teori-og-sinnet/claims.json',
  'data/fagverk/psykologi/kognisjon-folelser-og-atferd/claims.json',
  'data/fagverk/psykologi/psykisk-helse-institusjoner-og-behandling/claims.json',
  'data/fagverk/psykologi/sosialpsykologi-normalitet-og-stigma/claims.json',
  'data/fagverk/psykologi/traume-krise-resiliens-og-omsorg/claims.json',
  'data/fagverk/psykologi/utvikling-oppvekst-og-laring/claims.json'
];
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function listJson(relativeDir) {
  const dir = abs(relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort().map((file) => `${relativeDir}/${file}`);
}

function fieldIsMaterialized(value) {
  return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null;
}

export function sourceIsInspectable(source, requiredFields) {
  if (!requiredFields.every((field) => fieldIsMaterialized(source[field]))) return false;
  if (source.type === 'internal_place_record') {
    return typeof source.url === 'string' && source.url.startsWith('data/') && fs.existsSync(abs(source.url));
  }
  return typeof source.url === 'string' && /^https:\/\//.test(source.url);
}

export function validatedSourceIndex(registrations, requiredFields) {
  assert(registrations.every((source) => fieldIsMaterialized(source?.id)), 'Kilderegisteret har en registrering uten id');
  const byId = new Map();
  const conflictingIds = new Set();
  for (const source of registrations) {
    const previous = byId.get(source.id);
    if (previous && ['publisher','title','url','type'].some((field) => previous[field] !== source[field])) conflictingIds.add(source.id);
    if (!previous) byId.set(source.id, source);
  }
  const validIds = new Set([...byId].filter(([, source]) => sourceIsInspectable(source, requiredFields)).map(([id]) => id));
  assert(conflictingIds.size === 0, `Kilderegisteret har motstridende metadata for: ${[...conflictingIds].sort().join(', ')}`);
  assert(validIds.size === byId.size, `Kilderegisteret har ${byId.size - validIds.size} ufullstendige eller ikke-inspiserbare kilder`);
  return { registeredCount: byId.size, validIds };
}

function sourceRegistry(contract) {
  assert(contract.path === P.sourceRegistry, 'University-readiness peker til feil kilderegister');
  assert(fs.existsSync(abs(contract.path)), `Mangler ${contract.path}`);
  const registry = read(contract.path);
  assert(registry.schema === 'history_go_psykologi_source_registry_v1', 'Feil Psykologi-kilderegisterschema');
  assert(isDeepStrictEqual([...(registry.source_documents || [])].sort(), [...REQUIRED_SOURCE_DOCUMENTS].sort()), 'Psykologi-kilderegisteret må binde eksakt de seks kapittelregistrene');
  assert(Array.isArray(registry.sources), 'Psykologi-kilderegisteret mangler sources');

  const registrations = [...registry.sources];
  for (const file of registry.source_documents) {
    assert(fs.existsSync(abs(file)), `Kilderegisteret peker til manglende dokument: ${file}`);
    const document = read(file);
    assert(Array.isArray(document.sources), `${file} mangler sources`);
    registrations.push(...document.sources);
  }

  return validatedSourceIndex(registrations, contract.required_source_fields);
}

export function sourceIdsResolve(sourceIds, validSourceIds) {
  return Array.isArray(sourceIds) && sourceIds.length > 0 && sourceIds.every((id) => typeof id === 'string' && validSourceIds.has(id));
}

export function sourcedDocumentCoverage(documents, { requiredIds, idField, requiredFields, validSourceIds }) {
  const valid = new Set();
  let invalidSourceReferenceCount = 0;
  for (const document of documents) {
    const id = document[idField];
    if (!requiredIds.has(id)) continue;
    const fieldsComplete = requiredFields.every((field) => fieldIsMaterialized(document[field]));
    const sourcesResolve = sourceIdsResolve(document.source_ids, validSourceIds);
    if (fieldsComplete && !sourcesResolve) invalidSourceReferenceCount += 1;
    if (fieldsComplete && sourcesResolve) valid.add(id);
  }
  return { validIds: [...valid].sort(), completeCount: valid.size, invalidSourceReferenceCount };
}

function topicArticleCoverage(canonicalIds, contract, validSourceIds) {
  const files = listJson(contract.directory);
  return { files, ...sourcedDocumentCoverage(files.map(read), {
    requiredIds: canonicalIds,
    idField: 'emne_id',
    requiredFields: contract.required_fields,
    validSourceIds
  }) };
}

function conceptCoverage(contract, validSourceIds) {
  if (!fs.existsSync(abs(contract.path))) return { exists: false, conceptCount: 0, materializedCount: 0, invalidSourceReferenceCount: 0 };
  const doc = read(contract.path);
  const concepts = Array.isArray(doc) ? doc : (doc.concepts || []);
  const coverage = sourcedDocumentCoverage(concepts, {
    requiredIds: new Set(concepts.map((concept) => concept.concept_id).filter(Boolean)),
    idField: 'concept_id',
    requiredFields: contract.required_fields,
    validSourceIds
  });
  return { exists: true, conceptCount: concepts.length, materializedCount: coverage.completeCount, invalidSourceReferenceCount: coverage.invalidSourceReferenceCount };
}

export function expectedSubjectState(completeReady, contract) {
  return completeReady
    ? { editorialStatus: contract.final_editorial_status, nextGate: contract.final_next_gate, matrixStatus: contract.final_matrix_status }
    : { editorialStatus: contract.required_editorial_status_before_final_gate, nextGate: contract.next_gate, matrixStatus: 'expansion_required_before_complete' };
}

const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  subject: report.subject,
  baseline: report.baseline,
  universityCore: report.universityCore,
  biologicalPsychology: report.biologicalPsychology,
  cognitivePsychology: report.cognitivePsychology,
  personalityPsychology: report.personalityPsychology,
  methodsStatistics: report.methodsStatistics,
  topicArticles: report.topicArticles,
  concepts: report.concepts,
  sourceRegistry: report.sourceRegistry,
  appliedFields: report.appliedFields,
  blockersToComplete: report.blockersToComplete,
  currentGates: report.currentGates,
  completionGates: report.completionGates,
  completeReady: report.completeReady
});

export function auditPsykologiUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.biologicalPsychology, P.cognitivePsychology, P.personalityPsychology, P.methodsStatistics, P.pensum, P.emner, P.registry, P.status]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const registry = read(P.registry);
  const status = read(P.status);
  const statusEntry = status.subjects.find((row) => row.id === 'psykologi');
  const registrySubject = registry.subjects?.psykologi;

  assert(matrix.schema === 'history_go_psykologi_university_readiness_v1', 'Feil university-readiness schema');
  assert(matrix.subject_id === 'psykologi', 'University-readiness peker til feil fag');
  assert(matrix.authoritative_sources?.length >= 3, 'University-readiness mangler autoritative program-/retningslinjekilder');
  assert(matrix.authoritative_sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.verified_at), 'University-readiness har ufullstendig kildemetadata');

  const canonicalEmneIds = new Set(pensum.domains.flatMap((domain) => domain.emne_ids || []));
  assert(pensum.summary.domain_count === 6 && pensum.summary.emne_count === 58 && pensum.summary.method_count === 58, 'Canonical Psykologi-baseline er ikke 6/58/58');
  assert(canonicalEmneIds.size === 58 && emner.length === 58 && new Set(emner.map((row) => row.emne_id)).size === 58, 'Canonical emnebaseline må ha 58 unike emner');
  assert(registrySubject?.chapters?.length === 6, 'University-readiness krever bevart sekskapitlers baseline');
  assert(statusEntry?.navigationStatus === 'materialized' && statusEntry?.assessmentStatus === 'audited', 'Psykologi mistet materialized/audited status');
  assert(matrix.completion_contract?.next_gate === NEXT_GATE, 'University-readiness har feil aktiv universitetsport');

  const coreRows = matrix.university_core_matrix || [];
  const coreById = new Map(coreRows.map((row) => [row.area_id, row]));
  assert(coreRows.length === REQUIRED_CORE.length && REQUIRED_CORE.every((id) => coreById.has(id)), 'Universitetsmatrisen dekker ikke alle obligatoriske basalområder/metodespor');
  assert(coreRows.every((row) => row.required === true && row.current_status && row.completion_requirement), 'Et obligatorisk universitetsområde mangler status eller sluttkrav');
  assert(isDeepStrictEqual(matrix.required_biological_psychology_topics, REQUIRED_BIOLOGICAL_TOPICS), 'Biologisk-psykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_cognitive_psychology_topics, REQUIRED_COGNITIVE_TOPICS), 'Kognitiv-psykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_personality_psychology_topics, REQUIRED_PERSONALITY_TOPICS), 'Personlighetspsykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_methods_statistics_topics, REQUIRED_METHOD_TOPICS), 'Metode-/statistikkmatrisen avviker fra bindende minimum');
  assert(matrix.source_registry_contract?.all_source_ids_must_resolve === true, 'Kildekontrakten må kreve at alle source_ids løses');
  assert(matrix.topic_article_contract?.directory === P.articleDir, 'Emneartikkelkontrakten peker til feil katalog');
  assert(matrix.concept_registry_contract?.path === P.concepts, 'Begrepskontrakten peker til feil register');

  const biologicalBranch = auditPsykologiBiologicalUniversity({ writeReport: false, checkReport: false }).report;
  assert(biologicalBranch.complete, 'University-readiness krever grønn biologisk-psykologi-audit');
  assert(coreById.get('biological_psychology')?.current_artifact === P.biologicalPsychology, 'University-matrisen peker ikke til materialisert biologisk-psykologi-gren');
  const cognitiveBranch = auditPsykologiCognitiveUniversity({ writeReport: false, checkReport: false }).report;
  assert(cognitiveBranch.complete, 'University-readiness krever grønn kognitiv-psykologi-audit');
  assert(coreById.get('cognitive_psychology')?.current_artifact === P.cognitivePsychology, 'University-matrisen peker ikke til materialisert kognitiv-psykologi-gren');
  const personalityBranch = auditPsykologiPersonalityUniversity({ writeReport: false, checkReport: false }).report;
  assert(personalityBranch.complete, 'University-readiness krever grønn personlighetspsykologi-audit');
  assert(coreById.get('personality_psychology')?.current_artifact === P.personalityPsychology, 'University-matrisen peker ikke til materialisert personlighetspsykologi-gren');
  const methodsBranch = auditPsykologiMethodsStatisticsUniversity({ writeReport: false, checkReport: false }).report;
  assert(methodsBranch.complete, 'University-readiness krever grønn metode/statistikk-audit');
  assert(coreById.get('research_methods_statistics')?.current_artifact === P.methodsStatistics, 'University-matrisen peker ikke til materialisert metode/statistikkgren');

  const sourceRegistryResult = sourceRegistry(matrix.source_registry_contract);
  const articleCoverage = topicArticleCoverage(canonicalEmneIds, matrix.topic_article_contract, sourceRegistryResult.validIds);
  const conceptCoverageResult = conceptCoverage(matrix.concept_registry_contract, sourceRegistryResult.validIds);
  const coreComplete = coreRows.every((row) => row.current_status === 'complete');
  const biologicalComplete = coreById.get('biological_psychology')?.current_status === 'complete' && biologicalBranch.complete;
  const cognitiveComplete = coreById.get('cognitive_psychology')?.current_status === 'complete' && cognitiveBranch.complete;
  const personalityComplete = coreById.get('personality_psychology')?.current_status === 'complete' && personalityBranch.complete;
  const methodsComplete = coreById.get('research_methods_statistics')?.current_status === 'complete' && methodsBranch.complete;
  const topicArticlesComplete = articleCoverage.completeCount === 58;
  const conceptsComplete = conceptCoverageResult.exists && conceptCoverageResult.conceptCount > 0 && conceptCoverageResult.materializedCount === conceptCoverageResult.conceptCount;
  const appliedRows = matrix.applied_field_matrix || [];
  const appliedComplete = appliedRows.length >= 6 && appliedRows.every((row) => row.current_status === 'complete');
  const completeReady = coreComplete && biologicalComplete && cognitiveComplete && personalityComplete && methodsComplete && topicArticlesComplete && conceptsComplete && appliedComplete;
  const expectedState = expectedSubjectState(completeReady, matrix.completion_contract);

  assert(matrix.status === expectedState.matrixStatus, `University-readiness status må være ${expectedState.matrixStatus}`);
  assert(statusEntry?.editorialStatus === expectedState.editorialStatus, `Psykologi editorialStatus må være ${expectedState.editorialStatus}`);
  assert(statusEntry?.nextGate === expectedState.nextGate, `Psykologi nextGate må være ${expectedState.nextGate}`);
  assert(registrySubject?.editorialPlan?.nextGate === expectedState.nextGate, `Registry nextGate må være ${expectedState.nextGate}`);

  const blockersToComplete = [];
  for (const row of coreRows.filter((row) => row.current_status !== 'complete')) blockersToComplete.push(`university_core:${row.area_id}:${row.current_status}`);
  if (!topicArticlesComplete) blockersToComplete.push(`standalone_topic_articles:${articleCoverage.completeCount}/58`);
  if (!conceptsComplete) blockersToComplete.push(`canonical_concept_registry:${conceptCoverageResult.materializedCount}/${conceptCoverageResult.conceptCount || 0}`);
  for (const row of appliedRows.filter((row) => row.current_status !== 'complete')) blockersToComplete.push(`applied_field:${row.area_id}:${row.current_status}`);

  const report = {
    schema: 'history_go_fagverk_psykologi_university_readiness_audit_v1',
    version: '1.5.0',
    status: completeReady ? 'psykologi_university_ready_for_complete' : 'psykologi_university_readiness_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: registrySubject.chapters.length },
    baseline: { domainCount: 6, emneCount: 58, methodCount: 58, chapterCount: 6, interpretation: matrix.canonical_baseline.interpretation },
    universityCore: coreRows.map((row) => ({ areaId: row.area_id, label: row.label, status: row.current_status })),
    biologicalPsychology: {
      requiredTopicCount: REQUIRED_BIOLOGICAL_TOPICS.length,
      materializedTopicCount: biologicalBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_BIOLOGICAL_TOPICS,
      sourceCount: biologicalBranch.sources.sourceCount,
      familyCounts: biologicalBranch.coverage.familyCounts,
      auditComplete: biologicalBranch.complete,
      complete: biologicalComplete
    },
    cognitivePsychology: {
      requiredTopicCount: REQUIRED_COGNITIVE_TOPICS.length,
      materializedTopicCount: cognitiveBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_COGNITIVE_TOPICS,
      sourceCount: cognitiveBranch.sources.sourceCount,
      familyCounts: cognitiveBranch.coverage.familyCounts,
      auditComplete: cognitiveBranch.complete,
      complete: cognitiveComplete
    },
    personalityPsychology: {
      requiredTopicCount: REQUIRED_PERSONALITY_TOPICS.length,
      materializedTopicCount: personalityBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_PERSONALITY_TOPICS,
      sourceCount: personalityBranch.sources.sourceCount,
      familyCounts: personalityBranch.coverage.familyCounts,
      auditComplete: personalityBranch.complete,
      complete: personalityComplete
    },
    methodsStatistics: {
      requiredTopicCount: REQUIRED_METHOD_TOPICS.length,
      materializedTopicCount: methodsBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_METHOD_TOPICS,
      sourceCount: methodsBranch.sources.sourceCount,
      familyCounts: methodsBranch.coverage.familyCounts,
      auditComplete: methodsBranch.complete,
      complete: methodsComplete
    },
    topicArticles: {
      requiredCount: 58,
      completeCount: articleCoverage.completeCount,
      invalidSourceReferenceCount: articleCoverage.invalidSourceReferenceCount,
      complete: topicArticlesComplete,
      directory: matrix.topic_article_contract.directory
    },
    concepts: {
      registryPath: matrix.concept_registry_contract.path,
      exists: conceptCoverageResult.exists,
      conceptCount: conceptCoverageResult.conceptCount,
      materializedCount: conceptCoverageResult.materializedCount,
      invalidSourceReferenceCount: conceptCoverageResult.invalidSourceReferenceCount,
      complete: conceptsComplete
    },
    sourceRegistry: { path: matrix.source_registry_contract.path, registeredCount: sourceRegistryResult.registeredCount, validCount: sourceRegistryResult.validIds.size },
    appliedFields: appliedRows.map((row) => ({ areaId: row.area_id, label: row.label, status: row.current_status })),
    blockersToComplete,
    currentGates: {
      canonicalSixDomainBaselineIntact: true,
      all58CanonicalEmnersStillUnique: true,
      sixEditorialChaptersStillRegistered: true,
      authoritativeUniversityMatrixPresent: true,
      fiveCoreAreasHistoryAndMethodsExplicitlyRepresented: true,
      fifteenBiologicalPsychologyCompetenciesPinned: true,
      biologicalPsychologyMaterializedAndAudited: biologicalComplete,
      seventeenCognitivePsychologyCompetenciesPinned: true,
      cognitivePsychologyMaterializedAndAudited: cognitiveComplete,
      sixteenPersonalityPsychologyCompetenciesPinned: true,
      personalityPsychologyMaterializedAndAudited: personalityComplete,
      twentyMethodsStatisticsCompetenciesPinned: true,
      methodsStatisticsMaterializedAndAudited: methodsComplete,
      allRegisteredSourcesInspectable: sourceRegistryResult.registeredCount === sourceRegistryResult.validIds.size,
      subjectNotPrematurelyComplete: statusEntry.editorialStatus === expectedState.editorialStatus && statusEntry.nextGate === expectedState.nextGate
    },
    completionGates: {
      allRequiredUniversityCoreAreasComplete: coreComplete,
      biologicalPsychologyBranchComplete: biologicalComplete,
      cognitivePsychologyBranchComplete: cognitiveComplete,
      personalityPsychologyBranchComplete: personalityComplete,
      researchMethodsStatisticsBranchComplete: methodsComplete,
      all58StandaloneTopicArticlesComplete: topicArticlesComplete,
      canonicalConceptRegistryComplete: conceptsComplete,
      appliedFieldMatrixComplete: appliedComplete
    },
    completeReady
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(projection(report), null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(read(P.report), projection(report)), `${P.report} er utdatert`);
  }
  return { report: projection(report) };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditPsykologiUniversityReadiness({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi university-readiness OK: biologisk ${report.biologicalPsychology.materializedTopicCount}/15; kognitiv ${report.cognitivePsychology.materializedTopicCount}/17; personlighet ${report.personalityPsychology.materializedTopicCount}/16; metode/statistikk ${report.methodsStatistics.materializedTopicCount}/20; emneartikler ${report.topicArticles.completeCount}/58; completeReady=${report.completeReady}.`);
  } catch (error) {
    console.error(`Psykologi university-readiness FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
