#!/usr/bin/env node
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s.endsWith('\n')?s:`${s}\n`);
const replaceOnce=(s,from,to,label)=>{if(!s.includes(from))throw new Error(`TEMP reconcile missing anchor: ${label}`);return s.replace(from,to);};
const addAfterAll=(s,anchor,line)=>{
  if(s.includes(line))return s;
  const parts=s.split(anchor);
  if(parts.length<2)throw new Error(`TEMP reconcile missing YAML anchor: ${anchor}`);
  return parts.join(`${anchor}\n${line}`);
};

const evidencePath='data/fag/fagverk_theory_integrity_evidence_v1.json';
const evidence=JSON.parse(read(evidencePath));
if(!evidence.evidence_adapters.some(adapter=>adapter.subject_id==='politikk')){
  evidence.evidence_adapters.push({
    subject_id:'politikk',
    proof_scope:'structured_subject_gate',
    audit_script:'tools/audit-politikk-theory-integrity.mjs',
    test:'tests/politikk-theory-integrity.test.mjs',
    workflow:'.github/workflows/politikk-subject-quality.yml',
    evidence_files:[
      'data/fag/politikk/politikkpensum_canonical_v4_5.json',
      'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
      'data/fag/politikk/politikk_thinker_names.json',
      'data/fag/politikk/theory_integrity_bindings_politikk_v1.json',
      'data/fagverk/fagverk_registry.json',
      'reports/fagverk/politikk-quality-audit.json',
      'reports/fagverk/politikk-thinker-integrity-audit.json',
      'reports/fagverk/politikk-theory-integrity-audit.json'
    ],
    existing_gate_proves:{
      canonical_field_coverage:'verified',
      structured_scope_mechanism:'verified',
      limitations:'verified',
      rival_or_alternative:'verified',
      person_work_binding:'verified',
      scholarly_source_quality:'verified',
      claim_or_content_binding:'verified',
      actual_prose_binding:'verified',
      anti_trivia_rule:'verified',
      universal_subject_scope:'verified'
    }
  });
}
write(evidencePath,JSON.stringify(evidence,null,2));

let audit=read('scripts/audit-fagverk-theory-integrity.mjs');
if(!audit.includes('auditPolitikkTheoryIntegrity')){
  audit=replaceOnce(audit,
    "import { auditSportTheoryIntegrity } from '../tools/audit-sport-theory-integrity.mjs';",
    "import { auditSportTheoryIntegrity } from '../tools/audit-sport-theory-integrity.mjs';\nimport { auditPolitikkTheoryIntegrity } from '../tools/audit-politikk-theory-integrity.mjs';",
    'global audit import');
  audit=replaceOnce(audit,
    "  sport:()=>auditSportTheoryIntegrity()\n};",
    "  sport:()=>auditSportTheoryIntegrity(),\n  politikk:()=>auditPolitikkTheoryIntegrity()\n};",
    'global audit runner');
  audit=replaceOnce(audit,
    "  assert(allVerified(sportAdapter?.existing_gate_proves),'Sport structured subject gate må dokumentere alle strict proof-dimensjoner');",
    "  assert(allVerified(sportAdapter?.existing_gate_proves),'Sport structured subject gate må dokumentere alle strict proof-dimensjoner');\n  const politikkAdapter=adapterById.get('politikk');\n  assert(politikkAdapter?.proof_scope==='structured_subject_gate','Politikk må bruke permanent structured subject gate etter 13-felts reconciliation');\n  assert(allVerified(politikkAdapter?.existing_gate_proves),'Politikk structured subject gate må dokumentere alle strict proof-dimensjoner');",
    'global audit adapter');
}
write('scripts/audit-fagverk-theory-integrity.mjs',audit);

let test=read('tests/fagverk-theory-integrity.test.mjs');
test=test.replace("assert.equal(r.summary.strictly_proven,14);","assert.equal(r.summary.strictly_proven,15);");
test=test.replace("assert.equal(r.summary.baseline_only_strict_proof_missing,4);","assert.equal(r.summary.baseline_only_strict_proof_missing,3);");
test=test.replace("inkludert Psykologi og Sport","inkludert Psykologi, Sport og Politikk");
test=test.replace("'psykologi','sport']){","'psykologi','sport','politikk']){");
test=test.replace("proof-køen er redusert til 4","proof-køen er redusert til 3");
test=test.replace("assert.equal(r.proofReconciliationQueue.length,4);","assert.equal(r.proofReconciliationQueue.length,3);");
test=test.replace("'psykologi','sport'])assert.ok","'psykologi','sport','politikk'])assert.ok");
write('tests/fagverk-theory-integrity.test.mjs',test);

let globalWorkflow=read('.github/workflows/fagverk-theory-integrity.yml');
globalWorkflow=addAfterAll(globalWorkflow,"      - 'reports/fagverk/sport-theory-integrity-audit.json'","      - 'reports/fagverk/politikk-theory-integrity-audit.json'");
globalWorkflow=addAfterAll(globalWorkflow,"      - 'tools/audit-sport-theory-integrity.mjs'","      - 'tools/audit-politikk-theory-integrity.mjs'");
globalWorkflow=addAfterAll(globalWorkflow,"      - 'tests/sport-theory-integrity.test.mjs'","      - 'tests/politikk-theory-integrity.test.mjs'");
globalWorkflow=addAfterAll(globalWorkflow,"          node --check tools/audit-sport-theory-integrity.mjs","          node --check tools/audit-politikk-theory-integrity.mjs");
globalWorkflow=addAfterAll(globalWorkflow,"          node --test tests/sport-theory-integrity.test.mjs","          node --test tests/politikk-theory-integrity.test.mjs");
write('.github/workflows/fagverk-theory-integrity.yml',globalWorkflow);

let politicsWorkflow=read('.github/workflows/politikk-subject-quality.yml');
politicsWorkflow=addAfterAll(politicsWorkflow,"      - 'scripts/audit-politikk-thinker-integrity.mjs'","      - 'tools/audit-politikk-theory-integrity.mjs'\n      - 'tests/politikk-theory-integrity.test.mjs'\n      - 'reports/fagverk/politikk-theory-integrity-audit.json'");
if(!politicsWorkflow.includes('node --check tools/audit-politikk-theory-integrity.mjs')){
  politicsWorkflow=replaceOnce(politicsWorkflow,
    '          node --check scripts/audit-politikk-thinker-integrity.mjs',
    '          node --check scripts/audit-politikk-thinker-integrity.mjs\n          node --check tools/audit-politikk-theory-integrity.mjs',
    'Politikk workflow syntax');
  politicsWorkflow=replaceOnce(politicsWorkflow,
    '          node scripts/audit-politikk-thinker-integrity.mjs',
    '          node scripts/audit-politikk-thinker-integrity.mjs\n          node tools/audit-politikk-theory-integrity.mjs',
    'Politikk workflow audit');
  politicsWorkflow=replaceOnce(politicsWorkflow,
    '          node --test tests/politikk-curriculum-architecture.test.mjs tests/politikk-fag-integration.test.mjs',
    '          node --test tests/politikk-theory-integrity.test.mjs\n          node --test tests/politikk-curriculum-architecture.test.mjs tests/politikk-fag-integration.test.mjs',
    'Politikk workflow test');
}
write('.github/workflows/politikk-subject-quality.yml',politicsWorkflow);

console.log('TEMP Politikk subject/global theory-integrity reconciliation materialized.');
