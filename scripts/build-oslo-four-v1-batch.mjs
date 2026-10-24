#!/usr/bin/env node
/**
 * Materialise the four remaining Oslo six-place candidates as a single v1 batch.
 * This writes canonical-shaped candidate files, quizzable data, QuizCards and images,
 * but NEVER activates manifests until release QA and Knowledge parity are complete.
 * No `complete`, registered GPS, or public-entrance attestation is inferred from a POI.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildOsloSixIntegrationPreview} from './build-oslo-six-integration-preview.mjs';
import {buildOsloSixCanonicalStaging} from './build-oslo-six-canonical-place-drafts.mjs';
import {buildRulePreflight} from './place-production-rule-preflight.mjs';

const ROOT=path.resolve(import.meta.dirname,'..');
const data=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const write=(p,obj)=>{const file=path.join(ROOT,p);fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,typeof obj==='string'?obj:JSON.stringify(obj,null,2)+'\n');};
const IDS=['linderud_gard','sarabraten','saeterhytten_bygdoy','kristiania_teglverk_bryn'];
const COORD={
 linderud_gard:{lat:59.94191458255421,lon:10.833376615212883,r:80,year:1713,
   sourceProvider:'official_address',sourceObjectId:'geonorge-adresser-v1:0301:17749:319',
   source:'https://ws.geonorge.no/adresser/v1/sok?sok=Trondheimsveien%20319%20Oslo',
   role:'Representasjonspunkt for museumsadressen, ikke nøyaktig hageinngang',underbadge_ids:['tidlig_modernetid','sosialhistorie'],address:{street:'Trondheimsveien',number:'319',postcode:'0593',city:'Oslo',country:'NO'}},
 sarabraten:{lat:59.89177,lon:10.87884,r:110,year:1856,
   sourceProvider:'historical_site_index',sourceObjectId:'lokalhistoriewiki:Sarabråten',
   source:'https://lokalhistoriewiki.no/wiki/Sarabr%C3%A5ten',
   role:'Historisk område-POI, ikke identisk med ruinmur, Milorg-bauta eller faktisk stiadkomst',underbadge_ids:['attenhundretallet','kulturminner_og_bevaring'],address:null},
 saeterhytten_bygdoy:{lat:59.915795,lon:10.684204,r:85,year:1862,
   sourceProvider:'venue_catalog_candidate',sourceObjectId:'ibsenstage:venue:15081',
   source:'https://dh-ibsenstage.hf.uio.no/pages/venue/15081',
   role:'Venue-/kameranært områdepunkt; ikke verifisert offentlig dør eller sti',underbadge_ids:['attenhundretallet','kulturminner_og_bevaring'],address:null},
 kristiania_teglverk_bryn:{lat:59.90928471780799,lon:10.820381572874084,r:75,year:1897,
   sourceProvider:'official_address',sourceObjectId:'geonorge-adresser-v1:0301:15038:18',
   source:'https://ws.geonorge.no/adresser/v1/sok?sok=Nils%20Hansens%20vei%2018%20Oslo',
   role:'Offisielt adresserepresentasjonspunkt, ikke ringovn-dør eller privat besøksrett',underbadge_ids:['industri','arbeidsliv_og_fag'],address:{street:'Nils Hansens vei',number:'18',postcode:'0667',city:'Oslo',country:'NO'}}
};
const EXTRA_NOTICE={
 linderud_gard:'Besøk den offentlig åpne hagen. Hovedbygningen er kun åpen ved omvisninger eller arrangementer.',
 sarabraten:'Følg eksisterende offentlig turvei. Ikke klatre på ruinmurene; Milorg-minnesteinen er et eget punkt.',
 saeterhytten_bygdoy:'Følg etablerte stier gjennom Dronningberget. Ikke gå inn på avsperrede selskapsområder eller utenfor stinettet.',
 kristiania_teglverk_bryn:'Privat industriområde. Se bare fra offentlig gangareal; ingen adgang til bygning, gårdsplass eller ringovn.'
};
function brickIllustration(width,height) {
 const landscape=width>height; const w=width,h=height;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
 <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#3e5364"/><stop offset="1" stop-color="#9bb3b4"/></linearGradient>
 <pattern id="brick" width="52" height="25" patternUnits="userSpaceOnUse"><rect width="52" height="25" fill="#8b4d3c"/>
 <path d="M0 0H52M0 12H52M26 0V12M0 12V25M52 12V25" stroke="#c48c71" stroke-width="2" opacity=".6"/></pattern></defs>
 <rect width="100%" height="100%" fill="url(#sky)"/><path d="M0 ${h*.7}H${w}V${h}H0" fill="#394d4c"/>
 <g transform="translate(${w*.08},${h*.27})">
 <rect x="0" y="${h*.18}" width="${w*.84}" height="${h*.4}" fill="url(#brick)" stroke="#422d2d" stroke-width="6"/>
 <path d="M-${w*.02} ${h*.2}L${w*.42} 0L${w*.87} ${h*.2}Z" fill="#4e3933" stroke="#2c2524" stroke-width="8"/>
 <rect x="${w*.63}" y="-${h*.04}" width="${w*.07}" height="${h*.2}" fill="#643e34"/>
 ${[.1,.29,.48,.67].map(x=>`<rect x="${w*x}" y="${h*.28}" width="${w*.085}" height="${h*.15}" fill="#25363f" stroke="#d5b69b" stroke-width="5"/>`).join('')}
 </g>
 <rect y="${h*.87}" width="${w}" height="${h*.13}" fill="#17292d" opacity=".92"/>
 <text x="${w/2}" y="${h*.92}" text-anchor="middle" fill="#fff2d4" font-family="sans-serif" font-weight="bold" font-size="${Math.round(w/(landscape?27:18))}">KRISTIANIA TEGLVERK</text>
 <text x="${w/2}" y="${h*.967}" text-anchor="middle" fill="#fff2d4" font-family="sans-serif" font-size="${Math.round(w/(landscape?54:33))}">Historisk illustrasjon – ikke foto av nåværende bygning</text>
 </svg>`;
}
const preview=buildOsloSixIntegrationPreview();
const staging=buildOsloSixCanonicalStaging();
const rights=data('reports/place-production/oslo-six-image-rights-shortlist-20261022.json');
const portraits=data('reports/place-production/oslo-six-frontimage-candidate-assets-20261023.json');
const access=data('reports/place-production/oslo-six-remaining-access-verification-20261024.json');
const links=data('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json');
const prepared=new Map(preview.places.map(p=>[p.place_id,p]));
const stories=new Map(staging.places.map(p=>[p.id,p]));
const imageRights=new Map(rights.places.map(p=>[p.place_id,p]));
const frontRights=new Map(portraits.sites.map(p=>[p.place_id,p]));
const output=[];
for(const id of IDS){
 const p=prepared.get(id),s=stories.get(id),geo=COORD[id];
 if(!p||!s||!geo||p.fullquiz_preview.length!==(id==='linderud_gard'?28:21)||p.quizcard_preview.length!==10)
  throw new Error('Incomplete existing source bundle: '+id);
 const photo=imageRights.get(id),portrait=frontRights.get(id);
 const image=id==='kristiania_teglverk_bryn'?`bilder/places/auto/${id}__historical_illustration.svg`:
  `bilder/places/auto/${id}__commons_lead.webp`;
 const frontImage=id==='kristiania_teglverk_bryn'?
  `bilder/places/auto/${id}__front_illustration.svg`:
  `bilder/places/auto/${id}__front_portrait.webp`;
 const cardImage=id==='kristiania_teglverk_bryn'?`bilder/places/auto/${id}__card_illustration.svg`:
  `bilder/places/auto/${id}__commons_card.webp`;
 const right=id==='kristiania_teglverk_bryn'?{author:'History Go',creator:'History Go',
   license:'CC0 / egen illustrasjon',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
   sourceUrl:'https://teglverk.no/kristiania-teglverk/',
   caption:'Redaksjonell illustrasjon av historisk teglverksarkitektur – ikke dokumentarfoto av den bevarte bygningen',
   changes:'Egenprodusert illustrasjon'}:{author:photo.lead_candidate.author,creator:photo.lead_candidate.author,
   license:photo.lead_candidate.license,licenseUrl:photo.lead_candidate.license_url,
   sourceUrl:photo.lead_candidate.page,caption:id.replaceAll('_',' ')+' – dokumentarfoto',
   changes:'Beskåret og konvertert til WebP'};
 const fRight=id==='kristiania_teglverk_bryn'?{...right}:
   {author:portrait.author,creator:portrait.author,license:portrait.license,
     licenseUrl:portrait.license_url,sourceUrl:portrait.source_page,
     caption:'Selvstendig stående foto av '+p.name,changes:'Stående 900×1350 WebP'};
 const placePath=`data/places/${p.categoryId}/oslo/places/${id}.json`;
 const place={id,name:p.name,category:p.categoryId,primary_category:p.categoryId,year:geo.year,
   lat:geo.lat,lon:geo.lon,r:geo.r,locatorType:'historic_site',sourceProvider:geo.sourceProvider,
   sourceObjectId:geo.sourceObjectId,address:geo.address,geocodeAccuracy:'approximate',
   coordRole:'display_marker',coordStatus:'candidate',coordSource:'sourced_site_or_address_poi',
   coordType:'site_reference',coordSourceUrl:geo.source,coordVerifiedAt:'2026-10-24',
   coordNote:geo.role+'. Kartpunkt og nærhetsradius er foreløpige; de gir ikke tilgang til private, fredede eller avsperrede områder. '+EXTRA_NOTICE[id],
   underbadge_ids:geo.underbadge_ids,emne_ids:p.fagverk_preview.emne_ids,
   desc:s.proposed_canonical_fields.desc,
   popupDesc:id==='kristiania_teglverk_bryn'?
    s.proposed_canonical_fields.popupDesc.replace('Inntil eiendom og offentlig besøksankring er avklart, skal denne teksten bare være et redaksjonelt utkast uten nytt kartpunkt eller løfte om adgang til ringovnen.',
      'Bygningen ligger på privat industriområde. Besøkende må holde seg på offentlig gangareal; de har ikke fri adgang til ringovnen eller fabrikkbygningen.'):
    s.proposed_canonical_fields.popupDesc,
   image,frontImage,cardImage,imageMeta:right,frontImageMeta:fRight,
   externalLinks:[...new Map([
     ...access.decisions.find(x=>x.place_id===id).sources.map(x=>[x.url,{label:x.publisher,url:x.url}]),
     [geo.source,{label:'Kartreferanse (ikke inngang)',url:geo.source}]
   ]).values()].slice(0,12),
   fagverk:{...p.fagverk_preview,status:'in_production'}
 };
 // The original source-to-question review is kept verbatim; no false Knowledge PASS.
 const sourceItems=p.fullquiz_preview.map((q,i)=>({
   id:q.id,quiz_id:`${p.categoryId}_${id}_set_${Math.floor(i/7)+1}_q${i%7+1}`,
   categoryId:p.categoryId,targetId:id,placeId:id,question_scope:'place',
   question:q.question,options:q.options,answer:q.answer,answerIndex:q.answerIndex,
   knowledge:q.knowledge,difficulty:Math.floor(i/7)+1,question_type:'fact',
   emne_id:p.fagverk_preview.emne_ids[0],source:[q.source_urls[0]],
   source_urls:q.source_urls,source_origin:'external',
   claim_id:q.claim_id||`claim_${id}_quiz_${i+1}`,
   claim_basis:q.claim_basis||q.knowledge,
   source_review_status:q.source_review_status
 }));
 const quiz={categoryId:p.categoryId,targetId:id,generator_version:'oslo_four_release_candidate_20261024',
   size_class:id==='linderud_gard'?'normal':'narrow',
   sources:[...new Set(sourceItems.flatMap(q=>q.source_urls))],
   sets:Array.from({length:sourceItems.length/7},(_,n)=>({
     set_id:`${p.categoryId}_${id}_set_${n+1}`,order:n+1,level:n+1,
     title:['Sted og opprinnelse','Mennesker og bruk','Endringer og spor','Kilder og historie'][n],
     questions:sourceItems.slice(n*7,(n+1)*7)
   }))};
 const cardQuestions=p.quizcard_preview.map((q,i)=>{
   const source=sourceItems.find(x=>x.id===q.sourceQuestionId);
   if(!source)throw Error(id+': QuizCard source missing '+q.sourceQuestionId);
   return {...source,number:i+1,sourceQuestionId:source.id,
     sourceQuizId:source.quiz_id,sourceQuizFile:`data/quiz/${p.categoryId}/${id}_sets.json`};
 });
 const card={card_id:`${p.categoryId}_quizkort_${id}`,categoryId:p.categoryId,targetId:id,
   title:p.name,subtitle:'Ti spørsmål om stedets historie',order:1,
   format:'single_surface_top10_with_answer_key',questionCount:10,questions:cardQuestions,
   answerKey:cardQuestions.map(q=>({number:q.number,answer:q.answer}))};
 const imageFiles=id==='kristiania_teglverk_bryn'?[
   [image,brickIllustration(1400,900)],[frontImage,brickIllustration(900,1350)],
   [cardImage,brickIllustration(900,600)]
 ]:[];
 output.push({id,placePath,place,quizPath:`data/quiz/${p.categoryId}/${id}_sets.json`,quiz,
   card,images:imageFiles,review_status:'CANDIDATE_NOT_ACTIVE',licensed_images:Boolean(photo?.lead_candidate)||id==='kristiania_teglverk_bryn'});
}
export function buildOsloFourV1Batch(){return output;}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
 const manifest={schema:'oslo_four_release_candidate_v1',date:'2026-10-24',
  generated_places:output.map(x=>({id:x.id,path:x.placePath,quiz:x.quizPath,card_questions:10,
   quiz_questions:x.quiz.sets.flatMap(s=>s.questions).length,not_activated:true})),
  place_count:4,fullquiz_question_count:output.reduce((n,x)=>n+x.quiz.sets.flatMap(s=>s.questions).length,0),
  quizcard_question_count:40,
  publication:'RELEASE_CANDIDATES_ONLY_MANIFESTS_NOT_UPDATED',
  outstanding:['independent_source_claim_signoff','coordinate_and_radius_release','Knowledge_build',
    'rule_preflight_and_production_packet','Fagverk_registry','real_app_browser_QA'],
  note:'All four places have a canonical-shaped content file, fullquiz and matching QuizCard; not live until all gates pass.'};
 if(process.argv.includes('--write')){
  const byCat=new Map();
  for(const item of output){
   write(item.placePath,item.place);write(item.quizPath,item.quiz);
   for(const [p,asset] of item.images)write(p,asset);
   write(`reports/place-production/${item.id}-workcard-current.json`,{
     schema:'history_go_place_workcard_v2',place_id:item.id,category:item.place.category,
     production_profile:'focused',profile_status:'provisional',
     profile_reason:'Kildebelagt v1-kandidat; fullproduksjon og kategoriens samlinger kommer i vFerdig.',
     status:'in_progress',branch_status:'PR #6593 – kanonisk v1-kandidat',live_status:'ikke aktiv',
     source_file:item.placePath,underbadge_ids:item.place.underbadge_ids,
     scope:'v1-kandidat; ingen Knowledge- eller manifestpublisering før reell app-QA.',
     source_review:{reviewed_at:'2026-10-24',
       urls:item.place.externalLinks.map(x=>x.url).filter(Boolean),
       question_count:item.quiz.sets.flatMap(s=>s.questions).length,
       claim_status:'pending_independent_final_check'},
     remaining:['kildereview','Knowledge-synk','manifestregistrering','nettleser-QA'],
     rule_preflight:buildRulePreflight(item.id,item.place.category)
   });
   const list=byCat.get(item.place.category)||[];list.push(item.card);byCat.set(item.place.category,list);
  }
  for(const [category,cards] of byCat){
    write(`data/quizcards/${category}/oslo_four_20261024.json`,{
      collection_id:`oslo_four_${category}_20261024`,categoryId:category,
      title:'Fire nye Oslo-steder – klargjort for v1',cardFormatRule:'single_surface_top10_with_answer_key',cards});
  }
  write('reports/place-production/oslo-four-release-candidate-20261024.json',manifest);
  console.log(JSON.stringify({materialized:true,...manifest},null,2));
 } else console.log(JSON.stringify({materialized:false,...manifest},null,2));
}