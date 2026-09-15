#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (...parts) => path.join(ROOT, ...parts);
const readJson = (file) => JSON.parse(fs.readFileSync(rel(file), 'utf8'));
const uniq = (xs) => new Set(xs).size === xs.length;
const sameSet = (a, b) => a.length === b.length && a.every((value) => b.includes(value));

const BINDINGS_PATH = 'data/fag/politikk/sosiologi_antropologi/advanced_theory_domain_bindings_v1.json';

export function audit() {
  const bindings = readJson(BINDINGS_PATH);
  const canon = readJson(bindings.canon_file);
  const production = readJson(bindings.production_registry);
  const domainRegistry = readJson(bindings.domain_registry);

  const works = canon.works ?? [];
  const workById = new Map(works.map((work) => [work.id, work]));
  const bindingRows = bindings.work_bindings ?? [];
  const bindingByWork = new Map(bindingRows.map((row) => [row.work_id, row]));
  const canonicalWorkIds = works.map((work) => work.id);
  const boundWorkIds = bindingRows.map((row) => row.work_id);
  const canonicalTheoryIds = works.flatMap((work) => (work.theory_units ?? []).map((unit) => unit.id));
  const boundTheoryIds = bindingRows.flatMap((row) => row.theory_unit_ids ?? []);

  const domainById = new Map((domainRegistry.domains ?? []).map((domain) => [domain.domainId, domain]));
  const materializedById = new Map((production.materialized ?? []).map((domain) => [domain.domain_id, domain]));

  const bindingDomainIds = bindingRows.flatMap((row) => [row.primary_domain_id, ...(row.secondary_domain_ids ?? [])]);
  const allDomainIdsCanonical = bindingDomainIds.every((domainId) => domainById.has(domainId) && materializedById.has(domainId));
  const allDomainSourceBriefsExist = [...new Set(bindingDomainIds)].every((domainId) => {
    const sourceBrief = domainById.get(domainId)?.sourceBrief;
    return typeof sourceBrief === 'string' && fs.existsSync(rel(sourceBrief));
  });
  const allPrimaryChaptersExist = bindingRows.every((row) => {
    const chapter = materializedById.get(row.primary_domain_id)?.chapter;
    return typeof chapter === 'string' && fs.existsSync(rel(chapter));
  });

  const rowIntegrity = bindingRows.every((row) => {
    const work = workById.get(row.work_id);
    if (!work) return false;
    const declaredDomains = work.primary_domain_ids ?? [];
    const rowDomains = [row.primary_domain_id, ...(row.secondary_domain_ids ?? [])];
    const workTheoryIds = (work.theory_units ?? []).map((unit) => unit.id);
    return (
      declaredDomains[0] === row.primary_domain_id &&
      sameSet(declaredDomains, rowDomains) &&
      uniq(rowDomains) &&
      sameSet(workTheoryIds, row.theory_unit_ids ?? []) &&
      uniq(row.theory_unit_ids ?? []) &&
      typeof row.integration_intent === 'string' &&
      row.integration_intent.trim().length >= 20
    );
  });

  const gates = {
    schema: bindings.schema === 'history_go_sosiologi_antropologi_advanced_theory_domain_bindings_v1',
    owner: bindings.subject_id === 'politikk' && bindings.canonical_subcategory_id === 'sosiologi_antropologi',
    maintenance_mode: bindings.policy?.binding_mode === 'maintenance_source_refresh_and_case_expansion',
    existing_domains_only: bindings.policy?.existing_domains_only === true,
    no_completion_reset: bindings.policy?.existing_strict_completion_is_not_reset === true,
    claims_pending: bindings.policy?.claims_remain_pending_until_domain_fulltext_refresh === true,
    assessment_pending: bindings.policy?.assessment_items_remain_pending_until_domain_fulltext_refresh === true,
    source_registry_strict_completion: production.status === 'strict_completion_proven' && production.progress?.strictCompletionProven === true,
    exact_work_count: bindings.expected_work_bindings === 20 && bindingRows.length === 20,
    exact_work_set: sameSet(canonicalWorkIds, boundWorkIds) && uniq(boundWorkIds),
    exact_theory_count: bindings.expected_theory_bindings === 60 && boundTheoryIds.length === 60,
    exact_theory_set: sameSet(canonicalTheoryIds, boundTheoryIds) && uniq(boundTheoryIds),
    row_integrity: rowIntegrity,
    canonical_materialized_domains_only: allDomainIdsCanonical,
    domain_source_briefs_exist: allDomainSourceBriefsExist,
    primary_chapters_exist: allPrimaryChaptersExist,
  };

  return {
    schema: bindings.schema,
    status: bindings.status,
    counts: {
      works: bindingRows.length,
      theories: boundTheoryIds.length,
      primaryDomains: new Set(bindingRows.map((row) => row.primary_domain_id)).size,
      allReferencedDomains: new Set(bindingDomainIds).size,
      materializedDomains: production.progress?.materializedDomains ?? null,
    },
    gates,
    passed: Object.values(gates).every(Boolean),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = audit();
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
