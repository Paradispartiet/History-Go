#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const historyDir=path.join(root,'data/fag/historie');
const reportDir=path.join(root,'reports/historie-v5');
const domainId='his_velferd_rett_hverdagsliv';
const read=(file)=>JSON.parse(fs.readFileSync(file,'utf8'));
const concepts=read(path.join(historyDir,'concepts_historie_canonical_v5_5.json'));
const theories=read(path.join(historyDir,'theory_objects_historie_canonical_v5_5.json'));
const queue=read(path.join(reportDir,'quality-review-queue.json'));
const issueRows=queue.concepts.filter((item)=>item.domain_ids?.includes(domainId));
const issueIds=new Set(issueRows.map((item)=>item.concept_id));
const conceptRows=concepts.filter((item)=>issueIds.has(item.concept_id)).map((item)=>({concept_id:item.concept_id,label:item.label,definition:item.definition,concept_type:item.concept_type,domain_ids:item.domain_ids??[],source_emne_ids:item.source_emne_ids??[],broader_concepts:item.broader_concepts??[],narrower_concepts:item.narrower_concepts??[],related_concepts:item.related_concepts??[],distinguish_from:item.distinguish_from??[],common_misuse:item.common_misuse??[],issues:issueRows.find((row)=>row.concept_id===item.concept_id)?.issues??[]}));
const theoryRows=theories.filter((item)=>item.explanatory_scope?.includes(domainId)).map((item)=>({theory_id:item.theory_id,label:item.label,definition:item.definition,limitations:item.limitations??[],object_type:item.object_type,method_links:item.method_links??[],thinker_ids:item.thinker_ids??[],source_hook_id:item.source_hook_id,evidence_ready:item.evidence_ready}));
const report={generated_at:new Date().toISOString(),domain_id:domainId,counts:{concepts_with_validator_issues:conceptRows.length,theories:theoryRows.length},concept_ids:conceptRows.map((item)=>item.concept_id),theory_ids:theoryRows.map((item)=>item.theory_id),concepts:conceptRows,theories:theoryRows};
fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(path.join(reportDir,'velferd-rett-hverdagsliv-target-inventory.json'),`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report.counts));
