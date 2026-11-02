#!/usr/bin/env node
// The Villa: two independent documentary photographs from Wikimedia Commons.
// Photographer: Jan-Tore Egge; both original photos: CC BY-SA 4.0.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = process.cwd();
const directory = "bilder/places/candidates/oslo-v1-20261102";
const canonicalPath = "data/places/subkultur/oslo/places_subkultur/the_villa.json";
const runtimePath = "data/runtime/place-open/the_villa.json";
const licenseUrl = "https://creativecommons.org/licenses/by-sa/4.0/";
const originals = {
  entrance: {
    name: "Møllergata 25 II.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/03/M%C3%B8llergata_25_II.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:M%C3%B8llergata_25_II.jpg",
    year: 2022,
    width: 2396,
    height: 2817,
    subject: "The Villa entrance awning visible at Møllergata 25"
  },
  property: {
    name: "Møllergata 23 I.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/91/M%C3%B8llergata_23_I.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:M%C3%B8llergata_23_I.jpg",
    year: 2022,
    width: 2653,
    height: 2904,
    subject: "Møllergata 23 property, the building shared by The Villa and other tenants"
  }
};
const derivatives = [
  { key: "hero", source: "entrance", file: "the_villa_hero.webp",
    width: 1400, height: 900, position: "south", assetType: "documentary_place_photo" },
  { key: "portrait", source: "property", file: "the_villa_portrait.webp",
    width: 900, height: 1350, position: "centre", assetType: "documentary_place_portrait" },
  { key: "card", source: "entrance", file: "the_villa_card.webp",
    width: 900, height: 600, position: "south", assetType: "documentary_place_photo" }
];
if(originals.entrance.url === originals.property.url) throw Error("image and frontImage must never share an original photo");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "historygo-the-villa-"));
fs.mkdirSync(directory, { recursive: true });
try {
  for(const [key, source] of Object.entries(originals)){
    source.file = path.join(scratch, key+".jpg");
    execFileSync("curl", [
      "--fail", "--location", "--retry", "3", "--retry-delay", "3",
      "--user-agent", "HistoryGo/1.0 (Wikimedia CC-BY-SA image derivative)",
      "--output", source.file, source.url
    ], {stdio:"inherit", timeout:120000});
    const info = await sharp(source.file).metadata();
    if(info.format!=="jpeg" || info.width!==source.width || info.height!==source.height){
      throw Error("Unexpected original photo dimensions or format for "+key+" "+JSON.stringify(info));
    }
    source.sha256=createHash("sha256").update(fs.readFileSync(source.file)).digest("hex");
    console.log("Verified original "+key+" "+source.width+"x"+source.height+" sha256="+source.sha256);
  }
  if(originals.entrance.sha256===originals.property.sha256) throw Error("Original photos were identical");
  for(const derivative of derivatives) {
    const src=originals[derivative.source];
    const out=path.join(directory,derivative.file);
    await sharp(src.file).rotate().resize(derivative.width,derivative.height,{
      fit:"cover",position:derivative.position
    }).webp({quality:84,effort:5}).toFile(out);
    const metadata=await sharp(out).metadata();
    if(metadata.format!=="webp"||metadata.width!==derivative.width||metadata.height!==derivative.height||fs.statSync(out).size<10000){
      throw Error("WebP derivative invalid: "+out);
    }
    derivative.relativePath=out;
    derivative.sha256=createHash("sha256").update(fs.readFileSync(out)).digest("hex");
    console.log("Generated "+out+" "+metadata.width+"x"+metadata.height);
  }
  const place=JSON.parse(fs.readFileSync(canonicalPath,"utf8"));
  if(place.id!=="the_villa"||place.address.number!=="23"||place.category!=="musikk")throw Error("Canonical site mismatch");
  const hero=derivatives[0],portrait=derivatives[1],card=derivatives[2];
  const mediaMeta = ({derivative,original})=>({
    source:"wikimedia_commons",
    sourcePage:original.sourcePage,
    creator:"Jan-Tore Egge",
    credit:"Jan-Tore Egge / Wikimedia Commons",
    license:"CC BY-SA 4.0",
    licenseUrl,
    assetType:derivative.assetType,
    verifiedAt:"2026-11-02",
    sourceCapturedAt:"2022-03-23",
    originalSha256:original.sha256,
    sourceSubject:original.subject,
    transformation:"Editorial crop and separate WebP encoding of independent 2022 documentary photograph.",
    outputDimensions:derivative.width+"x"+derivative.height,
    cropSettings:derivative.position==="south"?[0.5,1,1]:[0.5,0.5,1],
    ...(derivative.height>derivative.width?{orientation:"portrait"}:{})
  });
  place.image=hero.relativePath;
  place.frontImage=portrait.relativePath;
  place.cardImage=card.relativePath;
  place.imageMeta=mediaMeta({derivative:hero,original:originals.entrance});
  place.frontImageMeta=mediaMeta({derivative:portrait,original:originals.property});
  place.cardImageMeta=mediaMeta({derivative:card,original:originals.entrance});
  place.imageCredit="Jan-Tore Egge / Wikimedia Commons";
  place.imageLicense="CC BY-SA 4.0";
  place.imageSourceUrl=originals.entrance.sourcePage;
  place.imageCaption="Bygningen ved Møllergata 25 med The Villa Dancing Oslos inngangsskilt til høyre (2022). Foto: Jan-Tore Egge / Wikimedia Commons, CC BY-SA 4.0. Redaksjonelt beskåret.";
  place.imageComposition="Horisontalt autentisk foto med klubbens skilt, separat stående fotografi av bygården Møllergata 23, og mindre kortderivat av inngangsbildet. Ingen bildeoriginal deles mellom image og frontImage.";
  for(const [label,url] of [
    ["Wikimedia Commons: The Villa-inngangen ved Møllergata 25",originals.entrance.sourcePage],
    ["Wikimedia Commons: bygården Møllergata 23",originals.property.sourcePage]
  ]){
    if(!Array.isArray(place.externalLinks))place.externalLinks=[];
    if(!place.externalLinks.some(x=>x.url===url))place.externalLinks.push({type:"reference",label,url,lang:"nb",verifiedAt:"2026-11-02"});
  }
  if(place.imageMeta.originalSha256===place.frontImageMeta.originalSha256)throw Error("Independent originals required");
  fs.writeFileSync(canonicalPath,JSON.stringify(place,null,2)+"\n");
  const payload=JSON.parse(fs.readFileSync(runtimePath,"utf8"));
  payload.place={...payload.place,...place,sourceFile:payload.place.sourceFile};
  const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==="object"?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
  fs.writeFileSync(runtimePath,JSON.stringify(stable(payload))+"\n");
  console.log("The Villa canonical photo identities and Place-open synchronized");
} finally {
  fs.rmSync(scratch,{recursive:true,force:true});
}
