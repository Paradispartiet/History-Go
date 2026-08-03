#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-baseline-audit.json';

const PATHS = Object.freeze({
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mapping: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  quizLegacy: 'data/quiz/quiz_subkultur.json',
  quizFromBy: 'data/quiz/quiz_subkultur_from_by.json',
  placeManifest: 'data/places/manifest.json',
  peopleManifest: 'data/people/manifest.json',
  fagverkRegistry: 'data/fagverk/fagverk_registry.json',
  subjectStatus: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json',
  runtimeManifest: 'data/fag/subkultur/subkultur_runtime_manifest.json',
  theoryObjects: 'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',
  theoryEvidence: 'data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  caseProfile: 'data/fag/profiles/subkultur/manifest.json',
  pathways: 'data/quiz/subkultur/subkultur_subject_pathways_v1.json'
});

const absolute = (relative) => path.join(ROOT, relative);
const exists = (relative) => fs.existsSync(absolute(relative));
const readJson = (relative) => JSON.parse(fs.readFileSync(absolute(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function flattenRecords(value) {
  if (Array.isArray(value)) return value.flatMap(flattenRecords);
  if (!value || typeof value !== 'object') return [];
  if (text(value.id)) return [value];
  return Object.values(value).flatMap(flattenRecords);
}

function loadManifestRecords(relative) {
  const manifest = readJson(relative);
  const files = list(manifest.files);
  const byId = new Map();
  for (const entry of files) {
    const file = text(entry).startsWith('data/') ? text(entry) : `data/${text(entry)}`;
    if (!exists(file)) continue;
    for (const record of flattenRecords(readJson(file))) {
      if (text(record.id)) byId.set(record.id, record);
    }
  }
  return [...byId.values()];
}

function countSubkulturRecords(records, kind) {
  return records.filter((record) => {
    const emneIds = list(record.emne_ids);
    const secondary = list(record.secondaryBadgeIds);
    const tags = list(record.tags);
    return record.category === 'subkultur'
      || secondary.includes('subkultur')
      || tags.includes('subkultur')
      || emneIds.some((id) => text(id).startsWith('em_sub_'));
  }).map((record) => ({
    id: record.id,
    primary: record.category === 'subkultur',
    secondary: list(record.secondaryBadgeIds).includes('subkultur'),
    tagged: kind === 'people' && list(record.tags).includes('subkultur'),
    emne_ids: list(record.emne_ids).filter((id) => text(id).startsWith('em_sub_'))
  }));
}

function chapterCount() {
  const directory = absolute('data/fagverk/subkultur');
  if (!fs.existsSync(directory)) return 0;
  return fs.readdirSync(directory).filter((name) => name.endsWith('.json')).length;
}

function inspectLegacyQuiz() {
  const legacy = list(readJson(PATHS.quizLegacy));
  const fromBy = list(readJson(PATHS.quizFromBy));
  const hasSources = (question) => list(question.source).length || list(question.sources).length;
  const hasKnowledge = (question) => Boolean(text(question.primary_knowledge_unit_id))
    || list(question.knowledge_unit_ids).length
    || Boolean(question.knowledge_payload);
  return {
    active_legacy_questions: legacy.length,
    active_without_sources: legacy.filter((question) => !hasSources(question)).length,
    active_without_knowledge: legacy.filter((question) => !hasKnowledge(question)).length,
    active_without_canonical_emne: legacy.filter((question) => !text(question.emne_id).startsWith('em_sub_')).length,
    from_by_questions: fromBy.length,
    from_by_with_foreign_emne: fromBy.filter((question) => text(question.emne_id).startsWith('em_by_')).length
  };
}

export function buildReport() {
  const contract = readJson(PATHS.contract);
  const fagkart = readJson(PATHS.fagkart);
  const emner = list(readJson(PATHS.emner));
  const methodsDocument = readJson(PATHS.methods);
  const methods = list(methodsDocument.methods);
  const mapping = list(readJson(PATHS.mapping));
  const pensum = readJson(PATHS.pensum);
  const mappedIds = new Set(mapping.map((entry) => text(entry.emne_id)).filter(Boolean));
  const emneIds = new Set(emner.map((entry) => text(entry.emne_id)).filter(Boolean));
  const methodIds = new Set(methods.map((entry) => text(entry.method_id)).filter(Boolean));
  const referencedMethods = new Set(emner.flatMap((entry) => [
    ...list(entry.methods),
    ...list(entry.method_ids)
  ]).map(text).filter(Boolean));
  const places = countSubkulturRecords(loadManifestRecords(PATHS.placeManifest), 'places');
  const people = countSubkulturRecords(loadManifestRecords(PATHS.peopleManifest), 'people');
  const registry = readJson(PATHS.fagverkRegistry);
  const status = list(readJson(PATHS.subjectStatus).subjects).find((entry) => entry.id === 'subkultur');
  const portal = list(readJson(PATHS.portal).categories).find((entry) => entry.id === 'subkultur');
  const domains = list(fagkart.categories);
  const hooks = domains.flatMap((domain) => list(domain.topic_hooks));
  const genericDefinitions = emner.filter((entry) => text(entry.definition).startsWith('Emnet studerer'));
  const missingDefinitions = emner.filter((entry) => !text(entry.definition));
  const uniqueMethodDescriptions = new Set(methods.map((entry) => text(entry.description)).filter(Boolean));
  const absentProductionFiles = [
    PATHS.runtimeManifest,
    PATHS.theoryObjects,
    PATHS.theoryEvidence,
    PATHS.sources,
    PATHS.claims,
    PATHS.caseProfile,
    PATHS.pathways
  ].filter((relative) => !exists(relative));

  const current = {
    domains: domains.length,
    hooks: hooks.length,
    emner: emner.length,
    mapped_emner: mapping.length,
    unmapped_emne_ids: [...emneIds].filter((id) => !mappedIds.has(id)).sort(),
    orphan_mapping_ids: [...mappedIds].filter((id) => !emneIds.has(id)).sort(),
    methods: methods.length,
    unique_method_descriptions: uniqueMethodDescriptions.size,
    unused_method_ids: [...methodIds].filter((id) => !referencedMethods.has(id)).sort(),
    generic_definition_count: genericDefinitions.length,
    missing_definition_count: missingDefinitions.length,
    pensum_domains: list(pensum.domains).length,
    fagverk_chapters: chapterCount(),
    runtime_manifest_exists: exists(PATHS.runtimeManifest),
    registry_subject_exists: Boolean(registry.subjects?.subkultur),
    navigation_status: status?.navigationStatus ?? null,
    assessment_status: status?.assessmentStatus ?? null,
    editorial_status: status?.editorialStatus ?? null,
    portal_subject_status: portal?.subjectStatus ?? null,
    subkultur_places: places.length,
    primary_subkultur_places: places.filter((entry) => entry.primary).length,
    secondary_subkultur_places: places.filter((entry) => entry.secondary).length,
    places_with_subkultur_emne: places.filter((entry) => entry.emne_ids.length).length,
    subkultur_people: people.length,
    people_with_subkultur_emne: people.filter((entry) => entry.emne_ids.length).length,
    legacy_quiz: inspectLegacyQuiz(),
    absent_production_files: absentProductionFiles
  };

  const targets = contract.canonical_targets;
  return {
    schema: 'history_go_subkultur_fagverk_baseline_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    baseline_locked_at: '2026-08-04',
    status: 'GAPS_CONFIRMED',
    definition_contract: PATHS.contract,
    current,
    targets,
    gaps: {
      domains: targets.domain_count - current.domains,
      emner: targets.emne_count - current.emner,
      mapped_emner: targets.emne_count - current.mapped_emner,
      theory_objects: targets.theory_object_count,
      chapters: targets.chapter_count - current.fagverk_chapters,
      pathways: targets.subject_pathway_count,
      individually_rewritten_definitions: current.generic_definition_count + current.missing_definition_count,
      places_without_subkultur_emne: current.subkultur_places - current.places_with_subkultur_emne,
      people_without_subkultur_emne: current.subkultur_people - current.people_with_subkultur_emne
    },
    completion_blockers: [
      'six_domain_oslo_weighted_structure_instead_of_eight_domain_universal_structure',
      'generic_or_missing_emne_definitions',
      'unmapped_core_emner',
      'duplicated_method_descriptions_without_distinct_operations',
      'no_theory_claim_source_evidence_layer',
      'no_fagverk_chapters',
      'no_runtime_manifest_or_registry_entry',
      'places_and_people_not_canonically_mapped',
      'legacy_quiz_without_sources_knowledge_or_subkultur_emne_binding',
      'foreign_em_by_bindings_in_from_by_quiz'
    ],
    status_guard: {
      expected_navigation_status: 'planned',
      expected_assessment_status: 'pending',
      expected_editorial_status: 'not_started',
      completion_status_change_allowed: false
    }
  };
}

export function auditRepository({ writeReport = false, checkReport = true } = {}) {
  const contract = readJson(PATHS.contract);
  assert(contract.subject_id === 'subkultur', 'Kontrakten har feil subject_id');
  assert(contract.canonical_targets?.domain_count === 8, 'Kontrakten må låse åtte domener');
  assert(contract.canonical_targets?.theory_object_count === 80, 'Kontrakten må låse 80 teoriobjekter');
  assert(list(contract.domains).length === 8, 'Kontrakten må navngi åtte domener');
  assert(new Set(list(contract.domains).map((entry) => entry.id)).size === 8, 'Domene-ID-er må være unike');

  const report = buildReport();
  assert(report.current.domains === 6, `Baseline skal dokumentere 6 domener, fikk ${report.current.domains}`);
  assert(report.current.hooks === 60, `Baseline skal dokumentere 60 hooks, fikk ${report.current.hooks}`);
  assert(report.current.emner === 72, `Baseline skal dokumentere 72 emner, fikk ${report.current.emner}`);
  assert(report.current.mapped_emner === 69, `Baseline skal dokumentere 69 mappinger, fikk ${report.current.mapped_emner}`);
  assert(report.current.unmapped_emne_ids.length === 3, 'Baseline skal dokumentere tre umappede emner');
  assert(report.current.methods === 71, `Baseline skal dokumentere 71 metoder, fikk ${report.current.methods}`);
  assert(report.current.generic_definition_count === 69, 'Baseline skal dokumentere 69 generiske definisjoner');
  assert(report.current.missing_definition_count === 3, 'Baseline skal dokumentere tre manglende definisjoner');
  assert(report.current.fagverk_chapters === 0, 'Subkultur skal ikke ha kapitler i baselinefasen');
  assert(report.current.navigation_status === 'planned', 'Baseline må beholde navigationStatus planned');
  assert(report.current.assessment_status === 'pending', 'Baseline må beholde assessmentStatus pending');
  assert(report.current.editorial_status === 'not_started', 'Baseline må beholde editorialStatus not_started');
  assert(report.current.registry_subject_exists === false, 'Baseline skal ikke ha Subkultur i fagverkregisteret');
  assert(report.current.legacy_quiz.active_legacy_questions === 73, 'Baseline skal dokumentere 73 legacyspørsmål');
  assert(report.current.legacy_quiz.from_by_with_foreign_emne === 10, 'Baseline skal dokumentere ti fremmede emnebindinger');

  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(REPORT)), { recursive: true });
    fs.writeFileSync(absolute(REPORT), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (checkReport) {
    assert(exists(REPORT), `${REPORT} mangler. Kjør audit med --write-report`);
    assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert. Kjør audit med --write-report`);
  }
  return report;
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditRepository({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report') || args.has('--check-report')
    });
    console.log(`Subkultur-fagverk baseline OK: ${report.current.domains}/8 domener, ${report.current.emner}/80 emner, ${report.current.fagverk_chapters}/8 kapitler; status ${report.status}.`);
  } catch (error) {
    console.error(`Subkultur-fagverk baseline FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
