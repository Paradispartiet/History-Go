#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditRepository as auditGeneralRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/musikk-subject-audit.json'
});

const absolute = relativePath => path.join(ROOT, relativePath);
const read = relativePath => fs.readFileSync(absolute(relativePath), 'utf8');
const json = relativePath => JSON.parse(read(relativePath));
const text = value => String(value ?? '').trim();
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = values => [...values].map(text).sort();
const same = (left, right) => isDeepStrictEqual(sorted(left), sorted(right));
const relative = (base, pointer) => path.posix.normalize(path.posix.join(path.posix.dirname(base), pointer));

function claimReferences(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) claimReferences(item, result);
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  for (const [key, item] of Object.entries(value)) {
    if (['claimIds', 'paragraphClaimIds', 'keyPointClaimIds'].includes(key) && Array.isArray(item)) {
      result.push(...item.flat(Infinity).map(text));
    } else claimReferences(item, result);
  }
  return result;
}

function scientific(manifestEntry) {
  const packagePath = path.posix.normalize(path.posix.join('data/fag', manifestEntry.scientificPackage));
  const scientificPackage = json(packagePath);
  const indexPath = relative(packagePath, scientificPackage.active_scientific_package);
  const index = json(indexPath);
  const domainCatalogPath = relative(indexPath, index.files.domain_catalog);
  const methodsPath = relative(indexPath, index.files.method_protocols);
  const modulePaths = index.files.canonical_modules.map(pointer => relative(indexPath, pointer));
  return {
    packagePath,
    indexPath,
    index,
    domainCatalogPath,
    domainCatalog: json(domainCatalogPath),
    methodsPath,
    methods: json(methodsPath),
    modulePaths,
    modules: modulePaths.map(json)
  };
}

