#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditPsykologiUniversityCompletion } from './audit-fagverk-psykologi-university-completion-v1.mjs';
import { CONCEPT_CLAIMS, CONCEPT_GLOSSES, MENTAL_HEALTH_MODEL_CURATION, TOPIC_CURATION } from './lib/psykologi-editorial-curation-v2.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  articles: 'data/fagverk/psykologi/emneartikler',
  concepts: 'data/fag/psykologi/begreper_psykologi_canonical_v1.json',
  appliedFields: 'data/fag/psykologi/anvendte_fagfelt_psykologi_university_v1.json',
  sourceRegistry: 'data/fag/psykologi/kilder_psykologi_canonical_v1.json',
  curation: 'scripts/lib/psykologi-editorial-curation-v2.mjs',
  report: 'reports/fagverk/psykologi-editorial-quality-v2-audit.json'
});
const EXPECTED_APPLIED_CLAIMS = Object.freeze({
  clinical_health: ['phi-07','phi-08','phi-10','phi-16','phi-17','phi-25'],
  work_organizational: ['fti-17','sns-01','sns-04','kfa-11','kfa-27','fti-21'],
  educational_school: ['uol-10','uol-11','uol-12','uol-13','uol-14','uol-15'],
  culture: ['sns-13','sns-14','sns-16','sns-19','uol-22','uol-24'],
  environment_community: ['sns-25','sns-26','sns-27','tkr-07','tkr-18','uol-21'],
  quantitative_psychometrics: ['fti-03','fti-21','fti-22','fti-23','kfa-09','kfa-14']
});
const QUALITY_STANDARD = 'history_go_psykologi_editorial_quality_v2';
const ARTIFICIAL_MODEL_LABEL = /^(?:Flernivåmodellen|Variasjonsmodellen|Kontekstuell belastningsmodell|Probabilistisk risiko|Situasjon–alternativ–læringshistorie-rammen|Kontinuitet–endring-modellen|Relasjonell utviklingsmodell|Eksponering–reaksjon–forløp-rammen|Rettssikkerhetsmodellen|Miljøbelastningsmodellen|Forløpsmodellen|Rettighetsbasert omsorgsmodell|Community-modellen|Community-tjenestenettverk|Community-velferdsmodellen|Alliansemodellen|Distribuert terapirom|Asylmodellen|Kontinuummodellen|Fellesfaktorperspektivet|Modellen for sosiale determinanter)$/i;
const ESTABLISHED_MODEL_MARKER = /(?:Gross|Nelson|Nurturing Care|Watson|Skinner|Tversky|Kahneman|Gigerenzer|SEP|Stanford Encyclopedia|ICD-11|Testing Standards|kontaktteori|sosial identitetsteori|Posner|Petersen|Heuristics-and-biases|livsløpsperspektiv|multisystemiske resiliensrammer|femfaktormodell|Freud|selvbestemmelsesteori|prediktiv prosessering|transaksjonsmodellen|allostase|WHO|Ainsworth)/i;
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const unique = (values) => [...new Set(values)];

function evidenceIndex() {
  const registry = read(P.sourceRegistry);
  const sources = new Set((registry.sources || []).map((source) => source.id));
  const claims = new Map();
  for (const file of registry.source_documents || []) {
    const document = read(file);
    for (const source of document.sources || []) sources.add(source.id);
    for (const claim of document.claims || []) claims.set(claim.id, claim);
  }
  return { sources, claims };
}

function sourceBound(section, articleClaimIds, claims) {
  const text = `${section.title || section.name || ''} ${section.content || section.analysis || section.role || ''}`;
  return section.claim_ids?.length > 0 && section.claim_ids.every((id) => {
    const claim = claims.get(id);
    return articleClaimIds.includes(id) && claim && text.includes(claim.claim) && claim.source_ids.every((sourceId) => section.source_ids?.includes(sourceId));
  });
}

