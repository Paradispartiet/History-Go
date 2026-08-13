#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/religion/religion_university_readiness_v1.json',
  methods: 'data/fag/religion/methods_religion_canonical_v1.json',
  sourceRegistry: 'data/fag/religion/kilder_religion_canonical_v1.json',
  concepts: 'data/fag/religion/begreper_religion_canonical_v1.json',
  articleDir: 'data/fagverk/religion/emneartikler',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/religion-university-completion-v1-audit.json'
});
const FINAL_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const QUALITY_DIMENSIONS = Object.freeze([
  'correctness_evidence', 'coverage_completion', 'editorial_quality',
  'technical_integrity', 'safety_responsibility', 'maintainability_auditability'
]);
const abs = (relative) => path.join(ROOT, relative);
const read = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const wordCount = (value) => {
  if (typeof value === 'string') return value.trim() ? value.trim().split(/\s+/).length : 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + wordCount(item), 0);
  if (value && typeof value === 'object') return Object.values(value).reduce((sum, item) => sum + wordCount(item), 0);
  return 0;
};
const editorialPayload = (article) => ({
  definition: article.definition,
  historical_or_systemic_background: article.historical_or_systemic_background,
  theories_researchers_and_findings: article.theories_researchers_and_findings,
  methods_and_limitations: article.methods_and_limitations,
  boundaries_and_disagreements: article.boundaries_and_disagreements,
  documented_cases_or_teaching_scenarios: article.documented_cases_or_teaching_scenarios,
  key_questions: article.key_questions,
  representation_guard: article.representation_guard
});
const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  coverage: report.coverage,
  concepts: report.concepts,
  evidence: report.evidence,
  quality: report.quality,
  gates: report.gates,
  complete: report.complete
});

function evidenceIndex(registry) {
  const sourceIds = new Set();
  const claimIds = new Set();
  let sourceRegistrationCount = 0;
  let claimRegistrationCount = 0;
  for (const source of registry.sources || []) {
    sourceIds.add(source.id);
    sourceRegistrationCount += 1;
  }
  for (const file of registry.source_documents || []) {
    assert(fs.existsSync(abs(file)), `Mangler evidensdokument ${file}`);
    const document = read(file);
    for (const source of document.sources || []) {
      assert(!sourceIds.has(source.id), `Duplisert source_id ${source.id}`);
      sourceIds.add(source.id);
      sourceRegistrationCount += 1;
    }
    for (const claim of document.claims || []) {
      assert(!claimIds.has(claim.id), `Duplisert claim_id ${claim.id}`);
      claimIds.add(claim.id);
      claimRegistrationCount += 1;
    }
  }
  return { sourceIds, claimIds, sourceRegistrationCount, claimRegistrationCount };
}

