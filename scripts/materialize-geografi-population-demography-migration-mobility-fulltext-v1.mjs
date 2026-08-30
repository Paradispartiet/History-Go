#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-geografi-population-demography-migration-mobility-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = path.join(ROOT, 'data/fag/natur/geografi/production_registry_v1.json');

try {
  const report = audit();
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const entry = (registry.materialized || []).find((row) => row.ordinal === 7 && row.domain_id === 'befolkning_demografi_migrasjon_mobilitet');
  if (registry.progress?.materializedDomains < 7 || !entry) throw new Error('Felt 7 er ikke registrert som materialisert');
  if (entry.chapter !== 'data/fagverk/natur/geografi/befolkning-demografi-migrasjon-og-mobilitet.json') throw new Error('Felt 7 har feil chapter-binding');
  if (entry.audit !== 'reports/fagverk/geografi-population-demography-migration-mobility-fulltext-v1-audit.json') throw new Error('Felt 7 har feil audit-binding');
  console.log(`Geografi felt 7 deterministisk materialisering OK: ${report.counts.paragraphs} avsnitt / ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 7 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
