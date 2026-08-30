#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-geografi-biogeography-soils-land-cover-ecosystems-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = path.join(ROOT, 'data/fag/natur/geografi/production_registry_v1.json');

try {
  const report = audit();
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const entry = (registry.materialized || []).find((row) => row.ordinal === 6 && row.domain_id === 'biogeografi_jord_arealdekke_okosystem');
  if (registry.progress?.materializedDomains < 6 || !entry) throw new Error('Felt 6 er ikke registrert som materialisert');
  if (entry.chapter !== 'data/fagverk/natur/geografi/biogeografi-jord-arealdekke-og-okosystem.json') throw new Error('Felt 6 har feil chapter-binding');
  if (entry.audit !== 'reports/fagverk/geografi-biogeography-soils-land-cover-ecosystems-fulltext-v1-audit.json') throw new Error('Felt 6 har feil audit-binding');
  console.log(`Geografi felt 6 deterministisk materialisering OK: ${report.counts.paragraphs} avsnitt / ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 6 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