function auditChapter(record, source) {
  const chapter = json(record.file);
  const brief = json(chapter.briefFile);
  const claims = json(chapter.claimsFile);
  const modules = chapter.moduleFiles.map(json);
  const evidence = chapter.evidenceFiles.map(json);
  const canonicalDomain = source.modules.find(module => module.domain?.domain_id === chapter.primary_domain_id);
  assert(canonicalDomain, `${chapter.chapter_id}: ukjent canonicalt fagområde`);
  const expectedEmneIds = canonicalDomain.topics.map(topic => topic.emne_id);
  const expectedMethodIds = [...new Set(canonicalDomain.topics.flatMap(topic => topic.method_protocol_ids || []))];

  assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject_id === 'musikk', `${chapter.chapter_id}: kapittelidentitet er feil`);
  assert(record.id === chapter.chapter_id && record.primary_domain_id === chapter.primary_domain_id && record.file, `${chapter.chapter_id}: registryidentitet er feil`);
  assert(same(chapter.emne_ids, expectedEmneIds) && same(chapter.method_ids, expectedMethodIds), `${chapter.chapter_id}: dekker ikke canonicalt domene`);
  assert(same(record.emne_ids, chapter.emne_ids), `${chapter.chapter_id}: registryemner er usynkrone`);
  assert(brief.chapter_id === chapter.chapter_id && brief.primary_domain_id === chapter.primary_domain_id, `${chapter.chapter_id}: briefidentitet er feil`);
  assert(same(brief.requiredEmneIds, chapter.emne_ids) && same(brief.requiredMethodIds, chapter.method_ids), `${chapter.chapter_id}: brief er usynkron`);
  assert(isDeepStrictEqual(brief.evidenceFiles, chapter.evidenceFiles), `${chapter.chapter_id}: evidenspekere er usynkrone`);
  assert(chapter.moduleFiles.length >= brief.editorialRequirements.minimumModules, `${chapter.chapter_id}: for få moduler`);

  let sectionCount = 0;
  let paragraphCount = 0;
  for (const module of modules) {
    assert(module.subject_id === 'musikk' && module.chapter_id === chapter.chapter_id, `${module.module_id}: modulidentitet er feil`);
    assert(module.sections.length >= 3, `${module.module_id}: for få seksjoner`);
    for (const section of module.sections) {
      sectionCount += 1;
      assert(section.paragraphs.length >= 3, `${section.id}: for få fagavsnitt`);
      assert(section.paragraphClaimIds.length === section.paragraphs.length && section.paragraphClaimIds.every(ids => ids.length), `${section.id}: ugyldig avsnittsspor`);
      paragraphCount += section.paragraphs.length;
    }
  }

  const evidenceClaims = evidence.flatMap(document => document.claim_records || []);
  const claimById = new Map(evidenceClaims.map(claim => [claim.claim_id, claim]));
  const evidenceSourceIds = new Set(evidence.flatMap(document => (document.source_reviews || []).map(sourceReview => sourceReview.source_id)));
  assert(evidence.length === canonicalDomain.topics.length, `${chapter.chapter_id}: evidenstemaantall avviker`);
  assert(evidence.every(document => document.status === 'question_release_ready' && document.domain_id === chapter.primary_domain_id), `${chapter.chapter_id}: evidensporten er ikke løst`);
  assert(claimById.size === evidenceClaims.length && claims.claims.length === claimById.size, `${chapter.chapter_id}: claimprojeksjon avviker`);
  assert(claims.sources.length === evidenceSourceIds.size && same(claims.sources.map(sourceRecord => sourceRecord.id), evidenceSourceIds), `${chapter.chapter_id}: kildeprojeksjon avviker`);
  for (const projected of claims.claims) {
    const upstream = claimById.get(projected.id);
    assert(upstream && projected.claim === upstream.statement, `${projected.id}: claimtekst avviker fra upstream`);
    assert(isDeepStrictEqual(projected.source_ids, upstream.source_ids) && isDeepStrictEqual(projected.locators, upstream.locators), `${projected.id}: kildespor avviker fra upstream`);
    assert(projected.status === 'verified' && projected.upstream_claim_id === projected.id, `${projected.id}: projeksjonsstatus er feil`);
  }
  for (const sourceRecord of claims.sources) {
    assert(evidenceSourceIds.has(sourceRecord.id) && /^https:\/\//.test(sourceRecord.url) && sourceRecord.source_location, `${sourceRecord.id}: ugyldig kilde`);
  }

  const usedClaimIds = claimReferences(modules);
  for (const claimId of usedClaimIds) assert(claimById.has(claimId), `${chapter.chapter_id}: ukjent claim ${claimId}`);
  for (const claimId of claimById.keys()) assert(usedClaimIds.includes(claimId), `${chapter.chapter_id}: ubrukt claim ${claimId}`);

  const workedExampleCount = modules.flatMap(module => module.workedExamples || []).length;
  const misconceptionCount = modules.flatMap(module => module.commonMisconceptions || []).length;
  const applicationTaskCount = modules.flatMap(module => module.applicationTasks || []).length;
  const selfCheckCount = modules.flatMap(module => module.selfCheck || []).length;
  const requirements = brief.editorialRequirements;
  assert(sectionCount >= requirements.minimumSections, `${chapter.chapter_id}: for få seksjoner`);
  assert(paragraphCount >= requirements.minimumParagraphs, `${chapter.chapter_id}: for få fagavsnitt`);
  assert(workedExampleCount >= requirements.minimumWorkedExamples, `${chapter.chapter_id}: for få arbeidseksempler`);
  assert(misconceptionCount >= requirements.minimumMisconceptions, `${chapter.chapter_id}: for få misoppfatninger`);
  assert(applicationTaskCount >= requirements.minimumApplicationTasks, `${chapter.chapter_id}: for få anvendelsesoppgaver`);
  assert(selfCheckCount >= requirements.minimumSelfCheck, `${chapter.chapter_id}: for få selvtester`);

  return {
    chapterId: chapter.chapter_id,
    domainId: chapter.primary_domain_id,
    chapterFile: record.file,
    briefFile: chapter.briefFile,
    claimsFile: chapter.claimsFile,
    moduleFiles: chapter.moduleFiles,
    evidenceFiles: chapter.evidenceFiles,
    moduleCount: modules.length,
    sectionCount,
    paragraphCount,
    sourceCount: claims.sources.length,
    claimCount: claims.claims.length,
    evidenceTopicCount: evidence.length,
    workedExampleCount,
    misconceptionCount,
    applicationTaskCount,
    selfCheckCount
  };
}

function aggregate(audits) {
  const numericFields = [
    'moduleCount', 'sectionCount', 'paragraphCount', 'sourceCount', 'claimCount',
    'evidenceTopicCount', 'workedExampleCount', 'misconceptionCount',
    'applicationTaskCount', 'selfCheckCount'
  ];
  return Object.fromEntries(numericFields.map(field => [field, audits.reduce((sum, audit) => sum + audit[field], 0)]));
}

