#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const DATE='2026-08-26';
const INTAKE='reports/oslo-micro-place-expansion-2026/intake.json';
const REPORT='reports/oslo-micro-place-expansion-2026/materialized-canonical-places.json';
const HARALDRUD_ID='haraldrud_ombrukstelt';
const HARALDRUD_SOURCE='https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/haraldrud-ombrukstelt/';
const GEONORGE='https://ws.geonorge.no/adresser/v1/';

function readJson(rel){return JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));}
function writeJson(rel,value){const file=path.join(ROOT,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,`${JSON.stringify(value,null,2)}\n`);}
function sha(value){return crypto.createHash('sha256').update(String(value)).digest('hex');}
function structuredAddress(raw){const match=String(raw).match(/^(.*?)\s+(\d+[A-Za-z]?),\s*(\d{4})\s+(.+)$/u);return match?{street:match[1],number:match[2],postcode:match[3],city:match[4],country:'Norge'}:raw;}
function sentences(value){return String(value).replace(/\n+/gu,' ').split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/u).map(row=>row.trim()).filter(Boolean);}
function coverage(text,claimRows){const rows=sentences(text);if(rows.length!==claimRows.length)throw new Error(`Coverage mismatch: ${rows.length}/${claimRows.length}: ${text}`);return rows.map((_,index)=>({sentence:index+1,claimIds:claimRows[index]}));}
function addManifest(manifest,rel){if(!manifest.files.includes(rel))manifest.files.push(rel);}

function groupContract(candidate){
  if(candidate.group==='miljo_gjenbruk')return {category:'natur',subcategory:'miljo_gjenbruk',directory:'natur/oslo/miljo_gjenbruk',provider:'municipality',coordType:'service_point'};
  if(candidate.group==='bla_skilt')return {category:candidate.category,subcategory:'bla_skilt',directory:`${candidate.category}/oslo/bla_skilt`,provider:'official_address',coordType:'address_point'};
  if(candidate.group==='snublestein')return {category:'historie',subcategory:'snublestein',directory:'historie/oslo/snublestein',provider:'official_map',coordType:'memorial_object'};
  throw new Error(`Unknown group ${candidate.group}`);
}

