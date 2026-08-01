#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { evaluateNaeringslivEditorialPlan } from './naeringsliv-editorial-plan.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json',
  emner: 'data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json',
  fagkart: 'data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json',
  methods: 'data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json',
  mappings: 'data/fag/naeringsliv/emnemapping_naeringsliv_canonical_v4_5.json',
  quiz: 'data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json',
  badge: 'data/badges/naeringsliv.json',
  badgePage: 'data/fag/naeringsliv/merke_naeringsliv (1).html',
  universityFramework: 'data/fag/naeringsliv/universitetsramme_okonomi_og_naeringsliv_v1.json',
  universityTracks: 'data/fag/naeringsliv/universitetsspor_okonomi_og_naeringsliv_v1.json',
  universityMapping: 'data/fag/naeringsliv/universitetsmapping_okonomi_og_naeringsliv_v1.json',
  universityQuality: 'data/fag/naeringsliv/universitetskvalitet_okonomi_og_naeringsliv_v2.json',
  businessFramework: 'data/fag/naeringsliv/handelshogskoleramme_okonomi_og_naeringsliv_v1.json',
  businessTracks: 'data/fag/naeringsliv/handelshogskolespor_okonomi_og_naeringsliv_v1.json',
  businessModules: 'data/fag/naeringsliv/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json',
  runtime: 'data/fag/naeringsliv/naeringsliv_runtime_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/naeringsliv-quality-audit.json'
});
const abs = (relative) => path.join(ROOT, relative);
const read = (relative) => fs.readFileSync(abs(relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value) => String(value ?? '').trim();
const unique = (values) => new Set(values).size === values.length;
const sorted = (values) => [...(values || [])].map(text).sort();
const equalSet = (a, b) => isDeepStrictEqual(sorted(a), sorted(b));

export function auditNaeringslivQuality({ writeReport = false, checkReport = true } = {}) {
  const pensum = json(P.pensum);
  const emners = json(P.emner);
  const fagkart = json(P.fagkart);
  const methodsDocument = json(P.methods);
  const mappings = json(P.mappings);
  const quiz = json(P.quiz);
  const badge = json(P.badge);
  const badgePage = read(P.badgePage);
  const universityTracks = json(P.universityTracks);
  const universityMapping = json(P.universityMapping);
  const universityQuality = json(P.universityQuality);
  const businessFramework = json(P.businessFramework);
  const businessTracks = json(P.businessTracks);
  const businessModules = json(P.businessModules);
  const runtime = json(P.runtime);
  const portal = json(P.portal);
  const status = json(P.status);
  const registry = json(P.registry);

  const domains = pensum.domains || [];
  const methods = methodsDocument.methods || [];
  const coreEmners = emners.filter((row) => row?.emne_role !== 'field_module' && row?.module_type !== 'cross_domain_field_module');
  const fieldModules = emners.filter((row) => row?.emne_role === 'field_module' || row?.module_type === 'cross_domain_field_module');
  const hookCount = (fagkart.categories || []).reduce((sum, category) => sum + (category.topic_hooks || []).length, 0);
  const academicTrackCount = Object.keys(universityTracks.tracks || {}).length;
  const professionalTrackCount = Object.keys(businessTracks.tracks || {}).length;
  const professionalModuleCount = (businessModules.modules || []).length;
  const domainIds = domains.map((domain) => text(domain.domain_id));
  const emneIds = emners.map((emne) => text(emne.emne_id));
  const methodIds = methods.map((method) => text(method.method_id));
  const registeredChapters = registry.subjects?.naeringsliv?.chapters || [];
  const coreChapters = registeredChapters.filter((row) => text(row.chapter_role || 'core') === 'core');
  const specializationChapters = registeredChapters.filter((row) => text(row.chapter_role) === 'specialization');
  const chapterContent = { modules: 0, sections: 0, paragraphs: 0, claims: 0, sources: 0, workedExamples: 0, misconceptions: 0, applicationTasks: 0, selfCheck: 0, relatedPlaces: 0 };

  assert(pensum.subject_id === 'naeringsliv', 'Pensum uses wrong subject_id');
  assert(domains.length === 6, 'Expected six canonical business/economics domains');
  assert(emners.length === 38 && coreEmners.length === 36 && fieldModules.length === 2, 'Expected 38 emners: 36 core and 2 field modules');
  assert(methods.length === 27, 'Expected 27 canonical methods');
  assert(mappings.length === 36, 'Expected 36 core mapping rows');
  assert(hookCount === 60, 'Expected 60 fagkart hooks');
  assert(unique(domainIds) && unique(emneIds) && unique(methodIds), 'Canonical IDs must be unique');
  assert(pensum.summary?.all_core_emners_individually_curated === true, 'All 36 core emners must remain individually curated');
  assert(pensum.summary?.all_method_refs_valid === true, 'Pensum reports invalid method references');
  assert(academicTrackCount === 6, 'Expected six university tracks');
  assert(universityMapping.core_emne_count === 36 && (universityMapping.mapping || []).length === 36, 'University mapping must cover all 36 core emners');
  assert(universityQuality.individual_revision?.status === 'complete', 'University individual revision is not complete');
  assert(professionalTrackCount === 5, 'Expected five professional tracks');
  assert(professionalModuleCount === 25, 'Expected 25 professional modules');
  assert(businessFramework.relationship_to_university_core?.total_learning_units === 61, 'Expected 61 combined learning units');
  assert(businessFramework.non_degree_guard?.is_accredited_degree === false, 'Fagverket must not claim an accredited degree');
  assert(quiz.categoryId === 'naeringsliv' && quiz.title === 'Økonomi og næringsliv', 'Quiz profile uses wrong subject identity');
  assert(quiz.normal_opening_profile?.sets === 2 && quiz.normal_opening_profile?.questions_per_set === 7, 'Quiz profile must preserve 2 × 7 normal opening questions');
  assert(badge.id === 'naeringsliv' && badge.name === 'Økonomi og næringsliv', 'Badge identity is unsynchronized');
  assert(badgePage.includes('fagverk.html?subject=naeringsliv'), 'Badge page lacks canonical subject link');
  assert(runtime.subjectId === 'naeringsliv' && runtime.displayName === 'Økonomi og næringsliv', 'Runtime manifest uses wrong subject identity');
  assert(runtime.canonicalSummary?.domainCount === 6 && runtime.canonicalSummary?.emneCount === 38, 'Runtime manifest has stale canonical counts');
  assert(unique(registeredChapters.map((row) => text(row.id))), 'Registered chapter IDs must be unique');
  assert(coreChapters.length === domains.length, 'Each canonical domain must own one core chapter');
  assert(specializationChapters.length === 6, 'Expected six materialized specialization chapters');
  assert(unique(coreChapters.map((row) => text(row.primary_domain_id))), 'A canonical domain can only own one core chapter');
  const registeredEmneIds = [];
  for (const entry of registeredChapters) {
    assert(text(entry.file) && fs.existsSync(abs(entry.file)), `${entry.id}: registered chapter file is missing`);
    const chapter = json(entry.file);
    const claimsDocument = json(chapter.claimsFile);
    const chapterModules = chapter.moduleFiles.map(json);
    chapterContent.claims += claimsDocument.claims.length;
    chapterContent.sources += claimsDocument.sources.length;
    for (const module of chapterModules) {
      chapterContent.modules += 1;
      chapterContent.sections += (module.sections || []).length;
      chapterContent.paragraphs += (module.sections || []).flatMap((section) => section.paragraphs || []).length;
      chapterContent.workedExamples += (module.workedExamples || []).length;
      chapterContent.misconceptions += (module.misconceptions || []).length + (module.commonMisconceptions || []).length;
      chapterContent.applicationTasks += (module.applicationTasks || []).length;
      chapterContent.selfCheck += (module.selfCheck || []).length;
      chapterContent.relatedPlaces += (module.relatedPlaces || []).length;
    }
    const domain = domains.find((row) => row.domain_id === entry.primary_domain_id);
    assert(domain, `${entry.id}: unknown primary domain`);
    assert(chapter.subject_id === 'naeringsliv' && chapter.id === entry.id, `${entry.id}: chapter identity is unsynchronized`);
    assert(chapter.primary_domain_id === domain.domain_id, `${entry.id}: chapter uses wrong domain`);
    const specialization = text(entry.chapter_role) === 'specialization';
    if (specialization) {
      assert(chapter.chapter_role === 'specialization', `${entry.id}: specialization role is unsynchronized`);
      assert((chapter.emne_ids || []).length >= 5 && chapter.emne_ids.every((id) => emneIds.includes(id)), `${entry.id}: specialization has invalid emne coverage`);
      assert((chapter.method_ids || []).length >= 5 && chapter.method_ids.every((id) => methodIds.includes(id)), `${entry.id}: specialization has invalid method coverage`);
    } else {
      assert(equalSet(chapter.emne_ids, domain.emne_ids), `${entry.id}: core chapter does not cover the exact domain emners`);
      assert(equalSet(chapter.method_ids, domain.method_ids), `${entry.id}: core chapter does not cover the exact domain methods`);
    }
    assert(equalSet(entry.emne_ids, chapter.emne_ids) && equalSet(entry.method_ids, chapter.method_ids), `${entry.id}: registry coverage is stale`);
    if (!specialization) assert(runtime.chapterByDomain?.[domain.domain_id] === entry.id, `${entry.id}: runtime domain mapping is missing`);
    for (const emneId of chapter.emne_ids || []) {
      if (!specialization) assert(runtime.chapterByEmne?.[emneId] === entry.id, `${entry.id}: runtime emne mapping is missing for ${emneId}`);
      registeredEmneIds.push(emneId);
    }
  }
  assert(Object.keys(runtime.chapterByDomain || {}).length === coreChapters.length, 'Runtime has unregistered domain mappings');
  assert(Object.keys(runtime.chapterByEmne || {}).length === coreEmners.length, 'Runtime has unregistered emne mappings');
  assert(equalSet(runtime.specializationChapterIds, specializationChapters.map((row) => row.id)), 'Runtime specialization chapter list is stale');
  assert(isDeepStrictEqual(chapterContent, { modules: 36, sections: 108, paragraphs: 324, claims: 422, sources: 185, workedExamples: 24, misconceptions: 60, applicationTasks: 36, selfCheck: 96, relatedPlaces: 72 }), 'Materialized chapter content totals are stale');
  const portalEntry = portal.categories.find((row) => row.id === 'naeringsliv');
  assert(portalEntry?.subjectStatus === 'materialized' && portalEntry?.subjectPage === 'fagverk.html?subject=naeringsliv', 'Portal is not materialized');
  const statusEntry = status.subjects.find((row) => row.id === 'naeringsliv');
  const editorialPlan = evaluateNaeringslivEditorialPlan(registry.subjects?.naeringsliv, domainIds);
  assert(statusEntry?.navigationStatus === 'materialized', 'Status navigation is not materialized');
  assert(statusEntry?.assessmentStatus === 'audited', 'Status assessment is not audited');
  assert(statusEntry?.editorialStatus === editorialPlan.expectedEditorialStatus, `Status editorial state must be ${editorialPlan.expectedEditorialStatus}`);
  assert(statusEntry?.nextGate === editorialPlan.expectedNextGate, `Status next gate must be ${editorialPlan.expectedNextGate}`);
  assert(editorialPlan.withinTargetRange && editorialPlan.allChaptersReady, 'Editorial completion requires 12–14 chapter-ready, claim-traced chapters');
  assert(registry.subjects?.naeringsliv?.canonicalModel?.sourceOfTruth === true, 'Registry does not point to canonical naeringsliv data');
  assert(registry.subjects?.naeringsliv?.canonicalModel?.runtimeManifest === P.runtime, 'Registry points to wrong runtime manifest');

  const report = {
    schema: 'history_go_naeringsliv_subject_quality_audit_v1',
    version: '1.1.0',
    status: 'passed',
    generatedFrom: P,
    summary: {
      domainCount: domains.length,
      emneCount: emners.length,
      coreEmneCount: coreEmners.length,
      fieldModuleCount: fieldModules.length,
      methodCount: methods.length,
      mappingCount: mappings.length,
      hookCount,
      academicTrackCount,
      professionalTrackCount,
      professionalModuleCount,
      totalLearningUnits: businessFramework.relationship_to_university_core.total_learning_units,
      registeredChapterCount: registeredChapters.length,
      coreChapterCount: coreChapters.length,
      specializationChapterCount: specializationChapters.length,
      chapterContent,
      targetChapterMinimum: editorialPlan.minimum,
      targetChapterMaximum: editorialPlan.maximum,
      registeredDomainCount: new Set(registeredChapters.map((row) => row.primary_domain_id)).size,
      registeredEmneCount: new Set(registeredEmneIds).size,
      normalOpeningQuestions: quiz.normal_opening_profile.sets * quiz.normal_opening_profile.questions_per_set
    },
    gates: {
      canonicalIdentityStable: true,
      sixDomainStructure: true,
      coreEmnersIndividuallyCurated: true,
      canonicalMethodsAndHooks: true,
      universityFrameworkComplete: true,
      businessSchoolExtensionComplete: true,
      nonDegreeGuard: true,
      twoTimesSevenNormalQuizOpening: true,
      runtimeManifestMaterialized: true,
      portalRegistryStatusSynchronized: true,
      everyRegisteredChapterCanonical: true,
      runtimeHasNoOrphanMappings: true,
      editorialStatusMatchesChapterPlan: true
    }
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} is stale; run node scripts/audit-naeringsliv-subject-quality.mjs --write-report`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditNaeringslivQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Økonomi og næringsliv quality OK: ${report.summary.registeredChapterCount} chapters across ${report.summary.domainCount} domains, ${report.summary.emneCount} emners, ${report.summary.methodCount} methods.`);
  } catch (error) {
    console.error(`Økonomi og næringsliv quality ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
