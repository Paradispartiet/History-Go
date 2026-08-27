#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFagverkTheoryQuality } from './audit-fagverk-theory-quality.mjs';
import { auditFilmTvTheoryCanon } from './audit-fagverk-film-tv-theory-canon.mjs';
import { auditReligionTheoryCanon } from './audit-fagverk-religion-theory-canon.mjs';
import { auditScenekunstTheoryCanon } from './audit-fagverk-scenekunst-theory-canon.mjs';
import { auditSubkulturTheoryAttribution } from './audit-subkultur-theory-attribution-v1.mjs';
import { auditHistoryTheoryIntegrity } from '../tools/audit-historie-theory-integrity.mjs';
import { auditByTheoryIntegrity } from '../tools/audit-by-theory-integrity.mjs';
import { auditKunstTheoryIntegrity } from '../tools/audit-kunst-theory-integrity.mjs';
import { auditMediaTheoryIntegrity } from '../tools/audit-media-theory-integrity.mjs';
import { auditMusikkTheoryIntegrity } from '../tools/audit-musikk-theory-integrity.mjs';
import { auditLitteraturTheoryIntegrity } from '../tools/audit-litteratur-theory-integrity.mjs';
import { auditNaturTheoryIntegrity } from '../tools/audit-natur-theory-integrity.mjs';
import { auditHelseTheoryIntegrity } from '../tools/audit-helse-theory-integrity.mjs';
import { auditNaeringslivTheoryIntegrity } from '../tools/audit-naeringsliv-theory-integrity.mjs';
import { auditPsykologiTheoryIntegrity } from '../tools/audit-psykologi-theory-integrity.mjs';
import { auditSportTheoryIntegrity } from '../tools/audit-sport-theory-integrity.mjs';
import { auditVitenskapTheoryIntegrity } from '../tools/audit-vitenskap-theory-integrity.mjs';
import { auditPolitikkTheoryIntegrity } from '../tools/audit-politikk-theory-integrity.mjs';
import { auditFilosofiTheoryIntegrity } from '../tools/audit-filosofi-theory-integrity.mjs';
import { auditTechnologyTheoryIntegrity } from '../tools/audit-teknologi-theory-integrity.mjs';
import { auditUtdanningTheoryIntegrity } from '../tools/audit-utdanning-theory-integrity.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CONTRACT='data/fag/fagverk_theory_quality_contract_v1.json';
const EVIDENCE='data/fag/fagverk_theory_integrity_evidence_v1.json';
const REPORT='reports/fagverk/fagverk-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p);
const exists=p=>fs.existsSync(abs(p));
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};

const RUNNERS={
  film_tv:()=>auditFilmTvTheoryCanon(),
  religion:()=>auditReligionTheoryCanon(),
  scenekunst:()=>auditScenekunstTheoryCanon(),
  subkultur:()=>auditSubkulturTheoryAttribution(),
  historie:()=>auditHistoryTheoryIntegrity(),
  by:()=>auditByTheoryIntegrity(),
  kunst:()=>auditKunstTheoryIntegrity(),
  media:()=>auditMediaTheoryIntegrity(),
  musikk:()=>auditMusikkTheoryIntegrity(),
  litteratur:()=>auditLitteraturTheoryIntegrity(),
  natur:()=>auditNaturTheoryIntegrity(),
  helse:()=>auditHelseTheoryIntegrity(),
  naeringsliv:()=>auditNaeringslivTheoryIntegrity(),
  psykologi:()=>auditPsykologiTheoryIntegrity(),
  sport:()=>auditSportTheoryIntegrity(),
  vitenskap:()=>auditVitenskapTheoryIntegrity(),
  politikk:()=>auditPolitikkTheoryIntegrity(),
  filosofi:()=>auditFilosofiTheoryIntegrity(),
  teknologi:()=>auditTechnologyTheoryIntegrity(),
  utdanning:()=>auditUtdanningTheoryIntegrity()
};

const STRICT_KEYS=[
  'canonical_field_coverage',
  'structured_scope_mechanism',
  'limitations',
  'rival_or_alternative',
  'person_work_binding',
  'scholarly_source_quality',
  'claim_or_content_binding',
  'actual_prose_binding',
  'anti_trivia_rule',
  'universal_subject_scope'
];
const satisfied=value=>value==='verified'||String(value||'').startsWith('not_applicable_');
const allVerified=dimensions=>STRICT_KEYS.every(k=>satisfied(dimensions?.[k]));
const evidenceGaps=dimensions=>STRICT_KEYS.filter(k=>!satisfied(dimensions?.[k]));
const strongRunnerStatus=status=>status==='STRICTLY_PROVEN'||/^strong_theory_(canon|attribution)$/.test(status||'');

