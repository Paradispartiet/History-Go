#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function materialize() {
  const chapter = read('data/fagverk/natur/geografi/geomorfologi-landskap-og-jordsystemer.json');
  const claims = read('data/fagverk/natur/geografi/geomorfologi-landskap-og-jordsystemer/claims.json');
  const assessment = read('data/fagverk/natur/geografi/geomorfologi-landskap-og-jordsystemer/assessment.json');
  const report = read('reports/fagverk/geografi-geomorphology-landscape-earth-systems-fulltext-v1-audit.json');
  const registry = read('data/fag/natur/geografi/production_registry_v1.json');

  assert(chapter.editorialStatus === 'chapter_ready' && chapter.moduleFiles?.length === 4 && chapter.reuseWithExpansion === true, 'Felt 3-kapittelet er ikke fulltekstklart');
  assert(claims.verifiedClaims?.length === 32 && claims.verifiedClaims.every((row) => row.status === 'verified'), 'Felt 3 mangler 32 verifiserte claims');
  assert(assessment.questions?.length === 8 && assessment.caseTasks?.length === 6, 'Felt 3 mangler vurderingspakken');
  assert(report.status === 'pass_fulltext_materialized_domain_ready_for_registry', 'Felt 3 mangler grønn fulltekst-audit');
  assert(registry.progress.materializedDomains >= 3, 'Produksjonsregisteret må registrere felt 3 før deterministisk materialisering kjøres');
  const entry = registry.materialized?.[2];
  assert(entry?.ordinal === 3 && entry?.domain_id === 'geomorfologi_landskap_jordsystemer', 'Produksjonsregisteret mangler felt 3');
  assert(entry.chapter === 'data/fagverk/natur/geografi/geomorfologi-landskap-og-jordsystemer.json', 'Felt 3 har feil chapter-binding');
  assert(entry.claims === 'data/fagverk/natur/geografi/geomorfologi-landskap-og-jordsystemer/claims.json', 'Felt 3 har feil claim-binding');
  assert(entry.assessment === 'data/fagverk/natur/geografi/geomorfologi-landskap-og-jordsystemer/assessment.json', 'Felt 3 har feil assessment-binding');
  assert(entry.audit === 'reports/fagverk/geografi-geomorphology-landscape-earth-systems-fulltext-v1-audit.json', 'Felt 3 har feil audit-binding');

  return { status: 'pass', domain: entry.domain_id, claims: claims.verifiedClaims.length, assessments: assessment.questions.length };
}

try {
  const result = materialize();
  console.log(`Geografi felt 3 deterministisk materialisering OK: ${result.domain}, ${result.claims} claims, ${result.assessments} vurderinger.`);
} catch (error) {
  console.error(`Geografi felt 3 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
