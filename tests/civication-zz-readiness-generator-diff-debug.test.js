#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const auditPath=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const reportPath=path.join(ROOT,'reports/civication-life-position-role-world-readiness.md');
const beforeAuditText=fs.readFileSync(auditPath,'utf8');
const beforeReport=fs.readFileSync(reportPath,'utf8');
const before=JSON.parse(beforeAuditText);
try{
  execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:'pipe'});
  const afterText=fs.readFileSync(auditPath,'utf8');
  const after=JSON.parse(afterText);
  const byKey=x=>new Map((x.positions||[]).map(r=>[r.key,r]));
  const a=byKey(before),b=byKey(after);
  const keys=[...new Set([...a.keys(),...b.keys()])].sort();
  const rowDiffs=[];
  for(const key of keys){
    const av=a.get(key),bv=b.get(key);
    if(JSON.stringify(av)!==JSON.stringify(bv)) rowDiffs.push({key,before:av,after:bv});
  }
  const qBefore=(before.queue||[]).map(x=>({rank:x.rank,key:x.key,classification:x.classification,priority_score:x.priority_score,exact_source_ref_count:x.exact_source_ref_count,livelihood_template_count:x.livelihood_template_count,max_narrative_depth:x.max_narrative_depth}));
  const qAfter=(after.queue||[]).map(x=>({rank:x.rank,key:x.key,classification:x.classification,priority_score:x.priority_score,exact_source_ref_count:x.exact_source_ref_count,livelihood_template_count:x.livelihood_template_count,max_narrative_depth:x.max_narrative_depth}));
  const payload={
    summary_before:before.summary,
    summary_after:after.summary,
    first_ready_before:before.first_ready,
    first_ready_after:after.first_ready,
    row_diffs:rowDiffs,
    queue_changed:JSON.stringify(qBefore)!==JSON.stringify(qAfter),
    queue_before_head:qBefore.slice(0,8),
    queue_after_head:qAfter.slice(0,8),
    audit_text_equal:beforeAuditText===afterText,
    report_equal:beforeReport===fs.readFileSync(reportPath,'utf8')
  };
  process.stderr.write('\nREADINESS_GENERATOR_DIFF_START\n'+JSON.stringify(payload,null,2)+'\nREADINESS_GENERATOR_DIFF_END\n');
}finally{
  fs.writeFileSync(auditPath,beforeAuditText);
  fs.writeFileSync(reportPath,beforeReport);
}
throw new Error('intentional readiness generator diff probe');
