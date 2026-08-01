#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/naeringsliv-specialization-chapters-audit.json';
const abs = (relative) => path.join(ROOT, relative);
const json = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const equalSet = (left, right) => isDeepStrictEqual([...left].sort(), [...right].sort());

function collectClaimIds(value, target = new Set(), active = false) {
  if (Array.isArray(value)) value.forEach((item) => collectClaimIds(item, target, active));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) collectClaimIds(item, target, active || ['claimIds','paragraphClaimIds','keyPointClaimIds'].includes(key));
  } else if (active && typeof value === 'string') target.add(value);
  return target;
}

function canonicalPlaceNames() {
  return new Map(json('data/places/places_index.json').map((place) => [place.id, place.name]));
}

export function auditNaeringslivSpecializations({ writeReport = false, checkReport = true } = {}) {
  const registry = json('data/fagverk/fagverk_registry.json');
  const status = json('data/fagverk/subject_status.json');
  const runtime = json('data/fag/naeringsliv/naeringsliv_runtime_manifest.json');
  const emneDoc = json('data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json');
  const methodDoc = json('data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json');
  const emneIds = new Set(emneDoc.map((row) => row.emne_id));
  const methodIds = new Set((methodDoc.methods || []).map((row) => row.method_id));
  const places = canonicalPlaceNames();
  const chapters = registry.subjects.naeringsliv.chapters.filter((row) => row.chapter_role === 'specialization');
  assert(chapters.length === 6, 'Expected six specialization chapters');
  assert(equalSet(chapters.map((row) => row.id), runtime.specializationChapterIds || []), 'Runtime specialization list mismatch');

  const chapterReports = [];
  for (const entry of chapters) {
    const chapter = json(entry.file);
    const brief = json(entry.briefFile);
    const claimsDoc = json(entry.claimsFile);
    const modules = entry.moduleFiles.map(json);
    assert(chapter.id === entry.id && chapter.chapter_id === entry.id && chapter.subject_id === 'naeringsliv', `${entry.id}: identity mismatch`);
    assert(chapter.chapter_role === 'specialization' && chapter.editorialStatus === 'chapter_ready', `${entry.id}: readiness mismatch`);
    assert(equalSet(chapter.emne_ids, entry.emne_ids) && chapter.emne_ids.every((id) => emneIds.has(id)), `${entry.id}: emne mismatch`);
    assert(equalSet(chapter.method_ids, entry.method_ids) && chapter.method_ids.every((id) => methodIds.has(id)), `${entry.id}: method mismatch`);
    assert(equalSet(brief.requiredEmneIds, chapter.emne_ids) && equalSet(brief.requiredMethodIds, chapter.method_ids), `${entry.id}: brief mismatch`);
    assert(modules.length === 3, `${entry.id}: expected three modules`);

    const sections = modules.flatMap((module) => module.sections || []);
    const paragraphs = sections.flatMap((section) => section.paragraphs || []);
    const relatedPlaces = modules.flatMap((module) => module.relatedPlaces || []);
    const workedExamples = modules.flatMap((module) => module.workedExamples || []);
    const misconceptions = modules.flatMap((module) => module.misconceptions || []);
    const applicationTasks = modules.flatMap((module) => module.applicationTasks || []);
    const selfCheck = modules.flatMap((module) => module.selfCheck || []);
    const concepts = chapter.concepts || [];
    assert(sections.length === 9 && new Set(sections.map((row) => row.id)).size === 9, `${entry.id}: section contract mismatch`);
    assert(paragraphs.length === 27 && paragraphs.every((paragraph) => paragraph.length >= 160), `${entry.id}: paragraph contract mismatch`);
    assert(workedExamples.length === 2 && misconceptions.length === 5 && applicationTasks.length === 3 && selfCheck.length === 8, `${entry.id}: pedagogy contract mismatch`);
    assert(applicationTasks.every((task) => task.task && Array.isArray(task.prompts) && task.prompts.length), `${entry.id}: application task renderer contract mismatch`);
    assert(relatedPlaces.length === 6 && relatedPlaces.every((place) => places.has(place.id) && place.name === places.get(place.id) && place.role), `${entry.id}: place renderer contract mismatch`);
    assert(concepts.length >= 9 && concepts.every((concept) => concept.id && concept.term && concept.definition), `${entry.id}: concept renderer contract mismatch`);
    const sectionConcepts = new Set(sections.flatMap((section) => section.concepts || []));
    const chapterConcepts = new Set(concepts.map((concept) => concept.term));
    assert([...sectionConcepts].every((concept) => chapterConcepts.has(concept)), `${entry.id}: section concepts are not materialized at chapter level`);

    const claimIds = new Set(claimsDoc.claims.map((claim) => claim.id));
    const sourceIds = new Set(claimsDoc.sources.map((source) => source.id));
    assert(claimsDoc.verification_status === 'verified' && claimIds.size === 27, `${entry.id}: claims contract mismatch`);
    assert(sourceIds.size === 9, `${entry.id}: source contract mismatch`);
    assert(claimsDoc.sources.every((source) => /^https:\/\//.test(source.url) && source.source_location), `${entry.id}: source is not inspectable`);
    const usedSources = new Set();
    for (const claim of claimsDoc.claims) {
      assert(claim.status === 'verified' && claim.source_ids.length, `${entry.id}/${claim.id}: verification mismatch`);
      claim.source_ids.forEach((sourceId) => { assert(sourceIds.has(sourceId), `${entry.id}/${claim.id}: unknown source`); usedSources.add(sourceId); });
    }
    assert(equalSet(usedSources, sourceIds), `${entry.id}: not every source is used`);
    assert(equalSet(collectClaimIds(modules), claimIds), `${entry.id}: claim trace mismatch`);
    const sectionIds = new Set(sections.map((section) => section.id));
    assert(claimsDoc.claims.every((claim) => claim.used_in.every((sectionId) => sectionIds.has(sectionId))), `${entry.id}: used_in mismatch`);

    chapterReports.push({
      id: entry.id, title: entry.title, primaryDomainId: entry.primary_domain_id,
      counts: { emners: chapter.emne_ids.length, methods: chapter.method_ids.length, modules: 3, sections: 9, paragraphs: 27, claims: 27, sources: 9, concepts: concepts.length, workedExamples: 2, misconceptions: 5, applicationTasks: 3, selfCheck: 8, relatedPlaces: 6 }
    });
  }

  const statusEntry = status.subjects.find((row) => row.id === 'naeringsliv');
  assert(statusEntry.editorialStatus === 'complete' && statusEntry.nextGate === 'maintenance_and_source_refresh', 'Næringsliv completion status mismatch');
  const report = {
    schema: 'history_go_naeringsliv_specialization_chapters_audit_v1', version: '1.0.0', status: 'PASSED', generatedAt: '2026-08-01',
    totals: { chapters: 6, modules: 18, sections: 54, paragraphs: 162, claims: 162, sources: 54, workedExamples: 12, misconceptions: 30, applicationTasks: 18, selfCheck: 48, relatedPlaces: 36 },
    chapters: chapterReports,
    gates: { canonicalSubsets: true, chapterRoleSeparated: true, allClaimsVerifiedAndTraced: true, allSourcesInspectableAndUsed: true, pedagogyComplete: true, rendererContractsComplete: true, canonicalPlacesValid: true, runtimeSpecializationListSynchronized: true, subjectCompleteAtTwelveChapters: true }
  };
  if (writeReport) fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(json(REPORT), report), `${REPORT} is stale`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditNaeringslivSpecializations({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`PASS Næringsliv specializations: ${report.totals.chapters} chapters, ${report.totals.claims} claims, ${report.totals.sources} sources`);
  } catch (error) {
    console.error(`FAIL Næringsliv specializations: ${error.message}`);
    process.exitCode = 1;
  }
}
