#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditByPilot } from './audit-fagverk-by-pilot.mjs';
import { auditRepository as auditGeneralRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/by-complete-audit.json';
const NEXT_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const DOMAIN_CHAPTER_COUNTS = Object.freeze({
  byliv: 5,
  arkitektur: 2,
  bolig_og_nabolag: 1,
  administrasjon_og_plan: 1,
  urbanisme: 1,
  arbeid_og_naering: 1,
  historiske_lag: 1,
  makt_og_konflikt: 1,
  klima_og_helse: 1,
  data_og_styring: 1,
  regional_og_global: 1,
  boligpolitikk_og_velferd: 1
});

const abs = relativePath => path.join(ROOT, relativePath);
const json = relativePath => JSON.parse(fs.readFileSync(abs(relativePath), 'utf8'));
const text = value => String(value ?? '').trim();
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = values => [...values].map(text).sort();
const same = (left, right) => isDeepStrictEqual(sorted(left), sorted(right));

function collectNamedArrays(value, names, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectNamedArrays(item, names, result);
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  for (const [key, item] of Object.entries(value)) {
    if (names.has(key) && Array.isArray(item)) result.push(...item.flat(Infinity).map(text).filter(Boolean));
    else collectNamedArrays(item, names, result);
  }
  return result;
}

function placeIdsFrom({ brief, modules }) {
  const ids = new Set([
    ...(brief.relatedPlaceIds || []),
    ...(brief.related_place_ids || [])
  ].map(text).filter(Boolean));
  for (const module of modules) {
    for (const place of module.relatedPlaces || []) {
      ids.add(text(typeof place === 'string' ? place : place.id || place.place_id));
    }
  }
  ids.delete('');
  return [...ids].sort();
}

function placeFileIds() {
  return new Set(fs.readdirSync(abs('data/places'), { recursive: true })
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json')));
}

function auditChapter(record, model, canonicalPlaceIds) {
  assert(fs.existsSync(abs(record.file)), `${record.id}: kapittelfilen mangler`);
  const chapter = json(record.file);
  const brief = json(chapter.briefFile);
  const claims = json(chapter.claimsFile);
  const modules = chapter.moduleFiles.map(json);
  const sections = modules.flatMap(module => module.sections || []);
  const claimRefs = new Set(collectNamedArrays(modules, new Set(['claimIds', 'paragraphClaimIds', 'keyPointClaimIds'])));
  const sourceIds = new Set(claims.sources.map(source => source.id));
  const claimIds = new Set(claims.claims.map(claim => claim.id));
  const relatedPlaceIds = placeIdsFrom({ brief, modules });

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', `${record.id}: ugyldig kapittelskjema`);
  assert(chapter.subject_id === 'by' && chapter.chapter_id === record.id && chapter.id === record.id, `${record.id}: kapittelidentitet er feil`);
  assert(chapter.primary_domain_id === record.primary_domain_id, `${record.id}: primært fagområde er usynkronisert`);
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, `${record.id}: kapittelpakken er ikke frigitt`);
  assert(same(chapter.emne_ids, record.emne_ids), `${record.id}: registryemner er usynkronisert`);
  assert(chapter.emne_ids.every(id => model.emnersById.has(id)), `${record.id}: ukjent canonicalt emne`);
  assert(chapter.method_ids.length > 0 && chapter.method_ids.every(id => model.methodsById.has(id)), `${record.id}: ukjent canonical metode`);
  assert(brief.chapter_id === record.id && claims.chapter_id === record.id, `${record.id}: brief eller claims har feil identitet`);
  assert(modules.length === 3 && sections.length === 9, `${record.id}: forventet 3 moduler og 9 seksjoner`);
  assert(sections.every(section => section.paragraphs?.length === 3), `${record.id}: hver seksjon må ha tre fagavsnitt`);
  assert(sections.every(section => section.paragraphClaimIds?.length === section.paragraphs.length && section.paragraphClaimIds.every(ids => ids.length)), `${record.id}: avsnittssporingen er ufullstendig`);
  assert(claimIds.size === claims.claims.length && sourceIds.size === claims.sources.length, `${record.id}: dupliserte claim- eller kilde-ID-er`);
  assert([...claimRefs].every(id => claimIds.has(id)), `${record.id}: modulene peker til ukjent claim`);
  assert(claims.claims.every(claim => claim.status === 'verified' && claim.source_ids?.length && claim.source_ids.every(id => sourceIds.has(id)) && claim.used_in?.length), `${record.id}: claim mangler verifisering, kilde eller brukssted`);
  assert(claims.claims.every(claim => claim.used_in.every(sectionId => sections.some(section => section.id === sectionId && collectNamedArrays(section, new Set(['claimIds', 'paragraphClaimIds', 'keyPointClaimIds'])).includes(claim.id)))), `${record.id}: claimens used_in-spor avviker fra teksten`);
  assert(claims.claims.every(claim => claimRefs.has(claim.id)), `${record.id}: ubrukt claim`);
  assert(claims.sources.every(source => /^https:\/\//.test(source.url) && source.publisher && (source.title || source.label) && source.source_location && claims.claims.some(claim => claim.source_ids.includes(source.id))), `${record.id}: kilde er ikke inspiserbar eller brukt`);
  assert(modules.flatMap(module => module.workedExamples || []).length >= 2, `${record.id}: for få arbeidseksempler`);
  assert(modules.flatMap(module => module.commonMisconceptions || []).length >= 5, `${record.id}: for få misoppfatninger`);
  assert(modules.flatMap(module => module.applicationTasks || []).length >= 4, `${record.id}: for få anvendelsesoppgaver`);
  assert(modules.flatMap(module => module.selfCheck || []).length >= 6, `${record.id}: for få selvtester`);
  assert(relatedPlaceIds.length >= 4 && relatedPlaceIds.every(id => canonicalPlaceIds.has(id)), `${record.id}: minst fire canonicale stedscase må løses`);

  return {
    chapterId: record.id,
    domainId: record.primary_domain_id,
    emneIds: [...chapter.emne_ids],
    methodIds: [...chapter.method_ids],
    relatedPlaceIds,
    moduleCount: modules.length,
    sectionCount: sections.length,
    paragraphCount: sections.reduce((sum, section) => sum + section.paragraphs.length, 0),
    sourceCount: claims.sources.length,
    uniqueSourceUrlCount: new Set(claims.sources.map(source => source.url)).size,
    claimCount: claims.claims.length,
    workedExampleCount: modules.flatMap(module => module.workedExamples || []).length,
    misconceptionCount: modules.flatMap(module => module.commonMisconceptions || []).length,
    applicationTaskCount: modules.flatMap(module => module.applicationTasks || []).length,
    selfCheckCount: modules.flatMap(module => module.selfCheck || []).length
  };
}

function aggregate(audits) {
  const numeric = ['moduleCount', 'sectionCount', 'paragraphCount', 'sourceCount', 'claimCount', 'workedExampleCount', 'misconceptionCount', 'applicationTaskCount', 'selfCheckCount'];
  return Object.fromEntries(numeric.map(field => [field, audits.reduce((sum, audit) => sum + audit[field], 0)]));
}

function committedProjection(report) {
  return report;
}

export function auditByComplete({ writeReport = false, checkReport = true } = {}) {
  const registry = json('data/fagverk/fagverk_registry.json');
  const status = json('data/fagverk/subject_status.json');
  const byRegistry = registry.subjects.by;
  const byStatus = status.subjects.find(subject => subject.id === 'by');
  const { report: pilotReport, model } = auditByPilot({ checkReport: false });
  const general = auditGeneralRepository({ checkReport: false });
  const generalRow = general.materializedRows.find(row => row.id === 'by');

  assert(byStatus.navigationStatus === 'materialized' && byStatus.assessmentStatus === 'audited', 'By må være materialized og audited');
  assert(byStatus.editorialStatus === 'complete' && byStatus.nextGate === NEXT_GATE, 'By har ikke dokumentert sluttstatus');
  assert(byRegistry.editorialPlan?.completionRequirements?.includes('full_subject_audit_green'), 'Registry mangler eksplisitt helhetsauditport');
  assert(byRegistry.chapters.length === 17 && new Set(byRegistry.chapters.map(chapter => chapter.id)).size === 17, 'By må ha 17 unike kapitler');
  assert(model.summary.domainCount === 12 && model.summary.emneCount === 82 && model.summary.methodCount === 14 && model.summary.mappingCount === 82 && model.summary.hookCount === 81, 'Canonical By-modell har endret tellinger');
  assert(generalRow?.editorialStatus === 'complete' && generalRow.chapterCount === 17, 'General engine mangler komplett By-projeksjon');

  const chapterAudits = byRegistry.chapters.map(record => auditChapter(record, model, placeFileIds()));
  const coveredEmneIds = chapterAudits.flatMap(audit => audit.emneIds);
  const coveredMethodIds = new Set(chapterAudits.flatMap(audit => audit.methodIds));
  const coveredPlaceIds = new Set(chapterAudits.flatMap(audit => audit.relatedPlaceIds));
  const domainCounts = Object.fromEntries(Object.keys(DOMAIN_CHAPTER_COUNTS).map(domainId => [domainId, chapterAudits.filter(audit => audit.domainId === domainId).length]));
  const hookByEmne = new Map();
  for (const domain of model.domains) {
    for (const hook of domain.source?.topic_hooks || []) {
      assert(hook.canon?.thinkers?.length, `${domain.id}/${hook.id}: teorihook mangler canonicale tenkere`);
      for (const emneId of hook.emne_ids || []) {
        if (!hookByEmne.has(emneId)) hookByEmne.set(emneId, []);
        hookByEmne.get(emneId).push(hook.id);
      }
    }
  }

  assert(coveredEmneIds.length === 82 && new Set(coveredEmneIds).size === 82 && same(coveredEmneIds, model.emners.map(emne => emne.id)), 'Alle 82 canonicale emner må dekkes nøyaktig én gang');
  assert(same(coveredMethodIds, model.methods.map(method => method.id)), 'Alle 14 canonicale metoder må brukes i kapittelverket');
  assert(isDeepStrictEqual(domainCounts, DOMAIN_CHAPTER_COUNTS), 'Kapittelfordelingen dekker ikke alle tolv fagområder');
  assert(model.emners.every(emne => hookByEmne.has(emne.id)), 'Alle canonicale emner må ha eksplisitt teorihook');
  assert(model.emners.every(emne => emne.source?.progression_stage && emne.source?.pedagogical_track && emne.methodIds.length), 'Alle emner må ha progresjon og metodebinding');
  assert(model.methods.every(method => method.procedure.length && method.limitations.length), 'Alle metoder må ha prosedyre og begrensninger');

  const totals = aggregate(chapterAudits);
  assert(isDeepStrictEqual(totals, { moduleCount: 51, sectionCount: 153, paragraphCount: 459, sourceCount: 219, claimCount: 306, workedExampleCount: 34, misconceptionCount: 85, applicationTaskCount: 68, selfCheckCount: 102 }), 'Aggregerte kapitteltellinger avviker');
  assert(coveredPlaceIds.size === 20, 'By-fagverket skal bruke 20 unike canonicale stedscase');

  const report = {
    schema: 'history_go_fagverk_by_complete_audit_v1',
    version: '1.0.0',
    status: 'complete',
    generatedFrom: {
      manifest: 'data/fag/fag_manifest.json',
      curriculum: 'data/fag/by/curriculum_architecture_by_v1.json',
      qualityContract: 'data/fag/by/quality_contract_by_v1.json',
      status: 'data/fagverk/subject_status.json',
      registry: 'data/fagverk/fagverk_registry.json',
      pilotAudit: 'reports/fagverk/by-pilot-audit.json',
      generalEngineAudit: 'reports/fagverk/general-engine-audit.json',
      report: REPORT
    },
    subject: {
      id: 'by',
      title: byRegistry.title,
      schemaFamily: 'by_compatibility',
      navigationStatus: byStatus.navigationStatus,
      assessmentStatus: byStatus.assessmentStatus,
      editorialStatus: byStatus.editorialStatus,
      nextGate: byStatus.nextGate
    },
    summary: {
      domainCount: 12,
      chapterCount: 17,
      emneCount: 82,
      activeEmneCount: pilotReport.summary.activeEmneCount,
      methodCount: 14,
      mappingCount: 82,
      hookCount: 81,
      uniquePlaceCount: coveredPlaceIds.size,
      uniqueSourceUrlCount: new Set(byRegistry.chapters.flatMap(record => json(json(record.file).claimsFile).sources.map(source => source.url))).size,
      ...totals
    },
    canonicalDomainCoverage: Object.entries(DOMAIN_CHAPTER_COUNTS).map(([domainId, chapterCount]) => ({
      domainId,
      chapterCount,
      emneCount: model.domainsById.get(domainId).emneIds.length,
      chapterIds: chapterAudits.filter(audit => audit.domainId === domainId).map(audit => audit.chapterId)
    })),
    coveredPlaceIds: [...coveredPlaceIds].sort(),
    chapterAudits,
    gates: {
      manifestFirstCanonicalSourcesResolved: true,
      twelveCanonicalDomainsCovered: true,
      seventeenFullChapterPackagesReady: true,
      allEightyTwoCanonicalEmnersCoveredExactlyOnce: true,
      allFourteenCanonicalMethodsUsed: true,
      allEightyTwoMappingsResolved: true,
      allEightyOneHooksResolved: true,
      theoryHooksBindEveryCanonicalEmne: true,
      progressionAndMethodBindingComplete: true,
      paragraphClaimTraceComplete: true,
      allThreeHundredSixClaimsVerifiedAndUsed: true,
      allTwoHundredNineteenSourceRecordsInspectableAndUsed: true,
      twentyCanonicalPlaceCasesResolved: true,
      learningComponentsRenderable: true,
      generalEngineProjectsCompleteStatus: true,
      statusTransitionBackedByFullSubjectAudit: true,
      maintenanceGateDeclared: true
    }
  };

  const committed = committedProjection(report);
  if (writeReport) fs.writeFileSync(abs(REPORT), `${JSON.stringify(committed, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(json(REPORT), committed), `${REPORT} er utdatert`);
  return { report, model, generalRow };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditByComplete({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`By helhetsaudit OK: ${report.summary.domainCount}/12 fagområder, ${report.summary.emneCount}/82 emner, ${report.summary.chapterCount} kapitler, ${report.summary.sourceCount} kilder og ${report.summary.claimCount} claims.`);
  } catch (error) {
    console.error(`By helhetsaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
