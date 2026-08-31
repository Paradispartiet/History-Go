#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit } from './audit-sprak-lingvistikk-phonetics-speech-production-acoustics-perception-fulltext-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const assert=(c,m)=>{if(!c)throw new Error(m);};

try {
  const report=audit();
  const registry=read('data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json');
  const entry=registry.materialized?.[1];
  assert(registry.progress.materializedDomains===2,'Registry må stå på 2/12 før Fonetikk kan materialiseres permanent');
  assert(entry?.ordinal===2&&entry.domain_id==='fonetikk_taleproduksjon_akustikk_persepsjon','Fonetikk må være materialisert som felt 2');
  assert(entry.chapter==='data/fagverk/litteratur/sprak_lingvistikk/fonetikk-taleproduksjon-akustikk-og-persepsjon.json','Feil chapter-binding');
  assert(entry.claims==='data/fagverk/litteratur/sprak_lingvistikk/fonetikk-taleproduksjon-akustikk-og-persepsjon/claims.json','Feil claim-binding');
  assert(entry.assessment==='data/fagverk/litteratur/sprak_lingvistikk/fonetikk-taleproduksjon-akustikk-og-persepsjon/assessment.json','Feil assessment-binding');
  assert(entry.audit==='reports/fagverk/sprak-lingvistikk-phonetics-speech-production-acoustics-perception-fulltext-v1-audit.json','Feil audit-binding');
  assert(report.status==='pass_fulltext_materialized_domain_ready_for_registry','Fonetikk-audit må være grønn');
  console.log('Språk & lingvistikk felt 2 Fonetikk materializer OK: 2/12 registrert etter strict fulltext-audit.');
} catch(e) {
  console.error(`Språk & lingvistikk felt 2 materializer FEIL: ${e.message}`);
  process.exitCode=1;
}
