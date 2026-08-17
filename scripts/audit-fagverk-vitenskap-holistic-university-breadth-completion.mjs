#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  release: 'data/fagverk/fagverk_release.json',
  pensum: 'data/fag/vitenskap/vitenskappensum_canonical_v4_6.json',
  emners: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json',
  methods: 'data/fag/vitenskap/methods_vitenskap_canonical_v4_6.json',
  mappings: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json',
  technologyIndex: 'data/fag/teknologi/teknologi_scientific_v2/index.json',
  qualityReview: 'data/fag/vitenskap/vitenskap_holistic_quality_review_v1.json',
  report: 'reports/fagverk/vitenskap-holistic-university-breadth-completion-audit.json'
});

const FINAL_STATUS = 'university_breadth_complete';
const FINAL_GATE = 'final_holistic_university_breadth_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const QUALITY_DIMENSIONS = [
  'correctness_evidence',
  'coverage_completion',
  'editorial_quality',
  'technical_integrity',
  'safety_responsibility',
  'maintainability_auditability'
];
const OLD_GENERIC_QUESTIONS = [
  'Hvilken konkret institusjon, metode, instrument, modell, datasett, observasjon, forskningsmiljø eller vitenskapelig kilde gjør emnet relevant?',
  'Hvordan produseres, måles, standardiseres, modelleres, testes eller kritiseres kunnskapen her?',
  'Hvilke kilder, arkivspor, forskningsrapporter, fagpublikasjoner, institusjonskilder, datasett eller dokumenterte vitenskapelige praksiser kan bekrefte påstanden?'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const exists = (p) => fs.existsSync(abs(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (values) => new Set(values).size === values.length;
const sorted = (values) => [...values].sort();
const sameSet = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && unique(a) && sorted(a).every((x, i) => x === sorted(b)[i]);
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

function shingles(text, n = 5) {
  const words = String(text).toLowerCase().replace(/[^a-z0-9æøåäöüéèáàíìóòúùñ]+/giu, ' ').trim().split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i <= words.length - n; i += 1) out.add(words.slice(i, i + n).join(' '));
  return out;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}
function questionSetKey(row) {
  return JSON.stringify((row.key_questions || []).map((q) => String(q).trim().replace(/\s+/g, ' ')));
}
function qualityReviewResult(readiness, materialPrerequisitesPass) {
  if (!exists(P.qualityReview)) {
    return {
      status: materialPrerequisitesPass ? 'missing_required_review' : 'deferred_until_material_blockers_close',
      file: P.qualityReview,
      scores: null,
      totalScore: null,
      passes: false
    };
  }
  const review = json(P.qualityReview);
  assert(review.schema === 'history_go_fagverk_vitenskap_holistic_quality_review_v1', 'Holistic quality review har feil schema');
  assert(review.subject_id === 'vitenskap', 'Holistic quality review har feil subject');
  assert(isDeepStrictEqual(review.dimensions, QUALITY_DIMENSIONS), 'Holistic quality review har feil dimensjoner');
  const scores = review.scores || {};
  assert(QUALITY_DIMENSIONS.every((id) => Number.isInteger(scores[id]) && scores[id] >= 1 && scores[id] <= 5), 'Holistic quality review har ugyldige scorer');
  const totalScore = QUALITY_DIMENSIONS.reduce((sum, id) => sum + scores[id], 0);
  const passes = materialPrerequisitesPass && QUALITY_DIMENSIONS.every((id) => scores[id] >= readiness.quality_contract.minimum_dimension_score) && totalScore >= readiness.quality_contract.minimum_total_score;
  return { status: passes ? 'pass' : 'fail', file: P.qualityReview, scores, totalScore, passes };
}

export function auditVitenskapHolisticUniversityBreadthCompletion({ writeReport = false, checkReport = true } = {}) {
  const readiness = json(P.readiness);
  const status = json(P.status);
  const registry = json(P.registry);
  const release = json(P.release);
  const pensum = json(P.pensum);
  const emners = json(P.emners);
  const methodsDocument = json(P.methods);
  const mappings = json(P.mappings);
  const technologyIndex = json(P.technologyIndex);
  const statusEntry = status.subjects.find((row) => row.id === 'vitenskap');
  const registrySubject = registry.subjects?.vitenskap;
  const releaseSubject = release.subjects?.vitenskap;
  const methods = methodsDocument.methods || [];

  assert(readiness.subject_id === 'vitenskap', 'Holistic audit fikk feil readiness-subject');
  assert(Array.isArray(readiness.completion_requirements) && readiness.completion_requirements.length === 10, 'Readiness må ha ti completion requirements');
  assert(readiness.quality_contract?.minimum_dimension_score === 4 && readiness.quality_contract?.minimum_total_score === 27, 'Readiness har feil kvalitetsgrenser');
  assert(isDeepStrictEqual(readiness.quality_contract?.dimensions, QUALITY_DIMENSIONS), 'Readiness har feil kvalitetsdimensjoner');
  assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 0, 'Strukturelle breadth-gaps skal være reconcilet før final audit');
  assert(Array.isArray(readiness.editorial_blockers) && readiness.editorial_blockers.length === 0, 'Kapittelproduksjonens breadth-blockers skal være lukket før final audit');

  const completionState = readiness.complete_ready === true ? 'complete' : 'pending_final_audit';
  if (completionState === 'pending_final_audit') {
    assert(readiness.status === 'breadth_chapters_materialized_final_audit_pending', 'Pending state har feil readiness-status');
    assert(readiness.next_gate === FINAL_GATE, 'Pending state må peke til holistic audit');
    assert(statusEntry?.editorialStatus === 'chapters_in_progress' && statusEntry?.nextGate === FINAL_GATE, 'Pending subject status har feil fase');
  } else {
    assert(readiness.status === FINAL_STATUS && readiness.next_gate === MAINTENANCE_GATE, 'Complete readiness har feil sluttfase');
    assert(statusEntry?.editorialStatus === 'complete' && statusEntry?.nextGate === MAINTENANCE_GATE, 'Complete subject status har feil sluttfase');
  }

  assert(isDeepStrictEqual(pensum.summary, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    topic_hook_count: 64,
    all_emner_have_mapping: true,
    all_method_refs_valid: true
  }), 'Canonical v4.6 summary har endret seg');
  assert(emners.length === 117 && methods.length === 84 && mappings.length === 117, 'Canonical inventory-counts matcher ikke v4.6');
  assert(unique(emners.map((row) => row.emne_id)), 'Canonical Vitenskap har dupliserte emne-ID-er');
  assert(unique(emners.map((row) => row.title)), 'Canonical Vitenskap har dupliserte titler');
  assert(unique(mappings.map((row) => row.emne_id)), 'Canonical Vitenskap har dupliserte mapping-ID-er');

  const methodIds = new Set(methods.map((row) => row.method_id));
  const mappingIds = new Set(mappings.map((row) => row.emne_id));
  for (const emne of emners) {
    assert(emne.canonical_status === 'canonical', `${emne.emne_id} er ikke canonical`);
    assert(typeof emne.definition === 'string' && emne.definition.trim(), `${emne.emne_id} mangler definisjon`);
    assert(typeof emne.why_it_matters === 'string' && emne.why_it_matters.trim(), `${emne.emne_id} mangler why_it_matters`);
    assert(Array.isArray(emne.methods) && emne.methods.length >= 1 && emne.methods.every((id) => methodIds.has(id)), `${emne.emne_id} har ugyldige metodekoblinger`);
    assert(mappingIds.has(emne.emne_id), `${emne.emne_id} mangler canonical mapping`);
    if (emne.registry_version === 'vitenskappensum_v4_6') {
      assert(emne.definition.length >= 170, `${emne.emne_id} bryter eksplisitt v4.6 definition-kontrakt`);
      assert(emne.why_it_matters.length >= 140, `${emne.emne_id} bryter eksplisitt v4.6 why-kontrakt`);
      assert(Array.isArray(emne.key_questions) && emne.key_questions.length >= 3, `${emne.emne_id} bryter eksplisitt v4.6 question-kontrakt`);
      assert(emne.methods.length >= 3, `${emne.emne_id} bryter eksplisitt v4.6 method-kontrakt`);
    }
  }

  assert(Array.isArray(registrySubject?.chapters) && registrySubject.chapters.length >= 1, 'Vitenskap mangler registrerte kapitler');
  assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === registrySubject.chapters.length, 'Readiness/registry chapter count mismatch');
  assert(releaseSubject?.chapter_status === 'materialized' && releaseSubject?.chapter_count === registrySubject.chapters.length, 'Release/registry chapter count mismatch');
  assert(releaseSubject?.missing_chapter_files?.length === 0, 'Release har manglende Vitenskap-kapittelfiler');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  const chapterOwned = [];
  const allSectionIds = [];
  const allClaimIds = [];
  const allSourceIds = [];
  const paragraphRecords = [];
  const chapterSummaries = [];
  let methodsWithLimitsChapterCount = 0;
  let allClaimsResolve = true;
  let fillerClean = true;

  for (const meta of registrySubject.chapters) {
    assert(meta.file && meta.briefFile && meta.claimsFile, `${meta.id} mangler registry-filer`);
    for (const file of [meta.file, meta.briefFile, meta.claimsFile]) assert(exists(file), `${meta.id} mangler ${file}`);
    const chapter = json(meta.file);
    const brief = json(meta.briefFile);
    const claimsDocument = json(meta.claimsFile);
    assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.chapter_id === meta.id && chapter.subject_id === 'vitenskap', `${meta.id} har feil chapter root`);
    assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, `${meta.id} er ikke chapter_ready med claim trace`);
    assert(sameSet(chapter.emne_ids || [], meta.emne_ids || []), `${meta.id} root/registry emne-sett mismatch`);
    assert((chapter.emne_ids || []).every((id) => canonicalEmneIds.has(id)), `${meta.id} peker til ukjent canonicalt emne`);
    chapterOwned.push(...(chapter.emne_ids || []));

    const modules = (chapter.moduleFiles || []).map((file) => { assert(exists(file), `${meta.id} mangler modul ${file}`); return json(file); });
    const sections = modules.flatMap((module) => module.sections || []);
    const paragraphs = sections.flatMap((section) => section.paragraphs || []);
    const claims = claimsDocument.claims || [];
    const sources = claimsDocument.sources || [];
    const claimIds = new Set(claims.map((row) => row.id));
    const sourceIds = new Set(sources.map((row) => row.id));
    assert(unique([...claimIds]) && unique([...sourceIds]), `${meta.id} har dupliserte claim/source-ID-er`);
    assert(unique(sections.map((row) => row.id)), `${meta.id} har dupliserte section-ID-er`);
    assert(unique(paragraphs), `${meta.id} har identiske fagavsnitt internt`);

    const refsBySection = new Map();
    for (const section of sections) {
      const refs = new Set([...flatten(section.paragraphClaimIds), ...flatten(section.keyPointClaimIds)]);
      if (![...refs].every((id) => claimIds.has(id))) allClaimsResolve = false;
      refsBySection.set(section.id, refs);
    }
    const allRefs = new Set([...refsBySection.values()].flatMap((set) => [...set]));
    if (!claims.every((claim) => claim.status === 'verified' && claim.source_ids?.length && claim.source_ids.every((id) => sourceIds.has(id)) && allRefs.has(claim.id))) allClaimsResolve = false;
    if (!sources.every((source) => /^https:\/\//.test(source.url || '') && source.publisher && typeof source.source_location === 'string' && source.source_location.trim())) allClaimsResolve = false;
    for (const claim of claims) {
      const actual = [...refsBySection.entries()].filter(([, refs]) => refs.has(claim.id)).map(([id]) => id);
      if (!isDeepStrictEqual(sorted(actual), sorted(claim.used_in || []))) allClaimsResolve = false;
    }

    if (paragraphs.some((text) => /\b(todo|tbd|placeholder|lorem ipsum|kommer senere|fyll inn|generisk tekst)\b/i.test(text))) fillerClean = false;
    const methodLimitsText = [
      brief.purpose,
      ...(brief.requiredCriticalDistinctions || []),
      ...(brief.scope?.included || []),
      ...(brief.scope?.excluded || []),
      ...(brief.rejectedOrDeferred || []).flatMap((row) => [row.detail, row.reason]),
      ...paragraphs
    ].join(' ');
    if (/begrens|usikker|forutset|bias|feilkilde|gyldig|valid|blindson|overførbar|kalibr/i.test(methodLimitsText)) methodsWithLimitsChapterCount += 1;

    sections.forEach((section) => section.paragraphs?.forEach((text, index) => paragraphRecords.push({ chapterId: meta.id, sectionId: section.id, index, text, shingles: shingles(text) })));
    allSectionIds.push(...sections.map((row) => row.id));
    allClaimIds.push(...claims.map((row) => row.id));
    allSourceIds.push(...sources.map((row) => row.id));
    chapterSummaries.push({ id: meta.id, emneCount: chapter.emne_ids?.length || 0, moduleCount: modules.length, sectionCount: sections.length, paragraphCount: paragraphs.length, claimCount: claims.length, sourceCount: sources.length });
  }

  assert(unique(chapterOwned), 'Et canonicalt emne eies av mer enn ett Vitenskap-kapittel');
  assert(unique(allSectionIds), 'Vitenskap har globalt duplisert section-ID');
  assert(unique(allClaimIds), 'Vitenskap har globalt duplisert claim-ID');
  assert(unique(allSourceIds), 'Vitenskap har globalt duplisert source-ID');
  assert(unique(paragraphRecords.map((row) => row.text)), 'Vitenskap gjenbruker identiske fagavsnitt på tvers av kapitler');

  let maxCrossChapterSimilarity = 0;
  let mostSimilarPair = null;
  for (let i = 0; i < paragraphRecords.length; i += 1) {
    for (let j = i + 1; j < paragraphRecords.length; j += 1) {
      const a = paragraphRecords[i], b = paragraphRecords[j];
      if (a.chapterId === b.chapterId) continue;
      const score = jaccard(a.shingles, b.shingles);
      if (score > maxCrossChapterSimilarity) {
        maxCrossChapterSimilarity = score;
        mostSimilarPair = { a: `${a.chapterId}/${a.sectionId}/${a.index + 1}`, b: `${b.chapterId}/${b.sectionId}/${b.index + 1}` };
      }
    }
  }

  const ownedSet = new Set(chapterOwned);
  const uncovered = emners.filter((row) => !ownedSet.has(row.emne_id));
  const legacy = emners.filter((row) => row.registry_version === 'vitenskappensum_v4_5');
  const questionGroups = new Map();
  for (const row of legacy) {
    const key = questionSetKey(row);
    if (!questionGroups.has(key)) questionGroups.set(key, []);
    questionGroups.get(key).push(row.emne_id);
  }
  const largestLegacyQuestionTemplateReuse = Math.max(...[...questionGroups.values()].map((ids) => ids.length));
  const oldGenericSetKey = JSON.stringify(OLD_GENERIC_QUESTIONS);
  const oldGenericQuestionSetEmneCount = questionGroups.get(oldGenericSetKey)?.length || 0;
  const missingLegacyKeyQuestionEmneCount = legacy.filter((row) => !Array.isArray(row.key_questions) || row.key_questions.length === 0).length;
  const uncoveredWithLegacyTemplateMetadata = uncovered.filter((row) => row.registry_version === 'vitenskappensum_v4_5' && (questionSetKey(row) === oldGenericSetKey || !row.key_questions?.length)).length;

  const neighborBoundariesPass = sameSet(readiness.neighbor_boundaries?.map((row) => row.subject_id), ['natur', 'filosofi', 'teknologi']) && readiness.neighbor_boundaries.find((row) => row.subject_id === 'teknologi')?.relationship === 'nested_specialization';
  const technologyPass = readiness.current_inventory?.teknologi?.canonical_parent_subject === 'vitenskap' && readiness.current_inventory?.teknologi?.top_level_subject === false && technologyIndex.counts?.areas === 12 && technologyIndex.counts?.topics === 48 && technologyIndex.counts?.methods === 35 && technologyIndex.counts?.hooks === 36;
  const crossChapterOriginalityPass = maxCrossChapterSimilarity < 0.42;
  const explicitEditorialCoveragePass = uncovered.length === 0;
  const methodLimitsPass = methodsWithLimitsChapterCount === registrySubject.chapters.length;
  const registryReleaseStatePass = releaseSubject.chapter_count === registrySubject.chapters.length && readiness.current_inventory.vitenskap.registered_chapter_count === registrySubject.chapters.length;

  const completionRequirements = {
    all_blocking_coverage_gaps_reconciled_into_canonical_inventory_or_explicitly_justified_elsewhere: readiness.blocking_gaps.length === 0,
    neighbor_boundaries_resolved_without_duplicate_subject_truth: neighborBoundariesPass,
    all_included_relevant_emners_have_full_editorial_treatment: explicitEditorialCoveragePass,
    all_claims_resolve_to_inspectable_sources_supporting_the_specific_claim: allClaimsResolve,
    methods_are_taught_with_material_limits_and_uncertainty: methodLimitsPass,
    technology_remains_nested_and_its_existing_scientific_quality_gates_stay_green: technologyPass,
    gap_overlap_and_filler_audit_has_no_material_findings: fillerClean && unique(chapterOwned),
    cross_chapter_editorial_originality_review_passes: crossChapterOriginalityPass,
    full_subject_quality_review_scores_at_least_27_of_30_with_no_dimension_below_4: false,
    subject_status_and_release_artifacts_match_actual_materialized_content: registryReleaseStatePass
  };
  const materialPrerequisitesPass = Object.entries(completionRequirements).filter(([id]) => id !== 'full_subject_quality_review_scores_at_least_27_of_30_with_no_dimension_below_4').every(([, pass]) => pass);
  const qualityReview = qualityReviewResult(readiness, materialPrerequisitesPass);
  completionRequirements.full_subject_quality_review_scores_at_least_27_of_30_with_no_dimension_below_4 = qualityReview.passes;
  const eligibleForCompletion = Object.values(completionRequirements).every(Boolean);

  const blockers = [];
  if (!explicitEditorialCoveragePass) blockers.push({
    id: 'canonical_emne_full_editorial_treatment_gap',
    count: uncovered.length,
    detail: `${uncovered.length} av ${emners.length} canonicale emner mangler eksplisitt eierskap i en fulltekst-/chapter-ready redaksjonell enhet.`,
    sampleEmneIds: uncovered.slice(0, 20).map((row) => row.emne_id)
  });
  if (uncoveredWithLegacyTemplateMetadata > 0) blockers.push({
    id: 'uncovered_legacy_emners_retain_template_metadata_only',
    count: uncoveredWithLegacyTemplateMetadata,
    detail: 'Udekkede v4.5-emner har fortsatt generisk eller manglende key-question-metadata og kan derfor ikke brukes som erstatning for full editorial treatment.'
  });
  if (!qualityReview.passes) blockers.push({
    id: qualityReview.status === 'missing_required_review' ? 'full_subject_quality_review_missing' : 'full_subject_quality_review_deferred',
    detail: qualityReview.status === 'missing_required_review' ? `Krever eksplisitt review i ${P.qualityReview}.` : '27/30-review skal ikke scores før materielle completion-blockers er lukket.'
  });

  if (readiness.complete_ready === true) assert(eligibleForCompletion, 'Vitenskap kan ikke være complete mens holistic completion-auditen har blockers');

  const report = {
    schema: 'history_go_fagverk_vitenskap_holistic_university_breadth_completion_audit_v1',
    version: '1.1.0',
    status: readiness.complete_ready === true ? 'complete_and_holistically_audited' : eligibleForCompletion ? 'eligible_for_completion' : 'blocked',
    generatedFrom: P,
    subject: { id: 'vitenskap', completionState, readinessStatus: readiness.status, completeReady: readiness.complete_ready, editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate },
    canonicalInventory: {
      domainCount: pensum.summary.domain_count,
      emneCount: emners.length,
      methodCount: methods.length,
      mappingCount: mappings.length,
      hookCount: pensum.summary.topic_hook_count,
      explicitChapterOwnedEmneCount: ownedSet.size,
      explicitUncoveredEmneCount: uncovered.length,
      legacyEmneCount: legacy.length,
      oldGenericQuestionSetEmneCount,
      missingLegacyKeyQuestionEmneCount,
      largestLegacyQuestionTemplateReuse,
      uncoveredWithLegacyTemplateMetadata
    },
    chapters: { count: registrySubject.chapters.length, summaries: chapterSummaries, totalParagraphCount: paragraphRecords.length, totalClaimCount: allClaimIds.length, totalSourceCount: allSourceIds.length },
    evidence: { allClaimsResolve, methodsWithLimitsChapterCount, chapterCount: registrySubject.chapters.length, fillerClean, globalUniqueSectionIds: allSectionIds.length, globalUniqueClaimIds: allClaimIds.length, globalUniqueSourceIds: allSourceIds.length },
    originality: { exactDuplicateParagraphCount: 0, maxCrossChapterFiveGramJaccard: Number(maxCrossChapterSimilarity.toFixed(4)), threshold: 0.42, mostSimilarPair },
    neighborBoundaries: readiness.neighbor_boundaries,
    technology: { passes: technologyPass, canonicalParentSubject: readiness.current_inventory.teknologi.canonical_parent_subject, topLevelSubject: readiness.current_inventory.teknologi.top_level_subject, areaCount: technologyIndex.counts.areas, topicCount: technologyIndex.counts.topics, methodCount: technologyIndex.counts.methods, hookCount: technologyIndex.counts.hooks },
    blockers,
    completionRequirements,
    qualityReview,
    gates: {
      structuralCoverageGapsResolved: completionRequirements.all_blocking_coverage_gaps_reconciled_into_canonical_inventory_or_explicitly_justified_elsewhere,
      neighborBoundariesResolvedWithoutDuplicateSubjectTruth: neighborBoundariesPass,
      canonicalEmnersEditoriallyTreated: explicitEditorialCoveragePass,
      allClaimsResolveToInspectableSupportingSources: allClaimsResolve,
      methodsTeachLimitsAndUncertainty: methodLimitsPass,
      technologyRemainsNested: technologyPass,
      gapOverlapAndFillerAuditClean: completionRequirements.gap_overlap_and_filler_audit_has_no_material_findings,
      crossChapterEditorialOriginalityPasses: crossChapterOriginalityPass,
      fullSubjectQualityReviewPasses: qualityReview.passes,
      registryReleaseAndStatusStateConsistent: registryReleaseStatePass,
      eligibleForCompletion
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap holistic audit ${report.status}: ${report.canonicalInventory.explicitChapterOwnedEmneCount}/${report.canonicalInventory.emneCount} emner eksplisitt redaksjonelt dekket; ${report.blockers.length} blocker-kategorier.`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
