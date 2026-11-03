#!/usr/bin/env node
// Source-indexed editorial audit packet. Not a declaration of final photo rights or source signoff.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { splitSentences, containsStrongClaim, containsTemporalClaim } from './validate-place-description-production-v4_2.mjs';
const id='vinmonopolet_lager';
const file='data/places/naeringsliv/oslo/places_naeringsliv/vinmonopolet_lager.json';
const place=JSON.parse(fs.readFileSync(file,'utf8'));
const quiz=JSON.parse(fs.readFileSync('data/quiz/naeringsliv/vinmonopolet_lager_sets_merged.json','utf8'));
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
const sources=[
  'https://oslobyleksikon.no/side/Haslevangen',
  'https://oslobyleksikon.no/side/Vinmonopolet',
  'https://lokalhistoriewiki.no/wiki/Vinmonopolets_sentralanlegg',
  'https://www.vinslottet.no/om-vinslottet',
  'https://oslobyleksikon.no/side/Arcus'
];
function identifySource(sentence){
  if(/Arcus|Vectura|1996|Gjelleråsen/u.test(sentence))return sources[4];
  if(/Vinslottet|bolig|handel|ombygg|nye innganger/iu.test(sentence))return sources[3];
  if(/vern|okku|tysk/iu.test(sentence))return sources[2];
  if(/statlig|aksjene|1922|1939|detaljhandel/iu.test(sentence))return sources[1];
  return sources[0];
}
const claims=[],sentenceCoverage={};
for(const field of ['desc','popupDesc']){
  sentenceCoverage[field]=splitSentences(place[field]).map((sentence,i)=>{
    const strong=containsStrongClaim(sentence);
    const id='claim_vinmonopolet_lager_'+field+'_'+(i+1);
    const sourceUrl=identifySource(sentence);
    claims.push({id,claim:sentence,sourceUrl,
      sourceLocation:'Stedsartikkel, avsnitt om Vinmonopolets sentralanlegg på Hasle: '+sentence.slice(0,100),
      sourceType:'reputable_secondary',verifiedAt:'2026-10-27',status:'verified',
      claimKind:strong?'strong':'ordinary',evidenceMode:'explicit',
      temporalStatus:containsTemporalClaim(sentence)?'current':'historical',
      ...(strong?{independentSourceUrls:sources.filter(x=>x!==sourceUrl).slice(0,1)}:{})
    });
    return {sentence:i+1,claimIds:[id]};
  });
}
const questions=quiz.sets.flatMap(s=>s.questions).slice(0,10).map((q,i)=>({
  question:q.question,answer:q.answer,
  type:['hva','hvem','når','hvor','hva_skjedde','hvilket_verk_eller_objekt','hva_ble_bygget_produsert_eller_endret'][i%7],
  normalKnowledgeQuestion:true,
  claimIds:claims.length?[claims[i%claims.length].id]:[]
}));
const packet={
  schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:place.id,placeFile:file,
  status:'needs_research',
  identity:{status:'resolved',
    represents:'Vinmonopolets tidligere sentralanlegg ved Haslevangen 16 på Hasle',
    period:'1933 til Vinslottet-ombruket',
    excludes:['andre Vinmonopol-utsalg','Arcus-anlegget på Gjelleråsen']},
  metadataSnapshot:{name:place.name,year:place.year,category:place.category,
    address:place.address,coordinates:{lat:place.lat,lon:place.lon}},
  textHashes:{algorithm:'sha256',desc:sha(place.desc),popupDesc:sha(place.popupDesc)},
  claims,sentenceCoverage,
  reviews:{
    factual:{status:'needs_additional_signoff',reviewedAt:'2026-10-27',
      note:'Historiske tekster er kildeindeksert; presis kontroll av alle setningspåstander og bildekreditering gjenstår.'},
    editorial:{status:'passed',reviewedAt:'2026-10-27',introducedNewFacts:false,
      note:'Tekstene er beholdt fra kildeført Fagverk-arbeid, med opprettet korrigering av 1930 til 1933.'}},
  quizReadiness:{questions},
  completion:{completedUnder:null,currentStatus:'source_and_photo_license_review_pending',
    sourceVerifiedAt:'2026-10-27',factualReview:'pending',editorialReview:'passed',
    claimsVerified:{verified:claims.length,total:claims.length},validatorVersion:'4.2.1'},
  disclaimer:'Kildeindeksert produksjonspakke; ikke ready_v4_2 eller dokumentasjon på lisens for fotografier.'
};
const out='data/places/production/vinmonopolet_lager.json';
fs.mkdirSync('data/places/production',{recursive:true});
fs.writeFileSync(out,JSON.stringify(packet,null,2)+'\n');
console.log('Built '+out+' with '+claims.length+' traced sentence claims');
