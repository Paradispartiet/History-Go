#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/biologisk_psykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-biological-university-audit.json'
});
const REQUIRED_TOPICS = [
  'nerveceller_og_glia','aksjonspotensial_og_synaptisk_kommunikasjon','sentralt_og_perifert_nervesystem',
  'hjernens_systemer_og_nettverk','nevral_utvikling_og_plastisitet','genetikk_arvelighet_og_polygenisitet',
  'gen_miljo_og_epigenetikk','hormoner_og_nevroendokrin_regulering','sanser_og_transduksjon',
  'sovn_og_dognrytmer','homeostase_motivasjon_og_belonning','stress_foleser_og_kroppslig_regulering',
  'psykofarmakologi_og_nevrotransmittersystemer','biologiske_forskningsmetoder','forklaringsnivaer_kausalitet_og_nevroetikk'
];
const REQUIRED_FAMILIES = ['cellular_systems','development_variation','regulation_behavior','methods_inference'];
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({ schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, coverage: report.coverage, sources: report.sources, gates: report.gates, complete: report.complete });

export function auditPsykologiBiologicalUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);
  assert(branch.schema === 'history_go_psykologi_biological_university_v1', 'Feil biologisk-psykologi-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'biological_psychology', 'Biologisk psykologi peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Biologisk psykologi må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_biological_psychology_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende biologisk-psykologi-liste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === REQUIRED_TOPICS.length && uniqueTopicIds.size === REQUIRED_TOPICS.length, 'Biologisk psykologi må ha 15 unike tema');
  assert(exactCoverage, 'Biologisk psykologi må materialisere eksakt de 15 bindende temaene i canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 8 && sourceIds.size === sources.length, 'Biologisk psykologi trenger minst åtte unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.source_location && source.type && source.verified_at && (source.supports || []).length > 0), 'En biologisk kilde har ufullstendig eller ikke-inspiserbar metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 80 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 80 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett biologisk-psykologi-tema mangler innhold, fagskiller, misbruksvern eller gyldig kilde');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] > 0) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Biologisk psykologi mangler en obligatorisk fagfamilie');
  const antiDeterminismComplete = topics.every((topic) => !/(genene bestemmer|hjernen beviser|biologien avgjor)/i.test(`${topic.definition} ${topic.misuse_guard}`)) && topics.some((topic) => /determinist/i.test(topic.misuse_guard));
  assert(antiDeterminismComplete, 'Biologisk psykologi mangler bindende vern mot biologisk determinisme');
  assert(branch.completion_contract?.required_topic_count === REQUIRED_TOPICS.length, 'Completion contract må kreve 15 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.completion_contract?.biological_determinism_guard_required === true, 'Completion contract mangler determinismevern');
  assert(branch.summary?.topic_count === REQUIRED_TOPICS.length && branch.summary?.source_count === sources.length, 'Biologisk-psykologi-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Biologisk-psykologi-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && antiDeterminismComplete && sources.length >= 8;
  const report = {
    schema: 'history_go_fagverk_psykologi_biological_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_biological_university_complete' : 'psykologi_biological_university_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', branchId: branch.branch_id },
    coverage: { requiredTopicCount: REQUIRED_TOPICS.length, materializedTopicCount: topics.length, exactTopicCoverage: exactCoverage, familyCounts },
    sources: { sourceCount: sources.length, allTopicsSourced: topics.every((topic) => topic.source_ids?.length > 0) },
    gates: {
      exact15TopicCoverage: exactCoverage,
      uniqueTopicIds: uniqueTopicIds.size === REQUIRED_TOPICS.length,
      allTopicsHaveDefinitions: topics.every((topic) => topic.definition?.trim().length >= 80),
      allTopicsHaveLearningOutcomes: topics.every((topic) => (topic.learning_outcomes || []).length >= 2),
      allTopicsHaveCriticalDistinctions: topics.every((topic) => (topic.key_distinctions || []).length >= 2),
      allTopicsHaveMisuseGuards: topics.every((topic) => topic.misuse_guard?.trim().length >= 80),
      allTopicsHaveResolvedSources: topics.every((topic) => (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))),
      allRequiredFamiliesCovered: familyCoverageComplete,
      minimumSourceBaseMet: sources.length >= 8,
      biologicalDeterminismGuardPresent: antiDeterminismComplete
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
    const { report } = auditPsykologiBiologicalUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi biologisk universitet OK: ${report.coverage.materializedTopicCount}/15 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi biologisk universitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
