#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  canonical: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  fagkart: 'data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json',
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-holistic-completion-v1-audit.json'
});
const FINAL_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const ANCHOR_IDS = Object.freeze(['kinoer-visningssteder-og-publikum', 'produksjon-studio-og-filmarbeid']);
const ANCHOR_ID_SET = new Set(ANCHOR_IDS);
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
const sorted = (items) => [...items].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const sameSet = (a, b) => isDeepStrictEqual(sorted(unique(a)), sorted(unique(b)));
const exactSet = (a, b) => a.length === b.length && unique(a).length === a.length && unique(b).length === b.length && isDeepStrictEqual(sorted(a), sorted(b));
const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;

function domainOf(emne) {
  return emne.domain || emne.area_id || null;
}

function methodsOf(emne) {
  return unique([...(emne.method_ids || []), ...(emne.methods || [])].filter(Boolean));
}

function chapterEmneIds(chapter) {
  if (Array.isArray(chapter.emne_ids)) return chapter.emne_ids;
  const doc = read(chapter.file);
  assert(Array.isArray(doc.emne_ids), `${chapter.id}: mangler emne_ids både i registry og kapittelfil`);
  return doc.emne_ids;
}

function resolveModuleFiles(registryRow, chapter) {
  return unique([...(chapter.moduleFiles || []), ...(registryRow.moduleFiles || [])].filter(Boolean));
}

function resolveClaimsFile(registryRow, chapter) {
  return chapter.claimsFile || registryRow.claimsFile || null;
}

function resolveBriefFile(registryRow, chapter) {
  return chapter.briefFile || registryRow.briefFile || null;
}

function chapterPrimaryDomain(registryRow, chapter) {
  return chapter.primary_domain_id || chapter.primaryDomainId || registryRow.primary_domain_id || registryRow.primaryDomainId || null;
}

function briefEmneIds(brief) {
  return brief.requiredEmneIds || brief.required_emne_ids || null;
}

