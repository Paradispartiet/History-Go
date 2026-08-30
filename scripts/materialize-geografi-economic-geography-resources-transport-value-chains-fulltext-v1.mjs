#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-geografi-economic-geography-resources-transport-value-chains-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = path.join(ROOT, 'data/fag/natur/geografi/production_registry_v1.json');

try {
  const report = audit();
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const entry = (registry.materialized || []).find((row) => row.ordinal === 9 && row.domain_id === 'okonomisk_geografi_ressurser_transport_verdikjeder');
  if (registry.progress?.materializedDomains < 9 || !entry) throw new Error('Felt 9 er ikke registrert som materialisert');
  if (entry.chapter !== 'data/fagverk/natur/geografi/okonomisk-geografi-ressurser-transport-og-verdikjeder.json') throw new Error('Felt 9 har feil chapter-binding');
  if (entry.audit !== 'reports/fagverk/geografi-economic-geography-resources-transport-value-chains-fulltext-v1-audit.json') throw new Error('Felt 9 har feil audit-binding');
  console.log(`Geografi felt 9 deterministisk materialisering OK: ${report.counts.paragraphs} avsnitt / ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 9 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
