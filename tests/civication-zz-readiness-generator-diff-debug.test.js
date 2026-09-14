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
function scalarDiff(a,b,prefix=''){
  const out=[];
  if(JSON.stringify(a)===JSON.stringify(b)) return out;
  const ao=a&&typeof a==='object', bo=b&&typeof b==='object';
  if(!ao||!bo||Array.isArray(a)||Array.isArray(b)){
    out.push({path:prefix,before:a,after:b}); return out;
  }
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  for(const k of keys) out.push(...scalarDiff(a[k],b[k],prefix?prefix+'.'+k:k));
  return out;
}
try{
  execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:'pipe'});
  const afterText=fs.readFileSync(auditPath,'utf8');
  const after=JSON.parse(afterText);
  const a=new Map((before.positions||[]).map(r=>[r.key,r]));
  const b=new Map((after.positions||[]).map(r=>[r.key,r]));
  const rowDiffs=[];
  for(const key of [...new Set([...a.keys(),...b.keys()])].sort()){
    const diffs=scalarDiff(a.get(key),b.get(key)).filter(d=>d.path!=='key');
    if(diffs.length) rowDiffs.push({key,diffs});
  }
  const topBefore={...before}; delete topBefore.positions; delete topBefore.queue;
  const topAfter={...after}; delete topAfter.positions; delete topAfter.queue;
  const qBefore=(before.queue||[]).map(x=>[x.rank,x.key,x.priority_score,x.exact_source_ref_count,x.livelihood_template_count,x.max_narrative_depth]);
  const qAfter=(after.queue||[]).map(x=>[x.rank,x.key,x.priority_score,x.exact_source_ref_count,x.livelihood_template_count,x.max_narrative_depth]);
  const payload={
    top_level_diffs:scalarDiff(topBefore,topAfter),
    row_diffs:rowDiffs,
    queue_diffs:scalarDiff(qBefore,qAfter),
    audit_text_equal:beforeAuditText===afterText,
    report_equal:beforeReport===fs.readFileSync(reportPath,'utf8')
  };
  process.stderr.write('READINESS_DIFF_COMPACT='+JSON.stringify(payload)+'\n');
}finally{
  fs.writeFileSync(auditPath,beforeAuditText);
  fs.writeFileSync(reportPath,beforeReport);
}
throw new Error('intentional readiness generator diff probe');