// The frame gate measures all substantive article prose; standardized misuse guards remain deliberately identical.
function editorialTextSections(article) {
  return [
    article.definition,
    ...(article.background || []),
    ...(article.theories_and_findings || []).map((item) => `${item.title || ''} ${item.content || ''}`),
    ...(article.methods || []).flatMap((item) => [`${item.label || ''} ${item.application || ''}`, item.limitations || '']),
    ...(article.boundaries_and_disagreements || []).flatMap((item) => [item.question || '', ...(item.positions || []), item.evidence_needed || '']),
    ...(article.examples || []).map((item) => `${item.title || ''} ${item.analysis || ''}`),
    ...(article.learning_outcomes || []),
    ...(article.key_questions || []),
    ...(article.models_or_researchers || []).flatMap((item) => [`${item.name || ''} ${item.role || ''}`, item.use_limit || ''])
  ].filter(Boolean);
}

function editorialFrameInputs(article) {
  const declared = article.editorial_frame_inputs || [];
  const fallback = [
    article.title,
    article.editorial_focus,
    ...(article.models_or_researchers || []).map((item) => item.name),
    ...(article.methods || []).map((item) => item.label),
    ...(article.examples || []).flatMap((item) => [item.title, String(item.title || '').split(':').slice(1).join(':').trim()])
  ];
  return unique([...declared, ...fallback])
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.toLocaleLowerCase('nb-NO'))
    .sort((left, right) => right.length - left.length);
}

function editorialFrameSimilarity(articles, claims) {
  const claimTexts = [...claims.values()].map((claim) => claim.claim.toLocaleLowerCase('nb-NO')).sort((left, right) => right.length - left.length);
  const articleFrames = [];
  for (const article of articles) {
    const sectionTexts = editorialTextSections(article);
    const variables = editorialFrameInputs(article);
    const framesFor = (rawText) => {
      let text = rawText.toLocaleLowerCase('nb-NO');
      for (const claimText of claimTexts) text = text.replaceAll(claimText, ' ');
      for (const variable of variables) text = text.replaceAll(variable, ' <term> ');
      const tokens = text.replace(/[^a-zæøå0-9<>]+/g, ' ').trim().split(/\s+/).filter(Boolean);
      const frames = new Set();
      for (let index = 0; index <= tokens.length - 10; index += 1) frames.add(tokens.slice(index, index + 10).join(' '));
      return frames;
    };
    const sectionFrames = sectionTexts.map(framesFor);
    articleFrames.push({
      emne_id: article.emne_id,
      frames: new Set(sectionFrames.flatMap((frames) => [...frames])),
      sectionFrames,
      normalizationInputCount: variables.length,
      declaredNormalizationInputs: (article.editorial_frame_inputs || []).length
    });
  }
  const pairs = [];
  for (let left = 0; left < articleFrames.length; left += 1) {
    for (let right = left + 1; right < articleFrames.length; right += 1) {
      const first = articleFrames[left];
      const second = articleFrames[right];
      const intersection = [...first.frames].filter((frame) => second.frames.has(frame)).length;
      const denominator = first.frames.size + second.frames.size - intersection;
      const similarity = denominator === 0 ? 0 : intersection / denominator;
      let maximumLocalSharedFrameCount = 0;
      for (const firstSection of first.sectionFrames) for (const secondSection of second.sectionFrames) {
        maximumLocalSharedFrameCount = Math.max(maximumLocalSharedFrameCount, [...firstSection].filter((frame) => secondSection.has(frame)).length);
      }
      pairs.push({
        emne_ids: [first.emne_id, second.emne_id],
        shared_frame_count: intersection,
        maximum_local_shared_frame_count: maximumLocalSharedFrameCount,
        similarity: Number(similarity.toFixed(6))
      });
    }
  }
  pairs.sort((a, b) => b.maximum_local_shared_frame_count - a.maximum_local_shared_frame_count || b.similarity - a.similarity || a.emne_ids.join('|').localeCompare(b.emne_ids.join('|')));
  const similarityThreshold = 0.14;
  const localSharedFrameThreshold = 20;
  const similarityViolations = pairs.filter((pair) => pair.similarity >= similarityThreshold);
  const localViolations = pairs.filter((pair) => pair.maximum_local_shared_frame_count > localSharedFrameThreshold);
  return {
    maximumSimilarity: Math.max(0, ...pairs.map((pair) => pair.similarity)),
    similarityAdvisoryThreshold: similarityThreshold,
    similarityHardThreshold: similarityThreshold,
    pairsAboveSimilarityAdvisory: similarityViolations.length,
    maximumSharedFrameCount: Math.max(0, ...pairs.map((pair) => pair.shared_frame_count)),
    maximumLocalSharedFrameCount: Math.max(0, ...pairs.map((pair) => pair.maximum_local_shared_frame_count)),
    localSharedFrameThreshold,
    curatedArticlesWithDeclaredNormalizationInputs: articleFrames.filter((row) => TOPIC_CURATION[row.emne_id] && row.declaredNormalizationInputs >= 10).length,
    minimumNormalizationInputCount: Math.min(...articleFrames.map((row) => row.normalizationInputCount)),
    violations: unique([...similarityViolations, ...localViolations].map((pair) => pair.emne_ids.join('|'))).map((key) => pairs.find((pair) => pair.emne_ids.join('|') === key))
  };
}

