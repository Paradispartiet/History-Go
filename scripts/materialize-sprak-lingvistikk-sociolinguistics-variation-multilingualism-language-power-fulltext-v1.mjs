#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { audit as auditFulltext } from './audit-sprak-lingvistikk-sociolinguistics-variation-multilingualism-language-power-fulltext-v1.mjs';
import { audit as auditNextSource } from './brief-sprak-lingvistikk-historical-linguistics-language-change-genealogy-contact-sources-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),assert=(c,m)=>{if(!c)throw new Error(m);};
try{
  const full=auditFulltext(),next=auditNextSource(),reg=read('data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json'),e=reg.materialized?.[7];
  assert(full.status==='pass_fulltext_materialized_domain_ready_for_registry','Sosiolingvistikk-audit må være grønn');
  assert(next.status==='pass_source_first_ready_not_materialized','Historisk lingvistikk source-first må være grønn');
  assert(reg.progress.materializedDomains===8&&reg.progress.strictCompletionProven===false,'Registry må stå på 8/12 uten completion proof');
  assert(e?.ordinal===8&&e.domain_id==='sosiolingvistikk_variasjon_flerspraklighet_sprakmakt','Sosiolingvistikk må være felt 8');
  assert(e.chapter==='data/fagverk/litteratur/sprak_lingvistikk/sosiolingvistikk-variasjon-flerspraklighet-og-sprakmakt.json','Feil chapter-binding');
  assert(e.claims==='data/fagverk/litteratur/sprak_lingvistikk/sosiolingvistikk-variasjon-flerspraklighet-og-sprakmakt/claims.json','Feil claim-binding');
  assert(e.assessment==='data/fagverk/litteratur/sprak_lingvistikk/sosiolingvistikk-variasjon-flerspraklighet-og-sprakmakt/assessment.json','Feil assessment-binding');
  assert(e.audit==='reports/fagverk/sprak-lingvistikk-sociolinguistics-variation-multilingualism-language-power-fulltext-v1-audit.json','Feil audit-binding');
  assert(reg.next_gate==='historical_linguistics_language_change_genealogy_contact_fulltext','Neste gate må være Historisk lingvistikk fulltekst');
  console.log('Språk & lingvistikk felt 8 Sosiolingvistikk materializer OK: 8/12 registrert etter strict fulltext-audit og grønn felt 9 source-first.');
}catch(e){console.error(`Språk & lingvistikk felt 8 materializer FEIL: ${e.message}`);process.exitCode=1;}
