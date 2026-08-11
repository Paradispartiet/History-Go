#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/personlighetspsykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-personality-university-audit.json'
});
const REQUIRED_TOPICS = [
  'personlighet_trekk_og_individforskjeller','big_five_og_hierarkiske_trekkmodeller',
  'alternative_trekkmodeller_og_hexaco','dynamiske_humanistiske_og_narrative_perspektiver',
  'person_situasjon_og_atferdsvariasjon','rangordensstabilitet_og_gjennomsnittsendring',
  'personlighetsutvikling_i_livslopet','identitet_selv_og_personlighet',
  'biologiske_og_genetiske_perspektiver','sosial_laring_mal_og_karakteristiske_tilpasninger',
  'kultur_kontekst_og_personlighetsuttrykk','krysskulturell_ekvivalens_og_mangfold',
  'selvrapport_informantrapport_og_atferdsdata','reliabilitet_validitet_og_maleinvarians',
  'prediksjon_av_utfall_og_usikkerhet','modellkritikk_etikk_og_typestempling'
];
const REQUIRED_FAMILIES = ['structure_models','person_context_development','origins_culture','measurement_inference'];
const REQUIRED_GUARD_TERMS = Object.freeze({
  big_five_og_hierarkiske_trekkmodeller: [/ikke en .*type/i, /kontinuerlige dimensjoner/i],
  person_situasjon_og_atferdsvariasjon: [/situasjon/i, /gjentatte observasjoner/i],
  biologiske_og_genetiske_perspektiver: [/arvelighetsestimat/i, /ikke brukes til/i],
  prediksjon_av_utfall_og_usikkerhet: [/kort observasjon/i, /ikke forutsi en enkeltperson/i],
  modellkritikk_etikk_og_typestempling: [/ikke brukes til å typebestemme/i, /diagnostisere enkeltpersoner/i]
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({ schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, coverage: report.coverage, sources: report.sources, gates: report.gates, complete: report.complete });

export function auditPsykologiPersonalityUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);
  assert(branch.schema === 'history_go_psykologi_personality_university_v1', 'Feil personlighetspsykologi-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'personality_psychology', 'Personlighetspsykologi peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Personlighetspsykologi må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_personality_psychology_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende personlighetspsykologi-liste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === REQUIRED_TOPICS.length && uniqueTopicIds.size === REQUIRED_TOPICS.length, 'Personlighetspsykologi må ha 16 unike tema');
  assert(exactCoverage, 'Personlighetspsykologi må materialisere eksakt de 16 bindende temaene i canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 10 && sourceIds.size === sources.length, 'Personlighetspsykologi trenger minst ti unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.source_location && source.type && source.verified_at && (source.supports || []).length > 0), 'En personlighetspsykologi-kilde har ufullstendig eller ikke-inspiserbar metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 80 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 80 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett personlighetspsykologi-tema mangler innhold, fagskiller, misbruksvern eller gyldig kilde');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] > 0) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Personlighetspsykologi mangler en obligatorisk fagfamilie');

  const byTopicId = new Map(topics.map((topic) => [topic.topic_id, topic]));
  const targetedGuardsComplete = Object.entries(REQUIRED_GUARD_TERMS).every(([topicId, patterns]) => {
    const guard = byTopicId.get(topicId)?.misuse_guard || '';
    return patterns.every((pattern) => pattern.test(guard));
  });
  const noTypingOrDiagnosisClaims = topics.every((topic) => !/(testen avslorer hvem du er|typen bestemmer|kan diagnostiseres fra trekk)/i.test(`${topic.definition} ${topic.misuse_guard}`));
  const responsibleInferenceComplete = targetedGuardsComplete && noTypingOrDiagnosisClaims;
  assert(responsibleInferenceComplete, 'Personlighetspsykologi mangler bindende vern mot typestempling, diagnoseglidning eller individuell overprediksjon');

  assert(branch.completion_contract?.required_topic_count === REQUIRED_TOPICS.length, 'Completion contract må kreve 16 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.completion_contract?.no_personality_typing_guard_required === true, 'Completion contract mangler vern mot personlighetstyping');
  assert(branch.completion_contract?.no_individual_prediction_from_brief_observation_guard_required === true, 'Completion contract mangler vern mot individprediksjon fra korte observasjoner');
  assert(branch.summary?.topic_count === REQUIRED_TOPICS.length && branch.summary?.source_count === sources.length, 'Personlighetspsykologi-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Personlighetspsykologi-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && responsibleInferenceComplete && sources.length >= 10;
  const report = {
    schema: 'history_go_fagverk_psykologi_personality_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_personality_university_complete' : 'psykologi_personality_university_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', branchId: branch.branch_id },
    coverage: { requiredTopicCount: REQUIRED_TOPICS.length, materializedTopicCount: topics.length, exactTopicCoverage: exactCoverage, familyCounts },
    sources: { sourceCount: sources.length, allTopicsSourced: topics.every((topic) => topic.source_ids?.length > 0) },
    gates: {
      exact16TopicCoverage: exactCoverage,
      uniqueTopicIds: uniqueTopicIds.size === REQUIRED_TOPICS.length,
      allTopicsHaveDefinitions: topics.every((topic) => topic.definition?.trim().length >= 80),
      allTopicsHaveLearningOutcomes: topics.every((topic) => (topic.learning_outcomes || []).length >= 2),
      allTopicsHaveCriticalDistinctions: topics.every((topic) => (topic.key_distinctions || []).length >= 2),
      allTopicsHaveMisuseGuards: topics.every((topic) => topic.misuse_guard?.trim().length >= 80),
      allTopicsHaveResolvedSources: topics.every((topic) => (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))),
      allRequiredFamiliesCovered: familyCoverageComplete,
      minimumSourceBaseMet: sources.length >= 10,
      personalityTypingAndDiagnosisGuardPresent: responsibleInferenceComplete,
      briefObservationPredictionGuardPresent: REQUIRED_GUARD_TERMS.prediksjon_av_utfall_og_usikkerhet.every((pattern) => pattern.test(byTopicId.get('prediksjon_av_utfall_og_usikkerhet')?.misuse_guard || ''))
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
    const { report } = auditPsykologiPersonalityUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi personlighetspsykologi universitet OK: ${report.coverage.materializedTopicCount}/16 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi personlighetspsykologi universitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
