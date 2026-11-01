#!/usr/bin/env node
// Narrow, read-only validator for canonical v4.2 packets in Oslo bolk 05.
// Do not promote needs_research packets or change shared validator rules.
import fs from 'node:fs';
import {validatePacket} from './validate-place-description-production-v4_2.mjs';

const scope=[
 ['folketeateret','scenekunst','places_scenekunst','ready_v4_2'],
 ['kunstnernes_hus','kunst','places_kunst','ready_v4_2'],
 ['historisk_museum','historie','places_historie','needs_research'],
 ['ibsen_museum_teater','litteratur','places_litteratur','ready_v4_2'],
 ['blitzhuset','subkultur','places_subkultur','needs_research'],
 ['kulturkirken_jakob_litteratur','musikk','places_musikk','ready_v4_2']
];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const errors=[];
const findings=[];
for(const [id,cat,dir,expectedStatus] of scope){
 const placeFile='data/places/'+cat+'/oslo/'+dir+'/'+id+'.json';
 const packetFile='data/places/production/'+id+'.json';
 const place=read(placeFile),packet=read(packetFile);
 if(place.id!==id||packet.placeId!==id||packet.placeFile!==placeFile)
   errors.push(id+' canonical place ID and packet path mismatch');
 if(place.category!==cat)
   errors.push(id+' primary category drift');
 if(packet.status!==expectedStatus)
   errors.push(id+' unexpected source-gate status '+packet.status+' (expected '+expectedStatus+')');
 const result=validatePacket({packet,place,packetFile,now:new Date('2026-11-01T21:00:00Z')});
 const blocking=result.issues.filter(issue=>![
   'desc_outside_normal_range','popup_below_minimum','popup_above_maximum',
   'too_few_quiz_questions','too_few_normal_quiz_questions','too_few_quiz_types'
 ].includes(issue.code));
 // Draft packets may not claim v4.2 completion. They still must have current hashes,
 // valid source and sentence linkage, canonical identity and no fabricated metadata.
 const draftExceptions=new Set(['factual_review_not_passed','editorial_review_not_passed',
   'completion_reviews_not_passed','wrong_completed_under','wrong_current_status',
   'invalid_source_verified_at','completion_validator_mismatch','claims_verified_count_mismatch']);
 const issues=packet.status==='ready_v4_2'?blocking:blocking.filter(issue=>!draftExceptions.has(issue.code));
 for(const issue of issues)errors.push(id+': '+issue.code+' '+issue.message);
 if(packet.status==='ready_v4_2'){
   if(packet.reviews?.factual?.status!=='passed'||packet.reviews?.editorial?.status!=='passed')
     errors.push(id+' ready packet has no source/editorial sign-off');
   if(!packet.quizReadiness?.questions?.length)
     errors.push(id+' ready packet has no source-bound quiz-readiness');
 }
 findings.push({placeId:id,status:packet.status,claims:packet.claims?.length||0,
    popupCoverage:packet.sentenceCoverage?.popupDesc?.length||0,
    descCoverage:packet.sentenceCoverage?.desc?.length||0,
    readyQuestions:packet.quizReadiness?.questions?.length||0,
    issues:issues.map(x=>x.code)});
}
const report={schema:'history_go_oslo_bolk05_scoped_v42_audit_v1',status:errors.length?'failed':'passed',
 readyPackets:findings.filter(x=>x.status==='ready_v4_2').length,
 pendingSourceReview:findings.filter(x=>x.status==='needs_research').length,
 findings,errors};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
