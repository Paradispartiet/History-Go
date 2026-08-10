#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';
import { auditRepository as auditGeneralRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/media-complete-audit.json';
const NEXT_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const DOMAIN_ORDER = Object.freeze([
  'presse_redaksjoner_avishus', 'offentlighet_ytringsfrihet_etikk', 'kilder_kritikk_sannhet',
  'plattformer_algoritmer_distribusjon', 'propaganda_pavirkning_informasjonskrig', 'medieokonomi_eierskap_arbeid'
]);
const EXPECTED_TOTALS = Object.freeze({
  moduleCount: 18, sectionCount: 54, paragraphCount: 162, sourceCount: 126,
  claimCount: 160, workedExampleCount: 18, misconceptionCount: 30,
  applicationTaskCount: 30, selfCheckCount: 42
});
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sorted = (values) => [...values].sort();

function collectClaimRefs(value, result = []) {
  if (Array.isArray(value)) { for (const item of value) collectClaimRefs(item, result); return result; }
  if (!value || typeof value !== 'object') return result;
  for (const [key, item] of Object.entries(value)) {
    if (['claimIds', 'paragraphClaimIds', 'keyPointClaimIds'].includes(key) && Array.isArray(item)) result.push(...item.flat(Infinity));
    else collectClaimRefs(item, result);
  }
  return result;
}

function auditChapter(record, model, knownMethodIds, knownPlaceIds) {
  assert(fs.existsSync(abs(record.file)), `${record.id}: kapittelfilen mangler`);
  const chapter = json(record.file); const brief = json(chapter.briefFile); const claims = json(chapter.claimsFile);
  const modules = chapter.moduleFiles.map(json); const sections = modules.flatMap((module) => module.sections || []);
  const claimRefs = new Set(collectClaimRefs(modules)); const sourceIds = new Set(claims.sources.map((source) => source.id));
  const claimIds = new Set(claims.claims.map((claim) => claim.id)); const relatedPlaceIds = chapter.relatedPlaces.map((place) => place.id);
  assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject_id === 'media', `${record.id}: ugyldig kapittelskjema eller fag`);
  assert(chapter.chapter_id === record.id && chapter.id === record.id && chapter.primary_domain_id === record.primary_domain_id, `${record.id}: kapittelidentitet er feil`);
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, `${record.id}: kapittelpakken er ikke frigitt`);
  assert(isDeepStrictEqual(chapter.emne_ids, record.emne_ids) && chapter.emne_ids.every((id) => model.emnersById.has(id)), `${record.id}: registryemner er usynkronisert`);
  assert(chapter.method_ids.length && chapter.method_ids.every((id) => knownMethodIds.has(id)), `${record.id}: ukjent canonical hovedmetode`);
  assert(brief.chapter_id === record.id && claims.chapter_id === record.id, `${record.id}: brief eller claims har feil identitet`);
  assert(modules.length === 3 && sections.length === 9 && sections.every((section) => section.paragraphs?.length === 3), `${record.id}: forventet 3 moduler og 9×3 avsnitt`);
  assert(sections.every((section) => section.paragraphClaimIds?.length === section.paragraphs.length && section.paragraphClaimIds.every((ids) => ids.length)), `${record.id}: avsnittssporingen er ufullstendig`);
  assert(claimIds.size === claims.claims.length && sourceIds.size === claims.sources.length, `${record.id}: dupliserte claim- eller kilde-ID-er`);
  assert([...claimRefs].every((id) => claimIds.has(id)) && claims.claims.every((claim) => claimRefs.has(claim.id)), `${record.id}: claimbruk og claimregister avviker`);
  assert(claims.claims.every((claim) => claim.status === 'verified' && claim.source_ids?.length && claim.source_ids.every((id) => sourceIds.has(id)) && claim.used_in?.length), `${record.id}: claim mangler verifisering, kilde eller brukssted`);
  assert(claims.claims.every((claim) => claim.used_in.every((sectionId) => sections.some((section) => section.id === sectionId && collectClaimRefs(section).includes(claim.id)))), `${record.id}: claimens used_in-spor avviker fra teksten`);
  assert(claims.sources.every((source) => /^https:\/\//.test(source.url) && source.publisher && source.title && source.source_location && claims.claims.some((claim) => claim.source_ids.includes(source.id))), `${record.id}: kilde er ikke inspiserbar eller brukt`);
  assert(modules.flatMap((module) => module.workedExamples || []).length >= 3, `${record.id}: for få arbeidseksempler`);
  assert(modules.flatMap((module) => module.commonMisconceptions || []).length >= 5, `${record.id}: for få misoppfatninger`);
  assert(modules.flatMap((module) => module.applicationTasks || []).length >= 5, `${record.id}: for få anvendelsesoppgaver`);
  assert(modules.flatMap((module) => module.selfCheck || []).length >= 7, `${record.id}: for få selvtester`);
  assert(relatedPlaceIds.length === 4 && relatedPlaceIds.every((id) => knownPlaceIds.has(id)), `${record.id}: fire canonicale stedscase må løses`);
  return {
    chapterId: record.id, domainId: record.primary_domain_id, emneIds: [...chapter.emne_ids], methodIds: [...chapter.method_ids], relatedPlaceIds,
    moduleCount: modules.length, sectionCount: sections.length, paragraphCount: sections.reduce((sum, section) => sum + section.paragraphs.length, 0),
    sourceCount: claims.sources.length, sourceUrls: claims.sources.map((source) => source.url), claimCount: claims.claims.length,
    workedExampleCount: modules.flatMap((module) => module.workedExamples || []).length,
    misconceptionCount: modules.flatMap((module) => module.commonMisconceptions || []).length,
    applicationTaskCount: modules.flatMap((module) => module.applicationTasks || []).length,
    selfCheckCount: modules.flatMap((module) => module.selfCheck || []).length
  };
}

const aggregate = (audits) => Object.fromEntries(Object.keys(EXPECTED_TOTALS).map((field) => [field, audits.reduce((sum, audit) => sum + audit[field], 0)]));

export function auditMediaComplete({ writeReport = false, checkReport = true } = {}) {
  const registry = json('data/fagverk/fagverk_registry.json'); const status = json('data/fagverk/subject_status.json');
  const places = json('data/places/places_index.json'); const methods = json('data/fag/media/methods_media_canonical_v4_5.json').methods;
  const mediaRegistry = registry.subjects.media; const mediaStatus = status.subjects.find((subject) => subject.id === 'media');
  const { report: phase3Report, model } = auditMediaPhase3({ checkReport: false });
  const general = auditGeneralRepository({ checkReport: false }); const generalRow = general.materializedRows.find((row) => row.id === 'media');
  assert(mediaStatus.navigationStatus === 'materialized' && mediaStatus.assessmentStatus === 'audited', 'Media må være materialized og audited');
  assert(mediaStatus.editorialStatus === 'complete' && mediaStatus.nextGate === NEXT_GATE, 'Media har ikke dokumentert sluttstatus');
  assert(mediaRegistry.editorialPlan?.completionRequirements?.includes('full_subject_audit_green'), 'Registry mangler eksplisitt helhetsauditport');
  assert(mediaRegistry.chapters.length === 6 && new Set(mediaRegistry.chapters.map((chapter) => chapter.id)).size === 6, 'Media må ha seks unike kapitler');
  assert(model.summary.domainCount === 6 && model.summary.emneCount === 120 && model.summary.mappingCount === 120 && model.summary.hookCount === 60, 'Canonical Media-modell har endret tellinger');
  assert(phase3Report.summary.primaryMethodCount === 115 && phase3Report.nestedSupplement.emneCount === 56, 'Hovedmetoder eller nested Populærkultur har endret telling');
  assert(generalRow?.editorialStatus === 'complete' && generalRow.chapterCount === 6, 'General engine mangler komplett Media-projeksjon');
  const knownPlaceIds = new Set(places.map((place) => place.id));
  const primaryMethodIds = new Set(methods.filter((method) => method.registry_version === 'mediapensum_v4_5').map((method) => method.method_id));
  assert(primaryMethodIds.size === 115, 'Canonical Media-hovedmetoder skal være 115');
  const chapterAudits = mediaRegistry.chapters.map((record) => auditChapter(record, model, primaryMethodIds, knownPlaceIds));
  const coveredEmneIds = chapterAudits.flatMap((audit) => audit.emneIds); const coveredMethodIds = new Set(chapterAudits.flatMap((audit) => audit.methodIds));
  const coveredPlaceIds = new Set(chapterAudits.flatMap((audit) => audit.relatedPlaceIds));
  const domainCounts = Object.fromEntries(DOMAIN_ORDER.map((domainId) => [domainId, chapterAudits.filter((audit) => audit.domainId === domainId).length]));
  const totals = aggregate(chapterAudits); const sourceUrls = chapterAudits.flatMap((audit) => audit.sourceUrls);
  assert(coveredEmneIds.length === 120 && new Set(coveredEmneIds).size === 120 && isDeepStrictEqual(sorted(coveredEmneIds), sorted(model.emners.map((emne) => emne.id))), 'Alle 120 canonicale emner må dekkes nøyaktig én gang');
  assert(isDeepStrictEqual(sorted(coveredMethodIds), sorted(primaryMethodIds)), 'Alle 115 canonicale hovedmetoder må brukes i kapittelverket');
  assert(Object.values(domainCounts).every((count) => count === 1), 'Kapittelfordelingen dekker ikke alle seks fagområder nøyaktig én gang');
  assert(isDeepStrictEqual(totals, EXPECTED_TOTALS), 'Aggregerte kapitteltellinger avviker');
  assert(coveredPlaceIds.size === 15, 'Media-fagverket skal bruke femten unike canonicale stedscase');
  assert(new Set(sourceUrls).size === 117, 'Media-fagverket skal ha 117 unike kilde-URL-er');
  const report = {
    schema: 'history_go_fagverk_media_complete_audit_v1', version: '1.0.0', status: 'complete',
    generatedFrom: { manifest: 'data/fag/fag_manifest.json', curriculum: 'data/fag/media/mediapensum_canonical_v4_5.json', status: 'data/fagverk/subject_status.json', registry: 'data/fagverk/fagverk_registry.json', phase3Audit: 'reports/fagverk/media-phase3-audit.json', generalEngineAudit: 'reports/fagverk/general-engine-audit.json', report: REPORT },
    subject: { id: 'media', title: mediaRegistry.title, schemaFamily: 'standard_canonical', navigationStatus: mediaStatus.navigationStatus, assessmentStatus: mediaStatus.assessmentStatus, editorialStatus: mediaStatus.editorialStatus, nextGate: mediaStatus.nextGate },
    summary: { domainCount: 6, chapterCount: 6, emneCount: 120, methodCount: 115, mappingCount: 120, hookCount: 60, nestedPopularCultureEmneCount: 56, uniquePlaceCount: coveredPlaceIds.size, uniqueSourceUrlCount: new Set(sourceUrls).size, ...totals },
    canonicalDomainCoverage: DOMAIN_ORDER.map((domainId) => ({ domainId, chapterCount: domainCounts[domainId], emneCount: model.domainsById.get(domainId).emneIds.length, chapterIds: chapterAudits.filter((audit) => audit.domainId === domainId).map((audit) => audit.chapterId) })),
    coveredPlaceIds: [...coveredPlaceIds].sort(), chapterAudits: chapterAudits.map(({ sourceUrls: _sourceUrls, ...audit }) => audit),
    gates: { manifestFirstCanonicalSourcesResolved: true, sixCanonicalDomainsCovered: true, sixFullChapterPackagesReady: true, allOneHundredTwentyCanonicalEmnersCoveredExactlyOnce: true, allOneHundredFifteenCanonicalMethodsUsed: true, allOneHundredTwentyMappingsResolved: true, allSixtyHooksResolved: true, nestedPopularCulturePreserved: true, paragraphClaimTraceComplete: true, allOneHundredSixtyClaimsVerifiedAndUsed: true, allOneHundredTwentySixSourceRecordsInspectableAndUsed: true, fifteenCanonicalPlaceCasesResolved: true, learningComponentsRenderable: true, generalEngineProjectsCompleteStatus: true, statusTransitionBackedByFullSubjectAudit: true, maintenanceGateDeclared: true }
  };
  if (writeReport) { fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true }); fs.writeFileSync(abs(REPORT), JSON.stringify(report, null, 2) + '\n'); }
  if (checkReport) assert(isDeepStrictEqual(json(REPORT), report), REPORT + ' er utdatert');
  return { report, model, generalRow, phase3Report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditMediaComplete({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log('Media helhetsaudit OK: ' + report.summary.domainCount + '/6 fagområder, ' + report.summary.emneCount + '/120 emner, ' + report.summary.chapterCount + ' kapitler, ' + report.summary.sourceCount + ' kilder og ' + report.summary.claimCount + ' claims.');
  } catch (error) { console.error('Media helhetsaudit FEIL: ' + error.message); process.exitCode = 1; }
}
