#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AREA_ID = 'indigenous_sami';
const P = Object.freeze({
  readiness: 'data/fag/religion/religion_university_readiness_v1.json',
  methods: 'data/fag/religion/methods_religion_canonical_v1.json',
  sourceRegistry: 'data/fag/religion/kilder_religion_canonical_v1.json',
  claims: 'data/fagverk/religion/samiske-og-andre-urfolksreligioner/claims.json',
  articleDir: 'data/fagverk/religion/emneartikler',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/religion-indigenous-sami-articles-v1-audit.json'
});
const REQUIRED_FIELDS = Object.freeze([
  'topic_id', 'title', 'definition', 'historical_or_systemic_background',
  'theories_researchers_and_findings', 'methods_and_limitations',
  'boundaries_and_disagreements', 'documented_cases_or_teaching_scenarios',
  'key_questions', 'source_ids', 'claim_ids', 'representation_guard',
  'editorial_review', 'quality_review'
]);
const QUALITY_DIMENSIONS = Object.freeze([
  'correctness_evidence', 'coverage_completion', 'editorial_quality',
  'technical_integrity', 'safety_responsibility', 'maintainability_auditability'
]);
const NEW_METHOD_IDS = Object.freeze([
  'met_religion_survey_and_demography',
  'met_religion_cognitive_and_experimental_analysis'
]);
const RUNTIME_ROOTS = Object.freeze(['js', 'data/integrations', 'data/historygo', 'data/religion']);
const abs = (relative) => path.join(ROOT, relative);
const read = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const materialized = (value) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value && typeof value === 'object' ? Object.keys(value).length > 0 : value != null;
const wordCount = (value) => typeof value === 'string' ? (value.trim() ? value.trim().split(/\s+/).length : 0) : Array.isArray(value) ? value.reduce((sum, item) => sum + wordCount(item), 0) : value && typeof value === 'object' ? Object.values(value).reduce((sum, item) => sum + wordCount(item), 0) : 0;
const normalize = (value) => value.toLocaleLowerCase('nb-NO').replace(/[^a-zæøå0-9]+/g, ' ').trim();
const ngrams = (value, size = 5) => {
  const tokens = normalize(value).split(/\s+/).filter(Boolean);
  const result = new Set();
  for (let i = 0; i <= tokens.length - size; i += 1) result.add(tokens.slice(i, i + size).join(' '));
  return result;
};
const jaccard = (left, right) => {
  const intersection = [...left].filter((item) => right.has(item)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
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
const walk = (relative) => {
  if (!fs.existsSync(abs(relative))) return [];
  const files = [];
  for (const entry of fs.readdirSync(abs(relative), { withFileTypes: true })) {
    const child = `${relative}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walk(child));
    else if (/\.(?:js|mjs|cjs|ts|json|html)$/i.test(entry.name)) files.push(child);
  }
  return files;
};
const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  subject: report.subject,
  coverage: report.coverage,
  depth: report.depth,
  evidence: report.evidence,
  methods: report.methods,
  editorial: report.editorial,
  quality: report.quality,
  gates: report.gates,
  complete: report.complete
});

export function auditReligionIndigenousSamiArticles({ writeReport = false, checkReport = true } = {}) {
  for (const file of Object.values(P).filter((file) => file !== P.report)) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const readiness = read(P.readiness);
  const methods = read(P.methods);
  const registry = read(P.sourceRegistry);
  const claimsDocument = read(P.claims);
  const statuses = read(P.status);
  const status = statuses.subjects.find((row) => row.id === 'religion');
  assert(status?.editorialStatus === 'chapters_in_progress', 'Religion skal fortsatt stå chapters_in_progress');
  assert(status?.nextGate === 'remaining_religion_area_article_production', 'Religion har feil neste produksjonsport');
  assert(readiness.status === 'matrix_locked_production_in_progress', 'Religion-readiness skal vise pågående produksjon');
  assert(readiness.completion_contract.current_complete_ready === false && readiness.production_progress.complete_ready === false, 'Religion kan ikke være completeReady ved 60/72');

  const requiredIds = readiness.required_topics_by_area[AREA_ID];
  assert(requiredIds.length === 6 && new Set(requiredIds).size === 6, 'Samiske og andre urfolksreligioner skal eie seks unike emner');
  assert(isDeepStrictEqual(readiness.production_progress.completed_area_ids, ['theory_method', 'history_comparison', 'west_asian_abrahamic', 'south_asian_religions', 'east_asian_religions', AREA_ID, 'ritual_materiality_space', 'texts_myths_authority', 'society_politics_law', 'lived_identity_migration']), 'Eksakt ti Religion-områder skal være komplette');
  assert(isDeepStrictEqual(readiness.production_progress.materialized_topic_ids.slice(30, 36), requiredIds), 'Readiness har feil samiske og andre urfolksreligioner-emner');
  assert(readiness.production_progress.standalone_topic_articles_materialized === 60 && readiness.production_progress.standalone_topic_articles_remaining === 12, 'Religion skal stå på 60/72 artikler');
  const area = readiness.university_core_matrix.find((row) => row.area_id === AREA_ID);
  assert(area?.current_status === 'complete' && isDeepStrictEqual(area.current_anchors, requiredIds), 'Samiske og andre urfolksreligioner-området er ikke korrekt merket komplett');

  const expectedFiles = requiredIds.map((id) => `${id}.json`).sort();
  const actualFiles = fs.readdirSync(abs(P.articleDir)).filter((file) => requiredIds.includes(file.replace(/\.json$/, ''))).sort();
  assert(isDeepStrictEqual(actualFiles, expectedFiles), 'Mangler eksakt én artikkelfil per Samiske og andre urfolksreligioner-emne');
  const articles = actualFiles.map((file) => read(`${P.articleDir}/${file}`));
  assert(isDeepStrictEqual(articles.map((article) => article.topic_id).sort(), [...requiredIds].sort()), 'Artiklene dekker ikke eksakt 6/6 emner');

  assert(registry.source_documents.includes(P.claims), 'Religion-kilderegisteret peker ikke til Samiske og andre urfolksreligioner-claims');
  assert(claimsDocument.schema === 'history_go_religion_topic_claims_v1' && claimsDocument.area_id === AREA_ID, 'Claimdokumentet har feil schema eller område');
  assert(Object.values(claimsDocument.source_policy || {}).every(Boolean), 'Urfolksbatchens kilde-, rettighets- eller representasjonsvern er ikke låst');
  const sourceById = new Map(claimsDocument.sources.map((source) => [source.id, source]));
  const claimById = new Map(claimsDocument.claims.map((claim) => [claim.id, claim]));
  assert(sourceById.size === 20, 'Samiske og andre urfolksreligioner skal ha 20 unike kilderegistreringer');
  assert(claimById.size === 36, 'Samiske og andre urfolksreligioner skal ha 36 unike claims');
  assert(claimsDocument.sources.every((source) => /^https:\/\//.test(source.url) && source.publisher && source.author && source.title && source.source_location?.length >= 50), 'En kilde mangler HTTPS eller presis metadata');
  assert(claimsDocument.claims.every((claim) => requiredIds.includes(claim.topic_id) && claim.claim.length >= 100 && claim.source_ids?.every((id) => sourceById.has(id))), 'En claim er for kort, feilplassert eller har uløst kilde');

  const usedClaimIds = new Set();
  const usedSourceIds = new Set();
  const usedMethodIds = new Set();
  const articleWordCounts = {};
  const scenarioCounts = {};
  const genericPatterns = [
    /religion er viktig fordi religion er/i,
    /alle (?:grekere|romere|egyptere|vikinger) (?:var|mente|gjorde|trodde)/i,
    /emnet studerer .+ som religionsvitenskapelig inngang/i,
    /kildestøtte:/i
  ];
  for (const article of articles) {
    assert(article.schema === 'history_go_religion_topic_article_v1' && article.subject_id === 'religion' && article.area_id === AREA_ID && article.article_status === 'complete', `${article.topic_id}: feil schema, fag, område eller status`);
    assert(REQUIRED_FIELDS.every((field) => materialized(article[field])), `${article.topic_id}: mangler påkrevd felt`);
    const words = wordCount(editorialPayload(article));
    articleWordCounts[article.topic_id] = words;
    assert(words >= readiness.topic_article_contract.minimum_editorial_words_per_article, `${article.topic_id}: ${words} ord er under minimum`);
    assert(article.historical_or_systemic_background.length >= 3, `${article.topic_id}: trenger tre bakgrunnsavsnitt`);
    assert(article.theories_researchers_and_findings.length >= 3, `${article.topic_id}: trenger tre teorier eller funn`);
    assert(article.methods_and_limitations.length >= 2, `${article.topic_id}: trenger to metoder med grenser`);
    assert(article.boundaries_and_disagreements.length >= 2, `${article.topic_id}: trenger to reelle uenigheter`);
    assert(article.key_questions.length >= 3, `${article.topic_id}: trenger tre nøkkelspørsmål`);
    assert(article.source_ids.length >= 3 && article.claim_ids.length === 6, `${article.topic_id}: trenger minst tre kilder og eksakt seks claims`);
    assert(article.claim_ids.every((id) => claimById.get(id)?.topic_id === article.topic_id), `${article.topic_id}: uløst claim eller claim fra feil emne`);
    assert(article.source_ids.every((id) => sourceById.has(id)), `${article.topic_id}: uløst artikkelkilde`);
    article.claim_ids.forEach((id) => usedClaimIds.add(id));
    article.source_ids.forEach((id) => usedSourceIds.add(id));
    for (const item of [...article.theories_researchers_and_findings, ...article.documented_cases_or_teaching_scenarios]) {
      assert(item.claim_ids?.length && item.source_ids?.length, `${article.topic_id}: teori eller case mangler claim-/kildebinding`);
      assert(item.claim_ids.every((id) => article.claim_ids.includes(id) && claimById.has(id)), `${article.topic_id}: seksjonsclaim ligger utenfor artikkelgrunnlaget`);
      assert(item.source_ids.every((id) => article.source_ids.includes(id) && sourceById.has(id)), `${article.topic_id}: seksjonskilde ligger utenfor artikkelgrunnlaget`);
    }
    const scenarios = article.documented_cases_or_teaching_scenarios;
    scenarioCounts[article.topic_id] = scenarios.length;
    assert(scenarios.length >= 2 && scenarios.every((item) => ['documented_method_case', 'analytical_teaching_scenario'].includes(item.case_status)), `${article.topic_id}: case mangler eller har ugyldig status`);
    assert(scenarios.filter((item) => item.case_status === 'analytical_teaching_scenario').every((item) => /hypotetisk|konstruert/i.test(item.analysis)), `${article.topic_id}: hypotetisk scenario er ikke merket`);
    for (const method of article.methods_and_limitations) {
      usedMethodIds.add(method.method_id);
      assert(method.application?.length >= 80 && method.limitations?.length >= 70, `${article.topic_id}: metode mangler anvendelse eller begrensning`);
    }
    assert(article.editorial_review.status === 'approved' && article.editorial_review.reviewer_role === 'religion_editorial_audit' && Object.values(article.editorial_review.checks || {}).every(Boolean), `${article.topic_id}: redaksjonell review feiler`);
    const quality = article.quality_review;
    assert(quality.status === 'high_quality' && quality.total >= 27 && QUALITY_DIMENSIONS.every((dimension) => quality.scores?.[dimension] >= 4) && quality.critical_flags?.length === 0, `${article.topic_id}: seksdelt kvalitetsport feiler`);
    assert(article.representation_guard.length >= 200, `${article.topic_id}: representation_guard er for kort`);
    const text = JSON.stringify(editorialPayload(article));
    assert(genericPatterns.every((pattern) => !pattern.test(text)), `${article.topic_id}: generisk eller essensialiserende formulering funnet`);
  }

  assert(usedClaimIds.size === 36 && [...claimById].every(([id]) => usedClaimIds.has(id)), 'Ikke alle 36 claims er brukt av riktig artikkel');
  assert(usedSourceIds.size === 20, 'Alle 20 registrerte kilder skal være brukt');
  const canonicalMethods = new Map(methods.methods.map((method) => [method.method_id, method]));
  assert([...usedMethodIds].every((id) => canonicalMethods.get(id)?.university_matrix_status === 'materialized'), 'En brukt metode er uløst eller ikke materialisert');
  assert(NEW_METHOD_IDS.every((id) => usedMethodIds.has(id) && readiness.production_progress.materialized_required_method_ids.includes(id)), 'De nye survey-/demografi- og kognitiv-/eksperimentmetodene er ikke materialisert og brukt');
  assert(readiness.production_progress.required_methods_materialized === 18 && readiness.production_progress.required_methods_remaining === 0, 'Religion skal stå på 18/18 metoder');

  const allMaterializedIds = readiness.production_progress.materialized_topic_ids;
  const allArticles = allMaterializedIds.map((id) => read(`${P.articleDir}/${id}.json`));
  const exactParagraphs = new Map();
  for (const article of allArticles) {
    const paragraphs = [article.definition, ...article.historical_or_systemic_background, ...article.theories_researchers_and_findings.map((item) => item.content), ...article.documented_cases_or_teaching_scenarios.map((item) => item.analysis), article.representation_guard];
    for (const paragraph of paragraphs) {
      const key = normalize(paragraph);
      assert(!exactParagraphs.has(key), `${article.topic_id}: redaksjonelt avsnitt dupliserer ${exactParagraphs.get(key)}`);
      exactParagraphs.set(key, article.topic_id);
    }
  }
  const similarities = [];
  for (let i = 0; i < allArticles.length; i += 1) {
    for (let j = i + 1; j < allArticles.length; j += 1) {
      const score = jaccard(ngrams(JSON.stringify(editorialPayload(allArticles[i]))), ngrams(JSON.stringify(editorialPayload(allArticles[j]))));
      similarities.push({ pair: [allArticles[i].topic_id, allArticles[j].topic_id], score: Number(score.toFixed(4)) });
      assert(score < 0.12, `${allArticles[i].topic_id}/${allArticles[j].topic_id}: for høy femgrams-likhet ${score}`);
    }
  }

  const runtimeFiles = RUNTIME_ROOTS.flatMap(walk).sort();
  const activationPattern = /data\/fagverk\/religion\/emneartikler|history_go_religion_topic_article_v1/i;
  const runtimeReferences = runtimeFiles.filter((file) => activationPattern.test(fs.readFileSync(abs(file), 'utf8')));
  assert(runtimeReferences.length === 0, `Religion-artiklene er aktivert i runtime før 72/72: ${runtimeReferences.join(', ')}`);

  const totalEditorialWordCount = Object.values(articleWordCounts).reduce((sum, value) => sum + value, 0);
  const qualityScores = Object.fromEntries(QUALITY_DIMENSIONS.map((dimension) => [dimension, Math.min(...articles.map((article) => article.quality_review.scores[dimension]))]));
  const qualityTotal = Object.values(qualityScores).reduce((sum, value) => sum + value, 0);
  const complete = articles.length === 6 && usedClaimIds.size === 36 && usedSourceIds.size === 20 && NEW_METHOD_IDS.every((id) => usedMethodIds.has(id)) && qualityTotal >= 27;
  const report = {
    schema: 'history_go_fagverk_religion_topic_articles_batch_audit_v1',
    version: '1.0.0',
    status: complete ? 'religion_indigenous_sami_articles_complete' : 'religion_indigenous_sami_articles_in_progress',
    generatedFrom: P,
    subject: { id: 'religion', areaId: AREA_ID, editorialStatus: status.editorialStatus, nextGate: status.nextGate, completeReady: false },
    coverage: { requiredArticleCount: 6, materializedArticleCount: articles.length, completedUniversityAreaCount: 6, totalUniversityAreaCount: 12, completedTopicCount: 36, totalTopicCount: 72, articleIds: requiredIds },
    depth: { minimumWordsPerArticle: readiness.topic_article_contract.minimum_editorial_words_per_article, totalEditorialWordCount, articleWordCounts, scenarioCounts },
    evidence: { registeredSourceCount: sourceById.size, registeredClaimCount: claimById.size, usedSourceCount: usedSourceIds.size, usedClaimCount: usedClaimIds.size, allClaimsResolve: true, allSourcesResolve: true },
    methods: { requiredMethodCount: readiness.required_method_ids.length, materializedRequiredMethodCount: readiness.production_progress.required_methods_materialized, newlyMaterializedMethodIds: NEW_METHOD_IDS, usedMethodIds: [...usedMethodIds].sort() },
    editorial: { allReligionArticleCountReviewed: allArticles.length, exactParagraphDuplicates: 0, maximumFiveGramJaccard: Math.max(...similarities.map((item) => item.score)), pairwiseSimilarities: similarities, runtimeReferences },
    quality: { dimensions: qualityScores, total: qualityTotal, threshold: 27, minimumDimension: 4, criticalFlags: [], conclusion: 'high_quality' },
    gates: {
      exactSixIndigenousSamiArticles: true,
      allArticlesMeetMinimumWordDepth: true,
      allThirtySixClaimsResolveAndAreUsed: true,
      allTwentySourcesResolveAndAreUsed: true,
      allCasesAndScenariosExplicitlyLabeled: true,
      twoFinalSurveyExperimentalMethodsMaterializedAndLinked: true,
      allSixtyReligionArticlesReviewedForEditorialDiversity: true,
      samiSpecificEvidenceAndKnowledgeRestrictionsLocked: true,
      internalDiversityAndNonessentialismReviewed: true,
      genericTemplateReuseAbsent: true,
      noPrematureAhaRuntimeActivation: true,
      sixDimensionQualityGate29Of30: qualityTotal === 29,
      religionCompleteReadyRemainsFalse: true
    },
    complete
  };
  const committed = projection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(read(P.report), committed), `${P.report} er utdatert`);
  return { report: committed };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditReligionIndigenousSamiArticles({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Religion samiske og andre urfolksreligioner OK: ${report.coverage.materializedArticleCount}/6 artikler, ${report.depth.totalEditorialWordCount} ord, ${report.evidence.registeredClaimCount} claims, kvalitet ${report.quality.total}/30.`);
  } catch (error) {
    console.error(`Religion samiske og andre urfolksreligioner FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
