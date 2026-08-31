#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-geografi-settlement-urban-rural-urbanisation-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = path.join(ROOT, 'data/fag/natur/geografi/production_registry_v1.json');

try {
  const report = audit();
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const entry = (registry.materialized || []).find((row) => row.ordinal === 8 && row.domain_id === 'bosetting_by_land_urbanisering');
  if (registry.progress?.materializedDomains < 8 || !entry) throw new Error('Felt 8 er ikke registrert som materialisert');
  if (entry.chapter !== 'data/fagverk/natur/geografi/bosetting-by-land-og-urbanisering.json') throw new Error('Felt 8 har feil chapter-binding');
  if (entry.audit !== 'reports/fagverk/geografi-settlement-urban-rural-urbanisation-fulltext-v1-audit.json') throw new Error('Felt 8 har feil audit-binding');
  if (entry.source_brief !== 'data/fag/natur/geografi/settlement_urban_rural_urbanisation_source_claim_brief_v1.json') throw new Error('Felt 8 har feil source-brief-binding');
  console.log(`Geografi felt 8 deterministisk materialisering OK: ${report.counts.paragraphs} avsnitt / ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 8 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
