#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-foundation-audit.json';
const PATHS = Object.freeze({
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mapping: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  subjectStatus: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json',
  registry: 'data/fagverk/fagverk_registry.json',
  placeManifest: 'data/places/manifest.json',
  peopleManifest: 'data/people/manifest.json',
  quizLegacy: 'data/quiz/quiz_subkultur.json',
  quizFromBy: 'data/quiz/quiz_subkultur_from_by.json'
});

const absolute = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(absolute(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function collectEmneReferences(value, target = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('em_sub_')) target.add(value);
    return target;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectEmneReferences(entry, target);
    return target;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) collectEmneReferences(entry, target);
  }
  return target;
}

function manifestDocuments(relative) {
  const manifest = readJson(relative);
  return list(manifest.files).flatMap((entry) => {
    const file = text(entry).startsWith('data/') ? text(entry) : `data/${text(entry)}`;
    return fs.existsSync(absolute(file)) ? [readJson(file)] : [];
  });
}

function activeExternalReferences() {
  const values = [
    ...manifestDocuments(PATHS.placeManifest),
    ...manifestDocuments(PATHS.peopleManifest),
    readJson(PATHS.quizLegacy),
    readJson(PATHS.quizFromBy)
  ];
  return [...collectEmneReferences(values)].sort();
}

export function buildFoundationReport() {
  const contract = readJson(PATHS.contract);
  const fagkart = readJson(PATHS.fagkart);
  const emner = list(readJson(PATHS.emner));
  const methods = list(readJson(PATHS.methods).methods);
  const mapping = list(readJson(PATHS.mapping));
  const pensum = readJson(PATHS.pensum);
  const domains = list(fagkart.categories);
  const hooks = domains.flatMap((domain) => list(domain.topic_hooks));
  const domainIds = domains.map((domain) => text(domain.id));
  const contractDomainIds = list(contract.domains).map((domain) => text(domain.id));
  const emneIds = emner.map((emne) => text(emne.emne_id));
  const hookIds = hooks.map((hook) => text(hook.id));
  const methodIds = methods.map((method) => text(method.method_id));
  const mappingIds = mapping.map((entry) => text(entry.emne_id));
  const mappedHookIds = mapping.flatMap((entry) => list(entry.mappings).map((item) => text(item.topic_hook)));
  const usedMethodIds = new Set([
    ...emner.flatMap((emne) => list(emne.method_ids)),
    ...mapping.flatMap((entry) => list(entry.mappings).flatMap((item) => list(item.recommended_method_ids)))
  ]);
  const currentIds = new Set(emneIds);
  const externalRefs = activeExternalReferences();
  const retiredIds = Object.keys(pensum.emne_migration?.retired_ids ?? {}).sort();
  const status = list(readJson(PATHS.subjectStatus).subjects).find((entry) => entry.id === 'subkultur');
  const portal = list(readJson(PATHS.portal).categories).find((entry) => entry.id === 'subkultur');
  const registry = readJson(PATHS.registry);

  return {
    schema: 'history_go_subkultur_foundation_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    audited_at: '2026-08-04',
    status: 'FOUNDATION_READY_NOT_MATERIALIZED',
    counts: {
      domains: domains.length,
      hooks: hooks.length,
      emner: emner.length,
      mappings: mapping.length,
      methods: methods.length,
      pensum_domains: list(pensum.domains).length,
      preserved_legacy_ids: list(pensum.emne_migration?.preserved_legacy_ids).length,
      retired_legacy_ids: retiredIds.length,
      active_external_emne_references: externalRefs.length
    },
    per_domain: domains.map((domain) => ({
      id: domain.id,
      hooks: list(domain.topic_hooks).length,
      emner: emner.filter((emne) => emne.domain === domain.id).length,
      methods: methods.filter((method) => list(method.domain_ids).includes(domain.id)).length,
      mappings: mapping.filter((entry) => list(entry.mappings).some((item) => item.fagkart_kategori === domain.id)).length
    })),
    integrity: {
      domain_order_matches_contract: isDeepStrictEqual(domainIds, contractDomainIds),
      duplicate_domain_ids: duplicates(domainIds),
      duplicate_hook_ids: duplicates(hookIds),
      duplicate_emne_ids: duplicates(emneIds),
      duplicate_method_ids: duplicates(methodIds),
      duplicate_mapping_ids: duplicates(mappingIds),
      duplicate_mapped_hook_ids: duplicates(mappedHookIds),
      unmapped_emne_ids: emneIds.filter((id) => !mappingIds.includes(id)).sort(),
      orphan_mapping_ids: mappingIds.filter((id) => !currentIds.has(id)).sort(),
      unmapped_hook_ids: hookIds.filter((id) => !mappedHookIds.includes(id)).sort(),
      orphan_mapped_hook_ids: mappedHookIds.filter((id) => !hookIds.includes(id)).sort(),
      missing_method_ids: [...usedMethodIds].filter((id) => !methodIds.includes(id)).sort(),
      unused_method_ids: methodIds.filter((id) => !usedMethodIds.has(id)).sort(),
      generic_definitions: emnersWith(emner, (emne) => text(emne.definition).startsWith('Emnet studerer')),
      missing_definitions: emnersWith(emner, (emne) => !text(emne.definition)),
      missing_mechanisms: emnersWith(emner, (emne) => !text(emne.mechanism)),
      missing_limitations: emnersWith(emner, (emne) => !text(emne.limitation)),
      non_unique_method_operations: duplicates(methods.map((method) => text(method.operation))),
      dangling_external_emne_ids: externalRefs.filter((id) => !currentIds.has(id) && !retiredIds.includes(id)),
      referenced_retired_emne_ids: externalRefs.filter((id) => retiredIds.includes(id))
    },
    status_guard: {
      navigation_status: status?.navigationStatus ?? null,
      assessment_status: status?.assessmentStatus ?? null,
      editorial_status: status?.editorialStatus ?? null,
      portal_subject_status: portal?.subjectStatus ?? null,
      registry_subject_exists: Boolean(registry.subjects?.subkultur)
    },
    next_gate: pensum.next_gate
  };
}

