#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const B='data/fag/politikk/juss_rettsvitenskap/legal_method_sources_interpretation_argumentation_source_claim_brief_v1.json', R='reports/fagverk/juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-source-brief-v1-audit.json';
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const assert=(c,m)=>{if(!c)throw new Error(m)};
export function audit(){
 const b=read(B), r=read(R); const claims=b.topic_briefs.flatMap(t=>t.planned_claims||[]); const ids=new Set(b.sources.map(s=>s.id)); const used=new Set(claims.flatMap(c=>c.source_ids||[]));
 assert(b.status==='source_first_ready_not_materialized','Source-first status mangler');
 assert(b.subject_id==='politikk'&&b.canonical_subcategory_id==='juss_rettsvitenskap'&&b.domain?.ordinal===1&&b.domain?.id==='juridisk_metode_rettskilder_tolkning_argumentasjon','Canonicalt Juss-eierskap er feil');
 assert(b.sources.length===13&&ids.size===13&&b.sources.every(s=>s.url.startsWith('https://')&&s.retrieval_status==='verified_2026-08-31'),'13 verifiserte inspectable kilder kreves');
 assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(c=>c.id)).size===32,'8 emner og 32 unike claims kreves');
 assert(claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids?.length>=2&&c.source_ids.every(id=>ids.has(id))),'Alle claims må ha minst to gyldige kilder');
 assert([...ids].every(id=>used.has(id)),'Alle 13 kilder må brukes i claimsettet');
 assert(b.planned_assessments?.length===8&&b.decision_scenarios?.length===6,'8 vurderinger og 6 case kreves');
 const st=b.source_strategy||{}; for(const key of ['source_first','inspectable_urls_required','claim_level_trace_required','fulltext_materialization_required_before_counting','jurisdiction_and_time_scope_required','legal_source_is_not_legal_rule','interpretation_is_not_subsumption','precedent_reasoning_not_outcome_only','preparatory_works_are_not_enacted_law','conflict_maxims_are_not_automatic','source_version_required','legal_education_is_not_personal_legal_advice']) assert(st[key]===true,'Strict source-strategi mangler: '+key);
 const boundaries=b.topic_briefs.map(t=>t.boundary).join(' ');
 assert(/Rettskilde.*rettsregel/u.test(boundaries)&&/Subsumsjon|subsumsjon/u.test(boundaries)&&/prejudikat/u.test(boundaries)&&/forarbeid/u.test(boundaries)&&/Lex superior/u.test(boundaries)&&/versjon/u.test(boundaries),'Juridiske metodegrenser er ufullstendige');
 assert(r.status==='pass'&&r.counts?.sources===13&&r.counts?.plannedClaims===32&&r.counts?.materializedDomains===0&&r.gates?.notMaterialized===true,'Auditrapport har feil source-first state');
 assert(r.six_part_quality_review?.total>=27,'Kvalitetsport feiler');
 return r;
}
try{const r=audit();console.log('Juss felt 1 source-first OK: '+r.counts.sources+' kilder, '+r.counts.topics+' emner, '+r.counts.plannedClaims+' claims, 0/12 materialisert.')}catch(e){console.error('Juss felt 1 source-first FEIL: '+e.message);process.exitCode=1;}