function content(candidate){
  const textAddress=candidate.address.replace(/\b([A-ZÆØÅ])\.\s/gu,'$1 ');
  if(candidate.group==='miljo_gjenbruk'){
    const unavailable=candidate.status==='temporary_unavailable';
    const serviceFact=candidate.fact.replace(/^Miljøstasjonen/u,candidate.name);
    return {
      desc:`${candidate.name} ved ${textAddress} er et dokumentert punkt i Oslo kommunes avfallsnettverk. ${serviceFact} ${candidate.access}`,
      popupDesc:`Oslo kommunes stedsside plasserer ${candidate.name} ved ${textAddress}. ${serviceFact}\n\n${candidate.access}\n\n${unavailable?`${candidate.name} skal ikke vises som et aktivt leveringstilbud før kommunen melder ny status.`:`Aktuelle leveringsregler for ${candidate.name} må kontrolleres på kommunens stedsside før besøk.`}`,
      claims:[
        {suffix:'identity',claim:`Oslo kommunes stedsside plasserer ${candidate.name} ved ${textAddress}.`,sourceUrl:candidate.sourceUrl,sourceLocation:'Stedssiden: navn, adresse og kartpunkt.',kind:'identity'},
        {suffix:'service',claim:serviceFact,sourceUrl:candidate.sourceUrl,sourceLocation:'Stedssiden: tjeneste og aktuell driftsstatus.',kind:'ordinary'},
        {suffix:'access',claim:candidate.access,sourceUrl:candidate.sourceUrl,sourceLocation:'Stedssiden: adgang, plassering eller alternativ tjeneste.',kind:'ordinary'},
        {suffix:'current',claim:unavailable?`${candidate.name} skal ikke vises som et aktivt leveringstilbud før kommunen melder ny status.`:`Aktuelle leveringsregler for ${candidate.name} må kontrolleres før besøk.`,sourceUrl:candidate.sourceUrl,sourceLocation:'Stedssiden: tidsavhengig drifts- og adgangsinformasjon.',kind:'temporal',mode:'direct'}
      ],
      descRows:[['identity'],['service'],['access']],popupRows:[['identity'],['service'],['access'],['current']]
    };
  }
  if(candidate.group==='bla_skilt')return {
    desc:`${candidate.name} er et fysisk minneskilt ved ${candidate.address}. ${candidate.fact} ${candidate.context}`,
    popupDesc:`Oslo Byes Vels skiltoversikt knytter ${candidate.name} til ${candidate.address}. ${candidate.fact}\n\n${candidate.context}\n\nKartmarkøren for ${candidate.name} bruker det offisielle adressepunktet for skiltadressen.`,
    claims:[
      {suffix:'identity',claim:`Oslo Byes Vels skiltoversikt knytter ${candidate.name} til ${candidate.address}.`,sourceUrl:candidate.sourceUrl,sourceLocation:'Blå skilt-oversikten: skiltets navn og adresse.',kind:'identity'},
      {suffix:'listing',claim:candidate.fact,sourceUrl:candidate.sourceUrl,sourceLocation:'Blå skilt-oversikten: aktuell oppføring.',kind:'ordinary'},
      {suffix:'context',claim:candidate.context,sourceUrl:candidate.secondarySourceUrl,sourceLocation:'Oppslagsartikkel om personen eller stedet som skiltet gjelder.',kind:'ordinary'},
      {suffix:'coordinate',claim:`Kartmarkøren for ${candidate.name} bruker det offisielle adressepunktet for ${candidate.address}.`,sourceUrl:GEONORGE,sourceLocation:'Geonorge Adresser API: representasjonspunkt for adressen.',kind:'ordinary'}
    ],
    descRows:[['identity'],['listing'],['context']],popupRows:[['identity'],['listing'],['context'],['coordinate']]
  };
  return {
    desc:`${candidate.name} er en individuell snublestein ved ${candidate.address}. ${candidate.fact} ${candidate.context}`,
    popupDesc:`Jødisk Museums snublesteinportal plasserer ${candidate.name} ved ${candidate.address}. ${candidate.fact}\n\n${candidate.context}\n\n${candidate.name} beholdes som ett eget fysisk minnepunkt, adskilt fra andre steiner og nærliggende steder.`,
    claims:[
      {suffix:'identity',claim:`Jødisk Museums snublesteinportal plasserer ${candidate.name} ved ${candidate.address}.`,sourceUrl:candidate.sourceUrl,sourceLocation:'Person- og kartoppføringen: navn, adresse og kartpunkt.',kind:'identity'},
      {suffix:'listing',claim:candidate.fact,sourceUrl:candidate.sourceUrl,sourceLocation:'Personoppføringen: den dokumenterte snublesteinen.',kind:'ordinary'},
      {suffix:'context',claim:candidate.context,sourceUrl:candidate.sourceUrl,sourceLocation:'Personoppføringen: biografiske nøkkeldata.',kind:'ordinary'},
      {suffix:'separation',claim:`${candidate.name} er ett eget fysisk minnepunkt, adskilt fra andre steiner og nærliggende steder.`,sourceUrl:candidate.sourceUrl,sourceLocation:'Kartoppføringen identifiserer denne personens individuelle stein.',kind:'identity'}
    ],
    descRows:[['identity'],['listing'],['context']],popupRows:[['identity'],['listing'],['context'],['separation']]
  };
}

function claims(candidate,rows){return rows.map(row=>({id:`claim_${candidate.id}_${row.suffix}`,claim:row.claim,sourceUrl:row.sourceUrl,sourceLocation:row.sourceLocation,sourceType:candidate.group==='snublestein'?'institutional':'official',verifiedAt:DATE,status:'verified',claimKind:row.kind,evidenceMode:row.mode||'direct',temporalStatus:'current'}));}
function ids(candidate,rows){return rows.map(suffix=>`claim_${candidate.id}_${suffix}`);}

