#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/religion/religion_university_readiness_v1.json',
  emners: 'data/fag/religion/emner_religion_canonical_v1.json',
  methods: 'data/fag/religion/methods_religion_canonical_v1.json',
  fagkart: 'data/fag/religion/fagkart_religion_canonical_v1.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/religion-university-readiness-audit.json'
});
const STATUS_NEXT_GATE = 'remaining_religion_area_article_production';
const COMPLETION_NEXT_GATE = 'university_matrix_domain_articles_concepts_sources_and_methods';
const REQUIRED_AREA_IDS = Object.freeze([
  'theory_method',
  'history_comparison',
  'west_asian_abrahamic',
  'south_asian_religions',
  'east_asian_religions',
  'indigenous_sami',
  'ritual_materiality_space',
  'texts_myths_authority',
  'society_politics_law',
  'lived_identity_migration',
  'secular_new_media',
  'nature_science_ethics'
]);
const abs = (relativePath) => path.join(ROOT, relativePath);
const json = (relativePath) => JSON.parse(fs.readFileSync(abs(relativePath), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    baseline: report.baseline,
    target: report.target,
    gaps: report.gaps,
    authoritativeSourceIds: report.authoritativeSourceIds,
    areaStatuses: report.areaStatuses,
    gates: report.gates
  };
}

