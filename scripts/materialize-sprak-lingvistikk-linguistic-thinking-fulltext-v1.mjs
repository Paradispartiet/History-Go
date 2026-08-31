#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-sprak-lingvistikk-linguistic-thinking-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function materialize() {
  const report = audit();
  const registry = read('data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json');
  assert(report.status === 'pass_fulltext_materialized_domain_ready_for_registry', 'Felt 1 audit må være grønn');
  assert(registry.progress.materializedDomains === 1, 'Produksjonsregisteret må stå på 1/12 når felt 1 materializer kjøres');
  assert(registry.progress.strictCompletionProven === false, 'Strict completion kan ikke være sann ved 1/12');
  const entry = registry.materialized?.[0];
  assert(entry?.ordinal === 1 && entry.domain_id === 'lingvistisk_tenkning_sprak_data_analyse_evidens', 'Felt 1 må være første materialiserte registry-entry');
  for (const key of ['chapter','claims','assessment','audit','source_brief','source_brief_audit']) {
    assert(typeof entry[key] === 'string' && fs.existsSync(path.join(ROOT, entry[key])), `Felt 1 registry-binding mangler ${key}`);
  }
  return { status:'pass', materializedDomains:1, domainId:entry.domain_id, audit:entry.audit };
}

try {
  const result = materialize();
  console.log(`Språk & lingvistikk materializer OK: ${result.materializedDomains}/12, ${result.domainId}.`);
} catch (error) {
  console.error(`Språk & lingvistikk materializer FEIL: ${error.message}`);
  process.exitCode = 1;
}
