import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const PLACE_ID="sagene_kvernhus", REPORT_DIR="reports/oslo-coordinate-sagene-kvernhus-glads-molle-research";
mkdirSync(REPORT_DIR,{recursive:true});
const readJson=(p)=>JSON.parse(readFileSync(p,"utf8"));
const parse=(s)=>{const t=String(s??"").trim(),i=t.indexOf("{");if(i<0)return null;try{return JSON.parse(t.slice(i));}catch{return null;}};
const places=Array.isArray(readJson("data/places/places_index.json"))?readJson("data/places/places_index.json"):(readJson("data/places/places_index.json").places??[]);
const current=places.find((p)=>p?.id===PLACE_ID);if(!current)throw new Error(`${PLACE_ID} missing`);
const build=spawnSync("npm",["run","build:tools"],{encoding:"utf8"});writeFileSync(`${REPORT_DIR}/build-tools.log`,`${build.stdout??""}${build.stderr??""}`,"utf8");if(build.status!==0)throw new Error("build failed");
const queries=["Sandakerveien 10A Oslo","Sandakerveien 10 Oslo"];
const results=[];
for(const query of queries){const run=spawnSync("node",["dist/tools/address-first-coordinate-finder.mjs","--address",query],{encoding:"utf8"});writeFileSync(`${REPORT_DIR}/${query.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.log`,`${run.stdout??""}${run.stderr??""}`,"utf8");results.push({query,exitCode:run.status,parsed:parse(run.stdout)});}
const verified=results.filter((x)=>x.parsed?.status==="verified_candidate");if(!verified.length)throw new Error("No verified address candidate");
const exact=verified.find((x)=>x.parsed?.coordinate?.address?.number==="10A")??verified[0];
writeFileSync(`${REPORT_DIR}/summary.json`,`${JSON.stringify({version:"2026-07-23",placeId:PLACE_ID,currentCoordinate:{lat:current.lat,lon:current.lon,r:current.r},resolvedIdentity:"Glads mølle (Nedre Papirmølle), den bevarte mølle- og industribygningen fra 1736 ved Beierbrua",identityEvidence:[{source:"Oslo kommune Byplan",url:"https://magasin.oslo.kommune.no/byplan/sagene-et-unikt-omrade",finding:"Glads mølle ble oppført i 1736 og omtales som Norges eldste bevarte fabrikkbygning i tre."},{source:"Oslo byleksikon",url:"https://oslobyleksikon.no/side/Glads_m%C3%B8lle",finding:"Glads mølle identifiseres som Sandakerveien 10A, tidligere Nedre Papirmølle, oppført i 1736."}],addressResearch:results,selectedCandidate:exact.parsed,conclusion:"Legacy-identiteten 'Sagene mølle og kvernhus' er for bred og bør avgrenses til den konkrete bevarte Glads mølle. Bruk det eksakte offisielle adressepunktet for Sandakerveien 10A dersom Geonorge gir entydig treff; behold industrihistorien som kontekst, ikke som områdegeometri."},null,2)}\n`,`utf8`);
console.log(JSON.stringify({placeId:PLACE_ID,resolvedIdentity:"Glads mølle",selectedSourceObjectId:exact.parsed?.sourceObjectId,coordinate:exact.parsed?.coordinate},null,2));
