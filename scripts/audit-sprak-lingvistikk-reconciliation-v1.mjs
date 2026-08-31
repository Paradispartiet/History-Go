#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const category = read('data/categories/category_contract.json');
  const registry = read('data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json');
  const ci = read('.github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json');
  const report = read('reports/fagverk/sprak-lingvistikk-reconciliation-v1.json');
  const firstBrief = read('data/fag/litteratur/sprak_lingvistikk/linguistic_thinking_language_data_analysis_evidence_source_claim_brief_v1.json');
  const subcategory = category.canonicalSubcategories.litteratur.find((row) => row.id === 'sprak_lingvistikk');

  assert(registry.owner_subject_id === 'litteratur' && registry.canonical_subcategory_id === 'sprak_lingvistikk', 'Produksjonsregister har feil Språk & lingvistikk-eierskap');
  assert(registry.progress.totalDomains === 12, 'Språk & lingvistikk skal ha 12 canonicale domener');
  const materialized = registry.progress.materializedDomains;
  const strictCompletionProven = materialized === 12 && registry.progress.strictCompletionProven === true;
  assert(Number.isInteger(materialized) && materialized >= 0 && materialized <= 12, 'Ugyldig materialisert fremdrift');
  assert(materialized === report.production_plan.materialized, 'Reconciliation og produksjonsregister må vise samme materialiserte fremdrift');
  assert(subcategory?.status === (strictCompletionProven ? 'foundation_materialized' : 'expansion_planned'), 'Canonical Språk & lingvistikk-status må følge strict completion-porten');
  assert(registry.materialized.length === materialized && registry.materialized.every((row, index) => row.ordinal === index + 1), 'Materialiserte lingvistikkfelt må være registrert én gang og i canonical rekkefølge');

  assert(ci.subject === 'sprak_lingvistikk' && ci.ownerSubject === 'litteratur' && ci.domains.length === 12, 'CI-register må dekke 12 Språk & lingvistikk-domener');
  assert(ci.domains.every((row, index) => row.ordinal === index + 1), 'Lingvistikk-domeneordning må være sammenhengende');
  assert(new Set(ci.domains.map((row) => row.domainId)).size === 12, 'Lingvistikk-domene-ID-er må være unike');
  assert(report.domains.length === 12 && report.domains.every((row, index) => row.ordinal === index + 1 && row.domain_id === ci.domains[index].domainId), 'Reconciliation-plan og CI-register må ha samme canonical rekkefølge');
  assert(report.domains.filter((row) => row.classification === 'reuse_with_expansion').length === 1, 'Ett lingvistikkfelt skal gjenbruke eksisterende eierinnhold med streng utvidelse');
  assert(report.domains.filter((row) => row.classification === 'new_production_required').length === 11, 'Elleve lingvistikkfelt krever ny disiplinær produksjon');
  assert(report.move_decision?.move_existing_files?.length === 0, 'Reconciliation skal ikke flytte eksisterende eierfiler');

  const allowed = new Set(['reuse', 'reuse_with_expansion', 'move', 'secondary_link', 'duplicate', 'new_production_required']);
  assert(report.findings.length >= 10 && report.findings.every((row) => allowed.has(row.classification)), 'Repository-funn må klassifiseres eksplisitt');
  assert(report.findings.some((row) => row.path.includes('sprak_makt_identitet') && row.classification === 'secondary_link'), 'Eksisterende Litteratur-spor for språk/makt/identitet mangler');
  assert(report.findings.some((row) => row.path.includes('sosiologi_antropologi') && row.classification === 'secondary_link'), 'Sosiolingvistisk Sosiologi/antropologi-binding mangler');
  assert(report.findings.some((row) => row.path.includes('psykologi') && row.classification === 'secondary_link'), 'Psykolingvistisk Psykologi-binding mangler');
  assert(report.prohibited_actions.some((row) => /slette eller flytte/u.test(row)), 'Ikke-slett/ikke-flytt-regel mangler');
  assert(report.prohibited_actions.some((row) => /sekundærlenker/u.test(row)), 'Sekundærlenker må eksplisitt være ikke-tellende');
  assert(report.prohibited_actions.some((row) => /preskriptive/u.test(row)), 'Deskriptiv/preskriptiv faggrense mangler');
  assert(report.prohibited_actions.some((row) => /skrift/u.test(row)), 'Skrift/språk-faggrense mangler');

  assert(firstBrief.status === 'source_first_ready_not_materialized' && firstBrief.domain.ordinal === 1, 'Første lingvistikkdomene må være source-first uten materialisering');
  const nextDomain = ci.domains[materialized] ?? null;
  if (strictCompletionProven) {
    assert(report.production_plan.source_first_ready === 12 && report.production_plan.next_domain === null && report.production_plan.strict_completion_proven === true, 'Strict completion må lukke Språk & lingvistikk-planen');
  } else {
    assert(report.production_plan.source_first_ready === materialized + 1, 'Source-first fremdrift skal ligge nøyaktig ett felt foran materialisering');
    assert(report.production_plan.next_domain === nextDomain.domainId, 'Neste lingvistikkdomene må følge canonical rekkefølge');
    assert(nextDomain.sourceBrief && nextDomain.sourceBriefScript && nextDomain.sourceBriefTest, 'Neste lingvistikkdomene må ha komplett source-first-kontrakt');
  }

  return {
    status: 'pass',
    domains: ci.domains.length,
    materialized,
    sourceFirstReady: report.production_plan.source_first_ready,
    strictCompletionProven,
    findings: report.findings.length,
    reuseWithExpansion: 1,
    newProductionRequired: 11,
    moveExisting: 0,
    nextDomain: nextDomain?.domainId ?? null
  };
}

try {
  const result = audit();
  console.log(`Språk & lingvistikk reconciliation OK: ${result.findings} funn, ${result.domains} felt, ${result.materialized} materialisert, ${result.sourceFirstReady} source-first klar.`);
} catch (error) {
  console.error(`Språk & lingvistikk reconciliation FEIL: ${error.message}`);
  process.exitCode = 1;
}
