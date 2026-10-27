#!/usr/bin/env node
// One-use scoped replacement of user-facing prose with source-linked 4.2 packet.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { splitSentences } from "./validate-place-description-production-v4_2.mjs";

const id="voldslokka_pumptrack";
const placePath="data/places/sport/oslo/voldslokka_pumptrack/voldslokka_pumptrack.json";
const packetPath="data/places/production/voldslokka_pumptrack.json";
const place=JSON.parse(fs.readFileSync(placePath,"utf8"));
if(place.id!==id || !place.fagverk || place.fagverk.status!=="curated")
 throw new Error("Expected existing canonical Voldsløkka Fagverk in main");
const src={
 owner:"https://sageneif.no/anlegg/voldslokka-idrettspark-1/voldslokka-pumptrack",
 project:"https://sageneif.no/nyheter/sagene-if-bygger-pumptrack-pa-voldslokka",
 opening:"https://sageneif.no/nyheter/voldslokka-pumptrack-er-na-apen",
 shapers:"https://www.shapers.no/prosjekter/oslo-voldslokka",
 architect:"https://www.astrup-hellern.no/prosjekter/voldslokka-pumptrack",
 foundation:"https://sparebankstiftelsen.no/tildelinger/pumptrack-voldslokka-en-aktiv-moteplass/"
};
const desc=[
 ["Frivillige i Sagene IF og nærmiljøet drev fram Voldsløkka pumptrack, en asfaltbane på rundt 1 500 kvadratmeter for sykkel, sparkesykkel, skateboard og rulleskøyter.","project","Sagene IF: prosjektstart og flerbruksbane"],
 ["Banen sto ferdig høsten 2025; en egen åpning ble markert i august 2026.","shapers","Shapers: ferdigstillelse og åpning"]
];
const blocks=[
 [
 ["Fra våren 2023 arbeidet frivillige med planer, kommunale avklaringer, tillatelser og finansiering for en pumptrack på Voldsløkka.","project","Sagene IF: planlegging fra våren 2023"],
 ["Sagene IF inngikk en langsiktig avtale med Oslo kommune om området og eier selve pumptrackbanen.","owner","Sagene IF: eierskap og leieavtale"],
 ["Sparebankstiftelsen DNB, spillemidler og kommunale tilskudd bidro til finansieringen.","owner","Sagene IF: finansiering"]
 ],
 [
 ["Betongpark/Shapers bygde anlegget med asfalterte kuler, doserte svinger og små hopp.","shapers","Shapers: utførelse og banens form"],
 ["Shapers krediterer Janis Melnis for utformingen, mens Astrup og Hellern bidro med arkitekt- og søknadsarbeid.","architect","Astrup og Hellern: arkitekt- og søknadsarbeid"],
 ["Pumpingen består i å bruke kroppens bevegelse gjennom banens høydeforskjeller til å skape fart uten motor.","owner","Sagene IF: forklaring av pumptrack-teknikken"],
 ["Den samme banen brukes med sykler og BMX, sparkesykler, skateboard og rulleskøyter.","owner","Sagene IF: tillatte hjulaktiviteter"]
 ],
 [
 ["Banen ble tatt i bruk etter at den sto ferdig høsten 2025, før den formelle åpningsmarkeringen i august 2026.","shapers","Shapers: produksjon og formell åpning"],
 ["Sagene IF beskriver et lavterskeltilbud for barn og unge og en møteplass for ulike hjulmiljøer.","owner","Sagene IF: målgruppe og bruk"],
 ["Klubben oppfordrer til hjelm, fastsetter kjøreretning mot klokken og ber foreldre og andre tilskuere holde seg utenfor kjøreflaten.","owner","Sagene IF: baneregler"],
 ["Motorbruk er forbudt, og utøvere må ha grunnleggende kontroll på utstyret før de kjører på banen.","owner","Sagene IF: sikkerhet og forkunnskaper"],
 ["Aktuelle banetider og bruksvilkår finnes på Sagene IFs egen anleggsside.","owner","Sagene IF: banetider og gjeldende regler"]
 ]
];
place.desc=desc.map(x=>x[0]).join(" ");
place.popupDesc=blocks.map(block=>block.map(x=>x[0]).join(" ")).join("\n\n");
const coverage={desc:[],popupDesc:[]},claims=[];
let index=0;
const add=(field,items)=>{
  const segmented=splitSentences(place[field]);
  if(segmented.length!==items.length)throw new Error(field+" sentence count mismatch: "+segmented.length+" vs "+items.length);
  items.forEach((row,i)=>{
    if(segmented[i]!==row[0])throw new Error("Sentence mismatch in "+field+" #"+(i+1)+": "+segmented[i]);
    const cid="claim_voldslokka_pumptrack_v42_"+String(++index).padStart(2,"0");
    const sourceId=row[1];
    let sourceUrl=src[sourceId];
    const sourceType=sourceId==="shapers"||sourceId==="architect"?"primary":"official";
    const temporalStatus=field==="popupDesc"&&i>=9?"current":"historical";
    claims.push({id:cid,claim:row[0],sourceUrl,sourceLocation:row[2],sourceType,verifiedAt:"2026-10-27",status:"verified",claimKind:index===1?"identity":"ordinary",evidenceMode:"direct",temporalStatus,notes:"Direct, place-specific source review; the owner/contractor websites describe distinct roles and dates."});
    coverage[field].push({sentence:i+1,claimIds:[cid]});
  });
};
add("desc",desc);
add("popupDesc",blocks.flat());
const claimIds=claims.map(x=>x.id);
const qs=[
 ["Hvem eier selve pumptrackbanen?","Sagene IF","hvem",3],
 ["Hva slags underlag har banen?","Asfalt","hva",5],
 ["Hvem drev fram planleggingen?","Frivillige i Sagene IF og nærmiljøet","hvem",2],
 ["Hvem bygde pumptracken?","Betongpark/Shapers","hvem",5],
 ["Hva gjør kuler og doserte svinger mulig?","Å skape fart gjennom pumping","hva",7],
 ["Hva skjedde med banen høsten 2025?","Den ble ferdig og tatt i bruk","hva_skjedde",9],
 ["Hvilke aktiviteter deler anlegget?","Sykkel, sparkesykkel, skateboard og rulleskøyter","hva",8],
 ["Hvem er tiltakets målgruppe?","Barn og unge","hvem",10],
 ["Hvilken vei skal man kjøre på banen?","Mot klokken","hva",11],
 ["Hva er forbudt på banen?","Motorbruk","hva",12]
];
const quizReadiness={questions:qs.map(([question,answer,type,claimIndex])=>({question,answer,type,normalKnowledgeQuestion:true,claimIds:[claimIds[claimIndex]]}))};
const hash=v=>crypto.createHash("sha256").update(v,"utf8").digest("hex");
const packet={
 schemaVersion:"4.2",validatorVersion:"4.2.1",placeId:id,placeFile:placePath,status:"ready_v4_2",
 identity:{status:"resolved",represents:"Den konkrete pumptrackbanen på Voldsløkka i Oslo, ikke hele idrettsparken eller nabobygningene.",period:"Frivillig initiativ fra 2023, ferdigstilt høsten 2025 og formell åpning i 2026.",excludes:["Hele Voldsløkka idrettspark","Oslo Skatehall","Voldsløkka skateanlegg og øvrige anlegg"]},
 metadataSnapshot:{name:place.name,year:place.year,category:place.category},
 textHashes:{algorithm:"sha256",desc:hash(place.desc),popupDesc:hash(place.popupDesc)},
 claims,sentenceCoverage:coverage,
 reviews:{
  factual:{status:"passed",reviewedAt:"2026-10-27",reviewer:"Kildebasert Oslo Å–V-redaksjon",notes:"Sagene IF er primærkilden til eierforhold, frivillighet, baneregler og finansiering. Shapers og Astrup og Hellern avgrenser bygging, formell åpning og designroller. Ingen nåtids åpningstid er lagret."},
  editorial:{status:"passed",reviewedAt:"2026-10-27",reviewer:"Separat redaksjonell gjennomgang",introducedNewFacts:false,notes:"Erstatter intern History Go-kategorimetatekst med lokal historie. Skiller anlegg/område, tid for ferdigstillelse/formell åpning og brukergrupper."}
 },
 quizReadiness,
 completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:"2026-10-27",claimsVerified:{verified:claims.length,total:claims.length},factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"},
 reviewsNotes:"Deskripsjonsrettelse alene: behold samlet Place/Fagverk/bilder/koordinater, generer bare stedindeks og runtime etter endringen. De ti spørsmålene er readiness-eksempler, ikke en aktiv quiz."
};
fs.writeFileSync(placePath,JSON.stringify(place,null,2)+"\n");
fs.mkdirSync(path.dirname(packetPath),{recursive:true});
fs.writeFileSync(packetPath,JSON.stringify(packet,null,2)+"\n");
console.log("Voldsløkka place prose: "+coverage.desc.length+" ingress sentences, "+coverage.popupDesc.length+" article sentences, "+claims.length+" verified source claims.");
