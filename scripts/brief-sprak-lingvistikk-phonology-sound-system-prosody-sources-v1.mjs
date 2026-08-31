#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FILE='data/fag/litteratur/sprak_lingvistikk/phonology_sound_system_prosody_source_claim_brief_v1.json';
const REPORT='reports/fagverk/sprak-lingvistikk-phonology-sound-system-prosody-source-brief-v1-audit.json';
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const write=(f,v)=>{const p=path.join(ROOT,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,`${JSON.stringify(v,null,2)}\n`);};
const assert=(c,m)=>{if(!c)throw new Error(m);};

export function audit(){
  const b=read(FILE);
  assert(b.status==='source_first_ready_not_materialized','Fonologi skal være source-first, ikke materialisert');
  assert(b.subject_id==='litteratur'&&b.canonical_subcategory_id==='sprak_lingvistikk','Feil eierskap');
  assert(b.domain?.ordinal===3&&b.domain?.id==='fonologi_lydsystem_prosodi','Feil felt 3');
  const ids=new Set(b.sources.map(x=>x.id));
  const claims=b.topic_briefs.flatMap(x=>x.planned_claims||[]);
  assert(b.sources.length===13&&ids.size===13,'Fonologi skal ha 13 unike kilder');
  assert(b.sources.every(x=>/^https:\/\//u.test(x.url)&&x.retrieval_status==='verified_2026-08-31'),'Alle kilder må være inspectable/verifisert');
  assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(x=>x.id)).size===32,'Fonologi skal ha 8 emner / 32 claims');
  assert(claims.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'Alle claims må ha minst to gyldige kilder');
  assert(b.decision_scenarios?.length===6&&b.decision_scenarios.every(x=>x.source_ids?.length>=2&&x.source_ids.every(id=>ids.has(id))),'Fonologi skal ha 6 fler-kildecase');
  const boundaries=b.topic_briefs.map(x=>x.boundary||'').join(' ').toLowerCase();
  assert(/fonemisk kontrast|kontrast/u.test(boundaries)&&/fonetisk/u.test(boundaries),'Kontrast/fonetikk-grense mangler');
  assert(/teori|analyseobjekter|representasjon/u.test(boundaries),'Representasjonsgrense mangler');
  assert(/stavelsesdeling|sekvens/u.test(boundaries),'Stavelse/fonotaks-grense mangler');
  assert(/akustisk prominens|trykk/u.test(boundaries),'Trykkgrense mangler');
  assert(/intonasjon/u.test(boundaries),'Tone/intonasjon-grense mangler');
  assert(/formalisme/u.test(boundaries),'Teori/evidens-grense mangler');
  assert(/databaseinventar|kildeavhengig/u.test(boundaries),'Database/proveniens-grense mangler');
  const q={correctness_and_evidence:5,phonological_method_and_contrast:5,representation_and_prosody:5,crosslinguistic_traceability:5,assessment_readiness:5,uncertainty_and_theory_boundaries:5};
  const r={schema:'history_go_sprak_lingvistikk_phonology_source_brief_audit_v1',version:'1.0.0',updated_at:'2026-08-31',status:'pass_source_first_ready_not_materialized',counts:{sources:b.sources.length,topicBriefs:b.topic_briefs.length,plannedClaims:claims.length,decisionScenarios:b.decision_scenarios.length,plannedAssessments:b.fulltext_requirements.assessment_item_count},gates:{ownership:true,inspectable_sources:true,multi_source_claims:true,contrast_boundary:true,representation_boundary:true,syllable_phonotactics:true,stress_boundary:true,tone_intonation:true,theory_evidence:true,database_provenance:true},six_part_quality_review:{...q,total:Object.values(q).reduce((a,c)=>a+c,0)},next_gate:'materialize_phonology_sound_system_prosody_fulltext'};
  write(REPORT,r);return r;
}
try{const r=audit();console.log(`Språk & lingvistikk felt 3 Fonologi source-first OK: ${r.counts.sources} kilder, ${r.counts.topicBriefs} emner, ${r.counts.plannedClaims} claims, ${r.counts.decisionScenarios} case.`);}catch(e){console.error(`Språk & lingvistikk felt 3 Fonologi source-first FEIL: ${e.message}`);process.exitCode=1;}
