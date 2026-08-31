#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit as auditFulltext } from './audit-sprak-lingvistikk-historical-linguistics-language-change-genealogy-contact-fulltext-v1.mjs';
import { audit as auditNextSource } from './brief-sprak-lingvistikk-language-typology-universals-diversity-sources-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),assert=(c,m)=>{if(!c)throw new Error(m);};
try{
  const full=auditFulltext(),next=auditNextSource(),reg=read('data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json'),e=reg.materialized?.[8];
  assert(full.status==='pass_fulltext_materialized_domain_ready_for_registry','Historisk lingvistikk-audit må være grønn');
  assert(next.status==='pass_source_first_ready_not_materialized','Språktypologi source-first må være grønn');
  assert(reg.progress.materializedDomains===9&&reg.progress.strictCompletionProven===false,'Registry må stå på 9/12 uten completion proof');
  assert(e?.ordinal===9&&e.domain_id==='historisk_lingvistikk_sprakendring_slektskap_kontakt','Historisk lingvistikk må være felt 9');
  assert(e.chapter==='data/fagverk/litteratur/sprak_lingvistikk/historisk-lingvistikk-sprakendring-slektskap-og-kontakt.json','Feil chapter-binding');
  assert(e.claims==='data/fagverk/litteratur/sprak_lingvistikk/historisk-lingvistikk-sprakendring-slektskap-og-kontakt/claims.json','Feil claim-binding');
  assert(e.assessment==='data/fagverk/litteratur/sprak_lingvistikk/historisk-lingvistikk-sprakendring-slektskap-og-kontakt/assessment.json','Feil assessment-binding');
  assert(e.audit==='reports/fagverk/sprak-lingvistikk-historical-linguistics-language-change-genealogy-contact-fulltext-v1-audit.json','Feil audit-binding');
  assert(reg.next_gate==='language_typology_universals_diversity_fulltext','Neste gate må være Språktypologi fulltekst');
  console.log('Språk & lingvistikk felt 9 Historisk lingvistikk materializer OK: 9/12 registrert etter strict fulltext-audit og grønn felt 10 source-first.');
}catch(e){console.error(`Språk & lingvistikk felt 9 materializer FEIL: ${e.message}`);process.exitCode=1;}