function makePlace(candidate){
  const contract=groupContract(candidate);const text=content(candidate);
  const sourceObjectId=candidate.group==='bla_skilt'?`geonorge-address:${candidate.id}`:`${contract.provider}:${candidate.id}`;
  const place={
    id:candidate.id,name:candidate.name,lat:candidate.lat,lon:candidate.lon,r:candidate.group==='snublestein'?35:45,
    category:contract.category,subcategory_id:contract.subcategory,placeTier:'micro',desc:text.desc,popupDesc:text.popupDesc,
    micro_place_profile:{schema:'history_go_micro_place_profile_v1',kind:candidate.kind,currentStatus:candidate.status,sourceUrl:candidate.sourceUrl,sourceLocation:`Autoritativ oppføring for ${candidate.name}`,verifiedAt:DATE,quizMode:'none'},
    locatorType:'current_place',sourceProvider:contract.provider,sourceObjectId,geocodeAccuracy:'rooftop',coordRole:'display_marker',coordType:contract.coordType,coordStatus:'verified',coordSource:contract.provider==='official_address'?'Kartverket / Geonorge Adresser API':candidate.group==='snublestein'?'Jødisk Museum i Oslo – Snublesteiner':'Oslo kommune – tjenestekart',coordSourceId:sourceObjectId,coordSourceUrl:candidate.group==='bla_skilt'?GEONORGE:candidate.sourceUrl,coordNote:`Kildeverifisert kartpunkt for ${candidate.name}.`,coordVerifiedAt:DATE,
    address:structuredAddress(candidate.address),
    externalLinks:[{type:'reference',label:`Kilde – ${candidate.name}`,url:candidate.sourceUrl,lang:'nb',verifiedAt:DATE},{type:'coordinate_source',label:'Koordinatkilde',url:candidate.group==='bla_skilt'?GEONORGE:candidate.sourceUrl,lang:'nb',verifiedAt:DATE}]
  };
  if(candidate.secondarySourceUrl)place.externalLinks.splice(1,0,{type:'reference',label:'Kontekstkilde',url:candidate.secondarySourceUrl,lang:'nb',verifiedAt:DATE});
  if(candidate.group==='miljo_gjenbruk')place.circular_profile={schema:'history_go_circular_place_profile_v1',place_type:candidate.placeType,operation_status:candidate.status,free_takeaway:candidate.id==='gronmo_gjenvinningsstasjon',reuse_sale:false,restricted_access:false,self_service:candidate.id!=='gronmo_gjenvinningsstasjon',mobile_service:false,reuse:[{id:`${candidate.id}_service`,title:candidate.kind==='miljostasjon'?'Farlig avfall':'Innlevering og ombruk',description:candidate.fact}],materials:[{id:`${candidate.id}_materials`,title:'Materialer',description:`Leveringsreglene ved ${candidate.name} følger Oslo kommunes aktuelle stedsside.`}],environment:[{id:`${candidate.id}_environment`,title:'Kretsløp & miljø',description:`${candidate.name} er et fysisk punkt i kommunens system for forsvarlig avfallshåndtering.`}],systems:[{id:`${candidate.id}_systems`,title:'Sted & system',description:candidate.access}],source_url:candidate.sourceUrl,verified_at:DATE};
  return {place,text,contract};
}

