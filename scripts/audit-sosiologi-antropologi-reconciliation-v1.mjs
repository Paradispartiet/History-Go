#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const category = read('data/categories/category_contract.json');
  const registry = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
  const ci = read('.github/ci/fagverk-sosiologi-antropologi-domain-registry-v1.json');
  const report = read('reports/fagverk/sosiologi-antropologi-reconciliation-v1.json');
  const subcategory = category.canonicalSubcategories.politikk.find((row) => row.id === 'sosiologi_antropologi');
  assert(subcategory?.status === 'expansion_planned', 'Canonical status må forbli expansion_planned før første fulltekstfelt er materialisert');
  assert(registry.owner_subject_id === 'politikk' && registry.canonical_subcategory_id === 'sosiologi_antropologi', 'Produksjonsregister har feil eierskap');
  assert(registry.progress.materializedDomains === 0 && registry.progress.totalDomains === 12 && registry.progress.strictCompletionProven === false, 'Source-first-grunnlaget kan ikke påstå materialisering eller strict proof');
  assert(ci.subject === 'sosiologi_antropologi' && ci.ownerSubject === 'politikk' && ci.domains.length === 12, 'CI-register må dekke 12 underkategorifelt');
  assert(ci.domains.every((row, index) => row.ordinal === index + 1), 'Domeneordning må være sammenhengende');
  const allowed = new Set(['reuse', 'reuse_with_expansion', 'move', 'secondary_link', 'duplicate', 'new_production_required']);
  assert(report.findings.length >= 8 && report.findings.every((row) => allowed.has(row.classification)), 'Reconciliation må klassifisere eksisterende materiale eksplisitt');
  assert(report.findings.filter((row) => row.classification === 'reuse_with_expansion').length === 3, 'Tre eksisterende Politikk-kapitler skal gjenbrukes med streng oppgradering');
  assert(report.prohibited_actions.some((row) => /slette eller flytte/u.test(row)), 'Ikke-slett/ikke-flytt-regel mangler');
  return { status: 'pass', domains: ci.domains.length, materialized: 0, findings: report.findings.length, reuseWithExpansion: 3 };
}

try { const result = audit(); console.log(`Sosiologi/antropologi reconciliation OK: ${result.findings} funn, ${result.domains} felt, ${result.materialized} materialisert.`); }
catch (error) { console.error(`Sosiologi/antropologi reconciliation FEIL: ${error.message}`); process.exitCode = 1; }
