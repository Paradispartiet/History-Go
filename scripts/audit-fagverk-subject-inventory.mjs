#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/subject-baseline.json'
});
const CORE_FIELDS = Object.freeze(['pensum', 'emner', 'fagkart', 'methods']);
const ALLOWED_FAMILIES = new Set(['standard_canonical', 'foundation_v1', 'by_compatibility', 'technology_scientific_v2_4']);

const absolute = (relativePath) => path.join(ROOT, relativePath);
function readJson(relativePath) {
  let raw;
  try { raw = fs.readFileSync(absolute(relativePath), 'utf8'); }
  catch (error) { throw new Error(`Kan ikke lese ${relativePath}: ${error.message}`); }
  try { return JSON.parse(raw); }
  catch (error) { throw new Error(`Ugyldig JSON i ${relativePath}: ${error.message}`); }
}
function assert(condition, message) { if (!condition) throw new Error(message); }
function assertExactOrder(actual, expected, label) {
  assert(Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]), `${label} må følge canonical rekkefølge. Forventet ${JSON.stringify(expected)}, fikk ${JSON.stringify(actual)}`);
}
function resolveFagPointer(pointer) {
  assert(typeof pointer === 'string' && pointer.trim(), `Ugyldig fagfilpeker: ${JSON.stringify(pointer)}`);
  return path.posix.normalize(path.posix.join('data/fag', pointer));
}
function classifySubject(subjectId, manifestEntry) {
  if (subjectId === 'by') return 'by_compatibility';
  if (subjectId === 'teknologi' || manifestEntry.scientificPackage) return 'technology_scientific_v2_4';
  if (manifestEntry.status === 'active_foundation') return 'foundation_v1';
  return 'standard_canonical';
}
function countBy(items, field, allowedValues) {
  const counts = Object.fromEntries(allowedValues.map((value) => [value, 0]));
  for (const item of items) {
    assert(Object.hasOwn(counts, item[field]), `${item.id}: ukjent ${field} ${JSON.stringify(item[field])}`);
    counts[item[field]] += 1;
  }
  return counts;
}
function normalizeCoreFiles(manifestEntry) { return Object.fromEntries(CORE_FIELDS.map((field) => [field, manifestEntry[field]])); }

export function buildBaselineReport({ categories, manifest, inventory, status }) {
  const statusById = new Map(status.subjects.map((item) => [item.id, item]));
  const inventoryById = new Map(inventory.subjects.map((item) => [item.id, item]));
  const subjectRows = categories.fagSubjects.map((subjectId) => {
    const manifestEntry = manifest[subjectId];
    const inventoryEntry = inventoryById.get(subjectId);
    const statusEntry = statusById.get(subjectId);
    return {
      id: subjectId,
      schemaFamily: inventoryEntry.schemaFamily,
      coreFiles: normalizeCoreFiles(manifestEntry),
      optionalManifestFields: inventoryEntry.optionalManifestFields,
      navigationStatus: statusEntry.navigationStatus,
      assessmentStatus: statusEntry.assessmentStatus,
      editorialStatus: statusEntry.editorialStatus,
      pilot: inventoryEntry.pilot
    };
  });
  return {
    schema: 'history_go_fagverk_subject_baseline_report_v1',
    version: '1.1.0',
    status: 'living_inventory_baseline',
    generatedFrom: { inventory: PATHS.inventory, status: PATHS.status, categories: PATHS.categories, manifest: PATHS.manifest, portal: PATHS.portal },
    summary: {
      subjectCount: subjectRows.length,
      schemaFamilyCount: new Set(subjectRows.map((item) => item.schemaFamily)).size,
      requiredCoreFileCount: subjectRows.length * CORE_FIELDS.length,
      navigation: countBy(status.subjects, 'navigationStatus', status.rules.navigationStatuses),
      assessment: countBy(status.subjects, 'assessmentStatus', status.rules.assessmentStatuses),
      editorial: countBy(status.subjects, 'editorialStatus', status.rules.editorialStatuses),
      pilotSubjects: subjectRows.filter((item) => item.pilot).map((item) => item.id).sort()
    },
    migrationDebt: inventory.migrationDebt,
    subjects: subjectRows
  };
}

function validateStatusProgression(subjectId, statusEntry, portalEntry) {
  assert(statusEntry.navigationStatus === portalEntry.subjectStatus, `${subjectId}: portal- og statusregister er usynkronisert`);
  if (statusEntry.navigationStatus === 'planned') {
    assert(!portalEntry.subjectPage, `${subjectId}: planned fag kan ikke ha aktiv subjectPage`);
    assert(statusEntry.editorialStatus === 'not_started', `${subjectId}: planned fag kan ikke ha redaksjonell ferdigstatus`);
    assert(statusEntry.assessmentStatus !== 'audited', `${subjectId}: audited fag må materialiseres i samme godkjente endring`);
  } else {
    assert(portalEntry.subjectPage === `fagverk.html?subject=${subjectId}`, `${subjectId}: materialized fag må bruke canonical subjectPage`);
  }
  if (statusEntry.assessmentStatus === 'audited') {
    assert(statusEntry.navigationStatus === 'materialized', `${subjectId}: audited krever materialized`);
    assert(['structure_ready', 'chapters_in_progress', 'complete'].includes(statusEntry.editorialStatus), `${subjectId}: audited krever minst structure_ready`);
  }
  if (statusEntry.assessmentStatus === 'blocked') {
    assert(statusEntry.editorialStatus === 'not_started', `${subjectId}: blocked kan ikke ha redaksjonell ferdigstatus`);
  }
  if (statusEntry.editorialStatus !== 'not_started') {
    assert(statusEntry.navigationStatus === 'materialized' && statusEntry.assessmentStatus === 'audited', `${subjectId}: redaksjonell fremdrift krever materialized + audited`);
  }
}