function packet(candidate,place,text,placeFile){
  const packetClaims=claims(candidate,text.claims);
  return {schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:place.id,placeFile,status:'needs_research',identity:{status:'resolved',represents:`${place.name} som eget fysisk mikrosted ved ${candidate.address}.`,period:'2026–',excludes:['andre steder med samme type','nærliggende History GO-steder','andre personer eller tjenester ved samme adresse']},metadataSnapshot:{name:place.name,category:place.category},textHashes:{algorithm:'sha256',desc:sha(place.desc),popupDesc:sha(place.popupDesc)},claims:packetClaims,sentenceCoverage:{desc:coverage(place.desc,text.descRows.map(row=>ids(candidate,row))),popupDesc:coverage(place.popupDesc,text.popupRows.map(row=>ids(candidate,row)))},reviews:{factual:{status:'pending',reviewedAt:DATE,reviewer:'unassigned'},editorial:{status:'pending',reviewedAt:DATE,reviewer:'unassigned',introducedNewFacts:false}},quizReadiness:{questions:[]},completion:{completedUnder:'4.2',currentStatus:'current',sourceVerifiedAt:DATE,claimsVerified:{verified:packetClaims.length,total:packetClaims.length},factualReview:'pending',editorialReview:'pending',validatorVersion:'4.2.1'}};
}

