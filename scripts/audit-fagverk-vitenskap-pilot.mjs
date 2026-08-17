#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  manifest: 'data/fag/fag_manifest.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  pensum: 'data/fag/vitenskap/vitenskappensum_canonical_v4_6.json',
  mappings: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json',
  generator: 'data/fag/vitenskap/quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json',
  technologyIndex: 'data/fag/teknologi/teknologi_scientific_v2/index.json',
  report: 'reports/fagverk/vitenskap-pilot-audit.json'
});

const FIRST_UNIT_ID = 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap';
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function projection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    inventory: report.inventory,
    technology: report.technology,
    gates: report.gates
  };
}

export function auditVitenskapPilot({ writeReport = false, checkReport = true } = {}) {
  const manifest = json(P.manifest);
  const status = json(P.status);
  const registry = json(P.registry);
  const pensum = json(P.pensum);
  const mappings = json(P.mappings);
  const generator = json(P.generator);
  const technologyIndex = json(P.technologyIndex);
  const statusEntry = status.subjects.find((row) => row.id === 'vitenskap');
  const registrySubject = registry.subjects?.vitenskap;

  assert(manifest.vitenskap?.canonicalModelVersion === '4.6', 'Vitenskap manifest må bruke canonical model v4.6');
  assert(manifest.vitenskap?.pensum === 'vitenskap/vitenskappensum_canonical_v4_6.json', 'Vitenskap manifest peker til stale pensum');
  assert(manifest.vitenskap?.emneMappings === 'vitenskap/emnemapping_vitenskap_canonical_v4_6.json', 'Vitenskap manifest peker til stale mappings');
  assert(manifest.vitenskap?.specializations?.teknologi?.canonicalParentSubject === 'vitenskap', 'Teknologi må forbli nested under Vitenskap');

  assert(pensum.version === 'vitenskappensum_v4_6', 'Vitenskap-pensum har feil versjon');
  assert(isDeepStrictEqual(pensum.summary, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    topic_hook_count: 64,
    all_emner_have_mapping: true,
    all_method_refs_valid: true
  }), 'Vitenskap v4.6 har feil summary');
  assert(pensum.domains.length === 6, 'Vitenskap v4.6 skal ha seks canonicale domener');
  assert(mappings.length === 117, 'Vitenskap v4.6 skal ha 117 eksplisitte mappinger');
  assert(new Set(mappings.map((row) => row.emne_id)).size === 117, 'Vitenskap v4.6 har dupliserte mapping-ID-er');

  assert(statusEntry?.navigationStatus === 'materialized', 'Vitenskap må være materialized');
  assert(statusEntry?.assessmentStatus === 'audited', 'Vitenskap må være audited');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Vitenskap må stå chapters_in_progress');
  assert(['remaining_chapter_production_across_reconciled_university_breadth','final_holistic_university_breadth_completion_audit'].includes(statusEntry?.nextGate), 'Vitenskap har feil neste port');
  assert(Array.isArray(registrySubject?.chapters) && registrySubject.chapters.length >= 1, 'Vitenskap må ha minst ett registrert fulltekstkapittel');
  assert(registrySubject.chapters.some((row) => row.id === FIRST_UNIT_ID), 'Vitenskap må bevare Unit 1 gjennom senere kapittelproduksjon');
  assert(new Set(registrySubject.chapters.map((row) => row.id)).size === registrySubject.chapters.length, 'Vitenskap-registry har dupliserte chapter-ID-er');
  assert(registrySubject.chapters.every((row) => row.file && fs.existsSync(abs(row.file))), 'Vitenskap-registry peker til manglende kapittelroot');

  const inputs = generator.canonical_inputs || {};
  assert(inputs.pensum === 'vitenskappensum_canonical_v4_6.json', 'Quizgenerator peker til stale pensum');
  assert(inputs.emner === 'emner_vitenskap_canonical_v4_6.json', 'Quizgenerator peker til stale emner');
  assert(inputs.emnemapping === 'emnemapping_vitenskap_canonical_v4_6.json', 'Quizgenerator peker til stale mappings');
  assert(inputs.fagkart === 'fagkart_vitenskap_canonical_v4_6.json', 'Quizgenerator peker til stale fagkart');
  assert(inputs.methods === 'methods_vitenskap_canonical_v4_6.json', 'Quizgenerator peker til stale methods');
  assert(inputs.domain_count === 6 && inputs.emne_count === 117 && inputs.method_count === 84 && inputs.mapping_count === 117 && inputs.topic_hook_count === 64, 'Quizgenerator har feil v4.6-tellinger');

  assert(technologyIndex.counts?.areas === 12, 'Nested Teknologi har feil area-count');
  assert(technologyIndex.counts?.topics === 48, 'Nested Teknologi har feil topic-count');
  assert(technologyIndex.counts?.methods === 35, 'Nested Teknologi har feil method-count');
  assert(technologyIndex.counts?.hooks === 36, 'Nested Teknologi har feil hook-count');

  const report = {
    schema: 'history_go_fagverk_vitenskap_pilot_audit_v1',
    version: '1.3.0',
    status: 'vitenskap_with_nested_teknologi_canonical_v4_6_chapter_production',
    generatedFrom: P,
    subject: {
      id: 'vitenskap',
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate,
      registeredChapterCount: registrySubject.chapters.length
    },
    inventory: {
      domainCount: 6,
      emneCount: 117,
      methodCount: 84,
      mappingCount: 117,
      topicHookCount: 64
    },
    technology: {
      canonicalParentSubject: 'vitenskap',
      topLevelSubject: false,
      areaCount: technologyIndex.counts.areas,
      topicCount: technologyIndex.counts.topics,
      methodCount: technologyIndex.counts.methods,
      hookCount: technologyIndex.counts.hooks
    },
    gates: {
      canonicalModelV46: true,
      exactInventoryLocked: true,
      allMappingsUnique: true,
      editorialStatusChaptersInProgress: true,
      chapterProgressionMonotone: true,
      registeredChapterPresent: true,
      generatorUsesCanonicalV46: true,
      technologyRemainsNested: true
    }
  };

  const committed = projection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, pensum, mappings, technologyIndex };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditVitenskapPilot({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap pilot OK: ${report.inventory.emneCount} emner, ${report.inventory.topicHookCount} hooks, ${report.subject.registeredChapterCount} kapitler`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
