#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/metode_statistikk_psykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-methods-statistics-university-audit.json'
});
const REQUIRED_TOPICS = [
  'eksperimentelt_design','observasjon','korrelasjon','longitudinelt_design','tverrsnittdesign','kvalitativ_metode',
  'utvalg_og_representativitet','operasjonalisering','reliabilitet','validitet','deskriptiv_statistikk','statistisk_inferens',
  'hypotesetesting','effektstorrelse','konfidensintervall_og_usikkerhet','regresjon','kausalitet_og_konfundering',
  'replikasjon','apen_vitenskap','forskningsetikk'
];
const REQUIRED_FAMILIES = ['design','sampling_measurement','statistics','inference_integrity'];
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  subject: report.subject,
  coverage: report.coverage,
  sources: report.sources,
  gates: report.gates,
  complete: report.complete
});

export function auditPsykologiMethodsStatisticsUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);

  assert(branch.schema === 'history_go_psykologi_methods_statistics_university_v1', 'Feil metode/statistikk-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'research_methods_statistics', 'Metode/statistikk peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Metode/statistikkgrenen må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_methods_statistics_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende 20-punktsliste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === 20 && uniqueTopicIds.size === 20, 'Metode/statistikk må ha 20 unike tema');
  assert(exactCoverage, 'Metode/statistikk må materialisere eksakt de 20 bindende temaene i riktig canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 6 && sourceIds.size === sources.length, 'Metode/statistikk trenger minst seks unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && (source.supports || []).length > 0), 'En metode/statistikk-kilde har ufullstendig metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 60 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 50 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett metode/statistikk-tema mangler faglig innhold, fagskiller, misbruksvern eller gyldig kilde');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] > 0) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Metode/statistikk mangler en obligatorisk metodefamilie');
  assert(branch.completion_contract?.required_topic_count === 20, 'Completion contract må kreve 20 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.summary?.topic_count === 20 && branch.summary?.source_count === sources.length, 'Metode/statistikk-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Metode/statistikk-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && sources.length >= 6;
  const report = {
    schema: 'history_go_fagverk_psykologi_methods_statistics_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_methods_statistics_university_complete' : 'psykologi_methods_statistics_university_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', branchId: branch.branch_id },
    coverage: { requiredTopicCount: 20, materializedTopicCount: topics.length, exactTopicCoverage: exactCoverage, familyCounts },
    sources: { sourceCount: sources.length, allTopicsSourced: topics.every((topic) => topic.source_ids?.length > 0) },
    gates: {
      exact20TopicCoverage: exactCoverage,
      uniqueTopicIds: uniqueTopicIds.size === 20,
      allTopicsHaveDefinitions: topics.every((topic) => topic.definition?.trim().length >= 60),
      allTopicsHaveLearningOutcomes: topics.every((topic) => (topic.learning_outcomes || []).length >= 2),
      allTopicsHaveCriticalDistinctions: topics.every((topic) => (topic.key_distinctions || []).length >= 2),
      allTopicsHaveMisuseGuards: topics.every((topic) => topic.misuse_guard?.trim().length >= 50),
      allTopicsHaveResolvedSources: topics.every((topic) => (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))),
      allRequiredFamiliesCovered: familyCoverageComplete,
      minimumSourceBaseMet: sources.length >= 6
    },
    complete
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
    const { report } = auditPsykologiMethodsStatisticsUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi metode/statistikk OK: ${report.coverage.materializedTopicCount}/20 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi metode/statistikk FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