function buildReport(source, generalRow, chapterAudits, chapterAudit) {
  const canonicalDomainOrder = source.domainCatalog.domains.map(domain => domain.domain_id);
  return {
    schema: 'history_go_fagverk_musikk_subject_audit_v1',
    version: '1.1.0',
    status: 'phase_4_musikk_chapters_in_progress',
    generatedFrom: {
      manifest: P.manifest,
      portal: P.portal,
      inventory: P.inventory,
      status: P.status,
      registry: P.registry,
      scientificPackage: source.packagePath,
      scientificIndex: source.indexPath,
      domainCatalog: source.domainCatalogPath,
      methodProtocols: source.methodsPath,
      modules: source.modulePaths,
      report: P.report,
      chapters: chapterAudits.map(audit => ({
        chapter: audit.chapterFile,
        chapterBrief: audit.briefFile,
        chapterClaims: audit.claimsFile,
        chapterModules: audit.moduleFiles,
        chapterEvidence: audit.evidenceFiles
      }))
    },
    subject: {
      id: 'musikk',
      title: source.index.subject_title,
      schemaFamily: 'standard_canonical',
      adapter: generalRow.adapter,
      subjectPage: generalRow.subjectPage,
      assessmentStatus: generalRow.assessmentStatus,
      editorialStatus: generalRow.editorialStatus,
      scientificAuthority: source.index.legacy_compatibility.scientific_authority,
      sourceRevision: source.index.source_revision
    },
    summary: {
      domainCount: canonicalDomainOrder.length,
      emneCount: source.modules.flatMap(module => module.topics || []).length,
      methodCount: source.methods.protocols.length,
      questionBlueprintCount: source.modules.flatMap(module => module.question_blueprints || []).length,
      sourceDossierTopicCount: source.index.summary.source_dossier_topic_count,
      verifiedScholarlySourceRecordCount: source.index.summary.verified_scholarly_source_record_count,
      chapterCount: generalRow.chapterCount,
      placeCount: generalRow.placeCount,
      ...Object.fromEntries(Object.entries(chapterAudit).map(([key, value]) => [`chapter${key[0].toUpperCase()}${key.slice(1)}`, value]))
    },
    chapterAudits,
    canonicalDomainOrder,
    authorityBoundary: {
      legacyRole: source.index.legacy_compatibility.role,
      legacyModuleRole: source.index.legacy_compatibility.module_inventory_role,
      scientificAuthority: source.index.legacy_compatibility.scientific_authority,
      scenekunstSeparateTopLevelSubject: source.index.discipline_boundary.scenekunst_is_separate_top_level_subject,
      performanceStudyInScope: source.index.discipline_boundary.music_performance_study_is_in_scope
    },
    gates: {
      manifestFirstScientificPackage: true,
      activeScientificIndexResolved: true,
      canonicalDomainsResolved: true,
      canonicalTopicsResolved: true,
      canonicalMethodsResolved: true,
      questionBlueprintsResolved: true,
      allTopicDomainRefsResolved: true,
      allTopicMethodRefsResolved: true,
      legacyNotScientificAuthority: true,
      scenekunstBoundaryPreserved: true,
      bibliographicBasisNotPromotedToFulltextEvidence: true,
      chaptersMaterializedFromReleasedEvidence: true,
      chaptersCanonicalDomainCoverage: true,
      chaptersParagraphClaimTrace: true,
      chaptersAllProjectedClaimsUsed: true,
      chapterRegistryUniqueDomains: true,
      chapterPackagesReady: true
    }
  };
}

export function auditRepository({ writeReport = false, checkReport = true } = {}) {
  const manifest = json(P.manifest);
  const status = json(P.status);
  const registry = json(P.registry);
  const source = scientific(manifest.musikk);
  const statusEntry = status.subjects.find(entry => entry.id === 'musikk');
  assert(statusEntry.navigationStatus === 'materialized' && statusEntry.assessmentStatus === 'audited' && statusEntry.editorialStatus === 'chapters_in_progress', 'Musikk-status er feil');
  assert(source.index.subject_id === 'musikk' && source.index.legacy_compatibility.scientific_authority === 'this_package', 'Musikk-authority er feil');
  const topics = source.modules.flatMap(module => module.topics || []);
  const methods = new Set(source.methods.protocols.map(method => method.method_id));
  assert(source.domainCatalog.domains.length === 8 && topics.length === 48 && methods.size === 18, 'Canonical inventar avviker');
  for (const topic of topics) {
    for (const methodId of topic.method_protocol_ids || []) assert(methods.has(methodId), `${topic.emne_id}: ukjent metode ${methodId}`);
  }

  const registryChapters = registry.subjects?.musikk?.chapters || [];
  assert(registryChapters.length >= 2, 'Musikk mangler forventet kapittelfremdrift');
  const domainIds = registryChapters.map(record => record.primary_domain_id);
  assert(new Set(domainIds).size === domainIds.length, 'Musikk har flere kapitler for samme canonicale fagområde');
  const chapterAudits = registryChapters.map(record => auditChapter(record, source));
  const chapterAudit = aggregate(chapterAudits);

  const general = auditGeneralRepository({ writeReport: false, checkReport: false });
  const generalRow = general.materializedRows.find(row => row.id === 'musikk');
  assert(generalRow && generalRow.chapterCount === registryChapters.length && generalRow.editorialStatus === 'chapters_in_progress', 'Generell motor mangler Musikk-kapitler');
  const report = buildReport(source, generalRow, chapterAudits, chapterAudit);
  if (writeReport) fs.writeFileSync(absolute(P.report), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return { report, source, generalRow, chapterAudit, chapterAudits };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditRepository({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Fagverk Musikk OK: ${result.report.summary.domainCount} domener, ${result.report.summary.chapterCount} kapitler, ${result.chapterAudit.claimCount} claims.`);
  } catch (error) {
    console.error(`Fagverk Musikk FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
