#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function materialize() {
  const chapter = read('data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region.json');
  const claims = read('data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region/claims.json');
  const assessment = read('data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region/assessment.json');
  const report = read('reports/fagverk/geografi-geographic-thinking-fulltext-v1-audit.json');
  const registry = read('data/fag/natur/geografi/production_registry_v1.json');

  assert(chapter.editorialStatus === 'chapter_ready' && chapter.moduleFiles?.length === 4, 'Felt 1-kapittelet er ikke fulltekstklart');
  assert(claims.claims?.length === 32 && claims.claims.every((row) => row.status === 'verified'), 'Felt 1 mangler 32 verifiserte claims');
  assert(assessment.questions?.length === 8 && assessment.caseTasks?.length === 6, 'Felt 1 mangler vurderingspakken');
  assert(report.status === 'pass_fulltext_materialized_domain_ready_for_registry', 'Felt 1 mangler grønn fulltekst-audit');
  assert(registry.progress.materializedDomains >= 1, 'Produksjonsregisteret må registrere felt 1 før deterministisk materialisering kjøres');
  const entry = registry.materialized?.[0];
  assert(entry?.ordinal === 1 && entry?.domain_id === 'geografisk_tenkning_sted_rom_skala_region', 'Produksjonsregisteret mangler felt 1');
  assert(entry.chapter === 'data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region.json', 'Felt 1 har feil chapter-binding');
  assert(entry.claims === 'data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region/claims.json', 'Felt 1 har feil claim-binding');
  assert(entry.assessment === 'data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region/assessment.json', 'Felt 1 har feil assessment-binding');
  assert(entry.audit === 'reports/fagverk/geografi-geographic-thinking-fulltext-v1-audit.json', 'Felt 1 har feil audit-binding');

  return { status: 'pass', domain: entry.domain_id, claims: claims.claims.length, assessments: assessment.questions.length };
}

try {
  const result = materialize();
  console.log(`Geografi felt 1 deterministisk materialisering OK: ${result.domain}, ${result.claims} claims, ${result.assessments} vurderinger.`);
} catch (error) {
  console.error(`Geografi felt 1 materialisering FEIL: ${error.message}`);
  process.exitCode = 1;
}