function assertInspectableSource(source, chapterId) {
  assert(source?.id, `${chapterId}: source mangler id`);
  assert(typeof source.url === 'string' && /^https?:\/\//.test(source.url), `${chapterId}/${source.id}: source mangler inspectable http(s)-URL`);
  assert(typeof source.source_location === 'string' && source.source_location.trim().length > 0, `${chapterId}/${source.id}: source mangler source_location`);
}

function auditChapterIntegrity(registryRow, globalState, { plannedEmneIds = null, requirePlanResolution = false } = {}) {
  assert(registryRow?.id && registryRow.file, 'Registry-kapittel mangler id eller file');
  assert(fs.existsSync(abs(registryRow.file)), `${registryRow.id}: kapittelfilen finnes ikke`);
  const chapter = read(registryRow.file);
  const chapterId = chapter.id || chapter.chapter_id;
  assert(chapterId === registryRow.id, `${registryRow.id}: chapter id avviker fra registry`);
  assert((chapter.subject_id || chapter.subject) === 'film_tv', `${registryRow.id}: feil subject`);

  const chapterIds = chapterEmneIds(registryRow);
  assert(chapterIds.length > 0 && unique(chapterIds).length === chapterIds.length, `${registryRow.id}: ugyldig eller duplisert emne-eierskap`);
  assert(Array.isArray(chapter.emne_ids) && exactSet(chapter.emne_ids, chapterIds), `${registryRow.id}: kapittelfilen må eie samme emnesett som registry-resolusjonen`);
  if (Array.isArray(registryRow.emne_ids)) assert(exactSet(registryRow.emne_ids, chapter.emne_ids), `${registryRow.id}: registry og kapittelfil har ulik emnedekning`);
  if (plannedEmneIds) assert(exactSet(chapter.emne_ids, plannedEmneIds), `${registryRow.id}: kapittelets emnesett avviker fra planen`);

  const primaryDomain = chapterPrimaryDomain(registryRow, chapter);
  assert(primaryDomain && globalState.canonicalDomains.has(primaryDomain), `${registryRow.id}: ugyldig primary domain ${primaryDomain}`);
  globalState.coveredDomains.add(primaryDomain);

  const chapterMethods = unique([...(chapter.method_ids || []), ...(registryRow.method_ids || [])].filter(Boolean));
  assert(chapterMethods.length > 0, `${registryRow.id}: mangler method_ids`);
  chapterMethods.forEach((methodId) => globalState.usedMethods.add(methodId));

  const claimsFile = resolveClaimsFile(registryRow, chapter);
  const briefFile = resolveBriefFile(registryRow, chapter);
  assert(claimsFile && fs.existsSync(abs(claimsFile)), `${registryRow.id}: claimsFile mangler`);
  assert(briefFile && fs.existsSync(abs(briefFile)), `${registryRow.id}: briefFile mangler`);
  if (registryRow.claimsFile && chapter.claimsFile) assert(registryRow.claimsFile === chapter.claimsFile, `${registryRow.id}: claimsFile avviker mellom registry og kapittel`);
  if (registryRow.briefFile && chapter.briefFile) assert(registryRow.briefFile === chapter.briefFile, `${registryRow.id}: briefFile avviker mellom registry og kapittel`);

  const brief = read(briefFile);
  assert((brief.chapter_id || brief.id) === registryRow.id, `${registryRow.id}: brief chapter_id avviker`);
  const requiredBriefIds = briefEmneIds(brief);
  assert(Array.isArray(requiredBriefIds) && exactSet(requiredBriefIds, chapter.emne_ids), `${registryRow.id}: brief og kapittel har ulik emnedekning`);

  const moduleFiles = resolveModuleFiles(registryRow, chapter);
  assert(moduleFiles.length > 0, `${registryRow.id}: mangler moduleFiles`);
  assert(unique(moduleFiles).length === moduleFiles.length, `${registryRow.id}: dupliserte moduleFiles`);
  const moduleCoveredEmners = [];
  const sectionCoveredEmners = new Set();
  const chapterSectionIds = new Set();
  let chapterSections = 0;
  let chapterParagraphs = 0;

  for (const moduleFile of moduleFiles) {
    assert(fs.existsSync(abs(moduleFile)), `${registryRow.id}: mangler modulfil ${moduleFile}`);
    const module = read(moduleFile);
    assert((module.chapter_id || registryRow.id) === registryRow.id, `${registryRow.id}/${moduleFile}: module chapter_id avviker`);
    assert((module.subject_id || module.subject || 'film_tv') === 'film_tv', `${registryRow.id}/${moduleFile}: module subject avviker`);
    assert(Array.isArray(module.emne_ids) && module.emne_ids.length > 0, `${registryRow.id}/${moduleFile}: mangler module emne_ids`);
    moduleCoveredEmners.push(...module.emne_ids);
    assert(Array.isArray(module.sections) && module.sections.length > 0, `${registryRow.id}/${module.id || moduleFile}: mangler sections`);

    for (const section of module.sections) {
      assert(section.id, `${registryRow.id}: section mangler id`);
      assert(!globalState.globalSectionIds.has(section.id), `Duplisert section id på tvers av Film & TV: ${section.id}`);
      globalState.globalSectionIds.add(section.id);
      chapterSectionIds.add(section.id);
      chapterSections += 1;
      assert(Array.isArray(section.emne_ids) && section.emne_ids.length > 0, `${registryRow.id}/${section.id}: mangler emne_ids`);
      for (const emneId of section.emne_ids) {
        assert(chapter.emne_ids.includes(emneId), `${registryRow.id}/${section.id}: section peker utenfor kapittelets emner: ${emneId}`);
        sectionCoveredEmners.add(emneId);
      }
      assert(Array.isArray(section.paragraphs) && section.paragraphs.length > 0, `${registryRow.id}/${section.id}: mangler paragraphs`);
      assert(Array.isArray(section.paragraphClaimIds), `${registryRow.id}/${section.id}: mangler paragraphClaimIds`);
      assert(section.paragraphClaimIds.length === section.paragraphs.length, `${registryRow.id}/${section.id}: paragraphClaimIds matcher ikke paragraphs`);
      section.paragraphs.forEach((paragraph, index) => {
        assert(wordCount(paragraph) >= 20, `${registryRow.id}/${section.id}: fagavsnitt ${index + 1} er for kort for completion-porten`);
        const trace = section.paragraphClaimIds[index];
        assert(Array.isArray(trace) && trace.length > 0, `${registryRow.id}/${section.id}: fagavsnitt ${index + 1} mangler claimspor`);
      });
      chapterParagraphs += section.paragraphs.length;
    }
  }

  assert(exactSet(moduleCoveredEmners, chapter.emne_ids), `${registryRow.id}: modulene dekker ikke nøyaktig kapittelets emne_ids uten overlapp`);
  assert(sameSet([...sectionCoveredEmners], chapter.emne_ids), `${registryRow.id}: seksjonene dekker ikke nøyaktig kapittelets emne_ids`);

  const ledger = read(claimsFile);
  assert((ledger.chapter_id || registryRow.id) === registryRow.id, `${registryRow.id}: claims chapter_id avviker`);
  assert((ledger.subject_id || 'film_tv') === 'film_tv', `${registryRow.id}: claims subject avviker`);
  const claims = ledger.claims || [];
  const sources = ledger.sources || [];
  assert(claims.length > 0, `${registryRow.id}: mangler claims`);
  assert(sources.length > 0, `${registryRow.id}: mangler sources`);

  const sourceIds = sources.map((source) => source.id);
  assert(unique(sourceIds).length === sourceIds.length, `${registryRow.id}: dupliserte source ids`);
  sources.forEach((source) => assertInspectableSource(source, registryRow.id));
  const sourceIdSet = new Set(sourceIds);
  const resolutionValues = sorted(unique(claims.map((claim) => claim.plan_resolution).filter((value) => typeof value === 'string')));
  const unknownResolutionClaims = requirePlanResolution
    ? claims.filter((claim) => !APPROVED_PLAN_RESOLUTION_SET.has(claim.plan_resolution)).map((claim) => claim.id)
    : [];
  const chapterClaimIds = new Set();

  for (const claim of claims) {
    assert(claim.id, `${registryRow.id}: claim mangler id`);
    assert(!chapterClaimIds.has(claim.id), `${registryRow.id}: duplisert claim id ${claim.id}`);
    assert(!globalState.globalClaimIds.has(claim.id), `Duplisert claim id på tvers av Film & TV: ${claim.id}`);
    chapterClaimIds.add(claim.id);
    globalState.globalClaimIds.add(claim.id);
    assert(claim.status === 'verified', `${registryRow.id}/${claim.id}: claim er ikke verified`);
    if (requirePlanResolution) assert(APPROVED_PLAN_RESOLUTION_SET.has(claim.plan_resolution), `${registryRow.id}/${claim.id}: ugyldig plan_resolution ${claim.plan_resolution}`);
    assert(claim.status !== 'planned' && claim.plan_resolution !== 'planned_only', `${registryRow.id}/${claim.id}: planned-only kan ikke telle som verifisert`);
    assert(Array.isArray(claim.source_ids) && claim.source_ids.length > 0, `${registryRow.id}/${claim.id}: claim mangler source_ids`);
    claim.source_ids.forEach((sourceId) => assert(sourceIdSet.has(sourceId), `${registryRow.id}/${claim.id}: ukjent source ${sourceId}`));
    assert(Array.isArray(claim.used_in) && claim.used_in.length > 0, `${registryRow.id}/${claim.id}: claim mangler used_in`);
    claim.used_in.forEach((sectionId) => assert(chapterSectionIds.has(sectionId), `${registryRow.id}/${claim.id}: used_in peker på ukjent section ${sectionId}`));
  }

  for (const moduleFile of moduleFiles) {
    const module = read(moduleFile);
    for (const section of module.sections) {
      section.paragraphClaimIds.flat().forEach((claimId) => {
        assert(chapterClaimIds.has(claimId), `${registryRow.id}/${section.id}: paragraph peker på ukjent claim ${claimId}`);
      });
    }
  }

  return {
    chapter_id: registryRow.id,
    primary_domain_id: primaryDomain,
    emne_count: chapter.emne_ids.length,
    method_count: chapterMethods.length,
    module_count: moduleFiles.length,
    section_count: chapterSections,
    paragraph_count: chapterParagraphs,
    claim_count: claims.length,
    source_count: sources.length,
    exact_plan_emne_match: plannedEmneIds ? exactSet(chapter.emne_ids, plannedEmneIds) : true,
    all_claims_verified_with_approved_resolution: claims.every((claim) => claim.status === 'verified' && (!requirePlanResolution || APPROVED_PLAN_RESOLUTION_SET.has(claim.plan_resolution))),
    no_planned_only_claims: claims.every((claim) => claim.status !== 'planned' && claim.plan_resolution !== 'planned_only'),
    every_claim_uses_registered_source: claims.every((claim) => Array.isArray(claim.source_ids) && claim.source_ids.length > 0 && claim.source_ids.every((id) => sourceIdSet.has(id))),
    all_sources_inspectable: sources.every((source) => typeof source.url === 'string' && /^https?:\/\//.test(source.url) && typeof source.source_location === 'string' && source.source_location.trim().length > 0),
    brief_matches_chapter_emne_set: exactSet(requiredBriefIds, chapter.emne_ids),
    modules_match_chapter_emne_set: exactSet(moduleCoveredEmners, chapter.emne_ids),
    sections_cover_chapter_emne_set: sameSet([...sectionCoveredEmners], chapter.emne_ids),
    all_paragraphs_claim_traced: true,
    verified_resolution_values: resolutionValues,
    unknown_resolution_claim_ids: unknownResolutionClaims
  };
}

export function buildFilmTvHolisticCompletionV1() {
  const canonical = read(P.canonical);
  const fagkart = read(P.fagkart);
  const plan = read(P.plan);
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const subject = registry.subjects?.film_tv;
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(subject && filmStatus, 'Film & TV mangler i registry/status');
  assert(Array.isArray(canonical), 'Film & TV canonical inventory må være en array');
  assert(Array.isArray(subject.chapters), 'Film & TV registry mangler chapters');

  const canonicalIds = canonical.map((row) => row.emne_id);
  const canonicalDomains = new Set(canonical.map(domainOf).filter(Boolean));
  const requiredMethods = new Set(canonical.flatMap(methodsOf));
  const chapterIds = subject.chapters.map((chapter) => chapter.id);
  const chapterFiles = subject.chapters.map((chapter) => chapter.file);
  const plannedUnits = plan.planned_units || [];
  const plannedUnitIds = plannedUnits.map((unit) => unit.id);
  const plannedIds = plannedUnits.flatMap((unit) => unit.emne_ids || []);
  const anchors = subject.chapters.filter((chapter) => ANCHOR_ID_SET.has(chapter.id));
  const anchorIds = anchors.flatMap(chapterEmneIds);
  const registeredUnits = plannedUnits.map((unit) => subject.chapters.find((chapter) => chapter.id === unit.id));
  const registeredUnitIds = registeredUnits.flatMap((chapter) => chapter ? chapterEmneIds(chapter) : []);

  assert(canonical.every((row) => row.emne_id && row.subject_id === 'film_tv' && row.canonical_status === 'canonical'), 'Alle 192 canonicale Film & TV-emner må være aktive canonical film_tv-emner');
  assert(canonicalDomains.size === 10, `Canonical emner dekker ${canonicalDomains.size}/10 fagområder`);
  assert(Array.isArray(fagkart.categories) && fagkart.categories.length === 10, 'Film & TV fagkart skal ha 10 canonicale fagområder');
  assert(requiredMethods.size > 0, 'Canonical Film & TV-emner mangler metodebindinger');
  assert(unique(chapterIds).length === chapterIds.length, 'Film & TV chapter ids er ikke unike');
  assert(unique(chapterFiles).length === chapterFiles.length, 'Film & TV chapter files er ikke unike');

  const globalState = {
    canonicalDomains,
    usedMethods: new Set(),
    coveredDomains: new Set(),
    globalClaimIds: new Set(),
    globalSectionIds: new Set()
  };
  const anchorEvidence = anchors.map((chapter) => auditChapterIntegrity(chapter, globalState));
  const unitEvidence = registeredUnits.map((chapter, index) => {
    const unit = plannedUnits[index];
    assert(chapter, `${unit.id}: planenhet er ikke registrert som kapittel`);
    return { unit_id: unit.id, ...auditChapterIntegrity(chapter, globalState, { plannedEmneIds: unit.emne_ids || [], requirePlanResolution: true }) };
  });

  const combinedIds = [...anchorIds, ...plannedIds];
  const duplicateCombinedIds = combinedIds.filter((id, index) => combinedIds.indexOf(id) !== index);
  const missingIds = canonicalIds.filter((id) => !combinedIds.includes(id));
  const extraIds = combinedIds.filter((id) => !canonicalIds.includes(id));
  const anchorPlanOverlap = anchorIds.filter((id) => plannedIds.includes(id));
  const unitCounts = plannedUnits.map((unit) => unit.emne_ids?.length || 0);
  const observedResolutionValues = sorted(unique(unitEvidence.flatMap((row) => row.verified_resolution_values)));
  const unknownResolutionClaimIds = unitEvidence.flatMap((row) => row.unknown_resolution_claim_ids);
  const missingMethods = sorted([...requiredMethods].filter((methodId) => !globalState.usedMethods.has(methodId)));

  const allEvidence = [...anchorEvidence, ...unitEvidence];
  const gates = {
    canonical_is_exactly_192: canonicalIds.length === 192 && unique(canonicalIds).length === 192,
    canonical_rows_are_active_film_tv: canonical.every((row) => row.emne_id && row.subject_id === 'film_tv' && row.canonical_status === 'canonical'),
    canonical_has_exactly_ten_domains: canonicalDomains.size === 10 && fagkart.categories.length === 10,
    plan_baseline_is_192_38_154: plan.baseline?.canonical_emne_count === 192 && plan.baseline?.existing_chapter_count === 2 && plan.baseline?.existing_covered_emne_count === 38 && plan.baseline?.uncovered_emne_count === 154,
    exactly_two_named_anchor_chapters_cover_38: anchors.length === 2 && ANCHOR_IDS.every((id) => chapterIds.includes(id)) && anchorIds.length === 38 && unique(anchorIds).length === 38,
    exactly_fifteen_units_cover_154: plannedUnits.length === 15 && plannedIds.length === 154 && unique(plannedIds).length === 154,
    exactly_seventeen_registered_unique_chapters: subject.chapters.length === 17 && unique(chapterIds).length === 17 && unique(chapterFiles).length === 17,
    exact_canonical_set_equality: exactSet(combinedIds, canonicalIds),
    no_missing_extra_or_duplicate_emners: missingIds.length === 0 && extraIds.length === 0 && duplicateCombinedIds.length === 0,
    anchors_and_units_do_not_overlap: anchorPlanOverlap.length === 0,
    all_fifteen_units_registered: registeredUnits.length === 15 && registeredUnits.every(Boolean) && unique(plannedUnitIds).length === 15,
    registered_unit_coverage_matches_plan: registeredUnitIds.length === 154 && exactSet(registeredUnitIds, plannedIds),
    all_unit_chapters_match_planned_emne_sets: unitEvidence.every((row) => row.exact_plan_emne_match),
    all_briefs_match_chapter_emne_sets: allEvidence.every((row) => row.brief_matches_chapter_emne_set),
    all_modules_match_chapter_emne_sets: allEvidence.every((row) => row.modules_match_chapter_emne_set),
    all_sections_cover_chapter_emne_sets: allEvidence.every((row) => row.sections_cover_chapter_emne_set),
    every_paragraph_has_claim_trace: allEvidence.every((row) => row.all_paragraphs_claim_traced),
    global_claim_ids_are_unique: globalState.globalClaimIds.size === allEvidence.reduce((sum, row) => sum + row.claim_count, 0),
    global_section_ids_are_unique: globalState.globalSectionIds.size === allEvidence.reduce((sum, row) => sum + row.section_count, 0),
    all_required_methods_are_used: missingMethods.length === 0,
    all_ten_domains_are_represented: sameSet([...globalState.coveredDomains], [...canonicalDomains]),
    all_anchor_claims_verified: anchorEvidence.every((row) => row.all_claims_verified_with_approved_resolution),
    every_anchor_claim_uses_registered_source: anchorEvidence.every((row) => row.every_claim_uses_registered_source),
    all_anchor_sources_are_inspectable: anchorEvidence.every((row) => row.all_sources_inspectable),
    all_unit_claims_verified_with_approved_resolution: unitEvidence.every((row) => row.all_claims_verified_with_approved_resolution),
    no_unknown_unit_plan_resolutions: unknownResolutionClaimIds.length === 0,
    no_planned_only_claims_masquerade_as_verified: allEvidence.every((row) => row.no_planned_only_claims),
    every_unit_claim_uses_registered_source: unitEvidence.every((row) => row.every_claim_uses_registered_source),
    all_unit_sources_are_inspectable: unitEvidence.every((row) => row.all_sources_inspectable),
    status_baseline_is_materialized_and_audited: filmStatus.navigationStatus === 'materialized' && filmStatus.assessmentStatus === 'audited'
  };
  assert(Object.values(gates).every(Boolean), `Film & TV helhetsport feiler: ${Object.entries(gates).filter(([, ok]) => !ok).map(([key]) => key).join(', ')}`);

  const report = {
    schema: 'history_go_film_tv_holistic_completion_audit_v1',
    version: '1.2.0',
    updated_at: '2026-08-17',
    status: 'complete',
    subject_id: 'film_tv',
    approved_plan_resolutions: APPROVED_PLAN_RESOLUTIONS,
    observed_plan_resolutions: observedResolutionValues,
    summary: {
      canonical_domain_count: canonicalDomains.size,
      canonical_emne_count: canonicalIds.length,
      required_method_count: requiredMethods.size,
      anchor_chapter_count: anchors.length,
      anchor_emne_count: anchorIds.length,
      planned_unit_count: plannedUnits.length,
      planned_unit_emne_count: plannedIds.length,
      registered_chapter_count: subject.chapters.length,
      module_count: allEvidence.reduce((sum, row) => sum + row.module_count, 0),
      section_count: allEvidence.reduce((sum, row) => sum + row.section_count, 0),
      paragraph_count: allEvidence.reduce((sum, row) => sum + row.paragraph_count, 0),
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
      unknown_resolution_claim_ids: unknownResolutionClaimIds,
      missing_method_ids: missingMethods
    },
    gates,
    next_gate: FINAL_GATE
  };

  registry.version = '3.04.0';
  registry.updatedAt = '2026-08-17';
  subject.canonicalModel.note = 'Film & TV er complete etter én holistisk sluttport for den variable 192-emne-canonen: to bevarte anchor-kapitler dekker 38 canonicale emner og 15 faglig avgrensede fulltekstenheter dekker de resterende 154. Porten krever eksakt eierskap uten hull, duplikater eller overlapp, korrekt registry/brief/modul/seksjon-spor, globalt unike claim- og section-id-er, metode- og domenedekning, paragraph→claim-spor samt verifiserte claims med inspectable kilder i alle 17 kapitler. De 15 planenhetene må i tillegg bruke en eksplisitt godkjent verifikasjonsresolution; planned-only claims kan aldri telle som verifisert evidens.';
  subject.canonicalModel.completionAudit = P.report;
  subject.editorialPlan = {
    derivedChapterCount: 17,
    completionRequirements: [
      'all_192_canonical_emners_accounted_for_exactly_once',
      'two_named_anchor_chapters_cover_exactly_38',
      'fifteen_planned_units_cover_exactly_154',
      'all_17_chapters_have_verified_claims_and_inspectable_sources',
      'registry_brief_module_and_section_topic_ownership_is_exact',
      'all_paragraphs_have_registered_claim_trace',
      'claim_and_section_ids_are_globally_unique',
      'all_canonical_methods_and_domains_are_covered',
      'all_planned_units_registered_as_fulltext_chapters',
      'all_unit_claims_verified_with_approved_resolution',
      'no_unknown_or_planned_only_claim_resolution_counts_as_verified',
      'all_claims_use_registered_inspectable_sources',
      'full_subject_audit_green'
    ],
    nextGate: FINAL_GATE
  };
  subject.note = 'Film & TV er redaksjonelt complete etter én reconcilet 192-emne-helhetsaudit: 17 kapitler totalt, der to navngitte anchor-kapitler dekker 38 emner og 15 produserte planenheter dekker de resterende 154. Sluttporten låser også brief/modul/seksjon-eierskap, paragraph→claim-spor, global claim/section-unikhet, metode- og domenedekning og inspectable kildeevidens. Videre arbeid er vedlikehold, kildeoppdatering og stedscaseutvidelse.';

  status.version = '1.97.0';
  status.updatedAt = '2026-08-17';
  filmStatus.editorialStatus = 'complete';
  filmStatus.nextGate = FINAL_GATE;
  filmStatus.note = 'Film & TV er complete etter reconcilet helhetsaudit: alle 192 canonicale emner er dekket nøyaktig én gang som 38 emner i to bevarte anchor-kapitler + 154 emner i 15 fullproduserte planenheter. Sluttporten krever 17 unike kapittel- og filregistreringer, eksakt registry/brief/modul/seksjon-eierskap, paragraph→claim-spor, globalt unike claim- og section-id-er, metode- og domenedekning samt verifiserte, kildebundne claims med inspectable kilder. Videre arbeid er vedlikehold, kildeoppdatering og stedscaseutvidelse.';

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
    console.log(`Film & TV helhetsaudit OK: ${built.report.summary.canonical_emne_count} = ${built.report.summary.anchor_emne_count} anchor + ${built.report.summary.planned_unit_emne_count} unit-emner; ${built.report.summary.registered_chapter_count}/17 kapitler med full evidens- og trace-integritet.`);
  } catch (error) {
    console.error(`Film & TV helhetsaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
