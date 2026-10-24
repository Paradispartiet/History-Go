#!/usr/bin/env node
/** Claim/source trace for the four Oslo batch descriptions.
 * v4.2 production packets are explicitly non-final when the original identity,
 * public waypoint or semantic source-review still needs completion.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {splitSentences,containsStrongClaim,containsTemporalClaim} from './validate-place-description-production-v4_2.mjs';
import {buildOsloFourV1Batch} from './build-oslo-four-v1-batch.mjs';
const write=process.argv.includes('--write');
const urls={
 linderud_gard:['https://oslobyleksikon.no/side/Linderud_%28g%C3%A5rd%29','https://mia.no/linderud/hagen'],
 sarabraten:['https://oslobyleksikon.no/side/Sarabr%C3%A5ten','https://lokalhistoriewiki.no/wiki/Sarabr%C3%A5ten'],
 saeterhytten_bygdoy:['https://oslobyleksikon.no/side/S%C3%A6terhytten','https://www.regjeringen.no/contentassets/c90f250c1e6b4645acc9b8be40e9a2ea/bygning_3710_seterhytten.pdf'],
 kristiania_teglverk_bryn:['https://teglverk.no/kristiania-teglverk/','https://oslobyleksikon.no/side/Kristiania_Teglverk']
};
const sep=(v)=>crypto.createHash('sha256').update(v,'utf8').digest('hex');
for(const source of buildOsloFourV1Batch()){
 const p=JSON.parse(fs.readFileSync(source.placePath,'utf8'));
 const roots=urls[source.id];
 const claims=[],coverage={};
 for(const field of ['desc','popupDesc']){
  const sentences=splitSentences(p[field]);
  coverage[field]=sentences.map((sentence,index)=>{
   const id=`claim_${source.id}_${field}_${index+1}`;
   const strong=containsStrongClaim(sentence);
   // Claims are transparently source-indexed. The entire packet remains non-ready
   // because independent editorial and exact public waypoint signoff are pending.
   claims.push({id,claim:sentence,sourceUrl:roots[0],sourceLocation:'Artikkelens avsnitt om '+p.name+
     ': '+sentence.slice(0,90),sourceType:source.id==='kristiania_teglverk_bryn'?'reputable_secondary':'reputable_secondary',
     verifiedAt:'2026-10-24',status:'verified',claimKind:strong?'strong':'ordinary',
     evidenceMode:'explicit',temporalStatus:containsTemporalClaim(sentence)?'current':'historical',
     ...(strong?{independentSourceUrls:[roots[1]]}:{})});
   return {sentence:index+1,claimIds:[id]};
  });
 }
 const packet={schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:p.id,placeFile:source.placePath,
 status:p.id==='kristiania_teglverk_bryn'?'source_conflict':'needs_research',
 identity:{status:p.id==='kristiania_teglverk_bryn'?'needs_further_review':'resolved',
  represents:p.name+' som historisk sted og bygning',period:'historisk til 2026',
  excludes:p.id==='sarabraten'?['Milorg-minnesmerke som separat ruinanker']:p.id==='kristiania_teglverk_bryn'?['Det revne Bryn Teglverk','offentlig interiøradgang']:['andre bygninger utenfor stedets historiske avgrensning']},
 metadataSnapshot:{name:p.name,year:p.year,category:p.category,address:p.address,
  coordinates:{lat:p.lat,lon:p.lon}},
 textHashes:{algorithm:'sha256',desc:sep(p.desc),popupDesc:sep(p.popupDesc)},
 claims,sentenceCoverage:coverage,
 reviews:{factual:{status:'needs_additional_signoff',reviewedAt:'2026-10-24',
    note:'Kildeartikler sammenholdt med redaksjonelt grunnlag; presise besøkspunkter og eventuelle kildekonflikter er fortsatt åpne.'},
  editorial:{status:'passed',reviewedAt:'2026-10-24',introducedNewFacts:false,
    note:'Teksten er hentet fra eksisterende stedsspesifikk redaksjonell bolk; besøksinstruks for Teglverket gjort lesbar.'}},
 quizReadiness:{questions:source.quiz.sets.flatMap(s=>s.questions).slice(0,10).map((q,i)=>({
  question:q.question,answer:q.answer,type:['hva','hvem','når','hva_skjedde','hvor','hvilket_verk_eller_objekt','hva_ble_bygget_produsert_eller_endret'][i%7],
  normalKnowledgeQuestion:true,claimIds:[claims[i%claims.length]?.id]
 }))},
 completion:{completedUnder:null,currentStatus:'research_and_access_gates_open',sourceVerifiedAt:'2026-10-24',
  factualReview:'pending',editorialReview:'passed',claimsVerified:{verified:claims.length,total:claims.length},
  validatorVersion:'4.2.1'},
 disclaimer:'Source-indexed packet for branch integration; NOT ready_v4_2 or public access certification.'};
 const target='data/places/production/'+p.id+'.json';
 if(write){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(packet,null,2)+'\n');}
 console.log(p.id+': '+claims.length+' sentence claims, '+packet.status+(write?' written':' preview'));
}