function updateHaraldrud(){
  const placeFile='data/places/natur/oslo/miljo_gjenbruk/haraldrud_ombrukstelt.json';
  const packetFile='data/places/production/haraldrud_ombrukstelt.json';
  const place=readJson(placeFile);
  place.desc='Haraldrud ombrukstelt ved Brobekkveien 87 er stengt mens tilbudet flyttes. Oslo kommune opplyser at den tidligere plasseringen stengte 24. august 2026. Ny plassering er varslet i Brobekkveien 101, men åpningsdato er ikke kunngjort.';
  place.popupDesc='Oslo kommune opplyser at Haraldrud ombrukstelt ved Brobekkveien 87 stengte 24. august 2026. Tilbudet er midlertidig utilgjengelig.\n\nKommunen varsler flytting av Haraldrud ombrukstelt til Brobekkveien 101. Åpningsdato og ny praktisk informasjon er ennå ikke kunngjort.\n\nVisningen bruker den sist dokumenterte driftsplasseringen og skal ikke tolkes som et aktivt tilbud.';
  place.micro_place_profile.currentStatus='temporary_unavailable';
  place.micro_place_profile.sourceLocation='Oslo kommune: stenging 24. august 2026 og varslet flytting til Brobekkveien 101';
  place.circular_profile.operation_status='temporary_unavailable';
  place.circular_profile.reuse[0].description='Det tidligere ombruksteltet er stengt mens tilbudet flyttes til Brobekkveien 101; åpningstidspunkt er ikke kunngjort.';
  place.circular_profile.systems[0].description='Oslo kommune opplyser at Haraldrud ombrukstelt er midlertidig utilgjengelig under flytting.';
  place.coordNote='Kartpunktet viser den sist dokumenterte driftsplasseringen i Brobekkveien 87; nytt aktivt punkt i Brobekkveien 101 må verifiseres når åpning er kunngjort.';
  const claims=[
    {suffix:'closed',claim:'Oslo kommune opplyser at Haraldrud ombrukstelt ved Brobekkveien 87 stengte 24. august 2026.'},
    {suffix:'status',claim:'Haraldrud ombrukstelt er midlertidig utilgjengelig under flytting.'},
    {suffix:'move',claim:'Oslo kommune varsler flytting av Haraldrud ombrukstelt til Brobekkveien 101.'},
    {suffix:'opening',claim:'Åpningsdato og ny praktisk informasjon er ennå ikke kunngjort.'},
    {suffix:'coordinate',claim:'Visningen bruker den sist dokumenterte driftsplasseringen og ikke et aktivt tilbud.'}
  ].map(row=>({id:`claim_${HARALDRUD_ID}_${row.suffix}`,claim:row.claim,sourceUrl:HARALDRUD_SOURCE,sourceLocation:'Kommunal stedsside: stenging, flytting og foreløpig status.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'temporal',evidenceMode:'direct',temporalStatus:'current'}));
  const packet={schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:place.id,placeFile,status:'needs_research',identity:{status:'resolved',represents:'Haraldrud ombrukstelt som midlertidig utilgjengelig tilbud under flytting fra Brobekkveien 87 til Brobekkveien 101.',period:'2026–',excludes:['Haraldrud gjenvinningsstasjon','et aktivt tilbud i Brobekkveien 101 før åpning er kunngjort']},metadataSnapshot:{name:place.name,category:place.category},textHashes:{algorithm:'sha256',desc:sha(place.desc),popupDesc:sha(place.popupDesc)},claims,sentenceCoverage:{desc:coverage(place.desc,[['claim_haraldrud_ombrukstelt_status'],['claim_haraldrud_ombrukstelt_closed'],['claim_haraldrud_ombrukstelt_move','claim_haraldrud_ombrukstelt_opening']]),popupDesc:coverage(place.popupDesc,[['claim_haraldrud_ombrukstelt_closed'],['claim_haraldrud_ombrukstelt_status'],['claim_haraldrud_ombrukstelt_move'],['claim_haraldrud_ombrukstelt_opening'],['claim_haraldrud_ombrukstelt_coordinate']])},reviews:{factual:{status:'pending',reviewedAt:DATE,reviewer:'unassigned'},editorial:{status:'pending',reviewedAt:DATE,reviewer:'unassigned',introducedNewFacts:false}},quizReadiness:{questions:[]},completion:{completedUnder:'4.2',currentStatus:'current',sourceVerifiedAt:DATE,claimsVerified:{verified:claims.length,total:claims.length},factualReview:'pending',editorialReview:'pending',validatorVersion:'4.2.1'}};
  writeJson(placeFile,place);writeJson(packetFile,packet);
}

function main(){
  const intake=readJson(INTAKE);const candidates=intake.places||[];
  if(candidates.length!==25)throw new Error(`Expected 25 candidates, got ${candidates.length}`);
  const groups=candidates.reduce((result,row)=>{(result[row.group]??=[]).push(row);return result;},{});
  if(groups.miljo_gjenbruk?.length!==15||groups.bla_skilt?.length!==4||groups.snublestein?.length!==6)throw new Error('Expected group counts 15 + 4 + 6');
  if(new Set(candidates.map(row=>row.id)).size!==25)throw new Error('Duplicate candidate ID');
  const manifest=readJson('data/places/manifest.json');const materialized=[];
  for(const candidate of candidates){
    if(!Number.isFinite(candidate.lat)||!Number.isFinite(candidate.lon)||candidate.lat<59||candidate.lat>61||candidate.lon<9||candidate.lon>12)throw new Error(`Invalid Oslo coordinate: ${candidate.id}`);
    const {place,text,contract}=makePlace(candidate);const rel=`places/${contract.directory}/${candidate.id}.json`;const placeFile=`data/${rel}`;
    if(fs.existsSync(path.join(ROOT,placeFile))&&readJson(placeFile).id!==candidate.id)throw new Error(`Path collision: ${placeFile}`);
    writeJson(placeFile,place);writeJson(`data/places/production/${candidate.id}.json`,packet(candidate,place,text,placeFile));addManifest(manifest,rel);
    materialized.push({id:candidate.id,name:candidate.name,group:candidate.group,category:place.category,subcategory_id:place.subcategory_id,status:candidate.status,lat:candidate.lat,lon:candidate.lon,placeFile});
    console.log(`materialized pending ${candidate.id}`);
  }
  updateHaraldrud();writeJson('data/places/manifest.json',manifest);
  writeJson(REPORT,{schema:'history_go_oslo_micro_place_expansion_materialization_v1',generatedAt:DATE,sourceIntake:INTAKE,newPlaceCount:25,reviewedPacketCount:26,counts:{miljo_gjenbruk:15,bla_skilt:4,snublestein:6},status:'pending_independent_review',places:materialized,correctedPlaces:[HARALDRUD_ID]});
}

main();