export function auditReligionUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  const readiness = json(P.readiness);
  const emners = json(P.emners);
  const methods = json(P.methods);
  const fagkart = json(P.fagkart);
  const statuses = json(P.status);
  const statusEntry = statuses.subjects.find((row) => row.id === 'religion');

  assert(readiness.schema === 'history_go_religion_university_readiness_v1', 'Religion har feil readiness-schema');
  assert(readiness.subject_id === 'religion', 'Readiness-matrisen har feil subject_id');
  assert(readiness.status === 'matrix_locked_production_in_progress', 'Religion readiness skal vise låst og pågående produksjon');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Religion skal stå chapters_in_progress etter to områder');
  assert(statusEntry?.nextGate === STATUS_NEXT_GATE, 'Religion skal fortsette gjennom den registrerte kapittelproduksjonsporten');

  const baseline = readiness.canonical_baseline;
  assert(baseline.domain_count === fagkart.categories.length, 'Baseline domain_count avviker fra fagkartet');
  assert(baseline.emne_count === emners.filter((row) => row.status === 'active').length, 'Baseline emne_count avviker fra aktive emner');
  assert(baseline.method_count === baseline.method_ids.length, 'Baseline method_count avviker fra låste foundation-metoder');
  assert(baseline.method_ids.every((id) => methods.methods.some((row) => row.method_id === id && row.canonical_status === 'canonical')), 'En låst foundation-metode mangler');
  assert(baseline.registered_chapter_count === 0, 'Religion-baselinen kan ikke late som kapitler finnes');
  assert(baseline.classification === 'structure_ready', 'Religion-baselinen har feil klassifisering');

  assert(readiness.authoritative_sources.length >= 4, 'Religion trenger minst fire autoritative universitetskilder');
  assert(readiness.authoritative_sources.every((source) => /^https:\/\//.test(source.url)), 'Alle readiness-kilder må bruke HTTPS');
  assert(readiness.authoritative_sources.every((source) => source.verified_at === '2026-08-13'), 'Readiness-kildene mangler verifikasjonsdato');
  assert(new Set(readiness.authoritative_sources.map((source) => source.publisher)).size >= 4, 'Readiness-kildene må komme fra minst fire universitetsutgivere');

  const matrix = readiness.university_core_matrix;
  assert(matrix.length === REQUIRED_AREA_IDS.length, 'Religion skal ha tolv universitetskjerneområder');
  assert(isDeepStrictEqual(matrix.map((row) => row.area_id), REQUIRED_AREA_IDS), 'Religion har feil canonical områderekkefølge');
  assert(matrix.every((row) => row.required === true), 'Alle universitetskjerneområder skal være obligatoriske');
  assert(matrix.every((row) => ['missing', 'partial', 'complete'].includes(row.current_status)), 'Ugyldig områdestatus i Religion-matrisen');
  assert(matrix.every((row) => row.completion_requirement.length >= 90), 'Et område mangler en konkret completion_requirement');

  const topicMap = readiness.required_topics_by_area;
  assert(isDeepStrictEqual(Object.keys(topicMap), REQUIRED_AREA_IDS), 'Topic-matrisen har feil områder eller rekkefølge');
  assert(REQUIRED_AREA_IDS.every((id) => topicMap[id].length === 6), 'Hvert Religion-område skal ha seks canonicale emner');
  const topicIds = Object.values(topicMap).flat();
  assert(topicIds.length === 72, 'Religion skal ha 72 canonicale emner');
  assert(new Set(topicIds).size === topicIds.length, 'Religion har dupliserte canonicale emne-ID-er');
  assert(topicIds.every((id) => /^[a-z0-9_]+$/.test(id)), 'Religion har ustabil emne-ID');

  assert(readiness.required_method_ids.length === 18, 'Religion skal ha 18 påkrevde universitetsmetoder');
  assert(new Set(readiness.required_method_ids).size === 18, 'Religion har dupliserte metode-ID-er');
  assert(readiness.required_method_ids.every((id) => id.startsWith('met_religion_')), 'Religion har metode-ID uten canonicalt prefiks');

  const progress = readiness.production_progress;
  assert(isDeepStrictEqual(progress.completed_area_ids, ['theory_method', 'history_comparison', 'west_asian_abrahamic']), 'De tre første produksjonsområdene er ikke låst som komplette');
  assert(isDeepStrictEqual(progress.materialized_topic_ids, [...topicMap.theory_method, ...topicMap.history_comparison, ...topicMap.west_asian_abrahamic]), 'Produksjonsprogresjonen har feil emne-ID-er');
  assert(progress.standalone_topic_articles_materialized === 18 && progress.standalone_topic_articles_remaining === 54, 'Religion skal stå på 18/72 artikler');
  assert(progress.required_methods_materialized === 12 && progress.required_methods_remaining === 6, 'Religion skal stå på 12/18 universitetsmetoder');
  assert(progress.materialized_required_method_ids.every((id) => readiness.required_method_ids.includes(id) && methods.methods.some((method) => method.method_id === id && method.university_matrix_status === 'materialized')), 'En materialisert universitetsmetode er uløst');
  assert(progress.quality_score >= 27 && progress.complete_ready === false, 'Produksjonsprogresjonen har feil kvalitets- eller complete-status');

  const articleContract = readiness.topic_article_contract;
  assert(articleContract.canonical_topic_count === 72, 'Artikkelkontrakten har feil emnetall');
  assert(articleContract.minimum_editorial_words_per_article >= 650, 'Artikkelkontrakten er for kort for universitetsnær dybde');
  assert(articleContract.minimum_documented_cases_or_scenarios >= 2, 'Hver artikkel må ha minst to case eller scenarioer');
  for (const field of ['definition', 'historical_or_systemic_background', 'theories_researchers_and_findings', 'methods_and_limitations', 'boundaries_and_disagreements', 'source_ids', 'claim_ids', 'quality_review']) {
    assert(articleContract.required_fields.includes(field), `Artikkelkontrakten mangler ${field}`);
  }
  assert(articleContract.generic_template_text_forbidden === true, 'Generisk maltekst må være forbudt');
  assert(articleContract.internal_diversity_and_nonessentialism_required === true, 'Religion krever eksplisitt vern mot essensialisering');

  const completion = readiness.completion_contract;
  assert(completion.current_complete_ready === false, 'Religion kan ikke være completeReady før produksjon');
  assert(completion.complete_must_remain_false_until_all_requirements_pass === true, 'Complete-status er ikke låst til alle krav');
  assert(completion.next_gate === COMPLETION_NEXT_GATE, 'Completion-kontrakten har feil nextGate');
  assert(completion.requirements.includes('all_72_standalone_topic_articles_materialized_and_sourced'), 'Completion mangler 72-artikkelporten');
  assert(completion.requirements.includes('six_dimension_quality_score_at_least_27_without_critical_flags'), 'Completion mangler seksdelt kvalitetsport');

  const completeAreaCount = matrix.filter((row) => row.current_status === 'complete').length;
  const partialAreaCount = matrix.filter((row) => row.current_status === 'partial').length;
  const missingAreaCount = matrix.filter((row) => row.current_status === 'missing').length;
  const report = {
    schema: 'history_go_fagverk_religion_university_readiness_audit_v1',
    version: '1.0.0',
    status: 'religion_university_matrix_locked_production_in_progress',
    generatedFrom: P,
    subject: {
      id: 'religion',
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate,
      completionGate: completion.next_gate,
      completeReady: false
    },
    baseline: {
      domainCount: baseline.domain_count,
      emneCount: baseline.emne_count,
      methodCount: baseline.method_count,
      registeredChapterCount: baseline.registered_chapter_count
    },
    target: {
      universityAreaCount: matrix.length,
      canonicalTopicCount: topicIds.length,
      requiredMethodCount: readiness.required_method_ids.length,
      minimumArticleWords: articleContract.minimum_editorial_words_per_article
    },
    gaps: {
      completeAreaCount,
      partialAreaCount,
      missingAreaCount,
      standaloneTopicArticlesMaterialized: progress.standalone_topic_articles_materialized,
      standaloneTopicArticlesRemaining: progress.standalone_topic_articles_remaining,
      universityMethodsMaterialized: progress.required_methods_materialized,
      universityMethodsRemaining: progress.required_methods_remaining
    },
    authoritativeSourceIds: readiness.authoritative_sources.map((source) => source.id),
    areaStatuses: Object.fromEntries(matrix.map((row) => [row.area_id, row.current_status])),
    gates: {
      baselineMatchesCanonicalSources: true,
      fourUniversityBenchmarksResolved: true,
      twelveCoreAreasLocked: true,
      seventyTwoUniqueTopicsLocked: true,
      eighteenUniversityMethodsLocked: true,
      topicArticleQualityContractLocked: true,
      respectfulRepresentationAndNonessentialismLocked: true,
      sixDimensionQualityGateLocked: true,
      prematureCompleteStatusBlocked: true,
      firstThreeUniversityAreasCompleteAtHighQuality: progress.quality_score >= 27
    }
  };
  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, readiness };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditReligionUniversityReadiness({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Religion-universitetsmatrise OK: ${report.target.universityAreaCount} områder, ${report.target.canonicalTopicCount} emner og ${report.target.requiredMethodCount} metoder; completeReady=false.`);
  } catch (error) {
    console.error(`Religion-universitetsmatrise FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