function expectedModelsFor(article) {
  return TOPIC_CURATION[article.emne_id]?.models || MENTAL_HEALTH_MODEL_CURATION[article.emne_id] || [];
}

function modelEvidenceForClaims(claimIds, claims) {
  const evidence = [];
  for (const claimId of claimIds) {
    const claim = claims.get(claimId);
    for (const profile of [...Object.values(TOPIC_CURATION), ...Object.values(MENTAL_HEALTH_MODEL_CURATION).map((models) => ({ models }))]) {
      for (const model of profile.models.filter((item) => item.claimId === claimId)) {
        if (!evidence.some((row) => row.name === model.name && row.claim_id === claimId)) evidence.push({ name: model.name, claim_id: claimId, source_ids: [...claim.source_ids].sort() });
      }
    }
  }
  return evidence;
}

function deriveScore(dimensions) {
  const scores = {};
  const evidence = {};
  for (const [id, checks] of Object.entries(dimensions)) {
    const minimum = Object.entries(checks.minimum);
    const excellence = Object.entries(checks.excellence || {});
    scores[id] = minimum.every(([, value]) => value) ? (excellence.every(([, value]) => value) ? 5 : 4) : 1;
    evidence[id] = { minimum: Object.fromEntries(minimum), excellence: Object.fromEntries(excellence), derived_score: scores[id] };
  }
  return { scores, evidence };
}

const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  scope: report.scope,
  evidence: report.evidence,
  gates: report.gates,
  qualityAssessment: report.qualityAssessment,
  highQuality: report.highQuality
});

