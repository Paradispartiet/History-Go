#!/usr/bin/env node
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s.endsWith('\n')?s:`${s}\n`);
const replaceOnce=(s,from,to,label)=>{
  if(!s.includes(from))throw new Error(`TEMP reconcile missing anchor: ${label}`);
  return s.replace(from,to);
};

const evidencePath='data/fag/fagverk_theory_integrity_evidence_v1.json';
const evidence=JSON.parse(read(evidencePath));
if(!evidence.evidence_adapters.some(a=>a.subject_id==='naeringsliv')){
  evidence.evidence_adapters.push({
    subject_id:'naeringsliv',
    proof_scope:'structured_subject_gate',
    audit_script:'tools/audit-naeringsliv-theory-integrity.mjs',
    test:'tests/naeringsliv-theory-integrity.test.mjs',
    workflow:'.github/workflows/naeringsliv-subject-quality.yml',
    evidence_files:[
      'data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json',
      'data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json',
      'data/fag/naeringsliv/teorikort_okonomi_og_naeringsliv_v1.json',
      'data/fag/naeringsliv/emneutvidelser_okonomi_og_naeringsliv_v1.json',
      'data/fag/naeringsliv/universitetskvalitet_okonomi_og_naeringsliv_v2.json',
      'data/fagverk/fagverk_registry.json',
      'reports/fagverk/naeringsliv-quality-audit.json',
      'reports/fagverk/naeringsliv-theory-integrity-audit.json'
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
if(!audit.includes("auditNaeringslivTheoryIntegrity")){
  audit=replaceOnce(audit,
    "import { auditNaturTheoryIntegrity } from '../tools/audit-natur-theory-integrity.mjs';",
    "import { auditNaturTheoryIntegrity } from '../tools/audit-natur-theory-integrity.mjs';\nimport { auditNaeringslivTheoryIntegrity } from '../tools/audit-naeringsliv-theory-integrity.mjs';",
    'global audit import');
  audit=replaceOnce(audit,
    "  natur:()=>auditNaturTheoryIntegrity()\n};",
    "  natur:()=>auditNaturTheoryIntegrity(),\n  naeringsliv:()=>auditNaeringslivTheoryIntegrity()\n};",
    'global audit runner');
  audit=replaceOnce(audit,
    "  assert(allVerified(naturAdapter?.existing_gate_proves),'Natur structured subject gate må dokumentere alle strict proof-dimensjoner');",
    "  assert(allVerified(naturAdapter?.existing_gate_proves),'Natur structured subject gate må dokumentere alle strict proof-dimensjoner');\n  const naeringslivAdapter=adapterById.get('naeringsliv');\n  assert(naeringslivAdapter?.proof_scope==='structured_subject_gate','Næringsliv må bruke permanent structured subject gate etter 6-felts reconciliation');\n  assert(allVerified(naeringslivAdapter?.existing_gate_proves),'Næringsliv structured subject gate må dokumentere alle strict proof-dimensjoner');",
    'global audit adapter');
}
write('scripts/audit-fagverk-theory-integrity.mjs',audit);

let test=read('tests/fagverk-theory-integrity.test.mjs');
test=test.replace("assert.equal(r.summary.strictly_proven,11);","assert.equal(r.summary.strictly_proven,12);");
test=test.replace("assert.equal(r.summary.baseline_only_strict_proof_missing,7);","assert.equal(r.summary.baseline_only_strict_proof_missing,6);");
test=test.replace("inkludert Litteratur og Natur","inkludert Natur og Næringsliv");
test=test.replace("'natur']){","'natur','naeringsliv']){");
test=test.replace("proof-køen er redusert til 7","proof-køen er redusert til 6");
test=test.replace("assert.equal(r.proofReconciliationQueue.length,7);","assert.equal(r.proofReconciliationQueue.length,6);");
test=test.replace("'natur'])assert.ok","'natur','naeringsliv'])assert.ok");
write('tests/fagverk-theory-integrity.test.mjs',test);

function addAfterAll(s,anchor,line){
  if(s.includes(line))return s;
  const parts=s.split(anchor);
  if(parts.length<2)throw new Error(`TEMP reconcile missing YAML anchor: ${anchor}`);
  return parts.join(`${anchor}\n${line}`);
}
let workflow=read('.github/workflows/fagverk-theory-integrity.yml');
workflow=addAfterAll(workflow,"      - 'reports/fagverk/natur-theory-integrity-audit.json'","      - 'reports/fagverk/naeringsliv-theory-integrity-audit.json'");
workflow=addAfterAll(workflow,"      - 'tools/audit-natur-theory-integrity.mjs'","      - 'tools/audit-naeringsliv-theory-integrity.mjs'");
workflow=addAfterAll(workflow,"      - 'tests/natur-theory-integrity.test.mjs'","      - 'tests/naeringsliv-theory-integrity.test.mjs'");
workflow=addAfterAll(workflow,"          node --check tools/audit-natur-theory-integrity.mjs","          node --check tools/audit-naeringsliv-theory-integrity.mjs");
workflow=addAfterAll(workflow,"          node --test tests/natur-theory-integrity.test.mjs","          node --test tests/naeringsliv-theory-integrity.test.mjs");
write('.github/workflows/fagverk-theory-integrity.yml',workflow);

let nw=read('.github/workflows/naeringsliv-subject-quality.yml');
nw=addAfterAll(nw,"      - 'tools/validate-okonomi-naeringsliv-*.mjs'","      - 'tools/audit-naeringsliv-theory-integrity.mjs'");
if(!nw.includes('node --check tools/audit-naeringsliv-theory-integrity.mjs')){
  nw=replaceOnce(nw,
    '          node --check scripts/audit-naeringsliv-subject-quality.mjs',
    '          node --check scripts/audit-naeringsliv-subject-quality.mjs\n          node --check tools/audit-naeringsliv-theory-integrity.mjs',
    'Næringsliv workflow syntax');
  nw=replaceOnce(nw,
    '          node scripts/audit-naeringsliv-subject-quality.mjs',
    '          node scripts/audit-naeringsliv-subject-quality.mjs\n          node tools/audit-naeringsliv-theory-integrity.mjs',
    'Næringsliv workflow audit');
}
write('.github/workflows/naeringsliv-subject-quality.yml',nw);

console.log('TEMP Næringsliv shared-gate reconciliation materialized.');
