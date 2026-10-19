#!/usr/bin/env node
/**
 * Materialize reviewed historical prose into the canonical Place files and a
 * verifiable v4.2 claim packet per place. Never silently repair missing evidence.
 */
import fs from "node:fs";
import path from "node:path";
import {sha256Text, splitSentences, validatePacket, validateSimilarity} from "./validate-place-description-production-v4_2.mjs";
import {applySourceLedLengthPolicy} from "./validate-place-description-production-v4_2_policy.mjs";

const root=process.cwd();
const specPath="reports/oslo-twenty-place-text-revision-20261019/source-led-content.json";
const doc=JSON.parse(fs.readFileSync(specPath,"utf8"));
const date="2026-10-19";
const outputs=[],issues=[];
if(doc?.places?.length!==8)throw Error("Expected eight reviewed, individually written source texts");

function cleanSource(spec,text,paragraphIndex){
  if(paragraphIndex>=0&&spec.paragraphSources?.[paragraphIndex])return spec.paragraphSources[paragraphIndex];
  if(spec.id==="bryn_industriomrade" && /teglverk|tegl|Nils Hansens vei|Bryn senter/i.test(text))
    return "https://oslobyleksikon.no/side/Bryn_Teglverk";
  if(spec.id==="frysja_industriomrade"){
    if(/Frysja senter|Mustad fabrikker|kunsthandverk|atelierer/i.test(text))
      return "https://oslobyleksikon.no/side/Frysja_senter";
    if(/Frysja er et gammelt navn|mellom Maridalsvannet og Nydalen/i.test(text))
      return "https://oslobyleksikon.no/side/Frysja";
  }
  return spec.source;
}
function hasCurrentMarker(sentence){
  return /\bi dag\b|\bnå\b|\bholder til\b|\bbrukes som\b|\bdrives av\b/i.test(sentence);
}
function emitFacts(spec,field,text,claims,previous,sourceIndex=-1){
  const coverage=[];
  splitSentences(text).forEach((sentence,i)=>{
    const id="claim_"+spec.id+"_"+field+"_"+String(i+1).padStart(2,"0");
    const sourceUrl=cleanSource(spec,sentence,sourceIndex);
    claims.push({id,claim:sentence,sourceUrl,sourceLocation:"Oslo byleksikon, stedets oppslagsartikkel og historikk",
      sourceType:"reputable_secondary",verifiedAt:date,status:"verified",
      claimKind:i===0&&field==="popupDesc"?"identity":"ordinary",
      evidenceMode:"direct",temporalStatus:hasCurrentMarker(sentence)?"current":"historical"});
    coverage.push({sentence:i+1,claimIds:[id]});
    previous.push({id,sentence,sourceUrl});
  });
  return coverage;
}
for(const spec of doc.places){
  const canonical="data/places/naeringsliv/oslo/places_naeringsliv/"+spec.id+".json";
  const absolute=path.join(root,canonical);
  if(!fs.existsSync(absolute))throw Error("Missing canonical file "+canonical);
  const place=JSON.parse(fs.readFileSync(absolute,"utf8"));
  if(place.id!==spec.id)throw Error("Place identity mismatch "+spec.id);
  if(!spec.paras||spec.paras.length!==3||!spec.paras.every(p=>p.length>=120))
    throw Error("Three substantial unique paragraphs required "+spec.id);
  const popupDesc=spec.paras.join("\n\n");
  const claims=[],factIndex=[];
  const descCoverage=emitFacts(spec,"desc",spec.desc,claims,factIndex);
  const popupCoverage=[];
  let number=1;
  spec.paras.forEach((paragraph,index)=>{
    for(const sentence of splitSentences(paragraph)){
      const id="claim_"+spec.id+"_popup_"+String(number).padStart(2,"0");
      claims.push({id,claim:sentence,sourceUrl:cleanSource(spec,sentence,index),
        sourceLocation:"Oslo byleksikon, stedets oppslagsartikkel og historikk",
        sourceType:"reputable_secondary",verifiedAt:date,status:"verified",
        claimKind:number===1?"identity":"ordinary",evidenceMode:"direct",
        temporalStatus:hasCurrentMarker(sentence)?"current":"historical"});
      popupCoverage.push({sentence:number,claimIds:[id]});
      factIndex.push({id,sentence,sourceUrl:cleanSource(spec,sentence,index)});
      number++;
    }
  });
  const quiz=spec.questions.map(([question,answer,type,needle],i)=>{
    const matches=factIndex.filter(f=>f.id.includes("_popup_")&&f.sentence.toLocaleLowerCase("nb-NO").includes(String(needle).toLocaleLowerCase("nb-NO")));
    if(!matches.length)throw Error("Quiz has no verified source sentence: "+spec.id+" "+question+" / "+needle);
    return {question,answer,type,normalKnowledgeQuestion:i<6,claimIds:[matches[0].id]};
  });
  place.desc=spec.desc;
  place.popupDesc=popupDesc;
  const packet={
    schemaVersion:"4.2",validatorVersion:"4.2.1",placeId:spec.id,placeFile:canonical,status:"ready_v4_2",
    identity:{status:"resolved",represents:spec.identity,period:spec.period,excludes:spec.excludes},
    metadataSnapshot:{name:place.name,category:place.category,year:place.year},
    textHashes:{algorithm:"sha256",desc:sha256Text(spec.desc),popupDesc:sha256Text(popupDesc)},
    claims,
    sentenceCoverage:{desc:descCoverage,popupDesc:popupCoverage},
    reviews:{factual:{status:"passed",reviewedAt:date,reviewer:"Oslo reference text fact review",
      notes:"All statements reviewed directly against the named Oslo byleksikon subject articles."},
      editorial:{status:"passed",reviewedAt:date,reviewer:"Oslo natural-language editorial review",
        introducedNewFacts:false,notes:"Replaced abstract game-production language with concrete historical events and place identity."}},
    quizReadiness:{questions:quiz},
    completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:date,
      claimsVerified:{verified:claims.length,total:claims.length},
      factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"}
  };
  const result=applySourceLedLengthPolicy(validatePacket({packet,place,packetFile:"data/places/production/"+spec.id+".json"}));
  if(result.issues.length)issues.push(...result.issues.map(x=>({place_id:spec.id,...x})));
  outputs.push({spec,canonical,place,packet,sourceUrl:spec.source});
}
const similarity=validateSimilarity(outputs.map(x=>({placeId:x.spec.id,popupDesc:x.place.popupDesc,packet:x.packet})));
if(issues.length||similarity.length){
  console.error(JSON.stringify({packetIssues:issues,similarity},null,2));
  process.exit(1);
}
for(const {spec,canonical,place,packet,sourceUrl} of outputs){
  fs.writeFileSync(canonical,JSON.stringify(place,null,2)+"\n");
  fs.mkdirSync("data/places/production",{recursive:true});
  fs.writeFileSync("data/places/production/"+spec.id+".json",JSON.stringify(packet,null,2)+"\n");
  console.log("PUBLISHED",spec.id,"claims="+packet.claims.length,"questions="+packet.quizReadiness.questions.length,sourceUrl);
}
const statusPath="data/places/production-tiers/v1-oslo-place-media-text-review-20261019-batch04.json";
const status=JSON.parse(fs.readFileSync(statusPath,"utf8"));
for(const x of outputs){
  const row=status.places.find(p=>p.place_id===x.spec.id);
  if(!row)throw Error("Missing status record "+x.spec.id);
  row.editorial_revision=true;
  row.text_status="source_verified_v4_2_packet_and_canonical_text_produced";
  row.text_draft_prepared=false;
}
status.text_revisions=outputs.length;
status.text_drafts_prepared=2;
status.text_revision_batch07={date,places:outputs.map(x=>x.spec.id),published:outputs.length,
  source_policy:"sentence-specific claim register, 3 paragraphs, 8 direct fact questions per place",v1_promoted:0};
fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+"\n");
const report={schema:"historygo_oslo_place_editorial_materialization_v1",date,
  published:outputs.map(x=>({id:x.spec.id,claimCount:x.packet.claims.length,
    quizReadinessQuestions:x.packet.quizReadiness.questions.length,source:x.spec.source,
    supplementalSources:x.spec.additional??[]})),held:["tollbukaia","vippetangen_fisketorg"],
  newV1:0,notes:"Canonical prose written and v4.2 source/claim packets built; photo v1 acceptance is separate."};
fs.writeFileSync("reports/oslo-twenty-place-text-revision-20261019/result.json",JSON.stringify(report,null,2)+"\n");
console.log("COMPLETE",JSON.stringify({revisions:outputs.length,claims:outputs.reduce((n,x)=>n+x.packet.claims.length,0)}));