export function auditFagverkTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const contract=json(CONTRACT), evidence=json(EVIDENCE);
  assert(contract.schema==='history_go_fagverk_theory_quality_contract_v1','Ugyldig theory-quality contract');
  assert(contract.version==='1.2.0','Strict theory-integrity krever theory-quality contract v1.2.0');
  assert(contract.status==='integrity_gate_contract','Theory-quality contract må være løftet fra baseline til integrity-gate contract');
  assert(contract.final_gate?.mode==='per_major_field_not_aggregate','Strict theory-integrity må måles per canonicalt hovedfelt');
  assert(Array.isArray(contract.programme_checklist)&&contract.programme_checklist.length===10,'Theory-quality-programmet skal ha eksakt 10 bindende programsteg');
  assert(contract.programme_checklist.every((step,index)=>step.step===index+1),'Theory-quality-programmets steg skal være sekvensielle 1–10');
  assert(contract.programme_checklist.at(-1)?.id==='strict_main_gate','Siste programsteg skal være strict main-gate');
  assert(contract.principles?.aggregate_counts_are_not_final_integrity_proof===true,'Aggregerte tellergrenser kan ikke være sluttbevis');
  assert(contract.principles?.each_canonical_major_field_requires_relevant_theory_or_model_grounding===true,'Hvert canonicalt hovedfelt må ha relevant teori-/modellgrunnlag');
  assert(contract.principles?.named_people_require_concrete_work_or_research_contribution===true,'Navngitte personer må bindes til reelt verk/bidrag');
  assert(contract.principles?.theory_metadata_without_prose_or_claim_binding_fails===true,'Metadata-only teori må feile strict gate');
  assert((contract.final_integrity_fields||[]).includes('prose_usage_evidence'),'Final integrity-mal må kreve faktisk prosaevidens');
  assert((contract.final_integrity_fields||[]).includes('major_field_binding'),'Final integrity-mal må kreve hovedfeltbinding');
  assert((contract.final_gate?.required||[]).includes('academically_appropriate_sources'),'Final gate må kreve faglig passende scholarly sources');
  assert((contract.final_gate?.forbidden_shortcuts||[]).includes('aggregate_count_only'),'Final gate må eksplisitt forby aggregate-count-only');
  assert(evidence.schema==='history_go_fagverk_theory_integrity_evidence_v1','Ugyldig theory-integrity evidence manifest');
  assert(evidence.rules?.baseline_strong_is_not_strict_proof===true,'Integrity manifest må skille baseline fra strict proof');
  assert(evidence.rules?.missing_proof_is_not_content_gap===true,'Integrity manifest må blokkere falsk content-gap-inferens');
  assert(evidence.rules?.strict_proof_requires_actual_prose_binding===true,'Strict proof må kreve faktisk prosa-binding');
  assert(evidence.rules?.not_applicable_must_be_explicit===true,'Ikke-relevante strict-dimensjoner må markeres eksplisitt');

  const baseline=auditFagverkTheoryQuality({checkReport:true});
  assert(baseline.status==='baseline_only_not_completion_gate','Global theory baseline må forbli eksplisitt baseline-only');
  assert(baseline.historicalBaseline?.strongStructuredEvidence===18,'Strict integrity audit forventer låst historisk 18/18-baseline');
  assert(baseline.summary?.strong_structured_evidence>=18,'Aktiv theory-quality baseline kan ikke regressere under historisk 18/18-gulv');

  const contractIds=new Set(contract.subjects.map(s=>s.id));
  const adapterById=new Map();
  for(const adapter of evidence.evidence_adapters||[]){
    assert(contractIds.has(adapter.subject_id),`Evidence adapter peker til ukjent fag: ${adapter.subject_id}`);
    assert(!adapterById.has(adapter.subject_id),`Duplikat evidence adapter: ${adapter.subject_id}`);
    for(const p of [adapter.audit_script,adapter.test,adapter.workflow,...(adapter.evidence_files||[])].filter(Boolean))assert(exists(p),`Evidence path mangler for ${adapter.subject_id}: ${p}`);
    adapterById.set(adapter.subject_id,adapter);
  }

  for(const [id,runner] of Object.entries(RUNNERS)){
    assert(adapterById.has(id),`Permanent subject gate mangler evidence adapter: ${id}`);
    const result=runner();
    assert(strongRunnerStatus(result.status),`Subject theory gate er ikke sterk: ${id}/${result.status}`);
  }

  const historyAdapter=adapterById.get('historie');
  assert(historyAdapter?.proof_scope==='structured_subject_gate','Historie må bruke permanent structured subject gate etter 23-felts reconciliation');
  assert(allVerified(historyAdapter?.existing_gate_proves),'Historie structured subject gate må dokumentere alle strict proof-dimensjoner');
  const byAdapter=adapterById.get('by');
  assert(byAdapter?.proof_scope==='structured_subject_gate','By må bruke permanent structured subject gate etter 12-felts reconciliation');
  assert(allVerified(byAdapter?.existing_gate_proves),'By structured subject gate må dokumentere alle strict proof-dimensjoner');
  const kunstAdapter=adapterById.get('kunst');
  assert(kunstAdapter?.proof_scope==='structured_subject_gate','Kunst må bruke permanent structured subject gate etter 6-felts reconciliation');
  assert(allVerified(kunstAdapter?.existing_gate_proves),'Kunst structured subject gate må dokumentere alle strict proof-dimensjoner');
  const mediaAdapter=adapterById.get('media');
  assert(mediaAdapter?.proof_scope==='structured_subject_gate','Media må bruke permanent structured subject gate etter 6-felts reconciliation');
  assert(allVerified(mediaAdapter?.existing_gate_proves),'Media structured subject gate må dokumentere alle strict proof-dimensjoner');
  const musikkAdapter=adapterById.get('musikk');
  assert(musikkAdapter?.proof_scope==='structured_subject_gate','Musikk må bruke permanent structured subject gate etter 8-felts reconciliation');
  assert(allVerified(musikkAdapter?.existing_gate_proves),'Musikk structured subject gate må dokumentere alle strict proof-dimensjoner');
  const litteraturAdapter=adapterById.get('litteratur');
  assert(litteraturAdapter?.proof_scope==='structured_subject_gate','Litteratur må bruke permanent structured subject gate etter 28-felts reconciliation');
  assert(allVerified(litteraturAdapter?.existing_gate_proves),'Litteratur structured subject gate må dokumentere alle strict proof-dimensjoner');
  const naturAdapter=adapterById.get('natur');
  assert(naturAdapter?.proof_scope==='structured_subject_gate','Natur må bruke permanent structured subject gate etter 12-felts reconciliation');
  assert(allVerified(naturAdapter?.existing_gate_proves),'Natur structured subject gate må dokumentere alle strict proof-dimensjoner');
  const helseAdapter=adapterById.get('helse');
  assert(helseAdapter?.proof_scope==='structured_subject_gate','Helse må bruke permanent structured subject gate etter 12-felts reconciliation');
  assert(allVerified(helseAdapter?.existing_gate_proves),'Helse structured subject gate må dokumentere alle strict proof-dimensjoner');
  const naeringslivAdapter=adapterById.get('naeringsliv');
  assert(naeringslivAdapter?.proof_scope==='structured_subject_gate','Næringsliv må bruke permanent structured subject gate etter 6-felts reconciliation');
  assert(allVerified(naeringslivAdapter?.existing_gate_proves),'Næringsliv structured subject gate må dokumentere alle strict proof-dimensjoner');
  const psykologiAdapter=adapterById.get('psykologi');
  assert(psykologiAdapter?.proof_scope==='structured_subject_gate','Psykologi må bruke permanent structured subject gate etter 6-felts reconciliation');
  assert(allVerified(psykologiAdapter?.existing_gate_proves),'Psykologi structured subject gate må dokumentere alle strict proof-dimensjoner');
  const sportAdapter=adapterById.get('sport');
  assert(sportAdapter?.proof_scope==='structured_subject_gate','Sport må bruke permanent structured subject gate etter 6-felts reconciliation');
  assert(allVerified(sportAdapter?.existing_gate_proves),'Sport structured subject gate må dokumentere alle strict proof-dimensjoner');
  const vitenskapAdapter=adapterById.get('vitenskap');
  assert(vitenskapAdapter?.proof_scope==='structured_subject_gate','Vitenskap må bruke permanent structured subject gate etter 6-felts reconciliation');
  assert(allVerified(vitenskapAdapter?.existing_gate_proves),'Vitenskap structured subject gate må dokumentere alle strict proof-dimensjoner');
  const politikkAdapter=adapterById.get('politikk');
  assert(politikkAdapter?.proof_scope==='structured_subject_gate','Politikk må bruke permanent structured subject gate etter 13-felts reconciliation');
  assert(allVerified(politikkAdapter?.existing_gate_proves),'Politikk structured subject gate må dokumentere alle strict proof-dimensjoner');
  const filosofiAdapter=adapterById.get('filosofi');
  assert(filosofiAdapter?.proof_scope==='structured_subject_gate','Filosofi må bruke permanent structured subject gate etter 22-felts reconciliation');
  assert(allVerified(filosofiAdapter?.existing_gate_proves),'Filosofi structured subject gate må dokumentere alle strict proof-dimensjoner');
  const teknologiAdapter=adapterById.get('teknologi');
  assert(teknologiAdapter?.proof_scope==='structured_subject_gate','Teknologi må bruke permanent structured subject gate etter 12-felts reconciliation');
  assert(allVerified(teknologiAdapter?.existing_gate_proves),'Teknologi structured subject gate må dokumentere alle strict proof-dimensjoner');
  const utdanningAdapter=adapterById.get('utdanning');
  assert(utdanningAdapter?.proof_scope==='structured_subject_gate','Utdanning må bruke permanent structured subject gate etter 14-felts reconciliation');
  assert(allVerified(utdanningAdapter?.existing_gate_proves),'Utdanning structured subject gate må dokumentere alle strict proof-dimensjoner');

  const baselineById=new Map(baseline.subjects.map(s=>[s.id,s]));
  const subjects=contract.subjects.map(entry=>{
    const b=baselineById.get(entry.id);assert(b,`Baseline mangler fag: ${entry.id}`);
    const adapter=adapterById.get(entry.id)||null;
    const dimensions=adapter?.existing_gate_proves||{};
    const gaps=evidenceGaps(dimensions);
    let integrityStatus='baseline_only_strict_proof_missing';
    if(adapter?.proof_scope==='partial_evidence_pilot')integrityStatus='partial_strict_evidence';
    else if(adapter?.proof_scope==='structured_subject_gate')integrityStatus=allVerified(dimensions)?'strictly_proven':'structured_subject_gate_not_strict';
    return {
      id:entry.id,
      topLevel:entry.top_level,
      parentSubject:entry.parent_subject||null,
      profile:entry.profile,
      editorialStatus:b.editorialStatus,
      baseline:b.baseline,
      integrityStatus,
      evidenceAdapter:adapter?adapter.proof_scope:null,
      missingStrictProof:gaps,
      substantiveContentGap:false
    };
  });

  const counts=status=>subjects.filter(s=>s.integrityStatus===status).length;
  const report={
    schema:'history_go_fagverk_theory_integrity_audit_v1',
    version:'1.0.0',
    status:subjects.every(s=>s.integrityStatus==='strictly_proven')?'strict_audit_complete':'strict_audit_open_evidence_gaps',
    scope:{topLevelSubjects:19,nestedSpecializations:1,totalAudited:20},
    rules:{
      baselineStrongDoesNotEqualStrictProof:true,
      missingProofDoesNotEqualContentGap:true,
      completionStatusReadOnly:true,
      actualProseBindingRequiredForStrictProof:true,
      contestedFieldsRequireRealRival:true,
      personBoundTheoryRequiresWorkContribution:true,
      academicallyAppropriateSourcesRequired:true,
      explicitNotApplicableAllowed:true
    },
    summary:{
      strictly_proven:counts('strictly_proven'),
      structured_subject_gate_not_strict:counts('structured_subject_gate_not_strict'),
      partial_strict_evidence:counts('partial_strict_evidence'),
      baseline_only_strict_proof_missing:counts('baseline_only_strict_proof_missing'),
      substantive_content_gaps_proven:subjects.filter(s=>s.substantiveContentGap).length
    },
    strictCompletionGateReady:subjects.every(s=>s.integrityStatus==='strictly_proven'),
    historicalBaseline:{topLevelSubjects:17,nestedSpecializations:1,totalAudited:18,strictlyProven:18},proofReconciliationQueue:subjects.filter(s=>s.integrityStatus!=='strictly_proven'&&s.editorialStatus!=='not_started').map(s=>s.id),expansionProductionQueue:subjects.filter(s=>s.editorialStatus==='not_started').map(s=>s.id),
    contentRepairQueue:subjects.filter(s=>s.substantiveContentGap).map(s=>s.id),
    subjects
  };

  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(exists(REPORT),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditFagverkTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(e){console.error(`Fagverk theory integrity FEIL: ${e.message}`);process.exitCode=1;}
}
