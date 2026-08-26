#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-08-26';
const GEONORGE = 'https://ws.geonorge.no/adresser/v1/sok';
const GEONORGE_SOURCE = 'https://ws.geonorge.no/adresser/v1/';
const OSLO_REUSE = 'https://www.oslo.kommune.no/avfall-og-gjenvinning/ombruk/';
const CIRCULAR_SOURCE = 'https://www.miljodirektoratet.no/ansvarsomrader/avfall/sirkular-okonomi/';
const LESEKIOSK_LIST = 'https://lesekiosk.no/finn-en-kiosk/';
const LESEKIOSK_HOME = 'https://lesekiosk.no/';
const KIOSK_INVENTORY = path.join(ROOT, 'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json');

const reusePlaces = [
  { id:'grefsen_gjenvinningsstasjon', name:'Grefsen gjenvinningsstasjon', address:'Kapellveien 118, 0493 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/grefsen-gjenvinningsstasjon/', free:true, sale:false, self:false, preset:[59.957835,10.772307], presetVerified:true, note:'Egne merkede hyller og områder gjør gratis uttak av ombruksvarer mulig.' },
  { id:'haraldrud_gjenvinningsstasjon', name:'Haraldrud gjenvinningsstasjon', address:'Brobekkveien 87, 0582 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/haraldrud-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Byggevarer kan hentes gratis fra kommunens ombruksløsning inne på stasjonen.' },
  { id:'ryen_gjenvinningsstasjon', name:'Ryen gjenvinningsstasjon', address:'Vårveien 87, 0680 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/ryen-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Egne merkede hyller og områder gjør gratis uttak av ombruksvarer mulig.' },
  { id:'smestad_gjenvinningsstasjon', name:'Smestad gjenvinningsstasjon', address:'Ullernchausseen 26, 0379 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/smestad-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Byggevarer kan hentes gratis fra kommunens ombruksløsning inne på stasjonen.' },
  { id:'lindeberg_gjenvinningsstasjon', name:'Lindeberg gjenvinningsstasjon', address:'Jerikoveien 5, 1067 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/lindeberg-gjenvinningsstasjon/', free:true, sale:false, self:true, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling når tilbudet er tilgjengelig.' },
  { id:'kampen_gjenvinningsstasjon', name:'Kampen gjenvinningsstasjon', address:'Sons gate 2, 0654 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/kampen-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling.' },
  { id:'romsas_gjenvinningsstasjon', name:'Romsås gjenvinningsstasjon', address:'Romsås senter, 0970 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/romsas-gjenvinningsstasjon/', free:true, sale:false, self:false, preset:[59.9640,10.8939], note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling.' },
  { id:'sofienbergparken_gjenvinningsstasjon', name:'Sofienbergparken gjenvinningsstasjon', address:'Helgesens gate 56, 0553 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/sofienbergparken-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling.' },
  { id:'trosterud_gjenvinningsstasjon', name:'Trosterud gjenvinningsstasjon', address:'Dr. Dedichens vei 24B, 0675 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/trosterud-gjenvinningsstasjon/', free:true, sale:false, self:true, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling når tilbudet er tilgjengelig.' },
  { id:'haraldrud_ombrukstelt', name:'Haraldrud ombrukstelt', address:'Brobekkveien 87, 0582 Oslo', type:'reuse_tent', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/haraldrud-ombrukstelt/', free:true, sale:true, self:false, note:'Ombruksteltet selger brukte gjenstander rimelig, og enkelte gjenstander tilbys gratis i en egen container.' },
  { id:'gronmo_ombrukstelt', name:'Grønmo ombrukstelt', address:'Sørliveien 1, 1279 Oslo', type:'reuse_tent', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/gronmo-ombrukstelt/', free:false, sale:true, self:false, note:'Ombruksteltet selger brukbare gjenstander som er sortert ut fra kommunens gjenvinningsstasjoner.' }
];

const typeLabel = {
  large_recycling_station:'gjenvinningsstasjon med ombruksuttak',
  small_recycling_station:'lokal gjenvinningsstasjon med ombruksuttak',
  reuse_tent:'kommunalt ombrukstelt'
};

function sha(text){ return crypto.createHash('sha256').update(String(text)).digest('hex'); }
function mkdir(file){ fs.mkdirSync(path.dirname(file), {recursive:true}); }
function writeJson(file,data){ mkdir(file); fs.writeFileSync(file, `${JSON.stringify(data,null,2)}\n`); }
function sentences(text){
  const value=String(text).trim();
  if(typeof Intl?.Segmenter==='function'){
    return [...new Intl.Segmenter('nb',{granularity:'sentence'}).segment(value)].map(row=>row.segment.trim()).filter(Boolean);
  }
  return value.replace(/\n+/g,' ').split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/u).map(v=>v.trim()).filter(Boolean);
}
function coverage(text, claimIdsBySentence){
  const rows=sentences(text);
  if(rows.length!==claimIdsBySentence.length) throw new Error(`Coverage mismatch: ${rows.length} sentences, ${claimIdsBySentence.length} claim rows`);
  return rows.map((_,i)=>({sentence:i+1,claimIds:claimIdsBySentence[i]}));
}
function words(text){ return String(text).trim().split(/\s+/u).filter(Boolean).length; }
function structuredAddress(raw){
  const m=String(raw||'').match(/^(.*?)\s+(\d+[A-Za-z]?),\s*(\d{4})\s+(.+)$/u);
  return m?{street:m[1],number:m[2],postcode:m[3],city:m[4],country:'Norge'}:null;
}
function normalizeAddress(v){ return String(v).toLowerCase().replace(/[,]/g,'').replace(/\s+/g,' ').replace(/\b0+(\d{3})\b/g,'$1').trim(); }
async function fetchOk(url){ const res=await fetch(url,{headers:{'user-agent':'History-Go-production/1.0'}}); if(!res.ok) throw new Error(`${res.status} ${url}`); return res; }

async function officialServiceCoordinate(st){
  try{
    const html=await (await fetchOk(st.sourceUrl)).text();
    const lat=Number(html.match(/latitude(?:&quot;|")?:(?:&quot;|")(-?\d+(?:\.\d+)?)/u)?.[1]);
    const lon=Number(html.match(/longitude(?:&quot;|")?:(?:&quot;|")(-?\d+(?:\.\d+)?)/u)?.[1]);
    if(Number.isFinite(lat)&&Number.isFinite(lon)){
      return {lat,lon,sourceProvider:'municipality',sourceObjectId:`oslo-kommune-service:${st.id}`,geocodeAccuracy:'rooftop',coordStatus:'verified',coordType:'service_point',coordSourceUrl:st.sourceUrl,coordNote:`Eksakt latitude/longitude er publisert på Oslo kommunes tjenesteside for ${st.name}.`};
    }
  }catch{}
  return null;
}

async function geocode(st){
  if(st.preset){
    return {lat:st.preset[0],lon:st.preset[1],sourceProvider:'municipality',sourceObjectId:`oslo-kommune-service:${st.id}`,geocodeAccuracy:st.presetVerified?'rooftop':'approximate',coordStatus:st.presetVerified?'verified':'needs_manual_visual_qa',coordType:'service_point',coordSourceUrl:st.sourceUrl,coordNote:st.presetVerified?`Eksakt latitude/longitude er publisert på Oslo kommunes tjenesteside for ${st.name}.`:`Kommunal stedsangivelse for ${st.name}; punktet beholdes som omtrentlig displaymarkør inntil et entydig offisielt adressepunkt er dokumentert.`};
  }
  const official=await officialServiceCoordinate(st);
  if(official) return official;
  const addressOnly=st.address.replace(/,\s*\d{4}\s+Oslo$/u,'');
  const data=await (await fetchOk(`${GEONORGE}?sok=${encodeURIComponent(addressOnly)}&treffPerSide=50`)).json();
  const rows=(Array.isArray(data.adresser)?data.adresser:[]).filter(r=>String(r.kommunenummer||'')==='0301');
  const target=normalizeAddress(addressOnly);
  const ranked=rows.map(r=>{const candidate=normalizeAddress(r.adressetekst||'');let score=candidate===target?100:0;if(candidate.includes(target)||target.includes(candidate))score+=50;for(const token of target.split(' '))if(candidate.includes(token))score+=2;return{r,score};}).sort((a,b)=>b.score-a.score);
  const hit=ranked[0]?.r, point=hit?.representasjonspunkt;
  if(!hit||!Number.isFinite(point?.lat)||!Number.isFinite(point?.lon)) throw new Error(`No Geonorge address for ${st.id}: ${st.address}`);
  const sourceObjectId=`geonorge-adresser-v1:0301:${hit.adressekode||'na'}:${hit.nummer||'na'}${hit.bokstav||''}`;
  return {lat:point.lat,lon:point.lon,sourceProvider:'official_address',sourceObjectId,geocodeAccuracy:'rooftop',coordStatus:'verified',coordType:'address_point',coordSourceUrl:GEONORGE_SOURCE,coordNote:`Offisielt adresserepresentasjonspunkt fra Geonorge Adresser API for ${hit.adressetekst||st.address}; brukt som displaymarkør for den aktive tjenesten.`};
}

function envText(st,index){
  const addressLabel=st.address.replace(/^Dr\.\s/u,'Doktor ');
  const desc=`${st.name} ved ${addressLabel} er et ${typeLabel[st.type]} i Oslo. ${st.name} har denne dokumenterte ombruksfunksjonen: ${st.note} ${st.name} er registrert som et eget mikrosted i kommunens ombruks- og gjenvinningsnettverk.`;
  const p1=`Oslo kommune oppgir ${st.name} ved ${addressLabel} som et eget ${typeLabel[st.type]}. ${st.name} har denne dokumenterte ombruksfunksjonen: ${st.note}`;
  const p2=`Praktiske vilkår og tilgjengelighet ved ${st.name} kan endres, så den kommunale stedssiden bør kontrolleres før besøk.`;
  const p3=`Ombruksfunksjonen ved ${st.name} viser hvordan brukbare ting kan få en ny bruksrunde før materialgjenvinning blir aktuelt.`;
  const popupDesc=`${p1}\n\n${p2}\n\n${p3}`;
  return {
    desc,popupDesc,
    sentenceCoverage:{
      desc:[[`claim_${st.id}_identity`],[`claim_${st.id}_reuse`],[`claim_${st.id}_network`]],
      popupDesc:[[`claim_${st.id}_identity`],[`claim_${st.id}_reuse`],[`claim_${st.id}_access`],[`claim_${st.id}_circular`]]
    }
  };
}

function kioskText(c,index){
  const source=c.officialPage||LESEKIOSK_LIST;
  if(c.kioskNumber===70){
    const desc=`${c.name} er kiosk nummer 70 i paret som Lesekiosks Sagene-side omtaler som tvillingkioskene. Den offisielle oversikten fører nummer 70 ved Sagene kirke og bruker samme kartanker som nummer 71. Denne Place-identiteten gjelder bare telefonkiosken med nummer 70.`;
    const popupDesc=`Lesekiosks Sagene-side dokumenterer nummer 70 og 71 som tvillingkiosker med utsikt mot Sagene kirke. ${c.name} representerer nummer 70 i dette paret.\n\nDen aktuelle Oslo-oversikten bruker kartankeret som et felles punkt for begge kiosknumrene ved kirken.\n\n${c.name} beholdes som et selvstendig litteratursted, adskilt fra tvillingkiosk 71.`;
    return {desc,popupDesc,sentenceCoverage:{desc:[[`claim_${c.id}_twin`],[`claim_${c.id}_identity`,`claim_${c.id}_coordinate`],[`claim_${c.id}_identity`]],popupDesc:[[`claim_${c.id}_twin`],[`claim_${c.id}_identity`],[`claim_${c.id}_coordinate`],[`claim_${c.id}_identity`,`claim_${c.id}_twin`]]}};
  }
  if(c.kioskNumber===71){
    const desc=`${c.name} er den individuelt dokumenterte kiosk nummer 71 ved Sagene kirke. Lesekiosks egen stedsside beskriver nummer 70 og 71 samlet som tvillingkioskene. Denne Place-identiteten gjelder nummer 71, ikke den andre telefonkiosken i paret.`;
    const popupDesc=`Den individuelle Lesekiosk-siden for Sagene er knyttet til kiosk nummer 71 og omtaler begge kioskene ved kirken. ${c.name} representerer nummer 71.\n\nStedssiden kaller nummer 70 og 71 tvillingkioskene og viser dem som et fysisk par.\n\n${c.name} får likevel sin egen litteraturidentitet, mens nummer 70 bevares som et annet canonical Place.`;
    return {desc,popupDesc,sentenceCoverage:{desc:[[`claim_${c.id}_identity`],[`claim_${c.id}_twin`],[`claim_${c.id}_identity`,`claim_${c.id}_twin`]],popupDesc:[[`claim_${c.id}_identity`,`claim_${c.id}_twin`],[`claim_${c.id}_identity`],[`claim_${c.id}_twin`],[`claim_${c.id}_identity`,`claim_${c.id}_twin`]]}};
  }
  const desc=`${c.name} er Lesekiosk nummer ${c.kioskNumber} ved ${c.officialListLabel} i Oslo. ${c.name} er en rød telefonkiosk som fungerer som et eget fysisk bokdelingspunkt. ${c.name} skilles fra byens øvrige Lesekiosker ved kiosknummer ${c.kioskNumber} og plasseringen.`;
  const p1=`Lesekiosks aktuelle Oslo-oversikt registrerer ${c.name} som kiosk nummer ${c.kioskNumber} ved ${c.officialListLabel}. Kartlenken for ${c.name} oppgir punktet ${c.lat}, ${c.lon}.`;
  const p2=`Ved ${c.name} gir Lesekiosk den røde telefonkiosken en litterær bokdelingsfunksjon uten å gjøre den til et bemannet bibliotek.`;
  const p3=`${c.name} beholder sin egen identitet og litteraturmarkør selv om bokutvalget i kiosken kan skifte.`;
  const popupDesc=`${p1}\n\n${p2}\n\n${p3}`;
  return {
    desc,popupDesc,
    sentenceCoverage:{
      desc:[[`claim_${c.id}_identity`],[`claim_${c.id}_function`],[`claim_${c.id}_identity`]],
      popupDesc:[[`claim_${c.id}_identity`,`claim_${c.id}_listing`],[`claim_${c.id}_coordinate`],[`claim_${c.id}_function`],[`claim_${c.id}_identity`,`claim_${c.id}_function`]]
    }
  };
}

function quiz(claimIds, questions){ return questions.map(q=>({...q,claimIds:q.claimIds||claimIds})); }
function packet({place,placeFile,claims,sentenceCoverage,represents,excludes}){
  return {
    schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:place.id,placeFile,status:'needs_research',
    identity:{status:'resolved',represents,period:'2026–',excludes},
    metadataSnapshot:{name:place.name,category:place.category},
    textHashes:{algorithm:'sha256',desc:sha(place.desc),popupDesc:sha(place.popupDesc)},
    claims,
    sentenceCoverage:{desc:coverage(place.desc,sentenceCoverage.desc),popupDesc:coverage(place.popupDesc,sentenceCoverage.popupDesc)},
    reviews:{factual:{status:'pending',reviewedAt:DATE,reviewer:'unassigned'},editorial:{status:'pending',reviewedAt:DATE,reviewer:'unassigned',introducedNewFacts:false}},
    quizReadiness:{questions:[]},
    completion:{completedUnder:'4.2',currentStatus:'current',sourceVerifiedAt:DATE,claimsVerified:{verified:claims.length,total:claims.length},factualReview:'pending',editorialReview:'pending',validatorVersion:'4.2.1'}
  };
}

function envClaims(st){
  return [
    {id:`claim_${st.id}_identity`,claim:`${st.name} er Oslo kommunes aktive ombruks- eller gjenvinningstilbud ved ${st.address}.`,sourceUrl:st.sourceUrl,sourceLocation:'Kommunal stedsside: navn, plassering og tjeneste.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'identity',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_reuse`,claim:st.note,sourceUrl:st.sourceUrl,sourceLocation:'Kommunal stedsside og ombruksside: uttak, salg og praktisk ombruksfunksjon.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_network`,claim:`${st.name} er del av kommunens ombruks- og gjenvinningsnettverk i Oslo.`,sourceUrl:OSLO_REUSE,sourceLocation:'Hente eller levere til ombruk: uttakssteder og ombruksløsninger.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_access`,claim:`Praktiske vilkår og tilgjengelighet ved ${st.name} kan endres og må kontrolleres på den kommunale stedssiden.`,sourceUrl:st.sourceUrl,sourceLocation:'Kommunal stedsside: praktiske vilkår og aktuell tilgjengelighet.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'temporal',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_circular`,claim:`Ombruksfunksjonen ved ${st.name} viser avfallshierarkiets prioritering av videre bruk før materialgjenvinning når det er forsvarlig.`,sourceUrl:CIRCULAR_SOURCE,sourceLocation:'Miljødirektoratets fagstoff om sirkulær økonomi og avfallshierarki.',sourceType:'official',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'}
  ];
}

function envQuestions(st,claims){
  const ids=claims.map(c=>c.id);
  return quiz(ids,[
    {question:`Hvor ligger ${st.name}?`,answer:st.address,type:'hvor',normalKnowledgeQuestion:true},
    {question:`Hva slags sted er ${st.name}?`,answer:typeLabel[st.type],type:'hva',normalKnowledgeQuestion:true},
    {question:`Hva er ombruksfunksjonen ved ${st.name}?`,answer:st.note,type:'hva',normalKnowledgeQuestion:true},
    {question:`Hvilken kommune dokumenterer tilbudet ved ${st.name}?`,answer:'Oslo kommune',type:'hvem',normalKnowledgeQuestion:true},
    {question:`Hva skal vurderes før materialgjenvinning når en ting fortsatt kan brukes?`,answer:'ombruk eller videre bruk',type:'hva',normalKnowledgeQuestion:true},
    {question:`Hva bør kontrolleres før besøk ved ${st.name}?`,answer:'den aktuelle kommunale stasjonssiden og praktiske vilkår',type:'hva_skjedde',normalKnowledgeQuestion:false},
    {question:`Hvilken kategori har ${st.name}?`,answer:'Natur & miljø – Miljø & gjenbruk',type:'hvilket_verk_eller_objekt',normalKnowledgeQuestion:false},
    {question:`Hva knytter ${st.name} sammen i ressurskretsløpet?`,answer:'innlevering, ombruk og videre materialbehandling',type:'hva_ble_bygget_produsert_eller_endret',normalKnowledgeQuestion:false}
  ]);
}

function kioskClaims(c){
  const primary=c.officialPage||LESEKIOSK_LIST;
  const result=[
    {id:`claim_${c.id}_identity`,claim:`${c.name} er kiosk nummer ${c.kioskNumber} ved ${c.officialListLabel} i Lesekiosks aktuelle Oslo-oversikt.`,sourceUrl:primary,sourceLocation:'Lesekiosk: kioskidentitet og stedsangivelse.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'identity',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${c.id}_listing`,claim:`Lesekiosk registrerer ${c.name} som et fysisk bokdelingspunkt i Oslo.`,sourceUrl:LESEKIOSK_LIST,sourceLocation:'Finn en kiosk: aktuell Oslo-liste.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${c.id}_function`,claim:'Lesekiosk gir røde telefonkiosker en litterær bokdelingsfunksjon.',sourceUrl:LESEKIOSK_HOME,sourceLocation:'Lesekiosk: prosjektets bokkioskfunksjon.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${c.id}_coordinate`,claim:`Den offisielle Lesekiosk-kartlenken for ${c.name} oppgir kartankeret ${c.lat}, ${c.lon}.`,sourceUrl:LESEKIOSK_LIST,sourceLocation:'Offisiell Lesekiosk-kartlenke fra aktuell kioskoversikt.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'}
  ];
  if([70,71].includes(c.kioskNumber))result.push({id:`claim_${c.id}_twin`,claim:'Lesekiosks Sagene-side omtaler kiosk nummer 70 og 71 som tvillingkioskene ved Sagene kirke.',sourceUrl:'https://lesekiosk.no/lesekiosk/lesekiosken-pa-sagene-nr-71/',sourceLocation:'Lesekiosken: avsnittet om tvillingkioskene på Sagene.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'identity',evidenceMode:'direct',temporalStatus:'current'});
  return result;
}

function kioskQuestions(c,claims){
  const ids=claims.map(x=>x.id);
  return quiz(ids,[
    {question:`Hvilket nummer har ${c.name}?`,answer:String(c.kioskNumber),type:'hva',normalKnowledgeQuestion:true},
    {question:`Hvor er ${c.name} registrert?`,answer:c.officialListLabel,type:'hvor',normalKnowledgeQuestion:true},
    {question:`Hvilken organisasjon fører den aktuelle kioskoversikten?`,answer:'Lesekiosk',type:'hvem',normalKnowledgeQuestion:true},
    {question:`Hva slags litterær funksjon har ${c.name}?`,answer:'bokdeling i en rød telefonkiosk',type:'hva',normalKnowledgeQuestion:true},
    {question:`Hvilken hovedkategori tilhører ${c.name}?`,answer:'Litteratur',type:'hvilket_verk_eller_objekt',normalKnowledgeQuestion:true},
    {question:`Hva skiller ${c.name} fra andre Lesekiosker?`,answer:`kiosknummer ${c.kioskNumber} og stedsangivelsen ${c.officialListLabel}`,type:'hva_skjedde',normalKnowledgeQuestion:false},
    {question:`Hva kan endre seg uten at ${c.name} mister stedsidentiteten?`,answer:'hvilke konkrete bøker som står i kiosken',type:'hva_ble_bygget_produsert_eller_endret',normalKnowledgeQuestion:false},
    {question:`Hva er den faste fysiske rammen for bokdelingen ved ${c.name}?`,answer:'den røde telefonkiosken',type:'hva',normalKnowledgeQuestion:false}
  ]);
}

function kioskPlace(c,index){
  const {desc,popupDesc,sentenceCoverage}=kioskText(c,index);
  const address=structuredAddress(`${c.officialListLabel}, Oslo`);
  const place={
    id:c.id,name:c.name,lat:c.lat,lon:c.lon,r:45,category:'litteratur',subcategory_id:'lesekiosk',placeTier:'micro',desc,popupDesc,
    micro_place_profile:{schema:'history_go_micro_place_profile_v1',kind:'lesekiosk',currentStatus:'active',sourceUrl:c.officialPage||LESEKIOSK_LIST,sourceLocation:`Lesekiosk Oslo-oversikt: kiosk ${c.kioskNumber}, ${c.officialListLabel}`,verifiedAt:DATE,quizMode:'none'},
    locatorType:'current_place',sourceProvider:'official_map',sourceObjectId:`lesekiosk-current-map:${c.id}`,geocodeAccuracy:'approximate',coordRole:'display_marker',coordType:'service_point',coordStatus:'needs_manual_visual_qa',coordSource:'Lesekiosk – offisiell kartlenke',coordSourceId:`lesekiosk-current-map:${c.id}`,coordSourceUrl:LESEKIOSK_LIST,coordNote:'Kartankeret kommer fra Lesekiosks offisielle aktuelle kartlenke og beholdes som needs_manual_visual_qa inntil et mer presist objektpunkt er dokumentert.',
    externalLinks:[{type:'reference',label:c.officialPage?`Lesekiosk – ${c.name}`:'Lesekiosk – Finn en kiosk',url:c.officialPage||LESEKIOSK_LIST,lang:'nb',verifiedAt:DATE},{type:'coordinate_source',label:'Lesekiosk – offisiell kartlenke',url:LESEKIOSK_LIST,lang:'nb',verifiedAt:DATE}]
  };
  if(address) place.address=address;
  return {place,sentenceCoverage};
}

async function envPlace(st,index){
  const geo=await geocode(st);
  const {desc,popupDesc,sentenceCoverage}=envText(st,index);
  const place={
    id:st.id,name:st.name,lat:geo.lat,lon:geo.lon,r:55,category:'natur',subcategory_id:'miljo_gjenbruk',placeTier:'micro',desc,popupDesc,
    micro_place_profile:{schema:'history_go_micro_place_profile_v1',kind:st.type==='reuse_tent'?'ombrukspunkt':'gjenvinningsstasjon',currentStatus:'active',sourceUrl:st.sourceUrl,sourceLocation:`Oslo kommune: ${st.name}, adresse og ombruksfunksjon`,verifiedAt:DATE,quizMode:'none'},
    circular_profile:{schema:'history_go_circular_place_profile_v1',place_type:st.type,operation_status:'active',free_takeaway:st.free,reuse_sale:st.sale,restricted_access:false,self_service:st.self,mobile_service:false,reuse:[{id:`${st.id}_reuse`,title:st.sale?'Ombruk og bruktutsalg':'Gratis ombruk',description:st.note}],materials:[{id:`${st.id}_materials`,title:'Materialer',description:'Brukbare gjenstander vurderes for videre bruk, mens andre materialstrømmer sorteres etter tjenestens regler.'}],environment:[{id:`${st.id}_environment`,title:'Kretsløp & miljø',description:'Ombruk forlenger brukstiden før materialgjenvinning eller annen behandling blir aktuelt.'}],systems:[{id:`${st.id}_systems`,title:'Sted & system',description:`${st.name} er del av Oslo kommunes fysiske ombruks- og gjenvinningsinfrastruktur.`}],source_url:st.sourceUrl,verified_at:DATE},
    locatorType:'current_place',sourceProvider:geo.sourceProvider,sourceObjectId:geo.sourceObjectId,geocodeAccuracy:geo.geocodeAccuracy,coordRole:'display_marker',coordType:geo.coordType,coordStatus:geo.coordStatus,coordSource:geo.sourceProvider==='official_address'?'Kartverket / Geonorge Adresser API':'Oslo kommune – kommunal stedsangivelse',coordSourceId:geo.sourceObjectId,coordSourceUrl:geo.coordSourceUrl,coordNote:geo.coordNote,
    address:structuredAddress(st.address)||st.address,
    externalLinks:[{type:'reference',label:`Oslo kommune – ${st.name}`,url:st.sourceUrl,lang:'nb',verifiedAt:DATE},{type:'reference',label:'Oslo kommune – ombruk',url:OSLO_REUSE,lang:'nb',verifiedAt:DATE},{type:'coordinate_source',label:geo.sourceProvider==='official_address'?'Kartverket / Geonorge':'Oslo kommune – stedsangivelse',url:geo.coordSourceUrl,lang:'nb',verifiedAt:DATE}]
  };
  if(geo.coordStatus==='verified') place.coordVerifiedAt=DATE;
  return {place,sentenceCoverage};
}

function addManifest(manifest,rel){ if(!manifest.files.includes(rel)) manifest.files.push(rel); }

async function main(){
  const kioskInventory=JSON.parse(fs.readFileSync(KIOSK_INVENTORY,'utf8'));
  const kiosks=Array.isArray(kioskInventory.candidates)?kioskInventory.candidates:[];
  if(kiosks.length!==21) throw new Error(`Expected 21 Lesekiosk candidates, got ${kiosks.length}`);
  if(reusePlaces.length!==11) throw new Error(`Expected 11 reuse places, got ${reusePlaces.length}`);
  const manifestPath=path.join(ROOT,'data/places/manifest.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const envInventory=[];
  const kioskMaterialized=[];

  for(let i=0;i<reusePlaces.length;i++){
    const st=reusePlaces[i];
    const {place,sentenceCoverage}=await envPlace(st,i);
    const claims=envClaims(st);
    const rel=`places/natur/oslo/miljo_gjenbruk/${st.id}.json`;
    const placeFile=`data/${rel}`;
    writeJson(path.join(ROOT,placeFile),place);
    writeJson(path.join(ROOT,'data/places/production',`${st.id}.json`),packet({place,placeFile,claims,sentenceCoverage,represents:`${st.name} som eget kommunalt ombruks- eller gjenvinningstilbud ved ${st.address}.`,excludes:['andre kommunale gjenvinningsstasjoner','mobile eller midlertidige tilbud','nabosteder uten samme tjenesteidentitet']}));
    addManifest(manifest,rel);
    envInventory.push({id:st.id,name:st.name,lat:place.lat,lon:place.lon,place_type:st.type,free_takeaway:st.free,reuse_sale:st.sale,source:st.sourceUrl,status:'active_permanent'});
    console.log(`generated reuse ${st.id}`);
  }

  for(let i=0;i<kiosks.length;i++){
    const c=kiosks[i];
    if(c.category!=='litteratur') throw new Error(`${c.id} must remain litteratur`);
    const {place,sentenceCoverage}=kioskPlace(c,i);
    const claims=kioskClaims(c);
    const rel=`places/litteratur/oslo/lesekiosk/${c.id}.json`;
    const placeFile=`data/${rel}`;
    writeJson(path.join(ROOT,placeFile),place);
    writeJson(path.join(ROOT,'data/places/production',`${c.id}.json`),packet({place,placeFile,claims,sentenceCoverage,represents:`${c.name} som egen fysisk Lesekiosk ved ${c.officialListLabel}.`,excludes:['andre Lesekiosker i Oslo','nærliggende History GO-steder','skiftende enkeltbøker i kiosken']}));
    addManifest(manifest,rel);
    kioskMaterialized.push({id:c.id,name:c.name,kioskNumber:c.kioskNumber,lat:c.lat,lon:c.lon,category:'litteratur',subcategory_id:'lesekiosk',source:c.officialPage||LESEKIOSK_LIST,status:'active_permanent'});
    console.log(`generated kiosk ${c.id}`);
  }

  fs.writeFileSync(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
  writeJson(path.join(ROOT,'reports/oslo-miljo-gjenbruk-2026/permanent-active-inventory.json'),{schema:'history_go_oslo_miljo_gjenbruk_inventory_v2',generatedAt:DATE,category:'natur',subcategory_id:'miljo_gjenbruk',selectionAuthority:OSLO_REUSE,count:envInventory.length,places:envInventory});
  writeJson(path.join(ROOT,'reports/lesekiosker-oslo-2026/materialized-canonical-places.json'),{schema:'history_go_lesekiosk_materialization_v1',generatedAt:DATE,category:'litteratur',subcategory_id:'lesekiosk',sourceInventory:'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json',count:kioskMaterialized.length,places:kioskMaterialized});
  console.log(`materialized ${envInventory.length} reuse places + ${kioskMaterialized.length} Lesekiosker`);
}

main().catch(error=>{console.error(error);process.exit(1);});
