#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { splitSentences } from './validate-place-description-production-v4_2.mjs';

const ROOT=process.cwd();
const AUDIT_PATH='reports/oslo-micro-places-2026/review-audit.json';
const REPORT_PATH='reports/oslo-micro-places-2026/review-integrity-report.json';
const STOP=new Set(['ikke','eller','og','som','det','den','ved','til','fra','for','med','har','kan','sin','sitt','sine','et','en','er','i','på','av']);

function readJson(file){return JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));}
function writeJson(file,value){const full=path.join(ROOT,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,`${JSON.stringify(value,null,2)}\n`);}
function tokens(value){return new Set(String(value||'').toLocaleLowerCase('nb-NO').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').split(/\s+/u).filter(word=>word.length>=4&&!STOP.has(word)));}
function intersects(a,b){for(const value of a)if(b.has(value))return true;return false;}
function add(issues,placeId,code,message){issues.push({placeId,code,message});}

function validateCoverage(place,packet,issues){
  const claims=new Map((packet.claims||[]).map(claim=>[String(claim.id),claim]));
  for(const field of ['desc','popupDesc']){
    const sentences=splitSentences(place[field]);
    const rows=Array.isArray(packet.sentenceCoverage?.[field])?packet.sentenceCoverage[field]:[];
    if(rows.length!==sentences.length)add(issues,place.id,'coverage_length',`${field}: ${rows.length} coverage rows for ${sentences.length} sentences`);
    rows.forEach((row,index)=>{
      const ids=Array.isArray(row.claimIds)?row.claimIds:[];
      if(ids.length===0)add(issues,place.id,'empty_sentence_claims',`${field} sentence ${index+1} has no claim`);
      if(ids.length>=claims.size)add(issues,place.id,'all_claims_on_sentence',`${field} sentence ${index+1} is linked to every claim`);
      const sentenceTokens=tokens(sentences[index]||'');
      for(const id of ids){
        const claim=claims.get(String(id));
        if(!claim)add(issues,place.id,'unknown_claim',`${field} sentence ${index+1} references ${id}`);
        else if(!intersects(sentenceTokens,tokens(claim.claim)))add(issues,place.id,'weak_claim_relevance',`${field} sentence ${index+1} has no lexical anchor to ${id}`);
      }
    });
  }
}

function main(){
  const promote=process.argv.includes('--promote');
  const audit=readJson(AUDIT_PATH);
  const entries=Array.isArray(audit.places)?audit.places:[];
  const issues=[];
  if(!audit.reviewer||/generator|materializer/iu.test(audit.reviewer))add(issues,'*','invalid_reviewer','Reviewer must be independent from materialization');
  if(entries.length!==32)add(issues,'*','wrong_audit_count',`Expected 32 audit entries, got ${entries.length}`);
  const seen=new Set();

  for(const entry of entries){
    const placeId=String(entry.placeId||'');
    if(seen.has(placeId))add(issues,placeId,'duplicate_audit_entry','Duplicate audit entry');
    seen.add(placeId);
    for(const gate of ['sourceClaimRelevance','factualSupport','placeSpecificity','duplicateText','identitySeparation']){
      if(entry[gate]!=='passed')add(issues,placeId,'audit_gate_not_passed',`${gate} is not passed`);
    }
    if(entry.decision!=='passed')add(issues,placeId,'audit_decision_not_passed','Audit decision is not passed');
    const packetFile=`data/places/production/${placeId}.json`;
    if(!fs.existsSync(path.join(ROOT,packetFile))){add(issues,placeId,'missing_packet',packetFile);continue;}
    const packet=readJson(packetFile);
    const place=readJson(packet.placeFile);
    if(place.placeTier!=='micro'||place.micro_place_profile?.schema!=='history_go_micro_place_profile_v1')add(issues,placeId,'not_micro_place','Place does not use the Micro Place contract');
    if(place.place_card_profile)add(issues,placeId,'full_place_card_on_micro','Micro Place must not have a full collection profile');
    if(!Number.isFinite(place.lat)||!Number.isFinite(place.lon))add(issues,placeId,'invalid_coordinates','Coordinates are not finite');
    validateCoverage(place,packet,issues);
    if(promote&&issues.every(issue=>issue.placeId!==placeId)){
      packet.status='ready_v4_2';
      packet.reviews={
        factual:{status:'passed',reviewedAt:audit.reviewedAt,reviewer:audit.reviewer},
        editorial:{status:'passed',reviewedAt:audit.reviewedAt,reviewer:audit.reviewer,introducedNewFacts:false}
      };
      packet.completion={...packet.completion,factualReview:'passed',editorialReview:'passed',sourceVerifiedAt:audit.reviewedAt};
      writeJson(packetFile,packet);
    }
  }

  const report={
    schema:'history_go_micro_place_review_integrity_v1',
    reviewedAt:audit.reviewedAt,
    reviewer:audit.reviewer,
    mode:promote?'promote':'check',
    placeCount:entries.length,
    passed:issues.length===0,
    issueCount:issues.length,
    issues
  };
  writeJson(REPORT_PATH,report);
  console.log(`Micro Place review: ${entries.length} places, ${issues.length} issues, mode=${report.mode}`);
  for(const issue of issues)console.error(`- ${issue.placeId} ${issue.code}: ${issue.message}`);
  if(issues.length)process.exitCode=1;
}

main();
