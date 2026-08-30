#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function materialize() {
  const chapter = read('data/fagverk/natur/geografi/klima-vaer-klimasoner-og-endring.json');
  const claims = read('data/fagverk/natur/geografi/klima-vaer-klimasoner-og-endring/claims.json');
  const assessment = read('data/fagverk/natur/geografi/klima-vaer-klimasoner-og-endring/assessment.json');
  const report = read('reports/fagverk/geografi-climate-weather-zones-change-fulltext-v1-audit.json');
  const registry = read('data/fag/natur/geografi/production_registry_v1.json');

  assert(chapter.editorialStatus === 'chapter_ready' && chapter.moduleFiles?.length === 4, 'Felt 4-kapittelet er ikke fulltekstklart');
  assert(claims.verifiedClaims?.length === 32 && claims.verifiedClaims.every((row) => row.status === 'verified'), 'Felt 4 mangler 32 verifiserte claims');
  assert(assessment.questions?.length === 8 && assessment.caseTasks?.length === 6, 'Felt 4 mangler vurderingspakken');
  assert(report.status === 'pass_fulltext_materialized_domain_ready_for_registry', 'Felt 4 mangler grønn fulltekst-audit');
  assert(registry.progress.materializedDomains >= 4, 'Produksjonsregisteret må registrere felt 4 før deterministisk materialisering kjøres');
  const entry = registry.materialized?.[3];
  assert(entry?.ordinal === 4 && entry?.domain_id === 'klima_vaer_klimasoner_endring', 'Produksjonsregisteret mangler felt 4');
  assert(entry.chapter === 'data/fagverk/natur/geografi/klima-vaer-klimasoner-og-endring.json', 'Felt 4 har feil chapter-binding');
  assert(entry.claims === 'data/fagverk/natur/geografi/klima-vaer-klimasoner-og-endring/claims.json', 'Felt 4 har feil claim-binding');
  assert(entry.assessment === 'data/fagverk/natur/geografi/klima-vaer-klimasoner-og-endring/assessment.json', 'Felt 4 har feil assessment-binding');
  assert(entry.audit === 'reports/fagverk/geografi-climate-weather-zones-change-fulltext-v1-audit.json', 'Felt 4 har feil audit-binding');

  return { status: 'pass', domain: entry.domain_id, claims: claims.verifiedClaims.length, assessments: assessment.questions.length };
}

try {
  const result = materialize();
  console.log(`Geografi felt 4 deterministisk materialisering OK: ${result.domain}, ${result.claims} claims, ${result.assessments} vurderinger.`);
} catch (error) {
  console.error(`Geografi felt 4 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
