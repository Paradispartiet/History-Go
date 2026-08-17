#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  canonical: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-holistic-completion-v1-audit.json'
});
const FINAL_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const ANCHOR_IDS = new Set(['kinoer-visningssteder-og-publikum', 'produksjon-studio-og-filmarbeid']);
const APPROVED_PLAN_RESOLUTIONS = Object.freeze([
  'verified_as_planned',
  'verified_after_scope_rewrite',
  'verified_after_case_narrowing',
  'verified_after_scope_narrowing'
]);
const APPROVED_PLAN_RESOLUTION_SET = new Set(APPROVED_PLAN_RESOLUTIONS);
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const unique = (items) => [...new Set(items)];
const sorted = (items) => [...items].sort();
const sameSet = (a, b) => isDeepStrictEqual(sorted(unique(a)), sorted(unique(b)));

function chapterEmneIds(chapter) {
  if (Array.isArray(chapter.emne_ids)) return chapter.emne_ids;
  const doc = read(chapter.file);
  assert(Array.isArray(doc.emne_ids), `${chapter.id}: mangler emne_ids både i registry og kapittelfil`);
  return doc.emne_ids;
}

function chapterEvidence(chapter, { plannedEmneIds = null, requirePlanResolution = false } = {}) {
  assert(chapter, 'Kapittel mangler i registry');
  assert(chapter.file && fs.existsSync(abs(chapter.file)), `${chapter.id}: kapittelfilen finnes ikke`);
  assert(chapter.claimsFile && fs.existsSync(abs(chapter.claimsFile)), `${chapter.id}: claimsFile mangler`);
  assert(chapter.briefFile && fs.existsSync(abs(chapter.briefFile)), `${chapter.id}: briefFile mangler`);

  const chapterIds = chapterEmneIds(chapter);
  const ledger = read(chapter.claimsFile);
  const claims = ledger.claims || [];
  const sources = ledger.sources || [];
  const sourceIds = new Set(sources.map((source) => source.id));
  const resolutionValues = sorted(unique(claims.map((claim) => claim.plan_resolution).filter((value) => typeof value === 'string')));
  const unknownResolutionClaims = requirePlanResolution
    ? claims.filter((claim) => !APPROVED_PLAN_RESOLUTION_SET.has(claim.plan_resolution)).map((claim) => claim.id)
    : [];

  const allClaimsVerified = claims.length > 0 && claims.every((claim) =>
    claim.status === 'verified' &&
    (!requirePlanResolution || APPROVED_PLAN_RESOLUTION_SET.has(claim.plan_resolution))
  );
  const noPlannedOnly = claims.every((claim) =>
    claim.status !== 'planned' &&
    claim.plan_resolution !== 'planned_only'
  );
  const everyClaimSourced = claims.length > 0 && claims.every((claim) =>
    Array.isArray(claim.source_ids) &&
    claim.source_ids.length > 0 &&
    claim.source_ids.every((id) => sourceIds.has(id))
  );
  const sourcesInspectable = sources.length > 0 && sources.every((source) =>
    typeof source.url === 'string' &&
    /^https?:\/\//.test(source.url) &&
    typeof source.source_location === 'string' &&
    source.source_location.trim().length > 0
  );

  return {
    chapter_id: chapter.id,
    emne_count: chapterIds.length,
    claim_count: claims.length,
    source_count: sources.length,
    exact_plan_emne_match: plannedEmneIds ? sameSet(chapterIds, plannedEmneIds) : true,
    all_claims_verified_with_approved_resolution: allClaimsVerified,
    no_planned_only_claims: noPlannedOnly,
    every_claim_uses_registered_source: everyClaimSourced,
    all_sources_inspectable: sourcesInspectable,
    verified_resolution_values: resolutionValues,
    unknown_resolution_claim_ids: unknownResolutionClaims
  };
}

