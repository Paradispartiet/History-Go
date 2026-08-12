#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN_ID = 'psykisk_helse_institusjoner_behandling';
const P = Object.freeze({
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  emner: 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json',
  sourceRegistry: 'data/fag/psykologi/kilder_psykologi_canonical_v1.json',
  articleDir: 'data/fagverk/psykologi/emneartikler',
  materializer: 'scripts/materialize-psykologi-topic-articles-mental-health-v1.mjs',
  report: 'reports/fagverk/psykologi-topic-articles-mental-health-v1-audit.json'
});
const AHA_RUNTIME_ROOTS = Object.freeze(['js', 'data/integrations', 'data/historygo', 'data/psychology']);
const CLINICAL_DIRECTIVE_PATTERNS = Object.freeze([
  /du har diagnosen/i,
  /denne personen har/i,
  /bør behandles med/i,
  /oppfyller vilkårene for tvang/i,
  /nabolaget er psykisk sykt/i,
  /\b(?:du|han|hun|hen|de|personen|pasienten|brukeren|vedkommende)\s+(?:er|har|lider av)\s+(?:schizofren(?:i)?|psykotisk|bipolar(?: lidelse)?|deprimert|depresjon|angstlidelse|personlighetsforstyrrelse|ptsd|traumatisert|psykisk syk)\b/i,
  /\b(?:du|han|hun|hen|de|personen|pasienten|brukeren|vedkommende)\s+(?:må|skal|bør|trenger å)\s+(?:tvangsinnlegges|tvangsbehandles|innlegges|medisineres|behandles med|ta medisiner)\b/i,
  /\b(?:må|skal|bør)\s+(?:tvangsinnlegge|tvangsbehandle|medisinere|diagnostisere)\b/i
]);
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const materialized = (value) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null;
const wordCount = (value) => {
  if (typeof value === 'string') return value.trim() ? value.trim().split(/\s+/).length : 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + wordCount(item), 0);
  if (value && typeof value === 'object') return Object.values(value).reduce((sum, item) => sum + wordCount(item), 0);
  return 0;
};
const walkFiles = (relativeDir) => {
  if (!fs.existsSync(abs(relativeDir))) return [];
  const files = [];
  for (const entry of fs.readdirSync(abs(relativeDir), { withFileTypes: true })) {
    if (entry.name === 'vendor' || entry.name === 'node_modules') continue;
    const relative = `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walkFiles(relative));
    else if (/\.(?:js|mjs|cjs|ts|json|html)$/i.test(entry.name)) files.push(relative);
  }
  return files;
};
export function clinicalSafetyReviewApproved(article) {
  const review = article?.editorial_review;
  return review?.status === 'approved_non_clinical_educational_use' &&
    /^\d{4}-\d{2}-\d{2}$/.test(review.reviewed_at || '') &&
    review.reviewer_role === 'psychology_editorial_audit' &&
    review.review_standard === 'history_go_psykologi_clinical_safety_v1' &&
    ['no_individual_diagnosis','no_individual_treatment_directive','no_coercion_recommendation','no_place_or_group_diagnosis','educational_scope_explicit'].every((key) => review.checks?.[key] === true);
}
export function clinicalTextHasNoDirectives(article) {
  const text = JSON.stringify(article);
  return CLINICAL_DIRECTIVE_PATTERNS.every((pattern) => !pattern.test(text));
}
function ahaRuntimeActivationEvidence() {
  const scannedFiles = AHA_RUNTIME_ROOTS.flatMap(walkFiles).sort();
  const activationPattern = /data\/fagverk\/psykologi\/emneartikler|history_go_psykologi_topic_article_v1|psykologi[\/_-]emneartikler/i;
  const referencingFiles = scannedFiles.filter((file) => activationPattern.test(fs.readFileSync(abs(file), 'utf8')));
  return { scannedRoots: AHA_RUNTIME_ROOTS, referencingFiles };
}
const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  subject: report.subject,
  coverage: report.coverage,
  depth: report.depth,
  evidence: report.evidence,
  gates: report.gates,
  complete: report.complete
});

function evidenceIndex(registry) {
  const sourceIds = new Set((registry.sources || []).map((source) => source.id));
  const claimIds = new Set();
  for (const file of registry.source_documents || []) {
    const document = read(file);
    for (const source of document.sources || []) sourceIds.add(source.id);
    for (const claim of document.claims || []) claimIds.add(claim.id);
  }
  return { sourceIds, claimIds };
}

export function auditPsykologiMentalHealthTopicArticles({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.pensum, P.emner, P.sourceRegistry, P.materializer]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const registry = read(P.sourceRegistry);
  const domain = pensum.domains.find((row) => (row.domain_id || row.id) === DOMAIN_ID);
  assert(domain, `Mangler canonicalt domene ${DOMAIN_ID}`);
  const requiredIds = [...domain.emne_ids].sort();
  assert(requiredIds.length === 12 && new Set(requiredIds).size === 12, 'Mental-health-batchen må eie eksakt 12 canonicale emner');
  const canonicalById = new Map(emner.map((emne) => [emne.emne_id, emne]));
  const files = fs.existsSync(abs(P.articleDir)) ? fs.readdirSync(abs(P.articleDir)).filter((file) => file.endsWith('.json')).sort() : [];
  const requiredFiles = requiredIds.map((id) => `${id}.json`);
  const batchFiles = files.filter((file) => requiredFiles.includes(file));
  assert(isDeepStrictEqual(batchFiles, requiredFiles), 'Mental-health-batchen mangler ett eller flere eksakte emneartikkeldokumenter');
  const articles = batchFiles.map((file) => read(`${P.articleDir}/${file}`));
  const { sourceIds, claimIds } = evidenceIndex(registry);

  const uniqueIds = new Set(articles.map((article) => article.emne_id));
  const exactCoverage = isDeepStrictEqual([...uniqueIds].sort(), requiredIds);
  assert(exactCoverage && uniqueIds.size === 12, 'Emneartiklene dekker ikke eksakt 12/12 canonicale mental-health-emner');
  assert(articles.every((article) => article.schema === 'history_go_psykologi_topic_article_v1' && article.subject_id === 'psykologi' && article.domain_id === DOMAIN_ID && article.article_status === 'complete'), 'En artikkel har feil schema, fag, domene eller status');
  assert(articles.every((article) => canonicalById.get(article.emne_id)?.title === article.title), 'En artikkeltittel avviker fra canonicalt emne');

  const requiredFields = ['emne_id','title','definition','background','theories_and_findings','methods','boundaries_and_disagreements','examples','source_ids'];
  const allRequiredFields = articles.every((article) => requiredFields.every((field) => materialized(article[field])));
  assert(allRequiredFields, 'En artikkel mangler et bindende universitetsfelt');
  const structuralDepth = articles.every((article) =>
    article.definition.trim().length >= 250 &&
    article.background.length === 3 && article.background.every((paragraph) => paragraph.trim().length >= 250) &&
    article.theories_and_findings.length >= 2 && article.theories_and_findings.every((item) => item.title && item.content?.trim().length >= 250 && item.source_ids?.length >= 1) &&
    article.methods.length >= 3 && article.methods.every((item) => item.method_id && item.label && item.application?.trim().length >= 70 && item.limitations?.trim().length >= 60) &&
    article.boundaries_and_disagreements.length === 3 && article.boundaries_and_disagreements.every((item) => item.question && item.positions?.length >= 2 && item.evidence_needed?.trim().length >= 40) &&
    article.examples.length >= 2 && article.examples.every((item) => item.title && item.analysis?.trim().length >= 160 && item.source_ids?.length >= 1) &&
    article.learning_outcomes?.length >= 3 && article.key_questions?.length >= 3 &&
    article.models_or_researchers?.length >= 2 && article.models_or_researchers.every((item) => item.name && item.role?.trim().length >= 40 && item.use_limit?.trim().length >= 30 && item.source_ids?.length >= 1) &&
    article.misuse_guard?.trim().length >= 160
  );
  assert(structuralDepth, 'En artikkel mangler full faglig dybde, metodegrenser, case, modeller eller misbruksvern');

  const articleWordCounts = Object.fromEntries(articles.map((article) => [article.emne_id, wordCount({
    definition: article.definition,
    background: article.background,
    theories_and_findings: article.theories_and_findings,
    methods: article.methods,
    boundaries_and_disagreements: article.boundaries_and_disagreements,
    examples: article.examples,
    learning_outcomes: article.learning_outcomes,
    key_questions: article.key_questions,
    models_or_researchers: article.models_or_researchers,
    misuse_guard: article.misuse_guard
  })]));
  const minimumDepthMet = Object.values(articleWordCounts).every((count) => count >= 550);
  assert(minimumDepthMet, 'En artikkel har under 550 redaksjonelle ord');

  const allSourcesResolve = articles.every((article) => article.source_ids.length >= 3 && article.source_ids.every((id) => sourceIds.has(id)) &&
    [...article.theories_and_findings, ...article.examples, ...article.models_or_researchers].every((item) => item.source_ids.every((id) => article.source_ids.includes(id) && sourceIds.has(id))));
  assert(allSourcesResolve, 'En artikkel har uløst kilde eller seksjonskilde utenfor artikkelens kildegrunnlag');
  const allClaimsResolve = articles.every((article) => article.claim_ids?.length >= 3 && article.claim_ids.every((id) => claimIds.has(id)));
  assert(allClaimsResolve, 'En artikkel har færre enn tre eller uløste claim-ID-er');
  const relatedIdsResolve = articles.every((article) => article.related_emne_ids.every((id) => canonicalById.has(id)));
  assert(relatedIdsResolve, 'En artikkel peker til et ikke-canonicalt relatert emne');

  const genericCanonicalWordingAbsent = articles.every((article) => !/emnet studerer .* som psykologisk inngang til konkrete institusjoner/i.test(JSON.stringify(article)));
  const allClinicalSafetyReviewsApproved = articles.every(clinicalSafetyReviewApproved);
  const noClinicalOverreach = allClinicalSafetyReviewsApproved && articles.every(clinicalTextHasNoDirectives);
  const runtimeActivation = ahaRuntimeActivationEvidence();
  const noAhaRuntimeActivation = runtimeActivation.referencingFiles.length === 0;
  assert(genericCanonicalWordingAbsent, 'Batchen gjenbruker generisk canonical maltekst som artikkelinnhold');
  assert(allClinicalSafetyReviewsApproved, 'En artikkel mangler godkjent klinisk sikkerhetsreview');
  assert(noClinicalOverreach, 'Batchen inneholder diagnose-, tvangs- eller behandlingsoverreach');
  assert(noAhaRuntimeActivation, `AHA/runtime peker til emneartiklene fra: ${runtimeActivation.referencingFiles.join(', ')}`);

  const totalWordCount = Object.values(articleWordCounts).reduce((sum, count) => sum + count, 0);
  const complete = exactCoverage && allRequiredFields && structuralDepth && minimumDepthMet && allSourcesResolve && allClaimsResolve && relatedIdsResolve && genericCanonicalWordingAbsent && noClinicalOverreach && noAhaRuntimeActivation;
  const report = {
    schema: 'history_go_fagverk_psykologi_topic_articles_batch_audit_v1',
    version: '1.1.0',
    status: complete ? 'psykologi_topic_articles_mental_health_complete' : 'psykologi_topic_articles_mental_health_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', domainId: DOMAIN_ID },
    coverage: { requiredArticleCount: 12, materializedArticleCount: articles.length, exactCanonicalCoverage: exactCoverage, articleIds: requiredIds },
    depth: { minimumWordsPerArticle: 550, totalEditorialWordCount: totalWordCount, articleWordCounts },
    evidence: { registeredSourceCount: sourceIds.size, registeredClaimCount: claimIds.size, allArticleSourcesResolve: allSourcesResolve, allArticleClaimsResolve: allClaimsResolve, runtimeActivation },
    gates: {
      exact12CanonicalArticles: exactCoverage,
      oneFilePerCanonicalEmne: batchFiles.length === 12,
      allRequiredUniversityFieldsMaterialized: allRequiredFields,
      allArticlesMeetStructuralDepth: structuralDepth,
      allArticlesMeetMinimumWordDepth: minimumDepthMet,
      allSectionSourcesResolve: allSourcesResolve,
      allClaimIdsResolve: allClaimsResolve,
      allRelatedEmneIdsResolve: relatedIdsResolve,
      genericCanonicalTemplateWordingAbsent: genericCanonicalWordingAbsent,
      allClinicalSafetyReviewsApproved,
      noClinicalDiagnosticTreatmentOrCoercionOverreach: noClinicalOverreach,
      noAhaRuntimeActivation: noAhaRuntimeActivation
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
    const { report } = auditPsykologiMentalHealthTopicArticles({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Psykologi emneartikler mental health OK: ${report.coverage.materializedArticleCount}/12 artikler, ${report.depth.totalEditorialWordCount} redaksjonelle ord, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi emneartikler mental health FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
