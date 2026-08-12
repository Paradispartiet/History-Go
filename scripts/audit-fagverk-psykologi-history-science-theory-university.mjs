#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/psykologiens_historie_vitenskapsteori_university_v1.json',
  report: 'reports/fagverk/psykologi-history-science-theory-university-audit.json'
});
const REQUIRED_TOPICS = [
  'filosofiske_medisinske_og_fysiologiske_forlopere','psykofysikk_eksperiment_og_laboratoriets_institusjonalisering',
  'evolusjon_funksjonalisme_og_individforskjeller','profesjonalisering_klinisk_og_anvendt_psykologi',
  'psykologi_i_norge_utdanning_institusjoner_og_profesjon','strukturalisme_introspeksjon_og_gestaltpsykologi',
  'psykoanalyse_psykodynamikk_og_fortolkning','behaviorisme_laring_og_observerbar_atferd',
  'den_kognitive_vendingen_informasjon_og_representasjon','humanistisk_sosial_kulturell_og_kritisk_psykologi',
  'teorier_modeller_paradigmer_og_forskningsprogrammer','forklaringsnivaer_mekanismer_reduksjonisme_og_pluralisme',
  'psykologiske_konstrukter_operasjonalisering_og_validitet','kausalitet_sannsynlighet_prediksjon_og_forklaring',
  'objektivitet_verdier_refleksivitet_og_situert_kunnskap','kvantitative_kvalitative_og_blandede_metoder',
  'observasjon_teoriladet_evidens_falsifikasjon_og_bekreftelse','replikasjon_apen_vitenskap_og_kumulativ_evidens',
  'forskningsetikk_profesjonsetikk_klassifikasjon_og_makt','historiografi_presentisme_kontekst_mangfold_og_kildekritikk'
];
const REQUIRED_FAMILIES = ['origins_institutions','schools_turns','science_theory_explanation_measurement','evidence_ethics_historiography'];
const REQUIRED_GUARD_TERMS = Object.freeze({
  filosofiske_medisinske_og_fysiologiske_forlopere: [/kan ikke brukes til retrospektiv diagnose/i, /ikke at historiske og moderne begreper har samme innhold/i],
  psykofysikk_eksperiment_og_laboratoriets_institusjonalisering: [/ikke at én mann skapte all psykologi/i, /enkel fremskrittsstige/i],
  evolusjon_funksjonalisme_og_individforskjeller: [/legitimerer ikke rangering av menneskegrupper/i, /eugenikk/i],
  psykoanalyse_psykodynamikk_og_fortolkning: [/kan ikke brukes til retrospektiv diagnose/i, /innflytelse og klinisk bruk beviser ikke alle teoripåstander/i],
  teorier_modeller_paradigmer_og_forskningsprogrammer: [/ikke brukes som merkelapp på enhver faglig uenighet/i, /ikke en komplett kopi av mennesket/i],
  forklaringsnivaer_mekanismer_reduksjonisme_og_pluralisme: [/ikke en full årsaksforklaring på personen/i, /forbindelser må støttes empirisk/i],
  psykologiske_konstrukter_operasjonalisering_og_validitet: [/ikke en diagnose eller identitet/i, /validitet tilhører den begrunnede tolkningen og bruken/i],
  kausalitet_sannsynlighet_prediksjon_og_forklaring: [/god prediksjon beviser ikke årsak eller forståelse/i, /bestemmer ikke individets utfall/i],
  objektivitet_verdier_refleksivitet_og_situert_kunnskap: [/betyr ikke at fakta er valgfrie/i, /empirisk motstand/i],
  kvantitative_kvalitative_og_blandede_metoder: [/ikke bare anekdote/i, /ikke automatisk objektive/i],
  observasjon_teoriladet_evidens_falsifikasjon_og_bekreftelse: [/dreper ikke automatisk en teori/i, /effektstørrelse og konkurrerende forklaringer/i],
  replikasjon_apen_vitenskap_og_kumulativ_evidens: [/beviser ikke alene at et fenomen ikke finnes/i, /gjør ikke effekten universell/i],
  forskningsetikk_profesjonsetikk_klassifikasjon_og_makt: [/ikke oppskrifter som kan gjentas/i, /historisk kontekst unnskylder ikke skade/i],
  historiografi_presentisme_kontekst_mangfold_og_kildekritikk: [/ikke moralsk frikjennelse/i, /aktiv leting etter utelatte aktører/i]
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({ schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, coverage: report.coverage, sources: report.sources, gates: report.gates, complete: report.complete });

export function auditPsykologiHistoryScienceTheoryUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);
  assert(branch.schema === 'history_go_psykologi_history_science_theory_university_v1', 'Feil historie-/vitenskapsteori-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'history_science_theory', 'Historie/vitenskapsteori peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Historie/vitenskapsteori må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_history_science_theory_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende historie-/vitenskapsteori-liste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === REQUIRED_TOPICS.length && uniqueTopicIds.size === REQUIRED_TOPICS.length, 'Historie/vitenskapsteori må ha 20 unike tema');
  assert(exactCoverage, 'Historie/vitenskapsteori må materialisere eksakt de 20 bindende temaene i canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 20 && sourceIds.size === sources.length, 'Historie/vitenskapsteori trenger minst tjue unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.source_location && source.type && source.verified_at && (source.supports || []).length > 0), 'En historie-/vitenskapsteori-kilde har ufullstendig eller ikke-inspiserbar metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 80 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 80 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett historie-/vitenskapsteori-tema mangler innhold, fagskiller, misbruksvern eller gyldig kilde');
  const usedSourceIds = new Set(topics.flatMap((topic) => topic.source_ids || []));
  const allSourcesUsed = sources.every((source) => usedSourceIds.has(source.source_id));
  assert(allSourcesUsed, 'Historie/vitenskapsteori har en registrert kilde som ikke brukes av noe tema');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] === 5) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Historie/vitenskapsteori må ha eksakt fem tema i hver obligatoriske fagfamilie');

  const byTopicId = new Map(topics.map((topic) => [topic.topic_id, topic]));
  const targetedGuardsComplete = Object.entries(REQUIRED_GUARD_TERMS).every(([topicId, patterns]) => {
    const guard = byTopicId.get(topicId)?.misuse_guard || '';
    return patterns.every((pattern) => pattern.test(guard));
  });
  const noHistoryOrScienceTheoryOverreach = topics.every((topic) => !/(historien beviser at teorien er sann|skåren er konstruktet|hjernefunnet forklarer hele personen|én studie falsifiserer endelig|historisk diagnose er sikker|verdier gjør fakta valgfrie)/i.test(`${topic.definition} ${topic.misuse_guard}`));
  const responsibleInferenceComplete = targetedGuardsComplete && noHistoryOrScienceTheoryOverreach;
  assert(responsibleInferenceComplete, 'Historie/vitenskapsteori mangler bindende vern mot retrospektiv diagnose, lineær kanon, reduksjonisme eller evidensoverreach');

  assert(branch.completion_contract?.required_topic_count === REQUIRED_TOPICS.length, 'Completion contract må kreve 20 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.completion_contract?.no_retrospective_diagnosis_or_person_label_from_historical_material_required === true, 'Completion contract mangler vern mot retrospektiv diagnose');
  assert(branch.completion_contract?.no_single_origin_progress_ladder_or_school_as_total_psychology_required === true, 'Completion contract mangler vern mot lineær skolekanon');
  assert(branch.completion_contract?.no_measurement_prediction_or_neural_correlate_as_complete_explanation_required === true, 'Completion contract mangler vern mot måle- og reduksjonismeoverreach');
  assert(branch.completion_contract?.historical_context_values_replication_and_ethics_limits_required === true, 'Completion contract mangler krav om kontekst, verdier, replikasjon og etikk');
  assert(branch.summary?.topic_count === REQUIRED_TOPICS.length && branch.summary?.source_count === sources.length, 'Historie-/vitenskapsteori-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Historie-/vitenskapsteori-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && responsibleInferenceComplete && sources.length >= 20;
  const report = {
    schema: 'history_go_fagverk_psykologi_history_science_theory_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_history_science_theory_university_complete' : 'psykologi_history_science_theory_university_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', branchId: branch.branch_id },
    coverage: { requiredTopicCount: REQUIRED_TOPICS.length, materializedTopicCount: topics.length, exactTopicCoverage: exactCoverage, familyCounts },
    sources: { sourceCount: sources.length, allTopicsSourced: topics.every((topic) => topic.source_ids?.length > 0) },
    gates: {
      exact20TopicCoverage: exactCoverage,
      uniqueTopicIds: uniqueTopicIds.size === REQUIRED_TOPICS.length,
      allTopicsHaveDefinitions: topics.every((topic) => topic.definition?.trim().length >= 80),
      allTopicsHaveLearningOutcomes: topics.every((topic) => (topic.learning_outcomes || []).length >= 2),
      allTopicsHaveCriticalDistinctions: topics.every((topic) => (topic.key_distinctions || []).length >= 2),
      allTopicsHaveMisuseGuards: topics.every((topic) => topic.misuse_guard?.trim().length >= 80),
      allTopicsHaveResolvedSources: topics.every((topic) => (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))),
      everyRegisteredSourceUsed: allSourcesUsed,
      fourFamiliesHaveFiveTopicsEach: familyCoverageComplete,
      minimumSourceBaseMet: sources.length >= 20,
      noRetrospectiveDiagnosisOrPersonLabel: responsibleInferenceComplete,
      noSingleOriginProgressLadderOrTotalSchool: REQUIRED_GUARD_TERMS.psykofysikk_eksperiment_og_laboratoriets_institusjonalisering.every((pattern) => pattern.test(byTopicId.get('psykofysikk_eksperiment_og_laboratoriets_institusjonalisering')?.misuse_guard || '')),
      noMeasurementPredictionOrNeuralCorrelateAsCompleteExplanation: ['forklaringsnivaer_mekanismer_reduksjonisme_og_pluralisme','psykologiske_konstrukter_operasjonalisering_og_validitet','kausalitet_sannsynlighet_prediksjon_og_forklaring'].every((topicId) => REQUIRED_GUARD_TERMS[topicId].every((pattern) => pattern.test(byTopicId.get(topicId)?.misuse_guard || ''))),
      historicalContextValuesReplicationAndEthicsLimitsPresent: ['objektivitet_verdier_refleksivitet_og_situert_kunnskap','replikasjon_apen_vitenskap_og_kumulativ_evidens','forskningsetikk_profesjonsetikk_klassifikasjon_og_makt','historiografi_presentisme_kontekst_mangfold_og_kildekritikk'].every((topicId) => REQUIRED_GUARD_TERMS[topicId].every((pattern) => pattern.test(byTopicId.get(topicId)?.misuse_guard || '')))
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
    const { report } = auditPsykologiHistoryScienceTheoryUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi historie/vitenskapsteori universitet OK: ${report.coverage.materializedTopicCount}/20 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi historie/vitenskapsteori universitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