export function buildFilmTvHolisticCompletionV1() {
  const canonical = read(P.canonical);
  const plan = read(P.plan);
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const subject = registry.subjects?.film_tv;
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(subject && filmStatus, 'Film & TV mangler i registry/status');

  const canonicalIds = canonical.map((row) => row.emne_id);
  const plannedUnits = plan.planned_units || [];
  const plannedUnitIds = plannedUnits.map((unit) => unit.id);
  const plannedIds = plannedUnits.flatMap((unit) => unit.emne_ids || []);
  const anchors = subject.chapters.filter((chapter) => ANCHOR_IDS.has(chapter.id));
  const anchorIds = anchors.flatMap(chapterEmneIds);
  const registeredUnits = plannedUnits.map((unit) => subject.chapters.find((chapter) => chapter.id === unit.id));
  const registeredUnitIds = registeredUnits.flatMap((chapter) => chapter ? chapterEmneIds(chapter) : []);

  const anchorEvidence = anchors.map((chapter) => chapterEvidence(chapter));
  const unitEvidence = registeredUnits.map((chapter, index) => {
    const unit = plannedUnits[index];
    assert(chapter, `${unit.id}: planenhet er ikke registrert som kapittel`);
    return {
      unit_id: unit.id,
      ...chapterEvidence(chapter, { plannedEmneIds: unit.emne_ids || [], requirePlanResolution: true })
    };
  });

  const combinedIds = [...anchorIds, ...plannedIds];
  const duplicateCombinedIds = combinedIds.filter((id, index) => combinedIds.indexOf(id) !== index);
  const missingIds = canonicalIds.filter((id) => !combinedIds.includes(id));
  const extraIds = combinedIds.filter((id) => !canonicalIds.includes(id));
  const anchorPlanOverlap = anchorIds.filter((id) => plannedIds.includes(id));
  const unitCounts = plannedUnits.map((unit) => unit.emne_ids?.length || 0);
  const observedResolutionValues = sorted(unique(unitEvidence.flatMap((row) => row.verified_resolution_values)));
  const unknownResolutionClaimIds = unitEvidence.flatMap((row) => row.unknown_resolution_claim_ids);

  const gates = {
    canonical_is_exactly_192: canonicalIds.length === 192 && unique(canonicalIds).length === 192,
    plan_baseline_is_192_38_154: plan.baseline?.canonical_emne_count === 192 && plan.baseline?.existing_chapter_count === 2 && plan.baseline?.existing_covered_emne_count === 38 && plan.baseline?.uncovered_emne_count === 154,
    exactly_two_anchor_chapters_cover_38: anchors.length === 2 && anchorIds.length === 38 && unique(anchorIds).length === 38,
    exactly_fifteen_units_cover_154: plannedUnits.length === 15 && plannedIds.length === 154 && unique(plannedIds).length === 154,
    exactly_seventeen_registered_chapters: subject.chapters.length === 17,
    exact_canonical_set_equality: sameSet(combinedIds, canonicalIds) && combinedIds.length === canonicalIds.length,
    no_missing_extra_or_duplicate_emners: missingIds.length === 0 && extraIds.length === 0 && duplicateCombinedIds.length === 0,
    anchors_and_units_do_not_overlap: anchorPlanOverlap.length === 0,
    all_fifteen_units_registered: registeredUnits.length === 15 && registeredUnits.every(Boolean) && new Set(plannedUnitIds).size === 15,
    registered_unit_coverage_matches_plan: registeredUnitIds.length === 154 && sameSet(registeredUnitIds, plannedIds),
    all_unit_chapters_match_planned_emne_sets: unitEvidence.every((row) => row.exact_plan_emne_match),
    all_anchor_claims_verified: anchorEvidence.every((row) => row.all_claims_verified_with_approved_resolution),
    every_anchor_claim_uses_registered_source: anchorEvidence.every((row) => row.every_claim_uses_registered_source),
    all_anchor_sources_are_inspectable: anchorEvidence.every((row) => row.all_sources_inspectable),
    all_unit_claims_verified_with_approved_resolution: unitEvidence.every((row) => row.all_claims_verified_with_approved_resolution),
    no_unknown_unit_plan_resolutions: unknownResolutionClaimIds.length === 0,
    no_planned_only_claims_masquerade_as_verified: [...anchorEvidence, ...unitEvidence].every((row) => row.no_planned_only_claims),
    every_unit_claim_uses_registered_source: unitEvidence.every((row) => row.every_claim_uses_registered_source),
    all_unit_sources_are_inspectable: unitEvidence.every((row) => row.all_sources_inspectable)
  };
  assert(Object.values(gates).every(Boolean), `Film & TV helhetsport feiler: ${Object.entries(gates).filter(([, ok]) => !ok).map(([key]) => key).join(', ')}`);

  const allEvidence = [...anchorEvidence, ...unitEvidence];
  const report = {
    schema: 'history_go_film_tv_holistic_completion_audit_v1',
    version: '1.1.0',
    updated_at: '2026-08-17',
    status: 'complete',
    subject_id: 'film_tv',
    approved_plan_resolutions: APPROVED_PLAN_RESOLUTIONS,
    observed_plan_resolutions: observedResolutionValues,
    summary: {
      canonical_emne_count: canonicalIds.length,
      anchor_chapter_count: anchors.length,
      anchor_emne_count: anchorIds.length,
      planned_unit_count: plannedUnits.length,
      planned_unit_emne_count: plannedIds.length,
      registered_chapter_count: subject.chapters.length,
      verified_claim_count: allEvidence.reduce((sum, row) => sum + row.claim_count, 0),
      inspectable_source_registration_count: allEvidence.reduce((sum, row) => sum + row.source_count, 0),
      verified_unit_claim_count: unitEvidence.reduce((sum, row) => sum + row.claim_count, 0),
      inspectable_unit_source_registration_count: unitEvidence.reduce((sum, row) => sum + row.source_count, 0),
      smallest_unit_emne_count: Math.min(...unitCounts),
      largest_unit_emne_count: Math.max(...unitCounts)
    },
    anchors: anchorEvidence,
    units: unitEvidence,
    discrepancies: {
      missing_emne_ids: missingIds,
      extra_emne_ids: extraIds,
      duplicate_emne_ids: unique(duplicateCombinedIds),
      anchor_unit_overlap_ids: unique(anchorPlanOverlap),
      unknown_resolution_claim_ids: unknownResolutionClaimIds
    },
    gates,
    next_gate: FINAL_GATE
  };

  registry.version = '3.04.0';
  registry.updatedAt = '2026-08-17';
  subject.canonicalModel.note = 'Film & TV er complete etter separat helhetsaudit av den variable 192-emne-canonen: to bevarte anchor-kapitler dekker 38 canonicale emner og 15 faglig avgrensede fulltekstenheter dekker de resterende 154, med eksakt mengdelikhet, null hull, null duplikater og null anchor/unit-overlapp. Alle 17 kapitler har verifiserte, kildebundne claims og inspectable kilder; de 15 planenhetene må i tillegg bruke en eksplisitt godkjent verifikasjonsresolution, og planned-only claims kan aldri telle som verifisert evidens.';
  subject.canonicalModel.completionAudit = P.report;
  subject.editorialPlan = {
    derivedChapterCount: 17,
    completionRequirements: [
      'all_192_canonical_emners_accounted_for_exactly_once',
      'two_anchor_chapters_cover_exactly_38',
      'fifteen_planned_units_cover_exactly_154',
      'all_17_chapters_have_verified_claims_and_inspectable_sources',
      'all_planned_units_registered_as_fulltext_chapters',
      'all_unit_claims_verified_with_approved_resolution',
      'no_unknown_or_planned_only_claim_resolution_counts_as_verified',
      'all_claims_use_registered_inspectable_sources',
      'full_subject_audit_green'
    ],
    nextGate: FINAL_GATE
  };
  subject.note = 'Film & TV er redaksjonelt complete etter separat 192-emne-helhetsaudit: 17 kapitler totalt, der to bevarte anchor-kapitler dekker 38 emner og 15 produserte planenheter dekker de resterende 154. Helhetsporten krever eksakt canonical mengdelikhet, null hull/duplikater/overlapp, verifiserte kildebundne claims i alle 17 kapitler og eksplisitt godkjent claim-resolution i alle 15 planenheter. Videre arbeid er vedlikehold, kildeoppdatering og stedscaseutvidelse.';

  status.version = '1.97.0';
  status.updatedAt = '2026-08-17';
  filmStatus.editorialStatus = 'complete';
  filmStatus.nextGate = FINAL_GATE;
  filmStatus.note = 'Film & TV er complete etter separat helhetsaudit: alle 192 canonicale emner er dekket nøyaktig én gang som 38 emner i to bevarte anchor-kapitler + 154 emner i 15 fullproduserte planenheter. Det finnes ingen hull, duplikater eller anchor/unit-overlapp. Alle 17 kapitler har verifiserte, kildebundne claims og inspectable kilder; de 15 planenhetene bruker bare eksplisitt godkjente verifikasjonsutfall, og planned-only claims er blokkert. Videre arbeid er vedlikehold, kildeoppdatering og stedscaseutvidelse.';

  return { report, registry, status };
}

export function auditFilmTvHolisticCompletionV1({ writeFiles = false, checkFiles = true } = {}) {
  const built = buildFilmTvHolisticCompletionV1();
  const outputs = { [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert mot Film & TV completion-kontrakten`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const built = auditFilmTvHolisticCompletionV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV helhetsaudit OK: ${built.report.summary.canonical_emne_count} = ${built.report.summary.anchor_emne_count} anchor + ${built.report.summary.planned_unit_emne_count} unit-emner; ${built.report.summary.registered_chapter_count}/17 kapitler evidensverifisert.`);
  } catch (error) {
    console.error(`Film & TV helhetsaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
