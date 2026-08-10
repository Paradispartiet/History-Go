#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditKunstPhase3 } from './audit-fagverk-kunst-phase3.mjs';
import { auditRepository as auditGeneralRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/kunst-complete-audit.json';
const NEXT_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const DOMAIN_ORDER = Object.freeze([
  'felt_institusjon', 'produksjon_praksis', 'estetisk_sprak_form',
  'makt_legitimitet', 'publikum_offentlighet', 'tid_transformasjon'
]);
const EXPECTED_TOTALS = Object.freeze({
  moduleCount: 18, sectionCount: 54, paragraphCount: 162, sourceCount: 100,
  claimCount: 140, workedExampleCount: 18, misconceptionCount: 29,
  applicationTaskCount: 29, selfCheckCount: 41
});
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sorted = (values) => [...values].sort();

function collectClaimRefs(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectClaimRefs(item, result);
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  for (const [key, item] of Object.entries(value)) {
    if (['claimIds', 'paragraphClaimIds', 'keyPointClaimIds'].includes(key) && Array.isArray(item)) result.push(...item.flat(Infinity));
    else collectClaimRefs(item, result);
  }
  return result;
}

function auditChapter(record, model, knownPlaceIds) {
  assert(fs.existsSync(abs(record.file)), `${record.id}: kapittelfilen mangler`);
  const chapter = json(record.file);
  const brief = json(chapter.briefFile);
  const claims = json(chapter.claimsFile);
  const modules = chapter.moduleFiles.map(json);
  const sections = modules.flatMap((module) => module.sections || []);
  const claimRefs = new Set(collectClaimRefs(modules));
  const sourceIds = new Set(claims.sources.map((source) => source.id));
  const claimIds = new Set(claims.claims.map((claim) => claim.id));
  const relatedPlaceIds = chapter.relatedPlaces.map((place) => place.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', `${record.id}: ugyldig kapittelskjema`);
  assert(chapter.subject_id === 'kunst' && chapter.chapter_id === record.id && chapter.id === record.id, `${record.id}: kapittelidentitet er feil`);
  assert(chapter.primary_domain_id === record.primary_domain_id, `${record.id}: primært fagområde er usynkronisert`);
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, `${record.id}: kapittelpakken er ikke frigitt`);
  assert(isDeepStrictEqual(chapter.emne_ids, record.emne_ids), `${record.id}: registryemner er usynkronisert`);
  assert(chapter.emne_ids.every((id) => model.emnersById.has(id)), `${record.id}: ukjent canonicalt emne`);
  assert(chapter.method_ids.length > 0 && chapter.method_ids.every((id) => model.methodsById.has(id)), `${record.id}: ukjent canonical metode`);
  assert(brief.chapter_id === record.id && claims.chapter_id === record.id, `${record.id}: brief eller claims har feil identitet`);
  assert(modules.length === 3 && sections.length === 9, `${record.id}: forventet 3 moduler og 9 seksjoner`);
  assert(sections.every((section) => section.paragraphs?.length === 3), `${record.id}: hver seksjon må ha tre fagavsnitt`);
  assert(sections.every((section) => section.paragraphClaimIds?.length === section.paragraphs.length && section.paragraphClaimIds.every((ids) => ids.length)), `${record.id}: avsnittssporingen er ufullstendig`);
  assert(claimIds.size === claims.claims.length && sourceIds.size === claims.sources.length, `${record.id}: dupliserte claim- eller kilde-ID-er`);
  assert([...claimRefs].every((id) => claimIds.has(id)), `${record.id}: modulene peker til ukjent claim`);
  assert(claims.claims.every((claim) => claim.status === 'verified' && claim.source_ids?.length && claim.source_ids.every((id) => sourceIds.has(id)) && claim.used_in?.length), `${record.id}: claim mangler verifisering, kilde eller brukssted`);
  assert(claims.claims.every((claim) => claim.used_in.every((sectionId) => sections.some((section) => section.id === sectionId && collectClaimRefs(section).includes(claim.id)))), `${record.id}: claimens used_in-spor avviker fra teksten`);
  assert(claims.claims.every((claim) => claimRefs.has(claim.id)), `${record.id}: ubrukt claim`);
  assert(claims.sources.every((source) => /^https:\/\//.test(source.url) && source.publisher && source.title && source.source_location && claims.claims.some((claim) => claim.source_ids.includes(source.id))), `${record.id}: kilde er ikke inspiserbar eller brukt`);
  assert(modules.flatMap((module) => module.workedExamples || []).length >= 3, `${record.id}: for få arbeidseksempler`);
  assert(modules.flatMap((module) => module.commonMisconceptions || []).length >= 4, `${record.id}: for få misoppfatninger`);
  assert(modules.flatMap((module) => module.applicationTasks || []).length >= 4, `${record.id}: for få anvendelsesoppgaver`);
  assert(modules.flatMap((module) => module.selfCheck || []).length >= 6, `${record.id}: for få selvtester`);
  assert(relatedPlaceIds.length === 4 && relatedPlaceIds.every((id) => knownPlaceIds.has(id)), `${record.id}: fire canonicale stedscase må løses`);

  return {
    chapterId: record.id, domainId: record.primary_domain_id, emneIds: [...chapter.emne_ids],
    methodIds: [...chapter.method_ids], relatedPlaceIds, moduleCount: modules.length,
    sectionCount: sections.length, paragraphCount: sections.reduce((sum, section) => sum + section.paragraphs.length, 0),
    sourceCount: claims.sources.length, sourceUrls: claims.sources.map((source) => source.url), claimCount: claims.claims.length,
    workedExampleCount: modules.flatMap((module) => module.workedExamples || []).length,
    misconceptionCount: modules.flatMap((module) => module.commonMisconceptions || []).length,
    applicationTaskCount: modules.flatMap((module) => module.applicationTasks || []).length,
    selfCheckCount: modules.flatMap((module) => module.selfCheck || []).length
  };
}

function aggregate(audits) {
  const fields = Object.keys(EXPECTED_TOTALS);
  return Object.fromEntries(fields.map((field) => [field, audits.reduce((sum, audit) => sum + audit[field], 0)]));
}

export function auditKunstComplete({ writeReport = false, checkReport = true } = {}) {
  const registry = json('data/fagverk/fagverk_registry.json');
  const status = json('data/fagverk/subject_status.json');
  const places = json('data/places/places_index.json');
  const kunstRegistry = registry.subjects.kunst;
  const kunstStatus = status.subjects.find((subject) => subject.id === 'kunst');
  const { report: phase3Report, model } = auditKunstPhase3({ checkReport: false });
  const general = auditGeneralRepository({ checkReport: false });
  const generalRow = general.materializedRows.find((row) => row.id === 'kunst');

  assert(kunstStatus.navigationStatus === 'materialized' && kunstStatus.assessmentStatus === 'audited', 'Kunst må være materialized og audited');
  assert(kunstStatus.editorialStatus === 'complete' && kunstStatus.nextGate === NEXT_GATE, 'Kunst har ikke dokumentert sluttstatus');
  assert(kunstRegistry.editorialPlan?.completionRequirements?.includes('full_subject_audit_green'), 'Registry mangler eksplisitt helhetsauditport');
  assert(kunstRegistry.chapters.length === 6 && new Set(kunstRegistry.chapters.map((chapter) => chapter.id)).size === 6, 'Kunst må ha seks unike kapitler');
  assert(model.summary.domainCount === 6 && model.summary.emneCount === 21 && model.summary.methodCount === 21 && model.summary.mappingCount === 21 && model.summary.hookCount === 60, 'Canonical Kunst-modell har endret tellinger');
  assert(generalRow?.editorialStatus === 'complete' && generalRow.chapterCount === 6, 'General engine mangler komplett Kunst-projeksjon');

  const knownPlaceIds = new Set(places.map((place) => place.id));
  const chapterAudits = kunstRegistry.chapters.map((record) => auditChapter(record, model, knownPlaceIds));
  const coveredEmneIds = chapterAudits.flatMap((audit) => audit.emneIds);
  const coveredMethodIds = new Set(chapterAudits.flatMap((audit) => audit.methodIds));
  const coveredPlaceIds = new Set(chapterAudits.flatMap((audit) => audit.relatedPlaceIds));
  const domainCounts = Object.fromEntries(DOMAIN_ORDER.map((domainId) => [domainId, chapterAudits.filter((audit) => audit.domainId === domainId).length]));
  const totals = aggregate(chapterAudits);
  const sourceUrls = chapterAudits.flatMap((audit) => audit.sourceUrls);

  assert(coveredEmneIds.length === 21 && new Set(coveredEmneIds).size === 21 && isDeepStrictEqual(sorted(coveredEmneIds), sorted(model.emners.map((emne) => emne.id))), 'Alle 21 canonicale emner må dekkes nøyaktig én gang');
  assert(isDeepStrictEqual(sorted(coveredMethodIds), sorted(model.methods.map((method) => method.id))), 'Alle 21 canonicale metoder må brukes i kapittelverket');
  assert(Object.values(domainCounts).every((count) => count === 1), 'Kapittelfordelingen dekker ikke alle seks fagområder nøyaktig én gang');
  assert(isDeepStrictEqual(totals, EXPECTED_TOTALS), 'Aggregerte kapitteltellinger avviker');
  assert(coveredPlaceIds.size === 11, 'Kunst-fagverket skal bruke elleve unike canonicale stedscase');
  assert(new Set(sourceUrls).size === 95, 'Kunst-fagverket skal ha 95 unike kilde-URL-er');

  const report = {
    schema: 'history_go_fagverk_kunst_complete_audit_v1', version: '1.0.0', status: 'complete',
    generatedFrom: {
      manifest: 'data/fag/fag_manifest.json', curriculum: 'data/fag/kunst/kunstpensum_canonical_v4_5.json',
      status: 'data/fagverk/subject_status.json', registry: 'data/fagverk/fagverk_registry.json',
      phase3Audit: 'reports/fagverk/kunst-phase3-audit.json', generalEngineAudit: 'reports/fagverk/general-engine-audit.json', report: REPORT
    },
    subject: {
      id: 'kunst', title: kunstRegistry.title, schemaFamily: 'standard_canonical',
      navigationStatus: kunstStatus.navigationStatus, assessmentStatus: kunstStatus.assessmentStatus,
      editorialStatus: kunstStatus.editorialStatus, nextGate: kunstStatus.nextGate
    },
    summary: {
      domainCount: 6, chapterCount: 6, emneCount: 21, methodCount: 21,
      mappingCount: 21, hookCount: 60, uniquePlaceCount: coveredPlaceIds.size,
      uniqueSourceUrlCount: new Set(sourceUrls).size, ...totals
    },
    canonicalDomainCoverage: DOMAIN_ORDER.map((domainId) => ({
      domainId, chapterCount: domainCounts[domainId], emneCount: model.domainsById.get(domainId).emneIds.length,
      chapterIds: chapterAudits.filter((audit) => audit.domainId === domainId).map((audit) => audit.chapterId)
    })),
    coveredPlaceIds: [...coveredPlaceIds].sort(),
    chapterAudits: chapterAudits.map(({ sourceUrls: _sourceUrls, ...audit }) => audit),
    gates: {
      manifestFirstCanonicalSourcesResolved: true, sixCanonicalDomainsCovered: true,
      sixFullChapterPackagesReady: true, allTwentyOneCanonicalEmnersCoveredExactlyOnce: true,
      allTwentyOneCanonicalMethodsUsed: true, allTwentyOneMappingsResolved: true,
      allSixtyHooksResolved: true, paragraphClaimTraceComplete: true,
      allOneHundredFortyClaimsVerifiedAndUsed: true,
      allOneHundredSourceRecordsInspectableAndUsed: true, elevenCanonicalPlaceCasesResolved: true,
      learningComponentsRenderable: true, generalEngineProjectsCompleteStatus: true,
      statusTransitionBackedByFullSubjectAudit: true, maintenanceGateDeclared: true
    }
  };

  if (writeReport) fs.writeFileSync(abs(REPORT), JSON.stringify(report, null, 2) + '\n');
  if (checkReport) assert(isDeepStrictEqual(json(REPORT), report), REPORT + ' er utdatert');
  return { report, model, generalRow, phase3Report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditKunstComplete({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log('Kunst helhetsaudit OK: ' + report.summary.domainCount + '/6 fagområder, ' + report.summary.emneCount + '/21 emner, ' + report.summary.chapterCount + ' kapitler, ' + report.summary.sourceCount + ' kilder og ' + report.summary.claimCount + ' claims.');
  } catch (error) {
    console.error('Kunst helhetsaudit FEIL: ' + error.message);
    process.exitCode = 1;
  }
}
