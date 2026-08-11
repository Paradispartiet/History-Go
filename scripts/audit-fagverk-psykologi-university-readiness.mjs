#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditPsykologiMethodsStatisticsUniversity } from './audit-fagverk-psykologi-methods-statistics-university.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEXT_GATE = 'university_matrix_topic_articles_concept_registry_and_methods';
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  methodsStatistics: 'data/fag/psykologi/metode_statistikk_psykologi_university_v1.json',
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  emner: 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
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
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function listJson(relativeDir) {
  const dir = abs(relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort().map((file) => `${relativeDir}/${file}`);
}

function topicArticleCoverage(canonicalIds, contract) {
  const files = listJson(contract.directory);
  const valid = new Set();
  for (const file of files) {
    const article = read(file);
    if (!canonicalIds.has(article.emne_id)) continue;
    const complete = contract.required_fields.every((field) => {
      const value = article[field];
      return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null;
    });
    if (complete) valid.add(article.emne_id);
  }
  return { files, validIds: [...valid].sort(), completeCount: valid.size };
}

function conceptCoverage(contract) {
  if (!fs.existsSync(abs(contract.path))) return { exists: false, conceptCount: 0, materializedCount: 0 };
  const doc = read(contract.path);
  const concepts = Array.isArray(doc) ? doc : (doc.concepts || []);
  const materialized = concepts.filter((concept) => contract.required_fields.every((field) => {
    const value = concept[field];
    return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null;
  }));
  return { exists: true, conceptCount: concepts.length, materializedCount: materialized.length };
}

const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  subject: report.subject,
  baseline: report.baseline,
  universityCore: report.universityCore,
  methodsStatistics: report.methodsStatistics,
  topicArticles: report.topicArticles,
  concepts: report.concepts,
  appliedFields: report.appliedFields,
  blockersToComplete: report.blockersToComplete,
  currentGates: report.currentGates,
  completionGates: report.completionGates,
  completeReady: report.completeReady
});

