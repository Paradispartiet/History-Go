#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s.endsWith('\n')?s:`${s}\n`);
const replaceOnce=(s,from,to,label)=>{if(!s.includes(from))throw new Error(`TEMP Teknologi reconcile mangler anchor: ${label}`);return s.replace(from,to);};
const addAfterAll=(s,anchor,line)=>{
  if(s.includes(line))return s;
  const parts=s.split(anchor);
  if(parts.length<2)throw new Error(`TEMP Teknologi reconcile mangler YAML anchor: ${anchor}`);
  return parts.join(`${anchor}\n${line}`);
};
const run=(args)=>execFileSync('node',args,{stdio:'inherit'});

const evidencePath='data/fag/fagverk_theory_integrity_evidence_v1.json';
const evidence=JSON.parse(read(evidencePath));
if(!evidence.evidence_adapters.some(adapter=>adapter.subject_id==='teknologi')){
  evidence.evidence_adapters.push({
    subject_id:'teknologi',
    proof_scope:'structured_subject_gate',
    audit_script:'tools/audit-teknologi-theory-integrity.mjs',
    test:'tests/teknologi-theory-integrity.test.mjs',
    workflow:'.github/workflows/teknologi-scientific-quality.yml',
    evidence_files:[
      'data/fag/teknologi/teknologipensum_canonical_v3.json',
      'data/fag/teknologi/emner_teknologi_canonical_v3.json',
      'data/fag/teknologi/fagkart_teknologi_canonical_v3.json',
      'data/fag/teknologi/methods_teknologi_canonical_v3.json',
      'data/fag/teknologi/teknologi_scientific_v2/theory_quality_registry_v2_1.json',
      'data/fag/teknologi/teknologi_scientific_v2/source_registry_v2_3.json',
      'data/fag/teknologi/theory_integrity_bindings_teknologi_v1.json',
      'reports/teknologi-editorial-v3-validation.json',
      'reports/fagverk/teknologi-theory-integrity-audit.json'
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
if(!audit.includes('auditTechnologyTheoryIntegrity')){
  audit=replaceOnce(audit,
    "import { auditFilosofiTheoryIntegrity } from '../tools/audit-filosofi-theory-integrity.mjs';",
    "import { auditFilosofiTheoryIntegrity } from '../tools/audit-filosofi-theory-integrity.mjs';\nimport { auditTechnologyTheoryIntegrity } from '../tools/audit-teknologi-theory-integrity.mjs';",
    'global audit import');
  audit=replaceOnce(audit,
    "  filosofi:()=>auditFilosofiTheoryIntegrity()\n};",
    "  filosofi:()=>auditFilosofiTheoryIntegrity(),\n  teknologi:()=>auditTechnologyTheoryIntegrity()\n};",
    'global audit runner');
  audit=replaceOnce(audit,
    "  assert(allVerified(filosofiAdapter?.existing_gate_proves),'Filosofi structured subject gate må dokumentere alle strict proof-dimensjoner');",
    "  assert(allVerified(filosofiAdapter?.existing_gate_proves),'Filosofi structured subject gate må dokumentere alle strict proof-dimensjoner');\n  const teknologiAdapter=adapterById.get('teknologi');\n  assert(teknologiAdapter?.proof_scope==='structured_subject_gate','Teknologi må bruke permanent structured subject gate etter 12-felts reconciliation');\n  assert(allVerified(teknologiAdapter?.existing_gate_proves),'Teknologi structured subject gate må dokumentere alle strict proof-dimensjoner');",
    'global audit adapter');
  audit=replaceOnce(audit,
    "    status:'strict_audit_open_evidence_gaps',",
    "    status:subjects.every(s=>s.integrityStatus==='strictly_proven')?'strict_audit_complete':'strict_audit_open_evidence_gaps',",
    'global completion status');
}
write('scripts/audit-fagverk-theory-integrity.mjs',audit);

let test=read('tests/fagverk-theory-integrity.test.mjs');
test=test.replace("assert.equal(r.status,'strict_audit_open_evidence_gaps');","assert.equal(r.status,'strict_audit_complete');");
test=test.replace("assert.equal(r.strictCompletionGateReady,false);","assert.equal(r.strictCompletionGateReady,true);");
test=test.replace("assert.equal(r.summary.strictly_proven,17);","assert.equal(r.summary.strictly_proven,18);");
test=test.replace("assert.equal(r.summary.baseline_only_strict_proof_missing,1);","assert.equal(r.summary.baseline_only_strict_proof_missing,0);");
test=test.replace("alle reconciled subject-gates, inkludert Politikk og Filosofi, er field-level strictly proven","alle 18 subject-gates, inkludert Filosofi og nested Teknologi, er field-level strictly proven");
test=test.replace("'vitenskap','politikk','filosofi']){","'vitenskap','politikk','filosofi','teknologi']){");
test=test.replace("completion-status er read-only og proof-køen er redusert til Teknologi","completion-status er read-only og proof-køen er tom");
test=test.replace("assert.deepEqual(r.proofReconciliationQueue,['teknologi']);","assert.deepEqual(r.proofReconciliationQueue,[]);");
test=test.replace("'vitenskap','politikk','filosofi'])assert.ok","'vitenskap','politikk','filosofi','teknologi'])assert.ok");
write('tests/fagverk-theory-integrity.test.mjs',test);

let globalWorkflow=read('.github/workflows/fagverk-theory-integrity.yml');
globalWorkflow=addAfterAll(globalWorkflow,"      - 'reports/fagverk/filosofi-theory-integrity-audit.json'","      - 'reports/fagverk/teknologi-theory-integrity-audit.json'");
globalWorkflow=addAfterAll(globalWorkflow,"      - 'tools/audit-filosofi-theory-integrity.mjs'","      - 'tools/audit-teknologi-theory-integrity.mjs'");
globalWorkflow=addAfterAll(globalWorkflow,"      - 'tests/filosofi-theory-integrity.test.mjs'","      - 'tests/teknologi-theory-integrity.test.mjs'");
globalWorkflow=addAfterAll(globalWorkflow,"          node --check tools/audit-filosofi-theory-integrity.mjs","          node --check tools/audit-teknologi-theory-integrity.mjs");
globalWorkflow=addAfterAll(globalWorkflow,"          node --test tests/filosofi-theory-integrity.test.mjs","          node --test tests/teknologi-theory-integrity.test.mjs");
write('.github/workflows/fagverk-theory-integrity.yml',globalWorkflow);

let techWorkflow=read('.github/workflows/teknologi-scientific-quality.yml');
techWorkflow=addAfterAll(techWorkflow,"      - 'scripts/validate-teknologi-editorial-v3.mjs'","      - 'tools/audit-teknologi-theory-integrity.mjs'\n      - 'tests/teknologi-theory-integrity.test.mjs'\n      - 'reports/fagverk/teknologi-theory-integrity-audit.json'");
if(!techWorkflow.includes('Validate strict Technology theory integrity')){
  techWorkflow=replaceOnce(techWorkflow,
    "      - name: Validate editorial canonical integration V3\n        run: node scripts/validate-teknologi-editorial-v3.mjs",
    "      - name: Validate editorial canonical integration V3\n        run: node scripts/validate-teknologi-editorial-v3.mjs\n\n      - name: Validate strict Technology theory integrity\n        run: |\n          node --check tools/audit-teknologi-theory-integrity.mjs\n          node tools/audit-teknologi-theory-integrity.mjs\n          node --test tests/teknologi-theory-integrity.test.mjs",
    'Technology workflow strict step');
  techWorkflow=replaceOnce(techWorkflow,
    "            reports/teknologi-editorial-v3-validation.json",
    "            reports/teknologi-editorial-v3-validation.json\n            reports/fagverk/teknologi-theory-integrity-audit.json",
    'Technology workflow artifact');
}
write('.github/workflows/teknologi-scientific-quality.yml',techWorkflow);

run(['tools/audit-teknologi-theory-integrity.mjs','--write-bindings','--no-check-bindings','--write-report','--no-check-report']);
run(['tools/audit-teknologi-theory-integrity.mjs']);
run(['--test','tests/teknologi-theory-integrity.test.mjs']);
run(['scripts/validate-teknologi-editorial-v3.mjs']);
run(['tools/validate-teknologi-quality-v2_1.mjs']);
run(['tools/validate-teknologi-ontology-v2_2.mjs']);
run(['tools/validate-teknologi-evidence-v2_3.mjs']);
run(['scripts/audit-fagverk-theory-integrity.mjs','--write-report','--no-check-report']);
run(['scripts/audit-fagverk-theory-integrity.mjs']);
run(['--test','tests/fagverk-theory-integrity.test.mjs']);

console.log('TEMP Teknologi strict reconciliation materialized: expected global 18/18, empty proof queue, 0 repair.');
