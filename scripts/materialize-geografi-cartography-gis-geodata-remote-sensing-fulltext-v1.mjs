#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function materialize() {
  const chapter = read('data/fagverk/natur/geografi/kartografi-gis-geodata-og-fjernmaling.json');
  const claims = read('data/fagverk/natur/geografi/kartografi-gis-geodata-og-fjernmaling/claims.json');
  const assessment = read('data/fagverk/natur/geografi/kartografi-gis-geodata-og-fjernmaling/assessment.json');
  const report = read('reports/fagverk/geografi-cartography-gis-geodata-remote-sensing-fulltext-v1-audit.json');
  const registry = read('data/fag/natur/geografi/production_registry_v1.json');

  assert(chapter.editorialStatus === 'chapter_ready' && chapter.moduleFiles?.length === 4, 'Felt 2-kapittelet er ikke fulltekstklart');
  assert(claims.claims?.length === 32 && claims.claims.every((row) => row.status === 'verified'), 'Felt 2 mangler 32 verifiserte claims');
  assert(assessment.questions?.length === 8 && assessment.caseTasks?.length === 6, 'Felt 2 mangler vurderingspakken');
  assert(report.status === 'pass_fulltext_materialized_domain_ready_for_registry', 'Felt 2 mangler grønn fulltekst-audit');
  assert(registry.progress.materializedDomains >= 2, 'Produksjonsregisteret må registrere felt 2 før deterministisk materialisering kjøres');
  const entry = registry.materialized?.[1];
  assert(entry?.ordinal === 2 && entry?.domain_id === 'kartografi_gis_geodata_fjernmaling', 'Produksjonsregisteret mangler felt 2');
  assert(entry.chapter === 'data/fagverk/natur/geografi/kartografi-gis-geodata-og-fjernmaling.json', 'Felt 2 har feil chapter-binding');
  assert(entry.claims === 'data/fagverk/natur/geografi/kartografi-gis-geodata-og-fjernmaling/claims.json', 'Felt 2 har feil claim-binding');
  assert(entry.assessment === 'data/fagverk/natur/geografi/kartografi-gis-geodata-og-fjernmaling/assessment.json', 'Felt 2 har feil assessment-binding');
  assert(entry.audit === 'reports/fagverk/geografi-cartography-gis-geodata-remote-sensing-fulltext-v1-audit.json', 'Felt 2 har feil audit-binding');

  return { status: 'pass', domain: entry.domain_id, claims: claims.claims.length, assessments: assessment.questions.length };
}

try {
  const result = materialize();
  console.log(`Geografi felt 2 deterministisk materialisering OK: ${result.domain}, ${result.claims} claims, ${result.assessments} vurderinger.`);
} catch (error) {
  console.error(`Geografi felt 2 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