export function auditReligionUniversityCompletion({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.readiness, P.methods, P.sourceRegistry, P.concepts, P.status]) {
    assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  }
  const readiness = read(P.readiness);
  const methods = read(P.methods);
  const registry = read(P.sourceRegistry);
  const conceptsDoc = read(P.concepts);
  const statuses = read(P.status);
  const status = statuses.subjects.find((row) => row.id === 'religion');
  const expectedAreas = Object.keys(readiness.required_topics_by_area || {});
  const expectedTopics = expectedAreas.flatMap((areaId) => readiness.required_topics_by_area[areaId]);
  const expectedAreaByTopic = new Map(expectedAreas.flatMap((areaId) => readiness.required_topics_by_area[areaId].map((topicId) => [topicId, areaId])));

  assert(expectedAreas.length === 12, 'Religion skal ha eksakt 12 universitetsområder');
  assert(expectedTopics.length === 72 && new Set(expectedTopics).size === 72, 'Religion skal ha eksakt 72 unike canonicale emner');
  assert(readiness.university_core_matrix.length === 12 && readiness.university_core_matrix.every((row) => row.current_status === 'complete'), 'Alle 12 universitetsområder må være complete');
  assert(readiness.production_progress.standalone_topic_articles_materialized === 72 && readiness.production_progress.standalone_topic_articles_remaining === 0, 'Religion skal ha 72/72 artikler');
  assert(readiness.production_progress.required_methods_materialized === 18 && readiness.production_progress.required_methods_remaining === 0, 'Religion skal ha 18/18 universitetsmetoder');
  assert(readiness.production_progress.quality_score >= 27, 'Religion består ikke kvalitetsporten');
  assert(readiness.status === 'university_completion_complete', 'Readiness er ikke flyttet til sluttstatus');
  assert(readiness.production_progress.complete_ready === true && readiness.completion_contract.current_complete_ready === true, 'Religion er ikke completeReady');
  assert(readiness.completion_contract.next_gate === FINAL_GATE, 'Religion har feil vedlikeholdsport');
  assert(status?.editorialStatus === 'complete' && status?.nextGate === FINAL_GATE, 'Subject status er ikke complete');

  const methodById = new Map((methods.methods || []).map((method) => [method.method_id, method]));
  assert(readiness.required_method_ids.length === 18 && new Set(readiness.required_method_ids).size === 18, 'Metodekravet er ikke eksakt 18');
  assert(readiness.required_method_ids.every((id) => methodById.get(id)?.university_matrix_status === 'materialized'), 'En påkrevd universitetsmetode er ikke materialisert');

  assert(conceptsDoc.schema === 'history_go_religion_concept_registry_v1' && conceptsDoc.subject_id === 'religion', 'Begrepsregisteret har feil schema eller fag');
  assert(conceptsDoc.status === 'complete' && conceptsDoc.materialization_mode === 'article_backed_canonical_concepts', 'Begrepsregisteret er ikke komplett article-backed');
  assert(conceptsDoc.concept_count === 72 && (conceptsDoc.concepts || []).length === 72, 'Begrepsregisteret skal ha 72 materialiserte poster');
  assert(isDeepStrictEqual(conceptsDoc.concept_ids_by_area, readiness.required_topics_by_area), 'Begrepsregisteret avviker fra canonical required_topics_by_area');
  const conceptById = new Map(conceptsDoc.concepts.map((concept) => [concept.concept_id, concept]));
  assert(conceptById.size === 72 && expectedTopics.every((id) => conceptById.has(id)), 'Begrepsregisteret dekker ikke eksakt 72/72 canonicale IDs');

  const { sourceIds, claimIds, sourceRegistrationCount, claimRegistrationCount } = evidenceIndex(registry);
  const actualArticleFiles = fs.readdirSync(abs(P.articleDir)).filter((file) => file.endsWith('.json')).sort();
  const expectedArticleFiles = expectedTopics.map((id) => `${id}.json`).sort();
  assert(isDeepStrictEqual(actualArticleFiles, expectedArticleFiles), 'Artikkelkatalogen må inneholde eksakt én fil for hvert av 72 canonicale emner');

  const usedSourceIds = new Set();
  const usedClaimIds = new Set();
  const articleWordCounts = {};
  const articleQualityTotals = {};
  for (const topicId of expectedTopics) {
    const concept = conceptById.get(topicId);
    const expectedPath = `${P.articleDir}/${topicId}.json`;
    assert(concept.area_id === expectedAreaByTopic.get(topicId), `${topicId}: begrepspost har feil area_id`);
    assert(concept.article_path === expectedPath, `${topicId}: begrepspost peker til feil artikkel`);
    assert(concept.editorial_status === 'canonical_article_backed', `${topicId}: begrepspost mangler canonical status`);
    assert(isDeepStrictEqual(concept.field_bindings, {
      label: 'title', definition: 'definition', source_ids: 'source_ids', claim_ids: 'claim_ids',
      representation_guard: 'representation_guard', quality_review: 'quality_review'
    }), `${topicId}: begrepspost har feil feltbindinger`);

    const article = read(expectedPath);
    assert(article.schema === 'history_go_religion_topic_article_v1' && article.subject_id === 'religion' && article.article_status === 'complete', `${topicId}: artikkelen har feil schema/status`);
    assert(article.topic_id === topicId && article.area_id === concept.area_id, `${topicId}: artikkelidentitet avviker fra begrepsregisteret`);
    assert(typeof article.title === 'string' && article.title.trim().length >= 4, `${topicId}: mangler tittel`);
    assert(typeof article.definition === 'string' && article.definition.trim().length >= 180, `${topicId}: definisjonen er for grunn`);
    const words = wordCount(editorialPayload(article));
    articleWordCounts[topicId] = words;
    assert(words >= readiness.topic_article_contract.minimum_editorial_words_per_article, `${topicId}: ${words} redaksjonelle ord er under minimum`);
    assert(article.source_ids?.length >= 3 && article.source_ids.every((id) => sourceIds.has(id)), `${topicId}: uløst eller for tynt kildesett`);
    assert(article.claim_ids?.length >= 3 && article.claim_ids.every((id) => claimIds.has(id)), `${topicId}: uløst eller for tynt claimsett`);
    article.source_ids.forEach((id) => usedSourceIds.add(id));
    article.claim_ids.forEach((id) => usedClaimIds.add(id));
    assert(article.documented_cases_or_teaching_scenarios?.length >= 2, `${topicId}: mangler to case/scenarioer`);
    assert(article.representation_guard?.length >= 180, `${topicId}: representation_guard er for kort`);
    assert(article.editorial_review?.status === 'approved' && Object.values(article.editorial_review.checks || {}).every(Boolean), `${topicId}: redaksjonell representasjonsreview feiler`);
    assert(article.quality_review?.status === 'high_quality' && article.quality_review.total >= 27 && article.quality_review.critical_flags?.length === 0, `${topicId}: kvalitetsreview feiler`);
    assert(QUALITY_DIMENSIONS.every((dimension) => article.quality_review.scores?.[dimension] >= 4), `${topicId}: en kvalitetsdimensjon er under 4/5`);
    articleQualityTotals[topicId] = article.quality_review.total;
  }

  assert(sourceRegistrationCount === 235 && sourceIds.size === 235, `Religion skal ha 235 unike kilderegistreringer, fant ${sourceRegistrationCount}/${sourceIds.size}`);
  assert(claimRegistrationCount === 432 && claimIds.size === 432, `Religion skal ha 432 unike claims, fant ${claimRegistrationCount}/${claimIds.size}`);
  assert(usedClaimIds.size === 432, `Ikke alle 432 claims brukes av artikkelverket: ${usedClaimIds.size}`);

  const gates = {
    allTwelveUniversityAreasComplete: true,
    exactSeventyTwoStandaloneArticles: actualArticleFiles.length === 72,
    exactEighteenUniversityMethods: readiness.required_method_ids.length === 18,
    exactSeventyTwoCanonicalConcepts: conceptById.size === 72,
    allConceptsResolveToCanonicalArticles: true,
    allArticleClaimIdsResolve: true,
    allArticleSourceIdsResolve: true,
    allFourHundredThirtyTwoClaimsUsed: usedClaimIds.size === 432,
    allArticlesRespectRepresentationGuards: true,
    allArticlesPassSixDimensionQualityGate: Object.values(articleQualityTotals).every((score) => score >= 27),
    readinessMarkedComplete: readiness.completion_contract.current_complete_ready === true,
    subjectStatusComplete: status.editorialStatus === 'complete'
  };
  const complete = Object.values(gates).every(Boolean);
  const report = {
    schema: 'history_go_fagverk_religion_university_completion_audit_v1',
    version: '1.0.0',
    status: complete ? 'religion_university_completion_complete' : 'religion_university_completion_in_progress',
    generatedFrom: P,
    coverage: {
      universityAreaCount: expectedAreas.length,
      canonicalTopicCount: expectedTopics.length,
      standaloneArticleCount: actualArticleFiles.length,
      requiredMethodCount: readiness.required_method_ids.length,
      conceptCount: conceptById.size
    },
    concepts: {
      materializationMode: conceptsDoc.materialization_mode,
      exactCanonicalCoverage: true,
      articleBacked: true,
      duplicateEditorialTextRequired: false,
      fieldBindings: conceptsDoc.contract.field_bindings
    },
    evidence: {
      registeredSourceCount: sourceRegistrationCount,
      registeredClaimCount: claimRegistrationCount,
      usedSourceCount: usedSourceIds.size,
      usedClaimCount: usedClaimIds.size,
      allIdsResolved: true
    },
    quality: {
      minimumRequiredScore: 27,
      minimumObservedScore: Math.min(...Object.values(articleQualityTotals)),
      articleWordCounts,
      allArticlesPass: true
    },
    gates,
    complete
  };
  const committed = projection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(read(P.report), committed), `${P.report} er utdatert`);
  }
  return { report: committed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditReligionUniversityCompletion({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Religion university completion OK: ${report.coverage.universityAreaCount}/12 områder, ${report.coverage.standaloneArticleCount}/72 artikler, ${report.coverage.conceptCount}/72 begreper, ${report.coverage.requiredMethodCount}/18 metoder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Religion university completion FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
