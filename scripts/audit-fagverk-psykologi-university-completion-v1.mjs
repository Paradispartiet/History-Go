#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { clinicalSafetyReviewApproved, clinicalTextHasNoDirectives } from './audit-fagverk-psykologi-topic-articles-mental-health-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  emner: 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json',
  methods: 'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',
  sourceRegistry: 'data/fag/psykologi/kilder_psykologi_canonical_v1.json',
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  articles: 'data/fagverk/psykologi/emneartikler',
  concepts: 'data/fag/psykologi/begreper_psykologi_canonical_v1.json',
  appliedFields: 'data/fag/psykologi/anvendte_fagfelt_psykologi_university_v1.json',
  materializer: 'scripts/materialize-psykologi-university-completion-v1.mjs',
  report: 'reports/fagverk/psykologi-university-completion-v1-audit.json'
});
const AHA_RUNTIME_ROOTS = Object.freeze(['js', 'data/integrations', 'data/historygo', 'data/psychology']);
const REQUIRED_APPLIED_FIELDS = Object.freeze(['clinical_health','work_organizational','educational_school','culture','environment_community','quantitative_psychometrics']);
const REQUIRED_CONCEPT_FIELDS = Object.freeze(['concept_id','label','definition','explanation','not_meaning','related_concept_ids','models_or_researchers','empirical_status','example','source_ids']);
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
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
    if (entry.name === 'node_modules' || entry.name === 'vendor') continue;
    const relative = `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walkFiles(relative));
    else if (/\.(?:js|mjs|cjs|ts|json|html)$/i.test(entry.name)) files.push(relative);
  }
  return files;
};

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

function ahaRuntimeEvidence() {
  const files = AHA_RUNTIME_ROOTS.flatMap(walkFiles).sort();
  const pattern = /data\/fagverk\/psykologi\/emneartikler|history_go_psykologi_topic_article_v1|psykologi[\/_-]emneartikler|begreper_psykologi_canonical_v1|anvendte_fagfelt_psykologi_university_v1/i;
  return { scannedRoots: AHA_RUNTIME_ROOTS, referencingFiles: files.filter((file) => pattern.test(fs.readFileSync(abs(file), 'utf8'))) };
}

const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  coverage: report.coverage,
  articles: report.articles,
  concepts: report.concepts,
  appliedFields: report.appliedFields,
  evidence: report.evidence,
  gates: report.gates,
  complete: report.complete
});

export function auditPsykologiUniversityCompletion({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.pensum,P.emner,P.methods,P.sourceRegistry,P.matrix,P.concepts,P.appliedFields,P.materializer]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const methodsDoc = read(P.methods);
  const registry = read(P.sourceRegistry);
  const matrix = read(P.matrix);
  const conceptsDoc = read(P.concepts);
  const appliedDoc = read(P.appliedFields);
  const canonicalIds = pensum.domains.flatMap((domain) => domain.emne_ids || []).sort();
  const emneById = new Map(emner.map((emne) => [emne.emne_id, emne]));
  const methodIds = new Set(methodsDoc.methods.map((method) => method.method_id));
  const { sourceIds, claimIds } = evidenceIndex(registry);
  assert(canonicalIds.length === 58 && new Set(canonicalIds).size === 58, 'Canonicalt pensum er ikke eksakt 58 unike emner');

  const articleFiles = fs.readdirSync(abs(P.articles)).filter((file) => file.endsWith('.json')).sort();
  const expectedArticleFiles = canonicalIds.map((id) => `${id}.json`).sort();
  assert(isDeepStrictEqual(articleFiles, expectedArticleFiles), 'Artikkelkatalogen må inneholde eksakt én fil for hvert av 58 canonicale emner');
  const articles = articleFiles.map((file) => read(`${P.articles}/${file}`));
  const articleWordCounts = {};
  const domainCounts = {};
  for (const article of articles) {
    const emne = emneById.get(article.emne_id);
    assert(emne, `Ukjent artikkelemne ${article.emne_id}`);
    assert(article.schema === matrix.topic_article_contract.article_schema && article.article_status === 'complete' && article.subject_id === 'psykologi', `${article.emne_id} har feil schema/status/fag`);
    assert(article.title === emne.title && article.domain_id === emne.domain, `${article.emne_id} avviker fra canonical tittel eller domene`);
    const required = [...matrix.topic_article_contract.required_fields, ...matrix.topic_article_contract.required_quality_fields];
    assert(required.every((field) => materialized(article[field])), `${article.emne_id} mangler bindende artikkelfelt`);
    assert(article.background.length === 3 && article.background.every((paragraph) => paragraph.trim().length >= 250), `${article.emne_id} har for grunn bakgrunn`);
    assert(article.theories_and_findings.length >= 2 && article.theories_and_findings.every((item) => item.title && item.content?.trim().length >= 250 && item.source_ids?.length), `${article.emne_id} har for svak teori-/funnseksjon`);
    assert(article.methods.length >= 3 && article.methods.every((item) => methodIds.has(item.method_id) && item.label && item.application?.trim().length >= 70 && item.limitations?.trim().length >= 60), `${article.emne_id} har ufullstendige eller ukjente metoder`);
    assert(article.boundaries_and_disagreements.length === 3 && article.boundaries_and_disagreements.every((item) => item.question && item.positions?.length >= 2 && item.evidence_needed?.trim().length >= 40), `${article.emne_id} mangler faglige grenser/uenigheter`);
    assert(article.examples.length >= 2 && article.examples.every((item) => item.title && item.analysis?.trim().length >= 160 && item.source_ids?.length), `${article.emne_id} mangler kildeførte undervisningscase`);
    assert(article.learning_outcomes.length >= 3 && article.key_questions.length >= 3, `${article.emne_id} mangler læringsmål eller nøkkelspørsmål`);
    assert(article.models_or_researchers.length >= 2 && article.models_or_researchers.every((item) => item.name && item.role?.trim().length >= 40 && item.use_limit?.trim().length >= 30 && item.source_ids?.length), `${article.emne_id} mangler modeller/forskningsgrenser`);
    assert(article.source_ids.length >= 3 && article.source_ids.every((id) => sourceIds.has(id)), `${article.emne_id} har uløst eller for tynt kildesett`);
    assert(article.claim_ids.length >= 3 && article.claim_ids.every((id) => claimIds.has(id)), `${article.emne_id} har uløste eller for få claims`);
    assert([...article.theories_and_findings, ...article.examples, ...article.models_or_researchers].every((item) => item.source_ids.every((id) => sourceIds.has(id) && article.source_ids.includes(id))), `${article.emne_id} har seksjonskilde utenfor artikkelgrunnlaget`);
    assert((article.related_emne_ids || []).every((id) => emneById.has(id)), `${article.emne_id} peker til ikke-canonicalt naboområde`);
    assert(clinicalSafetyReviewApproved(article) && clinicalTextHasNoDirectives(article), `${article.emne_id} består ikke klinisk sikkerhetsreview`);
    assert(!/emnet studerer .* som psykologisk inngang til konkrete institusjoner/i.test(JSON.stringify(article)), `${article.emne_id} gjenbruker forbudt canonical maltekst`);
    const count = wordCount({ definition:article.definition,background:article.background,theories_and_findings:article.theories_and_findings,methods:article.methods,boundaries_and_disagreements:article.boundaries_and_disagreements,examples:article.examples,learning_outcomes:article.learning_outcomes,key_questions:article.key_questions,models_or_researchers:article.models_or_researchers,misuse_guard:article.misuse_guard });
    assert(count >= matrix.topic_article_contract.minimum_editorial_words_per_article, `${article.emne_id} har bare ${count} redaksjonelle ord`);
    articleWordCounts[article.emne_id] = count;
    domainCounts[article.domain_id] = (domainCounts[article.domain_id] || 0) + 1;
  }
  assert(new Set(articles.map((article) => article.definition)).size === 58, 'To artikler har identisk definisjon');
  assert(isDeepStrictEqual(Object.fromEntries(pensum.domains.map((domain) => [domain.domain_id, domain.emne_ids.length])), domainCounts), 'Artiklene dekker ikke alle seks domener eksakt');

  const expectedTerms = [...new Set(emner.flatMap((emne) => emne.core_concepts || []))].sort((a, b) => a.localeCompare(b, 'nb'));
  assert(conceptsDoc.schema === 'history_go_psykologi_concept_registry_v1' && conceptsDoc.subject_id === 'psykologi', 'Begrepsregisteret har feil schema eller fag');
  assert(conceptsDoc.concept_count === expectedTerms.length && matrix.concept_registry_contract.expected_unique_concept_count === expectedTerms.length, 'Begrepskontrakten må låse eksakt canonical termmengde');
  const concepts = conceptsDoc.concepts || [];
  assert(new Set(concepts.map((concept) => concept.concept_id)).size === concepts.length, 'Begrepsregisteret har dupliserte concept_id-er');
  assert(isDeepStrictEqual(concepts.map((concept) => concept.canonical_term).sort((a,b)=>a.localeCompare(b,'nb')), expectedTerms), 'Begrepsregisteret dekker ikke eksakt unionen av canonical core_concepts');
  const conceptIds = new Set(concepts.map((concept) => concept.concept_id));
  for (const concept of concepts) {
    assert(REQUIRED_CONCEPT_FIELDS.every((field) => materialized(concept[field])), `${concept.concept_id} mangler bindende begrepsfelt`);
    assert(concept.definition.trim().length >= 180 && concept.explanation.trim().length >= 300 && concept.not_meaning.trim().length >= 180 && concept.example.trim().length >= 180, `${concept.concept_id} er ikke faglig utfylt`);
    assert(concept.source_ids.length >= 1 && concept.source_ids.every((id) => sourceIds.has(id)), `${concept.concept_id} har uløste kilder`);
    assert(concept.source_emne_ids?.length >= 1 && concept.source_emne_ids.every((id) => emneById.has(id)), `${concept.concept_id} mangler canonical emneeierskap`);
    assert(concept.related_concept_ids.every((id) => conceptIds.has(id) && id !== concept.concept_id), `${concept.concept_id} har uløst eller sirkulær selvrelasjon`);
  }

  assert(appliedDoc.schema === matrix.applied_field_contract.schema && appliedDoc.subject_id === 'psykologi', 'Anvendt-fagfeltregisteret har feil schema eller fag');
  const fields = appliedDoc.fields || [];
  assert(isDeepStrictEqual(fields.map((field) => field.area_id), REQUIRED_APPLIED_FIELDS), 'Anvendte fagfelt dekker ikke eksakt den bindende matrisen');
  const matrixApplied = new Map(matrix.applied_field_matrix.map((row) => [row.area_id, row]));
  const coreAreaIds = new Set(matrix.university_core_matrix.map((row) => row.area_id));
  for (const field of fields) {
    assert(field.status === 'complete' && matrixApplied.get(field.area_id)?.current_status === 'complete' && matrixApplied.get(field.area_id)?.current_artifact === P.appliedFields, `${field.area_id} er ikke bundet som complete i universitetsmatrisen`);
    assert(field.coverage_statement?.trim().length >= 180 && field.limitations_and_ethics?.trim().length >= 220 && field.practice_questions?.length >= 3, `${field.area_id} mangler faglig/etisk dybde`);
    assert(field.emne_ids.length >= 6 && field.emne_ids.every((id) => emneById.has(id)), `${field.area_id} har utilstrekkelig eller uløst emnedekning`);
    assert(field.method_ids.length >= 4 && field.method_ids.every((id) => methodIds.has(id)), `${field.area_id} har utilstrekkelig eller uløst metodedekning`);
    assert(field.university_area_ids.length >= 3 && field.university_area_ids.every((id) => coreAreaIds.has(id)), `${field.area_id} har uløst universitetskjerne`);
    assert(field.source_ids.length >= 3 && field.source_ids.every((id) => sourceIds.has(id)), `${field.area_id} har utilstrekkelig eller uløst kildedekning`);
    assert(field.claim_ids.length >= 3 && field.claim_ids.every((id) => claimIds.has(id)), `${field.area_id} har utilstrekkelig eller uløst claimdekning`);
    assert(field.editorial_review?.status === matrix.applied_field_contract.editorial_review_status_required, `${field.area_id} mangler anvendt-faglig review`);
  }

  const runtime = ahaRuntimeEvidence();
  assert(runtime.referencingFiles.length === 0, `University completion er aktivert i AHA/runtime fra: ${runtime.referencingFiles.join(', ')}`);
  const totalWords = Object.values(articleWordCounts).reduce((sum, count) => sum + count, 0);
  const gates = {
    exact58StandaloneArticles: articles.length === 58,
    allSixCanonicalDomainsCovered: Object.keys(domainCounts).length === 6,
    allArticlesMeetUniversityDepth: Object.values(articleWordCounts).every((count) => count >= 550),
    allArticleSourcesAndClaimsResolve: true,
    allArticlesClinicallyReviewed: true,
    exactCanonicalConceptTermCoverage: concepts.length === expectedTerms.length,
    allConceptsMaterializedAndSourced: true,
    exactSixAppliedFieldsCovered: fields.length === 6,
    allAppliedFieldsMapEmnersMethodsCoreAndEvidence: true,
    noAhaRuntimeActivation: runtime.referencingFiles.length === 0
  };
  const complete = Object.values(gates).every(Boolean);
  const report = {
    schema: 'history_go_fagverk_psykologi_university_completion_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_university_completion_complete' : 'psykologi_university_completion_in_progress',
    generatedFrom: P,
    coverage: { canonicalDomainCount: 6, canonicalEmneCount: 58, canonicalMethodCount: 58, domainArticleCounts: domainCounts },
    articles: { requiredCount: 58, materializedCount: articles.length, minimumWordsPerArticle: 550, totalEditorialWordCount: totalWords, articleWordCounts },
    concepts: { requiredCanonicalTermCount: expectedTerms.length, materializedCount: concepts.length, exactCanonicalTermCoverage: true },
    appliedFields: { requiredCount: 6, materializedCount: fields.length, areaIds: fields.map((field) => field.area_id) },
    evidence: { registeredSourceCount: sourceIds.size, registeredClaimCount: claimIds.size, runtime },
    gates,
    complete
  };
  if (writeReport) write(P.report, projection(report));
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(read(P.report), projection(report)), `${P.report} er utdatert`);
  }
  return { report: projection(report) };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditPsykologiUniversityCompletion({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Psykologi university completion OK: ${report.articles.materializedCount}/58 artikler, ${report.concepts.materializedCount} begreper, ${report.appliedFields.materializedCount}/6 anvendte fagfelt, ${report.articles.totalEditorialWordCount} redaksjonelle ord, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi university completion FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
