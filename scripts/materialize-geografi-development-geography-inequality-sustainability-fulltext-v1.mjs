#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-geografi-development-geography-inequality-sustainability-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = 'data/fag/natur/geografi/production_registry_v1.json';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const report = audit();
if (report.status !== 'pass_fulltext_materialized_domain_ready_for_registry') throw new Error('Felt 11 fulltekst-audit er ikke grønn');
const registry = read(REGISTRY);
if ((registry.progress?.materializedDomains ?? 0) < 11) throw new Error('Felt 11 er ikke registrert materialisert');
const entry = (registry.materialized || []).find((row) => row.ordinal === 11 && row.domain_id === 'utviklingsgeografi_ulikhet_baerekraft');
if (!entry) throw new Error('Felt 11 mangler registry-binding');
if (entry.chapter !== 'data/fagverk/natur/geografi/utviklingsgeografi-ulikhet-og-baerekraft.json') throw new Error('Felt 11 chapter-binding er feil');
if (entry.audit !== 'reports/fagverk/geografi-development-geography-inequality-sustainability-fulltext-v1-audit.json') throw new Error('Felt 11 audit-binding er feil');
console.log('Geografi felt 11 deterministisk materialisering OK.');
