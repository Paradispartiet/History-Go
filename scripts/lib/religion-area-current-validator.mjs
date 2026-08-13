import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARTICLE_DIR = 'data/fagverk/religion/emneartikler';
const QUALITY_DIMENSIONS = [
  'correctness_evidence', 'coverage_completion', 'editorial_quality',
  'technical_integrity', 'safety_responsibility', 'maintainability_auditability'
];
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

export function validateReligionAreaCurrentState({ areaId, reportPath }) {
  const readiness = read('data/fag/religion/religion_university_readiness_v1.json');
  const methods = read('data/fag/religion/methods_religion_canonical_v1.json');
  const registry = read('data/fag/religion/kilder_religion_canonical_v1.json');
  const requiredIds = readiness.required_topics_by_area?.[areaId];
  assert(Array.isArray(requiredIds) && requiredIds.length === 6 && new Set(requiredIds).size === 6, `${areaId}: krever seks unike canonicale emner`);
  const area = readiness.university_core_matrix.find((row) => row.area_id === areaId);
  assert(area?.current_status === 'complete', `${areaId}: området er ikke complete i readiness-matrisen`);

  const claimFile = (registry.source_documents || []).find((relative) => {
    if (!fs.existsSync(abs(relative))) return false;
    return read(relative).area_id === areaId;
  });
  assert(claimFile, `${areaId}: mangler claimdokument i kilderegisteret`);
  const claimDocument = read(claimFile);
  const sourceById = new Map((claimDocument.sources || []).map((row) => [row.id, row]));
  const claimById = new Map((claimDocument.claims || []).map((row) => [row.id, row]));
  assert(sourceById.size > 0 && claimById.size > 0, `${areaId}: tomt evidensgrunnlag`);
  assert([...sourceById.values()].every((source) => /^https:\/\//.test(source.url || '') && source.publisher && source.title), `${areaId}: kilde mangler URL eller metadata`);

  const canonicalMethods = new Map((methods.methods || []).map((method) => [method.method_id, method]));
  const usedClaims = new Set();
  const usedSources = new Set();
  const usedMethods = new Set();
  for (const topicId of requiredIds) {
    const article = read(`${ARTICLE_DIR}/${topicId}.json`);
    assert(article.schema === 'history_go_religion_topic_article_v1' && article.article_status === 'complete', `${topicId}: feil artikkelschema/status`);
    assert(article.subject_id === 'religion' && article.area_id === areaId && article.topic_id === topicId, `${topicId}: feil canonical identitet`);
    assert(wordCount(editorialPayload(article)) >= readiness.topic_article_contract.minimum_editorial_words_per_article, `${topicId}: artikkelen er for kort`);
    assert(article.source_ids?.length >= 3 && article.source_ids.every((id) => sourceById.has(id)), `${topicId}: uløst kildesett`);
    assert(article.claim_ids?.length >= 3 && article.claim_ids.every((id) => claimById.get(id)?.topic_id === topicId), `${topicId}: uløst claimsett`);
    article.source_ids.forEach((id) => usedSources.add(id));
    article.claim_ids.forEach((id) => usedClaims.add(id));
    assert(article.documented_cases_or_teaching_scenarios?.length >= 2, `${topicId}: mangler case/scenarioer`);
    assert(article.documented_cases_or_teaching_scenarios.every((item) => ['documented_method_case', 'analytical_teaching_scenario'].includes(item.case_status)), `${topicId}: ugyldig case_status`);
    assert(article.representation_guard?.length >= 180, `${topicId}: representation_guard er for kort`);
    assert(article.editorial_review?.status === 'approved' && Object.values(article.editorial_review.checks || {}).every(Boolean), `${topicId}: editorial review feiler`);
    assert(article.quality_review?.status === 'high_quality' && article.quality_review.total >= 27 && article.quality_review.critical_flags?.length === 0, `${topicId}: quality review feiler`);
    assert(QUALITY_DIMENSIONS.every((dimension) => article.quality_review.scores?.[dimension] >= 4), `${topicId}: kvalitetsdimensjon under 4/5`);
    for (const method of article.methods_and_limitations || []) {
      usedMethods.add(method.method_id);
      assert(readiness.required_method_ids.includes(method.method_id), `${topicId}: metode ligger utenfor universitetsmatrisen`);
      assert(canonicalMethods.get(method.method_id)?.university_matrix_status === 'materialized', `${topicId}: metode er ikke materialisert`);
      assert((method.application || '').length >= 80 && (method.limitations || '').length >= 70, `${topicId}: metodebeskrivelse mangler dybde`);
    }
  }
  assert(usedClaims.size === claimById.size, `${areaId}: ikke alle registrerte claims brukes`);
  assert(usedSources.size > 0 && usedMethods.size > 0, `${areaId}: mangler brukt kilde- eller metodegrunnlag`);
  const report = read(reportPath);
  assert(report.complete === true, `${reportPath}: milestone-rapport er ikke complete`);
  assert(report.coverage?.materializedArticleCount === 6, `${reportPath}: milestone-rapport mangler 6/6 artikler`);
  return { report };
}
