#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  emner: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  fagkart: 'data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-completion-v1.json'
});
const PRE_COMPLETION_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const FINAL_GATE = 'maintenance_source_refresh_and_place_case_expansion';

const abs = (file) => path.join(ROOT, file);
const json = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (values) => [...new Set(values)];
const sortNb = (values) => [...values].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const sameSet = (a, b) => a.size === b.size && [...a].every((value) => b.has(value));
const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;

function domainOf(emne) {
  return emne.domain || emne.area_id || null;
}

function methodsOf(emne) {
  return unique([...(emne.method_ids || []), ...(emne.methods || [])].filter(Boolean));
}

function chapterPrimaryDomain(registryRow, chapter) {
  return chapter.primary_domain_id || registryRow.primary_domain_id || registryRow.primaryDomainId || null;
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

function assertInspectableSource(source, chapterId) {
  assert(source?.id, `${chapterId}: source mangler id`);
  assert(source.url || source.location || source.file, `${chapterId}/${source.id}: source mangler inspectable location`);
  assert(
    source.source_location || source.section || source.supports || source.note || source.role,
    `${chapterId}/${source.id}: source mangler presis evidensplassering`
  );
}

function buildAudit() {
  const emner = json(P.emner);
  const fagkart = json(P.fagkart);
  const registryDocument = json(P.registry);
  const statusDocument = json(P.status);
  const registry = registryDocument.subjects?.film_tv;
  const status = statusDocument.subjects?.find((row) => row.id === 'film_tv');

  assert(Array.isArray(emner) && emner.length === 192, 'Film & TV skal ha 192 canonicale emner ved completion-porten');
  assert(Array.isArray(fagkart.categories) && fagkart.categories.length === 10, 'Film & TV skal ha 10 canonicale fagområder ved completion-porten');
  assert(registry && Array.isArray(registry.chapters), 'Film & TV mangler registry-kapitler');
  assert(registry.chapters.length === 15, `Film & TV skal ha 15 planlagte kapitler; fant ${registry.chapters.length}`);
  assert(status, 'Film & TV mangler subject_status');
  assert([PRE_COMPLETION_GATE, FINAL_GATE].includes(status.nextGate), `Uventet Film & TV nextGate: ${status.nextGate}`);
  if (status.nextGate === PRE_COMPLETION_GATE) assert(status.editorialStatus === 'chapters_in_progress', 'Pre-completion gate krever chapters_in_progress');
  if (status.nextGate === FINAL_GATE) assert(status.editorialStatus === 'complete', 'Maintenance-gate krever complete');

  const canonicalIds = emner.map((row) => row.emne_id);
  assert(canonicalIds.every(Boolean), 'Canonical Film & TV-emne mangler emne_id');
  assert(new Set(canonicalIds).size === canonicalIds.length, 'Canonical Film & TV-emne-id er duplisert');
  const canonicalSet = new Set(canonicalIds);
  const canonicalById = new Map(emner.map((row) => [row.emne_id, row]));
  const canonicalDomains = new Set(emner.map(domainOf).filter(Boolean));
  assert(canonicalDomains.size === 10, `Canonical emner dekker ${canonicalDomains.size}/10 fagområder`);
  const requiredMethods = new Set(emner.flatMap(methodsOf));
  assert(requiredMethods.size > 0, 'Canonical Film & TV-emner mangler metodebindinger');

  const ownedBy = new Map();
  const usedMethods = new Set();
  const globalClaimIds = new Set();
  const globalSectionIds = new Set();
  let moduleCount = 0;
  let sectionCount = 0;
  let paragraphCount = 0;
  let claimCount = 0;
  let sourceRegistrationCount = 0;
  let workCaseCount = 0;
  const chapterSummaries = [];

  for (const registryRow of registry.chapters) {
    assert(registryRow.id && registryRow.file, 'Registry-kapittel mangler id eller file');
    assert(fs.existsSync(abs(registryRow.file)), `${registryRow.id}: kapittelfilen finnes ikke`);
    const chapter = json(registryRow.file);
    const chapterId = chapter.id || chapter.chapter_id;
    assert(chapterId === registryRow.id, `${registryRow.id}: chapter id avviker fra registry`);
    assert((chapter.subject_id || chapter.subject) === 'film_tv', `${registryRow.id}: feil subject`);
    assert(Array.isArray(chapter.emne_ids) && chapter.emne_ids.length > 0, `${registryRow.id}: mangler emne_ids`);
    assert(new Set(chapter.emne_ids).size === chapter.emne_ids.length, `${registryRow.id}: dupliserte emne_ids internt`);
    if (Array.isArray(registryRow.emne_ids)) {
      assert(sameSet(new Set(registryRow.emne_ids), new Set(chapter.emne_ids)), `${registryRow.id}: registry og kapittelfil har ulik emnedekning`);
    }
    const primaryDomain = chapterPrimaryDomain(registryRow, chapter);
    assert(primaryDomain && canonicalDomains.has(primaryDomain), `${registryRow.id}: ugyldig primary domain ${primaryDomain}`);

    for (const emneId of chapter.emne_ids) {
      assert(canonicalSet.has(emneId), `${registryRow.id}: ikke-canonical emne ${emneId}`);
      if (!ownedBy.has(emneId)) ownedBy.set(emneId, []);
      ownedBy.get(emneId).push(registryRow.id);
    }

    const chapterMethods = unique(chapter.method_ids || []);
    assert(chapterMethods.length > 0, `${registryRow.id}: mangler method_ids`);
    chapterMethods.forEach((methodId) => usedMethods.add(methodId));

    const claimsFile = resolveClaimsFile(registryRow, chapter);
    const briefFile = resolveBriefFile(registryRow, chapter);
    assert(claimsFile && fs.existsSync(abs(claimsFile)), `${registryRow.id}: mangler claimsFile`);
    assert(briefFile && fs.existsSync(abs(briefFile)), `${registryRow.id}: mangler briefFile`);
    const claimsDocument = json(claimsFile);
    assert((claimsDocument.subject_id || 'film_tv') === 'film_tv', `${registryRow.id}: claims subject avviker`);
    assert((claimsDocument.chapter_id || registryRow.id) === registryRow.id, `${registryRow.id}: claims chapter_id avviker`);
    assert(Array.isArray(claimsDocument.sources) && claimsDocument.sources.length > 0, `${registryRow.id}: mangler inspectable sources`);
    assert(Array.isArray(claimsDocument.claims) && claimsDocument.claims.length > 0, `${registryRow.id}: mangler claims`);
    const sourceIds = claimsDocument.sources.map((source) => source.id);
    assert(new Set(sourceIds).size === sourceIds.length, `${registryRow.id}: dupliserte source ids`);
    claimsDocument.sources.forEach((source) => assertInspectableSource(source, registryRow.id));
    const sourceSet = new Set(sourceIds);
    sourceRegistrationCount += claimsDocument.sources.length;

    const moduleFiles = resolveModuleFiles(registryRow, chapter);
    assert(moduleFiles.length > 0, `${registryRow.id}: mangler moduleFiles`);
    moduleCount += moduleFiles.length;
    const chapterSectionIds = new Set();
    const sectionCoveredEmner = new Set();
    let chapterParagraphs = 0;
    let chapterSections = 0;

    for (const moduleFile of moduleFiles) {
      assert(fs.existsSync(abs(moduleFile)), `${registryRow.id}: mangler modulfil ${moduleFile}`);
      const module = json(moduleFile);
      assert(Array.isArray(module.sections) && module.sections.length > 0, `${registryRow.id}/${module.id || moduleFile}: mangler sections`);
      for (const section of module.sections) {
        assert(section.id, `${registryRow.id}: section mangler id`);
        assert(!globalSectionIds.has(section.id), `Duplisert section id på tvers av Film & TV: ${section.id}`);
        globalSectionIds.add(section.id);
        chapterSectionIds.add(section.id);
        chapterSections += 1;
        sectionCount += 1;
        assert(Array.isArray(section.emne_ids) && section.emne_ids.length > 0, `${registryRow.id}/${section.id}: mangler emne_ids`);
        for (const emneId of section.emne_ids) {
          assert(chapter.emne_ids.includes(emneId), `${registryRow.id}/${section.id}: section peker utenfor kapittelets emner: ${emneId}`);
          sectionCoveredEmner.add(emneId);
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
        paragraphCount += section.paragraphs.length;
      }
    }

    assert(
      sameSet(sectionCoveredEmner, new Set(chapter.emne_ids)),
      `${registryRow.id}: modulene dekker ikke nøyaktig kapittelets emne_ids`
    );

    const chapterClaimIds = new Set();
    for (const claim of claimsDocument.claims) {
      assert(claim.id, `${registryRow.id}: claim mangler id`);
      assert(!chapterClaimIds.has(claim.id), `${registryRow.id}: duplisert claim id ${claim.id}`);
      assert(!globalClaimIds.has(claim.id), `Duplisert claim id på tvers av Film & TV: ${claim.id}`);
      chapterClaimIds.add(claim.id);
      globalClaimIds.add(claim.id);
      assert(claim.status === 'verified', `${registryRow.id}/${claim.id}: claim er ikke verified`);
      assert(Array.isArray(claim.source_ids) && claim.source_ids.length > 0, `${registryRow.id}/${claim.id}: claim mangler source_ids`);
      claim.source_ids.forEach((sourceId) => assert(sourceSet.has(sourceId), `${registryRow.id}/${claim.id}: ukjent source ${sourceId}`));
      assert(Array.isArray(claim.used_in) && claim.used_in.length > 0, `${registryRow.id}/${claim.id}: claim mangler used_in`);
      claim.used_in.forEach((sectionId) => assert(chapterSectionIds.has(sectionId), `${registryRow.id}/${claim.id}: used_in peker på ukjent section ${sectionId}`));
    }

    for (const moduleFile of moduleFiles) {
      const module = json(moduleFile);
      for (const section of module.sections) {
        section.paragraphClaimIds.flat().forEach((claimId) => {
          assert(chapterClaimIds.has(claimId), `${registryRow.id}/${section.id}: paragraph peker på ukjent claim ${claimId}`);
        });
      }
    }

    claimCount += claimsDocument.claims.length;
    workCaseCount += Array.isArray(chapter.workCases) ? chapter.workCases.length : 0;
    chapterSummaries.push({
      chapter_id: registryRow.id,
      primary_domain_id: primaryDomain,
      emne_count: chapter.emne_ids.length,
      method_count: chapterMethods.length,
      module_count: moduleFiles.length,
      section_count: chapterSections,
      paragraph_count: chapterParagraphs,
      claim_count: claimsDocument.claims.length,
      source_count: claimsDocument.sources.length,
      work_case_count: Array.isArray(chapter.workCases) ? chapter.workCases.length : 0
    });
  }

  const missingEmner = canonicalIds.filter((id) => !ownedBy.has(id));
  const duplicateOwnedEmner = canonicalIds.filter((id) => (ownedBy.get(id) || []).length !== 1);
  assert(missingEmner.length === 0, `Film & TV har udekkede canonicale emner: ${missingEmner.join(', ')}`);
  assert(duplicateOwnedEmner.length === 0, `Film & TV har emner som ikke eies nøyaktig én gang: ${duplicateOwnedEmner.join(', ')}`);
  assert(ownedBy.size === canonicalSet.size, `Kapittel-eierskapet dekker ${ownedBy.size}/${canonicalSet.size} emner`);

  const missingMethods = sortNb([...requiredMethods].filter((methodId) => !usedMethods.has(methodId)));
  assert(missingMethods.length === 0, `Canonicale metoder mangler i kapittelsettet: ${missingMethods.join(', ')}`);
  assert(claimCount === globalClaimIds.size, 'Claim-id-er er ikke globalt unike');

  const coveredDomains = new Set([...ownedBy.keys()].map((id) => domainOf(canonicalById.get(id))).filter(Boolean));
  assert(sameSet(coveredDomains, canonicalDomains), 'Kapittelsettet dekker ikke alle canonicale Film & TV-fagområder');

  return {
    schema: 'history_go_film_tv_completion_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-17',
    status: 'complete_ready_verified',
    subject_id: 'film_tv',
    canonical: {
      domain_count: canonicalDomains.size,
      emne_count: canonicalSet.size,
      required_method_count: requiredMethods.size
    },
    materialized: {
      chapter_count: registry.chapters.length,
      module_count: moduleCount,
      section_count: sectionCount,
      paragraph_count: paragraphCount,
      claim_count: claimCount,
      source_registration_count: sourceRegistrationCount,
      work_case_count: workCaseCount,
      used_method_count: usedMethods.size
    },
    coverage: {
      covered_emne_count: ownedBy.size,
      missing_emne_ids: missingEmner,
      duplicate_owned_emne_ids: duplicateOwnedEmner,
      covered_domain_count: coveredDomains.size,
      missing_required_method_ids: missingMethods
    },
    quality_gates: {
      all_canonical_domains_covered: true,
      all_canonical_emners_covered_exactly_once: true,
      all_registered_chapters_materialized: true,
      all_chapters_have_modules_briefs_and_claim_files: true,
      every_chapter_emne_is_present_in_module_sections: true,
      every_substantive_paragraph_has_claim_trace: true,
      all_claims_verified: true,
      all_claim_sources_resolve_to_inspectable_sources: true,
      all_claim_used_in_targets_resolve_to_sections: true,
      all_canonical_topic_methods_are_used: true,
      completion_status_is_separate_from_unit15_production: true
    },
    chapter_summaries: chapterSummaries
  };
}

function applyCompleteStatus(report) {
  const registryDocument = json(P.registry);
  const statusDocument = json(P.status);
  const registry = registryDocument.subjects.film_tv;
  const status = statusDocument.subjects.find((row) => row.id === 'film_tv');
  registryDocument.version = '3.04.0';
  registryDocument.updatedAt = '2026-08-17';
  registry.canonicalModel.note = `Film & TV er komplett etter separat helhetsaudit: ${report.canonical.domain_count}/${report.canonical.domain_count} canonicale fagområder og ${report.canonical.emne_count}/${report.canonical.emne_count} canonicale emner er dekket nøyaktig én gang gjennom ${report.materialized.chapter_count} fullverdige kapitler. Kapittelsettet har ${report.materialized.module_count} moduler, ${report.materialized.section_count} seksjoner, ${report.materialized.paragraph_count} claimsporede fagavsnitt, ${report.materialized.claim_count} verifiserte claims, ${report.materialized.source_registration_count} inspectable kilderegistreringer og bruker alle ${report.canonical.required_method_count} canonicalt krevde emnemetoder.`;
  registry.canonicalModel.completionAudit = P.report;
  registry.editorialPlan = {
    targetChapterCount: 15,
    completionRequirements: [
      'all_10_canonical_domains_covered',
      'all_192_canonical_emners_covered_exactly_once',
      'all_registered_chapters_materialized',
      'every_chapter_emne_present_in_module_sections',
      'every_substantive_paragraph_claim_traced',
      'all_claims_verified_against_inspectable_sources',
      'all_canonical_topic_methods_used',
      'full_subject_audit_green'
    ],
    completionAudit: P.report,
    nextGate: FINAL_GATE
  };
  registry.note = `Film & TV er redaksjonelt komplett etter egen helhetsaudit. Alle 15 planlagte enheter er materialisert, og auditen verifiserer 10/10 canonicale fagområder og 192/192 canonicale emner med eksakt ett kapittel-eierskap per emne, ${report.materialized.paragraph_count} claimsporede fagavsnitt, ${report.materialized.claim_count} verifiserte claims og ${report.materialized.source_registration_count} inspectable kilderegistreringer. Videre arbeid er vedlikehold, kildeoppdatering og nye dokumenterte case under de samme permanente portene.`;

  statusDocument.version = '1.97.0';
  statusDocument.updatedAt = '2026-08-17';
  status.editorialStatus = 'complete';
  status.nextGate = FINAL_GATE;
  status.note = `Film & TV er komplett etter separat helhetsaudit: 10/10 canonicale fagområder, 192/192 canonicale emner og 15/15 planlagte kapitler. Emnene eies nøyaktig én gang i kapittelsettet; modulene inneholder ${report.materialized.paragraph_count} claimsporede fagavsnitt, ${report.materialized.claim_count} verifiserte claims og ${report.materialized.source_registration_count} inspectable kilderegistreringer. Alle canonicalt krevde emnemetoder brukes. Videre arbeid er vedlikehold, kildeoppdatering og caseutvidelse.`;

  writeJson(P.registry, registryDocument);
  writeJson(P.status, statusDocument);
}

export function auditFilmTvCompletionV1({ writeReport = false, checkReport = true, applyComplete = false } = {}) {
  const report = buildAudit();
  if (applyComplete) applyCompleteStatus(report);
  if (writeReport) writeJson(P.report, report);
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `Mangler ${P.report}`);
    assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvCompletionV1({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report'),
      applyComplete: args.has('--apply-complete')
    });
    console.log(`Film & TV completion-audit OK: ${report.canonical.domain_count} områder, ${report.canonical.emne_count} emner, ${report.materialized.chapter_count} kapitler, ${report.materialized.claim_count} verified claims.`);
  } catch (error) {
    console.error(`Film & TV completion-audit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
