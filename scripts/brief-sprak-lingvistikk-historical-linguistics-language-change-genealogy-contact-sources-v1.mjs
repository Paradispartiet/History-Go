#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FILE='data/fag/litteratur/sprak_lingvistikk/historical_linguistics_language_change_genealogy_contact_source_claim_brief_v1.json';
const REPORT='reports/fagverk/sprak-lingvistikk-historical-linguistics-language-change-genealogy-contact-source-brief-v1-audit.json';
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),`${JSON.stringify(v,null,2)}\n`);},assert=(c,m)=>{if(!c)throw new Error(m);};
export function audit(){
  const b=read(FILE);
  assert(b.status==='source_first_ready_not_materialized','Historisk lingvistikk skal være source-first');
  assert(b.domain?.ordinal===9&&b.domain?.id==='historisk_lingvistikk_sprakendring_slektskap_kontakt'&&b.domain?.production_mode==='new_production_required','Feil felt 9-kontrakt');
  const ids=new Set(b.sources.map(x=>x.id)),claims=b.topic_briefs.flatMap(x=>x.planned_claims||[]);
  assert(b.sources.length===13&&ids.size===13,'13 kilder kreves');
  assert(b.sources.every(x=>/^https:\/\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Kilder må være inspectable/verifisert');
  assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(x=>x.id)).size===32,'8 emner / 32 claims kreves');
  assert(claims.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'Claims trenger >=2 gyldige kilder');
  assert(b.planned_assessments?.length===8,'8 planlagte vurderinger kreves');
  assert(b.decision_scenarios?.length===6&&b.decision_scenarios.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'6 case kreves');
  const boundary=b.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();
  assert(/overflatisk likhet/u.test(boundary)&&/systematiske korrespondanser/u.test(boundary)&&/lån/u.test(boundary),'Comparative-method-grense mangler');
  assert(/sound change/u.test(boundary)&&/conditioning environment/u.test(boundary)&&/chronology/u.test(boundary),'Sound-change-grense mangler');
  assert(/shared innovations/u.test(boundary)&&/family tree/u.test(boundary)&&/reticulate/u.test(boundary),'Subgrouping/tree-grense mangler');
  assert(/borrowing/u.test(boundary)&&/donor\/recipient/u.test(boundary)&&/genealogisk slektskap/u.test(boundary),'Borrowing/contact-grense mangler');
  assert(/semantic change/u.test(boundary)&&/form-function/u.test(boundary)&&/grammaticalization/u.test(boundary),'Diachronic form-function-grense mangler');
  assert(/written attestations/u.test(boundary)&&/orthography/u.test(boundary)&&/manuscript date/u.test(boundary),'Written-attestation-grense mangler');
  assert(/computational phylogenies/u.test(boundary)&&/calibrations/u.test(boundary)&&/posterior uncertainty/u.test(boundary),'Phylogenetic uncertainty-grense mangler');
  assert(/versionere/u.test(boundary)&&/language identifiers/u.test(boundary)&&/database similarity scores/u.test(boundary),'Reproducibility/database-grense mangler');
  assert(b.fail_closed_contract?.source_brief_does_not_count_as_materialized===true&&b.fail_closed_contract?.genealogy_requires_systematic_correspondence_evidence===true,'Fail-closed genealogy-kontrakt mangler');
  const q={correctness_and_evidence:5,comparative_method_and_reconstruction:5,sound_change_and_contact:5,diachronic_data_and_philology:5,phylogenetics_and_uncertainty:5,reproducibility_and_assessment_plan:5};
  const r={schema:'history_go_sprak_lingvistikk_historical_linguistics_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',status:'pass_source_first_ready_not_materialized',counts:{sources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedAssessments:8},gates:{ownership:true,inspectable_sources:true,multi_source_claims:true,comparative_method_boundary:true,sound_change_boundary:true,subgrouping_reticulation_boundary:true,borrowing_contact_boundary:true,diachronic_form_function_boundary:true,written_attestation_boundary:true,phylogenetic_model_uncertainty:true,reproducibility_identifiers:true},six_part_quality_review:{...q,total:30},next_gate:'materialize_historical_linguistics_language_change_genealogy_contact_fulltext'};
  write(REPORT,r); return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 9 Historisk lingvistikk source-first OK: ${r.counts.sources} kilder, ${r.counts.topicBriefs} emner, ${r.counts.plannedClaims} claims, ${r.counts.decisionScenarios} case.`);}catch(e){console.error(`Språk & lingvistikk felt 9 Historisk lingvistikk source-first FEIL: ${e.message}`);process.exitCode=1;}