function emnersWith(emner, predicate) {
  return emner.filter(predicate).map((emne) => text(emne.emne_id)).sort();
}

export function auditFoundation({ writeReport = false, checkReport = true } = {}) {
  const report = buildFoundationReport();
  assert(report.counts.domains === 8, 'Fagkartet må ha åtte domener');
  assert(report.counts.hooks === 80, 'Fagkartet må ha 80 hooks');
  assert(report.counts.emner === 80, 'Emneregisteret må ha 80 emner');
  assert(report.counts.mappings === 80, 'Mappingen må ha 80 poster');
  assert(report.counts.methods === 40, 'Metoderegisteret må ha 40 operative metoder');
  assert(report.counts.pensum_domains === 8, 'Pensum må ha åtte domener');
  assert(report.counts.preserved_legacy_ids === 71, 'Migrasjonen skal bevare 71 etablerte emne-ID-er');
  assert(report.counts.retired_legacy_ids === 1, 'Migrasjonen skal eksplisitt pensjonere én ureferert samle-ID');
  for (const domain of report.per_domain) {
    assert(domain.hooks === 10, `${domain.id} må ha ti hooks`);
    assert(domain.emner === 10, `${domain.id} må ha ti emner`);
    assert(domain.methods === 5, `${domain.id} må ha fem metoder`);
    assert(domain.mappings === 10, `${domain.id} må ha ti mappinger`);
  }
  assert(report.integrity.domain_order_matches_contract, 'Domeneorden avviker fra kontrakten');
  for (const [name, values] of Object.entries(report.integrity)) {
    if (typeof values === 'boolean') continue;
    assert(values.length === 0, `${name} må være tom, fikk: ${values.join(', ')}`);
  }
  assert(report.status_guard.navigation_status === 'planned', 'navigationStatus må forbli planned');
  assert(report.status_guard.assessment_status === 'pending', 'assessmentStatus må forbli pending');
  assert(report.status_guard.editorial_status === 'not_started', 'editorialStatus må forbli not_started');
  assert(report.status_guard.registry_subject_exists === false, 'Subkultur må ikke materialiseres i registeret ennå');
  assert(report.next_gate === 'theory_claim_source_evidence', 'Neste port skal være teori, claims, kilder og evidens');

  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(REPORT)), { recursive: true });
    fs.writeFileSync(absolute(REPORT), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (checkReport) {
    assert(fs.existsSync(absolute(REPORT)), `${REPORT} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert. Kjør --write-report`);
  }
  return report;
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFoundation({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report') || args.has('--check-report')
    });
    console.log(`Subkultur foundation OK: ${report.counts.domains} domener, ${report.counts.emner} emner, ${report.counts.methods} metoder; ${report.status}.`);
  } catch (error) {
    console.error(`Subkultur foundation FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