export function auditRepository({ writeReport = false, checkReport = true } = {}) {
  const categories = readJson(PATHS.categories);
  const manifest = readJson(PATHS.manifest);
  const portal = readJson(PATHS.portal);
  const inventory = readJson(PATHS.inventory);
  const status = readJson(PATHS.status);
  assert(Array.isArray(categories.fagSubjects), 'category_contract.json mangler fagSubjects');
  const canonicalSubjects = categories.fagSubjects;
  assert(canonicalSubjects.length > 0, 'Canonical fagliste er tom');
  assertExactOrder(categories.runtimeCategories, canonicalSubjects, 'runtimeCategories');
  assertExactOrder(Object.keys(manifest), canonicalSubjects, 'fag_manifest.json');
  assertExactOrder(inventory.subjects.map((item) => item.id), canonicalSubjects, 'subject_inventory.json');
  assertExactOrder(status.subjects.map((item) => item.id), canonicalSubjects, 'subject_status.json');
  assertExactOrder(portal.categories.map((item) => item.id), canonicalSubjects, 'fagverk_portal.json');

  const inventoryById = new Map(inventory.subjects.map((item) => [item.id, item]));
  const statusById = new Map(status.subjects.map((item) => [item.id, item]));
  const portalById = new Map(portal.categories.map((item) => [item.id, item]));
  const coreFileAudit = [];

  for (const subjectId of canonicalSubjects) {
    const manifestEntry = manifest[subjectId];
    const inventoryEntry = inventoryById.get(subjectId);
    const statusEntry = statusById.get(subjectId);
    const portalEntry = portalById.get(subjectId);
    assert(manifestEntry && inventoryEntry && statusEntry && portalEntry, `${subjectId}: mangler manifest, inventory, status eller portal`);
    assert(ALLOWED_FAMILIES.has(inventoryEntry.schemaFamily), `${subjectId}: ukjent schemaFamily`);
    assert(inventoryEntry.schemaFamily === classifySubject(subjectId, manifestEntry), `${subjectId}: schemaFamily samsvarer ikke med manifestet`);
    assert(Array.isArray(inventoryEntry.requiredManifestFields) && CORE_FIELDS.every((field) => inventoryEntry.requiredManifestFields.includes(field)), `${subjectId}: inventory mangler required core-felt`);
    assert(Array.isArray(inventoryEntry.optionalManifestFields), `${subjectId}: optionalManifestFields må være array`);
    assert(typeof inventoryEntry.pilot === 'boolean', `${subjectId}: pilot må være boolean`);
    assert(status.rules.navigationStatuses.includes(statusEntry.navigationStatus), `${subjectId}: ugyldig navigationStatus`);
    assert(status.rules.assessmentStatuses.includes(statusEntry.assessmentStatus), `${subjectId}: ugyldig assessmentStatus`);
    assert(status.rules.editorialStatuses.includes(statusEntry.editorialStatus), `${subjectId}: ugyldig editorialStatus`);
    validateStatusProgression(subjectId, statusEntry, portalEntry);

    for (const field of CORE_FIELDS) {
      const pointer = manifestEntry[field];
      assert(typeof pointer === 'string' && pointer.length > 0, `${subjectId}: mangler manifestfeltet ${field}`);
      const relativePath = resolveFagPointer(pointer);
      assert(fs.existsSync(absolute(relativePath)), `${subjectId}: required ${field}-fil finnes ikke: ${relativePath}`);
      readJson(relativePath);
      coreFileAudit.push({ subjectId, field, path: relativePath });
    }
  }

  for (const debtPath of inventory.migrationDebt?.politicsSpecificRuntimeFiles ?? []) assert(fs.existsSync(absolute(debtPath)), `Inventert politikkspesifikk runtimefil finnes ikke: ${debtPath}`);

  const report = buildBaselineReport({ categories, manifest, inventory, status });
  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(PATHS.report)), { recursive: true });
    fs.writeFileSync(absolute(PATHS.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    const committed = readJson(PATHS.report);
    assert(isDeepStrictEqual(committed, report), `${PATHS.report} er utdatert. Kjør node scripts/audit-fagverk-subject-inventory.mjs --write-report`);
  }
  return { report, coreFileAudit, subjectCount: canonicalSubjects.length };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditRepository({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Fagverk inventar OK: ${result.subjectCount} fag, ${result.coreFileAudit.length} required kjernefiler, ${result.report.summary.schemaFamilyCount} schemafamilier.`);
  } catch (error) {
    console.error(`Fagverk inventar FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