export function auditPsykologiEditorialQualityV2({ writeReport = false, checkReport = true } = {}) {
  const { report: completion } = auditPsykologiUniversityCompletion({ checkReport: false });
  const { sources, claims } = evidenceIndex();
  const articleFiles = fs.readdirSync(abs(P.articles)).filter((file) => file.endsWith('.json')).sort();
  const articles = articleFiles.map((file) => read(`${P.articles}/${file}`));
  const curatedArticles = articles.filter((article) => TOPIC_CURATION[article.emne_id]);
  assert(curatedArticles.length === 46 && Object.keys(TOPIC_CURATION).length === 46, 'V2-kuratering skal dekke eksakt de 46 tidligere malgenererte artiklene');

  for (const article of articles) {
    assert(article.quality_review?.status === 'approved_editorial_quality_v2' && article.quality_review?.review_standard === QUALITY_STANDARD, `${article.emne_id} mangler v2-kvalitetsreview`);
    const expectedModels = expectedModelsFor(article);
    assert(expectedModels.length >= 2, `${article.emne_id} mangler eksplisitt modellkuratering`);
    assert(isDeepStrictEqual(article.models_or_researchers.map((item) => ({ name: item.name, claimId: item.claim_ids?.[0] })), expectedModels), `${article.emne_id} avviker fra eksplisitt modellkuratering`);
    assert(!article.models_or_researchers.some((item) => /^(?:Evidensmodell|Kontekstmodell):/i.test(item.name) || ARTIFICIAL_MODEL_LABEL.test(item.name)), `${article.emne_id} bruker kunstig modellnavn`);
    assert(article.examples.length >= 2 && article.examples.every((item) => item.case_status === 'analytical_teaching_scenario' && /hypotetisk|konstruert/i.test(item.analysis)), `${article.emne_id} fremstiller undervisningsscenario som dokumentert case`);
  }
  for (const article of curatedArticles) {
    const profile = TOPIC_CURATION[article.emne_id];
    assert(isDeepStrictEqual(article.claim_ids, profile.claimIds), `${article.emne_id} avviker fra håndkuratert claim-kjede`);
    assert(isDeepStrictEqual(article.theories_and_findings.slice(0,2).map((item) => item.title), profile.models.map((item) => item.name)), `${article.emne_id} mangler kuraterte teorinavn`);
    assert(profile.models.every((item) => !ARTIFICIAL_MODEL_LABEL.test(item.name)), `${article.emne_id} bruker oppdiktet modellnavn`);
    assert(profile.models.every((item) => !/(?:modell|teori|ramme|perspektiv)/i.test(item.name) || ESTABLISHED_MODEL_MARKER.test(item.name)), `${article.emne_id} har modellaktig etikett uten etablert teori-, forsker- eller kilderamme`);
    const declaredInputs = article.editorial_frame_inputs || [];
    const editorialCorpus = editorialTextSections(article).join(' ');
    const requiredInputs = unique([article.title, article.editorial_focus, profile.boundary, ...profile.models.map((item) => item.name), ...article.methods.map((item) => item.label)]);
    assert(declaredInputs.length >= 10 && requiredInputs.every((value) => declaredInputs.includes(value)), `${article.emne_id} deklarerer ikke alle generatorfeltene for normalisering`);
    assert(declaredInputs.every((value) => typeof value === 'string' && value.length > 0 && value.length <= 300), `${article.emne_id} har ugyldig normaliseringsfelt`);
    assert(requiredInputs.every((value) => editorialCorpus.includes(value)), `${article.emne_id} mangler et obligatorisk generatorfelt i artikkelprosaen`);
  }
  for (const article of articles) assert([...article.theories_and_findings, ...article.examples, ...article.models_or_researchers].every((section) => sourceBound(section, article.claim_ids, claims)), `${article.emne_id} har seksjon uten eksplisitt direkte claim–kilde-binding`);
  const frameSimilarity = editorialFrameSimilarity(articles, claims);
  assert(frameSimilarity.violations.length === 0, `De 58 v2-artiklene har ${frameSimilarity.violations.length} par med for høy lokal normalisert 10-ords-likhet`);

  const conceptsDoc = read(P.concepts);
  const concepts = conceptsDoc.concepts || [];
  assert(isDeepStrictEqual(Object.keys(CONCEPT_GLOSSES).sort((a,b)=>a.localeCompare(b,'nb')), concepts.map((concept) => concept.canonical_term).sort((a,b)=>a.localeCompare(b,'nb'))), 'Håndredigerte begrepskjerner dekker ikke eksakt canonicalt register');
  for (const concept of concepts) {
    const gloss = CONCEPT_GLOSSES[concept.canonical_term];
    assert(concept.definition.includes(gloss) && !/canonicalt psykologibegrep/i.test(concept.definition), `${concept.concept_id} har ikke håndredigert definisjonskjerne`);
    assert(concept.editorial_status === 'editorial_ready_v2' && isDeepStrictEqual(concept.claim_ids, CONCEPT_CLAIMS[concept.canonical_term]), `${concept.concept_id} avviker fra eksplisitt claim-kuratering`);
    const claimSources = unique(concept.claim_ids.flatMap((id) => {
      const claim = claims.get(id);
      assert(claim, `${concept.concept_id} peker til ukjent claim ${id}`);
      assert(concept.explanation.includes(claim.claim), `${concept.concept_id} bruker claim ${id} uten å binde påstanden i forklaringen`);
      return claim.source_ids;
    })).sort();
    assert(isDeepStrictEqual(claimSources, [...concept.source_ids].sort()) && claimSources.every((id) => sources.has(id)), `${concept.concept_id} har svak claim–kilde-binding`);
    const expectedModelEvidence = modelEvidenceForClaims(concept.claim_ids, claims);
    assert(isDeepStrictEqual(concept.model_evidence, expectedModelEvidence), `${concept.concept_id} har modell som ikke støttes av begrepets egne claims`);
    assert(isDeepStrictEqual(concept.models_or_researchers, unique(expectedModelEvidence.map((row) => row.name))), `${concept.concept_id} har inkonsistent modellvisning`);
    assert(concept.model_assignment_status === (expectedModelEvidence.length ? 'claim_supported' : 'no_named_model_supported_by_curated_claims'), `${concept.concept_id} mangler ærlig modellstatus`);
  }

  const appliedDoc = read(P.appliedFields);
  for (const field of appliedDoc.fields || []) {
    assert(isDeepStrictEqual(field.claim_ids, EXPECTED_APPLIED_CLAIMS[field.area_id]), `${field.area_id} avviker fra håndkuratert anvendt claim-kjede`);
    assert(field.editorial_review?.status === 'approved_editorial_quality_v2' && field.editorial_review?.review_standard === QUALITY_STANDARD, `${field.area_id} mangler v2-review`);
    assert(field.practice_questions.length === 3 && field.limitations_and_ethics.length >= 250, `${field.area_id} mangler feltspesifikk metode- eller etikkdybde`);
  }

  const gates = {
    universityCompletionStillGreen: completion.complete === true,
    all58ArticlesQualityReviewed: articles.length === 58,
    exact46FormerTemplateArticlesCurated: curatedArticles.length === 46,
    curatedClaimChainsExact: true,
    everyArticleSectionDirectlyClaimAndSourceBound: true,
    realModelsReplaceArtificialLabels: true,
    hypotheticalCasesDeclaredHonestly: true,
    allSubstitutedEditorialFieldsNormalized: frameSimilarity.curatedArticlesWithDeclaredNormalizationInputs === 46,
    normalizedTenWordCorpusSimilarityBelowHardThreshold: frameSimilarity.pairsAboveSimilarityAdvisory === 0 && frameSimilarity.maximumSimilarity < frameSimilarity.similarityHardThreshold,
    normalizedTenWordLocalFrameReuseBelowAbsoluteThreshold: frameSimilarity.violations.length === 0,
    all136ConceptDefinitionsHandEdited: concepts.length === 136,
    everyConceptClaimAndSourceBound: true,
    allSixAppliedFieldsSpecificallyReviewed: (appliedDoc.fields || []).length === 6,
    noAhaRuntimeActivation: completion.gates.noAhaRuntimeActivation === true
  };
  const dimensions = {
    correctness_and_evidence: { minimum: { all_article_sections_directly_bound: gates.everyArticleSectionDirectlyClaimAndSourceBound, all_concepts_explicitly_curated: gates.everyConceptClaimAndSourceBound, applied_fields_claim_curated: gates.allSixAppliedFieldsSpecificallyReviewed }, excellence: { external_subject_matter_peer_review: false } },
    coverage_and_completion: { minimum: { all_articles: gates.all58ArticlesQualityReviewed, all_concepts: gates.all136ConceptDefinitionsHandEdited, all_applied_fields: gates.allSixAppliedFieldsSpecificallyReviewed }, excellence: { university_matrix_complete: gates.universityCompletionStillGreen } },
    disciplinary_editorial_quality: { minimum: { topic_specific_curation: gates.exact46FormerTemplateArticlesCurated, all_substituted_fields_normalized: gates.allSubstitutedEditorialFieldsNormalized, normalized_corpus_similarity_below_hard_threshold: gates.normalizedTenWordCorpusSimilarityBelowHardThreshold, normalized_local_frame_reuse_below_absolute_threshold: gates.normalizedTenWordLocalFrameReuseBelowAbsoluteThreshold, named_models: gates.realModelsReplaceArtificialLabels }, excellence: { external_editorial_peer_review: false } },
    technical_integrity: { minimum: { completion_audit_green: gates.universityCompletionStillGreen, exact_claim_chains: gates.curatedClaimChainsExact }, excellence: { deterministic_machine_audit: true } },
    safety_and_responsibility: { minimum: { honest_scenarios: gates.hypotheticalCasesDeclaredHonestly, aha_inactive: gates.noAhaRuntimeActivation }, excellence: { non_clinical_scope_review_on_all_articles: articles.every((article) => article.editorial_review?.checks?.no_individual_diagnosis === true) } },
    maintainability_and_auditability: { minimum: { explicit_topic_curation: Object.keys(TOPIC_CURATION).length === 46, explicit_concept_curation: Object.keys(CONCEPT_CLAIMS).length === 136, machine_readable_report: true }, excellence: { every_gate_has_concrete_evidence: true } }
  };
  const { scores: score, evidence: dimensionEvidence } = deriveScore(dimensions);
  const total = Object.values(score).reduce((sum, value) => sum + value, 0);
  const criticalFlags = Object.entries(gates).filter(([, value]) => !value).map(([key]) => key);
  const highQuality = Object.values(gates).every(Boolean) && Object.values(score).every((value) => value >= 4) && total >= 27 && criticalFlags.length === 0;
  const report = {
    schema: 'history_go_fagverk_psykologi_editorial_quality_audit_v2',
    version: '2.0.0',
    status: highQuality ? 'psykologi_editorial_quality_v2_high' : 'psykologi_editorial_quality_v2_blocked',
    generatedFrom: P,
    scope: { canonicalArticleCount: articles.length, curatedArticleCount: curatedArticles.length, handEditedConceptCount: concepts.length, appliedFieldCount: (appliedDoc.fields || []).length },
    evidence: { resolvedClaimCount: claims.size, resolvedSourceCount: sources.size, normalizedTenWordFrameSimilarity: frameSimilarity, qualityDimensionEvidence: dimensionEvidence, automatedLimits: ['Kontrollen verifiserer repository-evidens, kurateringskontrakter og redaksjonell egenart; separat ekstern fagfellevurdering kreves fortsatt før AHA-runtime-aktivering.'] },
    gates,
    qualityAssessment: { scale: '1_to_5', minimumPerDimension: 4, minimumTotal: 27, scores: score, total, maximum: 30, criticalFlags, conclusion: highQuality ? 'high_quality' : 'blocked' },
    highQuality
  };
  if (writeReport) write(P.report, projection(report));
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(read(P.report), projection(report)), `${P.report} er utdatert`);
  }
  assert(highQuality, `Psykologi består ikke kvalitetsporten: ${criticalFlags.join(', ')}`);
  return { report: projection(report) };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditPsykologiEditorialQualityV2({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Psykologi editorial quality v2 OK: ${report.scope.curatedArticleCount}/46 reviderte artikler, ${report.scope.handEditedConceptCount}/136 begreper, ${report.scope.appliedFieldCount}/6 anvendte felt, score ${report.qualityAssessment.total}/${report.qualityAssessment.maximum}.`);
  } catch (error) {
    console.error(`Psykologi editorial quality v2 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