export function auditPsykologiUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.methodsStatistics, P.pensum, P.emner, P.registry, P.status]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const registry = read(P.registry);
  const status = read(P.status);
  const statusEntry = status.subjects.find((row) => row.id === 'psykologi');
  const registrySubject = registry.subjects?.psykologi;

  assert(matrix.schema === 'history_go_psykologi_university_readiness_v1', 'Feil university-readiness schema');
  assert(matrix.subject_id === 'psykologi', 'University-readiness peker til feil fag');
  assert(matrix.status === 'expansion_required_before_complete', 'University-readiness må markere at utvidelse gjenstår');
  assert(matrix.authoritative_sources?.length >= 3, 'University-readiness mangler autoritative program-/retningslinjekilder');
  assert(matrix.authoritative_sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.verified_at), 'University-readiness har ufullstendig kildemetadata');

  const canonicalEmneIds = new Set(pensum.domains.flatMap((domain) => domain.emne_ids || []));
  assert(pensum.summary.domain_count === 6 && pensum.summary.emne_count === 58 && pensum.summary.method_count === 58, 'Canonical Psykologi-baseline er ikke 6/58/58');
  assert(canonicalEmneIds.size === 58 && emner.length === 58 && new Set(emner.map((row) => row.emne_id)).size === 58, 'Canonical emnebaseline må ha 58 unike emner');
  assert(registrySubject?.chapters?.length === 6, 'University-readiness krever bevart sekskapitlers baseline');
  assert(statusEntry?.navigationStatus === 'materialized' && statusEntry?.assessmentStatus === 'audited', 'Psykologi mistet materialized/audited status');
  assert(statusEntry?.editorialStatus === 'expanded_and_audited', 'Psykologi skal stå expanded_and_audited til universitetsporten er grønn');
  assert(statusEntry?.nextGate === NEXT_GATE, 'Psykologi har feil universitetsport');
  assert(registrySubject?.editorialPlan?.nextGate === NEXT_GATE, 'Registry har feil universitetsport');

  const coreRows = matrix.university_core_matrix || [];
  const coreById = new Map(coreRows.map((row) => [row.area_id, row]));
  assert(coreRows.length === REQUIRED_CORE.length && REQUIRED_CORE.every((id) => coreById.has(id)), 'Universitetsmatrisen dekker ikke alle obligatoriske basalområder/metodespor');
  assert(coreRows.every((row) => row.required === true && row.current_status && row.completion_requirement), 'Et obligatorisk universitetsområde mangler status eller sluttkrav');
  assert(isDeepStrictEqual(matrix.required_methods_statistics_topics, REQUIRED_METHOD_TOPICS), 'Metode-/statistikkmatrisen avviker fra bindende minimum');

  const methodsBranch = auditPsykologiMethodsStatisticsUniversity({ writeReport: false, checkReport: false }).report;
  assert(methodsBranch.complete, 'University-readiness krever grønn metode/statistikk-audit');
  assert(coreById.get('research_methods_statistics')?.current_artifact === P.methodsStatistics, 'University-matrisen peker ikke til materialisert metode/statistikkgren');

  const articleCoverage = topicArticleCoverage(canonicalEmneIds, matrix.topic_article_contract);
  const conceptCoverageResult = conceptCoverage(matrix.concept_registry_contract);
  const coreComplete = coreRows.every((row) => row.current_status === 'complete');
  const methodsComplete = coreById.get('research_methods_statistics')?.current_status === 'complete' && methodsBranch.complete;
  const topicArticlesComplete = articleCoverage.completeCount === 58;
  const conceptsComplete = conceptCoverageResult.exists && conceptCoverageResult.conceptCount > 0 && conceptCoverageResult.materializedCount === conceptCoverageResult.conceptCount;
  const appliedRows = matrix.applied_field_matrix || [];
  const appliedComplete = appliedRows.length >= 6 && appliedRows.every((row) => row.current_status === 'complete');
  const completeReady = coreComplete && methodsComplete && topicArticlesComplete && conceptsComplete && appliedComplete;

  const blockersToComplete = [];
  for (const row of coreRows.filter((row) => row.current_status !== 'complete')) blockersToComplete.push(`university_core:${row.area_id}:${row.current_status}`);
  if (!topicArticlesComplete) blockersToComplete.push(`standalone_topic_articles:${articleCoverage.completeCount}/58`);
  if (!conceptsComplete) blockersToComplete.push(`canonical_concept_registry:${conceptCoverageResult.materializedCount}/${conceptCoverageResult.conceptCount || 0}`);
  for (const row of appliedRows.filter((row) => row.current_status !== 'complete')) blockersToComplete.push(`applied_field:${row.area_id}:${row.current_status}`);

  assert(completeReady || statusEntry.editorialStatus !== 'complete', 'Psykologi kan ikke stå complete før alle universitetsporter er grønne');
  const report = {
    schema: 'history_go_fagverk_psykologi_university_readiness_audit_v1',
    version: '1.1.0',
    status: completeReady ? 'psykologi_university_ready_for_complete' : 'psykologi_university_readiness_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: registrySubject.chapters.length },
    baseline: { domainCount: 6, emneCount: 58, methodCount: 58, chapterCount: 6, interpretation: matrix.canonical_baseline.interpretation },
    universityCore: coreRows.map((row) => ({ areaId: row.area_id, label: row.label, status: row.current_status })),
    methodsStatistics: {
      requiredTopicCount: REQUIRED_METHOD_TOPICS.length,
      materializedTopicCount: methodsBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_METHOD_TOPICS,
      sourceCount: methodsBranch.sources.sourceCount,
      familyCounts: methodsBranch.coverage.familyCounts,
      auditComplete: methodsBranch.complete,
      complete: methodsComplete
    },
    topicArticles: { requiredCount: 58, completeCount: articleCoverage.completeCount, complete: topicArticlesComplete, directory: matrix.topic_article_contract.directory },
    concepts: { registryPath: matrix.concept_registry_contract.path, exists: conceptCoverageResult.exists, conceptCount: conceptCoverageResult.conceptCount, materializedCount: conceptCoverageResult.materializedCount, complete: conceptsComplete },
    appliedFields: appliedRows.map((row) => ({ areaId: row.area_id, label: row.label, status: row.current_status })),
    blockersToComplete,
    currentGates: {
      canonicalSixDomainBaselineIntact: true,
      all58CanonicalEmnersStillUnique: true,
      sixEditorialChaptersStillRegistered: true,
      authoritativeUniversityMatrixPresent: true,
      fiveCoreAreasHistoryAndMethodsExplicitlyRepresented: true,
      twentyMethodsStatisticsCompetenciesPinned: true,
      methodsStatisticsMaterializedAndAudited: methodsComplete,
      subjectNotPrematurelyComplete: !completeReady && statusEntry.editorialStatus === 'expanded_and_audited'
    },
    completionGates: {
      allRequiredUniversityCoreAreasComplete: coreComplete,
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
    console.log(`Psykologi university-readiness OK: metode/statistikk ${report.methodsStatistics.materializedTopicCount}/20; emneartikler ${report.topicArticles.completeCount}/58; completeReady=${report.completeReady}.`);
  } catch (error) {
    console.error(`Psykologi university-readiness FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
